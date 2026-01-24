const express = require('express');
const router = express.Router();
const { auth, db } = require('../config/firebase');

// @route   POST /api/auth/signup
// @desc    Register a new user
router.post('/signup', async (req, res) => {
    try {
        const { email, password, role, name, phone } = req.body;

        const userRecord = await auth.createUser({
            email,
            password,
            displayName: name,
            phoneNumber: phone // Format must be +91...
        });

        // Create user profile in Firestore
        await db.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email,
            name,
            phone,
            role, // 'customer' or 'worker'
            createdAt: new Date().toISOString()
        });

        res.status(201).json({ message: 'User created successfully', uid: userRecord.uid });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Login (placeholder - client usually handles login, this might verify token)
router.post('/login', async (req, res) => {
    // In a Firebase setup, client SDK gets the ID token and sends it here
    const { idToken, phone } = req.body; // Modified to accept phone if we want to lookup by phone for mock
    try {
        let uid;
        if (idToken && idToken.startsWith('mock-token')) {
            // Using Mock Token for Login
            // Mock Login: Just find the first user or specific user
            // Ideally we should look up by phone if provided
            if (phone) {
                const userRecord = await auth.getUserByPhoneNumber(phone);
                uid = userRecord.uid;
            } else {
                // Fallback or Error
                return res.status(400).json({ error: 'Mock login requires phone number for lookup' });
            }
        } else {
            const decodedToken = await auth.verifyIdToken(idToken);
            uid = decodedToken.uid;
        }

        // Get user role
        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found in database' });
        }

        const userData = userDoc.data();
        let profileData = {};

        // Fetch specialized profile based on role
        if (userData.role === 'worker') {
            const workerDoc = await db.collection('workers').doc(uid).get();
            if (workerDoc.exists) {
                profileData = workerDoc.data();
            }
        } else if (userData.role === 'customer') {
            // Include all rich profile fields for customers
            profileData = {
                saved_addresses: userData.saved_addresses || [],
                preferences: userData.preferences || {},
                bio: userData.bio || '',
                reward_points: userData.reward_points || 0,
                payment_methods: userData.payment_methods || []
            };
        }

        // Merge profile into a specific key or flattened? 
        // Frontend login.html expects 'userData.profile' to set 'karyasetu_user_profile'.
        // So we attach it as 'profile'.

        res.json({
            message: 'Authenticated',
            user: {
                ...userData,
                profile: profileData
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(401).json({ error: 'Invalid token or user not found' });
    }
});

// @route   PUT /api/auth/profile/:uid
// @desc    Update user profile
router.put('/profile/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const updates = req.body;

        // Security check: In real app, verify if req.user.uid === uid
        // For now, proceeding with direct update

        // Remove critical fields if present to prevent accidental overwrite (like uid, email if immutable)
        delete updates.uid;
        delete updates.email; // Usually email updates require auth credential change

        await db.collection('users').doc(uid).update(updates);

        // **IMPORTANT: Sync to workers collection if user is a worker**
        const userDoc = await db.collection('users').doc(uid).get();
        const userData = userDoc.data();

        if (userData && userData.role === 'worker') {
            // Extract worker-specific data for the workers collection
            const workerData = {
                uid: uid,
                name: userData.name || 'Worker',
                is_online: true, // Set as online when they update profile
                updated_at: new Date().toISOString()
            };

            // Add location if provided
            if (updates.location || userData.location) {
                workerData.location = updates.location || userData.location;
            }

            // Extract category from skills
            if (updates.skills && updates.skills.length > 0) {
                workerData.category = updates.skills[0].toLowerCase();
                workerData.skills = updates.skills;
            } else if (userData.skills && userData.skills.length > 0) {
                workerData.category = userData.skills[0].toLowerCase();
                workerData.skills = userData.skills;
            }

            // Add pricing if provided
            if (updates.hourlyRate || userData.hourlyRate) {
                workerData.base_price = updates.hourlyRate || userData.hourlyRate;
            }

            // Add experience if provided
            if (updates.experienceYears || userData.experienceYears) {
                workerData.experience_years = updates.experienceYears || userData.experienceYears;
            }

            // Add rating if exists
            if (userData.rating || userData.rating_avg) {
                workerData.rating_avg = userData.rating || userData.rating_avg || 4.5;
            }

            // Add phone if exists
            if (userData.phone || updates.phone) {
                workerData.phone = userData.phone || updates.phone;
            }

            // Add bio if exists
            if (userData.bio || updates.bio) {
                workerData.bio = userData.bio || updates.bio;
            }

            // Add qualifications if exists
            if (userData.qualifications || updates.qualifications) {
                workerData.qualifications = userData.qualifications || updates.qualifications;
            }

            // Sync to workers collection
            await db.collection('workers').doc(uid).set(workerData, { merge: true });
            // Synced worker data to workers collection
        }

        const updatedDoc = await db.collection('users').doc(uid).get();
        res.json({ message: 'Profile updated successfully', user: updatedDoc.data() });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

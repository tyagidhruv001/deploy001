const express = require('express');
const router = express.Router();
const { auth, db } = require('../config/firebase');

// @route   POST /api/auth/signup
// @desc    Register a new user
router.post('/signup', async (req, res) => {
    try {
        const { email, password, role, name, phone } = req.body;

        // Create user in Firebase Auth
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
            console.log('Using Mock Token for Login');
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

        res.json({ message: 'Authenticated', user: userDoc.data() });
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

        const updatedDoc = await db.collection('users').doc(uid).get();
        res.json({ message: 'Profile updated successfully', user: updatedDoc.data() });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

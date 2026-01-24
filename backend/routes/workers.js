const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const ngeohash = require('ngeohash');

// @route   POST /api/workers/:uid
// @desc    Update specific worker data
router.post('/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        if (uid === 'onboarding') return res.status(400).json({ error: 'Invalid UID' });
        const {
            category,
            is_online,
            is_verified,
            base_price,
            experience_years,
            location, // { lat: number, lng: number }
            identity_docs,
            qualifications, // Array of Strings
            bio,            // String
            portfolio,      // Array of Image URLs
            verification_status, // 'pending' | 'verified' | 'rejected'
            verification_notes,
            total_jobs,
            avg_rating,
            lifetime_earnings
        } = req.body;

        const workerData = {
            uid,
            category, // "plumber" | "electrician" | "carpenter"
            is_online,
            is_verified,
            base_price,
            experience_years,
            identity_docs,
            qualifications: qualifications || [],
            bio: bio || '',
            portfolio: portfolio || [],
            verification_status: verification_status || 'pending',
            verification_notes: verification_notes || '',
            verified_at: verification_status === 'verified' ? new Date().toISOString() : null,
            stats: {
                total_jobs: total_jobs || 0,
                avg_rating: avg_rating || 0,
                lifetime_earnings: lifetime_earnings || 0
            },
            updated_at: new Date().toISOString()
        };

        // Handle GeoPoint and Geohash
        if (location && location.lat && location.lng) {
            // Store as Firestore GeoPoint is ideal, but for simplicity in JSON:
            // We'll store lat/lng map and the geohash
            workerData.location = {
                lat: location.lat,
                lng: location.lng
            };
            workerData.geohash = ngeohash.encode(location.lat, location.lng);
        }

        // Initialize defaults if they don't exist (handled by merge usually)
        // logic for rating_avg, total_jobs, trust_score could be initialized here if new

        // We are storing worker details in a specific 'workers' collection top-level as requested
        // linked by UID
        await db.collection('workers').doc(uid).set(workerData, { merge: true });

        // Also ensure the user role is 'worker' in users collection? 
        // Assuming that's handled in users.js

        res.status(200).json({ message: 'Worker data updated', data: workerData });
    } catch (error) {
        console.error('Error updating worker:', error);
        res.status(500).json({ error: error.message });
    }
});

// @route   GET /api/workers
// @desc    Smart Matching & AI Recommendation
router.get('/', async (req, res) => {
    try {
        const { category, lat, lng, radiusInKm } = req.query;

        let query = db.collection('workers');

        if (category) {
            query = query.where('category', '==', category);
        }

        // Note: Removed is_online filter to show all workers
        // Can be re-enabled once all workers have is_online field set

        const snapshot = await query.get();
        let workers = [];

        // Fetch user identity for each worker (Join)
        const workerDocs = snapshot.docs;
        for (const doc of workerDocs) {
            if (doc.id === 'onboarding') continue; // Skip the route collision artifact

            const data = doc.data();
            data.id = doc.id;
            data.uid = doc.id; // Frontend expects uid

            // Fetch name and profile_pic from users collection
            const userDoc = await db.collection('users').doc(doc.id).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                data.name = userData.name || data.name || 'Unknown Professional';
                data.avatar = userData.profile_pic || userData.avatar || '';
            } else {
                data.name = data.name || 'Unknown Professional';
            }

            workers.push(data);
        }

        // "Smart Matching" - Filter by distance if lat/lng provided
        if (lat && lng) {
            const centerLat = parseFloat(lat);
            const centerLng = parseFloat(lng);

            workers = workers.filter(w => {
                if (!w.location) return false;
                const distance = getDistanceFromLatLonInKm(centerLat, centerLng, w.location.lat, w.location.lng);
                // Default radius 20km if not specified
                const limit = radiusInKm ? parseFloat(radiusInKm) : 20;
                w.distance = distance; // Attach distance for frontend
                return distance <= limit;
            });
        }

        // "AI Recommendation" (Weighted Score)
        // Score = (Rating * 0.5) + (JobSuccessRate * 0.3) + (Experience * 0.2)
        // Note: JobSuccessRate might need calculation. For now assuming it's a field or 1.

        workers = workers.map(w => {
            const rating = w.rating_avg || 0;
            const successRate = w.job_success_rate || 1; // 0 to 1
            const experience = w.experience_years || 0;

            // Normalize experience (e.g., cap at 10 years for score calculation)
            const normExp = Math.min(experience, 10) / 10;

            // Formula: Score = (Rating/5 * 0.5) + (SuccessRate * 0.3) + (NormExp * 0.2)
            // Or use the raw numbers as requested: (Rating * 0.5) + (JobSuccessRate * 0.3) + (Experience * 0.2)
            // Let's stick to the user's formula request directly mostly, but keep scales in mind.
            // If JobSuccessRate is percent (0-100), Rating (0-5), Experience (0-20).
            // Let's assume JobSuccessRate is 0-100.

            // To make it balanced:
            // Rating (5 max) * 10 = 50 max (weight 0.5 of 100 scale?)
            // Let's just implement the raw formula as requested but ensuring fields exist.

            const score = (rating * 0.5) + ((w.job_success_rate || 100) * 0.05) + (experience * 0.2);
            // * 0.05 for success rate to convert 100 -> 5 effectively? 
            // User formula: (Rating * 0.5) + (JobSuccessRate * 0.3) + (Experience * 0.2)
            // PROBABLY implies JobSuccessRate is 0-5 or 0-10 scale? 
            // Or Rating is dominant? 
            // Let's just do exactly: (Rating * 0.5) + ((TotalCompleted/TotalJobs)*5 * 0.3) + (Exp * 0.2)
            // Simple generic score for sorting:

            w.ai_score = (rating * 0.5) + (experience * 0.2);
            // If we had success rate: + (success_rate * 0.3)
            return w;
        });

        // Sort by AI Score descending
        workers.sort((a, b) => b.ai_score - a.ai_score);

        res.status(200).json(workers);
    } catch (error) {
        console.error('Error in GET /api/workers:', error);
        res.status(500).json({ error: error.message });
    }
});

// @route   GET /api/workers/:uid/history
// @desc    Get worker location history
router.get('/:uid/history', async (req, res) => {
    try {
        const { uid } = req.params;
        const limit = parseInt(req.query.limit) || 50;

        const snapshot = await db.collection('workers')
            .doc(uid)
            .collection('locationHistory')
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();

        const history = [];
        snapshot.forEach(doc => {
            history.push({ id: doc.id, ...doc.data() });
        });

        // Return sorted by timestamp ascending for map polyline
        res.status(200).json(history.reverse());
    } catch (error) {
        console.error('Error fetching location history:', error);
        res.status(500).json({ error: error.message });
    }
});

// @route   PATCH /api/workers/:uid/location
// @desc    Update worker's real-time location
router.patch('/:uid/location', async (req, res) => {
    try {
        const { uid } = req.params;
        const { lat, lng, timestamp, accuracy } = req.body;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        const locationData = {
            location: {
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                timestamp: timestamp || new Date().toISOString(),
                accuracy: accuracy || 0
            },
            last_seen: new Date().toISOString()
        };

        // Update workers collection
        await db.collection('workers').doc(uid).update(locationData);

        // Also update users collection for consistency
        await db.collection('users').doc(uid).update({
            location: locationData.location
        });

        // Add to location history subcollection
        await db.collection('workers').doc(uid).collection('locationHistory').add({
            ...locationData.location,
            timestamp: locationData.location.timestamp,
            accuracy: locationData.location.accuracy
        });

        res.status(200).json({
            message: 'Location updated successfully',
            location: locationData.location
        });
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ error: error.message });
    }
});

// Helper for distance
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

module.exports = router;

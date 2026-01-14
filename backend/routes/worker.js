const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// @route   GET /api/workers
// @desc    Get all workers or filter by skill/location
router.get('/', async (req, res) => {
    try {
        const { skill } = req.query;
        console.log(`GET /api/workers called with skill: '${skill}'`);

        let query = db.collection('users').where('role', '==', 'worker');

        if (skill) {
            // Note: This requires 'profile.skills' to be an array and contains clause
            // For simple structure:
            query = query.where('profile.skills', 'array-contains', skill);
        }

        const snapshot = await query.get();
        const workers = [];
        snapshot.forEach(doc => {
            workers.push(doc.data());
        });

        res.json(workers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// @route   POST /api/workers/onboarding
// @desc    Update worker profile
router.post('/onboarding', async (req, res) => {
    const { uid, skills, hourlyRate, experience, location, serviceArea } = req.body;
    // Authenticate the user here usually (middleware)

    try {
        await db.collection('users').doc(uid).update({
            'profile.skills': skills,
            'profile.hourlyRate': hourlyRate,
            'profile.experience': experience,
            'profile.location': location,
            'serviceArea': serviceArea,
            isProfileComplete: true
        });
        res.json({ message: 'Profile updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

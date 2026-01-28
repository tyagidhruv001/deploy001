const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// @route   POST /api/referrals
// @desc    Create a new referral
router.post('/', async (req, res) => {
    try {
        const { referrerId, referredPhone, referredEmail } = req.body;

        const referralData = {
            referrerId,
            referredPhone: referredPhone || null,
            referredEmail: referredEmail || null,
            status: 'pending', // pending -> registered -> completed
            rewardAmount: 100, // Example fixed amount
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('referrals').add(referralData);
        res.status(201).json({ id: docRef.id, ...referralData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   GET /api/referrals/:userId
// @desc    Get referrals made by a user
router.get('/:userId', async (req, res) => {
    try {
        const snapshot = await db.collection('referrals')
            .where('referrerId', '==', req.params.userId)
            .orderBy('createdAt', 'desc')
            .get();

        const referrals = [];
        snapshot.forEach(doc => referrals.push({ id: doc.id, ...doc.data() }));
        res.json(referrals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

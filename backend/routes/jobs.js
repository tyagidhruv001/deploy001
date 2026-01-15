const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// @route   POST /api/jobs
// @desc    Create a new job
router.post('/', async (req, res) => {
    try {
        console.log('POST /api/jobs called with body:', req.body);
        // Combine date/time if provided separate
        let { customerId, customerName, workerId, workerName, serviceType, address, scheduledTime, date, time } = req.body;

        if (!scheduledTime && date && time) {
            scheduledTime = `${date}T${time}:00.000Z`; // Simple ISO construction
        }

        const jobData = {
            customerId,
            customerName, // Save the name for display
            workerId,
            workerName,   // Save worker name for display
            serviceType,
            address,
            scheduledTime,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('jobs').add(jobData);
        res.status(201).json({ id: docRef.id, ...jobData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   GET /api/jobs
// @desc    Get jobs for a user
router.get('/', async (req, res) => {
    try {
        const { userId, role } = req.query; // 'customer' or 'worker'

        let query = db.collection('jobs');
        if (req.query.type === 'available') {
            // Fetch jobs that are pending and unassigned (or assigned to auto-assign)
            query = query.where('status', '==', 'pending').where('workerId', '==', 'auto-assign');
        } else if (role === 'customer') {
            query = query.where('customerId', '==', userId);
        } else if (role === 'worker') {
            query = query.where('workerId', '==', userId);
        }

        const snapshot = await query.get();
        const jobs = [];
        snapshot.forEach(doc => {
            jobs.push({ id: doc.id, ...doc.data() });
        });

        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job (e.g. status, worker assignment)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Add updated timestamp
        updates.updatedAt = new Date().toISOString();

        await db.collection('jobs').doc(id).update(updates);
        res.json({ id, ...updates, success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

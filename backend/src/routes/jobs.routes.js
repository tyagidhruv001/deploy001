const express = require('express');
const router = express.Router();
const { db } = require('../../config/firebase');

// @route   POST /api/jobs
// @desc    Create a new job
router.post('/', async (req, res) => {
    try {
        console.log('[JOBS] Creating new job with data:', req.body);

        // Combine date/time if provided separate
        let { customerId, customerName, workerId, workerName, serviceType, address, scheduledTime, date, time, price, paymentMethod } = req.body;

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
            date,
            time,
            price,
            paymentMethod,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        console.log('[JOBS] Saving job data to Firestore:', jobData);
        const docRef = await db.collection('jobs').add(jobData);
        console.log('[JOBS] Job created successfully with ID:', docRef.id);

        res.status(201).json({ id: docRef.id, ...jobData });
    } catch (error) {
        console.error('[JOBS] Error creating job:', error);
        res.status(500).json({ error: error.message });
    }
});

// @route   GET /api/jobs
// @desc    Get jobs for a user
router.get('/', async (req, res) => {
    try {
        const { userId, role, type } = req.query;

        let query = db.collection('jobs');

        if (type === 'available') {
            // Fetch all pending jobs that workers can accept
            query = query.where('status', '==', 'pending');
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

        console.log(`Jobs API: type=${type}, role=${role}, userId=${userId}, returned ${jobs.length} jobs`);
        res.json(jobs);
    } catch (error) {
        console.error('Jobs API error:', error);
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

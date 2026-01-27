const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');

// @route   POST /api/bookings
// @desc    Create a new booking
router.post('/', async (req, res) => {
    try {
        const {
            customer_id,
            worker_id,
            service_type,
            location, // { address: String, geopoint: { lat, lng } }
            is_emergency,
            payment, // { amount: Number, status: "paid" | "pending", method: "UPI" }
            scheduled_time,
            worker_location, // { lat, lng }
            eta,
            distance
            // Status defaults to 'pending'
        } = req.body;

        const bookingData = {
            customer_id,
            worker_id,
            status: 'pending', // 'pending'|'assigned'|'on_the_way'|'arrived'|'started'|'completed'|'closed'|'cancelled'
            service_type,
            location,
            is_emergency: !!is_emergency,
            timestamp: new Date().toISOString(),
            payment: payment || { status: 'pending' },
            media: { before_img: "", after_img: "" },
            tracking: {
                worker_location: worker_location || null,
                eta: eta || null,
                distance: distance || null,
                last_updated: new Date().toISOString()
            },
            timeline: {
                created_at: new Date().toISOString(),
                assigned_at: null,
                started_at: null,
                completed_at: null
            }
        };

        if (scheduled_time) bookingData.scheduled_time = scheduled_time;

        const docRef = await db.collection('bookings').add(bookingData);

        // Update user stats? (optional)

        res.status(201).json({ id: docRef.id, ...bookingData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   GET /api/bookings
// @desc    Get bookings for a user (customer or worker)
router.get('/', async (req, res) => {
    try {
        const { user_id, role } = req.query;

        if (!user_id) return res.status(400).json({ error: 'user_id is required' });

        let query = db.collection('bookings');

        if (role === 'customer') {
            query = query.where('customer_id', '==', user_id);
        } else if (role === 'worker') {
            query = query.where('worker_id', '==', user_id);
        } else {
            // Try both? Or return error
            // For simplicity, allowed to query by specific field if provided
            // But let's assume valid role passed
        }

        const snapshot = await query.get();
        const bookings = [];
        snapshot.forEach(doc => {
            bookings.push({ id: doc.id, ...doc.data() });
        });

        // Sort by timestamp desc (manual sort needed as multiple where clauses usually require index)
        bookings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking status
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const docRef = db.collection('bookings').doc(id);
        const bookingDoc = await docRef.get();
        const bookingData = bookingDoc.data();

        // Auto-update timeline based on status
        if (updates.status === 'assigned') updates['timeline.assigned_at'] = new Date().toISOString();
        if (updates.status === 'started') updates['timeline.started_at'] = new Date().toISOString();
        if (updates.status === 'completed' && bookingData.status !== 'completed') {
            updates['timeline.completed_at'] = new Date().toISOString();

            // Atomic Stats Update for Worker
            const workerId = updates.worker_id || bookingData.worker_id;
            if (workerId && workerId !== 'auto-assign') {
                const workerRef = db.collection('workers').doc(workerId);
                const earnings = updates.payment?.amount || bookingData.payment?.amount || 0;

                await workerRef.update({
                    'stats.total_jobs': admin.firestore.FieldValue.increment(1),
                    'stats.lifetime_earnings': admin.firestore.FieldValue.increment(earnings)
                }).catch(err => console.error("Stats update failed:", err));
            }
        }

        if (updates.worker_location) {
            updates['tracking.worker_location'] = updates.worker_location;
            updates['tracking.last_updated'] = new Date().toISOString();
        }

        await db.collection('bookings').doc(id).update(updates);
        res.json({ id, ...updates, success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

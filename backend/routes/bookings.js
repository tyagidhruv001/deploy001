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
            distance,
            customer_name,
            customer_phone,
            worker_name
            // Status defaults to 'pending'
        } = req.body;

        const bookingData = {
            customer_id,
            worker_id: worker_id || null,
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
            },
            // Customer and worker info
            customer_name: customer_name || 'Customer',
            customer_phone: customer_phone || '',
            worker_name: worker_name || 'Any Professional'
        };

        if (scheduled_time) bookingData.scheduled_time = scheduled_time;

        const docRef = await db.collection('bookings').add(bookingData);

        console.log(`New booking created: ${docRef.id} for service: ${service_type}`);

        res.status(201).json({ id: docRef.id, ...bookingData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   GET /api/bookings
// @desc    Get bookings for a user (customer or worker) or by status
router.get('/', async (req, res) => {
    try {
        const { user_id, role, status, limit } = req.query;

        let query = db.collection('bookings');

        // Filter by status (for available jobs)
        if (status) {
            query = query.where('status', '==', status);
        }

        // Filter by user role
        if (user_id) {
            if (role === 'customer') {
                query = query.where('customer_id', '==', user_id);
            } else if (role === 'worker') {
                query = query.where('worker_id', '==', user_id);
            }
        }

        // Apply limit (default 50 for available jobs)
        const maxResults = parseInt(limit) || 50;
        query = query.limit(maxResults);

        const snapshot = await query.get();
        const bookings = [];

        // Fetch all bookings first
        snapshot.forEach(doc => {
            bookings.push({ id: doc.id, ...doc.data() });
        });

        // Populate customer and worker details
        const populatedBookings = await Promise.all(bookings.map(async (booking) => {
            try {
                // Fetch customer details
                if (booking.customer_id) {
                    const customerDoc = await db.collection('users').doc(booking.customer_id).get();
                    if (customerDoc.exists) {
                        const customerData = customerDoc.data();
                        booking.customer_name = customerData.name || customerData.displayName || 'Customer';
                        booking.customer_phone = customerData.phone || customerData.phoneNumber || 'N/A';
                        booking.customer_email = customerData.email || '';
                    }
                }

                // Fetch worker details if assigned
                if (booking.worker_id && booking.worker_id !== 'auto-assign') {
                    const workerDoc = await db.collection('workers').doc(booking.worker_id).get();
                    if (workerDoc.exists) {
                        const workerData = workerDoc.data();
                        booking.worker_name = workerData.name || workerData.displayName || 'Worker';
                        booking.worker_phone = workerData.phone || workerData.phoneNumber || 'N/A';
                    }
                }
            } catch (err) {
                console.error(`Error populating booking ${booking.id}:`, err);
            }
            return booking;
        }));

        // Sort by timestamp desc
        populatedBookings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        console.log(`Bookings API: status=${status}, role=${role}, user_id=${user_id}, returned ${populatedBookings.length} bookings`);
        res.status(200).json(populatedBookings);
    } catch (error) {
        console.error('Bookings API error:', error);
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

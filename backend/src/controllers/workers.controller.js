const { db } = require('../../config/firebase');
const ngeohash = require('ngeohash');
const { getDistanceFromLatLonInKm } = require('../utils/location.utils');

exports.updateWorker = async (req, res) => {
    try {
        const { uid } = req.params;
        if (uid === 'onboarding') return res.status(400).json({ error: 'Invalid UID' });
        const {
            category,
            is_online,
            is_verified,
            base_price,
            experience_years,
            location,
            identity_docs,
            qualifications,
            bio,
            portfolio,
            verification_status,
            verification_notes,
            total_jobs,
            avg_rating,
            lifetime_earnings
        } = req.body;

        const workerData = {
            uid,
            category,
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

        if (location && location.lat && location.lng) {
            workerData.location = {
                lat: location.lat,
                lng: location.lng
            };
            workerData.geohash = ngeohash.encode(location.lat, location.lng);
        }

        await db.collection('workers').doc(uid).set(workerData, { merge: true });

        res.status(200).json({ message: 'Worker data updated', data: workerData });
    } catch (error) {
        console.error('Error updating worker:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getWorkers = async (req, res) => {
    try {
        const { category, lat, lng, radiusInKm } = req.query;
        console.log(`[WORKERS] Fetching with filters: category=${category}, lat=${lat}, lng=${lng}`);

        let query = db.collection('workers');

        // Handle case-insensitive category filtering
        if (category && category !== 'all') {
            // Most categories in DB are lowercase, but we handle the input gracefully
            const targetCategory = category.toLowerCase();
            query = query.where('category', '==', targetCategory);
        }

        const snapshot = await query.get();
        let workers = [];

        console.log(`[WORKERS] Found ${snapshot.size} potential matches in collection`);

        for (const doc of snapshot.docs) {
            if (doc.id === 'onboarding') continue;

            const data = doc.data();
            data.uid = doc.id;
            data.id = doc.id;

            // Enrich with user data (Name, Avatar)
            const userDoc = await db.collection('users').doc(doc.id).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                data.name = userData.name || data.name || 'Unknown Professional';
                data.avatar = userData.profile_pic || userData.avatar || '';
                data.is_online = userData.is_online !== undefined ? userData.is_online : data.is_online;
            } else {
                data.name = data.name || 'Unknown Professional';
            }

            workers.push(data);
        }

        // Calculate distance if coordinates are provided, but do NOT filter
        if (lat && lng) {
            const centerLat = parseFloat(lat);
            const centerLng = parseFloat(lng);

            workers.forEach(w => {
                if (w.location && typeof w.location !== 'string' && w.location.lat && w.location.lng) {
                    const distance = getDistanceFromLatLonInKm(centerLat, centerLng, w.location.lat, w.location.lng);
                    w.distance = distance;
                }
            });
            console.log(`[WORKERS] Calculated distances for ${workers.length} workers (Filtering Disabled)`);
        }

        // Calculate AI Recommendation Score
        workers = workers.map(w => {
            const rating = w.stats?.avg_rating || w.avg_rating || 4.0;
            const experience = w.experience_years || 0;
            // Weighted score: Rating (70%) + Experience (30%)
            w.ai_score = (rating * 0.7) + (Math.min(experience, 10) * 0.3);
            w.rating_avg = rating; // For frontend consistency
            return w;
        });

        // Top rated first
        workers.sort((a, b) => b.ai_score - a.ai_score);

        res.status(200).json(workers);
    } catch (error) {
        console.error('Error in getWorkers:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getWorkerHistory = async (req, res) => {
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

        res.status(200).json(history.reverse());
    } catch (error) {
        console.error('Error fetching location history:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateWorkerLocation = async (req, res) => {
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

        await db.collection('workers').doc(uid).update(locationData);
        await db.collection('users').doc(uid).update({
            location: locationData.location
        });

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
};

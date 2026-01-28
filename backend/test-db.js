const { db } = require('./config/firebase');

async function testFullLogic() {
    console.log('Testing Full Logic...');
    try {
        const snapshot = await db.collection('workers').get();
        console.log(`Found ${snapshot.size} total docs.`);

        let workers = [];
        for (const doc of snapshot.docs) {
            try {
                if (doc.id === 'onboarding') continue;

                const data = doc.data();
                data.id = doc.id;
                data.uid = doc.id;

                const userDoc = await db.collection('users').doc(doc.id).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    data.name = userData.name || data.name || 'Unknown';
                }

                workers.push(data);
            } catch (err) {
                console.error('Error processing doc:', doc.id, err);
            }
        }

        console.log('Mapping scores...');
        workers = workers.map(w => {
            const rating = w.rating_avg || 0;
            const successRate = w.job_success_rate || 100;
            const experience = w.experience_years || 0;
            // potential crash here?
            const score = (rating * 0.5) + (successRate * 0.05) + (experience * 0.2);
            w.ai_score = score;
            return w;
        });

        console.log('Scores mapped successfully.');

        // Test Filter
        console.log('Testing Filter...');
        const centerLat = 28.5; // Delhi approx
        const centerLng = 77.2;

        const filtered = workers.filter(w => {
            if (!w.location || !w.location.lat || !w.location.lng) return false;
            const dist = getDistanceFromLatLonInKm(centerLat, centerLng, w.location.lat, w.location.lng);
            return dist < 1000;
        });

        console.log(`Filter done. Remaining: ${filtered.length}`);
        console.log('SUCCESS: No crash detected.');

    } catch (e) {
        console.error('CRITICAL CRASH:', e);
    }
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

testFullLogic();

// Script to sync the most recently created worker to workers collection
// This will find the newest worker user and sync them

require('dotenv').config();
const { db } = require('./config/firebase');

async function syncLatestWorker() {
    try {
        console.log('🔍 Finding all worker users...\n');

        // Get all worker users
        const usersSnapshot = await db.collection('users')
            .where('role', '==', 'worker')
            .get();

        if (usersSnapshot.empty) {
            console.log('❌ No workers found!');
            return;
        }

        console.log(`Found ${usersSnapshot.size} recent worker(s):\n`);

        const workers = [];
        usersSnapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            workers.push({
                index: index + 1,
                uid: doc.id,
                name: data.name || 'Unknown',
                email: data.email || 'No email',
                createdAt: data.createdAt || 'Unknown',
                hasLocation: !!(data.location?.lat && data.location?.lng),
                hasSkills: !!(data.skills && data.skills.length > 0)
            });

            console.log(`${index + 1}. ${data.name || 'Unknown'}`);
            console.log(`   UID: ${doc.id}`);
            console.log(`   Email: ${data.email || 'No email'}`);
            console.log(`   Created: ${data.createdAt || 'Unknown'}`);
            console.log(`   Location: ${data.location?.lat && data.location?.lng ? '✅ Yes' : '❌ No'}`);
            console.log(`   Skills: ${data.skills && data.skills.length > 0 ? '✅ ' + data.skills.join(', ') : '❌ No'}`);
            console.log('');
        });

        // Sync the most recent one
        const latestWorker = usersSnapshot.docs[0];
        const uid = latestWorker.id;
        const userData = latestWorker.data();

        console.log(`\n🔄 Syncing: ${userData.name || uid}\n`);

        // Build worker data
        const workerData = {
            uid: uid,
            name: userData.name || 'Worker',
            is_online: true,
            updated_at: new Date().toISOString(),
            rating_avg: 4.5
        };

        // Add location
        if (userData.location?.lat && userData.location?.lng) {
            workerData.location = userData.location;
            console.log('✅ Added location:', userData.location);
        } else {
            console.warn('⚠️  No location found! Worker will NOT appear on map.');
            console.log('   Please add location in worker profile:');
            console.log('   { lat: YOUR_LATITUDE, lng: YOUR_LONGITUDE }');
        }

        // Extract category from skills
        if (userData.skills && userData.skills.length > 0) {
            workerData.category = userData.skills[0].toLowerCase();
            workerData.skills = userData.skills;
            console.log('✅ Added skills:', userData.skills);
        } else {
            console.warn('⚠️  No skills found! Please add skills in worker profile.');
        }

        // Add other fields
        if (userData.hourlyRate) {
            workerData.base_price = userData.hourlyRate;
            console.log('✅ Added hourly rate:', userData.hourlyRate);
        }

        if (userData.experienceYears) {
            workerData.experience_years = userData.experienceYears;
        }

        if (userData.phone) {
            workerData.phone = userData.phone;
        }

        if (userData.bio) {
            workerData.bio = userData.bio;
        }

        // Sync to workers collection
        await db.collection('workers').doc(uid).set(workerData, { merge: true });

        console.log('\n✅ Successfully synced to workers collection!');

        if (workerData.location && workerData.skills) {
            console.log('\n🎉 Worker should now appear on customer map!');
        } else {
            console.log('\n⚠️  Worker synced but missing required fields:');
            if (!workerData.location) console.log('   - Location (required for map)');
            if (!workerData.skills) console.log('   - Skills (required for category)');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

syncLatestWorker();

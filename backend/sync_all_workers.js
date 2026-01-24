// Script to sync ALL worker users to the workers collection
// Usage: node sync_all_workers.js

require('dotenv').config();
const { db } = require('./config/firebase');

async function syncAllWorkers() {
    try {
        console.log('Finding all worker users...\n');

        // Get all users with role 'worker'
        const usersSnapshot = await db.collection('users').where('role', '==', 'worker').get();

        if (usersSnapshot.empty) {
            console.log('No workers found!');
            return;
        }

        console.log(`Found ${usersSnapshot.size} worker(s). Syncing...\n`);

        let successCount = 0;
        let errorCount = 0;

        for (const doc of usersSnapshot.docs) {
            const uid = doc.id;
            const userData = doc.data();

            try {
                // Build worker data
                const workerData = {
                    uid: uid,
                    name: userData.name || 'Worker',
                    is_online: true,
                    updated_at: new Date().toISOString(),
                    rating_avg: userData.rating || userData.rating_avg || 4.5
                };

                // Add location
                if (userData.location) {
                    workerData.location = userData.location;
                }

                // Extract category from skills
                if (userData.skills && userData.skills.length > 0) {
                    workerData.category = userData.skills[0].toLowerCase();
                    workerData.skills = userData.skills;
                }

                // Add pricing
                if (userData.hourlyRate) {
                    workerData.base_price = userData.hourlyRate;
                }

                // Add experience
                if (userData.experienceYears) {
                    workerData.experience_years = userData.experienceYears;
                }

                // Add phone
                if (userData.phone) {
                    workerData.phone = userData.phone;
                }

                // Add bio
                if (userData.bio) {
                    workerData.bio = userData.bio;
                }

                // Add qualifications
                if (userData.qualifications) {
                    workerData.qualifications = userData.qualifications;
                }

                // Write to workers collection
                await db.collection('workers').doc(uid).set(workerData, { merge: true });

                console.log(`✅ Synced: ${userData.name || uid} (${workerData.category || 'no category'})`);
                successCount++;
            } catch (error) {
                console.error(`❌ Error syncing ${uid}:`, error.message);
                errorCount++;
            }
        }

        console.log(`\n📊 Summary: ${successCount} synced, ${errorCount} errors`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

syncAllWorkers();

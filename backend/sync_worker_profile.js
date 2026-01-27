// Script to manually sync a worker user to the workers collection
// Usage: node sync_worker_profile.js <worker_uid>

require('dotenv').config();
const { db } = require('./config/firebase');

async function syncWorkerToCollection(uid) {
    try {
        console.log(`Syncing worker profile for UID: ${uid}`);

        // Get user data
        const userDoc = await db.collection('users').doc(uid).get();

        if (!userDoc.exists) {
            console.error('User not found!');
            return;
        }

        const userData = userDoc.data();
        console.log('User data:', JSON.stringify(userData, null, 2));

        if (userData.role !== 'worker') {
            console.error('User is not a worker!');
            return;
        }

        // Build worker data
        const workerData = {
            uid: uid,
            name: userData.name || 'Worker',
            is_online: true,
            updated_at: new Date().toISOString()
        };

        // Add location if provided
        if (userData.location) {
            workerData.location = userData.location;
            console.log('Added location:', userData.location);
        } else {
            console.warn('No location found! Worker needs to set location in profile.');
        }

        // Extract category from skills
        if (userData.skills && userData.skills.length > 0) {
            workerData.category = userData.skills[0].toLowerCase();
            workerData.skills = userData.skills;
            console.log('Added skills:', userData.skills);
        } else {
            console.warn('No skills found! Worker needs to set skills in profile.');
        }

        // Add pricing
        if (userData.hourlyRate) {
            workerData.base_price = userData.hourlyRate;
            console.log('Added base_price:', userData.hourlyRate);
        }

        // Add experience
        if (userData.experienceYears) {
            workerData.experience_years = userData.experienceYears;
            console.log('Added experience_years:', userData.experienceYears);
        }

        // Add rating
        if (userData.rating || userData.rating_avg) {
            workerData.rating_avg = userData.rating || userData.rating_avg || 4.5;
        } else {
            workerData.rating_avg = 4.5; // Default
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

        console.log('\n✅ Successfully synced worker to workers collection!');
        console.log('Worker data:', JSON.stringify(workerData, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error syncing worker:', error);
        process.exit(1);
    }
}

// Get UID from command line argument
const uid = process.argv[2];

if (!uid) {
    console.error('Usage: node sync_worker_profile.js <worker_uid>');
    console.log('\nTo find your worker UID:');
    console.log('1. Log in as worker');
    console.log('2. Open browser console (F12)');
    console.log('3. Type: localStorage.getItem("karyasetu_user") and look for "uid"');
    process.exit(1);
}

syncWorkerToCollection(uid);

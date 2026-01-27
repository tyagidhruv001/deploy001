// Add location and skills to a specific worker
// Usage: node update_worker_location.js <uid> <lat> <lng> <skill> <hourlyRate>

require('dotenv').config();
const { db } = require('./config/firebase');

const uid = '1pkMQE8JIROHb2NSZdos4qXXEQJ3';
const location = { lat: 26.7042, lng: 77.8964 }; // Dholpur, Rajasthan
const skills = ['Electrician']; // Default skill
const hourlyRate = 400;

async function updateWorker() {
    try {
        console.log('🔄 Updating worker profile...\n');
        console.log('UID:', uid);
        console.log('Location: Dholpur, Rajasthan', location);
        console.log('Skills:', skills);
        console.log('Hourly Rate:', hourlyRate);

        // Update users collection
        await db.collection('users').doc(uid).update({
            location: location,
            skills: skills,
            hourlyRate: hourlyRate,
            experienceYears: 5
        });

        console.log('\n✅ Updated users collection');

        // Update workers collection
        const workerData = {
            uid: uid,
            location: location,
            category: skills[0].toLowerCase(),
            skills: skills,
            base_price: hourlyRate,
            experience_years: 5,
            is_online: true,
            updated_at: new Date().toISOString()
        };

        await db.collection('workers').doc(uid).set(workerData, { merge: true });

        console.log('✅ Updated workers collection');
        console.log('\n🎉 Worker is now live on the map!');
        console.log('📍 Location: Dholpur, Rajasthan');
        console.log('⚡ Skill: Electrician');
        console.log('💰 Rate: ₹400/hr');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

updateWorker();

// Script to remove workers without location data
// Usage: node remove_workers_without_location.js

require('dotenv').config();
const { db } = require('./config/firebase');

async function removeWorkersWithoutLocation() {
    try {
        console.log('🔍 Finding workers without location data...\n');

        // Get all workers
        const workersSnapshot = await db.collection('workers').get();

        if (workersSnapshot.empty) {
            console.log('No workers found!');
            return;
        }

        console.log(`Found ${workersSnapshot.size} total workers`);

        let toDelete = [];
        let toKeep = [];

        workersSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const hasLocation = data.location && data.location.lat && data.location.lng;

            if (hasLocation) {
                toKeep.push({
                    uid: doc.id,
                    name: data.name || 'Unknown',
                    category: data.category || 'none'
                });
            } else {
                toDelete.push({
                    uid: doc.id,
                    name: data.name || 'Unknown',
                    category: data.category || 'none'
                });
            }
        });

        console.log(`\n📊 Summary:`);
        console.log(`   ✅ Workers WITH location: ${toKeep.length}`);
        console.log(`   ❌ Workers WITHOUT location: ${toDelete.length}`);

        if (toDelete.length === 0) {
            console.log('\n✨ All workers have location data! Nothing to delete.');
            process.exit(0);
        }

        console.log(`\n🗑️  Will delete ${toDelete.length} workers without location:\n`);
        toDelete.forEach(w => console.log(`   - ${w.name} (${w.category || 'no category'})`));

        console.log('\n⏳ Deleting workers from workers collection...');

        const batch = db.batch();
        toDelete.forEach(w => {
            const ref = db.collection('workers').doc(w.uid);
            batch.delete(ref);
        });

        await batch.commit();

        console.log(`\n✅ Successfully deleted ${toDelete.length} workers without location!`);
        console.log(`\n📌 Kept ${toKeep.length} workers with location data.`);

        if (toKeep.length > 0) {
            console.log('\nRemaining workers:');
            toKeep.forEach(w => console.log(`   ✓ ${w.name} (${w.category || 'no category'})`));
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

removeWorkersWithoutLocation();

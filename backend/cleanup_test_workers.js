const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function cleanupNamelessWorkers() {
    console.log('--- Cleaning Up Nameless Workers ---');
    try {
        const snapshot = await db.collection('workers').get();
        let deletedCount = 0;

        const batch = db.batch();

        snapshot.forEach(doc => {
            const data = doc.data();
            // Delete if doc ID starts with test-worker-opt or name is missing
            if (doc.id.startsWith('test-worker-opt') || (!data.name && !data.uid)) {
                batch.delete(doc.ref);
                deletedCount++;
                console.log(`Marked for deletion: ${doc.id}`);
            }
        });

        if (deletedCount > 0) {
            await batch.commit();
            console.log(`Successfully deleted ${deletedCount} nameless records.`);
        } else {
            console.log('No nameless records found.');
        }
    } catch (error) {
        console.error('Cleanup Error:', error);
    }
}

cleanupNamelessWorkers().then(() => process.exit(0));

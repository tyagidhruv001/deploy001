const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function listWorkers() {
    console.log('--- Fetching Workers ---');
    try {
        const snapshot = await db.collection('workers').get();
        if (snapshot.empty) {
            console.log('No documents found in "workers" collection.');
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`\n--- Worker Doc Found ---`);
            console.log(`ID: ${doc.id}`);
            console.log(`Name in doc: ${data.name || 'MISSING'}`);
            console.log(`Category: ${data.category || 'MISSING'}`);
            console.log(`Online: ${data.is_online}`);
            console.log(`Data keys:`, Object.keys(data));
            console.log(`-------------------`);
        });

    } catch (error) {
        console.error('Error fetching workers:', error);
    }
}

listWorkers();

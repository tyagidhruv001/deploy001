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
        const snapshot = await db.collection('users').get();
        if (snapshot.empty) {
            console.log('No users found.');
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            // Filter: show all provided it's relevant, but specifically highlight White
            if (data.name && data.name.toLowerCase().includes('white')) {
                console.log(`\n*** FOUND TARGET USER ***`);
                console.log(`ID: ${doc.id}`);
                console.log(`Name: ${data.name}`);
                console.log(`Role: ${data.role}`);
                console.log(`Profile:`, JSON.stringify(data.profile, null, 2));
                console.log(`Service Area: ${data.serviceArea}`);
            }
        });

    } catch (error) {
        console.error('Error fetching workers:', error);
    }
}

listWorkers();

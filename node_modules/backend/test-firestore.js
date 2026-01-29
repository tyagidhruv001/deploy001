const { db } = require('./src/config/firebase');
const fs = require('fs');

async function testFirestore() {
    let output = '';
    const log = (msg) => {
        output += msg + '\n';
        console.log(msg);
    };

    try {
        log('--- Testing Firestore Worker Data ---');

        const workersSnapshot = await db.collection('workers').get();
        log(`Total Workers in collection: ${workersSnapshot.size}`);

        workersSnapshot.forEach(doc => {
            const d = doc.data();
            log(`- Worker ID: ${doc.id}`);
            log(`  Name: ${d.name || 'N/A'}`);
            log(`  Category: ${d.category || 'N/A'}`);
            log(`  Location: ${JSON.stringify(d.location) || 'MISSING'}`);
            log(`  Online: ${d.is_online}`);
            log('--------------------------');
        });

    } catch (error) {
        log(`❌ Firestore Error: ${error.message}`);
    }

    fs.writeFileSync('worker-diagnostics.txt', output);
    process.exit();
}

testFirestore();

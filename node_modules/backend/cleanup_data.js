const { db } = require('./src/config/firebase');

async function cleanupCollection(collectionName, keepCount) {
    console.log(`Cleaning up ${collectionName}... keeping ${keepCount} latest.`);
    try {
        // Order by createdAt descending: newest first.
        // We keep the first 'keepCount', delete the rest.
        const snapshot = await db.collection(collectionName).orderBy('createdAt', 'desc').get();

        if (snapshot.empty) {
            console.log(`No documents found in ${collectionName}.`);
            return;
        }

        const totalDocs = snapshot.size;
        console.log(`Found ${totalDocs} documents in ${collectionName}.`);

        if (totalDocs <= keepCount) {
            console.log(`Count is within limits. No deletion needed.`);
            return;
        }

        const docsToDelete = snapshot.docs.slice(keepCount);
        console.log(`Deleting ${docsToDelete.length} documents...`);

        const batchSize = 400;
        let batch = db.batch();
        let count = 0;
        let batchCount = 0;

        for (const doc of docsToDelete) {
            batch.delete(doc.ref);
            count++;
            batchCount++;
            if (batchCount >= batchSize) {
                await batch.commit();
                console.log(`Deleted batch of ${batchCount}...`);
                batch = db.batch();
                batchCount = 0;
            }
        }

        if (batchCount > 0) {
            await batch.commit();
        }

        console.log(`Successfully deleted ${count} old documents from ${collectionName}.`);

    } catch (error) {
        console.error(`Error cleaning ${collectionName}:`, error);
        // If sorting failed (e.g. strict index requirements), fallback to unsorted
        if (error.code === 9) { // FAILED_PRECONDITION often means missing index
            console.log("Index missing? Trying unsorted deletion (arbitrary).");
            await cleanupUnsorted(collectionName, keepCount);
        }
    }
}

async function cleanupUnsorted(collectionName, keepCount) {
    const snapshot = await db.collection(collectionName).get();
    const totalDocs = snapshot.size;
    if (totalDocs <= keepCount) return;

    const docsToDelete = snapshot.docs.slice(keepCount); // arbitrarily delete excess
    const batchSize = 400;
    let batch = db.batch();
    let count = 0;
    let batchCount = 0;

    for (const doc of docsToDelete) {
        batch.delete(doc.ref);
        count++;
        batchCount++;
        if (batchCount >= batchSize) {
            await batch.commit();
            batch = db.batch();
            batchCount = 0;
        }
    }
    if (batchCount > 0) {
        await batch.commit();
    }
    console.log(`Deleted ${count} documents (unsorted).`);
}

async function runCleanup() {
    await cleanupCollection('bookings', 10);
    await cleanupCollection('jobs', 10);
    console.log('Cleanup complete.');
    process.exit(0);
}

runCleanup();

const { db } = require('./config/firebase');

async function assignJobsToAllWorkers() {
    console.log('Starting smart job assignment...');

    try {
        // 1. Get all potential workers (handle capitalization and variations)
        const workersSnapshot = await db.collection('workers').get();
        // Use 'in' query for role flexibility
        const usersSnapshot = await db.collection('users')
            .where('role', 'in', ['worker', 'Worker', 'service_provider', 'ServiceProvider'])
            .get();

        const workers = new Map();

        workersSnapshot.forEach(doc => {
            workers.set(doc.id, { id: doc.id, ...doc.data() });
        });

        usersSnapshot.forEach(doc => {
            if (!workers.has(doc.id)) {
                workers.set(doc.id, { id: doc.id, ...doc.data() });
            }
        });

        console.log(`Found ${workers.size} total worker accounts.`);

        // 2. Job Templates
        const jobTemplates = [
            { description: 'Fix leaking kitchen sink tap', serviceType: 'Plumber', price: 450, address: '123 Main St, Mathura' },
            { description: 'Install new ceiling fan', serviceType: 'Electrician', price: 350, address: '45 Green Park, Agra' },
            { description: 'Full home deep cleaning', serviceType: 'Cleaning', price: 1200, address: '88 Civil Lines, Mathura' },
            { description: 'Repair wooden cupboard hinge', serviceType: 'Carpenter', price: 250, address: '12 Temple Road, Vrindavan' },
            { description: 'AC Service and Repair', serviceType: 'Appliance', price: 599, address: '99 Royal Enclave, Mathura' },
            { description: 'General House Painting', serviceType: 'Painter', price: 2500, address: '15 Garden View, Agra' }
        ];

        // 3. Process each worker
        const jobsRef = db.collection('jobs');
        const batch = db.batch();
        let operationCount = 0;
        const BATCH_LIMIT = 400; // Firestore batch limit is 500

        for (const [workerId, worker] of workers) {
            try {
                // Fetch existing jobs for this specific worker to avoid duplicates
                const existingJobsSnapshot = await jobsRef.where('workerId', '==', workerId).get();
                let hasActive = false;
                let completedCount = 0;

                existingJobsSnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.status === 'in_progress' || data.status === 'pending') hasActive = true;
                    if (data.status === 'completed') completedCount++;
                });

                // Filter templates relevant to worker's service category (if defined)
                const relevantTemplates = worker.serviceCategory
                    ? jobTemplates.filter(t => t.serviceType.toLowerCase() === worker.serviceCategory.toLowerCase())
                    : jobTemplates;

                // Fallback if no specific match found
                const templatesToUse = relevantTemplates.length > 0 ? relevantTemplates : jobTemplates;

                // A. Ensure at least 1 Active Job
                if (!hasActive) {
                    const template = templatesToUse[Math.floor(Math.random() * templatesToUse.length)];
                    const newJobRef = jobsRef.doc();

                    batch.set(newJobRef, {
                        workerId: workerId,
                        workerName: worker.name || 'Worker',
                        customerId: 'demo_customer_1',
                        customerName: 'Rahul Sharma',
                        serviceType: worker.serviceCategory || template.serviceType,
                        description: template.description,
                        price: template.price,
                        address: template.address,
                        status: 'in_progress',
                        acceptedAt: new Date().toISOString(),
                        createdAt: new Date(Date.now() - 86400000).toISOString(),
                        scheduledDate: new Date().toISOString().split('T')[0],
                        urgency: 'medium'
                    });
                    operationCount++;
                    console.log(`  + Queued ACTIVE job for ${worker.name || workerId}`);
                }

                // B. Ensure at least 2 Completed Jobs
                if (completedCount < 2) {
                    const needed = 2 - completedCount;
                    for (let i = 0; i < needed; i++) {
                        const template = templatesToUse[Math.floor(Math.random() * templatesToUse.length)];
                        const newJobRef = jobsRef.doc();

                        batch.set(newJobRef, {
                            workerId: workerId,
                            workerName: worker.name || 'Worker',
                            customerId: `demo_customer_${i + 2}`,
                            customerName: 'Demo Customer',
                            serviceType: worker.serviceCategory || template.serviceType,
                            description: template.description,
                            price: template.price,
                            address: template.address,
                            status: 'completed',
                            completedAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
                            createdAt: new Date(Date.now() - (i + 2) * 86400000).toISOString(),
                            scheduledDate: new Date(Date.now() - (i + 1) * 86400000).toISOString().split('T')[0],
                            rating: 5
                        });
                        operationCount++;
                        console.log(`  + Queued COMPLETED job for ${worker.name || workerId}`);
                    }
                }

                // Commit batch if limit reached
                if (operationCount >= BATCH_LIMIT) {
                    await batch.commit();
                    console.log(`  >> Committed batch of ${operationCount} operations.`);
                    operationCount = 0;
                }

            } catch (err) {
                console.error(`Error processing worker ${workerId}:`, err.message);
                // Continue to next worker
            }
        }

        // Final commit
        if (operationCount > 0) {
            await batch.commit();
            console.log(`  >> Committed final batch of ${operationCount} operations.`);
        }

        console.log('✅ Smart job assignment complete.');
        process.exit(0);
    } catch (error) {
        console.error('Fatal error assigning jobs:', error);
        process.exit(1);
    }
}

assignJobsToAllWorkers();

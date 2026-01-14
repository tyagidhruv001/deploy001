const { db } = require('./config/firebase');

async function seedJobs() {
    try {
        console.log('Starting job seed process...');

        // 1. Get the worker we just created (or any worker)
        const workersSnapshot = await db.collection('users').where('role', '==', 'worker').limit(1).get();
        if (workersSnapshot.empty) {
            console.error('No workers found. Run seed_workers.js first.');
            process.exit(1);
        }
        const worker = workersSnapshot.docs[0].data();
        const workerId = worker.uid;
        console.log(`Assigning jobs to worker: ${worker.name} (${workerId})`);

        // 2. Define sample jobs
        const jobs = [
            {
                customerId: 'mock-customer-1',
                workerId: workerId,
                title: 'Leaking Tap Repair', // Dashboard expects 'title'
                description: 'Kitchen tap is dripping continuously.',
                serviceType: 'Plumbing',
                address: '101, Galaxy Apts, Andheri West',
                location: 'Andheri West', // Dashboard uses 'location'
                scheduledTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                status: 'pending',
                budget: { min: 400, max: 600 },
                urgency: 'medium',
                createdAt: new Date().toISOString(),
                customer: { name: 'Amit Singh', phone: '9876543210' } // Denormalized for simpler frontend
            },
            {
                customerId: 'mock-customer-2',
                workerId: workerId,
                title: 'Fan Installation',
                description: 'Need to install a new ceiling fan.',
                serviceType: 'Electrician',
                address: '505, Palm Heights, Bandra',
                location: 'Bandra',
                scheduledTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                status: 'in_progress',
                startedAt: new Date(Date.now() - 3600000).toISOString(),
                budget: { min: 800, max: 1000 },
                urgency: 'low',
                createdAt: new Date().toISOString(),
                customer: { name: 'Sneha Patel', phone: '9988776655' }
            },
            {
                customerId: 'mock-customer-3',
                workerId: workerId,
                title: 'Bathroom Cleaning',
                description: 'Deep cleaning of 2 bathrooms.',
                serviceType: 'Cleaning',
                address: '12, Rose Villa, Juhu',
                location: 'Juhu',
                scheduledTime: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                status: 'completed',
                completedAt: new Date(Date.now() - 172800000).toISOString(),
                payment: 1500,
                rating: 5,
                review: 'Excellent service!',
                createdAt: new Date().toISOString(),
                customer: { name: 'Rajesh Khanna', phone: '9123456789' }
            }
        ];

        // 3. Insert jobs
        for (const job of jobs) {
            await db.collection('jobs').add(job);
            console.log(`Added job: ${job.title} (${job.status})`);
        }

        console.log('Job seed process completed.');
        process.exit(0);

    } catch (error) {
        console.error('Seed script error:', error);
        process.exit(1);
    }
}

seedJobs();

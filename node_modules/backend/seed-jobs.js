const { db } = require('./config/firebase');

async function seedJobsAndBookings() {
    console.log('🚀 Starting advanced job/booking seeding...');

    try {
        // 1. Fetch Workers (combine 'workers' collection and 'users' with role=worker)
        const workersMap = new Map();
        try {
            const [workersSnap, usersSnap] = await Promise.all([
                db.collection('workers').get(),
                db.collection('users').where('role', 'in', ['worker', 'Worker', 'service_provider', 'ServiceProvider']).get()
            ]);

            workersSnap.forEach(doc => workersMap.set(doc.id, { id: doc.id, ...doc.data() }));
            usersSnap.forEach(doc => {
                if (!workersMap.has(doc.id)) workersMap.set(doc.id, { id: doc.id, ...doc.data() });
            });
        } catch (err) {
            console.error('Error fetching workers:', err.message);
            return;
        }

        const workers = Array.from(workersMap.values());
        if (workers.length === 0) {
            console.log('❌ No workers found. Please register some workers first.');
            process.exit(1);
        }
        console.log(`✅ Found ${workers.length} unique workers.`);

        // 2. Data Definitions
        const customers = [
            { id: 'seed_cust_01', name: 'Rahul Sharma', phone: '+91 9870011111', address: '123 Main St, Mathura' },
            { id: 'seed_cust_02', name: 'Priya Gupta', phone: '+91 9870022222', address: '45 Park Rd, Agra' },
            { id: 'seed_cust_03', name: 'Amit Singh', phone: '+91 9870033333', address: '88 Lake View, Vrindavan' },
            { id: 'seed_cust_04', name: 'Sneha Patel', phone: '+91 9870044444', address: '15 Garden Ln, Mathura' },
            { id: 'seed_cust_05', name: 'Vikram Das', phone: '+91 9870055555', address: '99 River Side, Agra' }
        ];

        const jobDescriptions = {
            'electrical': ['Fix faulty wiring in living room', 'Install new ceiling fan', 'Repair short circuit', 'Install LED lights', 'Check power outlet'],
            'plumbing': ['Fix leaking tap in bathroom', 'Unclog kitchen sink drain', 'Install new water heater', 'Repair toilet flush system', 'Fix pipe leak under sink'],
            'carpentry': ['Repair wooden door hinges', 'Build custom bookshelf', 'Fix broken cabinet doors', 'Install new wooden flooring', 'Repair wardrobe sliding doors'],
            'cleaning': ['Deep home cleaning', 'Bathroom deep cleaning', 'Kitchen chimney cleaning', 'Sofa dry cleaning', 'Carpet shampooing'],
            'painter': ['Wall painting (1 room)', 'Texture painting', 'Exterior whitewash', 'Door polishing'],
            'appliance': ['AC Service', 'Washing machine repair', 'Microwave checkup', 'Refrigerator gas refill'],
            'default': ['General repair work needed', 'Home maintenance service', 'Professional service required', 'Urgent repair needed', 'Routine maintenance work']
        };

        // Map capitalized/variant categories to our lowercase keys
        const categoryMap = {
            'Electrician': 'electrical', 'Electrical': 'electrical',
            'Plumber': 'plumbing', 'Plumbing': 'plumbing',
            'Carpenter': 'carpentry', 'Carpentry': 'carpentry',
            'Cleaner': 'cleaning', 'Cleaning': 'cleaning',
            'Painter': 'painter', 'Painting': 'painter',
            'Appliance': 'appliance', 'Mechanic': 'default'
        };

        const bookingsRef = db.collection('bookings');
        const jobsRef = db.collection('jobs');

        let batch = db.batch();
        let opsCount = 0;
        let totalCreated = 0;
        const workerJobCounts = {}; // Track in memory to report summary

        // 3. Process Each Worker
        for (const worker of workers) {
            workerJobCounts[worker.name || worker.id] = 0;

            // Determine Category
            let catKey = 'default';
            if (worker.serviceCategory) {
                // Handle "Electrician" -> "electrical"
                const rawCat = worker.serviceCategory.trim();
                catKey = categoryMap[rawCat] || categoryMap[rawCat.charAt(0).toUpperCase() + rawCat.slice(1)] || rawCat.toLowerCase();
            }
            // Fallback if key doesn't exist in map
            if (!jobDescriptions[catKey]) catKey = 'default';

            const descriptions = jobDescriptions[catKey];

            // Create 3-5 jobs per worker
            const numJobs = Math.floor(Math.random() * 3) + 3;

            for (let i = 0; i < numJobs; i++) {
                const customer = customers[Math.floor(Math.random() * customers.length)];
                const description = descriptions[Math.floor(Math.random() * descriptions.length)];

                // Logic: Status vs Date
                let status, scheduledDate, completedAt = null, rating = null, review = null;
                const rand = Math.random();
                const now = new Date();

                if (rand < 0.4) {
                    // COMPLETED (Past)
                    status = 'completed';
                    // 1-14 days ago
                    now.setDate(now.getDate() - Math.floor(Math.random() * 14) - 1);
                    scheduledDate = now.toISOString().split('T')[0];
                    completedAt = now.toISOString(); // Completed same day as scheduled for simplicity
                    rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
                    review = "Great service, very professional!";
                } else if (rand < 0.6) {
                    // IN PROGRESS (Today)
                    status = 'in_progress';
                    scheduledDate = new Date().toISOString().split('T')[0]; // Today
                } else {
                    // PENDING (Future)
                    status = 'pending';
                    // 1-7 days in future
                    now.setDate(now.getDate() + Math.floor(Math.random() * 7) + 1);
                    scheduledDate = now.toISOString().split('T')[0];
                }

                const timeSlots = ['09:00', '10:30', '12:00', '14:30', '16:00', '18:00'];
                const scheduledTime = timeSlots[Math.floor(Math.random() * timeSlots.length)];
                const estimatedPrice = Math.floor(Math.random() * 1000) + 300;

                // Create References FIRST for Two-Way Linking
                const bookingRef = bookingsRef.doc();
                const jobRef = jobsRef.doc();

                const commonData = {
                    workerId: worker.id,
                    workerName: worker.name || worker.displayName || 'Worker',
                    customerId: customer.id,
                    customerName: customer.name,
                    customerPhone: customer.phone,
                    customerAddress: customer.address,
                    serviceType: worker.serviceCategory || catKey, // Preserve original if possible
                    description: description,
                    scheduledDate: scheduledDate,
                    scheduledTime: scheduledTime,
                    status: status,
                    urgency: Math.random() > 0.8 ? 'urgent' : 'medium',
                    price: estimatedPrice,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                // Booking Payload
                const bookingData = {
                    ...commonData,
                    jobId: jobRef.id, // Link to Job
                    completedAt: completedAt,
                    rating: rating,
                    review: review
                };

                // Job Payload
                const jobData = {
                    ...commonData,
                    bookingId: bookingRef.id, // Link to Booking
                    serviceCategory: catKey, // Normalized category for searching
                    completedAt: completedAt,
                    rating: rating
                };

                // Add to Batch
                batch.set(bookingRef, bookingData);
                batch.set(jobRef, jobData);

                opsCount += 2;
                totalCreated++;
                workerJobCounts[worker.name || worker.id]++;

                // Commit if limit reached
                if (opsCount >= 450) {
                    await batch.commit();
                    console.log(`  >> Committed intermediate batch (${opsCount} ops)`);
                    batch = db.batch();
                    opsCount = 0;
                }
            }
        }

        // Final Commit
        if (opsCount > 0) {
            await batch.commit();
            console.log(`  >> Committed final batch (${opsCount} ops)`);
        }

        console.log('\n✅ Seeding Success!');
        console.log(`Total items created: ${totalCreated} (Jobs + Bookings)`);

        console.log('\n📊 Summary by worker:');
        Object.entries(workerJobCounts).forEach(([name, count]) => {
            console.log(`  ${name}: ${count} jobs`);
        });

        process.exit(0);

    } catch (error) {
        console.error('❌ Fatal error during seeding:', error);
        process.exit(1);
    }
}

seedJobsAndBookings();

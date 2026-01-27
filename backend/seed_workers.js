const { db } = require('./config/firebase');

const sampleWorkers = [
    {
        uid: 'worker_seed_001',
        name: "Rajesh Kumar",
        email: "rajesh.k@example.com",
        role: "worker",
        avatar: "https://ui-avatars.com/api/?name=Rajesh+Kumar&background=0D8ABC&color=fff",
        serviceArea: "Mumbai, Andheri West",
        isProfileComplete: true,
        karyasetu_rating: 4.8,
        profile: {
            skills: ["Plumber", "Pipe Fitting", "Leakage Repair"],
            experience: "expert",
            hourlyRate: 350,
            location: "Mumbai",
            education: [{ school: "ITI Mumbai", degree: "Plumbing Certification", year: "2015-2016" }]
        }
    },
    {
        uid: 'worker_seed_002',
        name: "Suresh Patel",
        email: "suresh.p@example.com",
        role: "worker",
        avatar: "https://ui-avatars.com/api/?name=Suresh+Patel&background=16a34a&color=fff",
        serviceArea: "Delhi, South Ex",
        isProfileComplete: true,
        karyasetu_rating: 4.5,
        profile: {
            skills: ["Electrician", "Wiring", "Appliance Repair"],
            experience: "intermediate",
            hourlyRate: 400,
            location: "Delhi",
            education: [{ school: "Polytechnic Delhi", degree: "Diploma in Electrical", year: "2018-2020" }]
        }
    },
    {
        uid: 'worker_seed_003',
        name: "Amit Singh",
        email: "amit.s@example.com",
        role: "worker",
        avatar: "https://ui-avatars.com/api/?name=Amit+Singh&background=ea580c&color=fff",
        serviceArea: "Bangalore, Indiranagar",
        isProfileComplete: true,
        karyasetu_rating: 4.9,
        profile: {
            skills: ["Carpenter", "Furniture Repair", "Woodwork"],
            experience: "expert",
            hourlyRate: 500,
            location: "Bangalore",
            education: []
        }
    },
    {
        uid: 'worker_seed_004',
        name: "Priya Sharma",
        email: "priya.s@example.com",
        role: "worker",
        avatar: "https://ui-avatars.com/api/?name=Priya+Sharma&background=d946ef&color=fff",
        serviceArea: "Pune, Kothrud",
        isProfileComplete: true,
        karyasetu_rating: 4.7,
        profile: {
            skills: ["Painter", "Wall Texturing", "Interior Painting"],
            experience: "intermediate",
            hourlyRate: 300,
            location: "Pune",
            education: [{ school: "Fine Arts College", degree: "BFA", year: "2019-2023" }]
        }
    },
    {
        uid: 'worker_seed_005',
        name: "Vikram Malhotra",
        email: "vikram.m@example.com",
        role: "worker",
        avatar: "https://ui-avatars.com/api/?name=Vikram+Malhotra&background=6366f1&color=fff",
        serviceArea: "Hyderabad, Gachibowli",
        isProfileComplete: true,
        karyasetu_rating: 4.6,
        profile: {
            skills: ["AC Repair", "HVAC", "Installation"],
            experience: "expert",
            hourlyRate: 600,
            location: "Hyderabad",
            education: [{ school: "Technical Institute", degree: "HVAC Certification", year: "2017" }]
        }
    }
];

async function seedWorkers() {
    try {
        console.log('Starting seed process...');
        const batch = db.batch();

        sampleWorkers.forEach((worker, index) => {
            // 1. Seed User Identity
            const userRef = db.collection('users').doc(worker.uid);
            batch.set(userRef, worker, { merge: true });

            // 2. Seed Worker Discovery Data
            const discoveryData = {
                uid: worker.uid,
                name: worker.name,
                category: (worker.profile.skills[0] || 'General').toLowerCase(),
                is_online: true, // Set workers as online
                rating_avg: worker.karyasetu_rating,
                experience_years: worker.profile.experience === 'expert' ? 10 : 5,
                base_price: worker.profile.hourlyRate || 350,
                phone: '+91' + (9000000000 + index), // Generate phone numbers
                location: {
                    lat: 19.0760 + (index * 0.01), // Spread them out slightly in Mumbai
                    lng: 72.8777 + (index * 0.01)
                },
                updated_at: new Date().toISOString()
            };
            const workerRef = db.collection('workers').doc(worker.uid);
            batch.set(workerRef, discoveryData, { merge: true });

            console.log(`Prepared dual-seed for: ${worker.name}`);
        });

        await batch.commit();
        console.log('Successfully seeded workers into "users" and "workers" collections.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding workers:', error);
        process.exit(1);
    }
}

seedWorkers();

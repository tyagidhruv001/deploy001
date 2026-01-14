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

        for (const worker of sampleWorkers) {
            const docRef = db.collection('users').doc(worker.uid);
            batch.set(docRef, worker, { merge: true }); // Use merge to avoid overwriting auth-related fields if they existed (though here we control IDs)
            console.log(`Prepared seed for: ${worker.name}`);
        }

        await batch.commit();
        console.log('Successfully seeded workers into Firestore collection "users".');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding workers:', error);
        process.exit(1);
    }
}

seedWorkers();

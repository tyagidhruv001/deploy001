const { db } = require('../config/firebase');

const services = [
    { title: "Mechanic", category: "Mechanic" },
    { title: "Plumber", category: "Plumber" },
    { title: "Electrician", category: "Electrician" },
    { title: "Carpenter", category: "Carpenter" },
    { title: "Painter", category: "Painter" },
    { title: "Home Cleaning", category: "Home Cleaning" },
    { title: "AC Repair", category: "AC Repair" },
    { title: "Gardening", category: "Gardening" },
    { title: "Appliances", category: "Appliances" },
    { title: "Pest Control", category: "Pest Control" },
    { title: "Beauty & Spa", category: "Beauty & Spa" },
    { title: "Packers & Movers", category: "Packers & Movers" },
    { title: "RO & Water", category: "RO & Water" },
    { title: "Home Security", category: "Home Security" },
    { title: "Interior Design", category: "Interior Design" }
];

const mockNames = [
    "Arjun Singh", "Priya Sharma", "Rahul Verma", "Sneha Gupta", "Amit Patel",
    "Anjali Mani", "Vikram Rathore", "Pooja Reddy", "Deepak Kumar", "Sonia Das",
    "Ravi Teja", "Meera Nair", "Sundeep Gill", "Kaveri Jha", "Rohan Mehra",
    "Tanvi Shah", "Yousuf Khan", "Ishani Bose", "Gaurav Joshi", "Divya Pillai",
    "Siddharth Shishodia", "Rachna Roy", "Harish Rawat", "Neha Kapoor", "Abhishek Tiwari",
    "Ritu Chauhan", "Manish Malhotra", "Kiran Bedi", "Sanjay Dutt", "Juhi Chawla"
];

async function seedWorkers() {
    console.log("🚀 Starting database seeding...");
    const batch = db.batch();

    // Central Mumbai coordinates
    const baseLat = 19.0760;
    const baseLng = 72.8777;

    for (let i = 0; i < services.length; i++) {
        const service = services[i];

        for (let j = 1; j <= 2; j++) {
            const index = (i * 2) + (j - 1);
            const uid = `worker_${service.category.toLowerCase().replace(/\s+/g, '_')}_${j}`;
            const name = mockNames[index];
            const price = 300 + Math.floor(Math.random() * 500);
            const rating = (4.0 + Math.random()).toFixed(1);
            const exp = 3 + Math.floor(Math.random() * 12);

            // Randomize location slightly (within ~5km)
            const lat = baseLat + (Math.random() - 0.5) * 0.1;
            const lng = baseLng + (Math.random() - 0.5) * 0.1;

            const userData = {
                uid,
                name,
                role: 'worker',
                email: `${uid}@karyasetu.com`,
                phone: `+9199999000${index < 10 ? '0' + index : index}`,
                is_verified: true,
                created_at: new Date().toISOString()
            };

            const workerData = {
                uid,
                name,
                category: service.category,
                is_online: true,
                is_verified: true,
                experience_years: exp,
                base_price: price,
                rating_avg: parseFloat(rating),
                total_jobs: Math.floor(Math.random() * 100),
                bio: `Professional ${service.title} with ${exp} years of industry experience. Committed to quality work and customer satisfaction.`,
                location: { lat, lng },
                updated_at: new Date().toISOString()
            };

            // Add to batch
            const userRef = db.collection('users').doc(uid);
            const workerRef = db.collection('workers').doc(uid);

            batch.set(userRef, userData);
            batch.set(workerRef, workerData);

            console.log(`+ Prepared: ${name} (${service.category})`);
        }
    }

    try {
        await batch.commit();
        console.log("✅ Successfully seeded 30 workers!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
    }
}

seedWorkers();

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const TARGET_UID = 'eKUMuMibtLaao76Cq0lErNH0Vwf2'; // ID found in previous step

async function fixProfile() {
    console.log(`Fixing profile for UID: ${TARGET_UID}...`);
    try {
        await db.collection('users').doc(TARGET_UID).update({
            // Ensure basic info is there
            role: 'worker',
            isProfileComplete: true,
            serviceArea: 'Mumbai, Andheri', // Default

            // The missing profile object
            profile: {
                skills: ['Carpenter', 'Woodwork', 'Furniture Assembly'],
                experience: 'intermediate',
                hourlyRate: 450,
                location: 'Mumbai',
                about: 'Expert carpenter with 5 years of experience.'
            },

            updatedAt: new Date().toISOString()
        });
        console.log('Profile successfully updated/created!');
    } catch (error) {
        console.error('Failed to update profile:', error);
    }
}

fixProfile();

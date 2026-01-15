const { auth, db } = require('./config/firebase');

async function listUsers() {
    try {
        console.log("Listing Auth Users:");
        const listUsersResult = await auth.listUsers(10);
        listUsersResult.users.forEach((userRecord) => {
            console.log('user', userRecord.toJSON());
        });

        console.log("\nListing Firestore Users:");
        const usersSnapshot = await db.collection('users').get();
        if (usersSnapshot.empty) {
            console.log('No matching documents.');
            return;
        }

        usersSnapshot.forEach(doc => {
            usersSnapshot.forEach(doc => {
                const data = doc.data();
                console.log(`User: ${data.name || 'Unknown'} | Phone: ${data.phone} | Role: ${data.role} | UID: ${doc.id}`);
            });
        });

    } catch (error) {
        console.log('Error listing users:', error);
    }
}

listUsers();

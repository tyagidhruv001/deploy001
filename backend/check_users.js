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
            console.log(doc.id, '=>', doc.data());
        });

    } catch (error) {
        console.log('Error listing users:', error);
    }
}

listUsers();

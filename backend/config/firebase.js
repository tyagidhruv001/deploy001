const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

let serviceAccount;
try {
  console.log('Current directory of firebase.js:', __dirname);
  serviceAccount = require('../serviceAccountKey.json');
} catch (error) {
  console.log('Error loading serviceAccountKey:', error.message);
  console.log('Info: serviceAccountKey.json not found, checking for environment variables...');
}

if (!admin.apps.length) {
  try {
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin initialized with serviceAccountKey.json');
    } else {
      admin.initializeApp();
      console.log('Firebase Admin initialized with default credentials (env vars)');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });
const auth = admin.auth();

module.exports = { db, auth, admin };

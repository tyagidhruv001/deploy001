const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

let serviceAccount;
try {
  // console.log('Current directory of firebase.js:', __dirname);
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // If provided as a stringified JSON in env var
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('Loaded serviceAccount from environment variable.');
  } else {
    // Fallback to file for local development
    serviceAccount = require('../serviceAccountKey.json');
  }
} catch (error) {
  console.log('Error loading serviceAccountKey:', error.message);
  console.log('Info: serviceAccountKey.json not found and FIREBASE_SERVICE_ACCOUNT not set.');
}

if (!admin.apps.length) {
  try {
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin initialized with credentials');
    } else {
      admin.initializeApp();
      console.log('Firebase Admin initialized with default credentials (env vars)');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth };

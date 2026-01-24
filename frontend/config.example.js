// Firebase Configuration - ES6 Module
// COPY THIS FILE TO config.js AND REPLACE WITH YOUR ACTUAL FIREBASE CREDENTIALS
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, doc, onSnapshot, getDoc, setDoc, query, where, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Instances
export const auth = getAuth(app);
export const db = getFirestore(app);

// Expose to window for traditional scripts
window.auth = auth;
window.db = db;
window.fbFunctions = {
    collection,
    doc,
    onSnapshot,
    getDoc,
    setDoc,
    query,
    where,
    orderBy,
    limit
};

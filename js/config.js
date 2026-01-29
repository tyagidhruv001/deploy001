// Firebase Configuration - ES6 Module
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, doc, onSnapshot, getDoc, setDoc, query, where, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyBhudFfYqavZ2OowFsdfDI5q1I4Hkyn3so",
    authDomain: "karyasetu-e199c.firebaseapp.com",
    projectId: "karyasetu-e199c",
    storageBucket: "karyasetu-e199c.firebasestorage.app",
    messagingSenderId: "955540675906",
    appId: "1:955540675906:web:fdc4dbfb09d2624a54fcdb",
    measurementId: "G-EH1QCL0JCQ"
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

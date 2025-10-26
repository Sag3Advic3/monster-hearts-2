import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import fs from 'fs';
import admin from 'firebase-admin';

let serviceAccount;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_PATH) {
  serviceAccount = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS_PATH, 'utf8'));
} else if (process.env.SERVICE_ACCOUNT_JSON) {
  serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
} else {
  throw new Error('No Firebase service account provided. Set GOOGLE_APPLICATION_CREDENTIALS_PATH or SERVICE_ACCOUNT_JSON.');
}

const firebaseConfig = {
  credential: admin.credential.cert(serviceAccount),
  apiKey: "AIzaSyBUwgJ4lQaSAkdoDOW2Wb7-qvlz7ks0YGQ",
  authDomain: "mh2-tracker.firebaseapp.com",
  projectId: "mh2-tracker",
  storageBucket: "mh2-tracker.firebasestorage.app",
  messagingSenderId: "63010056327",
  appId: "1:63010056327:web:b177d3c82d655c0bc6b022",
  measurementId: "G-7G128W90ZN"
};

const app = admin.initializeApp(firebaseConfig);
//export const auth = getAuth(app);
//export const googleProvider = new GoogleAuthProvider();
export const db = admin.firestore();
//export const storage = getStorage(app);
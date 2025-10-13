import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBgJRpN4SPZrJY8iZ7-niGsSPKDBc3scQ4",
  authDomain: "monster-hearts-2-tracker.firebaseapp.com",
  projectId: "monster-hearts-2-tracker",
  storageBucket: "monster-hearts-2-tracker.firebasestorage.app",
  messagingSenderId: "911530994593",
  appId: "1:911530994593:web:a980c75a0b7abf43f2f9e0",
  measurementId: "G-KTSLBHMQT8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
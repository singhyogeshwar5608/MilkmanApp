import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD5XCAIqynBerQLErqIJ_DW1TNqi8esg9c",
  authDomain: "petsconnect-22455.firebaseapp.com",
  projectId: "petsconnect-22455",
  storageBucket: "petsconnect-22455.firebasestorage.app",
  messagingSenderId: "1014681180283",
  appId: "1:1014681180283:web:b5f159883dcd2e11842ade",
  measurementId: "G-VKMC0NHLEW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

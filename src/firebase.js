import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ ADD THIS

const firebaseConfig = {
  apiKey: "AIzaSyA-K5cgSrKPfa_skMlKeLsTabjYSWKrjYI",
  authDomain: "resume-screening-and-matching.firebaseapp.com",
  projectId: "resume-screening-and-matching",
  storageBucket: "resume-screening-and-matching.firebasestorage.app",
  messagingSenderId: "1021729376405",
  appId: "1:1021729376405:web:a33551e7ee43269554739c"
};

const app = initializeApp(firebaseConfig);

// ✅ ADD THESE
export const auth = getAuth(app);
export const db = getFirestore(app);
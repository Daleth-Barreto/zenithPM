
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC_MIXBzCO62thFFtTnDlUQJCdWRHOXVcc",
  authDomain: "zenith-80fae.firebaseapp.com",
  projectId: "zenith-80fae",
  storageBucket: "zenith-80fae.appspot.com",
  messagingSenderId: "646291807012",
  appId: "1:646291807012:web:8a0614f831ab84d95b71b1",
  measurementId: "G-9C19CLJQ8D"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

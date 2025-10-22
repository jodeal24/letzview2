// src/dataClient.js
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";

// Your Firebase config (from Firebase Console → Project settings → Web app)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// ✅ Initialize Firebase safely (avoid “already exists” errors)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Fetch all series from Firestore
export async function fetchCatalog() {
  const seriesCol = collection(db, "series");
  const seriesSnapshot = await getDocs(seriesCol);
  const seriesList = seriesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return seriesList;
}

// Add or update a series (used only by /admin)
export async function saveSeries(series) {
  await setDoc(doc(db, "series", series.id), series);
}

// Export the Firestore instance for reuse in other files
export { db };

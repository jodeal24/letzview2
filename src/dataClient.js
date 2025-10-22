// src/dataClient.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";

// ✅ Your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD4txlg8WkvFW4-KygsuhjyhqdhnZ9BOPM",
  authDomain: "letzview-a0c3e.firebaseapp.com",
  projectId: "letzview-a0c3e",
  storageBucket: "letzview-a0c3e.appspot.com",   // ✅ corrected
  messagingSenderId: "672436329327",
  appId: "1:672436329327:web:70c10c14124e1a694ba69a",
};


// ✅ Initialize Firebase safely (avoid “already exists” errors)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// ------------------------- Firestore helpers -------------------------

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

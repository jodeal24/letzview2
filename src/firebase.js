import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD4txlg8WkvFW4-KygsuhjyhqdhnZ9BOPM",
  authDomain: "letzview-a0c3e.firebaseapp.com",
  projectId: "letzview-a0c3e",
  storageBucket: "letzview-a0c3e.firebasestorage.app",
  messagingSenderId: "672436329327",
  appId: "1:672436329327:web:70c10c14124e1a694ba69a",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

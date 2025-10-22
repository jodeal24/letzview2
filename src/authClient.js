// src/authClient.js
import { auth } from "./dataClient";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

// Email + Password login
export async function login(email, password) {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  return userCred.user;
}

// Observe auth state changes
export function observeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// Logout
export function logout() {
  return signOut(auth);
}

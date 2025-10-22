// src/authClient.js
import { auth } from "./firebase";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";

// Login with email & password
export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    alert("Login failed: " + error.message);
    throw error;
  }
}

// Observe user authentication state
export function observeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// Logout
export async function logout() {
  await signOut(auth);
}

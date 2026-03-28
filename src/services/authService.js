// authService.js - Firebase Authentication helper functions
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

/**
 * Register a new user with email, password, and role
 */
export const registerUser = async (email, password, role = "customer", displayName = "") => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update display name if provided
  if (displayName) {
    await updateProfile(user, { displayName });
  }

  // Save user data to Firestore
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    displayName: displayName || email.split("@")[0],
    role: role,
    createdAt: new Date().toISOString(),
  });

  return userCredential;
};

/**
 * Login user with email and password
 */
export const loginUser = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

/**
 * Logout current user
 */
export const logoutUser = async () => {
  return await signOut(auth);
};

/**
 * Get user role from Firestore
 */
export const getUserRole = async (uid) => {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists()) {
    return userDoc.data().role;
  }
  return null;
};

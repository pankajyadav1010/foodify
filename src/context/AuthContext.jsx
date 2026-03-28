// AuthContext.jsx - Provides authentication state and methods to entire app
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// AuthProvider component - wraps the entire app
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register new user with email/password and store role in Firestore
  const register = async (email, password, role = "customer", displayName = "") => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store user data in Firestore "users" collection
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName || email.split("@")[0],
      role: role,
      createdAt: new Date().toISOString(),
    });

    // Set role immediately so redirect works
    setUserRole(role);

    return userCredential;
  };

  // Login existing user
  const login = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  // Logout user
  const logout = async () => {
    await signOut(auth);
    setUserRole(null);
  };

  // Fetch user role from Firestore
  const fetchUserRole = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        setUserRole(role);
        return role;
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
    return null;
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserRole(user.uid);
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    register,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

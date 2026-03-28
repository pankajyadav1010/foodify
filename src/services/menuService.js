// menuService.js - Firestore CRUD operations for menu items
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const MENU_COLLECTION = "menu";

/**
 * Add a new menu item to Firestore
 */
export const addMenuItem = async (itemData) => {
  const docRef = await addDoc(collection(db, MENU_COLLECTION), {
    ...itemData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Get all menu items from Firestore
 */
export const getMenuItems = async () => {
  const snapshot = await getDocs(collection(db, MENU_COLLECTION));
  const items = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  // Sort by createdAt descending on client side (avoids needing index)
  items.sort((a, b) => {
    const timeA = a.createdAt?.seconds || 0;
    const timeB = b.createdAt?.seconds || 0;
    return timeB - timeA;
  });

  return items;
};

/**
 * Update a menu item by ID
 */
export const updateMenuItem = async (id, updatedData) => {
  const itemRef = doc(db, MENU_COLLECTION, id);
  await updateDoc(itemRef, {
    ...updatedData,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete a menu item by ID
 */
export const deleteMenuItem = async (id) => {
  await deleteDoc(doc(db, MENU_COLLECTION, id));
};

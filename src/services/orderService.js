// orderService.js - Firestore CRUD operations for orders
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const ORDERS_COLLECTION = "orders";

/**
 * Place a new order in Firestore
 */
export const placeOrder = async (userId, items, total, userEmail) => {
  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
    userId,
    userEmail,
    items,
    total,
    status: "Pending",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Get orders for a specific user
 * NOTE: Using only where() without orderBy() to avoid needing a composite index.
 * Sorting is done client-side instead.
 */
export const getUserOrders = async (userId) => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    // Sort by createdAt descending (newest first) on client side
    orders.sort((a, b) => {
      const timeA = a.createdAt?.toDate?.() || a.createdAt?.seconds
        ? new Date(a.createdAt.seconds * 1000)
        : new Date(a.createdAt || 0);
      const timeB = b.createdAt?.toDate?.() || b.createdAt?.seconds
        ? new Date(b.createdAt.seconds * 1000)
        : new Date(b.createdAt || 0);
      return timeB - timeA;
    });

    return orders;
  } catch (error) {
    console.error("getUserOrders error:", error);
    // Fallback: fetch ALL orders and filter client-side
    try {
      const snapshot = await getDocs(collection(db, ORDERS_COLLECTION));
      const orders = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((order) => order.userId === userId);

      orders.sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds : 0;
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds : 0;
        return timeB - timeA;
      });

      return orders;
    } catch (fallbackError) {
      console.error("Fallback getUserOrders error:", fallbackError);
      return [];
    }
  }
};

/**
 * Get all orders (Admin only)
 */
export const getAllOrders = async () => {
  try {
    const snapshot = await getDocs(collection(db, ORDERS_COLLECTION));
    const orders = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    // Sort by createdAt descending on client side
    orders.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });

    return orders;
  } catch (error) {
    console.error("getAllOrders error:", error);
    return [];
  }
};

/**
 * Update order status (Admin only)
 */
export const updateOrderStatus = async (orderId, newStatus) => {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  await updateDoc(orderRef, {
    status: newStatus,
    updatedAt: serverTimestamp(),
  });
};

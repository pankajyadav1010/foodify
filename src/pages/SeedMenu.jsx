// SeedMenu.jsx - Utility page to seed menu items into Firestore
// Visit /seed-menu in browser to populate your menu collection
import React, { useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import SEED_ITEMS from "../data/menuData.json";

const SeedMenu = () => {
  const [seeding, setSeeding] = useState(false);
  const [results, setResults] = useState([]);
  const [existingCount, setExistingCount] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Check how many items already exist
  const checkExisting = async () => {
    try {
      const snapshot = await getDocs(collection(db, "menu"));
      setExistingCount(snapshot.size);
      return snapshot.size;
    } catch (err) {
      toast.error("Cannot read menu collection: " + err.message);
      return -1;
    }
  };

  // Seed menu items into Firestore
  const handleSeed = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to seed data!");
      return;
    }

    const existing = await checkExisting();
    if (existing > 0) {
      if (!window.confirm(`There are already ${existing} items in the menu. Do you want to add ${SEED_ITEMS.length} more items?`)) {
        return;
      }
    }

    setSeeding(true);
    setResults([]);
    const newResults = [];

    for (const item of SEED_ITEMS) {
      try {
        const { id, ...itemData } = item; // remove the local id, let Firestore generate one
        const docRef = await addDoc(collection(db, "menu"), {
          ...itemData,
          createdAt: serverTimestamp(),
        });
        newResults.push({ name: item.name, status: "✅ Added", id: docRef.id });
      } catch (err) {
        newResults.push({ name: item.name, status: "❌ Failed: " + err.message });
      }
      setResults([...newResults]);
    }

    setSeeding(false);
    const successCount = newResults.filter((r) => r.status.startsWith("✅")).length;
    if (successCount > 0) {
      toast.success(`${successCount} menu items added to Firestore! 🎉`);
    }
  };

  // Clear all menu items
  const handleClear = async () => {
    if (!window.confirm("Delete ALL menu items from Firestore? This cannot be undone.")) return;
    setSeeding(true);
    try {
      const snapshot = await getDocs(collection(db, "menu"));
      for (const d of snapshot.docs) {
        await deleteDoc(doc(db, "menu", d.id));
      }
      toast.success(`Deleted ${snapshot.size} items`);
      setExistingCount(0);
      setResults([]);
    } catch (err) {
      toast.error("Failed: " + err.message);
    }
    setSeeding(false);
  };

  return (
    <div style={{ background: "#0d1117", minHeight: "100vh", padding: "40px 0" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card border-0" style={{ background: "#161b22", borderRadius: "16px", padding: "32px" }}>
              <h3 className="text-white fw-bold mb-2">🌱 Seed Menu Data</h3>
              <p className="text-white-50 mb-1">
                This will add <strong className="text-white">{SEED_ITEMS.length} food items</strong> to your Firestore <code style={{ color: "#e94560" }}>menu</code> collection.
              </p>
              <p className="text-white-50 mb-4" style={{ fontSize: "0.85rem" }}>
                Categories: Indian, Chinese, Fast Food, South Indian, Beverages, Desserts
              </p>

              {!currentUser && (
                <div className="alert" style={{ background: "rgba(233,69,96,0.1)", border: "1px solid #e94560", color: "#e94560", borderRadius: "10px" }}>
                  ⚠️ You must be logged in to seed data. <a href="/login" style={{ color: "#e94560" }}>Login here</a>
                </div>
              )}

              <div className="d-flex gap-3 mb-4 flex-wrap">
                <button
                  className="btn fw-bold"
                  onClick={handleSeed}
                  disabled={seeding || !currentUser}
                  style={{ background: "#e94560", color: "white", border: "none", borderRadius: "10px", padding: "10px 24px" }}
                >
                  {seeding ? (
                    <><span className="spinner-border spinner-border-sm me-2" />Seeding...</>
                  ) : (
                    "🚀 Seed Menu Items"
                  )}
                </button>
                <button
                  className="btn"
                  onClick={checkExisting}
                  disabled={seeding}
                  style={{ border: "1px solid #30363d", color: "rgba(255,255,255,0.6)", background: "transparent", borderRadius: "10px" }}
                >
                  🔍 Check Existing
                </button>
                <button
                  className="btn"
                  onClick={handleClear}
                  disabled={seeding}
                  style={{ border: "1px solid #e94560", color: "#e94560", background: "transparent", borderRadius: "10px" }}
                >
                  🗑️ Clear All
                </button>
              </div>

              {existingCount !== null && (
                <div className="alert mb-3" style={{ background: "rgba(52,152,219,0.1)", border: "1px solid #3498db", color: "#3498db", borderRadius: "10px" }}>
                  📊 Current menu items in Firestore: <strong>{existingCount}</strong>
                </div>
              )}

              {/* Preview of items to be seeded */}
              <div className="mb-4">
                <h6 className="text-white-50 mb-3">Items to seed:</h6>
                <div className="d-flex flex-wrap gap-2">
                  {SEED_ITEMS.map((item) => (
                    <span
                      key={item.id}
                      className="badge"
                      style={{ background: "#1e2a3a", color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", padding: "6px 10px" }}
                    >
                      {item.name} — ₹{item.price}
                    </span>
                  ))}
                </div>
              </div>

              {/* Results */}
              {results.length > 0 && (
                <div>
                  <h6 className="text-white mb-3">
                    Seed Results: {results.filter(r => r.status.startsWith("✅")).length}/{SEED_ITEMS.length} successful
                  </h6>
                  <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {results.map((r, i) => (
                      <div key={i} className="d-flex justify-content-between py-2 px-3 mb-1 rounded" style={{ background: "#1e2a3a" }}>
                        <span className="text-white">{r.name}</span>
                        <span>{r.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 d-flex gap-3">
                <button className="btn" onClick={() => navigate("/")} style={{ border: "1px solid #30363d", color: "rgba(255,255,255,0.6)", borderRadius: "10px" }}>
                  ← Back to Home
                </button>
                <button className="btn" onClick={() => navigate("/admin")} style={{ border: "1px solid #e94560", color: "#e94560", borderRadius: "10px" }}>
                  Go to Admin →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeedMenu;

// Home.jsx - Main landing page with gradient accents and smooth animations
import React, { useEffect, useState, useCallback } from "react";
import { getMenuItems } from "../services/menuService";
import FoodCard from "../components/FoodCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { FiSearch, FiFilter } from "react-icons/fi";
import { MdRestaurantMenu } from "react-icons/md";
import DEMO_ITEMS from "../data/menuData.json";

const CATEGORIES = ["All", "Indian", "Chinese", "Fast Food", "South Indian", "Beverages", "Desserts"];

const Home = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [error, setError] = useState(null);

  // Fetch menu items from Firestore
  const fetchMenu = useCallback(async () => {
    setLoading(true);
    const timeoutId = setTimeout(() => {
      setMenuItems(DEMO_ITEMS);
      setFilteredItems(DEMO_ITEMS);
      setError("Menu is empty. Showing demo items. Add items via Admin Dashboard.");
      setLoading(false);
    }, 4000);

    try {
      const items = await getMenuItems();
      clearTimeout(timeoutId);
      const displayItems = items.length > 0 ? items : DEMO_ITEMS;
      if (items.length === 0) setError("Menu is empty. Showing demo items. Add items via Admin Dashboard.");
      setMenuItems(displayItems);
      setFilteredItems(displayItems);
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("Error fetching menu:", err);
      setError("Could not load menu. Showing demo items.");
      setMenuItems(DEMO_ITEMS);
      setFilteredItems(DEMO_ITEMS);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Filter
  useEffect(() => {
    let result = menuItems;
    if (activeCategory !== "All") {
      result = result.filter((item) => item.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }
    setFilteredItems(result);
  }, [searchQuery, activeCategory, menuItems]);

  if (loading) return <LoadingSpinner message="Loading delicious food..." />;

  return (
    <div style={{ background: "#0d1117", minHeight: "100vh" }}>
      {/* Hero Banner with gradient glow */}
      <div className="hero-section" style={{ padding: "60px 0 40px" }}>
        <div className="container text-center" style={{ position: "relative", zIndex: 1 }}>
          <MdRestaurantMenu size={60} className="gradient-text" style={{ WebkitTextFillColor: "unset", color: "#ef4444", marginBottom: "16px" }} />
          <h1
            className="display-4 fw-bold text-white mb-3"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Discover <span className="gradient-text">Delicious</span> Food
          </h1>
          <p className="lead text-white-50 mb-4">
            Order your favorite meals and get them delivered fast 🚀
          </p>

          {/* Enhanced search bar */}
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="input-group search-bar">
                <span className="input-group-text border-0" style={{ background: "#1e2a3a", color: "#ef4444" }}>
                  <FiSearch size={20} />
                </span>
                <input
                  id="search-input"
                  type="text"
                  className="form-control border-0"
                  placeholder="Search paneer, biryani, burger, dosa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ background: "#1e2a3a", color: "white", padding: "14px 16px", fontSize: "1rem" }}
                />
                {searchQuery && (
                  <button
                    className="btn border-0"
                    onClick={() => setSearchQuery("")}
                    style={{ background: "#1e2a3a", color: "#ef4444" }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter with gradient active pill */}
      <div style={{ background: "#161b22", padding: "16px 0", borderBottom: "1px solid #21262d" }}>
        <div className="container">
          <div className="d-flex align-items-center gap-2 overflow-auto pb-1" style={{ scrollbarWidth: "none" }}>
            <FiFilter size={16} style={{ color: "#ef4444", flexShrink: 0 }} />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                id={`category-${cat.toLowerCase().replace(/\s/g, "-")}`}
                className={`btn btn-sm category-pill ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="container py-4">
        {error && (
          <div className="alert mb-4" style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.3)", color: "#f97316", borderRadius: "12px" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Results count */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="text-white-50 mb-0" style={{ fontWeight: 400 }}>
            {activeCategory !== "All" ? `${activeCategory} ` : ""}
            <span className="gradient-text fw-bold">{filteredItems.length}</span>{" "}
            <span className="text-white-50">items found</span>
          </h5>
          {(searchQuery || activeCategory !== "All") && (
            <button
              className="btn btn-sm btn-gradient-outline"
              onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
              style={{ padding: "4px 16px", fontSize: "0.8rem" }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Food Cards Grid */}
        {filteredItems.length > 0 ? (
          <div className="row">
            {filteredItems.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <div style={{ fontSize: "4rem" }}>🍽️</div>
            <h4 className="text-white mt-3">No items found</h4>
            <p className="text-white-50">Try a different search term or category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

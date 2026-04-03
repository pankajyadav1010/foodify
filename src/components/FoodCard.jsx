// FoodCard.jsx - Food item card with gradient accents and hover animations
import React from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiShoppingCart, FiStar } from "react-icons/fi";
import { toast } from "react-hot-toast";

const FoodCard = ({ item }) => {
  const { addToCart } = useCart();
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  const rating = item.rating || (3.5 + Math.random() * 1.5).toFixed(1);

  const handleAddToCart = () => {
    if (!currentUser) {
      toast.error("Please login to add items to cart!");
      navigate("/login");
      return;
    }
    addToCart(item);
  };

  // Category color map
  const categoryColors = {
    Indian: "#ef4444",
    Chinese: "#f97316",
    "Fast Food": "#eab308",
    "South Indian": "#22c55e",
    Beverages: "#3b82f6",
    Desserts: "#a855f7",
    default: "#ef4444",
  };

  const categoryColor = categoryColors[item.category] || categoryColors.default;

  return (
    <div className="col-12 col-sm-6 col-md-4 col-xl-3 mb-4">
      <div
        className="card h-100 border-0 food-card fade-in-up"
        style={{
          borderRadius: "16px",
          overflow: "hidden",
          background: "#161b22",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          cursor: "pointer",
        }}
      >
        {/* Food Image */}
        <div style={{ position: "relative", height: "180px", overflow: "hidden" }}>
          <img
            src={item.image || `https://source.unsplash.com/400x300/?${item.name},food`}
            alt={item.name}
            className="card-img-top food-card-img"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/400x300/1e2a3a/ef4444?text=${encodeURIComponent(item.name)}`;
            }}
          />
          {/* Gradient overlay at bottom of image */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "50px",
              background: "linear-gradient(transparent, #161b22)",
            }}
          />
          {/* Category badge */}
          <span
            className="badge position-absolute top-0 end-0 m-2"
            style={{
              background: categoryColor,
              fontSize: "0.7rem",
              padding: "5px 12px",
              borderRadius: "20px",
              boxShadow: `0 2px 10px ${categoryColor}40`,
            }}
          >
            {item.category}
          </span>
        </div>

        {/* Card Body */}
        <div className="card-body d-flex flex-column" style={{ padding: "16px" }}>
          <h5 className="card-title mb-1 text-white fw-bold" style={{ fontSize: "1rem" }}>
            {item.name}
          </h5>

          {/* Rating */}
          <div className="d-flex align-items-center mb-2">
            <FiStar size={13} style={{ color: "#f59e0b", fill: "#f59e0b" }} />
            <span className="ms-1 text-white-50" style={{ fontSize: "0.8rem" }}>{rating}</span>
          </div>

          {/* Description */}
          {item.description && (
            <p className="card-text text-white-50 mb-2" style={{ fontSize: "0.78rem", lineHeight: "1.4" }}>
              {item.description.length > 65 ? item.description.substring(0, 65) + "..." : item.description}
            </p>
          )}

          <div className="mt-auto d-flex justify-content-between align-items-center">
            {/* Gradient price */}
            <span className="price-tag" style={{ fontSize: "1.25rem" }}>
              ₹{parseFloat(item.price).toFixed(0)}
            </span>

            {userRole !== "admin" && (
              <button
                id={`add-cart-${item.id}`}
                className="btn btn-sm btn-gradient d-flex align-items-center gap-1"
                onClick={handleAddToCart}
                style={{
                  borderRadius: "20px",
                  padding: "6px 14px",
                  fontSize: "0.8rem",
                  boxShadow: "0 3px 12px rgba(239,68,68,0.25)",
                }}
              >
                <FiShoppingCart size={14} style={{ position: "relative", zIndex: 1 }} />
                <span style={{ position: "relative", zIndex: 1 }}>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;

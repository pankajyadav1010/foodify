// FoodCard.jsx - Displays individual food item with add to cart button
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

  // Generate a random rating for display
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
    Indian: "#e94560",
    Chinese: "#f39c12",
    "Fast Food": "#e67e22",
    "South Indian": "#27ae60",
    Beverages: "#3498db",
    Desserts: "#9b59b6",
    default: "#e94560",
  };

  const categoryColor = categoryColors[item.category] || categoryColors.default;

  return (
    <div className="col-12 col-sm-6 col-md-4 col-xl-3 mb-4">
      <div
        className="card h-100 border-0 food-card"
        style={{
          borderRadius: "16px",
          overflow: "hidden",
          background: "#1e2a3a",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          transition: "all 0.3s ease",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-8px)";
          e.currentTarget.style.boxShadow = "0 12px 40px rgba(233,69,96,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)";
        }}
      >
        {/* Food Image */}
        <div style={{ position: "relative", height: "180px", overflow: "hidden" }}>
          <img
            src={item.image || `https://source.unsplash.com/400x300/?${item.name},food`}
            alt={item.name}
            className="card-img-top"
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/400x300/1e2a3a/e94560?text=${encodeURIComponent(item.name)}`;
            }}
          />
          {/* Category badge */}
          <span
            className="badge position-absolute top-0 end-0 m-2"
            style={{ background: categoryColor, fontSize: "0.7rem", padding: "5px 10px", borderRadius: "20px" }}
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
            <FiStar size={13} style={{ color: "#f1c40f", fill: "#f1c40f" }} />
            <span className="ms-1 text-white-50" style={{ fontSize: "0.8rem" }}>{rating}</span>
          </div>

          {/* Description */}
          {item.description && (
            <p className="card-text text-white-50 mb-2" style={{ fontSize: "0.8rem", lineHeight: "1.4" }}>
              {item.description.length > 60 ? item.description.substring(0, 60) + "..." : item.description}
            </p>
          )}

          <div className="mt-auto d-flex justify-content-between align-items-center">
            <span className="fw-bold" style={{ color: "#e94560", fontSize: "1.2rem" }}>
              ₹{parseFloat(item.price).toFixed(2)}
            </span>

            {userRole !== "admin" && (
              <button
                id={`add-cart-${item.id}`}
                className="btn btn-sm d-flex align-items-center gap-1"
                onClick={handleAddToCart}
                style={{
                  background: "linear-gradient(135deg, #e94560, #c0392b)",
                  color: "white",
                  border: "none",
                  borderRadius: "20px",
                  padding: "6px 14px",
                  fontSize: "0.8rem",
                  transition: "all 0.2s",
                }}
              >
                <FiShoppingCart size={14} />
                Add
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;

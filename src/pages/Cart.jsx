// Cart.jsx - Shopping cart with gradient accents and hover animations
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { FiTrash2, FiPlus, FiMinus, FiShoppingCart, FiArrowRight } from "react-icons/fi";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotal, getItemCount, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [clearConfirm, setClearConfirm] = useState(false);

  const handleClearCart = () => {
    if (clearConfirm) {
      clearCart();
      setClearConfirm(false);
    } else {
      setClearConfirm(true);
      setTimeout(() => setClearConfirm(false), 3000);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center text-center"
        style={{ minHeight: "80vh", background: "#0d1117" }}
      >
        <div style={{ fontSize: "5rem", marginBottom: "20px" }}>🛒</div>
        <h3 className="text-white mb-3">Your cart is empty</h3>
        <p className="text-white-50 mb-4">Add some delicious items from our menu!</p>
        <Link to="/" className="btn btn-gradient" style={{ textDecoration: "none" }}>
          <span style={{ position: "relative", zIndex: 1 }}>Browse Menu 🍕</span>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: "#0d1117", minHeight: "100vh", padding: "30px 0" }}>
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-white fw-bold mb-0" style={{ fontFamily: "'Poppins', sans-serif" }}>
            🛒 Your <span className="gradient-text">Cart</span>
            <span className="badge ms-2" style={{ background: "linear-gradient(to right, #ef4444, #f97316)", fontSize: "0.7rem", verticalAlign: "middle" }}>
              {getItemCount()} items
            </span>
          </h2>
          <button
            className="btn btn-sm"
            onClick={handleClearCart}
            style={{
              border: `1px solid ${clearConfirm ? "#ef4444" : "#30363d"}`,
              color: clearConfirm ? "#ef4444" : "rgba(255,255,255,0.5)",
              background: clearConfirm ? "rgba(239,68,68,0.08)" : "transparent",
              borderRadius: "8px",
              transition: "all 0.25s ease",
            }}
          >
            {clearConfirm ? "⚠️ Confirm Clear?" : "Clear All"}
          </button>
        </div>

        <div className="row g-4">
          {/* Cart Items */}
          <div className="col-lg-8">
            <div
              className="card border-0"
              style={{ background: "#161b22", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(239,68,68,0.05)" }}
            >
              {cartItems.map((item, index) => (
                <div
                  key={item.id}
                  className="d-flex align-items-center p-3 gap-3 fade-in-up"
                  style={{
                    borderBottom: index < cartItems.length - 1 ? "1px solid #21262d" : "none",
                    transition: "background 0.25s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Item Image */}
                  <img
                    src={item.image || `https://via.placeholder.com/80x80/1e2a3a/ef4444?text=${encodeURIComponent(item.name[0])}`}
                    alt={item.name}
                    style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "12px", flexShrink: 0 }}
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/80x80/1e2a3a/ef4444?text=${encodeURIComponent(item.name[0])}`;
                    }}
                  />

                  {/* Item Info */}
                  <div className="flex-grow-1 min-width-0">
                    <h6 className="text-white mb-1 fw-bold text-truncate">{item.name}</h6>
                    <span
                      className="badge"
                      style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", fontSize: "0.7rem" }}
                    >
                      {item.category}
                    </span>
                    <div className="price-tag mt-1" style={{ fontSize: "0.95rem" }}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-sm p-1"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{ background: "#1e2a3a", color: "white", border: "1px solid #30363d", borderRadius: "8px", width: "32px", height: "32px", transition: "all 0.2s" }}
                    >
                      <FiMinus size={14} />
                    </button>
                    <span className="text-white fw-bold" style={{ minWidth: "24px", textAlign: "center" }}>
                      {item.quantity}
                    </span>
                    <button
                      className="btn btn-sm p-1"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{ background: "linear-gradient(to right, #ef4444, #f97316)", color: "white", border: "none", borderRadius: "8px", width: "32px", height: "32px", transition: "all 0.2s" }}
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>

                  {/* Delete */}
                  <button
                    className="btn btn-sm btn-icon btn-delete ms-2"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <Link
              to="/"
              className="btn btn-gradient-outline mt-3"
              style={{ textDecoration: "none", padding: "8px 20px", fontSize: "0.9rem" }}
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Order Summary Sidebar */}
          <div className="col-lg-4">
            <div
              className="card border-0 sticky-top"
              style={{ background: "#161b22", borderRadius: "16px", padding: "24px", top: "80px", border: "1px solid rgba(239,68,68,0.05)" }}
            >
              <h5 className="text-white fw-bold mb-4">Order <span className="gradient-text">Summary</span></h5>

              {/* Item breakdown */}
              <div className="mb-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="d-flex justify-content-between mb-2">
                    <span className="text-white-50" style={{ fontSize: "0.85rem" }}>
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-white" style={{ fontSize: "0.85rem" }}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="gradient-divider" style={{ margin: "16px 0" }} />

              {/* Pricing */}
              <div className="d-flex justify-content-between mb-2">
                <span className="text-white-50">Subtotal</span>
                <span className="text-white">₹{getTotal().toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-white-50">Delivery Fee</span>
                <span style={{ color: "#22c55e" }}>FREE</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-white-50">GST (5%)</span>
                <span className="text-white">₹{(getTotal() * 0.05).toFixed(2)}</span>
              </div>

              <div className="gradient-divider" style={{ margin: "16px 0" }} />

              <div className="d-flex justify-content-between mb-4">
                <span className="text-white fw-bold" style={{ fontSize: "1.1rem" }}>Total</span>
                <span className="price-tag" style={{ fontSize: "1.4rem" }}>
                  ₹{(getTotal() * 1.05).toFixed(2)}
                </span>
              </div>

              <button
                id="proceed-checkout-btn"
                className="btn w-100 fw-bold btn-gradient d-flex align-items-center justify-content-center gap-2"
                onClick={() => navigate("/checkout")}
                style={{ padding: "14px", fontSize: "1rem" }}
              >
                <span style={{ position: "relative", zIndex: 1 }}>Proceed to Checkout</span>
                <FiArrowRight style={{ position: "relative", zIndex: 1 }} />
              </button>

              <p className="text-center text-white-50 mt-3 mb-0" style={{ fontSize: "0.75rem" }}>
                🔒 Secure Checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

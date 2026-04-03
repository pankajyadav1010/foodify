// Navbar.jsx - Main navigation bar with gradient accents and animations
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";
import { FiShoppingCart, FiLogOut, FiUser, FiMenu, FiX } from "react-icons/fi";
import { MdRestaurantMenu } from "react-icons/md";

const Navbar = () => {
  const { currentUser, userRole, logout } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark sticky-top"
      style={{
        background: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1a1a2e 100%)",
        boxShadow: "0 4px 30px rgba(0,0,0,0.4)",
        borderBottom: "1px solid rgba(239,68,68,0.1)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="container">
        {/* Brand with gradient */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <MdRestaurantMenu size={30} className="gradient-text" style={{ WebkitTextFillColor: "unset", color: "#ef4444" }} />
          <span className="navbar-brand-gradient">
            Food<span>ify</span>
          </span>
        </Link>

        {/* Mobile toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {/* Nav links */}
        <div className={`collapse navbar-collapse ${mobileOpen ? "show" : ""}`} id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-3">
            <li className="nav-item">
              <Link
                className={`nav-link nav-link-animated ${isActive("/") ? "active fw-bold" : ""}`}
                to="/"
                onClick={() => setMobileOpen(false)}
                style={{ color: isActive("/") ? "white" : "rgba(255,255,255,0.7)" }}
              >
                🏠 Home
              </Link>
            </li>

            {currentUser && userRole !== "admin" && (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link nav-link-animated ${isActive("/cart") ? "active fw-bold" : ""}`}
                    to="/cart"
                    onClick={() => setMobileOpen(false)}
                    style={{ color: isActive("/cart") ? "white" : "rgba(255,255,255,0.7)" }}
                  >
                    🛒 Cart
                    {getItemCount() > 0 && (
                      <span className="badge ms-1 rounded-pill" style={{ background: "linear-gradient(to right, #ef4444, #f97316)", fontSize: "0.7rem" }}>
                        {getItemCount()}
                      </span>
                    )}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link nav-link-animated ${isActive("/orders") ? "active fw-bold" : ""}`}
                    to="/orders"
                    onClick={() => setMobileOpen(false)}
                    style={{ color: isActive("/orders") ? "white" : "rgba(255,255,255,0.7)" }}
                  >
                    📦 My Orders
                  </Link>
                </li>
              </>
            )}

            {currentUser && userRole === "admin" && (
              <li className="nav-item">
                <Link
                  className={`nav-link nav-link-animated ${isActive("/admin") ? "active fw-bold" : ""}`}
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  style={{ color: isActive("/admin") ? "white" : "rgba(255,255,255,0.7)" }}
                >
                  ⚙️ Admin Panel
                </Link>
              </li>
            )}
          </ul>

          {/* Auth section */}
          <div className="d-flex align-items-center gap-3">
            {currentUser ? (
              <>
                <span className="text-white-50 d-none d-lg-flex align-items-center gap-1" style={{ fontSize: "0.85rem" }}>
                  <FiUser className="me-1" />
                  {currentUser.email?.split("@")[0]}
                  {userRole === "admin" && (
                    <span className="badge ms-2" style={{ background: "linear-gradient(to right, #ef4444, #f97316)", fontSize: "0.6rem", padding: "3px 8px" }}>ADMIN</span>
                  )}
                </span>

                {/* Cart icon for mobile */}
                {userRole !== "admin" && (
                  <Link to="/cart" className="position-relative d-lg-none text-white" onClick={() => setMobileOpen(false)}>
                    <FiShoppingCart size={22} />
                    {getItemCount() > 0 && (
                      <span className="cart-badge">{getItemCount()}</span>
                    )}
                  </Link>
                )}

                <button
                  id="logout-btn"
                  className="btn btn-sm btn-gradient d-flex align-items-center gap-1"
                  onClick={handleLogout}
                  style={{ padding: "6px 16px", fontSize: "0.85rem" }}
                >
                  <FiLogOut size={16} style={{ position: "relative", zIndex: 1 }} />
                  <span className="d-none d-sm-inline" style={{ position: "relative", zIndex: 1 }}>Logout</span>
                </button>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Link
                  to="/login"
                  className="btn btn-sm btn-gradient-outline"
                  onClick={() => setMobileOpen(false)}
                  style={{ padding: "6px 16px", fontSize: "0.85rem" }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-sm btn-gradient"
                  onClick={() => setMobileOpen(false)}
                  style={{ padding: "6px 16px", fontSize: "0.85rem" }}
                >
                  <span style={{ position: "relative", zIndex: 1 }}>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

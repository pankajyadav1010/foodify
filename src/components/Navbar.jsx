// Navbar.jsx - Main navigation bar with cart count and auth state
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
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <MdRestaurantMenu size={30} style={{ color: "#e94560" }} />
          <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "1.5rem" }}>
            Food<span style={{ color: "#e94560" }}>ify</span>
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
                className={`nav-link ${isActive("/") ? "active fw-bold" : ""}`}
                to="/"
                onClick={() => setMobileOpen(false)}
                style={{ color: isActive("/") ? "#e94560" : "rgba(255,255,255,0.85)" }}
              >
                🏠 Home
              </Link>
            </li>

            {currentUser && userRole !== "admin" && (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/cart") ? "active fw-bold" : ""}`}
                    to="/cart"
                    onClick={() => setMobileOpen(false)}
                    style={{ color: isActive("/cart") ? "#e94560" : "rgba(255,255,255,0.85)" }}
                  >
                    🛒 Cart
                    {getItemCount() > 0 && (
                      <span className="badge ms-1 rounded-pill" style={{ background: "#e94560", fontSize: "0.7rem" }}>
                        {getItemCount()}
                      </span>
                    )}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/orders") ? "active fw-bold" : ""}`}
                    to="/orders"
                    onClick={() => setMobileOpen(false)}
                    style={{ color: isActive("/orders") ? "#e94560" : "rgba(255,255,255,0.85)" }}
                  >
                    📦 My Orders
                  </Link>
                </li>
              </>
            )}

            {currentUser && userRole === "admin" && (
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/admin") ? "active fw-bold" : ""}`}
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  style={{ color: isActive("/admin") ? "#e94560" : "rgba(255,255,255,0.85)" }}
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
                <span className="text-white-50 d-none d-lg-block" style={{ fontSize: "0.85rem" }}>
                  <FiUser className="me-1" />
                  {currentUser.email?.split("@")[0]}
                  {userRole === "admin" && (
                    <span className="badge ms-2" style={{ background: "#e94560", fontSize: "0.65rem" }}>ADMIN</span>
                  )}
                </span>

                {/* Cart icon for mobile */}
                {userRole !== "admin" && (
                  <Link to="/cart" className="position-relative d-lg-none text-white" onClick={() => setMobileOpen(false)}>
                    <FiShoppingCart size={22} />
                    {getItemCount() > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" style={{ background: "#e94560", fontSize: "0.6rem" }}>
                        {getItemCount()}
                      </span>
                    )}
                  </Link>
                )}

                <button
                  id="logout-btn"
                  className="btn btn-sm d-flex align-items-center gap-1"
                  onClick={handleLogout}
                  style={{ background: "#e94560", color: "white", border: "none", borderRadius: "8px", padding: "6px 16px" }}
                >
                  <FiLogOut size={16} />
                  <span className="d-none d-sm-inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Link
                  to="/login"
                  className="btn btn-sm"
                  onClick={() => setMobileOpen(false)}
                  style={{ border: "1px solid #e94560", color: "#e94560", borderRadius: "8px", padding: "6px 16px" }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-sm"
                  onClick={() => setMobileOpen(false)}
                  style={{ background: "#e94560", color: "white", border: "none", borderRadius: "8px", padding: "6px 16px" }}
                >
                  Register
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

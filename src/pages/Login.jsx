// Login.jsx - Firebase Email/Password login page
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { MdRestaurantMenu } from "react-icons/md";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, userRole, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Validate form fields
  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back! 🎉");

      // Redirect to intended page or role-based default
      const from = location.state?.from || "/";
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      // Map Firebase error codes to friendly messages
      const errorMessages = {
        "auth/user-not-found": "No account found with this email. Please register first.",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/invalid-credential": "Invalid credentials. Please check your email and password.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/invalid-email": "Please enter a valid email address.",
      };
      const message = errorMessages[error.code] || "Login failed. Please try again.";
      toast.error(message);
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  // Quick demo login for testing
  const fillDemoCustomer = () => {
    setEmail("customer@demo.com");
    setPassword("demo123456");
  };

  const fillDemoAdmin = () => {
    setEmail("admin@demo.com");
    setPassword("admin123456");
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0d1117 0%, #1a1a2e 50%, #16213e 100%)" }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-8 col-md-6 col-lg-4">
            {/* Logo */}
            <div className="text-center mb-4">
              <MdRestaurantMenu size={50} style={{ color: "#e94560" }} />
              <h2 className="text-white fw-bold mt-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Food<span style={{ color: "#e94560" }}>ify</span>
              </h2>
              <p className="text-white-50">Sign in to your account</p>
            </div>

            {/* Login Card */}
            <div
              className="card border-0"
              style={{ background: "#161b22", borderRadius: "20px", padding: "32px", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}
            >
              {errors.general && (
                <div className="alert mb-3" style={{ background: "rgba(233,69,96,0.1)", border: "1px solid #e94560", color: "#e94560", borderRadius: "10px", fontSize: "0.85rem" }}>
                  ⚠️ {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Email */}
                <div className="mb-3">
                  <label className="form-label text-white-50" style={{ fontSize: "0.85rem" }}>
                    Email Address
                  </label>
                  <div className="input-group">
                    <span className="input-group-text border-0" style={{ background: "#1e2a3a", color: "#e94560" }}>
                      <FiMail />
                    </span>
                    <input
                      id="login-email"
                      type="email"
                      className={`form-control border-0 ${errors.email ? "is-invalid" : ""}`}
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                      style={{ background: "#1e2a3a", color: "white" }}
                      autoComplete="email"
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label className="form-label text-white-50" style={{ fontSize: "0.85rem" }}>
                    Password
                  </label>
                  <div className="input-group">
                    <span className="input-group-text border-0" style={{ background: "#1e2a3a", color: "#e94560" }}>
                      <FiLock />
                    </span>
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      className={`form-control border-0 ${errors.password ? "is-invalid" : ""}`}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
                      style={{ background: "#1e2a3a", color: "white" }}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="input-group-text border-0"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ background: "#1e2a3a", color: "#6b7280", cursor: "pointer" }}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>
                </div>

                {/* Submit */}
                <button
                  id="login-submit-btn"
                  type="submit"
                  className="btn w-100 fw-bold"
                  disabled={loading}
                  style={{
                    background: loading ? "#6b7280" : "linear-gradient(135deg, #e94560, #c0392b)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px",
                    fontSize: "1rem",
                    transition: "all 0.2s",
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In 🔐"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="d-flex align-items-center my-4">
                <div className="flex-grow-1" style={{ height: "1px", background: "#30363d" }} />
                <span className="mx-3 text-white-50" style={{ fontSize: "0.8rem" }}>OR TRY DEMO</span>
                <div className="flex-grow-1" style={{ height: "1px", background: "#30363d" }} />
              </div>

              {/* Demo buttons */}
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm flex-fill"
                  onClick={fillDemoCustomer}
                  style={{ border: "1px solid #30363d", color: "rgba(255,255,255,0.6)", background: "transparent", borderRadius: "8px", fontSize: "0.8rem" }}
                >
                  👤 Customer Demo
                </button>
                <button
                  className="btn btn-sm flex-fill"
                  onClick={fillDemoAdmin}
                  style={{ border: "1px solid #30363d", color: "rgba(255,255,255,0.6)", background: "transparent", borderRadius: "8px", fontSize: "0.8rem" }}
                >
                  ⚙️ Admin Demo
                </button>
              </div>

              <p className="text-center text-white-50 mt-4 mb-0" style={{ fontSize: "0.9rem" }}>
                Don't have an account?{" "}
                <Link to="/register" style={{ color: "#e94560", textDecoration: "none", fontWeight: 600 }}>
                  Register now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

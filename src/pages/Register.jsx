// Register.jsx - User registration page with role selection
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import { MdRestaurantMenu } from "react-icons/md";

const Register = () => {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validate all fields
  const validate = () => {
    const newErrors = {};
    if (!formData.displayName.trim()) newErrors.displayName = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register(formData.email, formData.password, formData.role, formData.displayName);
      toast.success("Account created successfully! 🎉");
      // Redirect based on role
      navigate(formData.role === "admin" ? "/admin" : "/");
    } catch (error) {
      console.error("Register error:", error);
      const errorMessages = {
        "auth/email-already-in-use": "An account with this email already exists.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/weak-password": "Password is too weak. Use at least 6 characters.",
      };
      const message = errorMessages[error.code] || "Registration failed. Please try again.";
      toast.error(message);
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center py-5"
      style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0d1117 0%, #1a1a2e 50%, #16213e 100%)" }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-8 col-md-6 col-lg-5">
            {/* Logo */}
            <div className="text-center mb-4">
              <MdRestaurantMenu size={50} style={{ color: "#e94560" }} />
              <h2 className="text-white fw-bold mt-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Join <span style={{ color: "#e94560" }}>Foodify</span>
              </h2>
              <p className="text-white-50">Create your account to get started</p>
            </div>

            {/* Register Card */}
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
                {/* Name */}
                <div className="mb-3">
                  <label className="form-label text-white-50" style={{ fontSize: "0.85rem" }}>Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text border-0" style={{ background: "#1e2a3a", color: "#e94560" }}>
                      <FiUser />
                    </span>
                    <input
                      id="register-name"
                      type="text"
                      name="displayName"
                      className={`form-control border-0 ${errors.displayName ? "is-invalid" : ""}`}
                      placeholder="Your full name"
                      value={formData.displayName}
                      onChange={handleChange}
                      style={{ background: "#1e2a3a", color: "white" }}
                    />
                    {errors.displayName && <div className="invalid-feedback">{errors.displayName}</div>}
                  </div>
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label text-white-50" style={{ fontSize: "0.85rem" }}>Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text border-0" style={{ background: "#1e2a3a", color: "#e94560" }}>
                      <FiMail />
                    </span>
                    <input
                      id="register-email"
                      type="email"
                      name="email"
                      className={`form-control border-0 ${errors.email ? "is-invalid" : ""}`}
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      style={{ background: "#1e2a3a", color: "white" }}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                </div>

                {/* Password */}
                <div className="mb-3">
                  <label className="form-label text-white-50" style={{ fontSize: "0.85rem" }}>Password</label>
                  <div className="input-group">
                    <span className="input-group-text border-0" style={{ background: "#1e2a3a", color: "#e94560" }}>
                      <FiLock />
                    </span>
                    <input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className={`form-control border-0 ${errors.password ? "is-invalid" : ""}`}
                      placeholder="Min. 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      style={{ background: "#1e2a3a", color: "white" }}
                    />
                    <button
                      type="button"
                      className="input-group-text border-0"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ background: "#1e2a3a", color: "#6b7280" }}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="mb-3">
                  <label className="form-label text-white-50" style={{ fontSize: "0.85rem" }}>Confirm Password</label>
                  <div className="input-group">
                    <span className="input-group-text border-0" style={{ background: "#1e2a3a", color: "#e94560" }}>
                      <FiLock />
                    </span>
                    <input
                      id="register-confirm-password"
                      type="password"
                      name="confirmPassword"
                      className={`form-control border-0 ${errors.confirmPassword ? "is-invalid" : ""}`}
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      style={{ background: "#1e2a3a", color: "white" }}
                    />
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                  </div>
                </div>

                {/* Role Selection */}
                <div className="mb-4">
                  <label className="form-label text-white-50" style={{ fontSize: "0.85rem" }}>Register As</label>
                  <div className="d-flex gap-3">
                    <div
                      className="flex-fill text-center p-3 rounded-3"
                      onClick={() => setFormData((p) => ({ ...p, role: "customer" }))}
                      style={{
                        background: formData.role === "customer" ? "rgba(233,69,96,0.15)" : "#1e2a3a",
                        border: formData.role === "customer" ? "1px solid #e94560" : "1px solid #30363d",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ fontSize: "1.5rem" }}>👤</div>
                      <div className="text-white" style={{ fontSize: "0.85rem", fontWeight: formData.role === "customer" ? 600 : 400 }}>Customer</div>
                    </div>
                    <div
                      className="flex-fill text-center p-3 rounded-3"
                      onClick={() => setFormData((p) => ({ ...p, role: "admin" }))}
                      style={{
                        background: formData.role === "admin" ? "rgba(233,69,96,0.15)" : "#1e2a3a",
                        border: formData.role === "admin" ? "1px solid #e94560" : "1px solid #30363d",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ fontSize: "1.5rem" }}>⚙️</div>
                      <div className="text-white" style={{ fontSize: "0.85rem", fontWeight: formData.role === "admin" ? 600 : 400 }}>Restaurant Admin</div>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <button
                  id="register-submit-btn"
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
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account 🎉"
                  )}
                </button>
              </form>

              <p className="text-center text-white-50 mt-4 mb-0" style={{ fontSize: "0.9rem" }}>
                Already have an account?{" "}
                <Link to="/login" style={{ color: "#e94560", textDecoration: "none", fontWeight: 600 }}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

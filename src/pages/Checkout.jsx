// Checkout.jsx - Order summary and mock payment page
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { placeOrder } from "../services/orderService";
import { toast } from "react-hot-toast";
import { FiCreditCard, FiSmartphone, FiDollarSign, FiCheck } from "react-icons/fi";

const PAYMENT_METHODS = [
  { id: "card", label: "Credit / Debit Card", icon: <FiCreditCard />, description: "Visa, Mastercard, RuPay" },
  { id: "upi", label: "UPI Payment", icon: <FiSmartphone />, description: "GPay, PhonePe, Paytm" },
  { id: "cod", label: "Cash on Delivery", icon: <FiDollarSign />, description: "Pay when delivered" },
];

const Checkout = () => {
  const { cartItems, getTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    pincode: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = getTotal();
  const gst = subtotal * 0.05;
  const grandTotal = subtotal + gst;

  // Validate delivery address
  const validateAddress = () => {
    const newErrors = {};
    if (!address.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!address.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(address.phone.replace(/\s/g, ""))) newErrors.phone = "Enter valid 10-digit number";
    if (!address.street.trim()) newErrors.street = "Street address is required";
    if (!address.city.trim()) newErrors.city = "City is required";
    if (!address.pincode.trim()) newErrors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(address.pincode)) newErrors.pincode = "Enter valid 6-digit pincode";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) {
      toast.error("Please fill in all delivery details");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      navigate("/");
      return;
    }

    setLoading(true);
    try {
      // Prepare order items
      const orderItems = cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || "",
        category: item.category,
      }));

      // Save order to Firestore
      const orderId = await placeOrder(
        currentUser.uid,
        orderItems,
        grandTotal.toFixed(2),
        currentUser.email
      );

      // Clear cart and show success
      clearCart();
      setOrderPlaced(true);
      toast.success("Order placed successfully! 🎉");

      // Redirect after 3 seconds
      setTimeout(() => navigate("/orders"), 3000);
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (orderPlaced) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center text-center"
        style={{ minHeight: "100vh", background: "#0d1117" }}
      >
        <div
          className="rounded-circle d-flex align-items-center justify-content-center mb-4"
          style={{ width: "100px", height: "100px", background: "rgba(34,197,94,0.15)", border: "3px solid #22c55e" }}
        >
          <FiCheck size={50} style={{ color: "#22c55e" }} />
        </div>
        <h2 className="text-white fw-bold mb-3">Order <span className="gradient-text">Placed!</span> 🎉</h2>
        <p className="text-white-50 mb-4">Your delicious food is being prepared. You'll be redirected to your orders...</p>
        <div className="spinner-border" style={{ color: "#ef4444" }} role="status" />
      </div>
    );
  }

  return (
    <div style={{ background: "#0d1117", minHeight: "100vh", padding: "30px 0" }}>
      <div className="container">
        <h2 className="text-white fw-bold mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
          🧱 <span className="gradient-text">Checkout</span>
        </h2>

        <div className="row g-4">
          {/* Left: Delivery + Payment */}
          <div className="col-lg-7">
            {/* Delivery Address */}
            <div
              className="card border-0 mb-4"
              style={{ background: "#161b22", borderRadius: "16px", padding: "24px", border: "1px solid rgba(239,68,68,0.05)" }}
            >
              <h5 className="text-white fw-bold mb-4">📍 Delivery <span className="gradient-text">Address</span></h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label text-white-50" style={{ fontSize: "0.85rem" }}>Full Name *</label>
                  <input
                    id="checkout-name"
                    type="text"
                    className={`form-control border-0 ${errors.fullName ? "is-invalid" : ""}`}
                    placeholder="John Doe"
                    value={address.fullName}
                    onChange={(e) => { setAddress((p) => ({ ...p, fullName: e.target.value })); setErrors((p) => ({ ...p, fullName: "" })); }}
                    style={{ background: "#1e2a3a", color: "white", borderRadius: "8px" }}
                  />
                  {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label text-white-50" style={{ fontSize: "0.85rem" }}>Phone Number *</label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    className={`form-control border-0 ${errors.phone ? "is-invalid" : ""}`}
                    placeholder="10-digit number"
                    value={address.phone}
                    onChange={(e) => { setAddress((p) => ({ ...p, phone: e.target.value })); setErrors((p) => ({ ...p, phone: "" })); }}
                    style={{ background: "#1e2a3a", color: "white", borderRadius: "8px" }}
                  />
                  {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                </div>
                <div className="col-12">
                  <label className="form-label text-white-50" style={{ fontSize: "0.85rem" }}>Street Address *</label>
                  <input
                    id="checkout-street"
                    type="text"
                    className={`form-control border-0 ${errors.street ? "is-invalid" : ""}`}
                    placeholder="Street / Area / Landmark"
                    value={address.street}
                    onChange={(e) => { setAddress((p) => ({ ...p, street: e.target.value })); setErrors((p) => ({ ...p, street: "" })); }}
                    style={{ background: "#1e2a3a", color: "white", borderRadius: "8px" }}
                  />
                  {errors.street && <div className="invalid-feedback">{errors.street}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label text-white-50" style={{ fontSize: "0.85rem" }}>City *</label>
                  <input
                    id="checkout-city"
                    type="text"
                    className={`form-control border-0 ${errors.city ? "is-invalid" : ""}`}
                    placeholder="Mumbai"
                    value={address.city}
                    onChange={(e) => { setAddress((p) => ({ ...p, city: e.target.value })); setErrors((p) => ({ ...p, city: "" })); }}
                    style={{ background: "#1e2a3a", color: "white", borderRadius: "8px" }}
                  />
                  {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label text-white-50" style={{ fontSize: "0.85rem" }}>Pincode *</label>
                  <input
                    id="checkout-pincode"
                    type="text"
                    className={`form-control border-0 ${errors.pincode ? "is-invalid" : ""}`}
                    placeholder="400001"
                    maxLength={6}
                    value={address.pincode}
                    onChange={(e) => { setAddress((p) => ({ ...p, pincode: e.target.value })); setErrors((p) => ({ ...p, pincode: "" })); }}
                    style={{ background: "#1e2a3a", color: "white", borderRadius: "8px" }}
                  />
                  {errors.pincode && <div className="invalid-feedback">{errors.pincode}</div>}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div
              className="card border-0"
              style={{ background: "#161b22", borderRadius: "16px", padding: "24px" }}
            >
              <h5 className="text-white fw-bold mb-4">💳 Payment Method</h5>
              <div className="d-flex flex-column gap-3">
                {PAYMENT_METHODS.map((method) => (
                  <div
                    key={method.id}
                    className="d-flex align-items-center p-3 rounded-3"
                    onClick={() => setPaymentMethod(method.id)}
                    style={{
                      background: paymentMethod === method.id ? "rgba(239,68,68,0.08)" : "#1e2a3a",
                      border: paymentMethod === method.id ? "1px solid #ef4444" : "1px solid #30363d",
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                    }}
                  >
                    <div
                      className="me-3 d-flex align-items-center justify-content-center"
                      style={{ width: "40px", height: "40px", background: paymentMethod === method.id ? "linear-gradient(to right, #ef4444, #f97316)" : "#30363d", borderRadius: "10px", color: "white", transition: "all 0.25s" }}
                    >
                      {method.icon}
                    </div>
                    <div>
                      <div className="text-white fw-semibold" style={{ fontSize: "0.95rem" }}>{method.label}</div>
                      <div className="text-white-50" style={{ fontSize: "0.8rem" }}>{method.description}</div>
                    </div>
                    <div className="ms-auto">
                      <div
                        className="rounded-circle border d-flex align-items-center justify-content-center"
                        style={{
                          width: "20px",
                          height: "20px",
                          borderColor: paymentMethod === method.id ? "#ef4444" : "#30363d",
                          background: paymentMethod === method.id ? "linear-gradient(to right, #ef4444, #f97316)" : "transparent",
                        }}
                      >
                        {paymentMethod === method.id && <FiCheck size={12} style={{ color: "white" }} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="alert mt-3 mb-0" style={{ background: "rgba(243,156,18,0.1)", border: "1px solid #f39c12", color: "#f39c12", borderRadius: "10px", fontSize: "0.8rem" }}>
                🔔 This is a demo application. No real payment will be processed.
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="col-lg-5">
            <div
              className="card border-0 sticky-top"
              style={{ background: "#161b22", borderRadius: "16px", padding: "24px", top: "80px", border: "1px solid rgba(239,68,68,0.05)" }}
            >
              <h5 className="text-white fw-bold mb-4">🛍️ Order <span className="gradient-text">Summary</span></h5>

              {/* Cart items */}
              <div className="mb-3" style={{ maxHeight: "250px", overflowY: "auto" }}>
                {cartItems.map((item) => (
                  <div key={item.id} className="d-flex align-items-center mb-3 gap-3">
                    <img
                      src={item.image || "https://via.placeholder.com/50x50"}
                      alt={item.name}
                      style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }}
                      onError={(e) => { e.target.src = "https://via.placeholder.com/50x50"; }}
                    />
                    <div className="flex-grow-1">
                      <div className="text-white" style={{ fontSize: "0.9rem", fontWeight: 600 }}>{item.name}</div>
                      <div className="text-white-50" style={{ fontSize: "0.8rem" }}>Qty: {item.quantity}</div>
                    </div>
                    <div className="text-white fw-semibold">₹{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="gradient-divider" style={{ margin: "16px 0" }} />

              <div className="d-flex justify-content-between mb-2">
                <span className="text-white-50">Subtotal</span>
                <span className="text-white">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-white-50">GST (5%)</span>
                <span className="text-white">₹{gst.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-white-50">Delivery</span>
                <span style={{ color: "#22c55e" }}>FREE</span>
              </div>

              <div className="gradient-divider" style={{ margin: "16px 0" }} />

              <div className="d-flex justify-content-between mb-4">
                <span className="text-white fw-bold" style={{ fontSize: "1.1rem" }}>Grand Total</span>
                <span className="price-tag" style={{ fontSize: "1.4rem" }}>
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>

              <button
                id="place-order-btn"
                className="btn w-100 fw-bold btn-gradient"
                onClick={handlePlaceOrder}
                disabled={loading}
                style={{ padding: "14px", fontSize: "1rem" }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Placing Order...
                  </>
                ) : (
                  `Pay ₹${grandTotal.toFixed(2)} & Place Order`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

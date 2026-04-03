// Orders.jsx - Customer order history with status tracking
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { listenToUserOrders } from "../services/orderService";
import OrderStatusBadge from "../components/OrderStatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import MapComponent from "../components/MapComponent";
import { Link } from "react-router-dom";
import { FiPackage, FiClock, FiRefreshCw } from "react-icons/fi";
import { toast } from "react-hot-toast";

const Orders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToUserOrders(currentUser.uid, (data) => {
      setOrders(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleRefresh = () => {
    // With real-time listeners, a manual refresh isn't strictly necessary, 
    // but we'll show a quick loading animation for UX 
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  // Format Firestore timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <LoadingSpinner message="Loading your orders..." />;

  if (orders.length === 0) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center text-center"
        style={{ minHeight: "80vh", background: "#0d1117" }}
      >
        <FiPackage size={80} style={{ color: "#30363d", marginBottom: "20px" }} />
        <h3 className="text-white mb-3">No orders yet</h3>
        <p className="text-white-50 mb-4">Start ordering your favorite food!</p>
        <Link to="/" className="btn btn-gradient" style={{ textDecoration: "none" }}>
          <span style={{ position: "relative", zIndex: 1 }}>Order Now 🍕</span>
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
            📦 My <span className="gradient-text">Orders</span>
          </h2>
          <button
            className="btn btn-sm d-flex align-items-center gap-2"
            onClick={handleRefresh}
            disabled={refreshing}
            style={{ border: "1px solid #30363d", color: "rgba(255,255,255,0.6)", background: "transparent", borderRadius: "8px" }}
          >
            <FiRefreshCw size={14} className={refreshing ? "spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Orders List */}
        <div className="d-flex flex-column gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="card border-0"
              style={{ background: "#161b22", borderRadius: "16px", overflow: "hidden" }}
            >
              {/* Order Header */}
              <div
                className="d-flex flex-wrap justify-content-between align-items-center p-4 gap-3"
                style={{ borderBottom: "1px solid #21262d" }}
              >
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="text-white fw-bold" style={{ fontSize: "0.9rem" }}>
                      Order #{order.id.substring(0, 8).toUpperCase()}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="d-flex align-items-center gap-2 text-white-50" style={{ fontSize: "0.8rem" }}>
                    <FiClock size={13} />
                    {formatDate(order.createdAt)}
                  </div>
                </div>
                <div className="text-end">
                  <div className="price-tag" style={{ fontSize: "1.2rem" }}>
                    ₹{parseFloat(order.total).toFixed(2)}
                  </div>
                  <div className="text-white-50" style={{ fontSize: "0.8rem" }}>
                    {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4">
                <div className="row g-3">
                  {order.items?.map((item, index) => (
                    <div key={index} className="col-12">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={item.image || "https://via.placeholder.com/60x60/1e2a3a/e94560?text=F"}
                          alt={item.name}
                          style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "10px" }}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/60x60/1e2a3a/e94560?text=F";
                          }}
                        />
                        <div className="flex-grow-1">
                          <div className="text-white fw-semibold">{item.name}</div>
                          <div className="text-white-50" style={{ fontSize: "0.8rem" }}>
                            {item.category} · Qty: {item.quantity}
                          </div>
                        </div>
                        <div className="text-white fw-semibold">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Timeline */}
                <div className="mt-4 pt-3" style={{ borderTop: "1px solid #21262d" }}>
                  <div className="d-flex justify-content-between align-items-center">
                    {["Pending", "Preparing", "Out for Delivery", "Delivered"].map((step, idx) => {
                      const statusOrder = ["Pending", "Preparing", "Out for Delivery", "Delivered"];
                      const currentIdx = statusOrder.indexOf(order.status);
                      const isActive = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;
                      return (
                        <div key={step} className="d-flex flex-column align-items-center flex-fill">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center mb-1"
                            style={{
                              width: "28px",
                              height: "28px",
                              background: isActive ? "linear-gradient(to right, #ef4444, #f97316)" : "#21262d",
                              border: `2px solid ${isActive ? "transparent" : "#30363d"}`,
                              fontSize: "0.7rem",
                              color: "white",
                              boxShadow: isCurrent ? "0 0 12px rgba(239,68,68,0.5)" : isActive ? "0 0 8px rgba(239,68,68,0.2)" : "none",
                              transition: "all 0.3s",
                            }}
                          >
                            {isActive ? "✓" : idx + 1}
                          </div>
                          <span
                            style={{
                              fontSize: "0.65rem",
                              color: isActive ? "#ef4444" : "rgba(255,255,255,0.3)",
                              textAlign: "center",
                              lineHeight: "1.2",
                            }}
                          >
                            {step}
                          </span>
                          {idx < 3 && (
                            <div
                              style={{
                                position: "absolute",
                                width: "calc(25% - 28px)",
                                height: "2px",
                                background: isActive && idx < currentIdx ? "#e94560" : "#21262d",
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Real-time Tracking Map */}
                {order.status === "Out for Delivery" && order.deliveryPartner && (
                  <div className="mt-4 pt-4" style={{ borderTop: "1px solid #21262d" }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <div className="fw-bold text-white d-flex align-items-center gap-2">
                          <span style={{ fontSize: "1.2rem" }}>🚴</span> Delivery Partner On The Way
                        </div>
                        <div className="text-white-50" style={{ fontSize: "0.85rem" }}>
                          {order.deliveryPartner.name} • 📞 {order.deliveryPartner.phone}
                        </div>
                      </div>
                      <div className="badge" style={{ background: "rgba(39,174,96,0.15)", color: "#27ae60", padding: "8px 12px", border: "1px solid rgba(39,174,96,0.3)" }}>
                        Live Tracking Active
                      </div>
                    </div>
                    {order.location && (
                      <div className="rounded overflow-hidden" style={{ border: "2px solid #21262d" }}>
                        <MapComponent location={order.location} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;

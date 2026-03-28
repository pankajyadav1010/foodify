// Orders.jsx - Customer order history with status tracking
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserOrders } from "../services/orderService";
import OrderStatusBadge from "../components/OrderStatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { Link } from "react-router-dom";
import { FiPackage, FiClock, FiRefreshCw } from "react-icons/fi";
import { toast } from "react-hot-toast";

const Orders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const userOrders = await getUserOrders(currentUser.uid);
      setOrders(userOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders: " + error.message);
    }
  }, [currentUser]);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      await fetchOrders();
      setLoading(false);
    };
    loadOrders();
  }, [fetchOrders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
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
        <Link
          to="/"
          className="btn"
          style={{ background: "linear-gradient(135deg, #e94560, #c0392b)", color: "white", border: "none", borderRadius: "12px", padding: "12px 24px", textDecoration: "none" }}
        >
          Order Now 🍕
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
            📦 My Orders
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
                  <div className="fw-bold" style={{ color: "#e94560", fontSize: "1.2rem" }}>
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
                              background: isActive ? "#e94560" : "#21262d",
                              border: `2px solid ${isActive ? "#e94560" : "#30363d"}`,
                              fontSize: "0.7rem",
                              color: "white",
                              boxShadow: isCurrent ? "0 0 10px rgba(233,69,96,0.5)" : "none",
                              transition: "all 0.3s",
                            }}
                          >
                            {isActive ? "✓" : idx + 1}
                          </div>
                          <span
                            style={{
                              fontSize: "0.65rem",
                              color: isActive ? "#e94560" : "rgba(255,255,255,0.3)",
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;

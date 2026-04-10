// Orders.jsx - Customer order history with status tracking + Cancel Order feature
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { listenToUserOrders, cancelOrder } from "../services/orderService";
import OrderStatusBadge from "../components/OrderStatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import MapComponent from "../components/MapComponent";
import { Link } from "react-router-dom";
import { FiPackage, FiClock, FiRefreshCw, FiXCircle, FiAlertTriangle } from "react-icons/fi";
import { toast } from "react-hot-toast";

// Statuses that allow the customer to cancel their order
const CANCELLABLE_STATUSES = ["Pending", "Preparing"];

// Pre-defined cancel reasons for the dropdown
const CANCEL_REASONS = [
  "Changed my mind",
  "Ordered by mistake",
  "Found a better option",
  "Taking too long",
  "Other",
];

const Orders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cancel modal state
  const [cancelModal, setCancelModal] = useState({ open: false, order: null });
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Track which orders are in-flight to prevent double-clicks
  const cancellingIds = useRef(new Set());

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToUserOrders(currentUser.uid, (data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleRefresh = () => {
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

  // Open cancel confirmation modal
  const openCancelModal = (order) => {
    setCancelModal({ open: true, order });
    setCancelReason(CANCEL_REASONS[0]);
    setCustomReason("");
  };

  // Close cancel modal
  const closeCancelModal = () => {
    if (cancelling) return; // Don't close while request is in-flight
    setCancelModal({ open: false, order: null });
  };

  // Execute cancel
  const handleConfirmCancel = async () => {
    const order = cancelModal.order;
    if (!order || cancellingIds.current.has(order.id)) return;

    const finalReason = cancelReason === "Other"
      ? customReason.trim() || "Other"
      : cancelReason;

    try {
      cancellingIds.current.add(order.id);
      setCancelling(true);

      await cancelOrder(order.id, currentUser.uid, order, finalReason);

      toast.success("Order cancelled successfully!", {
        icon: "🚫",
        style: {
          background: "#161b22",
          color: "#fff",
          border: "1px solid #ef4444",
          borderRadius: "12px",
        },
      });
      setCancelModal({ open: false, order: null });
    } catch (err) {
      console.error("Cancel order error:", err);
      toast.error(err.message || "Failed to cancel order. Please try again.", {
        style: {
          background: "#161b22",
          color: "#fff",
          border: "1px solid #30363d",
          borderRadius: "12px",
        },
      });
    } finally {
      cancellingIds.current.delete(order.id);
      setCancelling(false);
    }
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

  const isCancelled = (status) => status === "Cancelled";
  const canCancel = (order) =>
    CANCELLABLE_STATUSES.includes(order.status) && order.userId === currentUser.uid;

  return (
    <div style={{ background: "#0d1117", minHeight: "100vh", padding: "30px 0" }}>
      <div className="container">
        {/* ── Header ── */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-white fw-bold mb-0" style={{ fontFamily: "'Poppins', sans-serif" }}>
            📦 My <span className="gradient-text">Orders</span>
          </h2>
          <button
            className="btn btn-sm d-flex align-items-center gap-2"
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              border: "1px solid #30363d",
              color: "rgba(255,255,255,0.6)",
              background: "transparent",
              borderRadius: "8px",
            }}
          >
            <FiRefreshCw size={14} className={refreshing ? "spin" : ""} />
            Refresh
          </button>
        </div>

        {/* ── Orders List ── */}
        <div className="d-flex flex-column gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="card border-0"
              style={{
                background: "#161b22",
                borderRadius: "16px",
                overflow: "hidden",
                border: isCancelled(order.status)
                  ? "1px solid rgba(239,68,68,0.25)"
                  : "1px solid transparent",
                transition: "border-color 0.3s",
              }}
            >
              {/* ── Order Header ── */}
              <div
                className="d-flex flex-wrap justify-content-between align-items-center p-4 gap-3"
                style={{ borderBottom: "1px solid #21262d" }}
              >
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                    <span className="text-white fw-bold" style={{ fontSize: "0.9rem" }}>
                      Order #{order.id.substring(0, 8).toUpperCase()}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="d-flex align-items-center gap-2 text-white-50" style={{ fontSize: "0.8rem" }}>
                    <FiClock size={13} />
                    {formatDate(order.createdAt)}
                  </div>
                  {/* Cancellation timestamp */}
                  {isCancelled(order.status) && order.cancelledAt && (
                    <div
                      className="d-flex align-items-center gap-1 mt-1"
                      style={{ fontSize: "0.75rem", color: "#ef4444" }}
                    >
                      <FiXCircle size={11} />
                      Cancelled on {formatDate(order.cancelledAt)}
                    </div>
                  )}
                </div>

                <div className="d-flex flex-column align-items-end gap-2">
                  <div>
                    <div className="price-tag" style={{ fontSize: "1.2rem" }}>
                      ₹{parseFloat(order.total).toFixed(2)}
                    </div>
                    <div className="text-white-50 text-end" style={{ fontSize: "0.8rem" }}>
                      {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
                    </div>
                  </div>

                  {/* ── Cancel Button ── */}
                  {canCancel(order) && (
                    <button
                      className="btn btn-sm d-flex align-items-center gap-2"
                      onClick={() => openCancelModal(order)}
                      disabled={cancellingIds.current.has(order.id)}
                      style={{
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.4)",
                        color: "#ef4444",
                        borderRadius: "8px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        transition: "all 0.2s",
                        whiteSpace: "nowrap",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(239,68,68,0.2)";
                        e.currentTarget.style.borderColor = "rgba(239,68,68,0.7)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                        e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
                      }}
                    >
                      <FiXCircle size={13} />
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* ── Order Items ── */}
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

                {/* ── Cancelled Reason ── */}
                {isCancelled(order.status) && (
                  <div
                    className="mt-4 p-3 d-flex align-items-start gap-3"
                    style={{
                      background: "rgba(239,68,68,0.06)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      borderRadius: "10px",
                    }}
                  >
                    <FiAlertTriangle size={16} style={{ color: "#ef4444", flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <div className="fw-semibold" style={{ color: "#ef4444", fontSize: "0.85rem" }}>
                        This order was cancelled
                      </div>
                      {order.cancelReason && (
                        <div className="text-white-50" style={{ fontSize: "0.8rem", marginTop: "2px" }}>
                          Reason: {order.cancelReason}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Order Timeline (hidden for Cancelled) ── */}
                {!isCancelled(order.status) && (
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
                                background: isActive
                                  ? "linear-gradient(to right, #ef4444, #f97316)"
                                  : "#21262d",
                                border: `2px solid ${isActive ? "transparent" : "#30363d"}`,
                                fontSize: "0.7rem",
                                color: "white",
                                boxShadow: isCurrent
                                  ? "0 0 12px rgba(239,68,68,0.5)"
                                  : isActive
                                  ? "0 0 8px rgba(239,68,68,0.2)"
                                  : "none",
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
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Real-time Tracking Map ── */}
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
                      <div
                        className="badge"
                        style={{
                          background: "rgba(39,174,96,0.15)",
                          color: "#27ae60",
                          padding: "8px 12px",
                          border: "1px solid rgba(39,174,96,0.3)",
                        }}
                      >
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

      {/* ════════════════════════════════════════════
          Cancel Confirmation Modal (Bootstrap 5)
          ════════════════════════════════════════════ */}
      {cancelModal.open && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeCancelModal}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(4px)",
              zIndex: 1050,
              animation: "fadeIn 0.2s ease",
            }}
          />

          {/* Modal */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1055,
              width: "min(480px, 92vw)",
              background: "#161b22",
              borderRadius: "18px",
              border: "1px solid #30363d",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
              animation: "slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)",
              overflow: "hidden",
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-modal-title"
          >
            {/* Modal header strip */}
            <div
              style={{
                background: "linear-gradient(to right, rgba(239,68,68,0.15), rgba(249,115,22,0.1))",
                borderBottom: "1px solid rgba(239,68,68,0.2)",
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <FiAlertTriangle size={18} color="#ef4444" />
              </div>
              <div>
                <h5
                  id="cancel-modal-title"
                  className="mb-0 fw-bold"
                  style={{ color: "#fff", fontFamily: "'Poppins', sans-serif" }}
                >
                  Cancel Order?
                </h5>
                <p className="mb-0" style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)" }}>
                  Order #{cancelModal.order?.id.substring(0, 8).toUpperCase()}
                </p>
              </div>
            </div>

            {/* Modal body */}
            <div style={{ padding: "24px" }}>
              <p className="text-white-50 mb-4" style={{ fontSize: "0.9rem" }}>
                Are you sure you want to cancel this order? This action{" "}
                <span style={{ color: "#ef4444", fontWeight: 600 }}>cannot be undone</span>.
              </p>

              {/* Cancel reason dropdown */}
              <div className="mb-3">
                <label
                  htmlFor="cancel-reason-select"
                  className="form-label"
                  style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginBottom: "8px" }}
                >
                  Reason for cancellation
                </label>
                <select
                  id="cancel-reason-select"
                  className="form-select"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  style={{
                    background: "#0d1117",
                    border: "1px solid #30363d",
                    color: "#fff",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "0.88rem",
                  }}
                >
                  {CANCEL_REASONS.map((r) => (
                    <option key={r} value={r} style={{ background: "#161b22" }}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom reason text field */}
              {cancelReason === "Other" && (
                <div className="mb-3" style={{ animation: "fadeIn 0.2s ease" }}>
                  <label
                    htmlFor="cancel-custom-reason"
                    className="form-label"
                    style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginBottom: "8px" }}
                  >
                    Tell us more (optional)
                  </label>
                  <textarea
                    id="cancel-custom-reason"
                    className="form-control"
                    rows={3}
                    maxLength={200}
                    placeholder="Describe your reason..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    style={{
                      background: "#0d1117",
                      border: "1px solid #30363d",
                      color: "#fff",
                      borderRadius: "10px",
                      resize: "none",
                      fontSize: "0.88rem",
                    }}
                  />
                  <div
                    className="text-end"
                    style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", marginTop: "4px" }}
                  >
                    {customReason.length}/200
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="d-flex gap-3 mt-2">
                <button
                  className="btn flex-fill"
                  onClick={closeCancelModal}
                  disabled={cancelling}
                  style={{
                    background: "#21262d",
                    border: "1px solid #30363d",
                    color: "rgba(255,255,255,0.7)",
                    borderRadius: "10px",
                    fontWeight: 600,
                    padding: "10px",
                  }}
                >
                  Keep Order
                </button>
                <button
                  className="btn flex-fill d-flex align-items-center justify-content-center gap-2"
                  onClick={handleConfirmCancel}
                  disabled={cancelling}
                  style={{
                    background: cancelling
                      ? "rgba(239,68,68,0.3)"
                      : "linear-gradient(to right, #ef4444, #f97316)",
                    border: "none",
                    color: "#fff",
                    borderRadius: "10px",
                    fontWeight: 700,
                    padding: "10px",
                    transition: "opacity 0.2s",
                    opacity: cancelling ? 0.7 : 1,
                  }}
                >
                  {cancelling ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      />
                      Cancelling…
                    </>
                  ) : (
                    <>
                      <FiXCircle size={15} />
                      Yes, Cancel
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Inline keyframe animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, -42%); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </div>
  );
};

export default Orders;

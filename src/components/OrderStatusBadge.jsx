// OrderStatusBadge.jsx - Shows colored badge based on order status
import React from "react";

const statusConfig = {
  Pending: { color: "#f39c12", bg: "rgba(243,156,18,0.15)", icon: "⏳" },
  Preparing: { color: "#3498db", bg: "rgba(52,152,219,0.15)", icon: "👨‍🍳" },
  "Out for Delivery": { color: "#9b59b6", bg: "rgba(155,89,182,0.15)", icon: "🚗" },
  Delivered: { color: "#27ae60", bg: "rgba(39,174,96,0.15)", icon: "✅" },
  Cancelled: { color: "#e94560", bg: "rgba(233,69,96,0.15)", icon: "❌" },
};

const OrderStatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.Pending;

  return (
    <span
      className="fw-semibold px-3 py-1 rounded-pill"
      style={{
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.color}`,
        fontSize: "0.8rem",
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
      }}
    >
      {config.icon} {status}
    </span>
  );
};

export default OrderStatusBadge;

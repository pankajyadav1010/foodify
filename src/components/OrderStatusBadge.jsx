// OrderStatusBadge.jsx - Gradient-aware status badge with modern colors
import React from "react";

const statusConfig = {
  Pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", icon: "⏳" },
  Preparing: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)", icon: "👨‍🍳" },
  "Out for Delivery": { color: "#a855f7", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.3)", icon: "🚗" },
  Delivered: { color: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)", icon: "✅" },
  Cancelled: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", icon: "❌" },
};

const OrderStatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.Pending;

  return (
    <span
      className="status-badge"
      style={{
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.border}`,
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

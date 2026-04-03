// LoadingSpinner.jsx - Loading spinner with gradient accent
import React from "react";

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ minHeight: "60vh", gap: "20px" }}
    >
      <div style={{ position: "relative", width: "48px", height: "48px" }}>
        <div
          className="spinner-border"
          role="status"
          style={{
            width: "48px",
            height: "48px",
            color: "#ef4444",
            borderWidth: "4px",
            borderTopColor: "#f97316",
          }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
      <p className="text-white-50 mb-0" style={{ fontSize: "0.95rem", letterSpacing: "0.02em" }}>
        {message}
      </p>
    </div>
  );
};

export default LoadingSpinner;

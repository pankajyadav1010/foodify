// LoadingSpinner.jsx - Reusable loading spinner component
import React from "react";

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ minHeight: "60vh", gap: "20px" }}
    >
      <div
        className="spinner-border"
        role="status"
        style={{ width: "3rem", height: "3rem", color: "#e94560", borderWidth: "4px" }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-white-50 mb-0" style={{ fontSize: "1rem" }}>
        {message}
      </p>
    </div>
  );
};

export default LoadingSpinner;

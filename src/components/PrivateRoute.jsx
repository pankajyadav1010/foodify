// PrivateRoute.jsx - Protects routes that require authentication
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

/**
 * PrivateRoute - wraps a component and redirects to /login if not authenticated
 * Optionally accepts `adminOnly` prop to further restrict to admin users
 */
const PrivateRoute = ({ children, adminOnly = false }) => {
  const { currentUser, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (!currentUser) {
    // Redirect to login, preserve intended destination
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (adminOnly && userRole !== "admin") {
    // Not an admin - redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;

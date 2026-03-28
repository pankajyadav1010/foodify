// App.jsx - Main application with routing, providers, and layout
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Components
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/AdminDashboard";
import SeedMenu from "./pages/SeedMenu";

// Import Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#1e2a3a",
                color: "#ffffff",
                border: "1px solid #30363d",
                borderRadius: "12px",
                fontSize: "0.9rem",
              },
              success: {
                iconTheme: { primary: "#27ae60", secondary: "#fff" },
              },
              error: {
                iconTheme: { primary: "#e94560", secondary: "#fff" },
              },
            }}
          />

          {/* Navbar - shown on all pages */}
          <Navbar />

          {/* Application Routes */}
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Customer Routes */}
            <Route
              path="/cart"
              element={
                <PrivateRoute>
                  <Cart />
                </PrivateRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <PrivateRoute>
                  <Checkout />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <PrivateRoute>
                  <Orders />
                </PrivateRoute>
              }
            />

            {/* Admin-Only Route */}
            <Route
              path="/admin"
              element={
                <PrivateRoute adminOnly={true}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            {/* Seed menu utility route */}
            <Route
              path="/seed-menu"
              element={
                <PrivateRoute>
                  <SeedMenu />
                </PrivateRoute>
              }
            />

            {/* Catch-all → Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

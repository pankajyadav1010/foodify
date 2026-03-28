// AdminDashboard.jsx - Full admin panel: manage menu items and all orders
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../services/menuService";
import { getAllOrders, updateOrderStatus } from "../services/orderService";
import OrderStatusBadge from "../components/OrderStatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiX, FiCheck } from "react-icons/fi";
import { MdRestaurantMenu, MdShoppingBag } from "react-icons/md";

const CATEGORIES = ["Indian", "Chinese", "Fast Food", "South Indian", "Beverages", "Desserts"];
const ORDER_STATUSES = ["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

const EMPTY_ITEM = { name: "", price: "", category: "Indian", image: "", description: "" };

const AdminDashboard = () => {
  const { currentUser } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState("menu");

  // Menu state
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState(EMPTY_ITEM);
  const [formErrors, setFormErrors] = useState({});
  const [savingItem, setSavingItem] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Fetch menu items
  const fetchMenu = useCallback(async () => {
    try {
      const items = await getMenuItems();
      setMenuItems(items);
    } catch (err) {
      toast.error("Failed to load menu items");
    } finally {
      setMenuLoading(false);
    }
  }, []);

  // Fetch all orders
  const fetchOrders = useCallback(async () => {
    try {
      const allOrders = await getAllOrders();
      setOrders(allOrders);
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
    fetchOrders();
  }, [fetchMenu, fetchOrders]);

  // Validate item form
  const validateItem = () => {
    const errors = {};
    if (!itemForm.name.trim()) errors.name = "Item name is required";
    if (!itemForm.price || isNaN(itemForm.price) || parseFloat(itemForm.price) <= 0)
      errors.price = "Valid price is required";
    if (!itemForm.category) errors.category = "Category is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open modal for adding
  const openAddModal = () => {
    setEditingItem(null);
    setItemForm(EMPTY_ITEM);
    setFormErrors({});
    setShowItemModal(true);
  };

  // Open modal for editing
  const openEditModal = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name || "",
      price: item.price || "",
      category: item.category || "Pizza",
      image: item.image || "",
      description: item.description || "",
    });
    setFormErrors({});
    setShowItemModal(true);
  };

  // Save item (add or update)
  const handleSaveItem = async () => {
    if (!validateItem()) return;

    setSavingItem(true);
    try {
      const itemData = {
        name: itemForm.name.trim(),
        price: parseFloat(itemForm.price),
        category: itemForm.category,
        image: itemForm.image.trim(),
        description: itemForm.description.trim(),
      };

      if (editingItem) {
        await updateMenuItem(editingItem.id, itemData);
        toast.success("Menu item updated!");
      } else {
        await addMenuItem(itemData);
        toast.success("Menu item added!");
      }

      setShowItemModal(false);
      await fetchMenu();
    } catch (err) {
      toast.error("Failed to save item. Please try again.");
    } finally {
      setSavingItem(false);
    }
  };

  // Delete item
  const handleDeleteItem = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteMenuItem(id);
      toast.success(`"${name}" deleted`);
      await fetchMenu();
    } catch (err) {
      toast.error("Failed to delete item");
    } finally {
      setDeletingId(null);
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      await fetchOrders();
    } catch (err) {
      toast.error("Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Format timestamp
  const formatDate = (ts) => {
    if (!ts) return "Unknown";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  // Filtered orders
  const filteredOrders = statusFilter === "All"
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  // Stats
  const stats = {
    totalItems: menuItems.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "Pending").length,
    revenue: orders
      .filter((o) => o.status === "Delivered")
      .reduce((s, o) => s + parseFloat(o.total || 0), 0),
  };

  return (
    <div style={{ background: "#0d1117", minHeight: "100vh" }}>
      {/* Admin Header */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", padding: "24px 0", borderBottom: "1px solid #21262d" }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="text-white fw-bold mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                ⚙️ Admin Dashboard
              </h2>
              <p className="text-white-50 mb-0" style={{ fontSize: "0.85rem" }}>
                Welcome back, {currentUser?.email}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="d-flex gap-3 flex-wrap">
              {[
                { label: "Menu Items", value: stats.totalItems, color: "#3498db" },
                { label: "Total Orders", value: stats.totalOrders, color: "#e94560" },
                { label: "Pending", value: stats.pendingOrders, color: "#f39c12" },
                { label: "Revenue", value: `₹${stats.revenue.toFixed(0)}`, color: "#27ae60" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center px-3 py-2 rounded-3"
                  style={{ background: "#161b22", border: "1px solid #21262d", minWidth: "100px" }}
                >
                  <div className="fw-bold" style={{ color: stat.color, fontSize: "1.3rem" }}>{stat.value}</div>
                  <div className="text-white-50" style={{ fontSize: "0.7rem" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#161b22", borderBottom: "1px solid #21262d" }}>
        <div className="container">
          <div className="d-flex">
            {[
              { id: "menu", label: "🍽️ Menu Management", icon: <MdRestaurantMenu /> },
              { id: "orders", label: "📦 Order Management", icon: <MdShoppingBag /> },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                className="btn border-0 py-3 px-4 rounded-0"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  color: activeTab === tab.id ? "#e94560" : "rgba(255,255,255,0.5)",
                  borderBottom: activeTab === tab.id ? "2px solid #e94560" : "2px solid transparent",
                  background: "transparent",
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  transition: "all 0.2s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-4">
        {/* ─── MENU MANAGEMENT TAB ─── */}
        {activeTab === "menu" && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white fw-bold mb-0">Menu Items ({menuItems.length})</h5>
              <button
                id="add-item-btn"
                className="btn d-flex align-items-center gap-2"
                onClick={openAddModal}
                style={{ background: "#e94560", color: "white", border: "none", borderRadius: "10px" }}
              >
                <FiPlus /> Add Item
              </button>
            </div>

            {menuLoading ? (
              <LoadingSpinner message="Loading menu..." />
            ) : menuItems.length === 0 ? (
              <div className="text-center py-5">
                <div style={{ fontSize: "4rem" }}>🍽️</div>
                <h5 className="text-white mt-3">No menu items yet</h5>
                <button className="btn mt-2" onClick={openAddModal} style={{ background: "#e94560", color: "white", border: "none", borderRadius: "10px" }}>
                  Add Your First Item
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-borderless" style={{ color: "white" }}>
                  <thead style={{ background: "#161b22", borderRadius: "8px" }}>
                    <tr style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", textTransform: "uppercase" }}>
                      <th>Item</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuItems.map((item) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid #21262d" }}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={item.image || "https://via.placeholder.com/50x50/1e2a3a/e94560?text=F"}
                              alt={item.name}
                              style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }}
                              onError={(e) => { e.target.src = "https://via.placeholder.com/50x50/1e2a3a/e94560?text=F"; }}
                            />
                            <div>
                              <div className="fw-semibold">{item.name}</div>
                              {item.description && (
                                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>
                                  {item.description.substring(0, 40)}...
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge" style={{ background: "rgba(233,69,96,0.2)", color: "#e94560" }}>
                            {item.category}
                          </span>
                        </td>
                        <td className="fw-bold" style={{ color: "#e94560" }}>
                          ₹{parseFloat(item.price).toFixed(2)}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              id={`edit-item-${item.id}`}
                              className="btn btn-sm"
                              onClick={() => openEditModal(item)}
                              style={{ background: "rgba(52,152,219,0.15)", color: "#3498db", border: "1px solid #3498db", borderRadius: "8px" }}
                            >
                              <FiEdit2 size={14} />
                            </button>
                            <button
                              id={`delete-item-${item.id}`}
                              className="btn btn-sm"
                              onClick={() => handleDeleteItem(item.id, item.name)}
                              disabled={deletingId === item.id}
                              style={{ background: "rgba(233,69,96,0.15)", color: "#e94560", border: "1px solid #e94560", borderRadius: "8px" }}
                            >
                              {deletingId === item.id ? <span className="spinner-border spinner-border-sm" /> : <FiTrash2 size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── ORDER MANAGEMENT TAB ─── */}
        {activeTab === "orders" && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
              <h5 className="text-white fw-bold mb-0">All Orders ({filteredOrders.length})</h5>
              <div className="d-flex gap-2 flex-wrap">
                {["All", ...ORDER_STATUSES].map((s) => (
                  <button
                    key={s}
                    className="btn btn-sm"
                    onClick={() => setStatusFilter(s)}
                    style={{
                      borderRadius: "20px",
                      background: statusFilter === s ? "#e94560" : "transparent",
                      color: statusFilter === s ? "white" : "rgba(255,255,255,0.5)",
                      border: statusFilter === s ? "none" : "1px solid #30363d",
                      fontSize: "0.75rem",
                    }}
                  >
                    {s}
                  </button>
                ))}
                <button
                  className="btn btn-sm"
                  onClick={() => { setOrdersLoading(true); fetchOrders(); }}
                  style={{ border: "1px solid #30363d", color: "rgba(255,255,255,0.5)", background: "transparent", borderRadius: "8px" }}
                >
                  <FiRefreshCw size={14} />
                </button>
              </div>
            </div>

            {ordersLoading ? (
              <LoadingSpinner message="Loading orders..." />
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-5">
                <div style={{ fontSize: "4rem" }}>📦</div>
                <h5 className="text-white mt-3">No orders found</h5>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="card border-0" style={{ background: "#161b22", borderRadius: "16px", overflow: "hidden" }}>
                    {/* Order Header */}
                    <div className="d-flex flex-wrap justify-content-between align-items-center p-4 gap-3" style={{ borderBottom: "1px solid #21262d" }}>
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="text-white fw-bold">#{order.id.substring(0, 8).toUpperCase()}</span>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <div className="text-white-50" style={{ fontSize: "0.8rem" }}>
                          📧 {order.userEmail} · {formatDate(order.createdAt)}
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <span className="fw-bold" style={{ color: "#e94560", fontSize: "1.2rem" }}>
                          ₹{parseFloat(order.total).toFixed(2)}
                        </span>
                        {/* Status Update Dropdown */}
                        <select
                          className="form-select form-select-sm border-0"
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          disabled={updatingOrderId === order.id}
                          style={{
                            background: "#1e2a3a",
                            color: "white",
                            borderRadius: "8px",
                            fontSize: "0.8rem",
                            minWidth: "160px",
                          }}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {updatingOrderId === order.id && (
                          <span className="spinner-border spinner-border-sm" style={{ color: "#e94560" }} />
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="p-4">
                      <div className="d-flex flex-wrap gap-3">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="d-flex align-items-center gap-2 p-2 rounded-3" style={{ background: "#1e2a3a" }}>
                            <img
                              src={item.image || "https://via.placeholder.com/40x40"}
                              alt={item.name}
                              style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px" }}
                              onError={(e) => { e.target.src = "https://via.placeholder.com/40x40"; }}
                            />
                            <div>
                              <div className="text-white" style={{ fontSize: "0.85rem", fontWeight: 600 }}>{item.name}</div>
                              <div className="text-white-50" style={{ fontSize: "0.75rem" }}>×{item.quantity}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── ADD/EDIT ITEM MODAL ─── */}
      {showItemModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.7)", zIndex: 9999, padding: "20px" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowItemModal(false); }}
        >
          <div
            className="card border-0"
            style={{ background: "#161b22", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white fw-bold mb-0">
                {editingItem ? "✏️ Edit Item" : "➕ Add New Item"}
              </h5>
              <button
                className="btn p-1"
                onClick={() => setShowItemModal(false)}
                style={{ background: "rgba(255,255,255,0.1)", color: "white", borderRadius: "8px", border: "none" }}
              >
                <FiX />
              </button>
            </div>

            {/* Form */}
            <div className="mb-3">
              <label className="form-label text-white-50" style={{ fontSize: "0.85rem" }}>Item Name *</label>
              <input
                id="modal-item-name"
                type="text"
                className={`form-control border-0 ${formErrors.name ? "is-invalid" : ""}`}
                placeholder="e.g. Margherita Pizza"
                value={itemForm.name}
                onChange={(e) => { setItemForm((p) => ({ ...p, name: e.target.value })); setFormErrors((p) => ({ ...p, name: "" })); }}
                style={{ background: "#1e2a3a", color: "white", borderRadius: "8px" }}
              />
              {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label text-white-50" style={{ fontSize: "0.85rem" }}>Price (₹) *</label>
                <input
                  id="modal-item-price"
                  type="number"
                  min="0"
                  step="0.01"
                  className={`form-control border-0 ${formErrors.price ? "is-invalid" : ""}`}
                  placeholder="299.00"
                  value={itemForm.price}
                  onChange={(e) => { setItemForm((p) => ({ ...p, price: e.target.value })); setFormErrors((p) => ({ ...p, price: "" })); }}
                  style={{ background: "#1e2a3a", color: "white", borderRadius: "8px" }}
                />
                {formErrors.price && <div className="invalid-feedback">{formErrors.price}</div>}
              </div>
              <div className="col-6">
                <label className="form-label text-white-50" style={{ fontSize: "0.85rem" }}>Category *</label>
                <select
                  id="modal-item-category"
                  className="form-select border-0"
                  value={itemForm.category}
                  onChange={(e) => setItemForm((p) => ({ ...p, category: e.target.value }))}
                  style={{ background: "#1e2a3a", color: "white", borderRadius: "8px" }}
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label text-white-50" style={{ fontSize: "0.85rem" }}>Image URL</label>
              <input
                id="modal-item-image"
                type="url"
                className="form-control border-0"
                placeholder="https://example.com/image.jpg"
                value={itemForm.image}
                onChange={(e) => setItemForm((p) => ({ ...p, image: e.target.value }))}
                style={{ background: "#1e2a3a", color: "white", borderRadius: "8px" }}
              />
              {itemForm.image && (
                <img
                  src={itemForm.image}
                  alt="Preview"
                  className="mt-2 rounded-3"
                  style={{ width: "100%", height: "120px", objectFit: "cover" }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              )}
            </div>

            <div className="mb-4">
              <label className="form-label text-white-50" style={{ fontSize: "0.85rem" }}>Description</label>
              <textarea
                id="modal-item-desc"
                className="form-control border-0"
                rows={3}
                placeholder="Describe the dish..."
                value={itemForm.description}
                onChange={(e) => setItemForm((p) => ({ ...p, description: e.target.value }))}
                style={{ background: "#1e2a3a", color: "white", borderRadius: "8px", resize: "vertical" }}
              />
            </div>

            <div className="d-flex gap-3">
              <button
                className="btn flex-fill"
                onClick={() => setShowItemModal(false)}
                style={{ border: "1px solid #30363d", color: "rgba(255,255,255,0.6)", background: "transparent", borderRadius: "10px" }}
              >
                Cancel
              </button>
              <button
                id="save-item-btn"
                className="btn flex-fill fw-bold d-flex align-items-center justify-content-center gap-2"
                onClick={handleSaveItem}
                disabled={savingItem}
                style={{ background: "linear-gradient(135deg, #e94560, #c0392b)", color: "white", border: "none", borderRadius: "10px" }}
              >
                {savingItem ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <>
                    <FiCheck />
                    {editingItem ? "Update Item" : "Add Item"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

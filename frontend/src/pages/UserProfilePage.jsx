import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Lock, ShieldCheck, GraduationCap,
  Pencil, Check, X, KeyRound, Sparkles, Eye, EyeOff,
  ShoppingBag, AlertCircle, Send, RefreshCw, ArrowLeft, Trash2
} from "lucide-react";
import { useUserAuth } from "../context/UserAuthContext";
import UserLayout from '../components/UserLayout';
import UserSidebar from '../components/UserSidebar';
import api from "../utils/api";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Field = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-4 py-4 border-b border-gray-50 last:border-0">
    <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
      <Icon size={16} className="text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
    </div>
  </div>
);

const InputField = ({ label, name, type = "text", value, onChange, icon: Icon, placeholder, extra }) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div>
      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 px-1">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type={isPassword && show ? "text" : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-11 pr-10 py-3.5 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all"
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {extra && <p className="text-[10px] text-gray-400 font-medium mt-1 px-1">{extra}</p>}
    </div>
  );
};

const UserProfilePage = () => {
  const { user, updateProfile } = useUserAuth();

  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch user's orders
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await api.get("/orders");
      setOrders(res.data.data || res.data || []);
      console.log(`✅ Fetched ${(res.data.data || res.data || []).length} orders`);
    } catch (err) {
      console.error("Fetch orders error:", err);
      showToast("Failed to load orders.", "error");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const handleClearAllOrders = async () => {
    try {
      setOrdersLoading(true);
      console.log(`🗑️  Clearing all orders...`);
      
      // Delete all orders
      const deletePromises = orders.map(order => 
        api.delete(`/orders/${order._id}`).catch(err => console.error(`Failed to delete order ${order._id}:`, err))
      );
      
      await Promise.all(deletePromises);
      
      console.log(`✅ All orders cleared successfully`);
      setOrders([]);
      setClearConfirm(false);
      showToast("All orders cleared successfully!", "success");
    } catch (error) {
      console.error("Clear orders error:", error);
      showToast("Failed to clear orders.", "error");
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    setProfileError("");
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setProfileError("Name and email are required.");
      return;
    }
    setProfileLoading(true);
    try {
      await updateProfile({
        name: profileForm.name,
        email: profileForm.email,
      });
      setEditMode(false);
      showToast("Profile updated successfully.");
    } catch (err) {
      setProfileError(err.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileCancel = () => {
    setProfileForm({ name: user?.name || "", email: user?.email || "" });
    setProfileError("");
    setEditMode(false);
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    setPasswordError("");
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setPasswordLoading(true);
    try {
      await api.put('/users/profile', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast("Password changed successfully.");
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRequestRefund = async (e) => {
    e.preventDefault();
    if (!refundReason.trim() || refundReason.length < 10) {
      showToast("Please provide a reason (minimum 10 characters).", "error");
      return;
    }

    if (!selectedOrder?._id) {
      showToast("No order selected. Please try again.", "error");
      return;
    }

    setRefundLoading(true);
    try {
      console.log(`🔄 Submitting refund request for order:`, selectedOrder._id);
      const response = await api.post("/payments/request-refund", {
        orderId: selectedOrder._id,
        reason: refundReason.trim(),
        userId: user._id
      });

      console.log(`✅ Refund request response:`, response.data);

      if (response.data?.success) {
        showToast(response.data?.message || "✅ Refund request submitted successfully!", "success");
        setRefundReason("");
        setSelectedOrder(null);
      } else {
        showToast(response.data?.message || "Failed to submit refund request", "error");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error?.message ||
                          err.message || 
                          "Failed to request refund";
      
      console.error(`❌ Refund request error:`, {
        message: errorMessage,
        status: err.response?.status,
        data: err.response?.data,
        fullError: err
      });

      showToast(errorMessage, "error");
    } finally {
      setRefundLoading(false);
    }
  };

  if (!user) return null;

  return (
    <UserLayout showFooter={false} showHeader={false}>
      <UserSidebar />
      <div className="min-h-screen bg-[#FFF9F5] font-body py-12 ml-80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="space-y-6">

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-20 right-6 z-50 px-6 py-3.5 rounded-2xl shadow-xl font-black text-sm text-white
                ${toast.type === "error" ? "bg-danger" : "bg-success"}`}
            >
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-orange-500 to-rose-600 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 border-2 border-white/30 rounded-[1.5rem] flex items-center justify-center font-black text-3xl text-white flex-shrink-0 backdrop-blur-sm">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/20 border border-white/20 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-2">
                <Sparkles size={11} /> My Account
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight">{user.name}</h1>
              <p className="opacity-80 text-sm font-medium mt-0.5">{user.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Profile Info / Edit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[3rem] shadow-xl shadow-orange-100/40 border border-orange-50 p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900">Profile Information</h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Your personal account details</p>
            </div>
            {!editMode && (
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-primary border border-orange-200 font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
              >
                <Pencil size={13} /> Edit
              </motion.button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!editMode ? (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Field label="Full name" value={user.name} icon={User} />
                <Field label="Email address" value={user.email} icon={Mail} />
                <div className="flex items-center gap-4 py-4">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                    {user.role === "admin"
                      ? <ShieldCheck size={16} className="text-primary" />
                      : <GraduationCap size={16} className="text-primary" />}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Account type</p>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest
                      ${user.role === "admin"
                        ? "bg-orange-100 text-primary border border-orange-200"
                        : "bg-blue-50 text-blue-600 border border-blue-200"}`}>
                      {user.role === "admin" ? <ShieldCheck size={11} /> : <GraduationCap size={11} />}
                      {user.role}
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.form key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onSubmit={handleProfileSave} className="space-y-4">
                <InputField label="Full name" name="name" value={profileForm.name}
                  onChange={handleProfileChange} icon={User} placeholder="Your full name" />
                <InputField label="Email address" name="email" type="email" value={profileForm.email}
                  onChange={handleProfileChange} icon={Mail} placeholder="you@university.edu" />

                {profileError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-2xl px-4 py-3">
                    {profileError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={handleProfileCancel}
                    className="flex items-center gap-2 px-5 py-3 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-black text-sm rounded-2xl transition-all">
                    <X size={14} /> Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={profileLoading}
                    className="flex-1 py-3 bg-primary hover:bg-primary-500 disabled:opacity-60 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2 transition-all"
                  >
                    {profileLoading ? "Saving..." : <><Check size={14} /> Save changes</>}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[3rem] shadow-xl shadow-orange-100/40 border border-orange-50 p-8"
        >
          <div className="mb-6">
            <h2 className="font-display text-xl font-bold text-gray-900">Change Password</h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Keep your account secure</p>
          </div>

          <form onSubmit={handlePasswordSave} className="space-y-4">
            <InputField label="Current password" name="currentPassword" type="password"
              value={passwordForm.currentPassword} onChange={handlePasswordChange}
              icon={Lock} placeholder="Your current password" />
            <InputField label="New password" name="newPassword" type="password"
              value={passwordForm.newPassword} onChange={handlePasswordChange}
              icon={KeyRound} placeholder="Min. 6 characters" extra="Must be at least 6 characters" />
            <InputField label="Confirm new password" name="confirmPassword" type="password"
              value={passwordForm.confirmPassword} onChange={handlePasswordChange}
              icon={KeyRound} placeholder="Re-enter new password" />

            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-2xl px-4 py-3">
                {passwordError}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={passwordLoading}
              className="w-full py-4 bg-primary hover:bg-primary-500 disabled:opacity-60 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2 transition-all mt-2"
            >
              {passwordLoading ? "Updating..." : <><KeyRound size={15} /> Update password</>}
            </motion.button>
          </form>
        </motion.div>

        {/* Order History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-[3rem] shadow-xl shadow-orange-100/40 border border-orange-50 p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2"><ShoppingBag size={20} /> Order History</h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Your recent orders and refund requests</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchOrders()}
                disabled={ordersLoading}
                className="p-2 hover:bg-orange-50 rounded-xl transition-all disabled:opacity-50"
              >
                <RefreshCw size={18} className={ordersLoading ? "animate-spin" : ""} />
              </button>
              {orders.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setClearConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-black text-xs transition-all"
                >
                  <Trash2 size={12} /> Clear All
                </motion.button>
              )}
            </div>
          </div>

          {ordersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 animate-pulse rounded w-1/3" />
                    <div className="h-2 bg-gray-200 animate-pulse rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, idx) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border border-gray-100 hover:border-orange-200 rounded-2xl transition-all hover:shadow-lg hover:shadow-orange-100/40 overflow-hidden"
                >
                  {/* Order header */}
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <div>
                      <p className="font-black text-sm text-gray-900">Order #{order._id?.slice(-8).toUpperCase() || "—"}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        order.paymentStatus === "Completed"
                          ? "bg-green-50 text-green-600 border-green-200"
                          : "bg-amber-50 text-amber-600 border-amber-200"
                      }`}>
                        {order.paymentStatus}
                      </span>
                      {order.paymentStatus === "Completed" && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 font-black text-xs transition-all"
                        >
                          <AlertCircle size={12} /> Refund
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Order items */}
                  <div className="p-4">
                    {order.items && order.items.length > 0 ? (
                      <div className="space-y-3">
                        {order.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                            {/* Food item image */}
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                              {item.foodItem?.image || item.image ? (
                                <img
                                  src={item.foodItem?.image || item.image}
                                  alt={item.foodItem?.name || item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                  <ShoppingBag size={24} className="text-gray-400" />
                                </div>
                              )}
                            </div>

                            {/* Item details */}
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-sm text-gray-900">{item.foodItem?.name || item.name || "Food Item"}</p>
                              <p className="text-xs text-gray-500 font-medium mt-0.5">
                                {item.quantity} × Rs. {item.price?.toFixed(2) || "0.00"}
                              </p>
                              <p className="text-xs text-gray-900 font-black mt-1">
                                Subtotal: Rs. {((item.quantity || 1) * (item.price || 0)).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 text-center py-4">No items in this order</p>
                    )}
                  </div>

                  {/* Order footer with total */}
                  <div className="p-4 bg-orange-50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs font-black text-gray-600 uppercase tracking-widest">Order Total</p>
                    <p className="font-black text-lg text-primary">Rs. {order.totalAmount?.toFixed(2) || "0.00"}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Refund Request Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[3rem] shadow-2xl p-8 max-w-md w-full"
              >
                <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Request Refund</h3>
                <p className="text-xs text-gray-400 font-medium mb-6">
                  Order #{selectedOrder._id?.slice(-8).toUpperCase()} • Rs. {selectedOrder.totalAmount?.toFixed(2)}
                </p>

                <form onSubmit={handleRequestRefund} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Reason for refund</label>
                    <textarea
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      placeholder="Explain why you want a refund (minimum 10 characters)..."
                      maxLength={500}
                      className="w-full p-3.5 bg-gray-50 border-2 border-gray-200 focus:border-blue-400 rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all resize-none h-28"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">{refundReason.length}/500</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrder(null);
                        setRefundReason("");
                      }}
                      className="flex-1 py-3 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-black text-sm rounded-2xl transition-all"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={refundLoading}
                      className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 transition-all"
                    >
                      {refundLoading ? "Submitting..." : <><Send size={14} /> Request</>}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Clear All Orders Confirmation Modal */}
        <AnimatePresence>
          {clearConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[3rem] shadow-2xl p-8 max-w-md w-full text-center"
              >
                <div className="w-16 h-16 bg-red-100 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={28} className="text-red-600" />
                </div>
                <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Clear All Orders?</h3>
                <p className="text-gray-500 text-sm font-medium mb-6">
                  You have <span className="font-black text-gray-800">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>. Once deleted, they cannot be recovered.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setClearConfirm(false)}
                    className="flex-1 py-3 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-black text-sm rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClearAllOrders}
                    disabled={ordersLoading}
                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 transition-all"
                  >
                    {ordersLoading ? "Clearing..." : <><Trash2 size={14} /> Clear All</>}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserProfilePage;
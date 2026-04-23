import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Search, Filter, RefreshCw, Clock, Check, X,
  ThumbsUp, ThumbsDown, Layers, Trash2
} from "lucide-react";
import api from "../utils/api";

const REFUND_LIST_LIMIT = 1000;

const RefundStatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    approved: "bg-green-50 text-green-600 border-green-200",
    rejected: "bg-red-50 text-red-600 border-red-200",
    completed: "bg-blue-50 text-blue-600 border-blue-200",
  };

  const labels = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    completed: "Completed",
  };

  return (
    status === "pending" ? null : (
    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
    )
  );
};

// Helper function to safely extract Order ID
const getOrderId = (orderId) => {
  if (!orderId) return "—";
  // If orderId is populated, prefer the unique orderId generated at placement time.
  if (typeof orderId === 'object') {
    return orderId.orderId || orderId._id || "—";
  }
  // If orderId is already a string, return as-is.
  if (typeof orderId === 'string') {
    return orderId;
  }
  return "—";
};

export default function AdminRefundRequestsPage() {
  const [refundRequests, setRefundRequests] = useState([]);
  const [refundStats, setRefundStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchRefundRequests = async () => {
    setLoading(true);
    try {
      console.log(`🔄 Fetching refund requests with status filter: ${filter}`);
      const res = await api.get(`/payments/refund-requests?status=${filter}&page=1&limit=${REFUND_LIST_LIMIT}`);
      setRefundRequests(res.data.data || []);
      console.log(`✅ Fetched ${(res.data.data || []).length} refund requests:`, res.data.data);
    } catch (error) {
      console.error('❌ Fetch refund requests error:', error.response?.data || error.message);
      setRefundRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch exact totals from server-side pagination metadata to avoid page-size skew.
  const fetchRefundStats = async () => {
    try {
      console.log(`🔄 Fetching refund request stats...`);
      const statuses = ["all", "pending", "approved", "rejected", "completed"];

      const counts = await Promise.all(
        statuses.map(async (status) => {
          const res = await api.get(`/payments/refund-requests?status=${status}&page=1&limit=1`);
          const total = Number(
            res?.data?.pagination?.total ??
            (Array.isArray(res?.data?.data) ? res.data.data.length : 0)
          );
          return [status, total];
        })
      );

      const countMap = Object.fromEntries(counts);
      setRefundStats({
        total: countMap.all || 0,
        pending: countMap.pending || 0,
        approved: countMap.approved || 0,
        rejected: countMap.rejected || 0,
        completed: countMap.completed || 0,
      });
      console.log(`✅ Refund stats loaded:`, countMap);
    } catch (error) {
      console.error('❌ Fetch refund stats error:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchRefundRequests();
    fetchRefundStats();
  }, []);

  useEffect(() => {
    fetchRefundRequests();
  }, [filter]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRequestAction = async (action) => {
    setActionLoading(true);
    try {
      console.log(`🔄 Processing ${action} for refund request:`, selectedRequest._id);
      const res = await api.patch(`/payments/refund-requests/${selectedRequest._id}`, {
        action,
        adminNotes
      });

      console.log(`✅ Response received:`, res.data);
      
      if (res.data.success) {
        console.log(`✅ Refund request ${action}ed successfully`);
        
        // Immediately update UI for smoother experience
        const updatedRequest = res.data.data;
        setRefundRequests(prev => 
          prev.map(req => 
            req._id === selectedRequest._id 
              ? { ...req, ...updatedRequest }
              : req
          )
        );
        
        showToast(`✅ Refund request ${action}ed successfully`, "success");
        setSelectedRequest(null);
        setAdminNotes("");
        
        // Re-fetch after a short delay to ensure backend is synced
        setTimeout(() => {
          console.log(`🔄 Re-fetching refund requests to sync state`);
          fetchRefundRequests();
          fetchRefundStats();
        }, 500);
      } else {
        console.error(`❌ API returned success: false`, res.data);
        showToast(res.data.message || "Failed to process refund request", "error");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred";
      const errorDetails = error.response?.data || error;
      
      console.error(`❌ ${action} error:`, {
        message: errorMessage,
        status: error.response?.status,
        details: errorDetails
      });
      
      showToast(errorMessage || `Failed to ${action} refund request`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRequest = async (request) => {
    const confirmed = window.confirm(`Delete refund request for order ${getOrderId(request.orderId)}?`);
    if (!confirmed) return;

    setDeleteLoadingId(request._id);
    try {
      await api.delete(`/payments/refund-requests/${request._id}`);
      setRefundRequests(prev => prev.filter(req => req._id !== request._id));
      await fetchRefundStats();
      showToast("Refund request deleted successfully.", "success");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete refund request";
      console.error('❌ Delete refund request error:', error.response?.data || error.message);
      showToast(errorMessage, "error");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const filteredRequests = refundRequests.filter(req => {
    const matchSearch = 
      req._id?.toLowerCase().includes(search.toLowerCase()) ||
      getOrderId(req.orderId).toLowerCase().includes(search.toLowerCase()) ||
      req.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      req.reason?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const pendingCount = refundStats.pending;
  const approvedCount = refundStats.approved;
  const rejectedCount = refundStats.rejected;
  const completedCount = refundStats.completed;
  const totalCount = refundStats.total;

  const handleStatClick = (statFilter) => {
    console.log(`📊 Clicked stat card, changing filter to: ${statFilter}`);
    setFilter(statFilter);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-blue-50/30 p-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-black text-gray-900 mb-2">
              Refund Requests Management
            </h1>
            <p className="text-gray-500 font-medium">
              Review and manage customer refund requests
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Requests", value: totalCount, icon: Layers, color: "blue", type: "all" },
            { label: "Pending", value: pendingCount, icon: Clock, color: "amber", type: "pending" },
            { label: "Approved", value: approvedCount, icon: Check, color: "green", type: "approved" },
            { label: "Rejected", value: rejectedCount, icon: X, color: "red", type: "rejected" },
            { label: "Completed", value: completedCount, icon: ThumbsUp, color: "blue", type: "completed" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => handleStatClick(stat.type)}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-${stat.color}-50 border-2 border-${stat.color}-200 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-lg hover:border-${stat.color}-300`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-black text-${stat.color}-600 uppercase tracking-widest`}>
                    {stat.label}
                  </p>
                  <p className="text-3xl font-black text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                  <stat.icon size={24} className={`text-${stat.color}-600`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -10, x: 50 }}
            className={`fixed top-6 right-6 px-6 py-4 rounded-2xl text-white font-black text-sm z-50 shadow-lg ${
              toast.type === "success" ? "bg-green-500 shadow-green-500/30" : "bg-red-500 shadow-red-500/30"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters and Search */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, user, or reason..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-gray-200 focus:border-violet-400 rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-2xl px-4 py-2 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer">
            <Filter size={15} className="text-gray-400 shrink-0" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="bg-transparent text-gray-700 font-black text-sm focus:outline-none cursor-pointer"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
              <option value="all">All Requests</option>
            </select>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              fetchRefundRequests();
              fetchRefundStats();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-2xl text-gray-600 font-black text-sm hover:border-gray-300 transition-all"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </motion.button>
        </div>
      </motion.div>

      {/* Refund Requests Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-[3rem] shadow-xl shadow-violet-100/40 border border-violet-50 overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 border-b border-violet-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <AlertTriangle size={18} className="text-amber-600" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-gray-900">
                  {filter === "all" ? "All Refund Requests" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Requests`}
                </h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-gray-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 animate-pulse rounded w-1/3" />
                  <div className="h-2.5 bg-gray-100 animate-pulse rounded w-1/2" />
                </div>
                <div className="w-20 h-7 bg-gray-100 animate-pulse rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-5xl mb-4">📋</p>
            <p className="font-display text-lg font-bold text-gray-700 mb-1">
              {search ? "No matching requests" : "No refund requests"}
            </p>
            <p className="text-gray-400 text-sm font-medium">
              {search ? "Try adjusting your search" : "All set for now!"}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredRequests.map((req, i) => (
              <motion.div
                key={req._id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.03 }}
                className="flex flex-col sm:flex-row sm:items-center gap-4 px-8 py-5 border-b border-gray-50 last:border-0 hover:bg-amber-50/20 transition-colors group"
              >
                <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={16} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900 text-sm">
                    {req.user?.name || req.orderId?.customerName || "—"}
                  </p>
                  <p className="text-xs text-gray-400 font-medium truncate">
                    {req.reason?.substring(0, 60)}...
                  </p>
                </div>
                <RefundStatusBadge status={req.status} />
                <p className="font-black text-gray-900 whitespace-nowrap">
                  Rs. {req.amount?.toFixed(2)}
                </p>
                <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  {req.status === "pending" && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        console.log("🔍 Opening refund request review modal for:", req._id);
                        setSelectedRequest(req);
                        setAdminNotes("");
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 font-black text-xs transition-all"
                    >
                      <AlertTriangle size={12} /> Review
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteRequest(req)}
                    disabled={deleteLoadingId === req._id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-black text-xs transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {deleteLoadingId === req._id ? (
                      <>
                        <div className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={12} /> Delete
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Refund Request Detail Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.45)" }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-md w-full text-left max-h-[90vh] overflow-y-auto"
            >
              <div className="mb-6">
                <h3 className="font-display text-xl font-bold text-gray-900 mb-1">
                  Refund Request Details
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  Status: <span className="font-black text-gray-600 capitalize">{selectedRequest.status}</span>
                </p>
              </div>

              <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-2xl">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    User
                  </p>
                  <p className="text-sm font-black text-gray-900">
                    {selectedRequest.user?.name || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Email
                  </p>
                  <p className="text-sm font-medium text-gray-700">
                    {selectedRequest.user?.email || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Amount
                  </p>
                  <p className="text-lg font-black text-orange-500">
                    Rs. {selectedRequest.amount?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Order ID
                  </p>
                  <p className="text-sm font-mono text-gray-700">
                    #{getOrderId(selectedRequest.orderId)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Reason
                  </p>
                  <p className="text-xs font-medium text-gray-700 leading-relaxed">
                    {selectedRequest.reason}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Requested
                  </p>
                  <p className="text-xs font-medium text-gray-700">
                    {new Date(selectedRequest.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedRequest.status === "pending" && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">
                      Status will change
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-gray-600">Pending</span>
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="text-xs font-black text-gray-600">Approved / Rejected</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">
                      Admin Notes (Optional)
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes for the user or for your records..."
                      maxLength={200}
                      className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all resize-none h-20 focus:border-violet-400"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      {adminNotes.length}/200
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedRequest(null);
                        setAdminNotes("");
                      }}
                      disabled={actionLoading}
                      className="flex-1 py-3 border-2 border-gray-200 hover:border-gray-300 disabled:opacity-60 disabled:cursor-not-allowed text-gray-600 font-black text-sm rounded-2xl transition-all"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: actionLoading ? 1 : 1.02 }}
                      whileTap={{ scale: actionLoading ? 1 : 0.98 }}
                      onClick={() => handleRequestAction("reject")}
                      disabled={actionLoading}
                      className="flex-1 py-3 bg-red-50 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed text-red-600 border border-red-200 font-black text-sm rounded-2xl flex items-center justify-center gap-2 transition-all"
                    >
                      {actionLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ThumbsDown size={14} /> Reject
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: actionLoading ? 1 : 1.02 }}
                      whileTap={{ scale: actionLoading ? 1 : 0.98 }}
                      onClick={() => handleRequestAction("approve")}
                      disabled={actionLoading}
                      className="flex-1 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 transition-all"
                    >
                      {actionLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-green-300 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ThumbsUp size={14} /> Approve
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              )}

              {selectedRequest.status !== "pending" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedRequest(null);
                      setAdminNotes("");
                    }}
                    className="w-full py-3 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-black text-sm rounded-2xl transition-all"
                  >
                    Close
                  </button>
                </div>
              )}

              {selectedRequest.status === "completed" && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">
                    Refund completed
                  </p>
                  <p className="text-xs text-blue-700 font-medium">
                    This refund request has already been processed and marked as completed.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

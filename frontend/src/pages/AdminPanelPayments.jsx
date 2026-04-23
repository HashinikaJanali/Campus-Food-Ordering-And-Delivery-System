import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Search, Filter, RefreshCw, Download,
  TrendingUp, CheckCircle2, XCircle, Clock, RotateCcw,
  AlertTriangle, BarChart2, Users, Store, Calendar, ThumbsUp, ThumbsDown, Trash2
} from "lucide-react";
import api from "../utils/api";

const BarChart = ({ data, color = "#FF6B35" }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-28 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="relative w-full flex items-end justify-center">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.value / max) * 96}px` }}
              transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
              style={{ backgroundColor: color, minHeight: d.value > 0 ? 4 : 0 }}
              className="w-full rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Rs.{d.value.toLocaleString()}
            </div>
          </div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-wide">{d.label}</p>
        </div>
      ))}
    </div>
  );
};

const DonutChart = ({ segments }) => {
  const size = 120, stroke = 22, r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const total = segments.reduce((s, sg) => s + sg.value, 0) || 1;
  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        {segments.map((sg, i) => {
          const pct = sg.value / total;
          const dash = pct * circ;
          const el = (
            <circle key={i} cx={size/2} cy={size/2} r={r}
              fill="none" stroke={sg.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset * circ}
            />
          );
          offset += pct;
          return el;
        })}
      </svg>
      <div className="space-y-1.5">
        {segments.map((sg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: sg.color }} />
            <p className="text-xs font-black text-gray-600 uppercase tracking-wide">{sg.label}</p>
            <p className="text-xs font-black text-gray-900 ml-2">{sg.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const STATUS_MAP = {
  paid:     { color: "bg-green-50 text-green-600 border-green-200", icon: CheckCircle2, label: "Paid" },
  pending:  { color: "bg-amber-50 text-amber-600 border-amber-200", icon: Clock,        label: "Pending" },
  refunded: { color: "bg-blue-50 text-blue-600 border-blue-200",   icon: RotateCcw,    label: "Refunded" },
  failed:   { color: "bg-red-50 text-red-500 border-red-200",      icon: XCircle,      label: "Failed" },
  refund_pending:  { color: "bg-sky-50 text-sky-600 border-sky-200", icon: AlertTriangle, label: "Request to Refund" },
  refund_approved: { color: "bg-violet-50 text-violet-600 border-violet-200", icon: ThumbsUp, label: "Approved to Refund" },
  refund_rejected: { color: "bg-rose-50 text-rose-600 border-rose-200", icon: ThumbsDown, label: "Rejected Refund" },
};

const PaymentBadge = ({ status }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${s.color}`}>
      <Icon size={10} /> {s.label}
    </span>
  );
};

const getDisplayPaymentStatus = (payment) => {
  const paymentStatus = String(payment?.status || "").toLowerCase();
  const refundStatus = String(payment?.refundRequestStatus || "").toLowerCase();

  if (paymentStatus === "refunded") return "refunded";
  if (refundStatus === "pending") return "refund_pending";
  if (refundStatus === "approved") return "refund_approved";
  if (refundStatus === "rejected") return "refund_rejected";
  if (paymentStatus === "paid") return "paid";
  if (paymentStatus === "failed") return "failed";
  return paymentStatus || "pending";
};

const RefundModal = ({ payment, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.45)" }}>
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-sm w-full text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
        <RotateCcw size={28} className="text-blue-600" />
      </div>
      <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Mark as Refunded?</h3>
      <p className="text-gray-500 text-sm font-medium mb-2">
        Payment of <span className="font-black text-gray-800">Rs. {payment?.amount?.toFixed(2)}</span> by{" "}
        <span className="font-black text-gray-800">{payment?.user?.name || payment?.userName}</span> will be marked as refunded.
      </p>
      <p className="text-[10px] text-gray-400 font-medium mb-6">This action cannot be undone.</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-3 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-black text-sm rounded-2xl transition-all">Cancel</button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onConfirm} disabled={loading}
          className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 transition-all">
          {loading ? "Processing..." : <><RotateCcw size={14} /> Refund</>}
        </motion.button>
      </div>
    </motion.div>
  </div>
);

const AdminPanelPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [chartPeriod, setChartPeriod] = useState("daily");
  const [refundTarget, setRefundTarget] = useState(null);
  const [refundLoading, setRefundLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [toast, setToast] = useState(null);
  
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/payments");
      const data = res.data.data || res.data || [];
      
      // Map order payment status to payment status for UI
      const mappedData = data.map(payment => ({
        ...payment,
        refundRequestStatus: payment.refundRequestStatus || null,
        status: payment.status === "completed" ? "paid" : payment.status || "pending",
        displayStatus: getDisplayPaymentStatus({
          ...payment,
          status: payment.status === "completed" ? "paid" : payment.status || "pending",
        })
      }));
      
      setPayments(mappedData);
      console.log(`✅ Fetched ${mappedData.length} payments`);
    } catch (error) {
      console.error('Fetch payments error:', error.response?.data || error.message);
      setPayments([]);
      showToast("Failed to load payments.", "error");
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPayments(); }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRefund = async () => {
    setRefundLoading(true);
    try {
      await api.patch(`/payments/${refundTarget._id}/refund`);
      setPayments(prev => prev.map(p => p._id === refundTarget._id
        ? { ...p, status: "refunded", displayStatus: "refunded", refundRequestStatus: "completed" }
        : p
      ));
      showToast(`Payment of Rs.${refundTarget.amount?.toFixed(2)} marked as refunded.`);
      setRefundTarget(null);
      console.log(`✅ Payment ${refundTarget._id} marked as refunded`);
    } catch (error) {
      console.error('Refund error:', error.response?.data || error.message);
      showToast(error.response?.data?.message || "Failed to process refund.", "error");
    }
    finally { setRefundLoading(false); }
  };

  const handleDeletePayment = async (payment) => {
    const confirmed = window.confirm(`Delete payment ${payment.orderId || payment._id}? This will also remove linked refund requests.`);
    if (!confirmed) return;

    setDeleteLoadingId(payment._id);
    try {
      await api.delete(`/payments/${payment._id}`);
      setPayments(prev => prev.filter(p => p._id !== payment._id));
      showToast("Payment deleted successfully.");
    } catch (error) {
      console.error('Delete payment error:', error.response?.data || error.message);
      showToast(error.response?.data?.message || "Failed to delete payment.", "error");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const exportCSV = () => {
    const headers = ["Order ID", "ID", "User", "Amount", "Status", "Canteen", "Date"];
    const rows = filtered.map(p => [
      p.orderId || p._id,
      p._id?.slice(-8).toUpperCase(),
      p.user?.name || p.userName || "—",
      p.amount?.toFixed(2),
      p.status,
      p.canteen?.name || p.canteenName || "—",
      p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—",
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `payments_report_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast("CSV exported successfully.");
  };

  const filtered = payments.filter(p => {
    const matchSearch =
      p._id?.toLowerCase().includes(search.toLowerCase()) ||
      p.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.userName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.displayStatus === statusFilter;
    const matchFrom = !dateRange.from || new Date(p.createdAt) >= new Date(dateRange.from);
    const matchTo = !dateRange.to || new Date(p.createdAt) <= new Date(dateRange.to + "T23:59:59");
    return matchSearch && matchStatus && matchFrom && matchTo;
  });

  const totalRevenue  = payments.filter(p => p.status === "paid").reduce((s, p) => s + (p.amount || 0), 0);
  const totalRefunded = payments.filter(p => p.status === "refunded").reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending  = payments.filter(p => p.status === "pending").reduce((s, p) => s + (p.amount || 0), 0);

  const getChartData = () => {
    const paid = payments.filter(p => p.status === "paid" && p.createdAt);
    const now = new Date();
    if (chartPeriod === "daily") {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now); d.setDate(d.getDate() - (6 - i));
        return {
          label: d.toLocaleDateString("en", { weekday: "short" }),
          value: paid.filter(p => new Date(p.createdAt).toDateString() === d.toDateString()).reduce((s, p) => s + (p.amount || 0), 0),
        };
      });
    }
    if (chartPeriod === "weekly") {
      return Array.from({ length: 6 }, (_, i) => {
        const weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - (5 - i) * 7);
        const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6);
        return {
          label: `W${i + 1}`,
          value: paid.filter(p => { const d = new Date(p.createdAt); return d >= weekStart && d <= weekEnd; }).reduce((s, p) => s + (p.amount || 0), 0),
        };
      });
    }
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        label: d.toLocaleDateString("en", { month: "short" }),
        value: paid.filter(p => { const pd = new Date(p.createdAt); return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear(); }).reduce((s, p) => s + (p.amount || 0), 0),
      };
    });
  };

  const topStudents = Object.values(
    payments.filter(p => p.status === "paid").reduce((acc, p) => {
      const key = p.user?._id || p.userId || "unknown";
      const name = p.user?.name || p.userName || "Unknown";
      if (!acc[key]) acc[key] = { name, total: 0, count: 0 };
      acc[key].total += p.amount || 0; acc[key].count += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.total - a.total).slice(0, 5);

  const byCanteen = Object.values(
    payments.filter(p => p.status === "paid").reduce((acc, p) => {
      const key = p.canteen?._id || "unknown";
      const name = p.canteen?.name || p.canteenName || "Unknown";
      if (!acc[key]) acc[key] = { name, total: 0 };
      acc[key].total += p.amount || 0;
      return acc;
    }, {})
  ).sort((a, b) => b.total - a.total).slice(0, 5);

  const statusBreakdown = [
    { label: "Paid",     value: payments.filter(p => p.status === "paid").length,     color: "#10B981" },
    { label: "Pending",  value: payments.filter(p => p.status === "pending").length,  color: "#F59E0B" },
    { label: "Refunded", value: payments.filter(p => p.status === "refunded").length, color: "#3B82F6" },
    { label: "Failed",   value: payments.filter(p => p.status === "failed").length,   color: "#EF4444" },
  ].filter(s => s.value > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8 py-8 font-body">
      <style>{`@media print { body > *:not(#print-report) { display: none !important; } #print-report { display: block !important; } }`}</style>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-6 py-3.5 rounded-2xl shadow-xl font-black text-sm text-white ${toast.type === "error" ? "bg-danger" : "bg-success"}`}>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {refundTarget && <RefundModal payment={refundTarget} onConfirm={handleRefund} onCancel={() => setRefundTarget(null)} loading={refundLoading} />}
      </AnimatePresence>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-violet-500 to-purple-700 rounded-[3rem] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute top-0 right-0 text-[8rem] opacity-10 leading-none select-none">💳</div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 border border-white/20 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-4">
              <CreditCard size={12} /> Payment Management
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold mb-2">Payments</h1>
            <p className="opacity-80 text-sm font-medium">{payments.length} total transactions</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 border border-white/20 rounded-2xl font-black text-sm transition-all">
              <Download size={15} /> CSV
            </button>
            <button onClick={fetchPayments} className="p-3 bg-white/20 hover:bg-white/30 border border-white/20 rounded-2xl transition-all">
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Payments", value: payments.length,                  color: "from-violet-400 to-violet-600", shadow: "shadow-violet-200", icon: CreditCard },
          { label: "Paid",           value: `Rs.${totalRevenue.toFixed(0)}`,  color: "from-green-400 to-green-600",   shadow: "shadow-green-200",  icon: CheckCircle2 },
          { label: "Refunded",       value: `Rs.${totalRefunded.toFixed(0)}`, color: "from-blue-400 to-blue-600",     shadow: "shadow-blue-200",   icon: RotateCcw },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className={`bg-gradient-to-br ${s.color} rounded-[2rem] p-6 text-white shadow-xl ${s.shadow}`}>
            <s.icon size={22} className="opacity-80 mb-3" />
            <p className="text-2xl font-black leading-none mb-1">{s.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-75">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by ID or user..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-gray-200 focus:border-violet-400 rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all shadow-sm" />
        </div>
        <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-2xl px-4 py-2 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer">
          <Filter size={15} className="text-gray-400 shrink-0" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-transparent text-gray-700 font-black text-sm focus:outline-none cursor-pointer">
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="refund_pending">Request to Refund</option>
            <option value="refund_approved">Approved to Refund</option>
            <option value="refund_rejected">Rejected Refund</option>
            <option value="refunded">Refunded</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-2xl px-4 py-2 shadow-sm">
          <Calendar size={15} className="text-gray-400 shrink-0" />
          <input type="date" value={dateRange.from} onChange={e => setDateRange(d => ({ ...d, from: e.target.value }))}
            className="bg-transparent text-gray-700 font-black text-sm focus:outline-none" />
          <span className="text-gray-300 font-black">—</span>
          <input type="date" value={dateRange.to} onChange={e => setDateRange(d => ({ ...d, to: e.target.value }))}
            className="bg-transparent text-gray-700 font-black text-sm focus:outline-none" />
        </div>
      </div>

      <p className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Showing {filtered.length} of {payments.length} payments</p>

      {/* Payments Table */}
      <div className="bg-white rounded-[3rem] shadow-xl shadow-violet-100/40 border border-violet-50 overflow-hidden">
        {loading ? [1,2,3,4,5].map(i => (
          <div key={i} className="flex items-center gap-4 px-8 py-5 border-b border-gray-50 last:border-0">
            <div className="w-10 h-10 rounded-2xl bg-gray-100 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2"><div className="h-3 bg-gray-100 animate-pulse rounded-full w-1/3" /><div className="h-2.5 bg-gray-100 animate-pulse rounded-full w-1/2" /></div>
            <div className="w-20 h-7 bg-gray-100 animate-pulse rounded-xl" />
            <div className="w-24 h-7 bg-gray-100 animate-pulse rounded-xl" />
          </div>
        )) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-5xl mb-4">💳</p>
            <p className="font-display text-lg font-bold text-gray-700 mb-1">No payments found</p>
            <p className="text-gray-400 text-sm font-medium">Try adjusting your filters</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((payment, i) => (
              <motion.div key={payment._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }} transition={{ delay: i * 0.03 }}
                className="flex flex-col sm:flex-row sm:items-center gap-4 px-8 py-5 border-b border-gray-50 last:border-0 hover:bg-violet-50/20 transition-colors group">
                <div className="w-10 h-10 bg-violet-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <CreditCard size={16} className="text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900 text-sm">#{payment.orderId || payment._id || "—"}</p>
                  <p className="text-xs text-gray-400 font-medium truncate">
                    {payment.user?.name || payment.userName || "Guest"} · {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : "—"}
                  </p>
                </div>
                <p className="text-xs text-gray-500 font-black hidden md:block truncate max-w-[120px]">
                  {payment.canteen?.name || payment.canteenName || "—"}
                </p>
                <PaymentBadge status={payment.displayStatus || payment.status} />
                <p className="font-black text-gray-900 text-base whitespace-nowrap">Rs. {payment.amount?.toFixed(2) || "—"}</p>
                <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  {payment.displayStatus === "refund_approved" && (
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setRefundTarget(payment)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 font-black text-xs transition-all">
                      <RotateCcw size={12} /> Refund
                    </motion.button>
                  )}
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeletePayment(payment)}
                    disabled={deleteLoadingId === payment._id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-black text-xs transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                    {deleteLoadingId === payment._id ? (
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
      </div>
    </div>
  );
};

export default AdminPanelPayments;
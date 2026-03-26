import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, ShoppingBag, Package, MessageSquare, TrendingUp,
  Star, Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight, RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const StatusPill = ({ status }) => {
  const map = {
    pending:   { color: "bg-amber-50 text-amber-600 border-amber-200",    icon: Clock },
    preparing: { color: "bg-blue-50 text-blue-600 border-blue-200",       icon: AlertCircle },
    ready:     { color: "bg-purple-50 text-purple-600 border-purple-200", icon: AlertCircle },
    picked_up: { color: "bg-green-50 text-green-600 border-green-200",    icon: CheckCircle2 },
    cancelled: { color: "bg-red-50 text-red-500 border-red-200",          icon: XCircle },
  };
  const s = map[status] || map.pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${s.color}`}>
      <Icon size={10} /> {status?.replace("_", " ")}
    </span>
  );
};

const RolePill = ({ role }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border
    ${role === "admin" ? "bg-orange-50 text-primary border-orange-200" : "bg-blue-50 text-blue-600 border-blue-200"}`}>
    {role}
  </span>
);

const Stars = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={12} className={i <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
    ))}
  </div>
);

const Section = ({ title, icon: Icon, count, linkTo, children, loading }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2.5rem] shadow-lg shadow-orange-100/40 border border-orange-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
            <Icon size={17} className="text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-gray-900 text-base leading-none">{title}</h3>
            {count !== undefined && (
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{count} total</p>
            )}
          </div>
        </div>
        <button
          onClick={() => navigate(linkTo)}
          className="flex items-center gap-1.5 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-primary border border-orange-200 font-black text-xs uppercase tracking-widest rounded-xl transition-all"
        >
          View all <ChevronRight size={13} />
        </button>
      </div>
      <div>
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} className="flex items-center gap-4 px-8 py-4 border-b border-gray-50 last:border-0">
              <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 animate-pulse rounded-full w-1/3" />
                <div className="h-2.5 bg-gray-100 animate-pulse rounded-full w-1/2" />
              </div>
              <div className="w-16 h-6 bg-gray-100 animate-pulse rounded-xl" />
            </div>
          ))
        ) : children}
      </div>
    </motion.div>
  );
};

const AdminPanelDashboard = () => {
  const [data, setData] = useState({ users: [], orders: [], inventory: [], feedback: [] });
  const [loading, setLoading] = useState({ users: true, orders: true, inventory: true, feedback: true });
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = async () => {
    setRefreshing(true);
    const fetchers = [
      { key: "users",     fn: () => api.get("/users") },
      { key: "orders",    fn: () => api.get("/orders") },
      { key: "inventory", fn: () => api.get("/food-items") },
      { key: "feedback",  fn: () => api.get("/feedback") },
    ];
    await Promise.allSettled(
      fetchers.map(async ({ key, fn }) => {
        try {
          const res = await fn();
          setData(prev => ({ ...prev, [key]: res.data.data || res.data || [] }));
        } catch {
          setData(prev => ({ ...prev, [key]: [] }));
        } finally {
          setLoading(prev => ({ ...prev, [key]: false }));
        }
      })
    );
    setRefreshing(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const stats = [
    { label: "Total Users",  value: data.users.length,     icon: Users,        color: "from-orange-400 to-orange-600", shadow: "shadow-orange-200" },
    { label: "Total Orders", value: data.orders.length,    icon: ShoppingBag,  color: "from-blue-400 to-blue-600",     shadow: "shadow-blue-200" },
    { label: "Food Items",   value: data.inventory.length, icon: Package,      color: "from-purple-400 to-purple-600", shadow: "shadow-purple-200" },
    { label: "Feedback",     value: data.feedback.length,  icon: MessageSquare,color: "from-green-400 to-green-600",   shadow: "shadow-green-200" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 font-body">

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-orange-500 to-rose-600 rounded-[3rem] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 border border-white/20 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-4">
              <TrendingUp size={12} /> Admin Overview
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold mb-2">Welcome back 👋</h1>
            <p className="opacity-80 text-sm font-medium">Here's what's happening across your platform today.</p>
          </div>
          <button onClick={fetchAll} disabled={refreshing}
            className="self-start sm:self-auto p-3.5 bg-white/20 hover:bg-white/30 border border-white/20 backdrop-blur-sm rounded-2xl transition-all disabled:opacity-60">
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className={`bg-gradient-to-br ${s.color} rounded-[2rem] p-6 text-white shadow-xl ${s.shadow}`}>
            <s.icon size={24} className="opacity-80 mb-3" />
            <p className="text-3xl font-black leading-none mb-1">{s.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-75">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Users */}
      <Section title="Users" icon={Users} count={data.users.length} linkTo="/admin-panel/users" loading={loading.users}>
        {data.users.length === 0
          ? <div className="py-10 text-center text-gray-400 text-sm font-medium">No users found</div>
          : data.users.slice(0, 5).map((u, i) => (
            <div key={u._id || i} className="flex items-center gap-4 px-8 py-4 border-b border-gray-50 last:border-0 hover:bg-orange-50/20 transition-colors">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${u.role === "admin" ? "bg-orange-100 text-primary" : "bg-blue-100 text-blue-600"}`}>
                {u.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900 truncate">{u.name}</p>
                <p className="text-xs text-gray-400 font-medium truncate">{u.email}</p>
              </div>
              <RolePill role={u.role} />
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${u.active ? "bg-green-500" : "bg-gray-300"}`} />
            </div>
          ))
        }
      </Section>

      {/* Orders */}
      <Section title="Recent Orders" icon={ShoppingBag} count={data.orders.length} linkTo="/admin-panel/orders" loading={loading.orders}>
        {data.orders.length === 0
          ? <div className="py-10 text-center text-gray-400 text-sm font-medium">No orders found</div>
          : data.orders.slice(0, 5).map((o, i) => (
            <div key={o._id || i} className="flex items-center gap-4 px-8 py-4 border-b border-gray-50 last:border-0 hover:bg-orange-50/20 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <ShoppingBag size={15} className="text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900">{o._id?.slice(-8).toUpperCase() || "—"}</p>
                <p className="text-xs text-gray-400 font-medium">{o.user?.name || o.customerName || "Guest"}</p>
              </div>
              <StatusPill status={o.status} />
              <p className="text-sm font-black text-gray-800 whitespace-nowrap">Rs. {o.total?.toFixed(2) || "—"}</p>
            </div>
          ))
        }
      </Section>

      {/* Inventory */}
      <Section title="Inventory" icon={Package} count={data.inventory.length} linkTo="/admin-panel/inventory" loading={loading.inventory}>
        {data.inventory.length === 0
          ? <div className="py-10 text-center text-gray-400 text-sm font-medium">No food items found</div>
          : data.inventory.slice(0, 5).map((item, i) => (
            <div key={item._id || i} className="flex items-center gap-4 px-8 py-4 border-b border-gray-50 last:border-0 hover:bg-orange-50/20 transition-colors">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0">
                {item.image
                  ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-lg">🍽️</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-gray-400 font-medium">{item.canteen?.name || item.category || "—"}</p>
              </div>
              <p className="text-sm font-black text-primary border-2 border-orange-200 px-3 py-1 rounded-xl whitespace-nowrap">Rs. {item.price}</p>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.available !== false ? "bg-green-500" : "bg-gray-300"}`} />
            </div>
          ))
        }
      </Section>

      {/* Feedback */}
      <Section title="Feedback" icon={MessageSquare} count={data.feedback.length} linkTo="/admin-panel/feedback" loading={loading.feedback}>
        {data.feedback.length === 0
          ? <div className="py-10 text-center text-gray-400 text-sm font-medium">No feedback found</div>
          : data.feedback.slice(0, 5).map((f, i) => (
            <div key={f._id || i} className="flex items-start gap-4 px-8 py-4 border-b border-gray-50 last:border-0 hover:bg-orange-50/20 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center font-black text-green-600 text-sm flex-shrink-0 mt-0.5">
                {(f.user?.name || f.name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-black text-gray-900">{f.user?.name || f.name || "Anonymous"}</p>
                  <Stars rating={f.rating || 0} />
                </div>
                <p className="text-xs text-gray-500 font-medium line-clamp-1">{f.comment || f.message || "—"}</p>
              </div>
            </div>
          ))
        }
      </Section>

    </div>
  );
};

export default AdminPanelDashboard;
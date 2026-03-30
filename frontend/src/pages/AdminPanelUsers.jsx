import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Trash2, Users, UserCheck, UserX,
  ShieldCheck, GraduationCap, Filter, RefreshCw, AlertTriangle
} from "lucide-react";
import api from "../utils/api";

const ROLES = ["all", "student", "staff", "faculty"];
const STATUS = ["all", "active", "inactive"];

const RoleBadge = ({ role }) => {
  const roleConfig = {
    student: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", icon: GraduationCap },
    staff: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200", icon: Users },
    faculty: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", icon: ShieldCheck }
  };
  const config = roleConfig[role] || roleConfig.student;
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${config.bg} ${config.text} border ${config.border}`}>
      <Icon size={11} /> {role}
    </span>
  );
};

const StatusBadge = ({ active }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest
    ${active ? "bg-green-50 text-green-600 border border-green-200" : "bg-gray-100 text-gray-400 border border-gray-200"}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-green-500" : "bg-gray-400"}`} />
    {active ? "Active" : "Inactive"}
  </span>
);

const DeleteModal = ({ user, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.45)" }}>
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-sm w-full text-center">
      <div className="w-16 h-16 bg-red-100 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
        <AlertTriangle size={28} className="text-danger" />
      </div>
      <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Delete User?</h3>
      <p className="text-gray-500 text-sm font-medium mb-6">
        <span className="font-black text-gray-800">{user?.name}</span> will be permanently removed.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-3 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-black text-sm rounded-2xl transition-all">Cancel</button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onConfirm} disabled={loading}
          className="flex-1 py-3 bg-danger hover:bg-red-600 disabled:opacity-60 text-white font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2">
          {loading ? "Deleting..." : <><Trash2 size={14} /> Delete</>}
        </motion.button>
      </div>
    </motion.div>
  </div>
);

const AdminPanelUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data.data || res.data || []);
    } catch { showToast("Failed to load users.", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleStatus = async (user) => {
    setActionLoading(user._id);
    try {
      const response = await api.patch(`/users/${user._id}/status`, { active: !user.active });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, active: !u.active } : u));
      showToast(`${user.name} ${!user.active ? "activated" : "deactivated"}.`);
    } catch (error) {
      console.error('Toggle status error:', error.response?.data || error.message);
      showToast(error.response?.data?.message || "Failed to update status.", "error");
    }
    finally { setActionLoading(null); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/users/${deleteTarget._id}`);
      setUsers(prev => prev.filter(u => u._id !== deleteTarget._id));
      showToast(`${deleteTarget.name} deleted.`);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Delete user error:', error.response?.data || error.message);
      showToast(error.response?.data?.message || "Failed to delete user.", "error");
    }
    finally { setDeleteLoading(false); }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || (statusFilter === "active" && u.active) || (statusFilter === "inactive" && !u.active);
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8 py-8 font-body">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-6 py-3.5 rounded-2xl shadow-xl font-black text-sm text-white ${toast.type === "error" ? "bg-danger" : "bg-success"}`}>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {deleteTarget && <DeleteModal user={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-orange-500 to-rose-600 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 text-[8rem] opacity-10 leading-none select-none">👥</div>
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">User Management</h1>
            <p className="opacity-80 text-sm font-medium">{users.length} registered users</p>
          </div>
          <button onClick={fetchUsers} className="p-3.5 bg-white/20 hover:bg-white/30 border border-white/20 rounded-2xl transition-all"><RefreshCw size={18} /></button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: "Total",    value: users.length,                                   color: "bg-orange-50 border-orange-200 text-primary",    icon: Users,           onClick: () => { setRoleFilter("all"); setStatusFilter("all"); } },
          { label: "Active",   value: users.filter(u => u.active).length,             color: "bg-green-50 border-green-200 text-success",      icon: UserCheck,       onClick: () => { setStatusFilter("active"); setRoleFilter("all"); } },
          { label: "Inactive", value: users.filter(u => !u.active).length,            color: "bg-red-50 border-red-200 text-red-600",          icon: UserX,           onClick: () => { setStatusFilter("inactive"); setRoleFilter("all"); } },
          { label: "Students", value: users.filter(u => u.role === "student").length, color: "bg-blue-50 border-blue-200 text-blue-600",       icon: GraduationCap,   onClick: () => { setRoleFilter("student"); setStatusFilter("all"); } },
          { label: "Staff",    value: users.filter(u => u.role === "staff").length,   color: "bg-purple-50 border-purple-200 text-purple-600", icon: Users,           onClick: () => { setRoleFilter("staff"); setStatusFilter("all"); } },
        ].map((s, i) => (
          <button 
            key={i} 
            onClick={s.onClick}
            className={`${s.color} border rounded-2xl p-4 flex items-center gap-3 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer active:scale-95`}>
            <s.icon size={20} />
            <div><p className="text-2xl font-black leading-none">{s.value}</p><p className="text-[10px] font-black uppercase tracking-widest opacity-70">{s.label}</p></div>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-gray-200 focus:border-primary rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all shadow-sm" />
        </div>
        <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-2xl px-4 py-2 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer">
          <ShieldCheck size={15} className="text-gray-400 shrink-0" />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="bg-transparent text-gray-700 font-black text-sm focus:outline-none cursor-pointer">
            {ROLES.map(r => <option key={r} value={r}>{r === "all" ? "All Roles" : r}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-2xl px-4 py-2 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer">
          <Filter size={15} className="text-gray-400 shrink-0" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-transparent text-gray-700 font-black text-sm focus:outline-none cursor-pointer">
            {STATUS.map(s => <option key={s} value={s}>{s === "all" ? "All Status" : s}</option>)}
          </select>
        </div>
      </div>

      <p className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Showing {filtered.length} of {users.length} users</p>

      <div className="bg-white rounded-[3rem] shadow-xl shadow-orange-100/40 border border-orange-50 overflow-hidden">
        {loading ? [1,2,3,4,5].map(i => (
          <div key={i} className="flex items-center gap-4 px-8 py-5 border-b border-gray-50 last:border-0">
            <div className="w-11 h-11 rounded-2xl bg-gray-100 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2"><div className="h-3 bg-gray-100 animate-pulse rounded-full w-1/3" /><div className="h-2.5 bg-gray-100 animate-pulse rounded-full w-1/2" /></div>
            <div className="w-20 h-7 bg-gray-100 animate-pulse rounded-xl" />
          </div>
        )) : filtered.length === 0 ? (
          <div className="py-20 text-center"><p className="text-5xl mb-4">🔍</p><p className="font-display text-lg font-bold text-gray-700">No users found</p></div>
        ) : (
          <AnimatePresence>
            {filtered.map((user, i) => (
              <motion.div key={user._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: i * 0.03 }}
                className="flex flex-col sm:flex-row sm:items-center gap-4 px-8 py-5 border-b border-gray-50 last:border-0 hover:bg-orange-50/20 transition-colors group">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 ${user.role === "staff" ? "bg-purple-100 text-purple-600" : user.role === "faculty" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900 text-sm uppercase tracking-tight">{user.name}</p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5 truncate">{user.email}</p>
                </div>
                <RoleBadge role={user.role} />
                <StatusBadge active={user.active} />
                <p className="text-xs text-gray-400 font-medium whitespace-nowrap hidden lg:block">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                </p>
                <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => handleToggleStatus(user)} disabled={actionLoading === user._id}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-xs transition-all disabled:opacity-50
                      ${user.active ? "bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-danger border border-gray-200 hover:border-red-200"
                        : "bg-green-50 hover:bg-green-100 text-success border border-green-200"}`}>
                    {actionLoading === user._id ? <RefreshCw size={13} className="animate-spin" />
                      : user.active ? <><UserX size={13} /> Deactivate</> : <><UserCheck size={13} /> Activate</>}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setDeleteTarget(user)}
                    className="p-2.5 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-danger border border-gray-200 hover:border-red-200 transition-all">
                    <Trash2 size={14} />
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

export default AdminPanelUsers;
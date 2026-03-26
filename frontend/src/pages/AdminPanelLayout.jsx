import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, ShoppingBag, Package,
  MessageSquare, LogOut, Menu, ChevronRight, Zap
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/admin-panel",           label: "Dashboard",         icon: LayoutDashboard, end: true },
  { to: "/admin-panel/users",     label: "User Management",   icon: Users },
  { to: "/admin-panel/orders",    label: "Order Management",  icon: ShoppingBag },
  { to: "/admin-panel/inventory", label: "Inventory",         icon: Package },
  { to: "/admin-panel/feedback",  label: "Feedback",          icon: MessageSquare },
];

const AdminPanelLayout = () => {
  const { admin, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-lg leading-none">Grab &amp; Go</p>
            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to} to={to} end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all group ${
                isActive
                  ? "bg-white text-primary shadow-lg shadow-black/20"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? "text-primary" : "text-white/70 group-hover:text-white"} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} className="text-primary/50" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-5 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0">
            {admin?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-white truncate leading-none">{admin?.name || 'Admin User'}</p>
            <p className="text-[10px] text-white/50 font-medium uppercase tracking-widest mt-0.5">Admin</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-white/70 hover:bg-white/10 hover:text-white font-black text-sm transition-all"
        >
          <LogOut size={17} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 font-body overflow-hidden">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-gradient-to-b from-orange-500 to-rose-600 flex-col flex-shrink-0 shadow-2xl shadow-orange-900/30">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-gradient-to-b from-orange-500 to-rose-600 flex flex-col shadow-2xl lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Top Bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-gray-200 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-orange-50 text-primary hover:bg-orange-100 transition-all"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-primary" />
            <span className="font-display font-bold text-gray-900">Admin Panel</span>
          </div>
          <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center font-black text-primary text-sm">
            {admin?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#FFF9F5] p-8">
          <Outlet context={{ admin }} />
          {/* Default Dashboard View */}
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Admin Panel</h1>
            <p className="text-gray-600 mb-8">Select a section from the sidebar to get started</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <Users className="text-primary mb-4" size={32} />
                <h3 className="font-bold text-lg mb-2">User Management</h3>
                <p className="text-gray-600 text-sm">Manage system users and permissions</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <ShoppingBag className="text-primary mb-4" size={32} />
                <h3 className="font-bold text-lg mb-2">Order Management</h3>
                <p className="text-gray-600 text-sm">Track and manage orders</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <Package className="text-primary mb-4" size={32} />
                <h3 className="font-bold text-lg mb-2">Inventory</h3>
                <p className="text-gray-600 text-sm">Manage inventory and stock</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <MessageSquare className="text-primary mb-4" size={32} />
                <h3 className="font-bold text-lg mb-2">Feedback</h3>
                <p className="text-gray-600 text-sm">View user feedback and reviews</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanelLayout;
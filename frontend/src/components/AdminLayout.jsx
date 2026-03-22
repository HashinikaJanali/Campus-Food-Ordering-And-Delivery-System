import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, UtensilsCrossed, Package, Tag, Bell,
  Eye, LogOut, Menu, X, ChefHat, ExternalLink, BarChart3, Store
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/food-items', icon: UtensilsCrossed, label: 'Food Items' },
  { path: '/admin/inventory', icon: Package, label: 'Inventory' },
  { path: '/admin/categories', icon: Tag, label: 'Categories' },
  { path: '/admin/alerts', icon: Bell, label: 'Alerts' },
  { path: '/admin/canteens', icon: Store, label: 'Canteens' },
  { path: '/admin/menu-preview', icon: Eye, label: 'Menu Preview' },
  { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  useEffect(() => {
    fetchAlertCount();
    const interval = setInterval(fetchAlertCount, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchAlertCount = async () => {
    try {
      const res = await api.get('/alerts?isRead=false&isResolved=false');
      setUnreadAlerts(res.data.unreadCount || 0);
    } catch { }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-body">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-30
        transition-transform duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto shadow-sm
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-admin-400 to-admin-600 rounded-xl flex items-center justify-center shadow-orange">
              <ChefHat size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-gray-900 text-base leading-tight">Grab & Go</h1>
              <p className="text-xs text-gray-400 font-body">Inventory Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-admin-50 text-admin-600 font-semibold shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }
              `}
            >
              <Icon size={18} />
              <span className="font-display">{label}</span>
              {label === 'Alerts' && unreadAlerts > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse-soft">
                  {unreadAlerts > 9 ? '9+' : unreadAlerts}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Student view link */}
        <div className="p-4 border-t border-gray-100">
          <a
            href="/menu"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-gray-500 hover:text-admin-600 hover:bg-admin-50 transition-all duration-200 font-display font-medium"
          >
            <ExternalLink size={16} />
            Student Menu View
          </a>
        </div>

        {/* Admin info + logout */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-admin-400 to-admin-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold font-display">
                  {admin?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 font-display truncate max-w-[100px]">{admin?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{admin?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 hover:text-admin-600 hover:bg-admin-50 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-admin-400 to-admin-600 rounded-lg flex items-center justify-center">
              <ChefHat size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-gray-900 text-sm">Grab & Go</span>
          </div>
          <div className="w-8" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto animate-fade-in">
          <Outlet context={{ refreshAlerts: fetchAlertCount }} />
        </main>
      </div>
    </div>
  );
}

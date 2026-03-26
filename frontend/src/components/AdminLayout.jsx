import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, UtensilsCrossed, Package, Tag, Bell,
  Eye, LogOut, Menu, X, ChefHat, ExternalLink, BarChart3, Store
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import AdminHeader from './AdminHeader';
import Footer from './Footer';


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
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default to open on desktop
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
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <AdminHeader />

      <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
        <div className="flex font-body pt-0 min-h-[calc(100vh-80px)]">
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          <aside className={`
            sticky top-0 h-[calc(100vh-80px)]
            ${sidebarOpen ? 'w-64' : 'w-20 lg:w-20'} 
            bg-white border-r border-gray-100 z-30 flex flex-col shadow-sm hidden lg:flex transition-all duration-300
          `}>
            {/* Sidebar Header with Toggle */}
            <div className={`p-6 border-b border-gray-100 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
              {sidebarOpen && (
                <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
                  <div className="w-10 h-10 bg-gradient-to-br from-admin-400 to-admin-600 rounded-xl flex items-center justify-center shadow-orange shrink-0">
                    <ChefHat size={20} className="text-white" />
                  </div>
                  <div>
                    <h1 className="font-display font-bold text-gray-900 text-lg leading-tight tracking-tight">Grab & Go</h1>
                    <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider">Inventory Admin</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-2 text-gray-400 hover:text-admin-600 hover:bg-admin-50 rounded-lg transition-colors ${!sidebarOpen ? 'mx-auto' : ''}`}
              >
                {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
              {navItems.map(({ path, icon: Icon, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => {
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-admin-50 text-admin-600 font-semibold shadow-sm'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon size={18} className="shrink-0" />
                  {sidebarOpen && <span className="font-display transition-opacity duration-300">{label}</span>}
                  {sidebarOpen && label === 'Alerts' && unreadAlerts > 0 && (
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
                className={`flex items-center ${sidebarOpen ? 'gap-2 px-4' : 'justify-center'} py-3 rounded-xl text-sm text-gray-500 hover:text-admin-600 hover:bg-admin-50 transition-all duration-200 font-display font-medium`}
                title={sidebarOpen ? '' : 'Student Menu View'}
              >
                <ExternalLink size={16} className="shrink-0" />
                {sidebarOpen && <span>Student Menu View</span>}
              </a>
            </div>

            {/* Admin info + logout */}
            <div className="p-4 border-t border-gray-100">
              <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} gap-2`}>
                <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'} min-w-0`}>
                  <div className="w-9 h-9 bg-gradient-to-br from-admin-400 to-admin-600 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-bold font-display">
                      {admin?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {sidebarOpen && (
                    <div className="overflow-hidden whitespace-nowrap">
                      <p className="text-sm font-semibold text-gray-800 font-display truncate max-w-[100px]">{admin?.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{admin?.role}</p>
                    </div>
                  )}
                </div>
                {sidebarOpen && (
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 shrink-0"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 min-w-0">
            <Outlet context={{ refreshAlerts: fetchAlertCount }} />
          </main>
        </div>
        <Footer />
      </div>
    </div>
  );
}

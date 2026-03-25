import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  ChefHat
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import Footer from './Footer';


export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <AdminHeader />

      <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
        <div className="flex font-body pt-0 min-h-[calc(100vh-80px)]">
          
          <AdminSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

          {/* Main content */}
          <main className={`flex-1 p-4 md:p-6 lg:p-8 min-w-0 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-80'}`}>
            <Outlet context={{ refreshAlerts: fetchAlertCount }} />
          </main>
        </div>
      </div>
    </div>
  );
}

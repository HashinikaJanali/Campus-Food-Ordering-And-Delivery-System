import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import AdminSidebar from './AdminSidebar';
import Footer from './Footer';
import socket from '../utils/socket';


export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  useEffect(() => {
    fetchAlertCount();
    
    // Socket listener for real-time updates
    socket.on('alertUpdate', () => {
      fetchAlertCount();
    });

    const interval = setInterval(fetchAlertCount, 60000); // reduced polling to 60s since we have sockets
    
    return () => {
      socket.off('alertUpdate');
      clearInterval(interval);
    };
  }, []);

  const fetchAlertCount = async () => {
    try {
      const res = await api.get('/alerts?isRead=false&isResolved=false&limit=1');
      setUnreadAlerts(res.data.unreadCount || 0);
    } catch { }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
        <div className="flex font-body pt-0 min-h-screen">
          
          <AdminSidebar unreadAlerts={unreadAlerts} />

          {/* Main content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 min-w-0 transition-all duration-300 ml-80">
            <Outlet context={{ refreshAlerts: fetchAlertCount }} />
          </main>
        </div>
      </div>
    </div>
  );
}

import { NavLink, useNavigate } from 'react-router-dom';
import { ClipboardList, History, MapPin, User, LogOut, RefreshCw, Truck, CheckCircle } from 'lucide-react';
import logoImage from '../assets/logo.png';
import { useState } from 'react';
import { useUserAuth } from '../context/UserAuthContext';

export default function DeliverySidebar() {
  const [logoError, setLogoError] = useState(false);
  const navigate = useNavigate();
  const { logout } = useUserAuth();

  const handleLogout = () => {
    logout();
    localStorage.removeItem('delivery_staff_name');
    navigate('/login?role=staff');
  };

  const mainItems = [
    { path: '/delivery-staff', icon: ClipboardList, label: 'Dashboard' },
    { path: '/delivery-staff/assigned', icon: Truck, label: 'Assigned Orders' },
    { path: '/delivery-staff/delivered', icon: CheckCircle, label: 'Delivered' },
    { path: '/delivery-staff/locations', icon: MapPin, label: 'Locations' },
  ];

  const otherItems = [
    { path: '/delivery-staff/profile', icon: User, label: 'Profile' },
  ];

  return (
    <aside className="w-80 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 shadow-sm hidden md:flex flex-col z-40">
      <div className="p-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          {!logoError ? (
            <img src={logoImage} alt="Logo" className="w-full h-full object-contain" onError={() => setLogoError(true)} />
          ) : (
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-full w-full h-full flex items-center justify-center text-white">D</div>
          )}
        </div>
        <div>
          <h1 className="font-display font-bold text-gray-900 text-lg leading-tight tracking-tight">Grab & Go</h1>
          <p className="text-xs text-gray-500 font-body">Delivery Dashboard</p>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 hover:bg-gray-100 transition-colors">
          <RefreshCw size={16} className="text-gray-400" />
          <input type="text" placeholder="Search orders" className="bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none w-full" />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto custom-scrollbar p-3">
        <p className="px-2 text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-3">Main</p>
        <div className="space-y-1">
          {mainItems.map(({ path, icon: Icon, label }) => (
            <NavLink key={path} to={path} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-orange-50 text-orange-600 shadow-sm' : 'text-gray-700 hover:bg-gray-50'}`}>
              <Icon size={18} className="shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        <div className="py-4 border-t border-gray-100">
          <p className="px-2 text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-3">Account</p>
          <div className="space-y-1">
            {otherItems.map(({ path, icon: Icon, label }) => (
              <NavLink key={path} to={path} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-orange-50 text-orange-600 shadow-sm' : 'text-gray-700 hover:bg-gray-50'}`}>
                <Icon size={18} className="shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-100 rounded-lg transition-colors text-sm text-gray-700"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}

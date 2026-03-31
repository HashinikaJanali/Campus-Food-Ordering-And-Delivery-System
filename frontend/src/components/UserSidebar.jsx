import { NavLink, useNavigate } from 'react-router-dom';
import { Home, User, ClipboardList, MapPin, LogOut, Search, CreditCard } from 'lucide-react';
import { useUserAuth } from '../context/UserAuthContext';
import logoImage from '../assets/logo.png';

export default function UserSidebar() {
  const { user, logout } = useUserAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const items = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/profile', icon: User, label: 'View Profile' },
    { to: '/my-orders', icon: ClipboardList, label: 'My Orders' },
    { to: '/track', icon: MapPin, label: 'Track Orders' },
    { to: '/payments', icon: CreditCard, label: 'Payment History' },
  ];

  return (
    <aside className="w-80 hidden lg:flex flex-col h-screen fixed left-0 top-0 z-40">
      <div className="bg-white rounded-none shadow-sm border border-gray-100 p-4 flex-1 flex flex-col">
        {/* Logo / Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 shrink-0">
            <img src={logoImage} alt="Grab & Go" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-orange-500">Grab & Go</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Student</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
            <Search size={16} className="text-gray-400" />
            <input type="text" placeholder="Search..." className="bg-transparent w-full text-sm outline-none" />
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-auto">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.18em] mb-3">Navigation</p>
          <ul className="space-y-1 mb-4">
            {items.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-orange-50 text-orange-600 shadow-sm' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom user card */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-lg">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-gray-900 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-orange-500 uppercase tracking-widest mt-0.5">Student</p>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

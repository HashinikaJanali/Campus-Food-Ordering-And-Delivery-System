import { NavLink, useNavigate } from 'react-router-dom';
import { ClipboardList, History, Search, ChefHat, ChevronDown, Settings, HelpCircle, MapPin, LayoutDashboard, UtensilsCrossed, Package, Tag, Bell, Store, Eye, BarChart3, Edit3, Gift, Ticket, X, ExternalLink, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import logoImage from '../assets/logo.png';
import toast from 'react-hot-toast';

const orderMenuItems = [
  { path: '/orders', icon: ClipboardList, label: 'Orders List' },
  { path: '/history', icon: History, label: 'Order History' },
  { path: '/tracking', icon: MapPin, label: 'Order Tracking' },
];

const inventoryMenuItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/food-items', icon: UtensilsCrossed, label: 'Food Items' },
  { path: '/admin/inventory', icon: Package, label: 'Inventory' },
  { path: '/admin/categories', icon: Tag, label: 'Categories' },
  { path: '/admin/alerts', icon: Bell, label: 'Alerts' },
  { path: '/admin/canteens', icon: Store, label: 'Canteens' },
  { path: '/admin/menu-preview', icon: Eye, label: 'Menu Preview' },
  { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/menu', icon: ExternalLink, label: 'Student Menu', isExternal: true },
];

const promotionsMenuItems = [
  { path: '/admin/promotions', icon: Ticket, label: 'Promotions' },
];

const otherMenuItems = [
  { path: '#', icon: Settings, label: 'Settings' },
  { path: '#', icon: HelpCircle, label: 'Help & Support' },
];

export default function AdminSidebar({ unreadAlerts }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const navigate = useNavigate();
  const { admin, logout } = useAuth();

  // Initialize expandedSections from localStorage
  const [expandedSections, setExpandedSections] = useState(() => {
    const saved = localStorage.getItem('admin_sidebar_expanded');
    return saved ? JSON.parse(saved) : [];
  });

  // Save expandedSections to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('admin_sidebar_expanded', JSON.stringify(expandedSections));
  }, [expandedSections]);

  // Filter menu items based on search query
  const filterItems = (items) => {
    if (!searchQuery) return items;
    return items.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredOrderItems = filterItems(orderMenuItems);
  const filteredInventoryItems = filterItems(inventoryMenuItems);
  const filteredPromotionsItems = filterItems(promotionsMenuItems);
  const filteredOtherItems = filterItems(otherMenuItems);

  const hasResults = filteredOrderItems.length > 0 ||
    filteredInventoryItems.length > 0 ||
    filteredPromotionsItems.length > 0 ||
    filteredOtherItems.length > 0 ||
    'main dashboard'.includes(searchQuery.toLowerCase());

  const toggleSection = (section) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Automatically persist expanded sections when matches are found
  useEffect(() => {
    if (searchQuery) {
      const sectionsToExpand = [];
      if (filteredOrderItems.length > 0) sectionsToExpand.push('order-management');
      if (filteredInventoryItems.length > 0) sectionsToExpand.push('inventory-management');
      if (filteredPromotionsItems.length > 0) sectionsToExpand.push('promotions-management');

      if (sectionsToExpand.length > 0) {
        setExpandedSections(prev => {
          const newSet = new Set([...prev, ...sectionsToExpand]);
          if (newSet.size === prev.length) return prev; // No change
          return [...newSet];
        });
      }
    }
  }, [searchQuery, filteredOrderItems.length, filteredInventoryItems.length, filteredPromotionsItems.length]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('admin_sidebar_expanded');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  return (
    <aside className="bg-white border-r border-gray-200 h-screen fixed left-0 top-0 shadow-sm hidden md:flex flex-col z-40 transition-all duration-300 w-80">
      {/* Logo Section */}
      <div className="pt-6 pb-6 px-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50/30 transition-all">
        <div className="flex items-center justify-center shrink-0 transition-transform hover:scale-105 active:scale-95 w-12 h-12">
          {!logoError ? (
            <img
              src={logoImage}
              alt="Logo"
              className="w-full h-full object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-100">
              <span className="text-2xl">🛍️</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-xl leading-tight tracking-tight bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent truncate">
            Grab & Go
          </h1>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Admin Central</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div
          className={`flex items-center gap-2 rounded-lg transition-all duration-300 border-2 px-3 py-2.5 ${isSearchFocused
            ? 'bg-white border-orange-500 shadow-[0_0_0_4px_rgba(249,115,22,0.1)]'
            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
        >
          <Search
            size={16}
            className={`transition-colors duration-300 ${isSearchFocused ? 'text-orange-500' : 'text-gray-400'}`}
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none w-full font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-gray-400 hover:text-orange-500 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar">
        {!hasResults ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search size={20} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No matches found</p>
            <p className="text-xs text-gray-400 mt-1">Try another keyword</p>
          </div>
        ) : (
          <>
            {/* Groups */}
            <div className="py-2">
              <p className="px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                Management Hub
              </p>

              {/* Main Dashboard - Top Level (Now after Hub title) */}
              {(!searchQuery || 'main dashboard'.includes(searchQuery.toLowerCase())) && (
                <div className="px-3 mb-2 flex justify-center">
                  <NavLink
                    to="/admin/management"
                    className={({ isActive }) => `
                      flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 px-3 py-2.5 w-full
                      ${isActive
                        ? 'bg-orange-50 text-orange-600 shadow-sm border-l-2 border-orange-600 rounded-l-none'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <LayoutDashboard size={18} className="shrink-0" />
                    <span>Main Dashboard</span>
                  </NavLink>
                </div>
              )}

              <div className="space-y-1 px-3">
                {/* Order Management Expandable Section */}
                {(filteredOrderItems.length > 0 || !searchQuery) && (
                  <>
                    <button
                      onClick={() => toggleSection('order-management')}
                      className="flex items-center gap-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 w-full px-3 py-2.5"
                    >
                      <ClipboardList size={18} className="shrink-0" />
                      <span className="flex-1 text-left">Order Management</span>
                      <ChevronDown
                        size={16}
                        className={`shrink-0 transition-transform duration-200 ${expandedSections.includes('order-management') ? 'rotate-180' : ''
                          }`}
                      />
                    </button>

                    {/* Nested Order Management Items */}
                    {expandedSections.includes('order-management') && (
                      <div className="space-y-1 pl-3">
                        {filteredOrderItems.map(({ path, icon: Icon, label }) => (
                          <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) => `
                              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                              ${isActive
                                ? 'bg-orange-50 text-orange-600 shadow-sm border-l-2 border-orange-600 rounded-l-none'
                                : 'text-gray-700 hover:bg-gray-50'
                              }
                            `}
                          >
                            <Icon size={18} className="shrink-0" />
                            <span>{label}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Inventory Management Expandable Section */}
                {(filteredInventoryItems.length > 0 || !searchQuery) && (
                  <>
                    <button
                      onClick={() => toggleSection('inventory-management')}
                      className="flex items-center gap-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 w-full px-3 py-2.5"
                    >
                      <Package size={18} className="shrink-0" />
                      <span className="flex-1 text-left">Inventory Management</span>
                      <ChevronDown
                        size={16}
                        className={`shrink-0 transition-transform duration-200 ${expandedSections.includes('inventory-management') ? 'rotate-180' : ''
                          }`}
                      />
                    </button>

                    {/* Nested Inventory Management Items */}
                    {expandedSections.includes('inventory-management') && (
                      <div className="space-y-1 pl-3">
                        {filteredInventoryItems.map(({ path, icon: Icon, label, isExternal }) => (
                          <NavLink
                            key={path}
                            to={path}
                            target={isExternal ? "_blank" : undefined}
                            rel={isExternal ? "noopener noreferrer" : undefined}
                            className={({ isActive }) => `
                              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                              ${isActive && !isExternal
                                ? 'bg-orange-50 text-orange-600 shadow-sm border-l-2 border-orange-600 rounded-l-none'
                                : 'text-gray-700 hover:bg-gray-50'
                              }
                            `}
                          >
                            <Icon size={18} className="shrink-0" />
                            <span className="flex-1">{label}</span>
                            {label === 'Alerts' && unreadAlerts > 0 && (
                              <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0">
                                {unreadAlerts > 99 ? '99+' : unreadAlerts}
                              </span>
                            )}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Promotions Management Expandable Section */}
                {(filteredPromotionsItems.length > 0 || !searchQuery) && (
                  <>
                    <button
                      onClick={() => toggleSection('promotions-management')}
                      className="flex items-center gap-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 w-full px-3 py-2.5"
                    >
                      <Gift size={18} className="shrink-0" />
                      <span className="flex-1 text-left">Promotion Management</span>
                      <ChevronDown
                        size={16}
                        className={`shrink-0 transition-transform duration-200 ${expandedSections.includes('promotions-management') ? 'rotate-180' : ''
                          }`}
                      />
                    </button>

                    {/* Nested Promotions Management Items */}
                    {expandedSections.includes('promotions-management') && (
                      <div className="space-y-1 pl-3">
                        {filteredPromotionsItems.map(({ path, icon: Icon, label }) => (
                          <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) => `
                              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                              ${isActive
                                ? 'bg-orange-50 text-orange-600 shadow-sm border-l-2 border-orange-600 rounded-l-none'
                                : 'text-gray-700 hover:bg-gray-50'
                              }
                            `}
                          >
                            <Icon size={18} className="shrink-0" />
                            <span>{label}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Others Section */}
            {(filteredOtherItems.length > 0 || !searchQuery) && (
              <div className="py-4 border-t border-gray-100">
                <p className="px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                  Settings & Support
                </p>
                <div className="space-y-1 px-3">
                  {filteredOtherItems.map(({ path, icon: Icon, label }) => (
                    <NavLink
                      key={path}
                      to={path}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                        ${isActive
                          ? 'text-gray-700 hover:bg-gray-50'
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <Icon size={18} className="shrink-0" />
                      <span>{label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </nav>

      {/* User Info Section */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-orange-100">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-black text-gray-900 truncate uppercase mt-1 leading-none">{admin?.name || 'Admin'}</p>
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest truncate mt-1.5">{admin?.role || 'System Admin'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all group"
            title="Logout"
          >
            <LogOut size={18} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </aside>
  );
}

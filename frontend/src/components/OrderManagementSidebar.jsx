import { NavLink } from 'react-router-dom';
import { ClipboardList, History, Search, ChefHat, ChevronDown, Settings, HelpCircle, MapPin, LayoutDashboard, UtensilsCrossed, Package, Tag, Bell, Store, Eye, BarChart3, Edit3 } from 'lucide-react';
import { useState } from 'react';
import logoImage from '../assets/logo.png';

const mainMenuItems = [
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
  { path: '/admin/student-menu', icon: Edit3, label: 'Student Menu View' },
];

const otherMenuItems = [
  { path: '/settings', icon: Settings, label: 'Settings' },
  { path: '/help', icon: HelpCircle, label: 'Help & Support' },
];

export default function OrderManagementSidebar() {
  const [logoError, setLogoError] = useState(false);
  const [expandedSections, setExpandedSections] = useState(['order-management', 'inventory-management']);

  const toggleSection = (section) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 shadow-sm hidden md:flex flex-col z-40">
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          {!logoError ? (
            <img
              src={logoImage}
              alt="Grab & Go"
              className="w-full h-full object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center w-full h-full">
              <ChefHat size={20} className="text-white" />
            </div>
          )}
        </div>
        <div>
          <h1 className="font-display font-bold text-gray-900 text-lg leading-tight tracking-tight">Grab & Go</h1>
          <p className="text-xs text-gray-500 font-body">Admin Dashboard</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 hover:bg-gray-100 transition-colors cursor-pointer">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none w-full"
          />
          <span className="text-xs text-gray-400 font-medium">⌘ S</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Main Menu */}
        <div className="py-4">
          <p className="px-6 text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Main Menu
          </p>
          
          {/* Order Management Expandable Section */}
          <div className="space-y-1 px-3">
            <button
              onClick={() => toggleSection('order-management')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
            >
              <ClipboardList size={18} className="shrink-0" />
              <span className="flex-1 text-left">Order Management</span>
              <ChevronDown 
                size={16}
                className={`shrink-0 transition-transform duration-200 ${
                  expandedSections.includes('order-management') ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Nested Order Management Items */}
            {expandedSections.includes('order-management') && (
              <div className="space-y-1 pl-3">
                {mainMenuItems.map(({ path, icon: Icon, label }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-orange-50 text-orange-600 shadow-sm'
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

            {/* Inventory Management Expandable Section */}
            <button
              onClick={() => toggleSection('inventory-management')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
            >
              <Package size={18} className="shrink-0" />
              <span className="flex-1 text-left">Inventory Management</span>
              <ChevronDown 
                size={16}
                className={`shrink-0 transition-transform duration-200 ${
                  expandedSections.includes('inventory-management') ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Nested Inventory Management Items */}
            {expandedSections.includes('inventory-management') && (
              <div className="space-y-1 pl-3">
                {inventoryMenuItems.map(({ path, icon: Icon, label }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-orange-50 text-orange-600 shadow-sm'
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
          </div>
        </div>

        {/* Others Section */}
        <div className="py-4 border-t border-gray-100">
          <p className="px-6 text-xs font-display font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Others
          </p>
          <div className="space-y-1 px-3">
            {otherMenuItems.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-orange-50 text-orange-600 shadow-sm'
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
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <button className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-100 rounded-lg transition-colors group">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-display font-bold text-sm shrink-0">
            A
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">Admin</p>
            <p className="text-xs text-gray-500 truncate">Order/Inventory Manager</p>
          </div>
          <ChevronDown size={16} className="text-gray-400 group-hover:text-gray-600 shrink-0" />
        </button>
      </div>
    </aside>
  );
}

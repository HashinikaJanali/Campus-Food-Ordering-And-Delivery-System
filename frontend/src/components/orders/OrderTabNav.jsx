//tab bar with live badge counts

import { motion } from 'framer-motion';
import { ClipboardList, Clock, ShoppingBag, CheckCircle, XCircle } from 'lucide-react';

export const ORDER_TABS = [
  { id: 'all',       label: 'All Orders',      icon: ClipboardList },
  { id: 'pending',   label: 'Pending',          icon: Clock },
  { id: 'preparing', label: 'Preparing',        icon: ClipboardList },
  { id: 'ready',     label: 'Ready',            icon: ShoppingBag },
  { id: 'picked_up', label: 'Picked Up',        icon: CheckCircle },
  { id: 'cancelled', label: 'Cancelled',        icon: XCircle },
];

const OrderTabNav = ({ activeTab, onTabChange, counts }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl p-4 shadow-lg"
    >
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {ORDER_TABS.map((tab, index) => (
          <motion.button
            key={tab.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex items-center justify-center gap-2 px-3 sm:px-4 py-3 sm:py-4 rounded-xl font-semibold text-xs sm:text-sm transition-all
              ${activeTab === tab.id
                ? 'bg-gradient-primary text-white shadow-lg'
                : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:border-primary-400'
              }
            `}
          >
            <tab.icon className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            {counts[tab.id] > 0 && (
              <span className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold
                ${activeTab === tab.id ? 'bg-white text-primary-600' : 'bg-primary-500 text-white'}`}>
                {counts[tab.id]}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default OrderTabNav;

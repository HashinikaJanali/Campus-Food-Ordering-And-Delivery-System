//search by ID, name

import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const OrderSearchBar = ({ value, onChange }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.35 }}
      className="relative"
    >
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search by order ID or customer name..."
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border-2 border-gray-200 focus:border-primary-400 focus:outline-none shadow-sm text-gray-700 placeholder-gray-400 transition-colors"
      />
    </motion.div>
  );
};

export default OrderSearchBar;

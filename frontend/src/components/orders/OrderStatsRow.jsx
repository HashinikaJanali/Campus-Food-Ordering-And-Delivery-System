//6-box stats (all statuses)

import { motion } from 'framer-motion';

const STATS_CONFIG = [
  { key: 'all',       label: 'Total Orders', color: 'text-gray-700',   bg: 'bg-gray-50',    border: 'border-gray-200' },
  { key: 'pending',   label: 'Pending',      color: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-200' },
  { key: 'preparing', label: 'Preparing',    color: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-200' },
  { key: 'ready',     label: 'Ready',        color: 'text-purple-600', bg: 'bg-purple-50',  border: 'border-purple-200' },
  { key: 'picked_up', label: 'Picked Up',    color: 'text-green-600',  bg: 'bg-green-50',   border: 'border-green-200' },
  { key: 'cancelled', label: 'Cancelled',    color: 'text-red-500',    bg: 'bg-red-50',     border: 'border-red-200' },
];

const OrderStatsRow = ({ counts }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="grid grid-cols-3 sm:grid-cols-6 gap-3"
    >
      {STATS_CONFIG.map((s, i) => (
        <motion.div
          key={s.key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.05 }}
          className={`${s.bg} border ${s.border} rounded-2xl p-4 text-center shadow-sm`}
        >
          <p className={`text-2xl sm:text-3xl font-bold ${s.color}`}>{counts[s.key] ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default OrderStatsRow;

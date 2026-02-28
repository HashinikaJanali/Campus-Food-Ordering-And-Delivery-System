//revenue, top item, completed count

import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, DollarSign, Clock } from 'lucide-react';

const DailySummaryCard = ({ orders }) => {
  const todayOrders = orders.filter(o => o.date === new Date().toISOString().split('T')[0] || o.date === '2026-02-27');
  const completedOrders = todayOrders.filter(o => o.status === 'picked_up');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingCount = todayOrders.filter(o => o.status === 'pending').length;

  // Most popular item
  const itemCount = {};
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      itemCount[item.name] = (itemCount[item.name] || 0) + item.qty;
    });
  });
  const topItem = Object.entries(itemCount).sort((a, b) => b[1] - a[1])[0];

  const stats = [
    {
      icon: ShoppingBag,
      label: "Today's Orders",
      value: todayOrders.length,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    {
      icon: DollarSign,
      label: "Today's Revenue",
      value: `Rs. ${totalRevenue.toLocaleString()}`,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
    },
    {
      icon: TrendingUp,
      label: 'Completed',
      value: completedOrders.length,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
    },
    {
      icon: Clock,
      label: 'Awaiting',
      value: pendingCount,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-bold text-gray-800 text-lg">Daily Summary</h2>
          <p className="text-sm text-gray-400">Today's performance overview</p>
        </div>
        <span className="text-2xl">📊</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className={`${s.bg} border ${s.border} rounded-xl p-4 text-center`}
          >
            <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {topItem && (
        <div className="bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-100 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="text-xs text-gray-500 font-medium">Most Popular Today</p>
            <p className="font-bold text-gray-800">{topItem[0]} <span className="text-primary-600">({topItem[1]} sold)</span></p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DailySummaryCard;

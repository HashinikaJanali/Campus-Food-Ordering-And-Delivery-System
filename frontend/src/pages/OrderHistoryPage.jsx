//history for both vendor and student

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, RotateCcw } from 'lucide-react';
import { MOCK_ORDERS } from '../constants/orderConstants';
import StatusBadge from '../components/orders/StatusBadge';

const OrderHistoryPage = () => {
  const [expandedId, setExpandedId] = useState(null);
  const [filterDate, setFilterDate] = useState('all');

  const historyOrders = MOCK_ORDERS.filter(o =>
    ['picked_up', 'cancelled'].includes(o.status)
  );

  const dates = [...new Set(historyOrders.map(o => o.date))].sort((a, b) => b.localeCompare(a));

  const filtered = filterDate === 'all'
    ? historyOrders
    : historyOrders.filter(o => o.date === filterDate);

  const totalSpent = filtered
    .filter(o => o.status === 'picked_up')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8 py-10 mb-20">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-primary rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 text-9xl opacity-10">📋</div>
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
        <div className="relative z-10">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="font-display text-3xl sm:text-5xl font-bold mb-3"
          >
            📋 Order History
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl opacity-95"
          >
            View all past completed and cancelled orders
          </motion.p>
        </div>
      </motion.div>

      {/* Summary + Date Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        {/* Summary */}
        <div className="flex-1 grid grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{filtered.filter(o => o.status === 'picked_up').length}</p>
            <p className="text-xs text-gray-500 mt-1">Completed</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">Rs. {totalSpent.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Total Spent</p>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
          <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
          <select
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="bg-transparent text-gray-700 font-medium text-sm focus:outline-none"
          >
            <option value="all">All Dates</option>
            {dates.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* History List */}
      <AnimatePresence>
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-12 text-center shadow-md"
          >
            <p className="text-5xl mb-4">📭</p>
            <p className="text-gray-500 font-medium">No order history found</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
              >
                {/* Header */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-gray-800">{order.id}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-gray-500">{order.customer} · {order.date} · {order.time}</p>
                    <p className="text-xs text-gray-400 mt-0.5">📍 {order.location}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Total</p>
                      <p className="font-bold text-gray-800 text-lg">Rs. {order.total}</p>
                    </div>
                    <button
                      onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                      className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <motion.div animate={{ rotate: expandedId === order.id ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      </motion.div>
                    </button>
                  </div>
                </div>

                {/* Expanded */}
                <AnimatePresence>
                  {expandedId === order.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Items</p>
                          <div className="space-y-1.5">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-600">{item.name} <span className="text-gray-400">×{item.qty}</span></span>
                                <span className="font-medium text-gray-700">Rs. {item.price * item.qty}</span>
                              </div>
                            ))}
                            <div className="flex justify-between text-sm font-semibold border-t border-dashed border-gray-200 pt-1.5 mt-1.5">
                              <span>Total</span>
                              <span>Rs. {order.total}</span>
                            </div>
                          </div>
                        </div>

                        {order.status === 'picked_up' && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-primary-50 hover:bg-primary-100 border border-primary-200 text-primary-600 font-semibold text-sm rounded-xl transition-all"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Reorder
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderHistoryPage;

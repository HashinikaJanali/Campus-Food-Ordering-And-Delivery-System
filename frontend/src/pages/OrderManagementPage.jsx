import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { orderAPI } from '../services/api';
import OrderCard from '../components/orders/OrderCard';
import OrderStatsRow from '../components/orders/OrderStatsRow';
import OrderTabNav from '../components/orders/OrderTabNav';
import OrderSearchBar from '../components/orders/OrderSearchBar';
import DailySummaryCard from '../components/orders/DailySummaryCard';

const ALL_STATUSES = ['all', 'pending', 'preparing', 'ready', 'delivered', 'cancelled'];

const OrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders from backend
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll();
      setOrders(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await orderAPI.updateStatus(id, newStatus);
      setOrders(prev =>
        prev.map(o => o._id === id ? { ...o, status: newStatus } : o)
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const counts = ALL_STATUSES.reduce((acc, key) => {
    acc[key] = key === 'all'
      ? orders.length
      : orders.filter(o => o.status === key).length;
    return acc;
  }, {});

  const filtered = orders.filter(o => {
    const matchTab = activeTab === 'all' || o.status === activeTab;
    const matchSearch = search === '' ||
      o._id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8 py-10 mb-20">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-primary rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 text-9xl opacity-10">🍱</div>
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
            🍱 Order Management
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl opacity-95"
          >
            Track, manage, and fulfill campus food orders in real time
          </motion.p>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg animate-pulse">Loading orders...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={fetchOrders}
            className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Daily Summary */}
          <DailySummaryCard orders={orders} />

          {/* Stats */}
          <OrderStatsRow counts={counts} />

          {/* Tabs */}
          <OrderTabNav activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />

          {/* Search */}
          <OrderSearchBar value={search} onChange={setSearch} />

          {/* Orders List */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + search}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {filtered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl p-12 text-center shadow-md"
                >
                  <p className="text-5xl mb-4">🔍</p>
                  <p className="text-gray-500 font-medium">No orders found</p>
                </motion.div>
              ) : (
                filtered.map(order => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default OrderManagementPage;
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { MOCK_ORDERS, STATUS_CONFIG } from '../constants/orderConstants';
import TrackingTimeline from '../components/orders/TrackingTimeline';
import StatusBadge from '../components/orders/StatusBadge';
import ETABadge from '../components/orders/ETABadge';
import PickupTimeBadge from '../components/orders/PickupTimeBadge';

const OrderTrackingPage = () => {
  const [orderId, setOrderId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [error, setError] = useState('');

  // Simulate the currently logged-in student's active orders
  const activeOrders = MOCK_ORDERS.filter(o =>
    o.studentId === 'IT21234567' && !['picked_up', 'cancelled'].includes(o.status)
  );

  const handleSearch = () => {
    const found = MOCK_ORDERS.find(o => o.id.toLowerCase() === orderId.toLowerCase());
    if (found) {
      setTrackedOrder(found);
      setError('');
    } else {
      setTrackedOrder(null);
      setError('Order not found. Please check your order ID.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8 pt-24 sm:pt-28">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-primary rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 text-9xl opacity-10">📍</div>
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
            📍 Track Your Order
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl opacity-95"
          >
            Know exactly when your food will be ready for pickup
          </motion.p>
        </div>
      </motion.div>

      {/* Active Orders for current student */}
      {activeOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <h2 className="font-bold text-gray-800 text-lg">Your Active Orders</h2>
          {activeOrders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-gray-800">{order.id}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-gray-500">Ordered at {order.time}</p>
                </div>
                <p className="font-bold text-gray-800 text-xl">Rs. {order.total}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <ETABadge status={order.status} />
                <PickupTimeBadge time={order.scheduledPickup} location={order.location} />
              </div>

              {/* Items summary */}
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Items</p>
                <div className="space-y-1">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm text-gray-600">
                      <span>{item.name} ×{item.qty}</span>
                      <span className="font-medium">Rs. {item.price * item.qty}</span>
                    </div>
                  ))}
                </div>
              </div>

              <TrackingTimeline status={order.status} />
            </div>
          ))}
        </motion.div>
      )}

      {/* Search by Order ID */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-4"
      >
        <h2 className="font-bold text-gray-800 text-lg">Search by Order ID</h2>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="e.g. ORD-1001"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-2 border-gray-200 focus:border-primary-400 focus:outline-none text-gray-700 placeholder-gray-400 transition-colors"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSearch}
            className="px-6 py-3.5 bg-gradient-primary text-white font-semibold rounded-2xl shadow-md"
          >
            Track
          </motion.button>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-sm font-medium"
          >
            {error}
          </motion.p>
        )}

        {trackedOrder && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 pt-2"
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-gray-800">{trackedOrder.id}</span>
                <StatusBadge status={trackedOrder.status} />
              </div>
              <p className="font-bold text-gray-800 text-lg">Rs. {trackedOrder.total}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ETABadge status={trackedOrder.status} />
              <PickupTimeBadge time={trackedOrder.scheduledPickup} location={trackedOrder.location} />
            </div>
            <TrackingTimeline status={trackedOrder.status} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default OrderTrackingPage;

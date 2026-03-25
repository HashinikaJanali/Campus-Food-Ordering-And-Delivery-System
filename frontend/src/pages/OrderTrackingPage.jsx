import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, RefreshCw } from 'lucide-react';
import { MOCK_ORDERS, STATUS_CONFIG } from '../constants/orderConstants';
import OrderManagementSidebar from '../components/OrderManagementSidebar';
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
    <div className="min-h-screen bg-gray-50">
      <OrderManagementSidebar />
      <div className="overflow-y-auto ml-80">
        <div className="space-y-6 p-8">



          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-display text-gray-900">Order Tracking</h1>
              <p className="text-gray-500 text-sm mt-1">Track your active orders in real time</p>
            </div>
            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-xl transition-all duration-200 font-display font-medium">
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>

          {/* Search by Order ID */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. ORD-3001"
                  value={orderId}
                  onChange={e => setOrderId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-2.5 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors"
              >
                Track
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}
          </div>

          {/* Active Orders */}
          <AnimatePresence>
            {activeOrders.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-gray-900">Your Active Orders</h3>
                <div className="space-y-4">
                  {activeOrders.map(order => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4"
                    >
                      {/* Order Header */}
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900">{order.id}</span>
                            <StatusBadge status={order.status} />
                          </div>
                          <p className="text-sm text-gray-500">Ordered at {order.time}</p>
                        </div>
                        <p className="font-semibold text-gray-900 text-lg">₹{order.total.toFixed(2)}</p>
                      </div>

                      {/* ETA and Pickup Info */}
                      <div className="flex gap-3 flex-wrap">
                        <ETABadge status={order.status} />
                        <PickupTimeBadge time={order.scheduledPickup} location={order.location} />
                      </div>

                      {/* Items */}
                      <div className="bg-gray-50 rounded-xl px-4 py-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Items in Order</p>
                        <div className="space-y-2">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm text-gray-600">
                              <span>{item.name} ×{item.qty}</span>
                              <span className="font-medium">₹{(item.price * item.qty).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tracking Timeline */}
                      <TrackingTimeline status={order.status} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tracked Order from Search */}
          <AnimatePresence>
            {trackedOrder && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4"
              >
                <h3 className="font-semibold text-gray-900">Search Result</h3>

                {/* Order Header */}
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900">{trackedOrder.id}</span>
                      <StatusBadge status={trackedOrder.status} />
                    </div>
                    <p className="text-sm text-gray-500">Ordered at {trackedOrder.time}</p>
                  </div>
                  <p className="font-semibold text-gray-900 text-lg">₹{trackedOrder.total.toFixed(2)}</p>
                </div>

                {/* ETA and Pickup Info */}
                <div className="flex gap-3 flex-wrap">
                  <ETABadge status={trackedOrder.status} />
                  <PickupTimeBadge time={trackedOrder.scheduledPickup} location={trackedOrder.location} />
                </div>

                {/* Items */}
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Items in Order</p>
                  <div className="space-y-2">
                    {trackedOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-gray-600">
                        <span>{item.name} ×{item.qty}</span>
                        <span className="font-medium">₹{(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tracking Timeline */}
                <TrackingTimeline status={trackedOrder.status} />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;

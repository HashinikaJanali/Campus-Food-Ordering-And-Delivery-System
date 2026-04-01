import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatRs } from '../utils/currency';
import { Search, RefreshCw } from 'lucide-react';
import { io } from 'socket.io-client';
import { useUserAuth } from '../context/UserAuthContext';
import UserSidebar from '../components/UserSidebar';
import TrackingTimeline from '../components/orders/TrackingTimeline';
import StatusBadge from '../components/orders/StatusBadge';
import ETABadge from '../components/orders/ETABadge';
import PickupTimeBadge from '../components/orders/PickupTimeBadge';
import { orderAPI } from '../services/api';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');

const normalizeTrackOrder = (order) => {
  const rawStatus = String(order?.status || '').toLowerCase();
  const status = rawStatus === 'delivered' || rawStatus === 'completed' ? 'picked_up' : rawStatus;

  return {
    id: order.orderId || order._id,
    status,
    total: order.totalAmount || order.total || 0,
    time: order.createdAt ? new Date(order.createdAt).toLocaleString() : '—',
    scheduledPickup: order.pickupTime || 'ASAP',
    location: order.deliveryInfo?.onCampusLocation || order.deliveryInfo?.boardingName || 'Campus Canteen',
    items: (order.items || []).map((item) => ({
      name: item.name,
      qty: item.quantity || item.qty || 1,
      price: item.price || 0,
    })),
  };
};

const OrderTrackingPage = () => {
  const { user } = useUserAuth();
  const [orderId, setOrderId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchActiveOrders = async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
      setError('');
    }

    try {
      const response = await orderAPI.getMyActiveOrders();
      const payload = response?.data?.data || response?.data || [];
      const normalized = Array.isArray(payload) ? payload.map(normalizeTrackOrder) : [];
      setActiveOrders(normalized.filter(o => !['picked_up', 'cancelled'].includes(o.status)));
    } catch (err) {
      if (!silent) {
        setActiveOrders([]);
        setError(err.response?.data?.message || 'Failed to load active orders');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchActiveOrders();
  }, [user]);

  useEffect(() => {
    if (!user?._id) return;

    const intervalId = setInterval(() => {
      fetchActiveOrders({ silent: true });
    }, 8000);

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.on('orders:student-updated', (event) => {
      if (String(event?.userId) === String(user._id)) {
        fetchActiveOrders({ silent: true });
      }
    });

    return () => {
      clearInterval(intervalId);
      socket.disconnect();
    };
  }, [user?._id]);

  const handleSearch = async () => {
    if (!orderId.trim()) {
      setTrackedOrder(null);
      setError('Please enter an order ID');
      return;
    }

    try {
      const response = await orderAPI.trackMyOrder(orderId.trim());
      const order = response?.data?.data || response?.data;
      if (!order) {
        setTrackedOrder(null);
        setError('Order not found. Please check your order ID.');
        return;
      }

      setTrackedOrder(normalizeTrackOrder(order));
      setError('');
    } catch (err) {
      setTrackedOrder(null);
      setError(err.response?.data?.message || 'Order not found. Please check your order ID.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F5] font-body py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex gap-8">
          <UserSidebar />

          <main className="flex-1 lg:pl-[304px]">
            <div className="max-w-6xl mr-auto px-4 sm:px-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold font-display text-gray-900">Track Orders</h1>
                    <p className="text-gray-500 text-sm mt-1">Track your active orders in real time</p>
                  </div>
                  <button
                    onClick={() => fetchActiveOrders()}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-xl transition-all duration-200 font-display font-medium"
                  >
                    <RefreshCw size={15} />
                    Refresh
                  </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="e.g. ORD-XXXX"
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

                <AnimatePresence>
                  {!loading && activeOrders.length > 0 && (
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
                            <div className="flex items-start justify-between flex-wrap gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="font-semibold text-gray-900">{order.id}</span>
                                  <StatusBadge status={order.status} />
                                </div>
                                <p className="text-sm text-gray-500">Ordered at {order.time}</p>
                              </div>
                              <p className="font-semibold text-gray-900 text-lg">{formatRs(order.total)}</p>
                            </div>

                            <div className="flex gap-3 flex-wrap">
                              <ETABadge status={order.status} />
                              <PickupTimeBadge time={order.scheduledPickup} location={order.location} />
                            </div>

                            <div className="bg-gray-50 rounded-xl px-4 py-3">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Items in Order</p>
                              <div className="space-y-2">
                                {order.items.map((item, i) => (
                                  <div key={i} className="flex justify-between text-sm text-gray-600">
                                    <span>{item.name} ×{item.qty}</span>
                                    <span className="font-medium">{formatRs(item.price * item.qty)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <TrackingTimeline status={order.status} />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {loading && (
                  <p className="text-sm text-gray-500">Loading active orders...</p>
                )}

                <AnimatePresence>
                  {trackedOrder && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4"
                    >
                      <h3 className="font-semibold text-gray-900">Search Result</h3>

                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900">{trackedOrder.id}</span>
                            <StatusBadge status={trackedOrder.status} />
                          </div>
                          <p className="text-sm text-gray-500">Ordered at {trackedOrder.time}</p>
                        </div>
                        <p className="font-semibold text-gray-900 text-lg">{formatRs(trackedOrder.total)}</p>
                      </div>

                      <div className="flex gap-3 flex-wrap">
                        <ETABadge status={trackedOrder.status} />
                        <PickupTimeBadge time={trackedOrder.scheduledPickup} location={trackedOrder.location} />
                      </div>

                      <div className="bg-gray-50 rounded-xl px-4 py-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Items in Order</p>
                        <div className="space-y-2">
                          {trackedOrder.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm text-gray-600">
                              <span>{item.name} ×{item.qty}</span>
                              <span className="font-medium">{formatRs(item.price * item.qty)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <TrackingTimeline status={trackedOrder.status} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;

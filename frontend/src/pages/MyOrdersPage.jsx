import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Eye } from 'lucide-react';
import { io } from 'socket.io-client';
import { useUserAuth } from '../context/UserAuthContext';
import { formatRs } from '../utils/currency';
import TrackingTimeline from '../components/orders/TrackingTimeline';
import StatusBadge from '../components/orders/StatusBadge';
import UserSidebar from '../components/UserSidebar';
import { orderAPI } from '../services/api';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');
const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'delivering', label: 'Delivering' },
  { value: 'picked_up', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const toDisplayStatus = (status) => {
  if (!status) return 'pending';
  const s = String(status).toLowerCase();
  if (s === 'completed' || s === 'delivered') return 'picked_up';
  return s;
};

const normalizeOrder = (order) => ({
  id: order.orderId || order._id,
  _id: order._id,
  time: order.createdAt ? new Date(order.createdAt).toLocaleString() : '—',
  createdAt: order.createdAt || null,
  total: order.totalAmount || order.total || 0,
  status: toDisplayStatus(order.status || order.orderStatus),
  paymentStatus: order.paymentStatus || 'Pending',
  addressType: order.addressType || 'on-campus',
  location: order.deliveryInfo?.onCampusLocation || 'Campus Canteen',
  deliveryInfo: order.deliveryInfo || {},
  items: (order.items || []).map((it) => ({
    name: it.name,
    qty: it.quantity || it.qty || 1,
    price: it.price || 0,
  })),
});

const getOrderTimeValue = (order) => {
  const timestamp = order?.createdAt ? new Date(order.createdAt).getTime() : NaN;
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const MyOrdersPage = () => {
  const { user } = useUserAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchMyOrders = async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
      setError('');
    }

    try {
      const response = await orderAPI.getMyOrders();
      const payload = response?.data?.data || response?.data || [];
      setOrders(Array.isArray(payload) ? payload.map(normalizeOrder) : []);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load your orders';
      if (!silent) setError(message);
      if (!silent) setOrders([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchMyOrders();
  }, [user]);

  useEffect(() => {
    if (!user?._id) return;

    const intervalId = setInterval(() => {
      fetchMyOrders({ silent: true });
    }, 8000);

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.on('orders:student-updated', (event) => {
      if (String(event?.userId) === String(user._id)) {
        fetchMyOrders({ silent: true });
      }
    });

    return () => {
      clearInterval(intervalId);
      socket.disconnect();
    };
  }, [user?._id]);

  const filtered = useMemo(() => {
    let list = orders.slice();
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(o => (o.id || '').toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') {
      list = list.filter(o => o.status === statusFilter);
    }
    if (sortBy === 'date_asc') list.sort((a, b) => getOrderTimeValue(a) - getOrderTimeValue(b));
    if (sortBy === 'date_desc') list.sort((a, b) => getOrderTimeValue(b) - getOrderTimeValue(a));
    if (sortBy === 'amount_asc') list.sort((a, b) => a.total - b.total);
    if (sortBy === 'amount_desc') list.sort((a, b) => b.total - a.total);
    return list;
  }, [orders, search, statusFilter, sortBy]);

  const openDetails = (order) => setSelectedOrder(order);
  const closeDetails = () => setSelectedOrder(null);

  const handleTrack = (order) => {
    navigate('/track', { state: { orderId: order.id } });
  };

  const downloadInvoice = (order) => {
    const content = `Invoice for ${order.id}\nDate: ${order.time}\nTotal: ${formatRs(order.total)}\n\nItems:\n` +
      order.items.map(it => `${it.name} x${it.qty} @ ${formatRs(it.price)} = ${formatRs(it.price * it.qty)}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${order.id}-invoice.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#FFF9F5] font-body py-10">
      <div className="max-w-[96rem] mx-auto px-4 sm:px-6">
        <div className="flex gap-8">
          <UserSidebar />

          <main className="flex-1 lg:pl-[304px]">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="font-display text-3xl font-bold">My Orders</h1>
                  <p className="text-sm text-gray-500">Placed orders from your account</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white border border-gray-100 rounded-2xl px-3 py-2 shadow-sm">
                    <Search size={16} className="text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Order ID" className="ml-3 outline-none bg-transparent text-sm w-64" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Status</label>
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="ml-2 border rounded-2xl px-4 py-2 text-sm shadow-sm">
                    {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Sort</label>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="ml-2 border rounded-2xl px-4 py-2 text-sm shadow-sm">
                    <option value="date_desc">Date (newest)</option>
                    <option value="date_asc">Date (oldest)</option>
                    <option value="amount_desc">Amount (high → low)</option>
                    <option value="amount_asc">Amount (low → high)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {loading ? (
                  <p className="text-sm text-gray-500">Loading your orders...</p>
                ) : error ? (
                  <p className="text-sm text-red-500">{error}</p>
                ) : filtered.length === 0 ? (
                  <p className="text-sm text-gray-500">No orders found.</p>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="text-left text-gray-700 font-semibold px-6 py-4">Order</th>
                            <th className="text-left text-gray-700 font-semibold px-6 py-4">Status</th>
                            <th className="text-left text-gray-700 font-semibold px-6 py-4">Total</th>
                            <th className="text-left text-gray-700 font-semibold px-6 py-4">Payment</th>
                            <th className="text-right text-gray-700 font-semibold px-6 py-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filtered.map((order, idx) => (
                            <tr key={order.id || idx} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <p className="text-sm text-gray-500">{order.id}</p>
                                <p className="font-semibold text-gray-900">{order.time}</p>
                              </td>
                              <td className="px-6 py-4">
                                <StatusBadge status={order.status} />
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-semibold text-gray-900">{formatRs(order.total)}</p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-semibold text-gray-900">{order.paymentStatus}</p>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => openDetails(order)} className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-sm flex items-center gap-2 transition-colors">
                                    <Eye size={14} /> Details
                                  </button>
                                  <button onClick={() => handleTrack(order)} className="px-4 py-2 bg-primary text-white hover:bg-primary-500 rounded-lg text-sm font-semibold transition-colors">Track</button>
                                  <button onClick={() => downloadInvoice(order)} className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-sm transition-colors" title="Download invoice">
                                    <Download size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: 20 }} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold">Order {selectedOrder.id}</h3>
                  <p className="text-sm text-gray-500">Placed: {selectedOrder.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => downloadInvoice(selectedOrder)} className="px-3 py-2 bg-white border rounded text-sm flex items-center gap-2">
                    <Download size={14} /> Download
                  </button>
                  <button onClick={closeDetails} className="px-3 py-2 bg-red-50 text-red-600 rounded text-sm">Close</button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Items</h4>
                  <div className="mt-2 space-y-2">
                    {selectedOrder.items.map((it, i) => (
                      <div key={i} className="flex justify-between text-sm text-gray-700">
                        <div>{it.name} ×{it.qty}</div>
                        <div>{formatRs(it.price * it.qty)}</div>
                      </div>
                    ))}
                    <div className="flex justify-between font-semibold mt-3">
                      <div>Total</div>
                      <div>{formatRs(selectedOrder.total)}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900">Delivery / Pickup</h4>
                  <div className="mt-2 text-sm text-gray-700">
                    {selectedOrder.addressType === 'off-campus' ? (
                      <div>
                        <p>{selectedOrder.deliveryInfo?.boardingName || ''} {selectedOrder.deliveryInfo?.street || ''} {selectedOrder.deliveryInfo?.area || ''}</p>
                        <p>{selectedOrder.deliveryInfo?.phoneNumber || 'N/A'}</p>
                      </div>
                    ) : (
                      <div>
                        <p>Pickup location: {selectedOrder.location}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900">Timeline</h4>
                  <div className="mt-2">
                    <TrackingTimeline status={selectedOrder.status} />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyOrdersPage;

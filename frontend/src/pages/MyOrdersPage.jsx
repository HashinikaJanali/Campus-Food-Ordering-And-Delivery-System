import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Download, MapPin, Eye } from 'lucide-react';
import { useUserAuth } from '../context/UserAuthContext';
import { MOCK_ORDERS } from '../constants/orderConstants';
import { formatRs } from '../utils/currency';
import TrackingTimeline from '../components/orders/TrackingTimeline';
import UserSidebar from '../components/UserSidebar';

const statuses = ['all', 'pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

const MyOrdersPage = () => {
  const { user } = useUserAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Use user's identifier if available, fallback to showing all.
  // If the current user has no matching mock orders, return a couple of demo orders so the UI isn't empty.
  const orders = useMemo(() => {
    if (!MOCK_ORDERS) return [];
    if (user && (user.studentId || user.email)) {
      const byId = user.studentId ? MOCK_ORDERS.filter(o => o.studentId === user.studentId) : [];
      const byEmail = user.email ? MOCK_ORDERS.filter(o => o.email === user.email) : [];
      const result = [...byId, ...byEmail];
      if (result.length > 0) return result;

      // fallback demo orders for the current user
      const uid = user.studentId || `IT${Math.floor(Math.random() * 90000000) + 10000000}`;
      const demoEmail = user.email || 'you@student.edu';
      const demoName = user.name || 'You';
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10);

      return [
        {
          id: `DEMO-${Math.floor(Math.random() * 9000) + 1000}`,
          customer: demoName,
          studentId: uid,
          phone: user.phone || '+94 77 000 0000',
          location: 'Main Canteen Counter',
          items: [
            { name: 'Demo Rice & Curry', category: 'Combos', qty: 1, price: 350 },
          ],
          total: 350,
          status: 'pending',
          time: 'Now',
          scheduledPickup: 'ASAP',
          notes: 'Demo order',
          date: dateStr,
          email: demoEmail,
        },
        {
          id: `DEMO-${Math.floor(Math.random() * 9000) + 1000}`,
          customer: demoName,
          studentId: uid,
          phone: user.phone || '+94 77 000 0000',
          location: 'Library Café',
          items: [
            { name: 'Demo Sandwich', category: 'Sandwiches', qty: 2, price: 180 },
          ],
          total: 360,
          status: 'picked_up',
          time: 'Yesterday',
          scheduledPickup: 'Yesterday',
          notes: '',
          date: dateStr,
          email: demoEmail,
        },
      ];
    }
    return MOCK_ORDERS;
  }, [user]);

  const filtered = useMemo(() => {
    let list = orders.slice();
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(o => o.id.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') {
      list = list.filter(o => o.status === statusFilter);
    }
    if (sortBy === 'date_asc') list.sort((a, b) => new Date(a.time) - new Date(b.time));
    if (sortBy === 'date_desc') list.sort((a, b) => new Date(b.time) - new Date(a.time));
    if (sortBy === 'amount_asc') list.sort((a, b) => a.total - b.total);
    if (sortBy === 'amount_desc') list.sort((a, b) => b.total - a.total);
    return list;
  }, [orders, search, statusFilter, sortBy]);

  const openDetails = (order) => setSelectedOrder(order);
  const closeDetails = () => setSelectedOrder(null);

  const handleTrack = (order) => {
    // navigate to tracking page and pass order id via state
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
    <div className="min-h-screen bg-gray-50 py-8">
      <UserSidebar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:pl-[304px]">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">My Orders</h1>
              <p className="text-sm text-gray-500">Order list and quick actions</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                <Search size={16} className="text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Order ID" className="ml-2 outline-none bg-transparent text-sm" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Status</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="ml-2 border rounded px-3 py-2 text-sm">
                {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Sort</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="ml-2 border rounded px-3 py-2 text-sm">
                <option value="date_desc">Date (newest)</option>
                <option value="date_asc">Date (oldest)</option>
                <option value="amount_desc">Amount (high → low)</option>
                <option value="amount_asc">Amount (low → high)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-500">No orders found.</p>
            ) : (
              filtered.map(order => (
                <div key={order.id} className="bg-gray-50 border border-gray-100 rounded-lg p-4 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-500">{order.id}</p>
                        <p className="font-semibold text-gray-900">{order.time}</p>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-semibold text-sm text-gray-900 capitalize">{order.status.replace('_', ' ')}</p>
                      </div>
                      <div className="ml-6">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="font-semibold text-gray-900">{formatRs(order.total)}</p>
                      </div>
                      <div className="ml-6">
                        <p className="text-sm text-gray-500">Payment</p>
                        <p className="font-semibold text-gray-900">{order.paymentStatus || 'Paid'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => openDetails(order)} className="px-3 py-2 bg-white border rounded text-sm flex items-center gap-2">
                      <Eye size={14} /> View Details
                    </button>
                    <button onClick={() => handleTrack(order)} className="px-3 py-2 bg-orange-50 text-orange-600 rounded text-sm">Track Order</button>
                    <button onClick={() => downloadInvoice(order)} className="px-3 py-2 bg-white border rounded text-sm flex items-center gap-2">
                      <Download size={14} /> Invoice
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
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
                    {selectedOrder.deliveryType === 'delivery' ? (
                      <div>
                        <p>{selectedOrder.address?.line}</p>
                        <p>{selectedOrder.address?.phone}</p>
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

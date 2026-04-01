import { useState, useEffect, useMemo } from 'react';
import { formatRs } from '../utils/currency';
import { Calendar, RefreshCw, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { io } from 'socket.io-client';
import StatusBadge from '../components/orders/StatusBadge';
import AdminSidebar from '../components/AdminSidebar';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');

const mapHistoryStatus = (order) => {
  const raw = String(order?.status || '').toLowerCase();
  if (raw === 'cancelled') return 'cancelled';
  if (raw === 'delivered' || raw === 'completed' || raw === 'picked_up') return 'picked_up';

  const legacy = String(order?.orderStatus || '').toLowerCase();
  if (legacy === 'cancelled') return 'cancelled';
  if (legacy === 'delivered' || legacy === 'completed') return 'picked_up';

  return raw || 'pending';
};

const normalizeHistoryOrder = (order) => ({
  id: order.orderId || order._id,
  _id: order._id,
  customer: order.customerName || order.customer || 'Unknown',
  date: order.createdAt ? new Date(order.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
  dateLabel: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—',
  total: order.totalAmount || order.total || 0,
  status: mapHistoryStatus(order),
  items: order.items || [],
});

const OrderHistoryPage = () => {
  const [filterDate, setFilterDate] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const itemsPerPage = 10;

  const fetchHistory = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const response = await orderAPI.getHistory({
        search: search || undefined,
        date: filterDate,
      });
      const payload = response?.data?.data || response?.data || [];
      setOrders(Array.isArray(payload) ? payload.map(normalizeHistoryOrder) : []);
      setError('');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load order history';
      setError(message);
      if (!silent) toast.error(message);
      setOrders([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filterDate, search]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchHistory({ silent: true });
    }, 8000);

    return () => clearInterval(intervalId);
  }, [filterDate, search]);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    socket.on('orders:history-updated', () => {
      fetchHistory({ silent: true });
    });

    return () => {
      socket.disconnect();
    };
  }, [filterDate, search]);

  const dates = useMemo(
    () => [...new Set(orders.map(o => o.date))].sort((a, b) => b.localeCompare(a)),
    [orders]
  );

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return orders.filter(o => {
      const matchSearch = !query ||
        (o.id || '').toLowerCase().includes(query) ||
        (o.customer || '').toLowerCase().includes(query);
      const matchDate = filterDate === 'all' || o.date === filterDate;
      return matchSearch && matchDate;
    });
  }, [orders, search, filterDate]);

  const completedCount = filtered.filter(o => o.status === 'picked_up').length;
  const cancelledCount = filtered.filter(o => o.status === 'cancelled').length;
  const totalRevenue = filtered
    .filter(o => o.status === 'picked_up')
    .reduce((sum, o) => sum + o.total, 0);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filtered.slice(startIdx, startIdx + itemsPerPage);

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="overflow-y-auto ml-80">
        <div className="space-y-6 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-display text-gray-900">Order History</h1>
              <p className="text-gray-500 text-sm mt-1">View all past completed and cancelled orders</p>
            </div>
            <button
              onClick={() => fetchHistory()}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-xl transition-all duration-200 font-display font-medium"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{filtered.length.toLocaleString()}</p>
              <p className="text-gray-400 text-xs mt-2">Total history records</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Completed Orders</p>
              <p className="text-3xl font-bold text-emerald-600">{completedCount.toLocaleString()}</p>
              <p className="text-gray-400 text-xs mt-2">Delivered / picked up</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Cancelled Orders</p>
              <p className="text-3xl font-bold text-red-600">{cancelledCount.toLocaleString()}</p>
              <p className="text-gray-400 text-xs mt-2">Cancelled records</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-blue-600">{formatRs(totalRevenue)}</p>
              <p className="text-gray-400 text-xs mt-2">Completed orders only</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, Order ID..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-orange-400 text-gray-700 placeholder-gray-400 transition-colors"
                />
              </div>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                <select
                  value={filterDate}
                  onChange={(e) => {
                    setFilterDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-gray-700 font-medium text-sm focus:outline-none cursor-pointer"
                >
                  <option value="all">All Dates</option>
                  {dates.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-gray-700 font-semibold px-6 py-4">Canteen / Item Name</th>
                    <th className="text-left text-gray-700 font-semibold px-6 py-4">Customer Name</th>
                    <th className="text-left text-gray-700 font-semibold px-6 py-4">Order Id</th>
                    <th className="text-left text-gray-700 font-semibold px-6 py-4">Amount</th>
                    <th className="text-left text-gray-700 font-semibold px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-gray-500">Loading order history...</td>
                    </tr>
                  ) : paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12">
                        <div>
                          <p className="text-4xl mb-3">📭</p>
                          <p className="font-semibold text-gray-600">No order history found</p>
                          <p className="text-sm text-gray-400 mt-1">{error || 'Try a different date or search term'}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((order) => (
                      <tr key={order._id || order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                              <div className="w-full h-full bg-gradient-to-br from-orange-200 to-orange-100 flex items-center justify-center text-xs font-bold">
                                {(order.items?.[0]?.name || 'F')[0]}
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-900 font-medium">{order.items?.[0]?.name || 'Food Item'}</p>
                              <p className="text-gray-500 text-xs">Canteen</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {(order.customer || 'U')[0]}
                            </div>
                            <div>
                              <p className="text-gray-900 font-medium">{order.customer || 'Unknown'}</p>
                              <p className="text-gray-500 text-xs">Student</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-gray-900 font-medium">{order.id}</p>
                          <p className="text-gray-500 text-xs">{order.dateLabel}</p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-gray-900 font-semibold">{formatRs(order.total)}</p>
                          <p className="text-gray-500 text-xs">Paid in Full</p>
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {paginatedOrders.length > 0 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 bg-gray-50">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return pageNum >= 1 && pageNum <= totalPages ? (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ) : null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;

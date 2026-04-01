import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { orderAPI } from '../services/api';
import { formatRs } from '../utils/currency';
import AdminSidebar from '../components/AdminSidebar';
import StatusBadge from '../components/orders/StatusBadge';
import { matchesOrder } from '../utils/orderSearch';
import { ClipboardList, Clock, ShoppingBag, CheckCircle, XCircle, RefreshCw, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');

const isFinalStatus = (order) => {
  const status = String(order?.status || '').toLowerCase();
  const orderStatus = String(order?.orderStatus || '').toLowerCase();

  return ['cancelled', 'delivered', 'completed', 'picked_up'].includes(status)
    || ['cancelled', 'delivered', 'completed'].includes(orderStatus);
};

const STATUS_FILTERS = [
  { key: 'all', label: 'All Active', icon: ClipboardList, text: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' },
  { key: 'pending', label: 'Pending', icon: Clock, text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  { key: 'preparing', label: 'Preparing', icon: ShoppingBag, text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { key: 'ready', label: 'Ready', icon: CheckCircle, text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { key: 'delivering', label: 'Delivering', icon: XCircle, text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
];

const OrderManagementPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const itemsPerPage = 10;

  // Fetch orders from backend
  useEffect(() => {
    fetchOrders();

    const intervalId = setInterval(() => {
      fetchOrders({ silent: true });
    }, 8000);

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.on('orders:history-updated', () => {
      fetchOrders({ silent: true });
    });

    return () => {
      clearInterval(intervalId);
      socket.disconnect();
    };
  }, []);

  const fetchOrders = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const response = await orderAPI.getAll();
      // Normalize API response to ensure `orders` is always an array
      const payload = response?.data ?? response;
      let items = [];
      if (Array.isArray(payload)) items = payload;
      else if (Array.isArray(payload?.data)) items = payload.data;
      else if (Array.isArray(payload?.orders)) items = payload.orders;
      else if (Array.isArray(payload?.docs)) items = payload.docs;
      else items = [];
      setOrders(items.filter(o => !isFinalStatus(o)));
      setError(null);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      if (!silent) setOrders([]);
      setError(err.response?.data?.message || 'Failed to fetch orders');
      if (!silent) toast.error(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await orderAPI.updateStatus(id, newStatus);
      setOrders(prev => {
        if (['cancelled', 'completed', 'delivered', 'picked_up'].includes(String(newStatus).toLowerCase())) {
          return prev.filter(o => o._id !== id);
        }
        return prev.map(o => o._id === id ? { ...o, status: newStatus } : o);
      });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Ensure we always operate on an array when counting/filtering
  const ordersArray = Array.isArray(orders) ? orders : [];

  const counts = STATUS_FILTERS.reduce((acc, { key }) => {
    acc[key] = key === 'all'
      ? ordersArray.length
      : ordersArray.filter(o => o.status === key).length;
    return acc;
  }, {});

  const filtered = ordersArray.filter(o => {
    const matchTab = activeTab === 'all' || o.status === activeTab;
    return matchTab && matchesOrder(o, search);
  });

  const sorted = [...filtered].sort((a, b) => {
    let aVal, bVal;
    switch (sortBy) {
      case 'date':
        aVal = new Date(a.createdAt || 0).getTime();
        bVal = new Date(b.createdAt || 0).getTime();
        break;
      case 'amount':
        aVal = a.total || a.totalAmount || 0;
        bVal = b.total || b.totalAmount || 0;
        break;
      case 'customer':
        aVal = (a.customerName || a.customer || '').toLowerCase();
        bVal = (b.customerName || b.customer || '').toLowerCase();
        break;
      case 'status':
        aVal = (a.status || '').toLowerCase();
        bVal = (b.status || '').toLowerCase();
        break;
      default:
        return 0;
    }
    return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = sorted.slice(startIdx, startIdx + itemsPerPage);

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="overflow-y-auto ml-80">  
        <div className="space-y-6 p-8">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-display text-gray-900">Orders List</h1>
              <p className="text-gray-500 text-sm mt-1">Track active in-process orders in real time</p>
            </div>
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-xl transition-all duration-200 font-display font-medium"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>

          {/* Status Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{counts.all.toLocaleString()}</p>
              <p className="text-gray-400 text-xs mt-2">Total Orders last 365 days</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Pending Orders</p>
              <p className="text-3xl font-bold text-amber-600">{counts.pending.toLocaleString()}</p>
              <p className="text-gray-400 text-xs mt-2">Pending Order last 365 days</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Ready Orders</p>
              <p className="text-3xl font-bold text-emerald-600">{counts.ready.toLocaleString()}</p>
              <p className="text-gray-400 text-xs mt-2">Ready Order last 365 days</p>
            </div>
          </div>

          {/* Search and Filter Bar */}
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
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm
                    focus:outline-none focus:ring-1 focus:ring-orange-400 text-gray-700 placeholder-gray-400 transition-colors"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm font-medium text-gray-600 bg-white border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="customer">Sort by Customer</option>
                <option value="status">Sort by Status</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-4 py-2.5 rounded-xl transition-colors border border-gray-200"
              >
                {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
              </button>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map(({ key, label, text }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  setCurrentPage(1);
                }}
                className={`text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === key
                    ? `${text} bg-gray-100 border-2 border-orange-500 shadow-sm`
                    : 'text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Table */}
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
                    <th className="text-center text-gray-700 font-semibold px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      </td>
                    </tr>
                  ) : paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12">
                        <div>
                          <ClipboardList size={40} className="mx-auto text-gray-300 mb-3" />
                          <p className="font-semibold text-gray-600">No orders found</p>
                          <p className="text-sm text-gray-400 mt-1">{error || 'Try a different filter or search term'}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((order) => {
                      const orderDbId = order._id || order.id;
                      const displayOrderId = order.orderId || order.id || order._id;
                      const orderDate = order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString());
                      const total = order.totalAmount || order.total || 0;
                      return (
                        <tr key={orderDbId || displayOrderId} className="hover:bg-gray-50 transition-colors">
                          {/* Canteen / Item */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                                {order.image ? (
                                  <img src={order.image} alt={order.itemName} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-orange-200 to-orange-100 flex items-center justify-center text-xs font-bold">
                                    {(order.items?.[0]?.name || order.itemName || order.canteenName || 'F')[0]}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-gray-900 font-medium">{order.items?.[0]?.name || order.itemName || order.canteenName || 'N/A'}</p>
                                <p className="text-gray-500 text-xs">{order.canteenName || 'Canteen'}</p>
                              </div>
                            </div>
                          </td>
                          
                          {/* Customer Name */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {(order.customerName || order.customer || 'U')[0]}
                              </div>
                              <div>
                                <p className="text-gray-900 font-medium">{order.customerName || order.customer || 'Unknown'}</p>
                                <p className="text-gray-500 text-xs">{order.studentId || 'Regular'}</p>
                              </div>
                            </div>
                          </td>
                          
                          {/* Order ID */}
                          <td className="px-6 py-4">
                            <p className="text-gray-900 font-medium">{displayOrderId}</p>
                            <p className="text-gray-500 text-xs">{orderDate}</p>
                          </td>
                          
                          {/* Amount */}
                          <td className="px-6 py-4">
                            <p className="text-gray-900 font-semibold">{formatRs(total)}</p>
                            <p className="text-gray-500 text-xs">
                              {order.paymentMethod || 'Not specified'}
                            </p>
                          </td>
                          
                          {/* Status */}
                          <td className="px-6 py-4">
                            <StatusBadge status={order.status} />
                          </td>
                          
                          {/* Action */}
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => navigate(`/order/${orderDbId || displayOrderId}`)}
                                className="text-sm font-medium text-orange-600 hover:bg-orange-50 px-4 py-1.5 rounded-lg transition-colors"
                              >
                                Details
                              </button>
                              {/* three-dots removed per request */}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && paginatedOrders.length > 0 && (
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
                          currentPage === pageNum
                            ? 'bg-orange-600 text-white'
                            : 'text-gray-600 hover:bg-gray-200'
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

export default OrderManagementPage;
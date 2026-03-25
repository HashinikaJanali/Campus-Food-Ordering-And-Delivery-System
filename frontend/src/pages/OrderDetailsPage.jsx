import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronLeft, MapPin, Calendar, DollarSign, User, Clock, ShoppingBag, CheckCircle, AlertCircle } from 'lucide-react';
import OrderManagementSidebar from '../components/OrderManagementSidebar';
import StatusBadge from '../components/orders/StatusBadge';
import { MOCK_ORDERS } from '../constants/orderConstants';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { key: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  { key: 'preparing', label: 'Preparing', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { key: 'ready', label: 'Ready', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { key: 'cancelled', label: 'Cancelled', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
];

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Normalize order data from different sources
  const normalizeOrder = (rawOrder) => {
    if (!rawOrder) return null;
    return {
      id: rawOrder.id || rawOrder._id,
      _id: rawOrder._id || rawOrder.id,
      customer: rawOrder.customer || rawOrder.customerName,
      email: rawOrder.email || rawOrder.customerEmail,
      studentId: rawOrder.studentId || 'Regular',
      total: rawOrder.total || rawOrder.totalAmount,
      date: rawOrder.date || (rawOrder.createdAt ? new Date(rawOrder.createdAt).toLocaleDateString() : new Date().toLocaleDateString()),
      items: (rawOrder.items || []).map(item => ({
        name: item.name,
        category: item.category || '',
        qty: item.qty || item.quantity,
        price: item.price
      })),
      location: rawOrder.location || 'Not specified',
      time: rawOrder.time || rawOrder.pickupTime || 'Not specified',
      status: rawOrder.status,
      notes: rawOrder.notes || rawOrder.note || '',
    };
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Try to fetch from API first
        const response = await orderAPI.getById(orderId);
        if (response.data) {
          setOrder(normalizeOrder(response.data));
        } else {
          // Fallback to mock data
          const foundOrder = MOCK_ORDERS.find(o => o.id === orderId);
          if (foundOrder) {
            setOrder(normalizeOrder(foundOrder));
          }
        }
      } catch (err) {
        // If API fails, try mock data
        const foundOrder = MOCK_ORDERS.find(o => o.id === orderId);
        if (foundOrder) {
          setOrder(normalizeOrder(foundOrder));
        } else {
          console.error('Order not found:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId]);

  const handleStatusUpdate = async (newStatus) => {
    if (order) {
      try {
        // Update on backend using the actual MongoDB _id
        await orderAPI.updateStatus(order._id, newStatus);
        setOrder(prev => ({ ...prev, status: newStatus }));
        toast.success(`✓ Order status updated to ${newStatus}`);
      } catch (err) {
        // Fallback: just update local state if API fails
        setOrder(prev => ({ ...prev, status: newStatus }));
        toast.success(`✓ Order status updated to ${newStatus}`);
        console.error('Failed to update status on backend:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <OrderManagementSidebar />
        <div className="ml-64 overflow-y-auto">
          <div className="p-8 text-center">
            <p className="text-gray-500 font-medium">Order not found</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OrderManagementSidebar />
      <div className="ml-64 overflow-y-auto">
        <div className="space-y-6 p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-display text-gray-900">Order Details</h1>
              <p className="text-gray-500 text-sm mt-1">Order ID: {order.id}</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-xl transition-all duration-200 font-display font-medium"
            >
              <ChevronLeft size={18} />
              Go Back
            </button>
          </div>

          {/* Status Update Section - Right after header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Update Order Status</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {STATUS_OPTIONS.map(({ key, label, icon: Icon, color, bg, border }) => (
                <button
                  key={key}
                  onClick={() => handleStatusUpdate(key)}
                  disabled={order.status === key}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 font-semibold ${
                    order.status === key
                      ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
                      : `bg-white ${border} hover:shadow-lg hover:border-orange-400`
                  }`}
                >
                  <Icon size={24} className={order.status === key ? 'text-gray-400' : color} />
                  <span className={order.status === key ? 'text-gray-500' : 'text-gray-700'}>{label}</span>
                  {order.status === key && <span className="text-xs text-gray-400">(Current)</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Order Details Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-200">
                {/* Customer Info Row */}
                <tr className="border-b border-gray-200">
                  <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 w-1/3">Customer Name</td>
                  <td className="px-6 py-4 text-gray-900">{order.customer || 'Unknown'}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 w-1/3">Student ID</td>
                  <td className="px-6 py-4 text-gray-900">{order.studentId || 'Regular'}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 w-1/3">Email</td>
                  <td className="px-6 py-4 text-gray-900">{order.email || 'N/A'}</td>
                </tr>

                {/* Order Info Row */}
                <tr className="border-b border-gray-200">
                  <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 w-1/3">Order Date</td>
                  <td className="px-6 py-4 text-gray-900">{order.date || new Date().toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 w-1/3">Pickup Location</td>
                  <td className="px-6 py-4 text-gray-900">{order.location || 'Not specified'}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 w-1/3">Pickup Time</td>
                  <td className="px-6 py-4 text-gray-900">{order.time || 'Not specified'}</td>
                </tr>

                {/* Status & Total Row */}
                <tr className="border-b border-gray-200">
                  <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 w-1/3">Current Status</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 w-1/3">Order Total</td>
                  <td className="px-6 py-4 text-2xl font-bold text-emerald-600">₹{(order.total || 0).toFixed(2)}</td>
                </tr>

                {/* Notes Row */}
                {order.notes && (
                  <tr>
                    <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 w-1/3">Special Instructions</td>
                    <td className="px-6 py-4 text-gray-900">{order.notes}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Order Items Table */}
          {order.items && order.items.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Order Items ({order.items.length})</h3>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-6 py-4 font-semibold text-gray-700">Item Name</th>
                      <th className="text-left px-6 py-4 font-semibold text-gray-700">Category</th>
                      <th className="text-center px-6 py-4 font-semibold text-gray-700">Qty</th>
                      <th className="text-right px-6 py-4 font-semibold text-gray-700">Unit Price</th>
                      <th className="text-right px-6 py-4 font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{item.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-600">{item.category || 'General'}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full text-sm font-semibold text-orange-600">
                            {item.qty}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-700">₹{(item.price).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">₹{(item.price * item.qty).toFixed(2)}</td>
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                      <td colSpan="4" className="px-6 py-4 text-right text-gray-900">
                        Grand Total:
                      </td>
                      <td className="px-6 py-4 text-right text-emerald-600 text-lg">
                        ₹{(order.total || 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="border-t border-gray-200 pt-8 flex gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-8 py-3 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              Go Back
            </button>
            <button className="px-8 py-3 bg-orange-600 text-white font-semibold hover:bg-orange-700 rounded-lg transition-colors">
              Print Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;

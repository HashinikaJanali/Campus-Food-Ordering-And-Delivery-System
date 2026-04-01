import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronLeft, MapPin, Calendar, DollarSign, User, Clock, ShoppingBag, CheckCircle, AlertCircle } from 'lucide-react';
import { formatRs } from '../utils/currency';
import { TIME_SLOTS } from '../constants/orderConstants';
import AdminSidebar from '../components/AdminSidebar';
import StatusBadge from '../components/orders/StatusBadge';
import { MOCK_ORDERS } from '../constants/orderConstants';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { key: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  { key: 'preparing', label: 'Preparing', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { key: 'ready', label: 'Ready', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { key: 'delivering', label: 'Delivering', deliveryLabel: 'Handover to Delivery Agent', icon: ShoppingBag, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
  { key: 'delivered', label: 'Completed', icon: CheckCircle, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
  { key: 'cancelled', label: 'Cancelled', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
];

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Normalize order data from different sources
  const normalizeOrder = (rawOrder) => {
    if (!rawOrder) return null;
    return {
      id: rawOrder.orderId || rawOrder.id || rawOrder._id,
      orderId: rawOrder.orderId || rawOrder.id || rawOrder._id,
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
      deliveryInfo: rawOrder.deliveryInfo || null,
      addressType: rawOrder.addressType || rawOrder.address_type || null,
      location: rawOrder.location || rawOrder.deliveryInfo?.onCampusLocation || 'Campus Canteen',
      time: rawOrder.time || rawOrder.pickupTime || 'ASAP',
      status: rawOrder.status === 'completed' ? 'delivered' : rawOrder.status,
      notes: rawOrder.notes || rawOrder.note || '',
      isDelivery: rawOrder.addressType === 'off-campus',
      assignedDeliveryAgent: rawOrder.assignedDeliveryAgent || rawOrder.assignedTo || '',
      paymentStatus: rawOrder.paymentStatus || 'Pending',
      refundAmount: rawOrder.refundAmount || 0,
      refundReason: rawOrder.refundReason || null,
      refundRequestId: rawOrder.refundRequestId || null,
    };
  };

  const getDeliveryAddressText = (deliveryInfo) => {
    if (!deliveryInfo) return 'Not provided';
    const parts = [
      deliveryInfo.boardingName,
      deliveryInfo.street,
      deliveryInfo.area,
      deliveryInfo.landmark ? `Landmark: ${deliveryInfo.landmark}` : null,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Not provided';
  };

  const fetchOrderFromApi = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const response = await orderAPI.getById(orderId);
      if (response.data) {
        setOrder(normalizeOrder(response.data));
        return;
      }

      const foundOrder = MOCK_ORDERS.find(o => o.id === orderId);
      if (foundOrder) {
        setOrder(normalizeOrder(foundOrder));
      }
    } catch (err) {
      if (showLoader) {
        const foundOrder = MOCK_ORDERS.find(o => o.id === orderId);
        if (foundOrder) {
          setOrder(normalizeOrder(foundOrder));
        } else {
          console.error('Order not found:', err);
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrderFromApi(true);

    // Real-time refresh for fulfillment/status updates.
    const intervalId = setInterval(() => {
      fetchOrderFromApi(false);
    }, 8000);

    return () => clearInterval(intervalId);
  }, [orderId]);

  // Define status progression to prevent moving backwards
  const STATUS_ORDER = {
    pending: 0,
    preparing: 1,
    ready: 2,
    delivering: 3,
    delivered: 4,
    cancelled: 5,
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!order) return;
    const currIndex = STATUS_ORDER[order.status] ?? 0;
    const newIndex = STATUS_ORDER[newStatus] ?? 0;
    if (newIndex < currIndex) {
      return toast.error('Cannot move order status backwards');
    }

    try {
      // Update on backend using the actual MongoDB _id
      await orderAPI.updateStatus(order._id, newStatus);
      setOrder(prev => ({ ...prev, status: newStatus }));
      toast.success(`✓ Order status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
      console.error('Failed to update status on backend:', err);
    }
  };

  // Delivery assignment state
  const [assignedStaff, setAssignedStaff] = useState('');
  const [staffList] = useState(['Rider A', 'Rider B', 'Rider C']);

  const handleAssignStaff = async () => {
    if (order?.status !== 'ready') {
      return toast.error('You can assign a rider only when order status is Ready');
    }
    if (!assignedStaff) return toast.error('Select a delivery staff');
    try {
      await orderAPI.updateFulfillment(order._id, {
        assignedDeliveryAgent: assignedStaff,
      });
      setOrder(prev => ({ ...prev, assignedDeliveryAgent: assignedStaff }));
      toast.success(`Assigned to ${assignedStaff}`);
      fetchOrderFromApi(false);
    } catch (err) {
      toast.error('Failed to assign staff');
    }
  };

  // Pickup time editing
  const [editingTime, setEditingTime] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');

  // Sync selectedTime when order loads
  useEffect(() => {
    if (order && !editingTime) {
      setSelectedTime(order.time || '');
      setAssignedStaff(order.assignedDeliveryAgent || '');
    }
  }, [order, editingTime]);

  const handleSaveTime = async () => {
    if (!selectedTime) return toast.error('Please select a time');
    try {
      await orderAPI.updateFulfillment(order._id, {
        pickupTime: selectedTime,
        onCampusLocation: order.deliveryInfo?.onCampusLocation || 'Campus Canteen',
      });
      setOrder(prev => ({ ...prev, time: selectedTime }));
      setEditingTime(false);
      toast.success('Pickup time updated');
      fetchOrderFromApi(false);
    } catch (err) {
      toast.error('Failed to update pickup time');
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
        <AdminSidebar />
        <div className="ml-80 overflow-y-auto">
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
      <AdminSidebar />
      <div className="ml-80 overflow-y-auto">
        <div className="space-y-6 p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-display text-gray-900">Order Details</h1>
              <p className="text-gray-500 text-sm mt-1">Order ID: {order.orderId || order.id}</p>
              <p className="text-gray-400 text-xs mt-1">{refreshing ? 'Refreshing...' : 'Live updates every 8s'}</p>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {STATUS_OPTIONS
                .filter(({ key }) => {
                  if (!order.isDelivery && key === 'delivering') return false;
                  if (order.isDelivery && key === 'delivered') return false;
                  return true;
                })
                .map(({ key, label, deliveryLabel, icon: Icon, color, bg, border }) => (
                <button
                  key={key}
                  onClick={() => handleStatusUpdate(key)}
                  disabled={(STATUS_ORDER[key] ?? 0) < (STATUS_ORDER[order.status] ?? 0) || order.status === key}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-1 font-semibold ${
                    ((STATUS_ORDER[key] ?? 0) < (STATUS_ORDER[order.status] ?? 0) || order.status === key)
                      ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
                      : `bg-white ${border} hover:shadow-lg hover:border-orange-400`
                  }`}
                >
                  <Icon size={20} className={((STATUS_ORDER[key] ?? 0) < (STATUS_ORDER[order.status] ?? 0) || order.status === key) ? 'text-gray-400' : color} />
                  <span className={((STATUS_ORDER[key] ?? 0) < (STATUS_ORDER[order.status] ?? 0) || order.status === key) ? 'text-gray-500' : 'text-gray-700'}>
                    {key === 'delivering' && order.isDelivery ? deliveryLabel : label}
                  </span>
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
                {order.addressType === 'on-campus' ? (
                  <>
                    <tr>
                      <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 w-1/3">Fulfillment Type</td>
                      <td className="px-6 py-4 text-gray-900">Pickup</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 w-1/3">Pickup Location</td>
                      <td className="px-6 py-4 text-gray-900">{order.deliveryInfo?.onCampusLocation || order.location || 'Campus Canteen'}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 w-1/3">Pickup Time</td>
                      <td className="px-6 py-4 text-gray-900">{order.time || 'ASAP'}</td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr>
                      <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 w-1/3">Fulfillment Type</td>
                      <td className="px-6 py-4 text-gray-900">Delivery</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 w-1/3">Delivery Address</td>
                      <td className="px-6 py-4 text-gray-900">{getDeliveryAddressText(order.deliveryInfo)}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 w-1/3">Contact Number</td>
                      <td className="px-6 py-4 text-gray-900">{order.deliveryInfo?.phoneNumber || 'N/A'}</td>
                    </tr>
                  </>
                )}

                {/* Status & Total Row */}
                <tr className="border-b border-gray-200">
                  <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 w-1/3">Current Status</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 w-1/3">Payment Status</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest ${
                      order.paymentStatus === 'Refunded' 
                        ? 'bg-blue-100 text-blue-700' 
                        : order.paymentStatus === 'Completed'
                        ? 'bg-green-100 text-green-700'
                        : order.paymentStatus === 'Failed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 w-1/3">Order Total</td>
                  <td className="px-6 py-4 text-2xl font-bold text-emerald-600">{formatRs(order.total || 0)}</td>
                </tr>

                {/* Refund Information */}
                {order.paymentStatus === 'Refunded' && (
                  <>
                    <tr className="bg-blue-50 border-b border-blue-200">
                      <td className="px-6 py-4 font-semibold text-blue-900 w-1/3">✅ Refund Amount</td>
                      <td className="px-6 py-4 text-2xl font-bold text-blue-600">{formatRs(order.refundAmount || 0)}</td>
                    </tr>
                    {order.refundReason && (
                      <tr className="bg-blue-50 border-b border-blue-200">
                        <td className="px-6 py-4 font-semibold text-blue-900 w-1/3">Refund Reason</td>
                        <td className="px-6 py-4 text-gray-900">{order.refundReason}</td>
                      </tr>
                    )}
                  </>
                )}

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
                        <td className="px-6 py-4 text-right font-medium text-gray-700">{formatRs(item.price)}</td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">{formatRs(item.price * item.qty)}</td>
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                      <td colSpan="4" className="px-6 py-4 text-right text-gray-900">
                        Grand Total:
                      </td>
                      <td className="px-6 py-4 text-right text-emerald-600 text-lg">
                        {formatRs(order.total || 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Delivery / Pickup Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              {order.addressType === 'on-campus' ? 'Pickup Information' : 'Delivery Information'}
            </h3>
            {order.isDelivery ? (
              <div className="space-y-4">
                <div className="text-sm text-gray-700">
                  <div className="font-medium">Delivery Address</div>
                  <div className="text-gray-900 mt-1">
                    {getDeliveryAddressText(order.deliveryInfo)}
                  </div>
                </div>

                <div>
                  <div className="font-medium text-sm text-gray-700 mb-2">Assign Delivery Staff</div>
                  <div className="flex gap-2">
                    <select
                      value={assignedStaff}
                      onChange={e => setAssignedStaff(e.target.value)}
                      disabled={order.status !== 'ready'}
                      className="flex-1 px-3 py-2 border rounded-lg disabled:bg-gray-100 disabled:text-gray-500"
                    >
                      <option value="">Select staff...</option>
                      {staffList.map(s => (<option key={s} value={s}>{s}</option>))}
                    </select>
                    <button
                      onClick={handleAssignStaff}
                      disabled={order.status !== 'ready'}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Assign
                    </button>
                  </div>
                  {order.status !== 'ready' && (
                    <p className="text-xs text-amber-700 mt-2">Rider can be assigned only after order status is Ready.</p>
                  )}
                  {order.assignedDeliveryAgent && (
                    <div className="text-sm text-gray-600 mt-2">
                      Currently assigned to: <strong>{order.assignedDeliveryAgent}</strong>
                    </div>
                  )}
                </div>
              </div>
              ) : (
              <div>
                <div className="font-medium text-gray-700">Pickup</div>
                <div className="mt-2">
                  {editingTime ? (
                    <div className="flex items-center gap-2">
                      <select value={selectedTime} onChange={e => setSelectedTime(e.target.value)} className="px-3 py-2 border rounded-lg">
                        <option value="">Select time...</option>
                        {TIME_SLOTS.map(t => (<option key={t} value={t}>{t}</option>))}
                      </select>
                      <button onClick={handleSaveTime} className="px-3 py-2 bg-orange-600 text-white rounded-lg">Save</button>
                      <button onClick={() => { setEditingTime(false); setSelectedTime(order.time || ''); }} className="px-3 py-2 border rounded-lg">Cancel</button>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-purple-50 border border-purple-200 text-purple-700">
                      <Clock size={16} />
                      <span className="font-medium">Pickup: {order.time || 'ASAP'}</span>
                      <span className="hidden sm:inline">· {order.deliveryInfo?.onCampusLocation || order.location || 'Campus Canteen'}</span>
                      <button onClick={() => setEditingTime(true)} className="ml-3 text-sm text-purple-700 underline">Edit</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

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

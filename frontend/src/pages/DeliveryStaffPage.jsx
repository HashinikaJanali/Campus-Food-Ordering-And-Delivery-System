import { useState, useEffect, useMemo } from 'react';
import { orderAPI } from '../services/api';
import StatusBadge from '../components/orders/StatusBadge';
import { Phone, User, CheckCircle, PlayCircle, RefreshCw, PhoneCall } from 'lucide-react';
import DeliverySidebar from '../components/DeliverySidebar';

const DeliveryStaffPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const fetchAssignedOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      // For now we fetch all orders and filter — replace with real assigned-orders API when available
      const response = await orderAPI.getAll();
      const assigned = response.data.filter(o => ['ready', 'delivering'].includes(o.status));
      setOrders(assigned);
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStartDelivery = async (orderId) => {
    setUpdating(prev => ({ ...prev, [orderId]: true }));
    try {
      await orderAPI.updateStatus(orderId, 'delivering');
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'delivering' } : o));
    } catch (err) {
      alert('Failed to start delivery');
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleMarkDelivered = async (orderId) => {
    setUpdating(prev => ({ ...prev, [orderId]: true }));
    try {
      await orderAPI.updateStatus(orderId, 'delivered');
      setOrders(prev => prev.filter(o => o._id !== orderId));
    } catch (err) {
      alert('Failed to mark as delivered');
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const counts = useMemo(() => {
    const assigned = orders.length;
    const delivering = orders.filter(o => o.status === 'delivering').length;
    const deliveredToday = 0; // Placeholder — calculate from timestamps when available
    return { assigned, delivering, deliveredToday };
  }, [orders]);

  const filtered = orders.filter(o => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (o._id || o.id || '').toString().toLowerCase().includes(s) ||
      (o.customerName || o.customer || '').toLowerCase().includes(s) ||
      (o.deliveryInfo?.onCampusLocation || '').toLowerCase().includes(s);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <DeliverySidebar />
      <div className="ml-80 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-display text-gray-900">Delivery Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Assigned orders and delivery tools for field staff</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchAssignedOrders} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-2xl shadow-sm border border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User size={28} className="text-blue-600" />
              <div>
                <div className="text-xs font-semibold text-blue-600 uppercase">Assigned</div>
                <div className="text-sm text-blue-700">Orders ready for pickup</div>
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-900">{counts.assigned}</div>
          </div>

          <div className="bg-emerald-50 p-4 rounded-2xl shadow-sm border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PlayCircle size={28} className="text-emerald-600" />
              <div>
                <div className="text-xs font-semibold text-emerald-600 uppercase">Delivering</div>
                <div className="text-sm text-emerald-700">On the way to customers</div>
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-900">{counts.delivering}</div>
          </div>

          <div className="bg-indigo-50 p-4 rounded-2xl shadow-sm border border-indigo-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle size={28} className="text-indigo-600" />
              <div>
                <div className="text-xs font-semibold text-indigo-600 uppercase">Delivered Today</div>
                <div className="text-sm text-indigo-700">Completed deliveries</div>
              </div>
            </div>
            <div className="text-2xl font-bold text-indigo-900">{counts.deliveredToday}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by order id, customer, or location"
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-gray-500">Loading assigned orders…</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="text-gray-500">No assigned orders.</div>
            ) : (
              <div className="space-y-4">
                {filtered.map(order => (
                  <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <StatusBadge status={order.status} />
                          <div className="font-semibold text-gray-800 truncate">Order {order._id}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-700">
                          <div>
                            <div className="font-medium text-gray-700">Customer</div>
                            <div className="text-gray-900">{order.customerName || order.customer || 'N/A'}</div>
                            <div className="flex items-center gap-2 mt-2 text-xs">
                              <PhoneCall size={14} />
                              <a className="text-orange-600 font-medium" href={`tel:${order.deliveryInfo?.phoneNumber || ''}`}>{order.deliveryInfo?.phoneNumber || 'N/A'}</a>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-700">Delivery Location</div>
                            <div className="text-gray-900">{order.deliveryInfo?.onCampusLocation || order.deliveryInfo?.boardingName || order.deliveryInfo?.street || 'N/A'}</div>
                            {order.deliveryInfo?.landmark && <div className="text-gray-500 text-xs mt-1">Landmark: {order.deliveryInfo.landmark}</div>}
                          </div>
                          <div>
                            <div className="font-medium text-gray-700">Items</div>
                            <ul className="text-gray-900 list-disc ml-5 text-sm">
                              {order.items?.map((it, i) => (<li key={i}>{it.name} x {it.quantity}</li>))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 items-end">
                        {order.status === 'ready' && (
                          <button
                            onClick={() => handleStartDelivery(order._id)}
                            disabled={updating[order._id]}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60"
                          >
                            <PlayCircle size={16} /> Start
                          </button>
                        )}

                        {order.status === 'delivering' && (
                          <button
                            onClick={() => handleMarkDelivered(order._id)}
                            disabled={updating[order._id]}
                            className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-60"
                          >
                            <CheckCircle size={16} /> Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Locations / helpers column */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <div className="text-sm font-semibold text-gray-700 mb-2">Assigned Locations</div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {filtered.length === 0 && (
                  <div className="text-gray-500">No locations to show.</div>
                )}
                {filtered.map(order => (
                  <div key={order._id} className="p-3 border rounded-lg">
                    <div className="font-medium text-sm text-gray-800">Order {order._id}</div>
                    <div className="text-sm text-gray-700 mt-1">
                      {order.deliveryInfo?.onCampusLocation && <div>{order.deliveryInfo.onCampusLocation}</div>}
                      {order.deliveryInfo?.boardingName && <div>{order.deliveryInfo.boardingName}</div>}
                      {order.deliveryInfo?.street && <div>{order.deliveryInfo.street}</div>}
                      {order.deliveryInfo?.area && <div>{order.deliveryInfo.area}</div>}
                      {order.deliveryInfo?.landmark && <div className="text-gray-500 text-xs">Landmark: {order.deliveryInfo.landmark}</div>}
                      <div className="text-xs text-gray-500 mt-1">Phone: {order.deliveryInfo?.phoneNumber || 'N/A'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <div className="text-sm font-semibold text-gray-700 mb-2">Quick Actions</div>
              <div className="flex flex-col gap-2">
                <button onClick={fetchAssignedOrders} className="px-3 py-2 bg-white border rounded-lg text-sm">Refresh Assigned Orders</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryStaffPage;

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, ShoppingBag, CheckCircle, AlertCircle, MapPin, Calendar, DollarSign, User } from 'lucide-react';
import StatusBadge from './StatusBadge';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { key: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  { key: 'preparing', label: 'Preparing', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { key: 'ready', label: 'Ready', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { key: 'cancelled', label: 'Cancelled', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
];

const OrderDetailsModal = ({ order, isOpen, onClose, onStatusChange }) => {
  const handleStatusUpdate = (newStatus) => {
    onStatusChange(order._id, newStatus);
    toast.success(`✓ Order status updated to ${newStatus}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl mx-4 bg-white rounded-2xl shadow-xl z-50 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-orange-500 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Order Details</h2>
                <p className="text-orange-100 text-sm mt-1">Order ID: {order._id}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-orange-700 rounded-lg transition-colors"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              {/* Customer & Order Summary - 2 Column Grid */}
              <div className="grid grid-cols-2 gap-8">
                {/* Customer Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={32} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Customer</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{order.customerName || order.customer || 'Unknown'}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{order.studentId || 'Regular Customer'}</p>
                      {order.customerEmail && <p className="text-sm text-gray-500 mt-2">{order.customerEmail}</p>}
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Order Total</p>
                      <p className="text-3xl font-bold text-emerald-600 mt-1">₹{(order.totalAmount || order.total || 0).toFixed(2)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-200">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Payment</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{order.paymentMethod || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {order.items && order.items.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Order Items ({order.items.length})</h3>
                  <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <th className="text-left px-6 py-3 font-semibold text-gray-700">Item Name</th>
                          <th className="text-center px-6 py-3 font-semibold text-gray-700">Qty</th>
                          <th className="text-right px-6 py-3 font-semibold text-gray-700">Price</th>
                          <th className="text-right px-6 py-3 font-semibold text-gray-700">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {order.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-white transition-colors">
                            <td className="px-6 py-3">
                              <p className="font-medium text-gray-900">{item.name}</p>
                              {item.category && <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>}
                            </td>
                            <td className="px-6 py-3 text-center">
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-100 rounded-full text-sm font-semibold text-orange-600">
                                {item.qty}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-right font-medium text-gray-700">₹{(item.price).toFixed(2)}</td>
                            <td className="px-6 py-3 text-right font-bold text-gray-900">₹{(item.price * item.qty).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Location & Timing Info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-indigo-600" />
                    <p className="text-xs text-gray-600 font-semibold uppercase">Location</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{order.location || order.pickupLocation || 'Not specified'}</p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-purple-600" />
                    <p className="text-xs text-gray-600 font-semibold uppercase">Pickup Time</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{order.scheduledPickup || new Date(order.createdAt || Date.now()).toLocaleTimeString()}</p>
                </div>

                <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={16} className="text-rose-600" />
                    <p className="text-xs text-gray-600 font-semibold uppercase">Status</p>
                  </div>
                  <div className="mt-1">
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              </div>

              {/* Status Update Section */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Update Order Status</h3>
                <div className="grid grid-cols-2 gap-3">
                  {STATUS_OPTIONS.map(({ key, label, icon: Icon, color, bg, border }) => (
                    <button
                      key={key}
                      onClick={() => handleStatusUpdate(key)}
                      disabled={order.status === key}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 font-medium hover:shadow-md ${
                        order.status === key
                          ? `${bg} ${border} border-2 cursor-not-allowed opacity-50 bg-gray-100 border-gray-300`
                          : `bg-white ${border} hover:shadow-lg hover:border-orange-400`
                      }`}
                    >
                      <Icon size={24} className={order.status === key ? 'text-gray-400' : color} />
                      <span className={order.status === key ? 'text-gray-500' : 'text-gray-700'}>{label}</span>
                      {order.status === key && <span className="text-xs text-gray-400 mt-1">(Current)</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              {order.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Special Instructions</p>
                  <p className="text-sm text-gray-700">{order.notes}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-4 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OrderDetailsModal;

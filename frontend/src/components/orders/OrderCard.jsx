// vendor card with toast notifications

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Phone, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from './StatusBadge';
import ETABadge from './ETABadge';
import PickupTimeBadge from './PickupTimeBadge';

const NEXT_STATUS = {
  pending:  { key: 'preparing', label: '✅ Accept & Prepare' },
  preparing: { key: 'ready',    label: '🍱 Mark as Ready' },
  ready:     { key: 'picked_up', label: '✔️ Mark as Picked Up' },
};

const TOAST_MESSAGES = {
  preparing: (id) => `Order ${id} is now being prepared! 👨‍🍳`,
  ready:     (id) => `Order ${id} is ready for pickup! 🎉`,
  picked_up: (id) => `Order ${id} has been picked up! ✅`,
  cancelled: (id) => `Order ${id} has been cancelled.`,
};

const OrderCard = ({ order, onStatusChange }) => {
  const [expanded, setExpanded] = useState(false);

  const next = NEXT_STATUS[order.status];

  const handleStatusChange = (newStatus) => {
    onStatusChange(order.id, newStatus);
    const msg = TOAST_MESSAGES[newStatus]?.(order.id);
    if (msg) {
      newStatus === 'cancelled'
        ? toast.error(msg)
        : toast.success(msg);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
    >
      {/* Card Header */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-800">{order.id}</span>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-gray-600 text-sm font-medium">{order.customer}
            <span className="text-gray-400 font-normal ml-2 text-xs">{order.studentId}</span>
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{order.location}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Ordered at {order.time}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <ETABadge status={order.status} />
            <PickupTimeBadge time={order.scheduledPickup} location={order.location} />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-xs text-gray-400">Total</p>
            <p className="font-bold text-gray-800 text-lg">Rs. {order.total}</p>
          </div>
          <button
            onClick={() => setExpanded(p => !p)}
            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 px-5 py-4 space-y-4">
              {/* Items */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Order Items</p>
                <div className="space-y-1.5">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.name} <span className="text-gray-400">×{item.qty}</span></span>
                      <span className="font-medium text-gray-700">Rs. {item.price * item.qty}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-semibold border-t border-dashed border-gray-200 pt-1.5 mt-1.5">
                    <span>Total</span>
                    <span>Rs. {order.total}</span>
                  </div>
                </div>
              </div>

              {/* Note & Contact */}
              <div className="flex flex-col sm:flex-row gap-3">
                {order.note && (
                  <div className="flex-1 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">
                    📝 <span className="font-medium">Note:</span> {order.note}
                  </div>
                )}
                <a
                  href={`tel:${order.phone}`}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {order.phone}
                </a>
              </div>

              {/* Action Buttons */}
              {next && (
                <div className="flex gap-2 pt-1">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStatusChange(next.key)}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-primary shadow-md"
                  >
                    {next.label}
                  </motion.button>
                  {order.status === 'pending' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleStatusChange('cancelled')}
                      className="px-4 py-2.5 rounded-xl font-semibold text-sm text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all"
                    >
                      Cancel
                    </motion.button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrderCard;

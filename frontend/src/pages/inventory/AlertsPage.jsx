import { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle, AlertTriangle, XCircle, Package, Trash2, Check, RefreshCw } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useOutletContext } from 'react-router-dom';

const alertConfig = {
  out_of_stock: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', badge: 'badge-out-of-stock' },
  low_stock: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', badge: 'badge-low-stock' },
  restocked: { icon: Package, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', badge: 'badge-in-stock' },
  threshold_changed: { icon: Bell, color: 'text-admin-500', bg: 'bg-admin-50', border: 'border-admin-100', badge: 'badge-in-stock' },
};

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active'); // active | all | resolved
  const { refreshAlerts } = useOutletContext() || {};

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = filter === 'resolved' ? '?isResolved=true' : filter === 'active' ? '?isResolved=false' : '';
      const res = await api.get(`/alerts${params}&limit=100`);
      setAlerts(res.data.data);
    } catch {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, [filter]);

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/alerts/${id}/read`);
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, isRead: true } : a));
      refreshAlerts?.();
    } catch { }
  };

  const handleResolve = async (id) => {
    try {
      await api.patch(`/alerts/${id}/resolve`);
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, isResolved: true, isRead: true } : a));
      toast.success('Alert resolved');
      refreshAlerts?.();
    } catch {
      toast.error('Failed to resolve');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/alerts/mark-all-read');
      setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
      toast.success('All alerts marked as read');
      refreshAlerts?.();
    } catch {
      toast.error('Failed to mark all read');
    }
  };

  const handleClearResolved = async () => {
    try {
      await api.delete('/alerts/clear-resolved');
      setAlerts(prev => prev.filter(a => !a.isResolved));
      toast.success('Cleared resolved alerts');
    } catch {
      toast.error('Failed to clear');
    }
  };

  const unread = alerts.filter(a => !a.isRead && !a.isResolved).length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-admin-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900 flex items-center gap-2">
            Stock Alerts
            {unread > 0 && (
              <span className="bg-red-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse-soft">
                {unread}
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Monitor stock-related notifications</p>
        </div>
        <div className="flex gap-2">
          {unread > 0 && (
            <button onClick={handleMarkAllRead} className="btn-secondary text-sm flex items-center gap-2">
              <BellOff size={14} />
              Mark All Read
            </button>
          )}
          <button onClick={handleClearResolved} className="btn-danger text-sm flex items-center gap-2">
            <Trash2 size={14} />
            Clear Resolved
          </button>
          <button onClick={fetchAlerts} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-admin-600 px-3 py-2 rounded-xl hover:bg-admin-50 transition-colors font-display font-medium">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: 'active', label: 'Active' },
          { key: 'all', label: 'All' },
          { key: 'resolved', label: 'Resolved' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold font-display transition-all duration-200 ${filter === tab.key
                ? 'bg-white text-admin-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      {alerts.length === 0 ? (
        <div className="card text-center py-16">
          <Bell size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="font-display font-semibold text-gray-600">No alerts</p>
          <p className="text-gray-400 text-sm mt-1">
            {filter === 'active' ? "All items are well stocked! ✅" : "No alerts to display"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, idx) => {
            const config = alertConfig[alert.alertType] || alertConfig.low_stock;
            const Icon = config.icon;

            return (
              <div
                key={alert._id}
                className={`card p-4 transition-all duration-200 border animate-fade-in ${config.border} ${!alert.isRead && !alert.isResolved ? config.bg : 'bg-white'} ${alert.isResolved ? 'opacity-60' : ''}`}
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                    <Icon size={18} className={config.color} />
                  </div>

                  {/* Food item image */}
                  {alert.foodItem?.image ? (
                    <img src={alert.foodItem.image} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-base flex-shrink-0">🍽️</div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-800 font-display">{alert.message}</p>
                      {!alert.isRead && !alert.isResolved && (
                        <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1.5 animate-pulse" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-xs text-gray-400">{timeAgo(alert.createdAt)}</span>
                      <span className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-full ${alert.alertType === 'out_of_stock' ? 'bg-red-100 text-red-600' :
                          alert.alertType === 'low_stock' ? 'bg-amber-100 text-amber-600' :
                            'bg-emerald-100 text-emerald-600'
                        }`}>
                        {alert.alertType.replace(/_/g, ' ')}
                      </span>
                      {alert.isResolved && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Resolved</span>
                      )}
                      {alert.currentStock !== undefined && (
                        <span className="text-xs text-gray-400">Stock: {alert.currentStock}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {!alert.isResolved && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!alert.isRead && (
                        <button
                          onClick={() => handleMarkRead(alert._id)}
                          className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleResolve(alert._id)}
                        className="p-1.5 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 rounded-lg transition-colors"
                        title="Mark as resolved"
                      >
                        <CheckCircle size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

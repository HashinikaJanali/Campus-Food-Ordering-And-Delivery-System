import { useState, useEffect } from 'react';
import { Package, Plus, Minus, Edit3, Save, X, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const StockBar = ({ current, threshold, max = null }) => {
  const effectiveMax = max || Math.max(current * 1.2, threshold * 3, 50);
  const pct = Math.min((current / effectiveMax) * 100, 100);
  const color = current === 0 ? 'bg-red-400' : current <= threshold ? 'bg-amber-400' : 'bg-emerald-400';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-6 text-right">{Math.round(pct)}%</span>
    </div>
  );
};

const QuickAdjust = ({ item, onUpdate }) => {
  const [qty, setQty] = useState('');
  const [op, setOp] = useState('add');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!qty || isNaN(qty) || parseInt(qty) < 0) {
      toast.error('Enter a valid quantity');
      return;
    }
    setSaving(true);
    try {
      const res = await api.patch(`/inventory/${item._id}/stock`, {
        quantity: parseInt(qty),
        operation: op
      });
      toast.success('Stock updated!');
      onUpdate(res.data.data);
      setQty('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <select
        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-1 focus:ring-primary-400 focus:outline-none"
        value={op}
        onChange={e => setOp(e.target.value)}
      >
        <option value="add">+ Add</option>
        <option value="subtract">- Remove</option>
        <option value="set">= Set to</option>
      </select>
      <input
        type="number" min="0" placeholder="Qty"
        className="w-20 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-primary-400 focus:outline-none"
        value={qty}
        onChange={e => setQty(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSave()}
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-3 py-1.5 bg-primary-500 text-white text-xs rounded-lg hover:bg-primary-600 transition-colors font-display font-semibold disabled:opacity-70"
      >
        {saving ? '...' : 'Update'}
      </button>
    </div>
  );
};

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedItem, setExpandedItem] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [invRes, catsRes] = await Promise.all([
        api.get('/inventory/overview'),
        api.get('/categories')
      ]);
      setItems(invRes.data.data);
      setCategories(catsRes.data.data);
    } catch {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleItemUpdate = (updated) => {
    setItems(prev => prev.map(item => item._id === updated._id ? updated : item));
  };

  const getStatus = (item) => {
    if (item.stockQuantity === 0) return 'out_of_stock';
    if (item.stockQuantity <= item.lowStockThreshold) return 'low_stock';
    return 'in_stock';
  };

  const filtered = items.filter(item => {
    if (filterCat !== 'all' && item.category?._id !== filterCat) return false;
    const status = getStatus(item);
    if (filterStatus !== 'all' && status !== filterStatus) return false;
    return true;
  });

  const counts = {
    in_stock: items.filter(i => getStatus(i) === 'in_stock').length,
    low_stock: items.filter(i => getStatus(i) === 'low_stock').length,
    out_of_stock: items.filter(i => getStatus(i) === 'out_of_stock').length,
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Inventory Management</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor and update stock quantities</p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-xl transition-all duration-200 font-display font-medium">
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: 'in_stock', label: 'In Stock', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
          { key: 'low_stock', label: 'Low Stock', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border-amber-200' },
          { key: 'out_of_stock', label: 'Out of Stock', icon: XCircle, color: 'text-red-600 bg-red-50 border-red-200' },
        ].map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
            className={`card flex items-center gap-3 transition-all duration-200 hover:shadow-md cursor-pointer border ${filterStatus === key ? 'ring-2 ring-primary-400' : ''
              } ${color.split(' ').slice(1).join(' ')}`}
          >
            <Icon size={20} className={color.split(' ')[0]} />
            <div>
              <p className={`text-xl font-bold font-display ${color.split(' ')[0]}`}>{counts[key]}</p>
              <p className="text-xs font-medium text-gray-600 font-display">{label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          className="input-field w-auto"
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
        </select>
        <p className="text-sm text-gray-400 self-center">{filtered.length} items</p>
      </div>

      {/* Inventory list */}
      <div className="space-y-3">
        {filtered.map((item, idx) => {
          const status = getStatus(item);
          const isExpanded = expandedItem === item._id;

          return (
            <div
              key={item._id}
              className={`card p-4 transition-all duration-200 animate-fade-in ${status === 'out_of_stock' ? 'border-red-100 bg-red-50/30' :
                status === 'low_stock' ? 'border-amber-100 bg-amber-50/30' :
                  'hover:shadow-md'
                }`}
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <div className="flex items-center gap-4">
                {/* Image */}
                <div className="w-14 h-14 flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <div className="w-full h-full bg-primary-50 rounded-xl flex items-center justify-center text-2xl">🍽️</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-xs text-gray-400">{item.category?.icon} {item.category?.name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-2xl font-bold font-display ${status === 'out_of_stock' ? 'text-red-600' :
                        status === 'low_stock' ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                        {item.stockQuantity}
                      </p>
                      <p className="text-xs text-gray-400">units</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <StockBar current={item.stockQuantity} threshold={item.lowStockThreshold} />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-400">Threshold: {item.lowStockThreshold}</span>
                      {status === 'low_stock' && (
                        <span className="text-xs text-amber-600 font-semibold font-display flex items-center gap-1">
                          <AlertTriangle size={10} /> Low stock alert
                        </span>
                      )}
                      {status === 'out_of_stock' && (
                        <span className="text-xs text-red-600 font-semibold font-display flex items-center gap-1">
                          <XCircle size={10} /> Out of stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expand toggle */}
                <button
                  onClick={() => setExpandedItem(isExpanded ? null : item._id)}
                  className={`flex-shrink-0 p-2 rounded-xl transition-all duration-200 font-display font-semibold text-xs flex items-center gap-1 ${isExpanded ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                    }`}
                >
                  <Edit3 size={14} />
                  {isExpanded ? 'Close' : 'Update'}
                </button>
              </div>

              {/* Quick adjust expanded */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                  <p className="text-xs font-semibold text-gray-600 mb-2 font-display">Quick Stock Adjustment</p>
                  <QuickAdjust item={item} onUpdate={(updated) => { handleItemUpdate(updated); setExpandedItem(null); }} />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[10, 25, 50, 100].map(amount => (
                      <button
                        key={amount}
                        onClick={async () => {
                          try {
                            const res = await api.patch(`/inventory/${item._id}/stock`, { quantity: amount, operation: 'add' });
                            handleItemUpdate(res.data.data);
                            toast.success(`Added ${amount} units`);
                          } catch {
                            toast.error('Failed to update');
                          }
                        }}
                        className="px-3 py-1 bg-primary-50 text-primary-700 text-xs rounded-lg hover:bg-primary-100 transition-colors font-display font-semibold"
                      >
                        +{amount}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card text-center py-16">
          <Package size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="font-display font-semibold text-gray-600">No inventory items found</p>
        </div>
      )}
    </div>
  );
}

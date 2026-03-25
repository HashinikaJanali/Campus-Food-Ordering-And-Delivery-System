import { useState, useEffect } from 'react';
import {
  Plus, Search, Filter, Edit2, Trash2, Eye, EyeOff,
  CheckCircle, XCircle, AlertTriangle, SlidersHorizontal
} from 'lucide-react';
import api, { getImageUrl } from '../../utils/api';
import toast from 'react-hot-toast';
import FoodItemModal from '../../components/FoodItemModal';

const StockBadge = ({ item }) => {
  if (item.stockQuantity === 0) return <span className="badge-out-of-stock"><XCircle size={10} /> Out of Stock</span>;
  if (item.stockQuantity <= item.lowStockThreshold) return <span className="badge-low-stock"><AlertTriangle size={10} /> Low Stock ({item.stockQuantity})</span>;
  return <span className="badge-in-stock"><CheckCircle size={10} /> In Stock ({item.stockQuantity})</span>;
};

export default function FoodItemsPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filters, setFilters] = useState({ search: '', category: 'all', canteen: 'all', status: 'all', menuVisible: 'all' });
  const [viewMode, setViewMode] = useState('grid'); // grid | table

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [itemsRes, catsRes, canteensRes] = await Promise.all([
        api.get('/food-items'),
        api.get('/categories'),
        api.get('/canteens')
      ]);
      setItems(itemsRes.data.data);
      setCategories(catsRes.data.data);
      setCanteens(canteensRes.data.data);
    } catch {
      toast.error('Failed to load food items');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMenu = async (id) => {
    try {
      const res = await api.patch(`/food-items/${id}/toggle-menu`);
      toast.success(res.data.message);
      setItems(prev => prev.map(item => item._id === id ? { ...item, isMenuVisible: !item.isMenuVisible } : item));
    } catch {
      toast.error('Failed to toggle menu visibility');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/food-items/${id}`);
      toast.success('Food item deleted');
      setItems(prev => prev.filter(item => item._id !== id));
      setDeleteConfirm(null);
    } catch {
      toast.error('Failed to delete item');
    }
  };

  const filtered = items.filter(item => {
    if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.category !== 'all' && item.category?._id !== filters.category) return false;
    if (filters.canteen !== 'all' && item.canteen?._id !== filters.canteen) return false;
    if (filters.status === 'in_stock' && item.stockQuantity <= item.lowStockThreshold) return false;
    if (filters.status === 'low_stock' && (item.stockQuantity === 0 || item.stockQuantity > item.lowStockThreshold)) return false;
    if (filters.status === 'out_of_stock' && item.stockQuantity !== 0) return false;
    if (filters.menuVisible === 'visible' && !item.isMenuVisible) return false;
    if (filters.menuVisible === 'hidden' && item.isMenuVisible) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Food Items</h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} total items</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowModal(true); }} className="btn-admin flex items-center gap-2">
          <Plus size={16} />
          Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="Search food items..."
              className="w-full h-11 pl-9 pr-4 border border-gray-300 rounded-xl outline-none focus:border-admin-500 focus:ring-2 focus:ring-admin-500/20 font-body text-sm bg-white transition-all text-gray-900"
              value={filters.search}
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <select
            className="h-11 px-4 border border-gray-300 rounded-xl outline-none focus:border-admin-500 focus:ring-2 focus:ring-admin-500/20 font-body text-sm bg-white transition-all text-gray-900"
            value={filters.category}
            onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
          </select>
          <select
            className="h-11 px-4 border border-gray-300 rounded-xl outline-none focus:border-admin-500 focus:ring-2 focus:ring-admin-500/20 font-body text-sm bg-white transition-all text-gray-900"
            value={filters.canteen}
            onChange={e => setFilters(prev => ({ ...prev, canteen: e.target.value }))}
          >
            <option value="all">All Canteens</option>
            {canteens.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select
            className="h-11 px-4 border border-gray-300 rounded-xl outline-none focus:border-admin-500 focus:ring-2 focus:ring-admin-500/20 font-body text-sm bg-white transition-all text-gray-900"
            value={filters.status}
            onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="all">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
          <select
            className="h-11 px-4 border border-gray-300 rounded-xl outline-none focus:border-admin-500 focus:ring-2 focus:ring-admin-500/20 font-body text-sm bg-white transition-all text-gray-900"
            value={filters.menuVisible}
            onChange={e => setFilters(prev => ({ ...prev, menuVisible: e.target.value }))}
          >
            <option value="all">All Visibility</option>
            <option value="visible">Menu Visible</option>
            <option value="hidden">Menu Hidden</option>
          </select>
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 text-sm font-body transition-colors ${viewMode === 'grid' ? 'bg-admin-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 text-sm font-body transition-colors ${viewMode === 'table' ? 'bg-admin-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              Table
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">{filtered.length} of {items.length} items shown</p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-10 h-10 border-4 border-admin-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-16">
          <div className="text-4xl mb-3">🍽️</div>
          <p className="font-display font-semibold text-gray-700">No items found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or add a new item</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item, idx) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group animate-fade-in"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              {/* Image */}
              <div className="relative h-44 bg-gray-100">
                {item.image ? (
                  <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-admin-50 to-orange-50">
                    🍽️
                  </div>
                )}
                {/* Overlay badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {!item.isMenuVisible && (
                    <span className="bg-gray-800/80 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">Hidden</span>
                  )}
                  {item.isVegetarian && (
                    <span className="bg-emerald-500/90 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">🌿 Veg</span>
                  )}
                </div>
                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => { setEditItem(item); setShowModal(true); }}
                    className="p-2 bg-white rounded-lg shadow-md hover:bg-blue-50 transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={14} className="text-blue-500" />
                  </button>
                  <button
                    onClick={() => handleToggleMenu(item._id)}
                    className="p-2 bg-white rounded-lg shadow-md hover:bg-admin-50 transition-colors"
                    title={item.isMenuVisible ? 'Hide from menu' : 'Show on menu'}
                  >
                    {item.isMenuVisible ? <EyeOff size={14} className="text-admin-600" /> : <Eye size={14} className="text-admin-600" />}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(item)}
                    className="p-2 bg-white rounded-lg shadow-md hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-display font-semibold text-gray-900 text-sm leading-tight">{item.name}</h3>
                  <span className="font-bold text-admin-600 text-sm whitespace-nowrap font-display">
                    Rs. {parseFloat(item.price).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{item.description || 'No description'}</p>
                <div className="flex items-center justify-between">
                  <StockBadge item={item} />
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-medium">{item.category?.name}</p>
                    <p className="text-[10px] text-admin-500 font-semibold">{item.canteen?.name}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table view */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 font-display">Item</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 font-display">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 font-display">Canteen</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 font-display">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 font-display">Stock</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 font-display">Threshold</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 font-display">Menu</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 font-display">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 font-display">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(item => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img src={getImageUrl(item.image)} alt={item.name} className="w-9 h-9 rounded-lg object-cover" />
                        ) : (
                          <div className="w-9 h-9 bg-admin-50 rounded-lg flex items-center justify-center text-base">🍽️</div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900 font-display">{item.name}</p>
                          <p className="text-xs text-gray-400 max-w-xs truncate">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.category?.icon} {item.category?.name}</td>
                    <td className="px-4 py-3 text-sm text-admin-600 font-medium">{item.canteen?.name}</td>
                    <td className="px-4 py-3 text-sm font-bold text-admin-600 font-display">Rs. {parseFloat(item.price).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold font-display ${item.stockQuantity === 0 ? 'text-red-600' :
                        item.stockQuantity <= item.lowStockThreshold ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                        {item.stockQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.lowStockThreshold}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleMenu(item._id)} title="Toggle menu visibility">
                        {item.isMenuVisible ? (
                          <Eye size={16} className="text-emerald-500" />
                        ) : (
                          <EyeOff size={16} className="text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3"><StockBadge item={item} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditItem(item); setShowModal(true); }}
                          className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-500 rounded-lg transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(item)}
                          className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <FoodItemModal
          item={editItem}
          categories={categories}
          onClose={() => { setShowModal(false); setEditItem(null); }}
          onSaved={() => { setShowModal(false); setEditItem(null); fetchAll(); }}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="font-display font-bold text-gray-900 text-lg">Delete Item?</h3>
              <p className="text-gray-500 text-sm mt-2">
                Are you sure you want to delete <strong>"{deleteConfirm.name}"</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors font-display"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

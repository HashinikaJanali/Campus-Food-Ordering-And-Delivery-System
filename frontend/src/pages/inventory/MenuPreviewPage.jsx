import { useState, useEffect } from 'react';
import { Eye, EyeOff, Clock, Leaf } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function MenuPreviewPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [itemsRes, catsRes] = await Promise.all([
        api.get('/food-items?menuVisible=true'),
        api.get('/categories')
      ]);
      setItems(itemsRes.data.data);
      setCategories(catsRes.data.data);
    } catch {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id, current) => {
    try {
      await api.patch(`/food-items/${id}/toggle-menu`);
      fetchAll();
      toast.success(current ? 'Hidden from menu' : 'Shown on menu');
    } catch {
      toast.error('Failed to toggle');
    }
  };

  const filtered = activeCategory === 'all'
    ? items
    : items.filter(i => i.category?._id === activeCategory);

  const menuCategories = categories.filter(c => items.some(i => i.category?._id === c._id));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-admin-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900">Menu Preview</h1>
        <p className="text-gray-500 text-sm mt-1">Preview how students see the menu. Click 👁 to toggle visibility.</p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold font-display transition-all duration-200 ${activeCategory === 'all' ? 'bg-admin-500 text-white shadow-orange' : 'bg-white text-gray-600 border border-gray-200 hover:border-admin-300'
            }`}
        >
          All ({items.length})
        </button>
        {menuCategories.map(cat => {
          const count = items.filter(i => i.category?._id === cat._id).length;
          return (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold font-display transition-all duration-200 ${activeCategory === cat._id ? 'bg-admin-500 text-white shadow-orange' : 'bg-white text-gray-600 border border-gray-200 hover:border-admin-300'
                }`}
            >
              {cat.icon} {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Menu grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 text-center py-16">
          <p className="text-gray-400">No items in this category are visible on the menu</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item, idx) => (
            <div
              key={item._id}
              className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-0 overflow-hidden transition-all duration-200 animate-fade-in group relative ${item.stockQuantity === 0 ? 'opacity-60' : 'hover:shadow-md hover:-translate-y-0.5'
                }`}
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              {/* Toggle button */}
              <button
                onClick={() => handleToggle(item._id, item.isMenuVisible)}
                className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
                title={item.isMenuVisible ? 'Hide from menu' : 'Show on menu'}
              >
                {item.isMenuVisible ? (
                  <Eye size={14} className="text-admin-600" />
                ) : (
                  <EyeOff size={14} className="text-gray-400" />
                )}
              </button>

              {/* Image */}
              <div className="h-48 bg-gray-100 relative">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-orange-50 to-admin-50">
                    {item.category?.icon || '🍽️'}
                  </div>
                )}
                {item.stockQuantity === 0 && (
                  <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
                    <span className="bg-red-500 text-white text-sm font-bold font-display px-3 py-1 rounded-full">
                      Sold Out
                    </span>
                  </div>
                )}
                {item.stockQuantity > 0 && item.stockQuantity <= item.lowStockThreshold && (
                  <div className="absolute bottom-2 left-2">
                    <span className="bg-amber-500 text-white text-xs font-semibold font-display px-2 py-0.5 rounded-full">
                      Only {item.stockQuantity} left
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-display font-bold text-gray-900 leading-tight">{item.name}</h3>
                  <span className="text-admin-600 font-bold font-display whitespace-nowrap">
                    Rs. {parseFloat(item.price).toFixed(2)}
                  </span>
                </div>
                {item.description && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{item.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {item.preparationTime} min
                  </span>
                  {item.isVegetarian && (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <Leaf size={11} />
                      Veg
                    </span>
                  )}
                  {item.tags?.slice(0, 2).map(tag => (
                    <span key={tag} className="bg-gray-100 px-1.5 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

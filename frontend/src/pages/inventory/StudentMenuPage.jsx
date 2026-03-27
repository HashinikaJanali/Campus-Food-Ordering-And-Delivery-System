import { useState, useEffect } from 'react';
import { ChefHat, Clock, Leaf, Search, ShoppingCart, Star, X, PlusCircle, MapPin } from 'lucide-react';
import api, { getImageUrl } from '../../utils/api';
import { useCart } from '../../context/CartContext';
import socket from '../../utils/socket';
import toast from 'react-hot-toast';

const FoodCard = ({ item, onClick, onStockUpdate }) => {
  const { addToCart } = useCart();
  const isOutOfStock = item.stockQuantity === 0;
  const isLow = item.stockQuantity > 0 && item.stockQuantity <= item.lowStockThreshold;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    const success = await addToCart(item);
    if (success) {
      onStockUpdate(item._id, item.stockQuantity - 1);
    }
  };

  return (
    <div
      onClick={() => !isOutOfStock && onClick(item)}
      className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-200 group flex flex-col h-full
        ${isOutOfStock ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'}
      `}
    >
      {/* Image */}
      <div className="h-48 relative bg-orange-50 overflow-hidden shrink-0">
        {item.image ? (
          <img
            src={getImageUrl(item.image)}
            alt={item.name}
            className={`w-full h-full object-cover transition-transform duration-300 ${!isOutOfStock ? 'group-hover:scale-105' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {item.category?.icon || '🍽️'}
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white font-bold text-sm px-4 py-1.5 rounded-full font-display">Sold Out</span>
          </div>
        )}
        {isLow && !isOutOfStock && (
          <div className="absolute top-2 right-2">
            <span className="bg-amber-500 text-white text-xs font-semibold font-display px-2 py-0.5 rounded-full shadow">
              Only {item.stockQuantity} left!
            </span>
          </div>
        )}
        {item.isVegetarian && (
          <div className="absolute top-2 left-2">
            <span className="bg-emerald-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
              <Leaf size={10} /> Veg
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-display font-bold text-gray-900 text-base leading-tight group-hover:text-admin-600 transition-colors">{item.name}</h3>
          <span className="text-admin-600 font-bold font-display text-base whitespace-nowrap">Rs. {parseFloat(item.price).toFixed(2)}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-2">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {item.preparationTime}m
          </span>
          {item.canteen && (
            <span className="flex items-center gap-1.5 text-admin-600 font-medium">
              <MapPin size={13} className="shrink-0" />
              {item.canteen.name}
            </span>
          )}
          {item.stockQuantity > 0 && (
            <span className={`px-2 py-0.5 rounded-full font-medium ${isLow ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
              {item.stockQuantity} in stock
            </span>
          )}
        </div>

        {item.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.description}</p>
        )}

        {!isOutOfStock && (
          <div className="pt-3 border-t border-gray-50 mt-auto">
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-admin-500 hover:bg-admin-600 text-white rounded-xl shadow-sm transition-all duration-200 active:scale-95 group/btn"
            >
              <PlusCircle size={18} />
              <span className="text-xs font-bold font-display">Add to Cart</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ItemDetailModal = ({ item, onClose, onStockUpdate }) => {
  const { addToCart } = useCart();
  if (!item) return null;

  const handleAddToCart = async () => {
    const success = await addToCart(item);
    if (success) {
      onStockUpdate(item._id, item.stockQuantity - 1);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl overflow-hidden shadow-2xl animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-64 sm:h-72 relative">
          {item.image ? (
            <img
              src={getImageUrl(item.image)}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-50 to-admin-100 flex items-center justify-center text-7xl">
              {item.category?.icon || '🍽️'}
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2 className="font-display font-bold text-gray-900 text-xl">{item.name}</h2>
            <span className="text-admin-600 font-bold font-display text-xl">Rs. {parseFloat(item.price).toFixed(2)}</span>
          </div>
          <p className="text-gray-500 text-sm mb-4">{item.description}</p>

          <div className="flex flex-wrap gap-3 mb-4">
            <span className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
              <Clock size={14} />
              {item.preparationTime} min prep time
            </span>
            {item.canteen && (
              <span className="flex items-center gap-1.5 text-sm text-admin-600 font-medium px-1">
                <MapPin size={16} />
                {item.canteen.name}
              </span>
            )}
            {item.isVegetarian && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                <Leaf size={14} />
                Vegetarian
              </span>
            )}
            {item.isVegan && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                🌱 Vegan
              </span>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 font-display">Status</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.stockQuantity === 0
                ? 'bg-red-100 text-red-600'
                : item.stockQuantity <= item.lowStockThreshold
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-green-100 text-green-600'
                }`}>
                {item.stockQuantity === 0 ? 'Out of Stock' : item.stockQuantity <= item.lowStockThreshold ? 'Low Stock' : 'In Stock'}
              </span>
            </div>
            {item.nutritionInfo && Object.values(item.nutritionInfo).some(v => v) && (
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-100">
                {[
                  { label: 'Cal', value: item.nutritionInfo.calories },
                  { label: 'Prot', value: item.nutritionInfo.protein },
                  { label: 'Carb', value: item.nutritionInfo.carbs },
                  { label: 'Fat', value: item.nutritionInfo.fat },
                ].map(n => n.value ? (
                  <div key={n.label} className="text-center">
                    <p className="text-sm font-bold font-display text-gray-900">{n.value}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{n.label}</p>
                  </div>
                ) : null)}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={item.stockQuantity === 0}
            className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-display font-bold text-base transition-all
              ${item.stockQuantity === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-admin-500 hover:bg-admin-600 text-white shadow-orange hover:shadow-orange-lg active:scale-[0.98]'
              }`}
          >
            <ShoppingCart size={20} />
            {item.stockQuantity === 0 ? 'Currently Unavailable' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function StudentMenuPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    fetchMenu();

    // Listen for real-time stock updates
    socket.on('stockUpdate', ({ foodItemId, stockQuantity }) => {
      setItems(prevItems =>
        prevItems.map(item =>
          item._id === foodItemId ? { ...item, stockQuantity } : item
        )
      );
      // Also update selected item if modal is open
      setSelectedItem(prev => 
        prev && prev._id === foodItemId ? { ...prev, stockQuantity } : prev
      );
    });

    return () => {
      socket.off('stockUpdate');
    };
  }, []);

  const fetchMenu = async () => {
    try {
      const [itemsRes, catsRes] = await Promise.all([
        api.get('/food-items/public'),
        api.get('/categories')
      ]);
      setItems(itemsRes.data.data);
      setCategories(catsRes.data.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = (itemId, newStock) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item._id === itemId ? { ...item, stockQuantity: newStock } : item
      )
    );
  };

  const filtered = items.filter(item => {
    if (activeCategory !== 'all' && item.category?._id !== activeCategory) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (vegOnly && !item.isVegetarian) return false;
    return true;
  });

  const menuCats = categories.filter(c => items.some(i => i.category?._id === c._id));

  return (
    <>
      {/* Hero header */}
      <div className="bg-gradient-to-br from-admin-500 via-admin-600 to-admin-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <ChefHat size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl leading-tight">Grab & Go</h1>
              <p className="text-admin-200 text-sm">Fresh food, every day</p>
            </div>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl mb-2">Today's Menu</h2>
          <p className="text-admin-200">Freshly prepared for campus students</p>
          {/* Search bar removed from hero for cleaner look? No, user didn't ask. */}
          <div className="mt-6 relative max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search food items..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-gray-900 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-sm font-body"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold font-display transition-all duration-200 ${activeCategory === 'all' ? 'bg-admin-500 text-white shadow-orange' : 'bg-white text-gray-600 border border-gray-200 hover:border-admin-300'
              }`}
          >
            All
          </button>
          {menuCats.map(cat => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold font-display transition-all duration-200 ${activeCategory === cat._id ? 'bg-admin-500 text-white shadow-orange' : 'bg-white text-gray-600 border border-gray-200 hover:border-admin-300'
                }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}

          {/* Veg toggle */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold font-display transition-all duration-200 ${vegOnly ? 'bg-emerald-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300'
              }`}
          >
            <Leaf size={14} />
            Veg Only
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-between mb-6 text-sm text-gray-500">
          <span>{filtered.length} item{filtered.length !== 1 ? 's' : ''} available</span>
          <span>{items.filter(i => i.stockQuantity === 0).length} sold out</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-10 h-10 border-4 border-admin-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="font-display font-bold text-gray-700 text-xl">No items found</p>
            <p className="text-gray-400 mt-2">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((item, idx) => (
              <div
                key={item._id}
                className="animate-fade-in"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <FoodCard
                  item={item}
                  onClick={setSelectedItem}
                  onStockUpdate={handleStockUpdate}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onStockUpdate={handleStockUpdate}
        />
      )}
    </>
  );
}

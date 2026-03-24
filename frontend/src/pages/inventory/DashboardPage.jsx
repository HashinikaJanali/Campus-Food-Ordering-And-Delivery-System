import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed, Package, AlertTriangle, XCircle,
  Eye, EyeOff, TrendingUp, ArrowRight, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, sub, color, linkTo }) => (
  <Link
    to={linkTo || '#'}
    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group animate-fade-in"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <ArrowRight size={16} className="text-gray-300 group-hover:text-admin-400 transition-colors" />
    </div>
    <p className="text-3xl font-bold font-display text-gray-900">{value}</p>
    <p className="text-sm font-semibold text-gray-700 mt-1 font-display">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </Link>
);

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allItems, setAllItems] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, itemsRes] = await Promise.all([
        api.get('/food-items/stats'),
        api.get('/food-items?limit=100')
      ]);
      setStats(statsRes.data.data);
      setAllItems(itemsRes.data.data);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-admin-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Build category chart data
  const categoryMap = {};
  allItems.forEach(item => {
    const cat = item.category?.name || 'Uncategorized';
    if (!categoryMap[cat]) categoryMap[cat] = { name: cat, total: 0, inStock: 0, outOfStock: 0 };
    categoryMap[cat].total++;
    if (item.stockQuantity === 0) categoryMap[cat].outOfStock++;
    else categoryMap[cat].inStock++;
  });
  const chartData = Object.values(categoryMap).slice(0, 8);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Inventory Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of your food inventory</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-admin-600 hover:bg-admin-50 px-4 py-2 rounded-xl transition-all duration-200 font-display font-medium"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          icon={UtensilsCrossed}
          label="Total Items"
          value={stats?.total || 0}
          color="bg-gradient-to-br from-admin-400 to-admin-600"
          linkTo="/admin/food-items"
        />
        <StatCard
          icon={TrendingUp}
          label="In Stock"
          value={stats?.inStock || 0}
          sub="Healthy stock"
          color="bg-gradient-to-br from-emerald-400 to-emerald-600"
          linkTo="/admin/inventory"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock"
          value={stats?.lowStock || 0}
          sub="Needs attention"
          color="bg-gradient-to-br from-amber-400 to-amber-600"
          linkTo="/admin/alerts"
        />
        <StatCard
          icon={XCircle}
          label="Out of Stock"
          value={stats?.outOfStock || 0}
          sub="Restock required"
          color="bg-gradient-to-br from-red-400 to-red-600"
          linkTo="/admin/inventory"
        />
        <StatCard
          icon={Eye}
          label="Menu Visible"
          value={stats?.visible || 0}
          sub="Shown to students"
          color="bg-gradient-to-br from-blue-400 to-blue-600"
          linkTo="/admin/menu-preview"
        />
        <StatCard
          icon={EyeOff}
          label="Menu Hidden"
          value={stats?.hidden || 0}
          sub="Not displayed"
          color="bg-gradient-to-br from-gray-400 to-gray-600"
          linkTo="/admin/food-items"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Category chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <h2 className="font-display font-bold text-gray-900 mb-1">Items by Category</h2>
          <p className="text-gray-400 text-xs mb-5">Stock distribution across categories</p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
                <YAxis tick={{ fontSize: 11, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
                <Tooltip
                  contentStyle={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="inStock" name="In Stock" radius={[4, 4, 0, 0]} fill="#f97316" />
                <Bar dataKey="outOfStock" name="Out of Stock" radius={[4, 4, 0, 0]} fill="#fecaca" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data available</div>
          )}
        </div>

        {/* Critical items */}
        <div className="space-y-4">
          {/* Low stock */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-200 bg-amber-50/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                Low Stock Items
              </h2>
              <Link to="/admin/alerts" className="text-xs text-admin-500 hover:underline font-display font-semibold">View all</Link>
            </div>
            {stats?.lowStockItems?.length > 0 ? (
              <div className="space-y-2">
                {stats.lowStockItems.map(item => (
                  <div key={item._id} className="flex items-center gap-3 p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 text-base">🍽️</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate font-display">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.category?.name}</p>
                    </div>
                    <span className="badge-low-stock flex-shrink-0">{item.stockQuantity} left</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">All items are well stocked! ✅</p>
            )}
          </div>

          {/* Out of stock */}
          {stats?.outOfStockItems?.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-200 bg-red-50/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-gray-900 flex items-center gap-2">
                  <XCircle size={16} className="text-red-500" />
                  Out of Stock
                </h2>
              </div>
              <div className="space-y-2">
                {stats.outOfStockItems.map(item => (
                  <div key={item._id} className="flex items-center gap-3 p-2.5 bg-red-50 rounded-xl border border-red-100">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 text-base">❌</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate font-display">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.category?.name}</p>
                    </div>
                    <span className="badge-out-of-stock">Out of Stock</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

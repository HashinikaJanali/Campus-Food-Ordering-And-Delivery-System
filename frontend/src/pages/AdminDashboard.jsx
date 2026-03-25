import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, ShoppingBag, Package, Users,
    TrendingUp, AlertCircle, CheckCircle2,
    Clock, Star, ArrowUpRight, ArrowDownRight,
    ChefHat, UtensilsCrossed, Store, ChevronRight,
    Search, Filter, Calendar, RefreshCw
} from 'lucide-react';
import api from '../utils/api';
import OrderManagementSidebar from '../components/OrderManagementSidebar';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        lowStockCount: 0,
        activeCanteens: 0,
        totalUsers: 1248,
        averageFulfillmentTime: '18 min',
        topSellingItem: 'Chicken Burger',
        platformUptime: '99.9%'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [ordersRes, inventoryRes, canteensRes] = await Promise.all([
                api.get('/orders'),
                api.get('/inventory/overview'),
                api.get('/canteens')
            ]);

            const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
            const inventory = Array.isArray(inventoryRes.data?.data) ? inventoryRes.data.data : [];
            const canteens = Array.isArray(canteensRes.data?.data) ? canteensRes.data.data : [];

            setStats(prev => ({
                ...prev,
                totalOrders: orders.length,
                pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'preparing').length,
                totalRevenue: orders.reduce((acc, o) => acc + Number(o.total || 0), 0),
                lowStockCount: inventory.filter(i => i.stockQuantity <= i.lowStockThreshold).length,
                activeCanteens: canteens.length,
            }));
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-row">
                <OrderManagementSidebar />
                <div className="flex-1 ml-80 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-row">
            <OrderManagementSidebar />
            <div className="overflow-y-auto ml-80 flex-1">
                <main className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold font-display text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-500 text-sm mt-1">Monitoring {stats.activeCanteens} canteens across the campus</p>
                    </div>
                    <button 
                        onClick={fetchDashboardData}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-xl transition-all duration-200 font-display font-medium">
                        <RefreshCw size={15} />
                        Refresh
                    </button>
                </div>

                {/* Primary Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard
                        title="Total Revenue"
                        value={`Rs. ${stats.totalRevenue.toLocaleString()}`}
                        icon={TrendingUp}
                        trend="+12.5%"
                        isPositive={true}
                        subtitle="Across all canteens"
                    />
                    <StatCard
                        title="Active Orders"
                        value={stats.totalOrders}
                        icon={ShoppingBag}
                        trend={`${stats.pendingOrders} pending`}
                        isWarning={stats.pendingOrders > 0}
                        subtitle="Real-time tracking"
                    />
                    <StatCard
                        title="Low Stock Items"
                        value={stats.lowStockCount}
                        icon={AlertCircle}
                        trend="Inventory Alert"
                        isWarning={stats.lowStockCount > 0}
                        subtitle="Action required"
                    />
                    <StatCard
                        title="Avg Prep Time"
                        value={stats.averageFulfillmentTime}
                        icon={Clock}
                        trend="-2 min"
                        isPositive={true}
                        subtitle="Platform efficiency"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Operational Details */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-orange-100/50 border border-orange-50">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                    <ChefHat className="text-orange-500" />
                                    Canteen Performance
                                </h3>
                                <button className="text-orange-600 font-bold text-xs flex items-center gap-1 hover:underline">
                                    Details <ChevronRight size={14} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <CanteenRow name="P&S Canteen" orders={142} revenue="Rs 63k" status="Peak" color="bg-orange-500" />
                                <CanteenRow name="Anohana Canteen" orders={89} revenue="Rs 24k" status="Busy" color="bg-orange-400" />
                                <CanteenRow name="Basement Canteen" orders={56} revenue="Rs 15k" status="Steady" color="bg-orange-300" />
                                <CanteenRow name="New Building Canteen" orders={34} revenue="Rs 8k" status="Steady" color="bg-orange-200" />
                            </div>
                        </div>

                        {/* Admin Quick Actions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <QuickLinkCard
                                title="Menu Control"
                                description="Adjust prices and availability"
                                icon={UtensilsCrossed}
                                link="/admin/food-items"
                            />
                            <QuickLinkCard
                                title="Inventory Hub"
                                description="Reorder low stock items"
                                icon={Package}
                                link="/admin/inventory"
                            />
                            <QuickLinkCard
                                title="Order Management"
                                description="Track and process live orders"
                                icon={ShoppingBag}
                                link="/orders"
                            />
                            <QuickLinkCard
                                title="Order History"
                                description="View past orders and records"
                                icon={Clock}
                                link="/history"
                            />
                            <QuickLinkCard
                                title="Promotions"
                                description="Manage discount codes and deals"
                                icon={Gift}
                                link="/admin/promotions"
                            />
                        </div>
                    </div>

                    {/* Status & Alerts Side Panel */}
                    <div className="space-y-6">
                        <div className="bg-orange-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-orange-200">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                            <h3 className="text-xl font-black mb-6 relative z-10">Orders Overview</h3>
                            <div className="space-y-4 relative z-10">
                                <InfrastructureItem label="Pending Orders" status={`${stats.pendingOrders} Active`} isHealthy={stats.pendingOrders > 0} />
                                <InfrastructureItem label="Processing" status="8 Ready" isHealthy={true} />
                                <InfrastructureItem label="Completed Today" status={`${stats.totalOrders} total`} isHealthy={true} />
                                <InfrastructureItem label="Avg Time" status={stats.averageFulfillmentTime} isHealthy={true} />
                            </div>
                            <button
                                onClick={fetchDashboardData}
                                className="mt-10 w-full py-4 bg-white hover:bg-orange-50 text-orange-600 hover:text-orange-700 rounded-2xl font-black transition-all border border-white shadow-lg flex items-center justify-center gap-2"
                            >
                                <RotateCcwIcon size={18} />
                                REFRESH HUB
                            </button>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-orange-100/50 border border-orange-50">
                            <h3 className="text-lg font-black text-gray-900 mb-4 tracking-tight">Top Performer</h3>
                            <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-3xl border border-orange-100">
                                <div className="text-4xl text-orange-500 animate-pulse">🍔</div>
                                <div>
                                    <h4 className="font-black text-gray-900 leading-none mb-1">{stats.topSellingItem}</h4>
                                    <p className="text-xs text-orange-600 font-bold uppercase tracking-widest">348 Orders This Week</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, trend, isPositive, isWarning, subtitle }) => (
    <div className="bg-white p-6 rounded-[2.5rem] border border-orange-100 shadow-xl shadow-orange-50/50 relative overflow-hidden group hover:border-orange-300 transition-colors">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl group-hover:scale-110 transition-transform">
                <Icon size={24} />
            </div>
            <div className={`flex items-center gap-1 text-xs font-black uppercase tracking-widest ${isWarning ? 'text-rose-500' : isPositive ? 'text-emerald-500' : 'text-orange-500'}`}>
                {trend}
            </div>
        </div>
        <div>
            <h4 className="text-2xl font-black text-gray-900 mb-1 leading-none">{value}</h4>
            <p className="text-xs font-bold text-gray-400 mb-1">{title}</p>
            <p className="text-[10px] text-orange-500/60 font-medium uppercase tracking-wider">{subtitle}</p>
        </div>
    </div>
);

const CanteenRow = ({ name, orders, revenue, status, color }) => (
    <div className="flex items-center gap-4 group">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg`}>
            <Store size={20} />
        </div>
        <div className="flex-1">
            <div className="flex justify-between items-end mb-1">
                <h4 className="font-bold text-gray-900">{name}</h4>
                <span className="text-xs font-black text-orange-600 uppercase tracking-widest">{status}</span>
            </div>
            <div className="w-full bg-orange-100 rounded-full h-2 overflow-hidden">
                <div
                    className={`${color} h-full rounded-full transition-all duration-1000`}
                    style={{ width: `${(orders / 150) * 100}%` }}
                />
            </div>
            <div className="flex justify-between mt-1.5 text-[10px] font-bold text-gray-400">
                <span>{orders} Orders</span>
                <span className="text-orange-600">{revenue}</span>
            </div>
        </div>
    </div>
);

const QuickLinkCard = ({ title, description, icon: Icon, link }) => (
    <a
        href={link}
        className="flex items-center gap-4 bg-white p-6 rounded-[2rem] border border-orange-100 shadow-lg hover:shadow-orange-200/50 hover:-translate-y-1 transition-all cursor-pointer group"
    >
        <div className="p-3 rounded-2xl bg-gray-900 group-hover:bg-orange-500 text-white transition-colors shadow-lg">
            <Icon size={24} />
        </div>
        <div>
            <h4 className="font-black text-gray-900 text-sm">{title}</h4>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
        <ChevronRight className="ml-auto text-orange-500 transition-all opacity-0 group-hover:opacity-100" size={20} />
    </a>
);

const InfrastructureItem = ({ label, status, isHealthy }) => (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/5 transition-colors">
        <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-400' : 'bg-rose-400'} shadow-[0_0_8px_rgba(52,211,153,0.5)]`} />
            <span className="text-sm font-medium text-white/80">{label}</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{status}</span>
    </div>
);

const RotateCcwIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
);

export default AdminDashboard;

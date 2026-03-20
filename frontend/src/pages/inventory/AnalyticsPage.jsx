import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
    FileDown, TrendingUp, AlertTriangle, Package, Layers, Info,
    ChevronRight, ArrowUpRight, ArrowDownRight, Printer
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#ea580c', '#c2410c'];

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/analytics/overview');
            setData(res.data.data);
        } catch (err) {
            toast.error('Failed to fetch analytics data');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const res = await api.get('/analytics/report');
            const csvData = res.data.data;

            if (!csvData || csvData.length === 0) {
                toast.error('No data available for export');
                return;
            }

            const headers = Object.keys(csvData[0]);
            const csvContent = [
                headers.join(','),
                ...csvData.map(row => headers.map(header => {
                    const val = row[header] === null || row[header] === undefined ? '' : row[header];
                    return `"${val}"`;
                }).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `inventory_report_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Report exported successfully');
        } catch (err) {
            toast.error('Failed to generate report');
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Crunching your data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-gray-900">Inventory Analytics</h1>
                    <p className="text-gray-500 text-sm mt-1">Real-time insights and performance monitoring</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchAnalytics}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium shadow-sm"
                    >
                        <TrendingUp size={16} className="text-primary-600" />
                        Refresh
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all text-sm font-medium shadow-orange disabled:opacity-50"
                    >
                        <FileDown size={16} />
                        {exporting ? 'Exporting...' : 'Generate Report'}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Items"
                    value={data?.categoryDistribution.reduce((acc, curr) => acc + curr.value, 0)}
                    icon={Package}
                    color="blue"
                />
                <StatCard
                    title="Critical Alerts"
                    value={data?.criticalItems.length}
                    icon={AlertTriangle}
                    color="red"
                    urgent={data?.criticalItems.length > 0}
                />
                <StatCard
                    title="Categories"
                    value={data?.categoryDistribution.length}
                    icon={Layers}
                    color="orange"
                />
                <StatCard
                    title="Out of Stock"
                    value={data?.stockDistribution.find(s => s.name === 'Out of Stock')?.value || 0}
                    icon={Info}
                    color="gray"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Category Distribution chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-display font-bold text-gray-900">Category Distribution</h3>
                        <div className="px-3 py-1 bg-primary-50 text-xs font-semibold text-primary-600 rounded-lg">Items per Category</div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data?.categoryDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data?.categoryDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Stock Level Distribution chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-display font-bold text-gray-900">Stock Levels</h3>
                        <div className="px-3 py-1 bg-blue-50 text-xs font-semibold text-blue-600 rounded-lg">Availability Ranges</div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.stockDistribution}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Critical Stock Items Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <div>
                        <h3 className="font-display font-bold text-gray-900">Critical Stock Items</h3>
                        <p className="text-xs text-gray-400 mt-1">Items below or at their restock threshold</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Item Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Current Stock</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Threshold</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data?.criticalItems.length > 0 ? (
                                data.criticalItems.map((item) => (
                                    <tr key={item._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                                                    <AlertTriangle size={14} className="text-red-500" />
                                                </div>
                                                <span className="font-medium text-gray-900 text-sm">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-500">{item.category?.name || 'Uncategorized'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-sm font-bold ${item.stockQuantity === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                                                {item.stockQuantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-gray-400 font-medium">
                                            {item.lowStockThreshold}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.stockQuantity === 0
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-orange-100 text-orange-800'
                                                }`}>
                                                {item.stockQuantity === 0 ? 'Out of Stock' : 'Low Stock'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <Package size={40} className="text-gray-200 mb-3" />
                                            <p className="text-sm text-gray-400">All items are sufficiently stocked</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, urgent }) {
    const colorMap = {
        orange: 'bg-primary-50 text-primary-600',
        blue: 'bg-blue-50 text-blue-600',
        red: 'bg-red-50 text-red-600',
        gray: 'bg-gray-100 text-gray-600'
    };

    return (
        <div className={`bg-white p-6 rounded-2xl shadow-sm border ${urgent ? 'border-red-100 bg-red-50/10' : 'border-gray-100'}`}>
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color] || colorMap.orange}`}>
                    <Icon size={22} />
                </div>
                <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
                    <div className="flex items-center gap-2">
                        <h4 className="text-2xl font-display font-bold text-gray-900">{value}</h4>
                    </div>
                </div>
            </div>
        </div>
    );
}

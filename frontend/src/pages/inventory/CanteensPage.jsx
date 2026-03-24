import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Store, CheckCircle, MapPin } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function CanteensPage() {
    const [canteens, setCanteens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editCanteen, setEditCanteen] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [form, setForm] = useState({ name: '', location: '', isActive: true });
    const [errors, setErrors] = useState({});

    useEffect(() => { fetchCanteens(); }, []);

    const fetchCanteens = async () => {
        setLoading(true);
        try {
            const res = await api.get('/canteens/admin');
            setCanteens(res.data.data);
        } catch {
            toast.error('Failed to load canteens');
        } finally {
            setLoading(false);
        }
    };

    const openEdit = (canteen) => {
        setEditCanteen(canteen);
        setForm({
            name: canteen.name,
            location: canteen.location || '',
            isActive: canteen.isActive
        });
        setErrors({});
        setShowForm(true);
    };

    const openCreate = () => {
        setEditCanteen(null);
        setForm({ name: '', location: '', isActive: true });
        setErrors({});
        setShowForm(true);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.name.trim()) {
            newErrors.name = 'Canteen name is required';
        } else if (form.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        } else if (form.name.trim().length > 100) {
            newErrors.name = 'Name cannot exceed 100 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFieldChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            if (editCanteen) {
                await api.patch(`/canteens/${editCanteen._id}`, form);
                toast.success('Canteen updated!');
            } else {
                await api.post('/canteens', form);
                toast.success('Canteen created!');
            }
            setShowForm(false);
            setEditCanteen(null);
            setForm({ name: '', location: '', isActive: true });
            setErrors({});
            fetchCanteens();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save canteen');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/canteens/${id}`);
            toast.success('Canteen deleted');
            setCanteens(prev => prev.filter(c => c._id !== id));
            setDeleteConfirm(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-display text-gray-900">Canteens</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage university canteen locations</p>
                </div>
                <button
                    onClick={openCreate}
                    className="btn-admin flex items-center gap-2"
                >
                    <Plus size={16} /> Add Canteen
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="w-10 h-10 border-4 border-admin-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {canteens.map((canteen, idx) => (
                        <div
                            key={canteen._id}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 animate-fade-in group"
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                                    <Store size={24} />
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(canteen)} className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-500 rounded-lg transition-colors">
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => setDeleteConfirm(canteen)} className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="font-display font-bold text-gray-900 text-lg">{canteen.name}</h3>
                            <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                                <MapPin size={14} />
                                <span>{canteen.location || 'No location set'}</span>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <CheckCircle size={14} className={canteen.isActive ? 'text-emerald-500' : 'text-gray-300'} />
                                <span className="text-xs text-gray-400">{canteen.isActive ? 'Active' : 'Inactive'}</span>
                            </div>
                        </div>
                    ))}
                    {canteens.length === 0 && (
                        <div className="col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center py-16">
                            <Store size={40} className="mx-auto text-gray-200 mb-3" />
                            <p className="font-display font-semibold text-gray-600">No canteens yet</p>
                            <p className="text-gray-400 text-sm">Add your first university canteen</p>
                        </div>
                    )}
                </div>
            )}

            {/* Form modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-display font-bold text-gray-900 text-lg">{editCanteen ? 'Edit Canteen' : 'New Canteen'}</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                                <Plus size={20} className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">Canteen Name *</label>
                                <input
                                    type="text"
                                    className={`input-field ${errors.name ? '!border-red-400 focus:!border-red-500 focus:!ring-red-500/20' : ''}`}
                                    placeholder="e.g., P&S Canteen"
                                    value={form.name}
                                    onChange={e => handleFieldChange('name', e.target.value)}
                                />
                                {errors.name && (
                                    <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">Location</label>
                                <input
                                    type="text" className="input-field" placeholder="e.g., Near New Building"
                                    value={form.location} onChange={e => handleFieldChange('location', e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-3 py-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={form.isActive}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                    className="w-4 h-4 text-admin-600 rounded border-gray-300 focus:ring-admin-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">Canteen is active</label>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                                <button type="submit" className="btn-admin flex-1">{editCanteen ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete confirm */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
                        <div className="text-center mb-5">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="font-display font-bold text-gray-900 text-lg">Delete Canteen?</h3>
                            <p className="text-gray-500 text-sm mt-2">
                                Are you sure you want to delete "{deleteConfirm.name}"? This will affect food items associated with this canteen.
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

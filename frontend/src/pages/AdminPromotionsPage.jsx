import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Plus, Edit2, Trash2, X, Star, Calendar, CheckCircle } from 'lucide-react';
import { promotionAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminPromotionsPage = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        badge: '',
        code: '',
        image: '',
        timer: '',
        featured: false,
        active: true
    });
    const [editingId, setEditingId] = useState(null);

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            setLoading(true);
            const res = await promotionAPI.getAll({ all: 'true' });
            // For older promotions with URL, fix the path if it starts with /uploads
            const formattedPromotions = res.data.data.map(p => ({
                ...p,
                image: p.image.startsWith('/uploads') ? `http://localhost:5001${p.image}` : p.image
            }));
            setPromotions(formattedPromotions);
        } catch (error) {
            toast.error('Failed to load promotions');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (promo = null) => {
        setImageFile(null);
        if (promo) {
            setFormData(promo);
            setEditingId(promo._id);
            setImagePreview(promo.image);
        } else {
            setFormData({
                title: '',
                description: '',
                badge: '',
                code: '',
                image: '',
                timer: '',
                featured: false,
                active: true
            });
            setEditingId(null);
            setImagePreview(null);
        }
        setShowModal(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key !== 'image') {
                    data.append(key, formData[key]);
                }
            });
            if (imageFile) {
                data.append('image', imageFile);
            } else if (editingId && formData.image) {
                data.append('image', formData.image); // keep existing URL if no new file
            }

            if (editingId) {
                await promotionAPI.update(editingId, data);
                toast.success('Promotion updated successfully');
            } else {
                await promotionAPI.create(data);
                toast.success('Promotion created successfully');
            }
            setShowModal(false);
            fetchPromotions();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this promotion?')) return;
        try {
            await promotionAPI.delete(id);
            toast.success('Promotion deleted successfully');
            fetchPromotions();
        } catch (error) {
            toast.error('Failed to delete promotion');
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 sm:p-8 w-full max-w-7xl mx-auto font-body">
            <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                            <Gift size={28} />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Promotions Hub</h1>
                    </div>
                    <p className="text-gray-500 font-medium">Manage discount codes, specials, and app deals</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-orange-200"
                >
                    <Plus size={20} />
                    Create Deal
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promotions.map((promo) => (
                    <div key={promo._id} className={`bg-white rounded-3xl overflow-hidden border-2 transition-all ${promo.active ? 'border-orange-100 hover:border-orange-300' : 'border-gray-200 opacity-60'} relative group shadow-sm hover:shadow-xl`}>
                        {promo.featured && (
                            <div className="absolute top-4 right-4 z-10 bg-rose-500 text-white p-2 rounded-full shadow-lg">
                                <Star size={16} fill="currentColor" />
                            </div>
                        )}
                        <img src={promo.image} alt={promo.title} className="w-full h-40 object-cover" />
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-red-100 text-red-600 font-bold text-xs rounded-full uppercase tracking-wider mb-2">
                                        {promo.badge}
                                    </span>
                                    <h3 className="text-xl font-black text-gray-900 leading-tight block mb-1">{promo.title}</h3>
                                </div>
                            </div>
                            <p className="text-sm font-medium text-gray-500 mb-4 line-clamp-2">{promo.description}</p>

                            <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest block mb-1">Promo Code</span>
                                <span className="text-lg font-black text-gray-900 tracking-wider">{promo.code}</span>
                            </div>

                            <div className="flex items-center justify-between mt-6">
                                <div className="flex items-center gap-1 text-sm font-bold text-orange-500">
                                    <Calendar size={16} />
                                    <span>{promo.timer}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleOpenModal(promo)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 bg-gray-50 rounded-lg transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(promo._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 bg-gray-50 rounded-lg transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {promotions.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-gray-300">
                        <Gift size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-500 mb-2">No promotions found</h3>
                        <p className="text-gray-400">Click "Create Deal" to add your first promotion.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2rem] p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black">{editingId ? 'Edit Promotion' : 'Create Promotion'}</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-gray-700">Promotion Title</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 transition-colors"
                                            placeholder="e.g. Weekend Mega Sale"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-gray-700">Badge Text</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.badge}
                                            onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 transition-colors"
                                            placeholder="e.g. 50% OFF"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-gray-700">Promo Code</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 transition-colors uppercase"
                                            placeholder="e.g. SAVE50"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-gray-700">Timer Text</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.timer}
                                            onChange={(e) => setFormData({ ...formData, timer: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 transition-colors"
                                            placeholder="e.g. Ends in 2 Days"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700">Promotion Image</label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 focus:border-orange-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                                            />
                                        </div>
                                        {imagePreview && (
                                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                    {!imagePreview && !imageFile && formData.image && (
                                        <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image.</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700">Description</label>
                                    <textarea
                                        required
                                        rows="3"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 transition-colors resize-none"
                                        placeholder="Details of the promotion..."
                                    />
                                </div>

                                <div className="flex items-center gap-6 pt-2 pb-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.featured}
                                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                            className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                        />
                                        <span className="font-bold text-gray-700">Featured (Hot Deal)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.active}
                                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                            className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                        />
                                        <span className="font-bold text-gray-700">Active</span>
                                    </label>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-bold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 px-4 bg-orange-500 text-white hover:bg-orange-600 rounded-xl font-bold transition-colors shadow-lg shadow-orange-200"
                                    >
                                        Save Deal
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminPromotionsPage;

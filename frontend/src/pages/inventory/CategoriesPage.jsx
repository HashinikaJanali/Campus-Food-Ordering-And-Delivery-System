import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Edit2, Trash2, Tag, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMOJIS = ['🍽️', '🍔', '🍕', '🍜', '🍛', '🍱', '🥗', '🥪', '🌮', '🍣',
  '🍰', '🧁', '🍩', '☕', '🧃', '🥤', '🍺', '🍵', '🥞', '🍳', '🥙', '🫙'];

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '🍽️', displayOrder: 0 });
  const [errors, setErrors] = useState({});

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (cat) => {
    setEditCat(cat);
    setForm({ name: cat.name, description: cat.description || '', icon: cat.icon, displayOrder: cat.displayOrder });
    setErrors({});
    setShowForm(true);
  };

  const openCreate = () => {
    setEditCat(null);
    setForm({ name: '', description: '', icon: '🍽️', displayOrder: 0 });
    setErrors({});
    setShowForm(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (form.name.trim().length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    }

    const order = Number(form.displayOrder);
    if (form.displayOrder !== '' && (isNaN(order) || order < 0)) {
      newErrors.displayOrder = 'Display order must be 0 or greater';
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
      if (editCat) {
        await api.put(`/categories/${editCat._id}`, form);
        toast.success('Category updated!');
      } else {
        await api.post('/categories', form);
        toast.success('Category created!');
      }
      setShowForm(false);
      setEditCat(null);
      setForm({ name: '', description: '', icon: '🍽️', displayOrder: 0 });
      setErrors({});
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      setCategories(prev => prev.filter(c => c._id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">Organize your food items by category</p>
        </div>
        <button onClick={openCreate} className="btn-admin flex items-center gap-2">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-10 h-10 border-4 border-admin-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => (
            <div
              key={cat._id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 animate-fade-in group"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{cat.icon}</div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(cat)} className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-500 rounded-lg transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => setDeleteConfirm(cat)} className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="font-display font-bold text-gray-900 text-lg">{cat.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{cat.description || 'No description'}</p>
              <div className="mt-3 flex items-center gap-2">
                <CheckCircle size={14} className={cat.isActive ? 'text-emerald-500' : 'text-gray-300'} />
                <span className="text-xs text-gray-400">{cat.isActive ? 'Active' : 'Inactive'}</span>
                {cat.displayOrder > 0 && (
                  <span className="ml-auto text-xs text-gray-400">Order: {cat.displayOrder}</span>
                )}
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center py-16">
              <Tag size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="font-display font-semibold text-gray-600">No categories yet</p>
              <p className="text-gray-400 text-sm">Create your first food category</p>
            </div>
          )}
        </div>
      )}

      {/* Form modal */}
      {showForm && createPortal(
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="font-display font-bold text-gray-900 text-lg mb-5">{editCat ? 'Edit Category' : 'New Category'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">Category Name *</label>
                <input
                  type="text"
                  className={`input-field ${errors.name ? '!border-red-400 focus:!border-red-500 focus:!ring-red-500/20' : ''}`}
                  placeholder="e.g., Beverages"
                  value={form.name}
                  onChange={e => handleFieldChange('name', e.target.value)}
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">Description</label>
                <input
                  type="text" className="input-field" placeholder="Brief description"
                  value={form.description} onChange={e => handleFieldChange('description', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 font-display">Icon</label>
                <div className="grid grid-cols-11 gap-1 p-3 bg-gray-50 rounded-xl max-h-32 overflow-y-auto">
                  {EMOJIS.map(emoji => (
                    <button
                      key={emoji} type="button"
                      onClick={() => setForm({ ...form, icon: emoji })}
                      className={`text-xl p-1 rounded-lg transition-all hover:scale-110 ${form.icon === emoji ? 'bg-admin-100 scale-110' : 'hover:bg-gray-100'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">Display Order</label>
                <input
                  type="number"
                  className={`input-field ${errors.displayOrder ? '!border-red-400 focus:!border-red-500 focus:!ring-red-500/20' : ''}`}
                  placeholder="0"
                  value={form.displayOrder}
                  onChange={e => handleFieldChange('displayOrder', parseInt(e.target.value) || 0)}
                />
                {errors.displayOrder && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.displayOrder}</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-admin flex-1">{editCat ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete confirm */}
      {deleteConfirm && createPortal(
        <div className="fixed inset-0 bg-black/75 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">{deleteConfirm.icon}</div>
              <h3 className="font-display font-bold text-gray-900">Delete "{deleteConfirm.name}"?</h3>
              <p className="text-gray-500 text-sm mt-2">This will fail if food items are using this category.</p>
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
        </div>,
        document.body
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function FoodItemModal({ item, categories, onClose, onSaved }) {
  const isEdit = !!item;
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(item?.image || null);
  const [imageFile, setImageFile] = useState(null);
  const [canteens, setCanteens] = useState([]);
  const [form, setForm] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || '',
    category: item?.category?._id || item?.category || '',
    canteen: item?.canteen?._id || item?.canteen || '',
    stockQuantity: item?.stockQuantity ?? 0,
    lowStockThreshold: item?.lowStockThreshold || 10,
    preparationTime: item?.preparationTime || 15,
    isVegetarian: item?.isVegetarian || false,
    isVegan: item?.isVegan || false,
    isMenuVisible: item?.isMenuVisible ?? true,
    tags: item?.tags?.join(', ') || '',
    allergens: item?.allergens?.join(', ') || '',
    calories: item?.nutritionInfo?.calories || '',
    protein: item?.nutritionInfo?.protein || '',
    carbs: item?.nutritionInfo?.carbs || '',
    fat: item?.nutritionInfo?.fat || '',
  });

  useEffect(() => {
    fetchCanteens();
  }, []);

  const fetchCanteens = async () => {
    try {
      const res = await api.get('/canteens');
      setCanteens(res.data.data);
    } catch {
      toast.error('Failed to load canteens');
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (!['calories', 'protein', 'carbs', 'fat'].includes(key)) {
          formData.append(key, val);
        }
      });

      // Nutrition info
      const nutrition = {
        calories: form.calories,
        protein: form.protein,
        carbs: form.carbs,
        fat: form.fat
      };
      formData.append('nutritionInfo', JSON.stringify(nutrition));

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (isEdit) {
        await api.put(`/food-items/${item._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Food item updated!');
      } else {
        await api.post('/food-items', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Food item created!');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="font-display font-bold text-gray-900 text-lg">
            {isEdit ? 'Edit Food Item' : 'Add New Food Item'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 font-display">Food Image</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200
                ${isDragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50/30'}
              `}
            >
              <input {...getInputProps()} />
              {imagePreview ? (
                <div className="flex items-center gap-4">
                  <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-700">Image selected</p>
                    <p className="text-xs text-gray-400 mt-1">Click or drag to replace</p>
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  <Upload size={28} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500 font-display">
                    {isDragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Basic info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">Item Name *</label>
              <input
                type="text" name="name" required
                className="input-field" placeholder="e.g., Chicken Burger"
                value={form.name} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">Price (LKR) *</label>
              <input
                type="number" name="price" required min="0" step="0.01"
                className="input-field" placeholder="0.00"
                value={form.price} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">Category *</label>
              <select name="category" required className="input-field" value={form.category} onChange={handleChange}>
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">Canteen *</label>
              <select name="canteen" required className="input-field" value={form.canteen} onChange={handleChange}>
                <option value="">Select canteen</option>
                {canteens.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">Description</label>
            <textarea
              name="description" rows={3}
              className="input-field resize-none" placeholder="Brief description of the food item..."
              value={form.description} onChange={handleChange}
            />
          </div>

          {/* Stock & threshold */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">Stock Qty *</label>
              <input
                type="number" name="stockQuantity" required min="0"
                className="input-field" placeholder="0"
                value={form.stockQuantity} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">
                Low Stock Threshold
              </label>
              <input
                type="number" name="lowStockThreshold" min="0"
                className="input-field" placeholder="10"
                value={form.lowStockThreshold} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">Prep Time (min)</label>
              <input
                type="number" name="preparationTime" min="1"
                className="input-field" placeholder="15"
                value={form.preparationTime} onChange={handleChange}
              />
            </div>
          </div>

          {/* Nutrition */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 font-display">Nutrition Info (optional)</label>
            <div className="grid grid-cols-4 gap-3">
              {[
                { name: 'calories', label: 'Calories' },
                { name: 'protein', label: 'Protein (g)' },
                { name: 'carbs', label: 'Carbs (g)' },
                { name: 'fat', label: 'Fat (g)' },
              ].map(n => (
                <div key={n.name}>
                  <label className="block text-xs text-gray-500 mb-1">{n.label}</label>
                  <input
                    type="number" name={n.name} min="0" step="0.1"
                    className="input-field text-sm" placeholder="—"
                    value={form[n.name]} onChange={handleChange}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Tags & allergens */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">Tags</label>
              <input
                type="text" name="tags"
                className="input-field" placeholder="spicy, popular, new (comma separated)"
                value={form.tags} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-display">Allergens</label>
              <input
                type="text" name="allergens"
                className="input-field" placeholder="gluten, dairy, nuts..."
                value={form.allergens} onChange={handleChange}
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
            {[
              { name: 'isVegetarian', label: '🌿 Vegetarian' },
              { name: 'isVegan', label: '🌱 Vegan' },
              { name: 'isMenuVisible', label: '👁️ Menu Visible' },
            ].map(toggle => (
              <label key={toggle.name} className="flex items-center gap-2 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox" name={toggle.name}
                    checked={form[toggle.name]} onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${form[toggle.name] ? 'bg-admin-500' : 'bg-gray-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-200 shadow-sm ${form[toggle.name] ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 font-display">{toggle.label}</span>
              </label>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-70">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : isEdit ? 'Update Item' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

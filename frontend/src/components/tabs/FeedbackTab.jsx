import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle, Edit2, Trash2, X, Upload } from 'lucide-react';
import { reviewAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';
import axios from 'axios';

// Mock orders for demo
const mockOrders = [
  {
    orderId: 'ORD-009',
    foodItem: 'Veg Burger',
    vendor: 'Tech Canteen',
    deliveredAt: '30 minutes ago',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&h=200&fit=crop',
  },
  {
    orderId: 'ORD-010',
    foodItem: 'Beef Kottu',
    vendor: 'South Canteen',
    deliveredAt: '2 hours ago',
    image: 'https://images.unsplash.com/photo-1606755962770-9e6ef2b4b91f?w=200&h=200&fit=crop',
  },
  {
    orderId: 'ORD-011',
    foodItem: 'Mutton Fried Rice',
    vendor: 'Engineering Canteen',
    deliveredAt: 'Yesterday',
    image: 'https://images.unsplash.com/photo-1604908177522-42f9d5eb08a0?w=200&h=200&fit=crop',
  },
  {
    orderId: 'ORD-012',
    foodItem: 'Vegetable Sandwich',
    vendor: 'New Building Canteen',
    deliveredAt: '3 hours ago',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=200&h=200&fit=crop',
  },
  {
    orderId: 'ORD-013',
    foodItem: 'Cheese Pizza',
    vendor: 'Basement Canteen',
    deliveredAt: '5 hours ago',
    image: 'https://images.unsplash.com/photo-1601924582971-1b6cb7b9b57b?w=200&h=200&fit=crop',
  },
  {
    orderId: 'ORD-014',
    foodItem: 'Egg Sandwich',
    vendor: 'Main Canteen',
    deliveredAt: 'This morning',
    image: 'https://images.unsplash.com/photo-1562967916-eb82221dfb29?w=200&h=200&fit=crop',
  },
  {
    orderId: 'ORD-015',
    foodItem: 'Pasta Alfredo',
    vendor: 'P&S Canteen',
    deliveredAt: '1 hour ago',
    image: 'https://images.unsplash.com/photo-1606755962770-9e6ef2b4b91f?w=200&h=200&fit=crop',
  },
  {
    orderId: 'ORD-016',
    foodItem: 'Fish Cutlet',
    vendor: 'Anohana Canteen',
    deliveredAt: '4 hours ago',
    image: 'https://images.unsplash.com/photo-1604908177522-42f9d5eb08a0?w=200&h=200&fit=crop',
  },
];

// ─── Shared image validation helper ───────────────────────────────────────────
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_SIZE_MB = 5;

const validateImageFile = (file) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    toast.error('⚠️ Only JPG, PNG, GIF, or WEBP images are allowed!');
    return false;
  }
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    toast.error(`⚠️ Image size must be less than ${MAX_IMAGE_SIZE_MB}MB!`);
    return false;
  }
  return true;
};

// ─── Shared review text / rating validation helper ────────────────────────────
const validateReviewFields = (rating, reviewText) => {
  if (rating === 0) {
    toast.error('⚠️ Please rate the order before submitting!');
    return false;
  }

  const trimmed = reviewText.trim();

  if (trimmed.length > 0 && trimmed.length < 10) {
    toast.error('⚠️ Review must be at least 10 characters long!');
    return false;
  }

  if (trimmed.length > 0 && /^\d+$/.test(trimmed)) {
    toast.error('⚠️ Review cannot contain only numbers!');
    return false;
  }

  if (trimmed.length > 0 && /^[^a-zA-Z0-9]+$/.test(trimmed)) {
    toast.error('⚠️ Review cannot contain only special characters!');
    return false;
  }

  return true;
};

// ─── FeedbackTab ──────────────────────────────────────────────────────────────
const FeedbackTab = () => {
  const { currentUser, refreshLoyaltyData } = useApp();
  const [orders, setOrders] = useState(mockOrders);
  const [reviewedOrders, setReviewedOrders] = useState([]);
  const [editingReview, setEditingReview] = useState(null);
  const [successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    fetchUserReviews();
  }, []);

  const fetchUserReviews = async () => {
    try {
      const response = await reviewAPI.getUserReviews(currentUser.userId);
      setReviewedOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
    }
  };

  const handleSubmitReview = async (orderId, rating, reviewText, imageFile) => {
    // ── Validation (guard before hitting the server) ──
    if (!validateReviewFields(rating, reviewText)) return;

    const order = orders.find((o) => o.orderId === orderId);

    try {
      const formData = new FormData();
      formData.append('userId', currentUser.userId);
      formData.append('userName', currentUser.userName);
      formData.append('orderId', orderId);
      formData.append('foodItem', order.foodItem);
      formData.append('vendor', order.vendor);
      formData.append('rating', rating);
      formData.append('reviewText', reviewText.trim());
      if (imageFile) formData.append('image', imageFile);

      const response = await axios.post('http://localhost:5000/api/reviews', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(response.data.message);
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 4000);

      fetchUserReviews();
      refreshLoyaltyData();
      setOrders(orders.filter((o) => o.orderId !== orderId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleUpdateReview = async (reviewId, rating, reviewText, imageFile) => {
    // ── Validation ──
    if (!validateReviewFields(rating, reviewText)) return;

    try {
      const formData = new FormData();
      formData.append('rating', rating);
      formData.append('reviewText', reviewText.trim());
      if (imageFile) formData.append('image', imageFile);

      await axios.put(`http://localhost:5000/api/reviews/${reviewId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Review updated successfully!');
      setEditingReview(null);
      fetchUserReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await reviewAPI.delete(reviewId);
      toast.success('Review deleted successfully');
      fetchUserReviews();
      refreshLoyaltyData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    }
  };

  return (
    <div className="space-y-8">
      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-green-50 border-2 border-green-500 rounded-2xl p-8 text-center shadow-lg"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">
              ✓
            </motion.div>
            <h3 className="text-2xl font-bold text-green-700 mb-2">Review Submitted!</h3>
            <p className="text-gray-600">Thank you for your feedback. You earned 5 bonus points! ⭐</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Reviews */}
      {orders.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-display font-bold mb-4">📝 Rate Your Recent Orders</h2>
          <p className="text-gray-600 mb-6">
            Your feedback helps us improve our service!{' '}
            <strong className="text-gold">✨ Earn 5 bonus points for each review you write!</strong>
          </p>

          <div className="space-y-6">
            {orders.map((order, index) => (
              <OrderReviewCard
                key={order.orderId}
                order={order}
                index={index}
                onSubmit={handleSubmitReview}
              />
            ))}
          </div>
        </div>
      )}

      {/* Your Reviews */}
      {reviewedOrders.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
            ⭐ Your Reviews ({reviewedOrders.length})
          </h2>

          <div className="space-y-4">
            {reviewedOrders.map((review, index) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:border-primary transition-all"
              >
                {editingReview === review._id ? (
                  <EditReviewForm
                    review={review}
                    onSave={handleUpdateReview}
                    onCancel={() => setEditingReview(null)}
                  />
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-xl">{review.foodItem}</h3>
                        <p className="text-gray-600 text-sm">
                          {review.vendor} • {review.orderId}
                        </p>
                        <div className="flex gap-1 mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < review.rating ? 'fill-gold text-gold' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setEditingReview(review._id)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteReview(review._id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>

                    {review.reviewText && (
                      <p className="text-gray-700 mb-3">{review.reviewText}</p>
                    )}
                    {review.imageUrl && (
                      <img
                        src={review.imageUrl}
                        alt="Review"
                        className="w-full max-w-xs rounded-lg mt-3"
                      />
                    )}
                    <div className="text-sm text-gray-500 mt-3">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {orders.length === 0 && reviewedOrders.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-2xl font-bold mb-2">No Orders to Review</h3>
          <p className="text-gray-600">Place some orders to start earning review points!</p>
        </div>
      )}
    </div>
  );
};

// ─── OrderReviewCard ──────────────────────────────────────────────────────────
const OrderReviewCard = ({ order, index, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});

  // ── Per-field live validation ──────────────────────────────────────────────
  const validateField = (field, value) => {
    const newErrors = { ...errors };

    if (field === 'rating') {
      if (value === 0) newErrors.rating = 'Please select a star rating.';
      else delete newErrors.rating;
    }

    if (field === 'reviewText') {
      const trimmed = value.trim();
      if (trimmed.length > 0 && trimmed.length < 10) {
        newErrors.reviewText = 'Review must be at least 10 characters.';
      } else if (trimmed.length > 0 && /^\d+$/.test(trimmed)) {
        newErrors.reviewText = 'Review cannot contain only numbers.';
      } else if (trimmed.length > 0 && /^[^a-zA-Z0-9]+$/.test(trimmed)) {
        newErrors.reviewText = 'Review cannot contain only special characters.';
      } else {
        delete newErrors.reviewText;
      }
    }

    setErrors(newErrors);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!validateImageFile(file)) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = () => {
    // Final validation before submit
    if (!validateReviewFields(rating, reviewText)) return;

    // Check if any live errors exist
    if (Object.keys(errors).length > 0) {
      toast.error('⚠️ Please fix the errors before submitting.');
      return;
    }

    onSubmit(order.orderId, rating, reviewText, imageFile);

    // Reset state
    setRating(0);
    setReviewText('');
    setImageFile(null);
    setImagePreview('');
    setErrors({});
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:border-primary transition-all"
    >
      {/* Order Info */}
      <div className="flex gap-6 mb-6 flex-col sm:flex-row">
        <motion.img
          whileHover={{ scale: 1.05, rotate: 3 }}
          src={order.image}
          alt={order.foodItem}
          className="w-32 h-32 rounded-xl object-cover shadow-md"
        />
        <div className="flex-1">
          <h3 className="font-bold text-xl mb-1">{order.foodItem}</h3>
          <p className="text-gray-600 mb-2">
            {order.vendor} • Delivered {order.deliveredAt}
          </p>
          <p className="text-sm text-gray-500">Order {order.orderId}</p>
          <div className="mt-2 inline-flex items-center gap-2 bg-yellow-50 text-gold px-3 py-1 rounded-full text-sm font-semibold">
            ⭐ Write a review to earn 5 points!
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="block font-semibold mb-2">
            How was the food? <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.2, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setRating(star);
                  validateField('rating', star);
                }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                type="button"
                className="transition-all"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= (hoverRating || rating) ? 'fill-gold text-gold' : 'text-gray-300'
                  }`}
                />
              </motion.button>
            ))}
          </div>
          {errors.rating && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <span>⚠️</span> {errors.rating}
            </p>
          )}
        </div>

        {/* Review Text */}
        <div>
          <label className="block font-semibold mb-2">Write a review (optional)</label>
          <textarea
            value={reviewText}
            onChange={(e) => {
              setReviewText(e.target.value);
              validateField('reviewText', e.target.value);
            }}
            placeholder="Tell us about your experience... (min 10 characters if provided)"
            className={`w-full px-4 py-3 border-2 rounded-xl resize-none focus:outline-none transition-all ${
              errors.reviewText
                ? 'border-red-400 focus:border-red-500 bg-red-50'
                : 'border-gray-200 focus:border-primary'
            }`}
            rows="3"
            maxLength="500"
          />
          <div className="flex justify-between items-center mt-1">
            {errors.reviewText ? (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <span>⚠️</span> {errors.reviewText}
              </p>
            ) : (
              <span />
            )}
            <span
              className={`text-sm ml-auto ${
                reviewText.length >= 450 ? 'text-red-500 font-semibold' : 'text-gray-500'
              }`}
            >
              {reviewText.length}/500
            </span>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block font-semibold mb-2">Add a photo (optional)</label>

          {!imagePreview ? (
            <label className="block">
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-gray-50 transition-all">
                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 font-semibold">Click to upload image</p>
                <p className="text-sm text-gray-500 mt-1">JPG, PNG, GIF, WEBP — max 5MB</p>
              </div>
            </label>
          ) : (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-w-xs rounded-lg border-2 border-gray-200"
              />
              <button
                onClick={removeImage}
                type="button"
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          type="button"
          className="w-full bg-gradient-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Submit Review & Earn 5 Points ⭐
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─── EditReviewForm ───────────────────────────────────────────────────────────
const EditReviewForm = ({ review, onSave, onCancel }) => {
  const [rating, setRating] = useState(review.rating);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState(review.reviewText || '');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(review.imageUrl || '');
  const [errors, setErrors] = useState({});

  // ── Per-field live validation ──────────────────────────────────────────────
  const validateField = (field, value) => {
    const newErrors = { ...errors };

    if (field === 'rating') {
      if (value === 0) newErrors.rating = 'Please select a star rating.';
      else delete newErrors.rating;
    }

    if (field === 'reviewText') {
      const trimmed = value.trim();
      if (trimmed.length > 0 && trimmed.length < 10) {
        newErrors.reviewText = 'Review must be at least 10 characters.';
      } else if (trimmed.length > 0 && /^\d+$/.test(trimmed)) {
        newErrors.reviewText = 'Review cannot contain only numbers.';
      } else if (trimmed.length > 0 && /^[^a-zA-Z0-9]+$/.test(trimmed)) {
        newErrors.reviewText = 'Review cannot contain only special characters.';
      } else {
        delete newErrors.reviewText;
      }
    }

    setErrors(newErrors);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!validateImageFile(file)) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSave = () => {
    // Final validation before saving
    if (!validateReviewFields(rating, reviewText)) return;

    if (Object.keys(errors).length > 0) {
      toast.error('⚠️ Please fix the errors before saving.');
      return;
    }

    onSave(review._id, rating, reviewText, imageFile);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-xl">Edit Review</h3>
        <button
          onClick={onCancel}
          type="button"
          className="p-2 hover:bg-gray-200 rounded-lg transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Rating */}
      <div>
        <label className="block font-semibold mb-2">
          Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              whileHover={{ scale: 1.2, rotate: 15 }}
              onClick={() => {
                setRating(star);
                validateField('rating', star);
              }}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              type="button"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoverRating || rating) ? 'fill-gold text-gold' : 'text-gray-300'
                }`}
              />
            </motion.button>
          ))}
        </div>
        {errors.rating && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <span>⚠️</span> {errors.rating}
          </p>
        )}
      </div>

      {/* Review Text */}
      <div>
        <label className="block font-semibold mb-2">Review Text</label>
        <textarea
          value={reviewText}
          onChange={(e) => {
            setReviewText(e.target.value);
            validateField('reviewText', e.target.value);
          }}
          placeholder="Min 10 characters if provided..."
          className={`w-full px-4 py-3 border-2 rounded-xl resize-none focus:outline-none transition-all ${
            errors.reviewText
              ? 'border-red-400 focus:border-red-500 bg-red-50'
              : 'border-gray-200 focus:border-primary'
          }`}
          rows="3"
          maxLength="500"
        />
        <div className="flex justify-between items-center mt-1">
          {errors.reviewText ? (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <span>⚠️</span> {errors.reviewText}
            </p>
          ) : (
            <span />
          )}
          <span
            className={`text-sm ml-auto ${
              reviewText.length >= 450 ? 'text-red-500 font-semibold' : 'text-gray-500'
            }`}
          >
            {reviewText.length}/500
          </span>
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block font-semibold mb-2">Photo</label>
        {!imagePreview ? (
          <label className="block">
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-all">
              <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600">Click to upload new image</p>
              <p className="text-sm text-gray-500 mt-1">JPG, PNG, GIF, WEBP — max 5MB</p>
            </div>
          </label>
        ) : (
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="w-full max-w-xs rounded-lg" />
            <button
              onClick={removeImage}
              type="button"
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          type="button"
          className="flex-1 bg-gradient-primary text-white py-3 rounded-xl font-bold"
        >
          Save Changes
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCancel}
          type="button"
          className="px-6 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold"
        >
          Cancel
        </motion.button>
      </div>
    </div>
  );
};

export default FeedbackTab;
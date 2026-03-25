import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle, Edit2, Trash2, X, Upload } from 'lucide-react';
import { reviewAPI, orderAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { useUserAuth } from '../../context/UserAuthContext';
import toast from 'react-hot-toast';

// Mock orders for demo
const mockOrders = [
  { orderId: 'ORD-101', foodItem: 'Cheese Pizza Slice', vendor: 'P&S Canteen', deliveredAt: '15 minutes ago', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop' },
  { orderId: 'ORD-102', foodItem: 'Iced Coffee', vendor: 'Main Canteen', deliveredAt: '30 minutes ago', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&h=200&fit=crop' },
  { orderId: 'ORD-103', foodItem: 'Vegetable Noodles', vendor: 'Engineering Canteen', deliveredAt: '2 hours ago', image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=200&h=200&fit=crop' },
  { orderId: 'ORD-104', foodItem: 'Chicken Submarine', vendor: 'Anohana Canteen', deliveredAt: '1 hour ago', image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=200&h=200&fit=crop' },
  { orderId: 'ORD-105', foodItem: 'Chocolate Milkshake', vendor: 'New Building Canteen', deliveredAt: '10 minutes ago', image: 'https://images.unsplash.com/photo-1572490122703-0c4e0e5c839f?w=200&h=200&fit=crop' },
  { orderId: 'ORD-106', foodItem: 'Chicken Biryani', vendor: 'Main Canteen', deliveredAt: '1.5 hours ago', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&h=200&fit=crop' },
];

// Validation Helpers
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

// Main Component
const FeedbackTab = () => {
  const { currentUser, refreshLoyaltyData } = useApp();
  const { user } = useUserAuth();
  const [orders, setOrders] = useState([]);
  const [reviewedOrders, setReviewedOrders] = useState([]);
  const [editingReview, setEditingReview] = useState(null);
  const [successMessage, setSuccessMessage] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchUserReviews(), fetchActualOrders()]);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const fetchUserReviews = async () => {
    if (!currentUser?.userId) return [];
    try {
      const response = await reviewAPI.getUserReviews(currentUser.userId);
      const reviews = response.data.data || [];
      setReviewedOrders(reviews);
      return reviews;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  };

  const fetchActualOrders = async () => {
    try {
      let actualOrders = [];
      if (user && user.email) {
        const response = await orderAPI.getAll({ customerEmail: user.email });
        const userOrders = Array.isArray(response.data) ? response.data : [];
        
        // Map order items to the display format
        userOrders.forEach(order => {
          // Show all delivered/active orders for feedback
          // Only skip cancelled orders
          if (order.orderStatus !== 'Cancelled' && order.status !== 'cancelled') {
            order.items.forEach(item => {
              actualOrders.push({
                orderId: order._id,
                foodItem: item.name,
                vendor: order.vendorName || 'Campus Canteen', 
                deliveredAt: order.orderStatus === 'Pending' ? 'Just placed' : new Date(order.updatedAt).toLocaleString(),
                image: item.image?.startsWith('/uploads') ? `http://localhost:5001${item.image}` : (item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop'),
                isReal: true
              });
            });
          }
        });
      }

      // Merge with mock orders
      const combinedOrders = [...actualOrders, ...mockOrders];
      setOrders(combinedOrders);
    } catch (error) {
      console.error('Error fetching actual orders:', error);
      setOrders(mockOrders);
    }
  };

  // Filter orders whenever reviewedOrders or orders changes
  const displayOrders = orders.filter(order => 
    !reviewedOrders.some(review => review.orderId === order.orderId && review.foodItem === order.foodItem)
  );

  const handleSubmitReview = async (orderId, rating, reviewText, imageFile) => {
    if (!validateReviewFields(rating, reviewText)) return;

    const order = displayOrders.find(o => o.orderId === orderId);
    if (!order) return;

    try {
      if (!currentUser?.userId) {
        toast.error('Please log in again');
        return;
      }

      const formData = new FormData();
      formData.append('userId', currentUser.userId);
      formData.append('userName', currentUser.userName);
      formData.append('orderId', orderId);
      formData.append('foodItem', order.foodItem);
      formData.append('vendor', order.vendor);
      formData.append('rating', rating.toString());
      formData.append('reviewText', reviewText.trim());
      if (imageFile) formData.append('image', imageFile);

      const response = await reviewAPI.create(formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      toast.success(response.data.message || 'Review submitted successfully!');
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 4000);

      fetchUserReviews();
      refreshLoyaltyData();
      // No need to manually filter here as displayOrders will update via fetchUserReviews
    } catch (error) {
      console.error("=== FULL ERROR DETAILS ===", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleUpdateReview = async (reviewId, rating, reviewText, imageFile) => {
    if (!validateReviewFields(rating, reviewText)) return;

    try {
      const formData = new FormData();
      formData.append('rating', rating.toString());
      formData.append('reviewText', reviewText.trim());
      if (imageFile) formData.append('image', imageFile);

      const response = await reviewAPI.update(
        reviewId,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      toast.success(response.data.message || 'Review updated successfully!');
      setEditingReview(null);
      fetchUserReviews();
    } catch (error) {
      console.error("Update error:", error.response?.data || error.message);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Fetching your orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {successMessage && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="bg-green-50 border-2 border-green-500 rounded-2xl p-8 text-center shadow-lg">
            <div className="text-6xl mb-4">✓</div>
            <h3 className="text-2xl font-bold text-green-700 mb-2">Review Submitted!</h3>
            <p className="text-gray-600">Thank you for your feedback. You earned 5 bonus points! ⭐</p>
          </motion.div>
        )}
      </AnimatePresence>

      {displayOrders.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-display font-bold mb-4">📝 Rate Your Recent Orders</h2>
          <p className="text-gray-600 mb-6">Your feedback helps us improve our service! <strong className="text-gold">✨ Earn 5 bonus points for each review you write!</strong></p>
          <div className="space-y-6">
            {displayOrders.map((order, index) => (
              <OrderReviewCard key={`${order.orderId}-${order.foodItem}`} order={order} index={index} onSubmit={handleSubmitReview} />
            ))}
          </div>
        </div>
      )}

      {reviewedOrders.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">⭐ Your Reviews ({reviewedOrders.length})</h2>
          <div className="space-y-4">
            {reviewedOrders.map((review, index) => (
              <motion.div key={review._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:border-primary transition-all">
                {editingReview === review._id ? (
                  <EditReviewForm review={review} onSave={handleUpdateReview} onCancel={() => setEditingReview(null)} />
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-xl">{review.foodItem}</h3>
                        <p className="text-gray-600 text-sm">{review.vendor} • {review.orderId}</p>
                        <div className="flex gap-1 mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-5 h-5 ${i < review.rating ? 'fill-gold text-gold' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setEditingReview(review._id)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                          <Edit2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeleteReview(review._id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                    {review.reviewText && <p className="text-gray-700 mb-3">{review.reviewText}</p>}
                    {review.imageUrl && <img src={review.imageUrl} alt="Review" className="w-full max-w-xs rounded-lg mt-3" />}
                    <div className="text-sm text-gray-500 mt-3">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {displayOrders.length === 0 && reviewedOrders.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-2xl font-bold mb-2">No Orders to Review</h3>
          <p className="text-gray-600">Place some orders to start earning review points!</p>
        </div>
      )}
    </div>
  );
};

// OrderReviewCard Component
const OrderReviewCard = ({ order, index, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    if (field === 'rating') {
      if (value === 0) newErrors.rating = 'Please select a star rating.';
      else delete newErrors.rating;
    }
    if (field === 'reviewText') {
      const trimmed = value.trim();
      if (trimmed.length > 0 && trimmed.length < 10) newErrors.reviewText = 'Review must be at least 10 characters.';
      else if (trimmed.length > 0 && /^\d+$/.test(trimmed)) newErrors.reviewText = 'Review cannot contain only numbers.';
      else if (trimmed.length > 0 && /^[^a-zA-Z0-9]+$/.test(trimmed)) newErrors.reviewText = 'Review cannot contain only special characters.';
      else delete newErrors.reviewText;
    }
    setErrors(newErrors);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !validateImageFile(file)) return;
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
    if (!validateReviewFields(rating, reviewText) || Object.keys(errors).length > 0) {
      toast.error('⚠️ Please fix the errors before submitting.');
      return;
    }
    onSubmit(order.orderId, rating, reviewText, imageFile);
    setRating(0); setReviewText(''); setImageFile(null); setImagePreview(''); setErrors({});
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
      className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:border-primary transition-all">
      <div className="flex gap-6 mb-6 flex-col sm:flex-row">
        <motion.img whileHover={{ scale: 1.05, rotate: 3 }} src={order.image} alt={order.foodItem} className="w-32 h-32 rounded-xl object-cover shadow-md" />
        <div className="flex-1">
          <h3 className="font-bold text-xl mb-1">{order.foodItem}</h3>
          <p className="text-gray-600 mb-2">{order.vendor} • Delivered {order.deliveredAt}</p>
          <p className="text-sm text-gray-500">Order {order.orderId}</p>
          <div className="mt-2 inline-flex items-center gap-2 bg-yellow-50 text-gold px-3 py-1 rounded-full text-sm font-semibold">⭐ Write a review to earn 5 points!</div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-2">How was the food? <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(star => (
              <motion.button key={star} whileHover={{ scale: 1.2, rotate: 15 }} whileTap={{ scale: 0.9 }}
                onClick={() => { setRating(star); validateField('rating', star); }}
                onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}>
                <Star className={`w-10 h-10 ${star <= (hoverRating || rating) ? 'fill-gold text-gold' : 'text-gray-300'}`} />
              </motion.button>
            ))}
          </div>
          {errors.rating && <p className="text-red-500 text-sm mt-1">⚠️ {errors.rating}</p>}
        </div>

        <div>
          <label className="block font-semibold mb-2">Write a review (optional)</label>
          <textarea value={reviewText} onChange={(e) => { setReviewText(e.target.value); validateField('reviewText', e.target.value); }}
            placeholder="Tell us about your experience... (min 10 characters if provided)"
            className={`w-full px-4 py-3 border-2 rounded-xl resize-none focus:outline-none transition-all ${errors.reviewText ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-primary'}`}
            rows="3" maxLength="500" />
          <div className="flex justify-between items-center mt-1">
            {errors.reviewText ? <p className="text-red-500 text-sm">⚠️ {errors.reviewText}</p> : <span />}
            <span className={`text-sm ml-auto ${reviewText.length >= 450 ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>{reviewText.length}/500</span>
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-2">Add a photo (optional)</label>
          {!imagePreview ? (
            <label className="block">
              <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleImageChange} className="hidden" />
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-gray-50 transition-all">
                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 font-semibold">Click to upload image</p>
                <p className="text-sm text-gray-500 mt-1">JPG, PNG, GIF, WEBP — max 5MB</p>
              </div>
            </label>
          ) : (
            <div className="relative inline-block">
              <img src={imagePreview} alt="Preview" className="w-full max-w-xs rounded-lg border-2 border-gray-200" />
              <button onClick={removeImage} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"><X className="w-4 h-4" /></button>
            </div>
          )}
        </div>

        <motion.button onClick={handleSubmit} className="w-full bg-gradient-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
          <CheckCircle className="w-5 h-5" /> Submit Review & Earn 5 Points ⭐
        </motion.button>
      </div>
    </motion.div>
  );
};

// EditReviewForm Component
const EditReviewForm = ({ review, onSave, onCancel }) => {
  const [rating, setRating] = useState(review.rating);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState(review.reviewText || '');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(review.imageUrl || '');
  const [errors, setErrors] = useState({});

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    if (field === 'rating') {
      if (value === 0) newErrors.rating = 'Please select a star rating.';
      else delete newErrors.rating;
    }
    if (field === 'reviewText') {
      const trimmed = value.trim();
      if (trimmed.length > 0 && trimmed.length < 10) newErrors.reviewText = 'Review must be at least 10 characters.';
      else if (trimmed.length > 0 && /^\d+$/.test(trimmed)) newErrors.reviewText = 'Review cannot contain only numbers.';
      else if (trimmed.length > 0 && /^[^a-zA-Z0-9]+$/.test(trimmed)) newErrors.reviewText = 'Review cannot contain only special characters.';
      else delete newErrors.reviewText;
    }
    setErrors(newErrors);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !validateImageFile(file)) return;
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
    if (!validateReviewFields(rating, reviewText) || Object.keys(errors).length > 0) {
      toast.error('⚠️ Please fix the errors before saving.');
      return;
    }
    onSave(review._id, rating, reviewText, imageFile);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-xl">Edit Review</h3>
        <button onClick={onCancel} className="p-2 hover:bg-gray-200 rounded-lg"><X className="w-5 h-5" /></button>
      </div>

      <div>
        <label className="block font-semibold mb-2">Rating <span className="text-red-500">*</span></label>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(star => (
            <motion.button key={star} whileHover={{ scale: 1.2, rotate: 15 }} onClick={() => { setRating(star); validateField('rating', star); }}
              onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}>
              <Star className={`w-8 h-8 ${star <= (hoverRating || rating) ? 'fill-gold text-gold' : 'text-gray-300'}`} />
            </motion.button>
          ))}
        </div>
        {errors.rating && <p className="text-red-500 text-sm mt-1">⚠️ {errors.rating}</p>}
      </div>

      <div>
        <label className="block font-semibold mb-2">Review Text</label>
        <textarea value={reviewText} onChange={(e) => { setReviewText(e.target.value); validateField('reviewText', e.target.value); }}
          placeholder="Min 10 characters if provided..." className={`w-full px-4 py-3 border-2 rounded-xl resize-none focus:outline-none transition-all ${errors.reviewText ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-primary'}`} rows="3" maxLength="500" />
        <div className="flex justify-between items-center mt-1">
          {errors.reviewText ? <p className="text-red-500 text-sm">⚠️ {errors.reviewText}</p> : <span />}
          <span className={`text-sm ml-auto ${reviewText.length >= 450 ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>{reviewText.length}/500</span>
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-2">Photo</label>
        {!imagePreview ? (
          <label className="block">
            <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleImageChange} className="hidden" />
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-all">
              <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600">Click to upload new image</p>
              <p className="text-sm text-gray-500 mt-1">JPG, PNG, GIF, WEBP — max 5MB</p>
            </div>
          </label>
        ) : (
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="w-full max-w-xs rounded-lg" />
            <button onClick={removeImage} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"><X className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="flex-1 bg-gradient-primary text-white py-3 rounded-xl font-bold">Save Changes</motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onCancel} className="px-6 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold">Cancel</motion.button>
      </div>
    </div>
  );
};

export default FeedbackTab;
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
    orderId: 'ORD-1234',
    foodItem: 'Classic Beef Burger',
    vendor: 'Main Canteen',
    deliveredAt: '2 hours ago',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop',
  },
  {
    orderId: 'ORD-1230',
    foodItem: 'Pepperoni Pizza',
    vendor: 'Pizza Paradise',
    deliveredAt: 'Yesterday',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop',
  },
];

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
    if (rating === 0) {
      toast.error('⚠️ Please rate the order before submitting!');
      return;
    }

    const order = orders.find(o => o.orderId === orderId);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('userId', currentUser.userId);
      formData.append('userName', currentUser.userName);
      formData.append('orderId', orderId);
      formData.append('foodItem', order.foodItem);
      formData.append('vendor', order.vendor);
      formData.append('rating', rating);
      formData.append('reviewText', reviewText);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await axios.post('http://localhost:5000/api/reviews', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(response.data.message);
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 4000);

      fetchUserReviews();
      refreshLoyaltyData();
      setOrders(orders.filter(o => o.orderId !== orderId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleUpdateReview = async (reviewId, rating, reviewText, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('rating', rating);
      formData.append('reviewText', reviewText);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await axios.put(`http://localhost:5000/api/reviews/${reviewId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-6xl mb-4"
            >
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
                        <p className="text-gray-600 text-sm">{review.vendor} • {review.orderId}</p>
                        <div className="flex gap-1 mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${i < review.rating ? 'fill-gold text-gold' : 'text-gray-300'}`}
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
                      <img src={review.imageUrl} alt="Review" className="w-full max-w-xs rounded-lg mt-3" />
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

// Order Review Card Component
const OrderReviewCard = ({ order, index, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = () => {
    onSubmit(order.orderId, rating, reviewText, imageFile);
    setRating(0);
    setReviewText('');
    setImageFile(null);
    setImagePreview('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:border-primary transition-all"
    >
      <div className="flex gap-6 mb-6 flex-col sm:flex-row">
        <motion.img
          whileHover={{ scale: 1.05, rotate: 3 }}
          src={order.image}
          alt={order.foodItem}
          className="w-32 h-32 rounded-xl object-cover shadow-md"
        />
        <div className="flex-1">
          <h3 className="font-bold text-xl mb-1">{order.foodItem}</h3>
          <p className="text-gray-600 mb-2">{order.vendor} • Delivered {order.deliveredAt}</p>
          <p className="text-sm text-gray-500">Order {order.orderId}</p>
          <div className="mt-2 inline-flex items-center gap-2 bg-yellow-50 text-gold px-3 py-1 rounded-full text-sm font-semibold">
            ⭐ Write a review to earn 5 points!
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="block font-semibold mb-2">How was the food?</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.2, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setRating(star)}
                type="button"
                className="transition-all"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= rating ? 'fill-gold text-gold' : 'text-gray-300'
                  }`}
                />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Review Text */}
        <div>
          <label className="block font-semibold mb-2">Write a review (optional)</label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Tell us about your experience..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl resize-none focus:border-primary focus:outline-none transition-all"
            rows="3"
            maxLength="500"
          />
          <div className="text-sm text-gray-500 mt-1">{reviewText.length}/500 characters</div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block font-semibold mb-2">Add a photo (optional)</label>
          
          {!imagePreview ? (
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-gray-50 transition-all">
                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 font-semibold">Click to upload image</p>
                <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
              </div>
            </label>
          ) : (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full max-w-xs rounded-lg border-2 border-gray-200"
              />
              <button
                onClick={removeImage}
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

// Edit Review Form Component
const EditReviewForm = ({ review, onSave, onCancel }) => {
  const [rating, setRating] = useState(review.rating);
  const [reviewText, setReviewText] = useState(review.reviewText || '');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(review.imageUrl || '');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSave = () => {
    onSave(review._id, rating, reviewText, imageFile);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-xl">Edit Review</h3>
        <button onClick={onCancel} className="p-2 hover:bg-gray-200 rounded-lg transition-all">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div>
        <label className="block font-semibold mb-2">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              whileHover={{ scale: 1.2, rotate: 15 }}
              onClick={() => setRating(star)}
              type="button"
            >
              <Star className={`w-8 h-8 ${star <= rating ? 'fill-gold text-gold' : 'text-gray-300'}`} />
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-2">Review Text</label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl resize-none focus:border-primary focus:outline-none"
          rows="3"
          maxLength="500"
        />
      </div>

      <div>
        <label className="block font-semibold mb-2">Photo</label>
        {!imagePreview ? (
          <label className="block">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-all">
              <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600">Click to upload new image</p>
            </div>
          </label>
        ) : (
          <div className="relative">
            <img src={imagePreview} alt="Preview" className="w-full max-w-xs rounded-lg" />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

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
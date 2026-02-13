import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Search, TrendingUp, ThumbsUp, Sparkles } from 'lucide-react';
import { reviewAPI } from '../../services/api';

const ReviewsTab = () => {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    rating: null,
    sentiment: null,
    verified: false,
    search: '',
    sort: 'recent',
  });

  useEffect(() => {
    fetchReviews();
    fetchSummary();
  }, [filters]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.rating) params.rating = filters.rating;
      if (filters.sentiment) params.sentiment = filters.sentiment;
      if (filters.verified) params.verified = 'true';
      if (filters.search) params.search = filters.search;
      if (filters.sort) params.sort = filters.sort;

      const response = await reviewAPI.getAll(params);
      setReviews(response.data.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await reviewAPI.getSummary();
      setSummary(response.data.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getRatingDistribution = () => {
    if (!summary?.ratingDistribution) return [];
    const dist = [0, 0, 0, 0, 0];
    summary.ratingDistribution.forEach(item => {
      dist[item._id - 1] = item.count;
    });
    return dist.reverse();
  };

  const ratingDist = getRatingDistribution();
  const totalReviews = summary?.totalReviews || 0;

  return (
    <div className="space-y-8">
      {/* Rating Summary Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-200"
      >
        <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
          📊 Overall Rating Summary
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Average Rating */}
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl font-bold text-gold mb-2"
            >
              {summary?.averageRating || '0.0'}
            </motion.div>
            <div className="flex justify-center gap-1 text-3xl mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-8 h-8 ${
                    i < Math.round(parseFloat(summary?.averageRating || 0))
                      ? 'fill-gold text-gold'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-gray-500">Based on {totalReviews} reviews</div>
          </div>

          {/* Rating Distribution */}
          <div className="md:col-span-2 space-y-3">
            {[5, 4, 3, 2, 1].map((rating, index) => {
              const count = ratingDist[index] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              
              return (
                <motion.div
                  key={rating}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="grid grid-cols-12 gap-3 items-center"
                >
                  <div className="col-span-2 flex items-center gap-1 font-semibold text-gray-700">
                    {rating} <Star className="w-4 h-4 fill-gold text-gold" />
                  </div>
                  <div className="col-span-8">
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        className="h-full bg-gradient-gold"
                      />
                    </div>
                  </div>
                  <div className="col-span-2 text-sm font-semibold text-gray-600 text-right">
                    {percentage.toFixed(0)}%
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Review Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-4 text-xl font-bold">
          <Sparkles className="w-6 h-6 text-primary" />
          Review Highlights
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reviews.slice(0, 3).filter(r => r.rating >= 4).map((review, index) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ x: 10 }}
              className="bg-white p-4 rounded-xl border-l-4 border-green-500 shadow-sm"
            >
              <div className="text-xs text-gray-500 uppercase font-semibold mb-2">
                👍 Top Positive
              </div>
              <div className="text-sm italic text-gray-700 mb-2 line-clamp-3">
                "{review.reviewText || 'Great food and service!'}"
              </div>
              <div className="text-xs text-gray-500">
                — {review.userName}, {review.rating}★
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Filter & Sort Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        {/* Rating Filter */}
        <div className="mb-4">
          <label className="block font-semibold mb-3 text-gray-700">Filter by Rating:</label>
          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={!filters.rating}
              onClick={() => handleFilterChange('rating', null)}
              label="All Reviews"
            />
            {[5, 4, 3, 2, 1].map(rating => (
              <FilterChip
                key={rating}
                active={filters.rating === rating}
                onClick={() => handleFilterChange('rating', rating)}
                label={`${rating} Stars`}
                icon={<Star className="w-4 h-4 fill-gold text-gold" />}
              />
            ))}
            <FilterChip
              active={filters.verified}
              onClick={() => handleFilterChange('verified', !filters.verified)}
              label="Verified Only"
              icon="✓"
            />
          </div>
        </div>

        {/* Sentiment Filter */}
        <div className="mb-4">
          <label className="block font-semibold mb-3 text-gray-700">Filter by Sentiment:</label>
          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={filters.sentiment === 'positive'}
              onClick={() => handleFilterChange('sentiment', filters.sentiment === 'positive' ? null : 'positive')}
              label="Positive"
              icon="👍"
            />
            <FilterChip
              active={filters.sentiment === 'neutral'}
              onClick={() => handleFilterChange('sentiment', filters.sentiment === 'neutral' ? null : 'neutral')}
              label="Neutral"
              icon="😐"
            />
            <FilterChip
              active={filters.sentiment === 'negative'}
              onClick={() => handleFilterChange('sentiment', filters.sentiment === 'negative' ? null : 'negative')}
              label="Negative"
              icon="👎"
            />
          </div>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search reviews by keywords..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all"
            />
          </div>
          
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold cursor-pointer focus:border-primary focus:outline-none transition-all"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </motion.div>

      {/* Reviews List */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Community Reviews ({reviews.length})
        </h2>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold mb-2">No Reviews Found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <ReviewCard key={review._id} review={review} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Filter Chip Component
const FilterChip = ({ active, onClick, label, icon }) => (
  <motion.button
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all
      ${active
        ? 'bg-gradient-primary text-white shadow-lg'
        : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:border-primary'
      }
    `}
  >
    {icon && <span>{icon}</span>}
    {label}
  </motion.button>
);

// Review Card Component
const ReviewCard = ({ review, index }) => {
  const [helpful, setHelpful] = useState(review.helpful || 0);

  const handleMarkHelpful = async () => {
    try {
      await reviewAPI.markHelpful(review._id);
      setHelpful(prev => prev + 1);
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ x: 10 }}
      className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-lg"
          >
            {review.userName.charAt(0)}
          </motion.div>
          <div>
            <div className="font-semibold">{review.userName}</div>
            <div className="text-sm text-gray-500">
              {new Date(review.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
              {' • '}{review.orderId}
            </div>
          </div>
        </div>
        
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${i < review.rating ? 'fill-gold text-gold' : 'text-gray-300'}`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {review.verified && (
          <span className="inline-flex items-center gap-1 bg-gradient-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
            ✓ Verified Order
          </span>
        )}
        <span className={`
          inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold
          ${review.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
            review.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'}
        `}>
          {review.sentiment === 'positive' ? '👍' : review.sentiment === 'negative' ? '👎' : '😐'}
          {' '}
          {review.sentiment.charAt(0).toUpperCase() + review.sentiment.slice(1)}
        </span>
      </div>

      <h3 className="font-bold text-lg mb-2">{review.foodItem}</h3>
      <p className="text-gray-600 mb-1 text-sm">{review.vendor}</p>
      
      {review.reviewText && (
        <p className="text-gray-700 mt-3 leading-relaxed">{review.reviewText}</p>
      )}

      {review.imageUrl && (
        <motion.img
          whileHover={{ scale: 1.05 }}
          src={review.imageUrl}
          alt="Review"
          className="w-full max-w-md rounded-lg mt-4 shadow-md"
        />
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleMarkHelpful}
          className="flex items-center gap-2 text-gray-600 hover:text-primary font-semibold text-sm"
        >
          <ThumbsUp className="w-4 h-4" />
          Helpful ({helpful})
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ReviewsTab;
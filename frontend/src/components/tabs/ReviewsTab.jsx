import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Search, TrendingUp, ThumbsUp, Sparkles } from 'lucide-react';
import { reviewAPI } from '../../services/api';
import SentimentBadge from '../SentimentBadge';

// Sample/Demo Reviews Data with Sri Lankan person images
const sampleReviews = [
  {
    _id: 'sample-1',
    userId: 'SAMPLE001',
    userName: 'Kasun Perera',
    userImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
    orderId: 'ORD-SAMPLE-1',
    foodItem: 'Classic Beef Burger',
    vendor: 'Main Canteen',
    rating: 5,
    reviewText: 'Amazing burger! The patty was perfectly cooked and juicy. The fries were crispy and well-seasoned. Delivery was super fast too. Highly recommend!',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    sentiment: 'positive',
    verified: true,
    helpful: 12,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    _id: 'sample-2',
    userId: 'SAMPLE002',
    userName: 'Nimali Silva',
    userImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    orderId: 'ORD-SAMPLE-2',
    foodItem: 'Pepperoni Pizza',
    vendor: 'Bird Nest Canteen',
    rating: 4,
    reviewText: 'Good pizza but arrived a bit cold. The toppings were fresh and generous though. Still tasty! Would order again but maybe pick up instead of delivery.',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
    sentiment: 'positive',
    verified: true,
    helpful: 8,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    _id: 'sample-3',
    userId: 'SAMPLE003',
    userName: 'Nuwan Fernando',
    userImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    orderId: 'ORD-SAMPLE-3',
    foodItem: 'Rice & Curry',
    vendor: 'Anohana Canteen',
    rating: 5,
    reviewText: 'Best Rice & Curry I have had on campus! Generous portions and authentic taste. The chicken was perfectly cooked. Will definitely order again!',
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
    sentiment: 'positive',
    verified: true,
    helpful: 15,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    _id: 'sample-4',
    userId: 'SAMPLE004',
    userName: 'Tharindu Wijesinghe',
    userImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    orderId: 'ORD-SAMPLE-4',
    foodItem: 'Chicken Kottu',
    vendor: 'Main Canteen',
    rating: 5,
    reviewText: 'The Chicken Kottu was absolutely delicious! Perfect spice level and super filling. Delivery guy was very friendly too. 10/10 would recommend!',
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    sentiment: 'positive',
    verified: true,
    helpful: 10,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    _id: 'sample-5',
    userId: 'SAMPLE005',
    userName: 'Amali Rajapaksha',
    userImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    orderId: 'ORD-SAMPLE-5',
    foodItem: 'Submarine',
    vendor: 'Bird Nest Canteen',
    rating: 4,
    reviewText: 'Submarine was good but could use more sauce. Otherwise, fresh ingredients and good portion size. Fast delivery!',
    sentiment: 'positive',
    verified: true,
    helpful: 5,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    _id: 'sample-6',
    userId: 'SAMPLE006',
    userName: 'Saman Dissanayake',
    userImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    orderId: 'ORD-SAMPLE-6',
    foodItem: 'Fried Rice',
    vendor: 'Main Canteen',
    rating: 2,
    reviewText: 'Order arrived 45 minutes late and food was cold. Really disappointed with the quality this time. Usually they are better than this.',
    sentiment: 'negative',
    verified: true,
    helpful: 3,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    _id: 'sample-7',
    userId: 'SAMPLE007',
    userName: 'Priyanka Mendis',
    userImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    orderId: 'ORD-SAMPLE-7',
    foodItem: 'Noodles',
    vendor: 'New Building Canteen',
    rating: 3,
    reviewText: 'Food was okay, nothing special. Average taste and portions. Might try a different vendor next time.',
    sentiment: 'neutral',
    verified: false,
    helpful: 2,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    _id: 'sample-8',
    userId: 'SAMPLE008',
    userName: 'Dilshan Kumara',
    userImage: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=100&h=100&fit=crop&crop=face',
    orderId: 'ORD-SAMPLE-8',
    foodItem: 'Hoppers with Curry',
    vendor: 'New Building Canteen',
    rating: 5,
    reviewText: 'Authentic Sri Lankan breakfast! The egg hopper was perfect and the curry was so flavorful. Reminded me of home cooking. Will order again tomorrow!',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=300&fit=crop',
    sentiment: 'positive',
    verified: true,
    helpful: 18,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    _id: 'sample-9',
    userId: 'SAMPLE009',
    userName: 'Sanduni Perera',
    userImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
    orderId: 'ORD-SAMPLE-9',
    foodItem: 'Chicken Fried Rice',
    vendor: 'Main Canteen',
    rating: 4,
    reviewText: 'Really good fried rice! Large portion size and packed with chicken pieces. The seasoning was perfect. Only issue was it took a bit longer to arrive.',
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
    sentiment: 'positive',
    verified: true,
    helpful: 7,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
  {
    _id: 'sample-10',
    userId: 'SAMPLE010',
    userName: 'Lahiru Wickramasinghe',
    userImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face',
    orderId: 'ORD-SAMPLE-10',
    foodItem: 'String Hoppers',
    vendor: 'New Building Canteen',
    rating: 5,
    reviewText: 'Best string hoppers on campus! Came with delicious dhal curry and sambol. Very authentic taste and good value for money. Highly recommended for breakfast!',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=300&fit=crop',
    sentiment: 'positive',
    verified: true,
    helpful: 14,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
];

const ReviewsTab = () => {
  const [realReviews, setRealReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
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
  }, []);

  useEffect(() => {
    const combined = [...realReviews, ...sampleReviews];
    applyFiltersAndSort(combined);
  }, [realReviews, filters]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getAll({});
      setRealReviews(response.data.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setRealReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await reviewAPI.getSummary();
      
      const realData = response.data.data;
      const combinedTotal = (realData.totalReviews || 0) + sampleReviews.length;
      
      const realAvg = parseFloat(realData.averageRating) || 0;
      const sampleAvg = sampleReviews.reduce((sum, r) => sum + r.rating, 0) / sampleReviews.length;
      const combinedAvg = ((realAvg * realData.totalReviews) + (sampleAvg * sampleReviews.length)) / combinedTotal;
      
      setSummary({
        totalReviews: combinedTotal,
        averageRating: combinedAvg.toFixed(1),
        ratingDistribution: realData.ratingDistribution,
        sentimentDistribution: realData.sentimentDistribution,
      });
    } catch (error) {
      console.error('Error fetching summary:', error);
      const sampleAvg = sampleReviews.reduce((sum, r) => sum + r.rating, 0) / sampleReviews.length;
      setSummary({
        totalReviews: sampleReviews.length,
        averageRating: sampleAvg.toFixed(1),
        ratingDistribution: [],
        sentimentDistribution: [],
      });
    }
  };

  const applyFiltersAndSort = (reviews) => {
    let filtered = [...reviews];

    if (filters.rating) {
      filtered = filtered.filter(r => r.rating === filters.rating);
    }

    if (filters.sentiment) {
      filtered = filtered.filter(r => r.sentiment === filters.sentiment);
    }

    if (filters.verified) {
      filtered = filtered.filter(r => r.verified === true);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.foodItem.toLowerCase().includes(searchLower) ||
        r.reviewText.toLowerCase().includes(searchLower) ||
        r.vendor.toLowerCase().includes(searchLower)
      );
    }

    filtered.sort((a, b) => {
      switch (filters.sort) {
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'helpful':
          return (b.helpful || 0) - (a.helpful || 0);
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setAllReviews(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getRatingDistribution = () => {
    if (!summary?.ratingDistribution) return [0, 0, 0, 0, 0];
    
    const dist = [0, 0, 0, 0, 0];
    
    summary.ratingDistribution.forEach(item => {
      dist[item._id - 1] = item.count;
    });
    
    sampleReviews.forEach(review => {
      dist[review.rating - 1]++;
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
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl font-bold text-gold mb-2"
            >
              {summary?.averageRating || '4.2'}
            </motion.div>
            <div className="flex justify-center gap-1 text-3xl mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-8 h-8 ${
                    i < Math.round(parseFloat(summary?.averageRating || 4.2))
                      ? 'fill-gold text-gold'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-gray-500">Based on {totalReviews} reviews</div>
          </div>

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
          {allReviews.slice(0, 3).filter(r => r.rating >= 4).map((review, index) => (
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
          Community Reviews ({allReviews.length})
        </h2>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading reviews...</div>
        ) : allReviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold mb-2">No Reviews Found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allReviews.map((review, index) => (
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
    if (!review._id.startsWith('sample-')) {
      try {
        await reviewAPI.markHelpful(review._id);
        setHelpful(prev => prev + 1);
      } catch (error) {
        console.error('Error marking helpful:', error);
      }
    } else {
      setHelpful(prev => prev + 1);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const reviewDate = new Date(date);
    const diffMs = now - reviewDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return reviewDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
          {review.userImage ? (
            <motion.img
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              src={review.userImage}
              alt={review.userName}
              className="w-12 h-12 rounded-full object-cover border-2 border-primary shadow-md"
            />
          ) : (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-md"
            >
              {review.userName.charAt(0)}
            </motion.div>
          )}
          <div>
            <div className="font-semibold">{review.userName}</div>
            <div className="text-sm text-gray-500">
              {getTimeAgo(review.createdAt)}
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

      {/* ⭐⭐⭐ AI SENTIMENT ANALYSIS - THIS IS THE NEW PART! ⭐⭐⭐ */}
      {review.aiAnalysis && (
        <SentimentBadge aiAnalysis={review.aiAnalysis} />
      )}
      {/* ⭐⭐⭐ END OF NEW PART ⭐⭐⭐ */}

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
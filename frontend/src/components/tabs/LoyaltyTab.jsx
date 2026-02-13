import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Trophy, TrendingUp, History } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { loyaltyAPI } from '../../services/api';
import toast from 'react-hot-toast';

const rewards = [
  { id: 1, title: 'Rs. 50 Off', description: 'Get Rs. 50 discount on your next order', points: 50, icon: '💵' },
  { id: 2, title: 'Rs. 100 Off', description: 'Get Rs. 100 discount on your next order', points: 100, icon: '💰' },
  { id: 3, title: 'Free Pizza', description: 'Get a free medium pizza from Pizza Paradise', points: 200, icon: '🍕' },
  { id: 4, title: 'Free Burger Combo', description: 'Get a free burger combo from Main Canteen', points: 150, icon: '🍔' },
  { id: 5, title: 'Free Beverage', description: 'Get any beverage of your choice for free', points: 30, icon: '☕' },
  { id: 6, title: 'Free Dessert', description: 'Choose any dessert from our menu', points: 40, icon: '🎂' },
];

const foodItems = [
  { name: 'Rice & Curry', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop' },
  { name: 'Chicken Kottu', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop' },
  { name: 'Pizza', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop' },
  { name: 'Burger', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop' },
];

const LoyaltyTab = () => {
  const { loyaltyData, loading, redeemReward, refreshLoyaltyData } = useApp();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await loyaltyAPI.getHistory(loyaltyData?.userId || 'USER001');
      setHistory(response.data.data.slice(0, 6));
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRedeem = async (reward) => {
    const success = await redeemReward(reward.points, reward.title);
    if (success) {
      fetchHistory();
    }
  };

  const getLevelProgress = () => {
    if (!loyaltyData) return { current: 0, next: 150, percentage: 0 };
    
    const levels = { Bronze: 150, Silver: 300, Gold: 500, Platinum: 1000 };
    const currentLevel = loyaltyData.level;
    const nextLevel = currentLevel === 'Bronze' ? 'Silver' : 
                      currentLevel === 'Silver' ? 'Gold' : 
                      currentLevel === 'Gold' ? 'Platinum' : 'Platinum';
    
    const nextThreshold = levels[nextLevel];
    const currentPoints = loyaltyData.totalPoints;
    const percentage = (currentPoints / nextThreshold) * 100;
    
    return { current: currentPoints, next: nextThreshold, percentage: Math.min(percentage, 100) };
  };

  const progress = getLevelProgress();

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Points Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Points Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-gradient-gold rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 text-9xl opacity-10">⭐</div>
          <div className="relative z-10">
            <div className="text-lg opacity-90 mb-2">Your Total Points</div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl font-bold mb-2"
            >
              {loyaltyData?.totalPoints || 0}
            </motion.div>
            <div className="text-sm opacity-85">Keep ordering to earn more!</div>
          </div>
        </motion.div>

        {/* Level Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-primary" />
            <span className="bg-gradient-primary text-white px-4 py-2 rounded-full font-bold">
              {loyaltyData?.level || 'Bronze'} Member
            </span>
          </div>
          
          <h3 className="text-xl font-bold mb-2">
            {loyaltyData?.level === 'Platinum' ? 'Maximum Level!' : `Almost ${progress.next === 300 ? 'Gold' : progress.next === 500 ? 'Platinum' : 'Silver'}!`}
          </h3>
          <p className="text-gray-600 mb-4">
            {loyaltyData?.level === 'Platinum' 
              ? 'You\'ve reached the top!' 
              : `Earn ${progress.next - progress.current} more points to level up`
            }
          </p>
          
          {loyaltyData?.level !== 'Platinum' && (
            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span>{progress.current} Points</span>
                <span>{progress.next} Points</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percentage}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-primary"
                />
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Popular Food Items */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
          🍽️ Popular Food Items
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {foodItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, rotateZ: 2 }}
              className="relative rounded-2xl overflow-hidden shadow-md group cursor-pointer"
            >
              <img src={item.image} alt={item.name} className="w-full h-40 object-cover transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-semibold">{item.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
          💡 How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: '🛒', title: 'Order Food', desc: 'Place orders from canteen or restaurants' },
            { icon: '⭐', title: 'Earn Points', desc: 'Get 1 point for every Rs. 100 spent' },
            { icon: '📝', title: 'Write Reviews', desc: 'Earn 5 bonus points per review!' },
            { icon: '🎁', title: 'Redeem Rewards', desc: 'Use points for discounts and freebies' },
          ].map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-5xl mb-3">{step.icon}</div>
              <h3 className="font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Available Rewards */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
          🎁 Available Rewards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward, index) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 hover:border-primary transition-all"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center text-3xl mb-4"
              >
                {reward.icon}
              </motion.div>
              <h3 className="font-bold text-xl mb-2">{reward.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{reward.description}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gold text-lg">⭐ {reward.points} Points</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRedeem(reward)}
                  disabled={!loyaltyData || loyaltyData.totalPoints < reward.points}
                  className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                    loyaltyData && loyaltyData.totalPoints >= reward.points
                      ? 'bg-gradient-primary text-white hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Redeem
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Points History */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
          <History className="w-6 h-6" />
          Points History
        </h2>
        {loadingHistory ? (
          <div className="text-center py-8 text-gray-500">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No transactions yet</div>
        ) : (
          <div className="space-y-3">
            {history.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 10 }}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
              >
                <div>
                  <div className="font-semibold">{item.description}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(item.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`font-bold text-xl ${
                    item.type === 'earned' ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {item.type === 'earned' ? '+' : '-'}{item.amount} ⭐
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoyaltyTab;
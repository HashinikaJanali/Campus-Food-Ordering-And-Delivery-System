import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, TrendingUp, History, QrCode, X, Download, Share2, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { loyaltyAPI, notificationAPI } from '../../services/api';
import toast from 'react-hot-toast';
import QRCodeStyling from 'qr-code-styling';

const rewards = [
  { id: 1, title: 'Rs. 50 Off', description: 'Get Rs. 50 discount on your next order', points: 50, icon: '💵', vendor: 'All Vendors' },
  { id: 2, title: 'Rs. 100 Off', description: 'Get Rs. 100 discount on your next order', points: 100, icon: '💰', vendor: 'All Vendors' },
  { id: 3, title: 'Free Pizza', description: 'Get a free medium pizza from Pizza Paradise', points: 200, icon: '🍕', vendor: 'Anohana Canteen' },
  { id: 4, title: 'Free Burger Combo', description: 'Get a free burger combo from Main Canteen', points: 150, icon: '🍔', vendor: 'Main Canteen' },
  { id: 5, title: 'Free Beverage', description: 'Get any beverage of your choice for free', points: 30, icon: '☕', vendor: 'All Vendors' },
  { id: 6, title: 'Free Dessert', description: 'Choose any dessert from our menu', points: 40, icon: '🎂', vendor: 'All Vendors' },
];

const foodItems = [
  { name: 'Rice & Curry', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop' },
  { name: 'Chicken Kottu', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop' },
  { name: 'Pizza', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop' },
  { name: 'Burger', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop' },
];

const LoyaltyTab = () => {
  const { currentUser, loyaltyData, loading, redeemReward, refreshLoyaltyData } = useApp();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [redeemedRewards, setRedeemedRewards] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    fetchHistory();
    loadRedeemedRewards();
  }, []);

  const fetchHistory = async () => {
    if (!currentUser?.userId) return;
    try {
      setLoadingHistory(true);
      const response = await loyaltyAPI.getHistory(loyaltyData?.userId || currentUser.userId);
      setHistory(response.data.data.slice(0, 6));
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadRedeemedRewards = () => {
    if (!currentUser?.userId) return;
    const saved = localStorage.getItem(`redeemedRewards_${currentUser.userId}`);
    if (saved) {
      setRedeemedRewards(JSON.parse(saved));
    }
  };

  const saveRedeemedRewards = (rewards) => {
    if (!currentUser?.userId) return;
    localStorage.setItem(`redeemedRewards_${currentUser.userId}`, JSON.stringify(rewards));
    setRedeemedRewards(rewards);
  };

  const handleRedeem = async (reward) => {
    const success = await redeemReward(reward.points, reward.title);
    if (success) {
      // Generate unique code
      const code = `${reward.title.toUpperCase().replace(/\s/g, '')}-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      // Create redeemed reward with QR code
      const newReward = {
        id: `RWD-${Date.now()}`,
        title: reward.title,
        description: reward.description,
        vendor: reward.vendor,
        icon: reward.icon,
        code: code,
        pointsUsed: reward.points,
        redeemedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        status: 'active',
      };

      const updated = [newReward, ...redeemedRewards];
      saveRedeemedRewards(updated);

      // Create notification
      try {
        await notificationAPI.create({
          userId: currentUser.userId,
          type: 'reward_redeemed',
          title: '🎁 Reward Redeemed!',
          message: `You redeemed: ${reward.title}. Show QR code to vendor!`,
          icon: '🎁',
          data: { rewardId: newReward.id, code: code },
        });
      } catch (error) {
        console.error('Error creating notification:', error);
      }

      // Show QR modal immediately
      setSelectedReward(newReward);
      setShowQRModal(true);

      fetchHistory();
      toast.success('🎉 Reward redeemed! Show QR code to vendor.');
    }
  };

  const handleMarkAsUsed = (rewardId) => {
    const updated = redeemedRewards.map(r =>
      r.id === rewardId ? { ...r, status: 'used', usedAt: new Date().toISOString() } : r
    );
    saveRedeemedRewards(updated);
    setShowQRModal(false);
    setSelectedReward(null);
    toast.success('Reward marked as used!');
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
  const activeRewards = redeemedRewards.filter(r => r.status === 'active');
  const usedRewards = redeemedRewards.filter(r => r.status === 'used');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-4"
          >
            ⭐
          </motion.div>
          <p className="text-gray-600">Loading your rewards...</p>
        </div>
      </div>
    );
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

      {/* My Rewards (Redeemed with QR) */}
      {activeRewards.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <QrCode className="w-6 h-6 text-purple-600" />
              My Active Rewards
            </h2>
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
              {activeRewards.length} Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {activeRewards.map((reward, index) => (
              <RewardQRCard
                key={reward.id}
                reward={reward}
                index={index}
                onClick={() => {
                  setSelectedReward(reward);
                  setShowQRModal(true);
                }}
              />
            ))}
          </div>

          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <p className="text-sm text-purple-800">
              💡 <strong>Tip:</strong> Click on a reward to show the QR code to the vendor and redeem your discount!
            </p>
          </div>
        </div>
      )}

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
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
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
            { icon: '⭐', title: 'Earn Points', desc: 'Get 1 point for every Rs. 100 spent + 5 points per review!' },
            { icon: '🎁', title: 'Redeem Rewards', desc: 'Exchange points for discounts and freebies' },
            { icon: '📱', title: 'Show QR Code', desc: 'Vendor scans your QR to apply discount' },
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

      {/* Available Rewards - WITH QR INTEGRATION */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
          🎁 Redeem Rewards
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
              <p className="text-gray-600 text-sm mb-2">{reward.description}</p>
              <p className="text-xs text-gray-500 mb-4">📍 Valid at: {reward.vendor}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gold text-lg">⭐ {reward.points} Points</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRedeem(reward)}
                  disabled={!loyaltyData || loyaltyData.totalPoints < reward.points}
                  className={`px-5 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    loyaltyData && loyaltyData.totalPoints >= reward.points
                      ? 'bg-gradient-primary text-white hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
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
          <div className="text-center py-8">
            <img
              src="https://illustrations.popsy.co/amber/alarm-clock.svg"
              alt="No history"
              className="w-32 h-32 mx-auto mb-4 opacity-50"
            />
            <p className="text-gray-500">No transactions yet</p>
          </div>
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

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && selectedReward && (
          <QRCodeModal
            reward={selectedReward}
            onClose={() => {
              setShowQRModal(false);
              setSelectedReward(null);
            }}
            onMarkAsUsed={handleMarkAsUsed}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Reward QR Card Component
const RewardQRCard = ({ reward, index, onClick }) => {
  const getTimeRemaining = () => {
    const now = new Date();
    const expires = new Date(reward.expiresAt);
    const diffMs = expires - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 1) return `${diffDays} days left`;
    if (diffDays === 1) return '1 day left';
    if (diffHours > 0) return `${diffHours} hours left`;
    return 'Expiring soon!';
  };

  const isExpiringSoon = () => {
    const now = new Date();
    const expires = new Date(reward.expiresAt);
    const diffHours = (expires - now) / (1000 * 60 * 60);
    return diffHours < 24;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl">
          {reward.icon}
        </div>
        <div className="flex-1">
          <h4 className="font-bold">{reward.title}</h4>
          <p className="text-xs text-gray-600">{reward.vendor}</p>
        </div>
        <QrCode className="w-6 h-6 text-purple-600" />
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
          isExpiringSoon() ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          <Clock className="w-3 h-3 inline mr-1" />
          {getTimeRemaining()}
        </span>
        <span className="text-sm font-semibold text-purple-600">Tap to show QR →</span>
      </div>
    </motion.div>
  );
};

// QR Code Modal Component
const QRCodeModal = ({ reward, onClose, onMarkAsUsed }) => {
  const qrRef = useRef(null);
  const [qrCode, setQrCode] = useState(null);

  useEffect(() => {
    if (!qrRef.current) return;

    const qr = new QRCodeStyling({
      width: 280,
      height: 280,
      data: reward.code,
      dotsOptions: {
        color: '#8b5cf6',
        type: 'rounded',
      },
      cornersSquareOptions: {
        color: '#ec4899',
        type: 'extra-rounded',
      },
      cornersDotOptions: {
        color: '#f97316',
        type: 'dot',
      },
      backgroundOptions: {
        color: '#ffffff',
      },
    });

    qr.append(qrRef.current);
    setQrCode(qr);

    return () => {
      if (qrRef.current) {
        qrRef.current.innerHTML = '';
      }
    };
  }, [reward.code]);

  const handleDownload = () => {
    if (qrCode) {
      qrCode.download({ name: `reward-${reward.id}`, extension: 'png' });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${reward.title} - CampusEats`,
          text: `I have a ${reward.title} reward! Code: ${reward.code}`,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(reward.code);
      toast.success('Code copied to clipboard!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Show to Vendor</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Reward Info */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-6 border-2 border-purple-200">
          <div className="text-5xl mb-3 text-center">{reward.icon}</div>
          <h3 className="text-2xl font-bold mb-1 text-center">{reward.title}</h3>
          <p className="text-gray-600 text-center text-sm mb-2">{reward.description}</p>
          <p className="text-xs text-gray-500 text-center">📍 {reward.vendor}</p>
        </div>

        {/* QR Code */}
        <div className="bg-white border-4 border-purple-300 rounded-2xl p-6 mb-6 flex justify-center shadow-inner">
          <div ref={qrRef} />
        </div>

        {/* Code */}
        <div className="bg-gray-100 rounded-xl p-4 mb-6 text-center">
          <div className="text-xs text-gray-500 mb-1">Reward Code</div>
          <div className="font-mono font-bold text-sm break-all">{reward.code}</div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            <Download className="w-5 h-5" />
            Download
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            Share
          </motion.button>
        </div>

        {/* Mark as Used */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onMarkAsUsed(reward.id)}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold shadow-lg"
        >
          ✓ Mark as Used
        </motion.button>

        {/* Info */}
        <p className="text-xs text-center text-gray-500 mt-4">
          Show this QR code to vendor to redeem your reward
        </p>
      </motion.div>
    </motion.div>
  );
};

export default LoyaltyTab;
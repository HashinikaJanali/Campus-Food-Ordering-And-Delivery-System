import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Gift, TrendingUp, Award, Target, Zap, Crown, Heart, Flame } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { reviewAPI } from '../../services/api';

const achievementsList = [
  { 
    id: 1, 
    title: 'First Order', 
    description: 'Complete your first order', 
    icon: Star, 
    points: 10,
    checkCondition: (data) => data.totalPoints > 0 // If they have points, they ordered
  },
  { 
    id: 2, 
    title: 'Review Starter', 
    description: 'Write your first review', 
    icon: TrendingUp, 
    points: 25,
    checkCondition: (data) => data.reviewCount >= 1
  },
  { 
    id: 3, 
    title: 'Review Enthusiast', 
    description: 'Write 5 reviews', 
    icon: TrendingUp, 
    points: 50,
    checkCondition: (data) => data.reviewCount >= 5
  },
  { 
    id: 4, 
    title: 'Review Master', 
    description: 'Write 10 reviews', 
    icon: TrendingUp, 
    points: 100,
    checkCondition: (data) => data.reviewCount >= 10
  },
  { 
    id: 5, 
    title: 'Bronze Member', 
    description: 'Reach Bronze status', 
    icon: Award, 
    points: 10,
    checkCondition: (data) => true // Everyone starts at Bronze
  },
  { 
    id: 6, 
    title: 'Silver Member', 
    description: 'Reach Silver status (150+ points)', 
    icon: Award, 
    points: 50,
    checkCondition: (data) => data.level === 'Silver' || data.level === 'Gold' || data.level === 'Platinum'
  },
  { 
    id: 7, 
    title: 'Gold Member', 
    description: 'Reach Gold status (300+ points)', 
    icon: Crown, 
    points: 100,
    checkCondition: (data) => data.level === 'Gold' || data.level === 'Platinum'
  },
  { 
    id: 8, 
    title: 'Platinum Legend', 
    description: 'Reach Platinum status (500+ points)', 
    icon: Crown, 
    points: 200,
    checkCondition: (data) => data.level === 'Platinum'
  },
  { 
    id: 9, 
    title: 'Points Collector', 
    description: 'Earn 100 total points', 
    icon: Zap, 
    points: 25,
    checkCondition: (data) => data.totalPoints >= 100
  },
  { 
    id: 10, 
    title: 'Points Champion', 
    description: 'Earn 500 total points', 
    icon: Target, 
    points: 100,
    checkCondition: (data) => data.totalPoints >= 500
  },
];

// Sample leaderboard (this can stay as demo data)
const leaderboard = [
  { rank: 1, name: 'Kasun Perera', points: 2450, avatar: '👑' },
  { rank: 2, name: 'Nimali Silva', points: 2180, avatar: '🥈' },
  { rank: 3, name: 'Nuwan Fernando', points: 1950, avatar: '🥉' },
  { rank: 4, name: 'You', points: 0, avatar: '🎯', highlight: true }, // Will be updated with real data
  { rank: 5, name: 'Tharindu W.', points: 1420, avatar: '⭐' },
];

const GamificationTab = () => {
  const { loyaltyData, currentUser } = useApp();
  const [showConfetti, setShowConfetti] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [userLeaderboard, setUserLeaderboard] = useState(leaderboard);

  useEffect(() => {
    fetchUserData();
  }, [loyaltyData]);

  const fetchUserData = async () => {
    try {
      // Get review count
      const reviewsResponse = await reviewAPI.getUserReviews(currentUser.userId);
      const userReviewCount = reviewsResponse.data.count || 0;
      setReviewCount(userReviewCount);

      // Calculate achievements based on real data
      const userData = {
        totalPoints: loyaltyData?.totalPoints || 0,
        level: loyaltyData?.level || 'Bronze',
        reviewCount: userReviewCount,
      };

      // Check which achievements are unlocked
      const updatedAchievements = achievementsList.map(achievement => ({
        ...achievement,
        unlocked: achievement.checkCondition(userData),
      }));

      setAchievements(updatedAchievements);

      // Update leaderboard with real user points
      const updatedLeaderboard = leaderboard.map(user => {
        if (user.highlight) {
          return { ...user, points: userData.totalPoints };
        }
        return user;
      });

      // Sort leaderboard and update ranks
      updatedLeaderboard.sort((a, b) => b.points - a.points);
      updatedLeaderboard.forEach((user, index) => {
        user.rank = index + 1;
      });

      setUserLeaderboard(updatedLeaderboard);

    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalBonusPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);
  const userRank = userLeaderboard.find(l => l.highlight)?.rank || 4;

  const handleAchievementClick = (achievement) => {
    if (achievement.unlocked) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: '50%', y: 0, opacity: 1 }}
              animate={{
                x: `${Math.random() * 100}%`,
                y: '100vh',
                opacity: 0,
                rotate: Math.random() * 360,
              }}
              transition={{ duration: 2, delay: Math.random() * 0.5 }}
              className="absolute text-4xl"
            >
              {['🎉', '⭐', '🏆', '💫', '✨'][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
        </div>
      )}

      {/* Stats Overview - REAL DATA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-2xl"
      >
        <div className="flex items-center gap-4 mb-6">
          <Trophy className="w-12 h-12" />
          <div>
            <h2 className="text-3xl font-bold">Your Achievements</h2>
            <p className="opacity-90">Track your progress and earn bonus points!</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-4xl font-bold">{unlockedCount}/10</div>
            <div className="text-sm opacity-90">Unlocked</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-4xl font-bold">{loyaltyData?.totalPoints || 0}</div>
            <div className="text-sm opacity-90">Total Points</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-4xl font-bold">{reviewCount}</div>
            <div className="text-sm opacity-90">Reviews Written</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <div className="text-4xl font-bold">#{userRank}</div>
            <div className="text-sm opacity-90">Your Rank</div>
          </div>
        </div>
      </motion.div>

      {/* Achievements Grid - REAL DATA */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-2xl font-bold mb-6">🏆 Achievement Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              onClick={() => handleAchievementClick(achievement)}
              className={`
                relative rounded-xl p-6 cursor-pointer transition-all
                ${achievement.unlocked
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 shadow-lg'
                  : 'bg-gray-100 border-2 border-gray-300 opacity-60'
                }
              `}
            >
              {achievement.unlocked && (
                <div className="absolute top-2 right-2 text-2xl">✓</div>
              )}
              
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto
                ${achievement.unlocked
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                  : 'bg-gray-300 text-gray-500'
                }
              `}>
                <achievement.icon className="w-8 h-8" />
              </div>

              <h4 className="font-bold text-center mb-2">{achievement.title}</h4>
              <p className="text-sm text-gray-600 text-center mb-3">{achievement.description}</p>
              
              <div className={`
                text-center text-sm font-bold
                ${achievement.unlocked ? 'text-orange-600' : 'text-gray-500'}
              `}>
                +{achievement.points} Points
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Progress Towards Next Achievement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold mb-4">🎯 Next Goals</h3>
        <div className="space-y-4">
          {reviewCount < 5 && (
            <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Write {5 - reviewCount} more reviews</span>
                <span className="text-sm text-gray-600">{reviewCount}/5</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all"
                  style={{ width: `${(reviewCount / 5) * 100}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Unlock "Review Enthusiast" badge and earn +50 points!
              </div>
            </div>
          )}

          {loyaltyData?.totalPoints < 150 && (
            <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Earn {150 - (loyaltyData?.totalPoints || 0)} more points</span>
                <span className="text-sm text-gray-600">{loyaltyData?.totalPoints || 0}/150</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all"
                  style={{ width: `${((loyaltyData?.totalPoints || 0) / 150) * 100}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Reach Silver status and unlock "Silver Member" badge!
              </div>
            </div>
          )}

          {loyaltyData?.totalPoints >= 150 && loyaltyData?.totalPoints < 300 && (
            <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Earn {300 - loyaltyData.totalPoints} more points</span>
                <span className="text-sm text-gray-600">{loyaltyData.totalPoints}/300</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all"
                  style={{ width: `${(loyaltyData.totalPoints / 300) * 100}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Reach Gold status and unlock "Gold Member" badge!
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Leaderboard */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-2xl font-bold mb-6">🏅 Top Students (Demo)</h3>
        <div className="space-y-3">
          {userLeaderboard.map((user, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                flex items-center gap-4 p-4 rounded-xl transition-all
                ${user.highlight
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-400 shadow-md'
                  : 'bg-gray-50 border-2 border-gray-200'
                }
              `}
            >
              <div className="text-4xl">{user.avatar}</div>
              <div className="flex-1">
                <div className="font-bold text-lg">{user.name}</div>
                <div className="text-sm text-gray-600">{user.points.toLocaleString()} points</div>
              </div>
              <div className={`
                text-2xl font-bold
                ${user.rank === 1 ? 'text-yellow-500' :
                  user.rank === 2 ? 'text-gray-400' :
                  user.rank === 3 ? 'text-orange-600' :
                  'text-blue-500'}
              `}>
                #{user.rank}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GamificationTab;
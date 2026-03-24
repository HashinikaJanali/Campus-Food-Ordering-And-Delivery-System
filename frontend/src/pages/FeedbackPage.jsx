import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Gift, MessageSquare, TrendingUp, Trophy, QrCode, Gamepad2, Mic } from 'lucide-react';
import LoyaltyTab from '../components/tabs/LoyaltyTab';
import PromotionsTab from '../components/tabs/PromotionsTab';
import FeedbackTab from '../components/tabs/FeedbackTab';
import ReviewsTab from '../components/tabs/ReviewsTab';
import GamificationTab from '../components/tabs/GamificationTab';
import MiniGamesTab from '../components/tabs/MiniGamesTab';

const tabs = [
  {
    id: 'loyalty',
    label: 'Loyalty Points',
    icon: Star,
    component: LoyaltyTab,
    gradient: 'from-yellow-400 to-orange-500',
    bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    iconColor: 'text-yellow-600',
    emoji: '⭐',
  },
  {
    id: 'promotions',
    label: 'Promotions',
    icon: Gift,
    component: PromotionsTab,
    gradient: 'from-pink-400 to-rose-500',
    bgColor: 'bg-gradient-to-br from-pink-50 to-rose-50',
    iconColor: 'text-pink-600',
    emoji: '🎁',
  },
  {
    id: 'achievements',
    label: 'Achievements',
    icon: Trophy,
    component: GamificationTab,
    gradient: 'from-purple-400 to-indigo-500',
    bgColor: 'bg-gradient-to-br from-purple-50 to-indigo-50',
    iconColor: 'text-purple-600',
    emoji: '🏆',
  },
  {
    id: 'feedback',
    label: 'Give Feedback',
    icon: MessageSquare,
    component: FeedbackTab,
    gradient: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    iconColor: 'text-blue-600',
    emoji: '💬',
  },
  {
    id: 'reviews',
    label: 'All Reviews',
    icon: TrendingUp,
    component: ReviewsTab,
    gradient: 'from-green-400 to-emerald-500',
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
    iconColor: 'text-green-600',
    emoji: '📊',
  },
 
  {
    id: 'mini-games',
    label: 'Mini-Games',
    icon: Gamepad2,
    component: MiniGamesTab,
    gradient: 'from-indigo-400 to-purple-500',
    bgColor: 'bg-gradient-to-br from-indigo-50 to-purple-50',
    iconColor: 'text-indigo-600',
    emoji: '🎮',
  },

  
];

const FeedbackPage = () => {
  const [activeTab, setActiveTab] = useState('loyalty');

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;
  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="space-y-8 mb-20">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-primary rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 text-9xl opacity-10">🎉</div>
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
        
        <div className="relative z-10">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="font-display text-3xl sm:text-5xl font-bold mb-3"
          >
            🎉 Earn Rewards with Every Order!
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl opacity-95"
          >
            Get points, unlock rewards, and enjoy exclusive deals
          </motion.p>
        </div>
      </motion.div>

      {/* Tab Navigation - COLORFUL VERSION */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-4 shadow-lg"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex flex-col items-center gap-2 px-3 py-4 rounded-2xl font-semibold text-sm transition-all overflow-hidden
                  ${isActive
                    ? `bg-gradient-to-br ${tab.gradient} text-white shadow-xl`
                    : `${tab.bgColor} ${tab.iconColor} border-2 border-transparent hover:border-current`
                  }
                `}
              >
                {/* Shimmer effect for active tab */}
                {isActive && (
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                  />
                )}

                {/* Emoji + Icon */}
                <div className="relative">
                  <motion.div
                    animate={isActive ? {
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-3xl mb-1"
                  >
                    {tab.emoji}
                  </motion.div>
                  {!isActive && (
                    <tab.icon className="w-5 h-5 mx-auto opacity-50" />
                  )}
                </div>

                {/* Label */}
                <span className="text-xs sm:text-sm leading-tight text-center">
                  {tab.label}
                </span>

                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Active tab info bar */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-3 rounded-xl ${activeTabData?.bgColor} border-2 border-current/20`}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-2xl"
            >
              {activeTabData?.emoji}
            </motion.div>
            <div>
              <div className={`font-bold ${activeTabData?.iconColor}`}>
                {activeTabData?.label}
              </div>
              <div className="text-xs text-gray-600">
                {activeTab === 'loyalty' && 'Track your points and rewards'}
                {activeTab === 'promotions' && 'Exclusive deals and offers'}
                {activeTab === 'achievements' && 'Unlock badges and compete'}
                {activeTab === 'feedback' && 'Share your experience'}
                {activeTab === 'reviews' && 'See what others are saying'}
                {activeTab === 'qr-rewards' && 'Scan to earn bonus points'}
                {activeTab === 'mini-games' && 'Play games, win points!'}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {ActiveComponent && <ActiveComponent />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FeedbackPage;
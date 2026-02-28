import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Gift, MessageSquare, TrendingUp, Trophy } from 'lucide-react';
import LoyaltyTab from '../components/tabs/LoyaltyTab';
import PromotionsTab from '../components/tabs/PromotionsTab';
import FeedbackTab from '../components/tabs/FeedbackTab';
import ReviewsTab from '../components/tabs/ReviewsTab';
import GamificationTab from '../components/tabs/GamificationTab';

const tabs = [
  { id: 'loyalty', label: 'Loyalty Points', icon: Star, component: LoyaltyTab },
  { id: 'promotions', label: 'Promotions', icon: Gift, component: PromotionsTab },
  { id: 'achievements', label: 'Achievements', icon: Trophy, component: GamificationTab },
  { id: 'feedback', label: 'Give Feedback', icon: MessageSquare, component: FeedbackTab },
  { id: 'reviews', label: 'All Reviews', icon: TrendingUp, component: ReviewsTab },
];

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('loyalty');

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="space-y-8">
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

      {/* Tab Navigation */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-4 shadow-lg"
      >
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all
                ${activeTab === tab.id
                  ? 'bg-gradient-primary text-white shadow-lg'
                  : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:border-primary-400'
                }
              `}
            >
              <tab.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </motion.button>
          ))}
        </div>
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

export default HomePage;
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

const Layout = ({ children }) => {
  const { loyaltyData, loading } = useApp();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full bg-white border-b-2 border-gray-200 px-4 sm:px-8 py-4 z-50 shadow-md"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <motion.h1
              className="font-display text-2xl sm:text-3xl font-bold text-gradient-primary"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🍕 CampusEats
            </motion.h1>
            <div className="hidden sm:block">
              <div className="font-semibold text-gray-900">Rewards & Promotions</div>
              <div className="text-sm text-gray-500">Earn points, get rewards!</div>
            </div>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-gold text-white px-4 sm:px-6 py-3 rounded-full font-bold flex items-center gap-2 text-base sm:text-lg shadow-lg"
          >
            <Star className="w-5 h-5" fill="currentColor" />
            <span>{loading ? '...' : loyaltyData?.totalPoints || 0} Points</span>
          </motion.div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="pt-24 sm:pt-28 pb-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
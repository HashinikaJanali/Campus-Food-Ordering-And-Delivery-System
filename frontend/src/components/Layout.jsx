import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import Footer from './Footer';
import NotificationBell from './NotificationBell';
import logoImage from '../assets/logo.png';

const Layout = ({ children }) => {
  const { loyaltyData, loading } = useApp();
  const [logoError, setLogoError] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full bg-white border-b-2 border-gray-200 px-4 sm:px-8 py-4 z-50 shadow-md"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Left Section (Logo + Title) */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
              >
                {!logoError ? (
                  <img 
                    src={logoImage}
                    alt="Grab & Go Logo"
                    className="w-full h-full object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span className="text-2xl">🛍️</span>
                )}
              </motion.div>
              
              <motion.h1
                className="font-display text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Grab & Go
              </motion.h1>
            </div>

            {/* Rewards text (Desktop only) */}
            <div className="hidden sm:block border-l-2 border-gray-300 pl-4 ml-2">
              <div className="font-semibold text-gray-900">Rewards & Promotions</div>
              <div className="text-sm text-gray-500">Earn points, get rewards!</div>
            </div>
          </div>

          {/* Right Section (Notification Bell + Points Badge) */}
          <div className="flex items-center gap-4">

            {/* 🔔 Notification Bell Added Here */}
            <NotificationBell />

            {/* ⭐ Points Badge */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white px-4 sm:px-6 py-3
                         rounded-full font-bold flex items-center gap-2 text-base sm:text-lg shadow-lg"
            >
              <Star className="w-5 h-5" fill="currentColor" />
              <span>{loading ? '...' : loyaltyData?.totalPoints || 0} Points</span>
            </motion.div>
          </div>
        </div>

        {/* Mobile Rewards Title */}
        <div className="sm:hidden mt-3 text-center">
          <div className="font-semibold text-gray-900 text-sm">Rewards & Promotions</div>
          <div className="text-xs text-gray-500">Earn points, get rewards!</div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="flex-1 pt-24 sm:pt-28 pb-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
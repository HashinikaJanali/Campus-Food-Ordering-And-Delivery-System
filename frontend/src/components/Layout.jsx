import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

const Layout = ({ children }) => {
  const { loyaltyData, loading } = useApp();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="pb-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
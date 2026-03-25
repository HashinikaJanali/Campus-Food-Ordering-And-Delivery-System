import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Copy, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { promotionAPI } from '../../services/api';

const samplePromotions = [
  {
    _id: 'sample-1',
    badge: '50% OFF',
    title: 'Pizza Weekend Special',
    description: 'On all Pizza orders above Rs. 1000 this weekend!',
    code: 'PIZZA50',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=300&fit=crop',
    timer: 'Ends in 2 days',
    featured: true,
  },
  {
    _id: 'sample-2',
    badge: '10% OFF',
    title: 'Rice & Curry Special',
    description: 'Get 10% off on all Rice & Curry orders from Main Canteen today!',
    code: 'RICE10',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&h=300&fit=crop',
    timer: 'Ends in 4 hours',
  },
  {
    _id: 'sample-3',
    badge: 'BUY 2 GET 1 FREE',
    title: 'Kottu Madness',
    description: 'Order 2 Chicken Kottu and get 1 FREE! Only at Spice Kitchen.',
    code: 'KOTTU3',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&h=300&fit=crop',
    timer: 'Ends tomorrow',
  },
  {
    _id: 'sample-4',
    badge: 'Rs. 200 OFF',
    title: 'Burger Bonanza',
    description: 'Save Rs. 200 on orders above Rs. 800 from Burger Station!',
    code: 'BURGER200',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=300&fit=crop',
    timer: 'Valid all week',
  },
  {
    _id: 'sample-5',
    badge: 'FREE DELIVERY',
    title: 'Free Delivery Day',
    description: 'No delivery charges on all orders today! Order anything you want.',
    code: 'FREEDEL',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=300&fit=crop',
    timer: 'Today only',
  },
  {
    _id: 'sample-6',
    badge: '15% OFF',
    title: 'Student Discount',
    description: 'Show your student ID and get 15% off on all submarine orders!',
    code: 'STUDENT15',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=300&fit=crop',
    timer: 'Always active',
  },
];

const PromotionsTab = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await promotionAPI.getAll(); // Gets only active promotions
      const apiPromotions = res.data.data.map(p => ({
          ...p,
          image: p.image.startsWith('/uploads') ? `http://localhost:5001${p.image}` : p.image
      }));
      setPromotions([...apiPromotions, ...samplePromotions]);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Promo code ${code} copied! 🎉`);
  };

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading amazing deals...</p>
      </div>
    );
  }

  const featuredPromo = promotions.find(p => p.featured);

  if (promotions.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
        <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">No Active Promotions</h2>
        <p className="text-gray-500">Check back later for exciting new deals and discounts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Featured Promotion */}
      {featuredPromo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-red-500 via-primary to-secondary rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 text-9xl opacity-15">🔥</div>
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
          
          <div className="relative z-10 max-w-2xl">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-lg font-semibold mb-2"
            >
              🔥 HOT DEAL - LIMITED TIME!
            </motion.div>
            <h2 className="font-display text-4xl sm:text-6xl font-bold mb-4">{featuredPromo.badge}</h2>
            <p className="text-xl mb-6 opacity-95">{featuredPromo.description}</p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => copyCode(featuredPromo.code)}
              className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
            >
              Get Promo Code: {featuredPromo.code}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* All Promotions */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
          🎁 Active Promotions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo, index) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-md hover:border-primary hover:shadow-xl transition-all"
            >
              <div className="relative overflow-hidden">
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  src={promo.image}
                  alt={promo.title}
                  className="w-full h-48 object-cover"
                />
              </div>
              
              <div className="p-5">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block bg-gradient-to-r from-red-500 to-primary text-white px-4 py-1 rounded-full text-sm font-bold mb-3"
                >
                  {promo.badge}
                </motion.div>
                
                <h3 className="font-display text-xl font-bold mb-2">{promo.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{promo.description}</p>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-red-500 font-semibold text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{promo.timer}</span>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => copyCode(promo.code)}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-primary hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition-all border-2 border-dashed border-primary"
                  >
                    <Copy className="w-4 h-4" />
                    {promo.code}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionsTab;
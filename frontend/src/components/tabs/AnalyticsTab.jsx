import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Star, Award } from 'lucide-react';

const metrics = [
  { label: 'Total Orders', value: '47', change: '+12%', trend: 'up', icon: ShoppingBag, color: 'blue' },
  { label: 'Total Spent', value: 'Rs. 23,450', change: '+8%', trend: 'up', icon: DollarSign, color: 'green' },
  { label: 'Avg Rating Given', value: '4.2', change: '+0.3', trend: 'up', icon: Star, color: 'yellow' },
  { label: 'Loyalty Points', value: '1,650', change: '+150', trend: 'up', icon: Award, color: 'purple' },
];

const orderHistory = [
  { month: 'Jan', orders: 5, spending: 2500 },
  { month: 'Feb', orders: 8, spending: 4200 },
  { month: 'Mar', orders: 12, spending: 6100 },
  { month: 'Apr', orders: 10, spending: 5300 },
  { month: 'May', orders: 12, spending: 5350 },
];

const vendorBreakdown = [
  { vendor: 'Main Canteen', orders: 18, percentage: 38 },
  { vendor: 'Pizza Paradise', orders: 12, percentage: 26 },
  { vendor: 'Spice Kitchen', orders: 10, percentage: 21 },
  { vendor: 'Sub Station', orders: 7, percentage: 15 },
];

const favoriteFoods = [
  { food: 'Chicken Burger', orders: 8, emoji: '🍔' },
  { food: 'Pepperoni Pizza', orders: 6, emoji: '🍕' },
  { food: 'Rice & Curry', orders: 5, emoji: '🍛' },
  { food: 'Chicken Kottu', orders: 4, emoji: '🥘' },
];

const AnalyticsTab = () => {
  return (
    <div className="space-y-8">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200 hover:border-primary transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${metric.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  metric.color === 'green' ? 'bg-green-100 text-green-600' :
                  metric.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-purple-100 text-purple-600'}
              `}>
                <metric.icon className="w-6 h-6" />
              </div>
              <div className={`
                flex items-center gap-1 text-sm font-semibold
                ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}
              `}>
                {metric.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {metric.change}
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{metric.value}</div>
            <div className="text-sm text-gray-600">{metric.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Orders Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <h3 className="text-xl font-bold mb-6">📈 Order History (Last 5 Months)</h3>
        <div className="space-y-4">
          {orderHistory.map((month, index) => (
            <div key={month.month} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{month.month}</span>
                <span className="text-sm text-gray-600">{month.orders} orders • Rs. {month.spending.toLocaleString()}</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(month.orders / 12) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Vendor Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <h3 className="text-xl font-bold mb-6">🏪 Spending by Vendor</h3>
        <div className="space-y-4">
          {vendorBreakdown.map((vendor, index) => (
            <motion.div
              key={vendor.vendor}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{vendor.vendor}</span>
                <span className="text-sm text-gray-600">{vendor.orders} orders ({vendor.percentage}%)</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${vendor.percentage}%` }}
                  transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                  className="h-full bg-gradient-to-r from-orange-400 to-pink-500"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Favorite Foods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <h3 className="text-xl font-bold mb-6">❤️ Your Favorite Foods</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favoriteFoods.map((food, index) => (
            <motion.div
              key={food.food}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-4 flex items-center gap-4"
            >
              <div className="text-4xl">{food.emoji}</div>
              <div className="flex-1">
                <div className="font-bold">{food.food}</div>
                <div className="text-sm text-gray-600">Ordered {food.orders} times</div>
              </div>
              <div className="text-2xl font-bold text-orange-600">#{index + 1}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold mb-4">💡 AI Insights</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🎯</div>
            <div>
              <div className="font-semibold">You're on track!</div>
              <div className="text-sm text-gray-600">Your spending is 15% lower than last month. Great job managing your budget!</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-2xl">⭐</div>
            <div>
              <div className="font-semibold">Keep reviewing!</div>
              <div className="text-sm text-gray-600">You've written 8 reviews this month. 2 more to unlock the "Review Champion" badge!</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-2xl">🍕</div>
            <div>
              <div className="font-semibold">Try something new!</div>
              <div className="text-sm text-gray-600">You haven't ordered from Spice Kitchen in 3 weeks. Check out their new menu!</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsTab;
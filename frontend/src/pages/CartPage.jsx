import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ArrowRight, Store, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF9F5] font-body flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-28 h-28 bg-orange-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-5xl">
            🛒
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-sm font-medium mb-8">Add some delicious food to get started!</p>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/menu")}
            className="px-8 py-4 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-200 flex items-center gap-2 mx-auto"
          >
            <ShoppingBag size={16} /> Browse Menu
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F5] font-body py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-orange-500 to-rose-500 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold mb-1">Your Cart 🛒</h1>
              <p className="opacity-90 text-sm font-medium">
                {cart.length} item{cart.length !== 1 ? "s" : ""} ready to order
              </p>
            </div>
            <button
              onClick={clearCart}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl transition-all border border-white/20 backdrop-blur-sm"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </motion.div>

        {/* Items */}
        <div className="bg-white rounded-[3rem] shadow-xl shadow-orange-100/40 border border-orange-50 overflow-hidden">
          <AnimatePresence>
            {cart.map((item, i) => (
              <motion.div
                key={item.foodItem._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-4 px-8 py-5 border-b border-gray-50 last:border-0 group"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-orange-50 flex-shrink-0">
                  {item.image ? (
                    <img
                      src={
                        item.image.startsWith('http')
                          ? item.image
                          : `http://localhost:5001/uploads/${item.image}`
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xl">🍽️</div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900 text-sm uppercase tracking-tight leading-tight truncate">{item.name}</p>
                  <p className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-1 mt-0.5">
                    <Store size={11} /> {item.canteen?.name || "Main Canteen"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.foodItem._id, item.quantity - 1)}
                    className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-orange-100 hover:text-primary flex items-center justify-center transition-all"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-sm font-black text-gray-800">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.foodItem._id, item.quantity + 1)}
                    className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-orange-100 hover:text-primary flex items-center justify-center transition-all"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <p className="font-black text-primary text-sm border-2 border-orange-200 px-3 py-1 rounded-xl whitespace-nowrap">
                  Rs.{(item.price * item.quantity).toFixed(2)}
                </p>

                <button
                  onClick={() => removeFromCart(item.foodItem._id)}
                  className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={15} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[3rem] shadow-xl shadow-orange-100/40 border border-orange-50 p-8"
        >
          <h3 className="font-display text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm font-medium text-gray-500">
              <span>Subtotal</span>
              <span className="text-gray-800 font-bold">Rs. {cartTotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-gray-900 border-t-2 border-dashed border-gray-100 pt-3">
              <span>Total</span>
              <span className="text-primary">Rs. {cartTotal?.toFixed(2)}</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/checkout")}
            className="w-full py-4 bg-primary hover:bg-primary-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2 transition-all"
          >
            Proceed to Checkout <ArrowRight size={16} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/menu")}
            className="w-full py-4 mt-3 bg-white border-2 border-primary text-primary hover:bg-orange-50 font-black text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            Back to Menu
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
};

export default CartPage;
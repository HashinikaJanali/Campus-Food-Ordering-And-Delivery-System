import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, RotateCcw, ShoppingBag } from "lucide-react";

// Navigate here with: navigate("/order-success", { state: { order } })

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;

  const details = [
    { label: "Order ID", value: order?._id || "Order #" + Math.floor(100000 + Math.random() * 900000) },
    { label: "Date", value: order?.createdAt ? new Date(order.createdAt).toLocaleString() : null },
    { label: "Pickup", value: order?.deliveryInfo?.pickupLocation },
    { label: "Time", value: order?.deliveryInfo?.pickupTime },
  ].filter((d) => d.value);

  return (
    <div className="min-h-screen bg-[#FFF9F5] font-body flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] shadow-xl shadow-orange-100/60 border border-orange-50 p-10 text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 250, delay: 0.1 }}
            className="w-24 h-24 bg-green-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 size={44} className="text-success" />
          </motion.div>

          <div className="inline-flex items-center gap-2 bg-green-50 text-success border border-green-200 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-4">
            🎉 Order Confirmed
          </div>

          <h1 className="font-display text-3xl font-bold text-gray-900 tracking-tight mb-2">
            Thanks for ordering!
          </h1>
          <p className="text-gray-500 text-sm font-medium mb-8">
            We&apos;ve received your order and it&apos;s being prepared.
          </p>

          {order && (
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 text-left mb-8 space-y-2.5">
              {details.map((d, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">{d.label}</span>
                  <span className="font-black text-gray-900">{d.value}</span>
                </div>
              ))}
              {order.total && (
                <div className="flex justify-between text-sm border-t-2 border-dashed border-gray-200 pt-2.5 mt-1">
                  <span className="font-black text-gray-700">Total Paid</span>
                  <span className="font-black text-primary text-base">Rs. {order.total?.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/")}
              className="w-full py-4 bg-primary hover:bg-primary-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2 transition-all"
            >
              <ShoppingBag size={16} /> Back to Menu
            </motion.button>
            <button
              onClick={() => navigate("/order-history")}
              className="w-full py-3.5 border-2 border-gray-200 hover:border-primary/30 text-gray-600 hover:text-primary font-black text-sm rounded-2xl flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw size={15} /> View Order History
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
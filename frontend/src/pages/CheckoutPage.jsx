import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Phone, FileText, ChevronRight, CheckCircle2, Home, ArrowLeft, CreditCard, Lock, Check, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const STEPS = [
  { label: "Pickup Info", icon: MapPin },
  { label: "Review Order", icon: FileText },
  { label: "Payment", icon: CreditCard },
  { label: "Confirmed", icon: CheckCircle2 },
];

const DELIVERY_CHARGE = 200; // Rs. 200 for off-campus delivery

// Helper functions for card validation
const getCardType = (cardNumber) => {
  const num = cardNumber.replace(/\s/g, "");
  const patterns = {
    visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
    mastercard: /^5[1-5][0-9]{14}$/,
    amex: /^3[47][0-9]{13}$/,
    discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
  };
  
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(num)) return type.charAt(0).toUpperCase() + type.slice(1);
  }
  return null;
};

const validateCardNumber = (cardNumber) => {
  const num = cardNumber.replace(/\s/g, "");
  if (!/^\d+$/.test(num) || num.length < 13) return false;
  
  // Luhn algorithm
  let sum = 0, isEven = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num[i], 10);
    if (isEven) digit *= 2;
    if (digit > 9) digit -= 9;
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
};

const validateExpiryDate = (expiryDate) => {
  if (!expiryDate || expiryDate.length !== 5) return null; // null = invalid format
  
  const [month, year] = expiryDate.split("/");
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  
  // Check month validity
  if (monthNum < 1 || monthNum > 12) return false;
  
  // Check year (assume 2000s if YY < 50, otherwise 1900s)
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  const fullYear = yearNum > 50 ? 1900 + yearNum : 2000 + yearNum;
  const currentFullYear = new Date().getFullYear();
  
  if (fullYear < currentFullYear) return false;
  if (fullYear === currentFullYear && monthNum < currentMonth) return false;
  
  return true;
};

const getExpiryStatus = (expiryDate) => {
  const isValid = validateExpiryDate(expiryDate);
  if (isValid === null) return "invalid"; // Invalid format
  return isValid ? "valid" : "expired";
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const { admin } = useAuth();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [placedOrder, setPlacedOrder] = useState(null);
  const [addressType, setAddressType] = useState(""); // "" | "on-campus" | "off-campus"
  const [deliveryInfo, setDeliveryInfo] = useState({
    onCampusLocation: "",
    boardingName: "",
    street: "",
    area: "",
    phoneNumber: "",
    landmark: "",
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const handleChange = (e) => setDeliveryInfo({ ...deliveryInfo, [e.target.name]: e.target.value });

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "cardNumber") {
      // Format card number with spaces every 4 digits
      const formatted = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
      setPaymentInfo({ ...paymentInfo, [name]: formatted.slice(0, 19) });
    } else if (name === "expiryDate") {
      // Format expiry date (MM/YY)
      const formatted = value.replace(/\D/g, "").slice(0, 4);
      if (formatted.length >= 2) {
        setPaymentInfo({ ...paymentInfo, [name]: `${formatted.slice(0, 2)}/${formatted.slice(2, 4)}` });
      } else {
        setPaymentInfo({ ...paymentInfo, [name]: formatted });
      }
    } else if (name === "cvv") {
      // Only numeric, max 4 digits
      setPaymentInfo({ ...paymentInfo, [name]: value.replace(/\D/g, "").slice(0, 4) });
    } else {
      setPaymentInfo({ ...paymentInfo, [name]: value });
    }
  };

  const handleProcessPayment = async () => {
    setLoading(true);
    setError("");
    try {
      // Validate payment info
      if (!paymentInfo.cardNumber || !paymentInfo.cardName || !paymentInfo.expiryDate || !paymentInfo.cvv) {
        throw new Error("Please fill in all payment details");
      }

      // Step 1: Create payment intent on backend
      const paymentIntentResponse = await fetch("http://localhost:5001/api/payments/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalTotal,
          currency: "inr",
          email: admin?.email || "user@example.com",
          cartItems: cart,
          deliveryInfo,
          addressType,
        }),
      });

      if (!paymentIntentResponse.ok) {
        const errorData = await paymentIntentResponse.json();
        throw new Error(errorData.message || "Failed to create payment intent");
      }

      const paymentIntentData = await paymentIntentResponse.json();
      const paymentIntentId = paymentIntentData.paymentIntentId;

      // Step 2: Simulate card charge (In production, use Stripe Elements for safe tokenization)
      // For testing, we'll directly confirm the payment
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Confirm payment on backend
      const confirmResponse = await fetch("http://localhost:5001/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId,
          cart,
          deliveryInfo,
          addressType,
          cartTotal,
          deliveryCharge,
        }),
      });

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json();
        throw new Error(errorData.message || "Payment confirmation failed");
      }

      const orderData = await confirmResponse.json();
      const simpleOrderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
      
      setPlacedOrder({
        _id: simpleOrderId,
        _dbId: orderData.order._id,
        createdAt: orderData.order.createdAt || new Date().toISOString(),
        items: cart,
        subtotal: cartTotal,
        deliveryCharge: deliveryCharge,
        total: finalTotal,
        deliveryInfo,
        addressType,
        paymentMethod: "Credit Card",
        paymentStatus: "Completed",
      });
      
      clearCart();
      setStep(3);
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate delivery charge
  const deliveryCharge = addressType === "off-campus" ? DELIVERY_CHARGE : 0;
  const finalTotal = cartTotal + deliveryCharge;

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError("");
    try {
      // Replace with: await api.post('/orders', { items: cart, deliveryInfo })
      const fakeOrder = {
        _id: "ORD-" + Math.floor(100000 + Math.random() * 900000),
        createdAt: new Date().toISOString(),
        items: cart,
        subtotal: cartTotal,
        deliveryCharge: deliveryCharge,
        total: finalTotal,
        deliveryInfo,
        addressType,
      };
      setPlacedOrder(fakeOrder);
      clearCart();
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const StepBar = () => (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const done = i < step;
        const active = i === step;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                done ? "bg-success text-white shadow-lg shadow-green-100"
                : active ? "bg-primary text-white shadow-lg shadow-orange-200 ring-4 ring-orange-100"
                : "bg-gray-100 text-gray-400"
              }`}>
                {done ? <CheckCircle2 size={18} /> : <Icon size={18} />}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wide ${
                active ? "text-primary" : done ? "text-success" : "text-gray-400"
              }`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-20 h-0.5 mx-3 mb-5 rounded-full transition-all ${i < step ? "bg-success" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  // STEP 0 — Pickup Info
  if (step === 0) return (
    <div className="min-h-screen bg-[#FFF9F5] font-body py-10 px-4">
      <div className="max-w-lg mx-auto">
        <StepBar />
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] shadow-xl shadow-orange-100/40 border border-orange-50 p-10"
        >
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Pickup Information</h2>
          
          {/* Address Type Selection */}
          <div className="mb-8">
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 px-1">Select pickup type</label>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => { setAddressType("on-campus"); setDeliveryInfo({ ...deliveryInfo, boardingName: "", street: "", area: "", phoneNumber: "", landmark: "" }); }}
                className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all border-2 ${
                  addressType === "on-campus"
                    ? "bg-primary text-white border-primary shadow-lg shadow-orange-200"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:border-primary"
                }`}
              >
                📍 On-Campus
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => { setAddressType("off-campus"); setDeliveryInfo({ ...deliveryInfo, onCampusLocation: "" }); }}
                className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all border-2 ${
                  addressType === "off-campus"
                    ? "bg-primary text-white border-primary shadow-lg shadow-orange-200"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:border-primary"
                }`}
              >
                🏠 Off-Campus
              </motion.button>
            </div>
          </div>

          <div className="space-y-5">
            {/* On-Campus Message */}
            {addressType === "on-campus" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center"
              >
                <div className="text-3xl mb-3">🏫</div>
                <p className="text-sm font-black text-gray-900 uppercase tracking-widest mb-2">Pick up from Campus Canteen</p>
                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  Your order will be ready for pickup at the main campus canteen.
                </p>
              </motion.div>
            )}

            {/* Off-Campus Details */}
            {addressType === "off-campus" && (
              <>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 px-1">Boarding / House Name</label>
                  <div className="relative">
                    <Home size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text" name="boardingName" value={deliveryInfo.boardingName} onChange={handleChange} required placeholder="E.g., Bright Hostel, Galaxy PG"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 px-1">Street / Lane</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text" name="street" value={deliveryInfo.street} onChange={handleChange} required placeholder="E.g., Main Street, Colony Road"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 px-1">Area (near campus)</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text" name="area" value={deliveryInfo.area} onChange={handleChange} required placeholder="E.g., Near University Gate"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 px-1">Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel" name="phoneNumber" value={deliveryInfo.phoneNumber} onChange={handleChange} required placeholder="E.g., +91 9876543210"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 px-1">Landmark (optional)</label>
                  <div className="relative">
                    <FileText size={16} className="absolute left-4 top-4 text-gray-400" />
                    <textarea
                      name="landmark" value={deliveryInfo.landmark} onChange={handleChange}
                      rows={2} placeholder="E.g., Near Food City, opposite gym"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between mt-8 gap-3">
            <button
              onClick={() => navigate("/cart")}
              className="flex items-center gap-2 px-5 py-3.5 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-black text-sm rounded-2xl transition-all"
            >
              <ArrowLeft size={15} /> Cart
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setStep(1)} 
              disabled={
                !addressType ||
                (addressType === "off-campus" && (!deliveryInfo.boardingName || !deliveryInfo.street || !deliveryInfo.area || !deliveryInfo.phoneNumber))
              }
              className="flex-1 py-3.5 bg-primary hover:bg-primary-500 disabled:opacity-50 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2 transition-all"
            >
              Review Order <ChevronRight size={16} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );

  // STEP 1 — Review Order
  if (step === 1) return (
    <div className="min-h-screen bg-[#FFF9F5] font-body py-10 px-4">
      <div className="max-w-lg mx-auto">
        <StepBar />
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] shadow-xl shadow-orange-100/40 border border-orange-50 p-10"
        >
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Review Your Order</h2>

          <div className="divide-y divide-gray-50 mb-6">
            {cart.map((item) => (
              <div key={item.id || item._id} className="flex items-center gap-3 py-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0">
                  {item.image
                    ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-gray-900 uppercase tracking-tight truncate">{item.name}</p>
                  <p className="text-[10px] text-primary font-black uppercase tracking-widest">×{item.quantity}</p>
                </div>
                <p className="text-sm font-black text-gray-800">Rs. {(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 mb-6 text-sm space-y-1.5">
            <div className="flex items-center gap-2 font-black text-primary text-[10px] uppercase tracking-widest mb-2">
              <MapPin size={12} /> Pickup Details
            </div>
            {addressType === "on-campus" && (
              <p className="text-gray-700 font-medium"><span className="font-black text-gray-900">Type:</span> Pickup from Campus Canteen</p>
            )}
            {addressType === "off-campus" && (
              <>
                <p className="text-gray-700 font-medium"><span className="font-black text-gray-900">Type:</span> Off-Campus Delivery</p>
                <p className="text-gray-700 font-medium"><span className="font-black text-gray-900">Boarding:</span> {deliveryInfo.boardingName}</p>
                <p className="text-gray-700 font-medium"><span className="font-black text-gray-900">Street:</span> {deliveryInfo.street}</p>
                <p className="text-gray-700 font-medium"><span className="font-black text-gray-900">Area:</span> {deliveryInfo.area}</p>
                <p className="text-gray-700 font-medium"><span className="font-black text-gray-900">Phone:</span> {deliveryInfo.phoneNumber}</p>
                {deliveryInfo.landmark && <p className="text-gray-700 font-medium"><span className="font-black text-gray-900">Landmark:</span> {deliveryInfo.landmark}</p>}
              </>
            )}
          </div>

          <div className="flex justify-between font-black text-gray-900 text-base border-t-2 border-dashed border-gray-100 pt-4 mb-6 space-y-2">
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold text-gray-800">Rs. {cartTotal?.toFixed(2)}</span>
              </div>
              {deliveryCharge > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Charge</span>
                  <span className="font-bold text-primary">Rs. {deliveryCharge.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-dashed border-gray-100">
                <span>Total</span>
                <span className="text-primary">Rs. {finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-2xl px-4 py-3 mb-4">{error}</div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep(0)}
              className="flex items-center gap-2 px-5 py-3.5 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-black text-sm rounded-2xl transition-all"
            >
              <ArrowLeft size={15} /> Back
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setStep(2)} disabled={loading}
              className="flex-1 py-3.5 bg-primary hover:bg-primary-500 disabled:opacity-60 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? "Processing..." : `Proceed to Payment · Rs. ${finalTotal.toFixed(2)}`}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );

  // STEP 2 — Payment
  if (step === 2) return (
    <div className="min-h-screen bg-[#FFF9F5] font-body py-10 px-4">
      <div className="max-w-lg mx-auto">
        <StepBar />
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] shadow-xl shadow-orange-100/40 border border-orange-50 p-10"
        >
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <Lock size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700 font-medium">
                Secure payment powered by Stripe. Your card details are encrypted and secure.
              </p>
            </div>
          </div>

          <div className="space-y-5 mb-6">
            {/* Card Holder Name */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 px-1">Cardholder Name</label>
              <input
                type="text"
                name="cardName"
                value={paymentInfo.cardName}
                onChange={handlePaymentChange}
                placeholder="John Doe"
                required
                className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all"
              />
            </div>

            {/* Card Number */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 px-1">Card Number</label>
              <div className="relative">
                <CreditCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="cardNumber"
                  value={paymentInfo.cardNumber}
                  onChange={handlePaymentChange}
                  placeholder="4242 4242 4242 4242"
                  required
                  maxLength="19"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all tracking-wider"
                />
              </div>
              
              {/* Card Validation Badges */}
              {paymentInfo.cardNumber.replace(/\s/g, "").length >= 13 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {getCardType(paymentInfo.cardNumber) && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-[11px] font-black text-blue-700 uppercase tracking-widest"
                    >
                      <CreditCard size={12} />
                      {getCardType(paymentInfo.cardNumber)}
                    </motion.div>
                  )}
                  {validateCardNumber(paymentInfo.cardNumber) ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-[11px] font-black text-green-700 uppercase tracking-widest"
                    >
                      <Check size={12} />
                      Valid
                    </motion.div>
                  ) : (
                    paymentInfo.cardNumber.replace(/\s/g, "").length === 16 && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full text-[11px] font-black text-red-700 uppercase tracking-widest"
                      >
                        <X size={12} />
                        Invalid
                      </motion.div>
                    )
                  )}
                </div>
              )}
              
              <p className="text-[10px] text-gray-500 mt-2 px-1">Test card: 4242 4242 4242 4242</p>
            </div>

            <div className="flex gap-4">
              {/* Expiry Date */}
              <div className="flex-1">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 px-1">Expiry Date</label>
                <input
                  type="text"
                  name="expiryDate"
                  value={paymentInfo.expiryDate}
                  onChange={handlePaymentChange}
                  placeholder="MM/YY"
                  required
                  maxLength="5"
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all"
                />
                
                {/* Expiry Date Validation Badge */}
                {paymentInfo.expiryDate.length === 5 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest mt-2 ${
                      getExpiryStatus(paymentInfo.expiryDate) === "valid"
                        ? "bg-green-50 border border-green-200 text-green-700"
                        : "bg-red-50 border border-red-200 text-red-700"
                    }`}
                  >
                    {getExpiryStatus(paymentInfo.expiryDate) === "valid" ? (
                      <>
                        <Check size={12} />
                        Valid
                      </>
                    ) : (
                      <>
                        <X size={12} />
                        {getExpiryStatus(paymentInfo.expiryDate) === "expired" ? "Expired" : "Invalid"}
                      </>
                    )}
                  </motion.div>
                )}
              </div>

              {/* CVV */}
              <div className="flex-1">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 px-1">CVV</label>
                <input
                  type="text"
                  name="cvv"
                  value={paymentInfo.cvv}
                  onChange={handlePaymentChange}
                  placeholder="123"
                  required
                  maxLength="4"
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
            <div className="flex justify-between mb-2 text-xs text-gray-600">
              <span>Subtotal</span>
              <span className="font-bold text-gray-800">Rs. {cartTotal?.toFixed(2)}</span>
            </div>
            {deliveryCharge > 0 && (
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                <span>Delivery Charge</span>
                <span className="font-bold text-primary">Rs. {deliveryCharge.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-gray-900 pt-2 border-t border-dashed border-gray-200">
              <span>Total Amount</span>
              <span className="text-primary text-lg">Rs. {finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-2xl px-4 py-3 mb-4">{error}</div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-5 py-3.5 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-black text-sm rounded-2xl transition-all"
            >
              <ArrowLeft size={15} /> Back
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleProcessPayment}
              disabled={loading || !paymentInfo.cardNumber || !paymentInfo.cardName || !paymentInfo.expiryDate || !paymentInfo.cvv}
              className="flex-1 py-3.5 bg-primary hover:bg-primary-500 disabled:opacity-50 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? "Processing Payment..." : `Pay Rs. ${finalTotal.toFixed(2)}`}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );

  // STEP 3 — Confirmed
  return (
    <div className="min-h-screen bg-[#FFF9F5] font-body flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <StepBar />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[3rem] shadow-xl shadow-orange-100/40 border border-orange-50 p-10 text-center"
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 bg-green-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-4xl"
          >
            ✅
          </motion.div>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
          <p className="text-gray-500 text-sm font-medium mb-6">
            Your order <span className="font-black text-gray-800">{placedOrder?._id}</span> has been received.
          </p>
          <div className="bg-gray-50 rounded-2xl p-5 text-left text-sm mb-8 space-y-2 border border-gray-100">
            {placedOrder?.addressType === "on-campus" ? (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500 font-medium">Type</span>
                  <span className="font-black text-gray-900">🏫 Pickup from Canteen</span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500 font-medium">Type</span>
                  <span className="font-black text-gray-900">🚚 Off-Campus Delivery</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Boarding</span>
                  <span className="font-black text-gray-900">{placedOrder?.deliveryInfo?.boardingName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Street</span>
                  <span className="font-black text-gray-900">{placedOrder?.deliveryInfo?.street}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Area</span>
                  <span className="font-black text-gray-900">{placedOrder?.deliveryInfo?.area}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Phone</span>
                  <span className="font-black text-gray-900">{placedOrder?.deliveryInfo?.phoneNumber}</span>
                </div>
                {placedOrder?.deliveryInfo?.landmark && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Landmark</span>
                    <span className="font-black text-gray-900">{placedOrder.deliveryInfo.landmark}</span>
                  </div>
                )}
              </>
            )}
            <div className="border-t border-dashed border-gray-200 pt-2 space-y-1 mt-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold">Rs. {placedOrder?.subtotal?.toFixed(2)}</span>
              </div>
              {placedOrder?.deliveryCharge > 0 && (
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Delivery Charge</span>
                  <span className="font-bold text-primary">Rs. {placedOrder?.deliveryCharge?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-gray-700 text-sm">
                <span>Total</span>
                <span className="text-primary">Rs. {placedOrder?.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/track")}
              className="flex-1 py-3.5 border-2 border-primary hover:border-primary text-primary font-black text-sm rounded-2xl transition-all">
              Track Order
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/")}
              className="flex-1 py-3.5 bg-primary hover:bg-primary-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-200 transition-all"
            >
              Back to Menu
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutPage;
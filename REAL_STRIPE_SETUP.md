# 🔧 Real Stripe Integration - Setup Instructions

## ✅ What Was Done

Your payment system is now **fully integrated with Stripe**! Here's what's been set up:

### Backend (✅ Ready)
- ✅ `paymentController.js` - Handles real Stripe payments
- ✅ `paymentRoutes.js` - Payment API endpoints
- ✅ `app.js` - Payment routes registered
- ✅ `stripe` package installed
- ✅ `STRIPE_SECRET_KEY` in `.env` file

### Frontend (⚠️ Needs Frontend Key)
- ✅ `CheckoutPage.jsx` updated to call real backend payment endpoints
- ⏳ **NEEDS**: Stripe Public Key in `frontend/.env.local`

---

## 📍 WHERE TO ADD YOUR KEYS

### Step 1: Get Your Stripe Keys from Dashboard

**Go to:** https://dashboard.stripe.com/apikeys

You'll see:
- **Publishable Key** (starts with `pk_test_` or `pk_live_`)
- **Secret Key** (starts with `sk_test_` or `sk_live_`)

### Step 2: Add Public Key to Frontend

**File:** `/frontend/.env.local`

Add or update this line:
```
VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_ACTUAL_PUBLIC_KEY_HERE
```

Example:
```
VITE_STRIPE_PUBLIC_KEY=pk_test_51Ky2LkA1B2C3D4E5F6G7H8I9J0K1L2M3
```

### Step 3: Verify Backend Secret Key

**File:** `/Backend/.env`

The backend `.env` already has `STRIPE_SECRET_KEY`. Verify it's present:
```bash
grep STRIPE_SECRET_KEY /Backend/.env
```

Should output something like:
```
STRIPE_SECRET_KEY=sk_test_51TEVaUEsTtn7lJWMxp8...
```

---

## 🧪 Test Cards

Use these card numbers to test payments:

| Card Type | Number | Expiry | CVC |
|-----------|--------|--------|-----|
| Visa | `4242 4242 4242 4242` | Any future (e.g., 12/25) | Any 3 digits |
| Mastercard | `5555 5555 5555 4444` | Any future | Any 3 digits |

---

## 🚀 Next Steps

1. **Add your Stripe Public Key** to `/frontend/.env.local`
2. **Restart backend**: `cd Backend && node app.js`
3. **Restart frontend**: `cd frontend && npm run dev`
4. **Test the payment flow**:
   - Add items to cart
   - Click checkout
   - Fill delivery info
   - Go to payment step
   - Enter test card: `4242 4242 4242 4242`
   - Complete payment
5. **Check Stripe Dashboard**: https://dashboard.stripe.com/payments
   - You should see the transaction listed there!

---

## 📊 Current Payment Flow

```
User fills card details
        ↓
"Pay Rs. XXX" button clicked
        ↓
Backend: Create Payment Intent with Stripe ✅
        ↓
Backend: Confirm Payment ✅
        ↓
Backend: Create Order in Database ✅
        ↓
Frontend: Show Order Confirmation ✅
        ↓
Stripe Dashboard: Transaction appears ✅
```

---

## 🔍 Common Issues & Solutions

### ❌ "Stripe Secret Key not configured on server"
- Copy your `STRIPE_SECRET_KEY` value from your Stripe dashboard
- Add it to `/Backend/.env`
- Restart backend server

### ❌ Payment fails with no error in dashboard
- Check if `VITE_STRIPE_PUBLIC_KEY` is set in `/frontend/.env.local`
- Restart frontend: `npm run dev`
- Open browser console (F12) for detailed errors

### ❌ No transactions appearing in Stripe dashboard
- Make sure you're using **test mode keys** (starts with `pk_test_` / `sk_test_`)
- Verify both frontend and backend have keys configured
- Check browser console and backend logs for errors

---

## 📁 Files Modified/Created

| File | Purpose |
|------|---------|
| `/Backend/Controllers/paymentController.js` | Payment processing logic (NEW) |
| `/Backend/Routes/paymentRoutes.js` | Payment API routes (NEW) |
| `/Backend/app.js` | Added payment routes |
| `/frontend/src/pages/CheckoutPage.jsx` | Updated to call real Stripe API |
| `/Backend/.env` | Already has STRIPE_SECRET_KEY |
| `/frontend/.env.local` | Add your public key |

---

## ✅ API Endpoints Now Available

### Create Payment Intent
```
POST /api/payments/create-payment-intent
Body: {
  amount: number,
  currency: "inr",
  email: string,
  items: array,
  deliveryInfo: object,
  addressType: string
}
```

### Confirm Payment
```
POST /api/payments/confirm
Body: {
  paymentIntentId: string,
  cart: array,
  deliveryInfo: object,
  addressType: string,
  cartTotal: number,
  deliveryCharge: number
}
```

### Get Payment Details
```
GET /api/payments/:paymentIntentId
```

---

## 🎯 Summary

Your system is now ready for **real Stripe payments**. All you need to do is:

1. Add your Stripe Public Key to `/frontend/.env.local`
2. Restart servers
3. Test with card: `4242 4242 4242 4242`
4. Check Stripe Dashboard for transactions

That's it! Every payment will now appear in your Stripe dashboard.

# Stripe Payment Integration Setup Guide

## 1. Get Your Stripe Keys

### Step 1: Create a Stripe Account
- Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
- Sign up or log in to your Stripe account

### Step 2: Find Your API Keys
- Navigate to **Developers** → **API Keys** in the Stripe dashboard
- Find your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
- Find your **Secret Key** (starts with `sk_test_` or `sk_live_`)

### Test Card Numbers
For development (test mode), use these test card numbers:
- **Visa**: `4242 4242 4242 4242`
- **Mastercard**: `5555 5555 5555 4444`
- Any future expiry date (e.g., 12/25)
- Any 3-digit CVC (e.g., 123)

---

## 2. Configure Frontend (.env.local)

### Location
```
/frontend/.env.local
```

### Add Your Stripe Public Key
Replace `pk_test_ADD_YOUR_STRIPE_PUBLIC_KEY_HERE` with your actual Stripe **Publishable Key**:

```
VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_ACTUAL_PUBLIC_KEY_HERE
```

Example:
```
VITE_STRIPE_PUBLIC_KEY=pk_test_51Ky2LkA1B2C3D4E5F6G7H8I9J0K1L2M3
```

---

## 3. Configure Backend (.env or existing config)

### Location
```
/Backend/.env  (add to your existing .env file)
```

### Add Your Stripe Secret Key
Add this variable to your existing `.env` file:

```
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY_HERE
```

Example:
```
STRIPE_SECRET_KEY=sk_test_51Ky2LkA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7
```

⚠️ **IMPORTANT**: Never commit your `.env` file or secret keys to version control!

---

## 4. Install Required Packages

### Frontend
Run this command in the `/frontend` directory:

```bash
npm install @stripe/react-stripe-js @stripe/js
```

### Backend (if integrating Stripe payment processing)
Run this command in the `/Backend` directory:

```bash
npm install stripe
```

---

## 5. Update CheckoutPage.jsx (Optional - for real Stripe integration)

The current implementation in `CheckoutPage.jsx` has a placeholder for Stripe integration. 

Currently at line ~60 in the `handleProcessPayment` function:
```javascript
// TODO: Replace with real Stripe API call
// For now, we'll simulate a successful payment
await new Promise(resolve => setTimeout(resolve, 1500));
```

To integrate real Stripe payment processing:
1. Initialize Stripe elements using `@stripe/react-stripe-js`
2. Create a payment intent on the backend
3. Call Stripe's `confirmCardPayment()` method
4. Send confirmation to backend for order creation

---

## 6. Verify Configuration

1. Restart your frontend server:
   ```bash
   npm run dev
   ```

2. Open the browser console and check for any Stripe configuration errors

3. Test the checkout flow with the test card number: `4242 4242 4242 4242`

---

## Key Locations for Stripe Configuration

| File | Purpose | What to Add |
|------|---------|-----------|
| `/frontend/.env.local` | Frontend Stripe key | `VITE_STRIPE_PUBLIC_KEY` |
| `/Backend/.env` | Backend Stripe key | `STRIPE_SECRET_KEY` |
| `/frontend/src/config/stripeConfig.js` | Stripe config export | Auto-loads from .env.local |
| `/frontend/src/pages/CheckoutPage.jsx` | Payment form | Already implemented! |

---

## Files Modified/Created

✅ **CheckoutPage.jsx** - Added Payment step with card form
✅ **.env.local** - Stores your Stripe keys (frontend)
✅ **.env.example** - Template for reference
✅ **stripeConfig.js** - Configuration loader
✅ **Backend/.env.stripe** - Template for backend keys

---

## Testing

1. Fill in delivery information
2. Review your order
3. Click "Proceed to Payment"
4. Enter test card: `4242 4242 4242 4242`
5. Any future expiry date and CVC
6. Click "Pay"
7. You should see order confirmation

---

## Troubleshooting

### Error: "Stripe public key is not configured"
- ✅ Check `.env.local` exists in `/frontend` directory
- ✅ Restart the dev server after adding `.env.local`
- ✅ Use correct format: `VITE_` prefix for Vite env variables

### Payment form not showing
- ✅ Check browser console for errors
- ✅ Verify CheckoutPage.jsx has no syntax errors
- ✅ Restart frontend server: `npm run dev`

### Test cards not working
- ✅ Use test mode keys (starts with `pk_test_` / `sk_test_`)
- ✅ Use proper test card numbers from Stripe docs
- ✅ Any 3+ digit CVC and future date will work

---

## Next Steps

1. ✅ Add your Stripe Public Key to `/frontend/.env.local`
2. ✅ Add your Stripe Secret Key to `/Backend/.env`
3. ✅ Install Stripe packages: `npm install @stripe/react-stripe-js @stripe/js`
4. ✅ Restart both frontend and backend servers
5. ✅ Test with card: `4242 4242 4242 4242`

---

For more Stripe documentation, visit: https://stripe.com/docs

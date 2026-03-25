// Stripe Configuration
// This file exports the Stripe public key loaded from environment variables

export const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  console.error(
    "Stripe public key is not configured. Please add VITE_STRIPE_PUBLIC_KEY to your .env.local file"
  );
}

export const STRIPE_CONFIG = {
  publicKey: stripePublicKey,
  // Add other Stripe configurations here
};

export default STRIPE_CONFIG;

import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export { stripePromise };

export const STRIPE_PLANS = {
  pro: {
    id: 'price_pro_monthly',
    name: 'Pro',
    price: 49,
    currency: 'RON',
    interval: 'month',
    features: [
      '20 planuri de marketing pe lună',
      '100 conținuturi generate',
      'Analiză avansată a vocii brandului',
      'Suport prioritar',
      'Export în multiple formate'
    ]
  },
  premium: {
    id: 'price_premium_monthly',
    name: 'Premium',
    price: 99,
    currency: 'RON',
    interval: 'month',
    features: [
      '50 planuri de marketing pe lună',
      '250 conținuturi generate',
      'Analiză AI avansată',
      'Integrări cu platforme sociale',
      'Suport dedicat',
      'Funcții beta exclusive'
    ]
  }
} as const;

export type StripePlan = keyof typeof STRIPE_PLANS;
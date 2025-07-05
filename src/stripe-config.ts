export const STRIPE_PRODUCTS = {
  basic: {
    id: 'prod_STe3c7OWS5LDyK',
    priceId: 'price_1RYglnAQ5UIM4NTryLd6kjMP',
    name: 'Basic',
    description: 'Pachet automator basic',
    price: 29.00,
    currency: 'EUR',
    mode: 'subscription' as const,
    features: [
      '10 planuri de marketing pe lună',
      '50 conținuturi generate',
      'Definirea vocii brandului',
      'Suport email',
      'Analiză de bază'
    ]
  },
  pro: {
    id: 'prod_STe5QnDmGyqRmq',
    priceId: 'price_1RYgnmAQ5UIM4NTrOnMTgtkt',
    name: 'Pro',
    description: 'Pachet Automator Pro',
    price: 49.00,
    currency: 'EUR',
    mode: 'subscription' as const,
    features: [
      '25 planuri de marketing pe lună',
      '150 conținuturi generate',
      'Analiză avansată a vocii brandului',
      'Suport prioritar',
      'Export în multiple formate',
      'Integrări cu platforme sociale'
    ]
  },
  enterprise: {
    id: 'prod_STe4BWFGQAiJnx',
    priceId: 'price_1RYgmfAQ5UIM4NTrRcwYb4NW',
    name: 'Enterprise',
    description: 'Pachet Automator Enterprise',
    price: 89.00,
    currency: 'EUR',
    mode: 'subscription' as const,
    features: [
      '100 planuri de marketing pe lună',
      '500 conținuturi generate',
      'Analiză AI avansată',
      'Integrări cu toate platformele',
      'Suport dedicat 24/7',
      'Funcții beta exclusive',
      'API access',
      'White-label options'
    ]
  }
} as const;

export type StripeProduct = keyof typeof STRIPE_PRODUCTS;

export const getProductByPriceId = (priceId: string) => {
  return Object.values(STRIPE_PRODUCTS).find(product => product.priceId === priceId);
};

export const getProductById = (productId: string) => {
  return Object.values(STRIPE_PRODUCTS).find(product => product.id === productId);
};
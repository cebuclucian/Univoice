import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getProductByPriceId } from '../stripe-config';

interface SubscriptionData {
  customer_id: string;
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (fetchError) throw fetchError;

      setSubscription(data);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError('Nu am putut încărca informațiile despre abonament');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const getCurrentPlan = () => {
    if (!subscription || !subscription.price_id) {
      return 'free';
    }

    const product = getProductByPriceId(subscription.price_id);
    if (!product) {
      return 'free';
    }

    // Map product names to plan keys
    switch (product.name.toLowerCase()) {
      case 'basic':
        return 'basic';
      case 'pro':
        return 'pro';
      case 'enterprise':
        return 'enterprise';
      default:
        return 'free';
    }
  };

  const isActive = () => {
    return subscription?.subscription_status === 'active';
  };

  const isTrialing = () => {
    return subscription?.subscription_status === 'trialing';
  };

  const isCanceled = () => {
    return subscription?.subscription_status === 'canceled';
  };

  const willCancelAtPeriodEnd = () => {
    return subscription?.cancel_at_period_end === true;
  };

  const getCurrentPeriodEnd = () => {
    if (!subscription?.current_period_end) return null;
    return new Date(subscription.current_period_end * 1000);
  };

  const getCurrentPeriodStart = () => {
    if (!subscription?.current_period_start) return null;
    return new Date(subscription.current_period_start * 1000);
  };

  const getPaymentMethod = () => {
    if (!subscription?.payment_method_brand || !subscription?.payment_method_last4) {
      return null;
    }

    return {
      brand: subscription.payment_method_brand,
      last4: subscription.payment_method_last4
    };
  };

  return {
    subscription,
    loading,
    error,
    refetch: fetchSubscription,
    getCurrentPlan,
    isActive,
    isTrialing,
    isCanceled,
    willCancelAtPeriodEnd,
    getCurrentPeriodEnd,
    getCurrentPeriodStart,
    getPaymentMethod
  };
};
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface UserStats {
  total_plans: number;
  plans_this_month: number;
  content_this_month: number;
  plan_limit: number;
  content_limit: number;
  subscription_plan: string;
}

export const useUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase
        .rpc('get_user_stats', { user_id: user.id });

      if (rpcError) throw rpcError;

      if (data && data.length > 0) {
        setStats({
          total_plans: parseInt(data[0].total_plans) || 0,
          plans_this_month: data[0].plans_this_month || 0,
          content_this_month: data[0].content_this_month || 0,
          plan_limit: data[0].plan_limit || 5,
          content_limit: data[0].content_limit || 50,
          subscription_plan: data[0].subscription_plan || 'free'
        });
      } else {
        // Fallback pentru utilizatori noi
        setStats({
          total_plans: 0,
          plans_this_month: 0,
          content_this_month: 0,
          plan_limit: 5,
          content_limit: 50,
          subscription_plan: 'free'
        });
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
      setError('Nu am putut încărca statisticile utilizatorului');
      
      // Fallback stats
      setStats({
        total_plans: 0,
        plans_this_month: 0,
        content_this_month: 0,
        plan_limit: 5,
        content_limit: 50,
        subscription_plan: 'free'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkLimit = async (type: 'plans' | 'content'): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('check_user_limits', { 
          user_id: user.id, 
          check_type: type 
        });

      if (error) throw error;
      return data || false;
    } catch (err) {
      console.error('Error checking limits:', err);
      return false;
    }
  };

  const incrementPlansCounter = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .rpc('increment_plans_generated', { user_id: user.id });

      if (error) throw error;
      
      // Refresh stats after increment
      await fetchStats();
      return true;
    } catch (err) {
      console.error('Error incrementing plans counter:', err);
      return false;
    }
  };

  const incrementContentCounter = async (amount: number = 1): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .rpc('increment_content_generated', { 
          user_id: user.id, 
          amount 
        });

      if (error) throw error;
      
      // Refresh stats after increment
      await fetchStats();
      return true;
    } catch (err) {
      console.error('Error incrementing content counter:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
    checkLimit,
    incrementPlansCounter,
    incrementContentCounter
  };
};
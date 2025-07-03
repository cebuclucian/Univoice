/*
  # Update subscription limits and add admin privileges

  1. Updates
    - Update plan limits to match new pricing structure
    - Add admin role privileges with unlimited access
    - Ensure admin@univoice.ro has unlimited access

  2. New Functions
    - Updated get_user_stats function with new limits and admin privileges
    - Admin privilege checking functions
*/

-- Update the get_user_stats function with new limits and admin privileges
CREATE OR REPLACE FUNCTION public.get_user_stats(user_id uuid)
RETURNS TABLE(
    total_plans bigint,
    plans_this_month integer,
    content_this_month integer,
    plan_limit integer,
    content_limit integer,
    subscription_plan text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_subscription RECORD;
    user_profile RECORD;
    is_admin boolean := false;
BEGIN
    -- Check if user is admin
    SELECT * INTO user_profile
    FROM public.user_profiles up
    JOIN auth.users au ON up.id = au.id
    WHERE up.id = user_id;

    -- Check if user is admin by email or role
    IF user_profile IS NOT NULL THEN
        SELECT 
            (user_profile.role = 'admin' OR 
             EXISTS (
                SELECT 1 FROM auth.users 
                WHERE id = user_id AND email = 'admin@univoice.ro'
             ))
        INTO is_admin;
    END IF;

    -- Get subscription with plan limits in one query
    SELECT 
        s.plan,
        s.status,
        s.plans_generated_this_month,
        s.content_generated_this_month,
        CASE 
            WHEN is_admin THEN -1  -- Unlimited for admin
            WHEN COALESCE(s.plan, 'free') = 'pro' THEN 20
            WHEN COALESCE(s.plan, 'free') = 'premium' THEN 50
            ELSE 5
        END as plan_limit,
        CASE 
            WHEN is_admin THEN -1  -- Unlimited for admin
            WHEN COALESCE(s.plan, 'free') = 'pro' THEN 100
            WHEN COALESCE(s.plan, 'free') = 'premium' THEN 250
            ELSE 50
        END as content_limit
    INTO user_subscription
    FROM public.subscriptions s
    WHERE s.id = user_id;

    -- If no subscription exists, create one with defaults
    IF user_subscription IS NULL THEN
        INSERT INTO public.subscriptions (id, plan, status, plans_generated_this_month, content_generated_this_month)
        VALUES (user_id, 'free', 'active', 0, 0)
        ON CONFLICT (id) DO NOTHING;
        
        -- Set default values
        user_subscription.plan := 'free';
        user_subscription.plans_generated_this_month := 0;
        user_subscription.content_generated_this_month := 0;
        user_subscription.plan_limit := CASE WHEN is_admin THEN -1 ELSE 5 END;
        user_subscription.content_limit := CASE WHEN is_admin THEN -1 ELSE 50 END;
    END IF;

    RETURN QUERY
    SELECT
        (SELECT COUNT(*)::bigint FROM public.marketing_plans mp WHERE mp.user_id = get_user_stats.user_id) AS total_plans,
        COALESCE(user_subscription.plans_generated_this_month, 0) AS plans_this_month,
        COALESCE(user_subscription.content_generated_this_month, 0) AS content_this_month,
        user_subscription.plan_limit,
        user_subscription.content_limit,
        COALESCE(user_subscription.plan, 'free') AS subscription_plan;
END;
$$;

-- Update the check_user_limits function to handle admin privileges
CREATE OR REPLACE FUNCTION public.check_user_limits(user_id uuid, check_type text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_stats RECORD;
    is_admin boolean := false;
    has_capacity boolean := false;
BEGIN
    -- Check if user is admin
    SELECT 
        (up.role = 'admin' OR 
         EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = user_id AND email = 'admin@univoice.ro'
         ))
    INTO is_admin
    FROM public.user_profiles up
    WHERE up.id = user_id;

    -- Admin has unlimited access
    IF is_admin THEN
        RETURN true;
    END IF;

    -- Get current user stats
    SELECT * INTO user_stats
    FROM public.get_user_stats(check_user_limits.user_id);

    IF check_type = 'plans' THEN
        -- -1 means unlimited
        has_capacity := user_stats.plan_limit = -1 OR user_stats.plans_this_month < user_stats.plan_limit;
    ELSIF check_type = 'content' THEN
        -- -1 means unlimited
        has_capacity := user_stats.content_limit = -1 OR user_stats.content_this_month < user_stats.content_limit;
    END IF;

    RETURN has_capacity;
END;
$$;

-- Update the get_subscription_details function with new limits
CREATE OR REPLACE FUNCTION get_subscription_details(p_user_id uuid)
RETURNS TABLE(
  user_id uuid,
  plan text,
  status text,
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean,
  plans_generated_this_month integer,
  content_generated_this_month integer,
  plan_limit integer,
  content_limit integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_admin boolean := false;
BEGIN
    -- Check if user is admin
    SELECT 
        (up.role = 'admin' OR 
         EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = p_user_id AND email = 'admin@univoice.ro'
         ))
    INTO is_admin
    FROM public.user_profiles up
    WHERE up.id = p_user_id;

    RETURN QUERY
    SELECT 
        s.id as user_id,
        COALESCE(s.plan, 'free') as plan,
        s.status,
        s.stripe_customer_id,
        s.stripe_subscription_id,
        s.current_period_start,
        s.current_period_end,
        COALESCE(s.cancel_at_period_end, false) as cancel_at_period_end,
        COALESCE(s.plans_generated_this_month, 0) as plans_generated_this_month,
        COALESCE(s.content_generated_this_month, 0) as content_generated_this_month,
        CASE 
            WHEN is_admin THEN -1  -- Unlimited for admin
            WHEN COALESCE(s.plan, 'free') = 'pro' THEN 20
            WHEN COALESCE(s.plan, 'free') = 'premium' THEN 50
            ELSE 5
        END as plan_limit,
        CASE 
            WHEN is_admin THEN -1  -- Unlimited for admin
            WHEN COALESCE(s.plan, 'free') = 'pro' THEN 100
            WHEN COALESCE(s.plan, 'free') = 'premium' THEN 250
            ELSE 50
        END as content_limit
    FROM subscriptions s
    WHERE s.id = p_user_id;
    
    -- If no subscription exists, return default values
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            p_user_id,
            'free'::text as plan,
            'active'::text as status,
            NULL::text as stripe_customer_id,
            NULL::text as stripe_subscription_id,
            NULL::timestamptz as current_period_start,
            NULL::timestamptz as current_period_end,
            false as cancel_at_period_end,
            0 as plans_generated_this_month,
            0 as content_generated_this_month,
            CASE WHEN is_admin THEN -1 ELSE 5 END as plan_limit,
            CASE WHEN is_admin THEN -1 ELSE 50 END as content_limit;
    END IF;
END;
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_admin boolean := false;
BEGIN
    SELECT 
        (up.role = 'admin' OR 
         EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = user_id AND email = 'admin@univoice.ro'
         ))
    INTO is_admin
    FROM public.user_profiles up
    WHERE up.id = user_id;

    RETURN COALESCE(is_admin, false);
END;
$$;

-- Ensure admin@univoice.ro has admin role if the user exists
DO $$
BEGIN
    -- Update user profile to admin role if admin@univoice.ro exists
    UPDATE public.user_profiles 
    SET role = 'admin'
    WHERE id IN (
        SELECT id FROM auth.users WHERE email = 'admin@univoice.ro'
    );
    
    -- If the update affected rows, log it
    IF FOUND THEN
        RAISE NOTICE 'Updated admin@univoice.ro to admin role';
    END IF;
END $$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_user_admin(uuid) TO authenticated;

-- Update Stripe webhook function to handle new plan mapping
CREATE OR REPLACE FUNCTION update_subscription_from_stripe(
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_plan text,
  p_status text,
  p_current_period_start timestamptz DEFAULT NULL,
  p_current_period_end timestamptz DEFAULT NULL,
  p_cancel_at_period_end boolean DEFAULT false
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE subscriptions
  SET 
    stripe_subscription_id = p_stripe_subscription_id,
    plan = p_plan,
    status = p_status,
    current_period_start = COALESCE(p_current_period_start, current_period_start),
    current_period_end = COALESCE(p_current_period_end, current_period_end),
    cancel_at_period_end = p_cancel_at_period_end,
    updated_at = now()
  WHERE stripe_customer_id = p_stripe_customer_id;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count > 0;
END;
$$;

-- Add helpful comments
COMMENT ON FUNCTION public.is_user_admin IS 'Checks if user has admin privileges (role=admin or email=admin@univoice.ro)';
COMMENT ON FUNCTION public.get_user_stats IS 'Returns user statistics with admin unlimited access (-1 for unlimited)';
COMMENT ON FUNCTION public.check_user_limits IS 'Checks user limits with admin bypass (admin always returns true)';
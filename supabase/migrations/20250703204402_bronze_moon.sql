/*
  # Update subscription plans and admin privileges

  1. New Plan Limits
    - Free: 5 marketing plans, 50 content pieces per month
    - Pro: 20 marketing plans, 100 content pieces per month (49 RON/month)
    - Premium: 50 marketing plans, 250 content pieces per month (99 RON/month)
    - Admin: Unlimited access (-1 for all limits)

  2. Admin Privileges
    - admin@univoice.ro gets unlimited access
    - Users with role='admin' get unlimited access
    - Admin detection by email or role

  3. Database Updates
    - Add missing subscription columns
    - Update all functions with new limits
    - Ensure admin user has proper setup
*/

-- First, ensure we have the necessary columns in subscriptions table
DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE public.subscriptions ADD COLUMN stripe_subscription_id text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'current_period_start'
  ) THEN
    ALTER TABLE public.subscriptions ADD COLUMN current_period_start timestamptz;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'current_period_end'
  ) THEN
    ALTER TABLE public.subscriptions ADD COLUMN current_period_end timestamptz;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'cancel_at_period_end'
  ) THEN
    ALTER TABLE public.subscriptions ADD COLUMN cancel_at_period_end boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.subscriptions ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.subscriptions ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id 
ON public.subscriptions (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id 
ON public.subscriptions (stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_status_plan 
ON public.subscriptions (status, plan);

-- Add unique constraints if they don't exist
DO $$
BEGIN
  -- Add unique constraint for stripe_customer_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'subscriptions_stripe_customer_id_key'
  ) THEN
    ALTER TABLE public.subscriptions 
    ADD CONSTRAINT subscriptions_stripe_customer_id_key UNIQUE (stripe_customer_id);
  END IF;
  
  -- Add unique constraint for stripe_subscription_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'subscriptions_stripe_subscription_id_key'
  ) THEN
    ALTER TABLE public.subscriptions 
    ADD CONSTRAINT subscriptions_stripe_subscription_id_key UNIQUE (stripe_subscription_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    -- Constraints already exist, continue
    NULL;
END $$;

-- Drop existing functions to avoid parameter conflicts
DROP FUNCTION IF EXISTS public.is_user_admin(uuid);
DROP FUNCTION IF EXISTS public.get_user_stats(uuid);
DROP FUNCTION IF EXISTS public.check_user_limits(uuid, text);
DROP FUNCTION IF EXISTS public.get_subscription_details(uuid);
DROP FUNCTION IF EXISTS public.update_subscription_from_stripe(text, text, text, text, timestamptz, timestamptz, boolean);

-- Function to check if user is admin
CREATE FUNCTION public.is_user_admin(input_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_check boolean := false;
    user_email text;
    user_role text;
BEGIN
    -- Get user email and role in separate queries for reliability
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = input_user_id;
    
    SELECT role INTO user_role 
    FROM public.user_profiles 
    WHERE id = input_user_id;
    
    -- Check if admin by email or role
    admin_check := (user_email = 'admin@univoice.ro' OR user_role = 'admin');
    
    RETURN COALESCE(admin_check, false);
END;
$$;

-- Update get_user_stats function with new limits
CREATE FUNCTION public.get_user_stats(input_user_id uuid)
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
AS $$
DECLARE
    user_subscription RECORD;
    admin_status boolean := false;
    plan_limits_plans integer;
    plan_limits_content integer;
BEGIN
    -- Check admin status
    SELECT public.is_user_admin(input_user_id) INTO admin_status;
    
    -- Get subscription data
    SELECT 
        COALESCE(s.plan, 'free') as plan,
        COALESCE(s.plans_generated_this_month, 0) as plans_this_month,
        COALESCE(s.content_generated_this_month, 0) as content_this_month
    INTO user_subscription
    FROM public.subscriptions s
    WHERE s.id = input_user_id;

    -- If no subscription exists, create one
    IF user_subscription IS NULL THEN
        INSERT INTO public.subscriptions (id, plan, status, plans_generated_this_month, content_generated_this_month)
        VALUES (input_user_id, 'free', 'active', 0, 0)
        ON CONFLICT (id) DO NOTHING;
        
        user_subscription.plan := 'free';
        user_subscription.plans_this_month := 0;
        user_subscription.content_this_month := 0;
    END IF;

    -- Set plan limits based on admin status and plan
    IF admin_status THEN
        plan_limits_plans := -1;
        plan_limits_content := -1;
    ELSE
        CASE user_subscription.plan
            WHEN 'pro' THEN
                plan_limits_plans := 20;
                plan_limits_content := 100;
            WHEN 'premium' THEN
                plan_limits_plans := 50;
                plan_limits_content := 250;
            ELSE
                plan_limits_plans := 5;
                plan_limits_content := 50;
        END CASE;
    END IF;

    RETURN QUERY
    SELECT
        (SELECT COUNT(*)::bigint FROM public.marketing_plans mp WHERE mp.user_id = input_user_id) AS total_plans,
        user_subscription.plans_this_month AS plans_this_month,
        user_subscription.content_this_month AS content_this_month,
        plan_limits_plans AS plan_limit,
        plan_limits_content AS content_limit,
        user_subscription.plan AS subscription_plan;
END;
$$;

-- Update check_user_limits function
CREATE FUNCTION public.check_user_limits(input_user_id uuid, check_type text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_status boolean := false;
    user_stats RECORD;
    has_capacity boolean := false;
BEGIN
    -- Check admin status first
    SELECT public.is_user_admin(input_user_id) INTO admin_status;
    
    -- Admin has unlimited access
    IF admin_status THEN
        RETURN true;
    END IF;

    -- Get current user stats
    SELECT * INTO user_stats
    FROM public.get_user_stats(input_user_id);

    -- Check limits based on type
    IF check_type = 'plans' THEN
        has_capacity := (user_stats.plan_limit = -1 OR user_stats.plans_this_month < user_stats.plan_limit);
    ELSIF check_type = 'content' THEN
        has_capacity := (user_stats.content_limit = -1 OR user_stats.content_this_month < user_stats.content_limit);
    ELSE
        has_capacity := false;
    END IF;

    RETURN has_capacity;
END;
$$;

-- Function to get subscription details
CREATE FUNCTION public.get_subscription_details(input_user_id uuid)
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
    admin_status boolean := false;
    subscription_data RECORD;
    limits_plans integer;
    limits_content integer;
BEGIN
    -- Check admin status
    SELECT public.is_user_admin(input_user_id) INTO admin_status;
    
    -- Get subscription data
    SELECT 
        s.id,
        COALESCE(s.plan, 'free') as plan,
        s.status,
        s.stripe_customer_id,
        s.stripe_subscription_id,
        s.current_period_start,
        s.current_period_end,
        COALESCE(s.cancel_at_period_end, false) as cancel_at_period_end,
        COALESCE(s.plans_generated_this_month, 0) as plans_generated_this_month,
        COALESCE(s.content_generated_this_month, 0) as content_generated_this_month
    INTO subscription_data
    FROM public.subscriptions s
    WHERE s.id = input_user_id;

    -- Calculate limits
    IF admin_status THEN
        limits_plans := -1;
        limits_content := -1;
    ELSE
        CASE COALESCE(subscription_data.plan, 'free')
            WHEN 'pro' THEN
                limits_plans := 20;
                limits_content := 100;
            WHEN 'premium' THEN
                limits_plans := 50;
                limits_content := 250;
            ELSE
                limits_plans := 5;
                limits_content := 50;
        END CASE;
    END IF;

    -- Return data or defaults
    IF subscription_data IS NOT NULL THEN
        RETURN QUERY
        SELECT 
            subscription_data.id,
            subscription_data.plan,
            subscription_data.status,
            subscription_data.stripe_customer_id,
            subscription_data.stripe_subscription_id,
            subscription_data.current_period_start,
            subscription_data.current_period_end,
            subscription_data.cancel_at_period_end,
            subscription_data.plans_generated_this_month,
            subscription_data.content_generated_this_month,
            limits_plans,
            limits_content;
    ELSE
        RETURN QUERY
        SELECT 
            input_user_id,
            'free'::text,
            'active'::text,
            NULL::text,
            NULL::text,
            NULL::timestamptz,
            NULL::timestamptz,
            false,
            0,
            0,
            limits_plans,
            limits_content;
    END IF;
END;
$$;

-- Function to update subscription from Stripe
CREATE FUNCTION public.update_subscription_from_stripe(
  stripe_customer_id_param text,
  stripe_subscription_id_param text,
  plan_param text,
  status_param text,
  current_period_start_param timestamptz DEFAULT NULL,
  current_period_end_param timestamptz DEFAULT NULL,
  cancel_at_period_end_param boolean DEFAULT false
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE public.subscriptions
  SET 
    stripe_subscription_id = stripe_subscription_id_param,
    plan = plan_param,
    status = status_param,
    current_period_start = COALESCE(current_period_start_param, current_period_start),
    current_period_end = COALESCE(current_period_end_param, current_period_end),
    cancel_at_period_end = cancel_at_period_end_param,
    updated_at = now()
  WHERE stripe_customer_id = stripe_customer_id_param;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count > 0;
END;
$$;

-- Ensure admin@univoice.ro has admin role if the user exists
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@univoice.ro';
    
    -- Update role if user exists
    IF admin_user_id IS NOT NULL THEN
        UPDATE public.user_profiles 
        SET role = 'admin'
        WHERE id = admin_user_id;
        
        -- Ensure subscription exists
        INSERT INTO public.subscriptions (id, plan, status)
        VALUES (admin_user_id, 'premium', 'active')
        ON CONFLICT (id) DO UPDATE SET
            plan = 'premium',
            status = 'active';
    END IF;
END $$;

-- Add trigger for updated_at on subscriptions
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscriptions_updated_at'
  ) THEN
    CREATE TRIGGER update_subscriptions_updated_at
      BEFORE UPDATE ON public.subscriptions
      FOR EACH ROW EXECUTE FUNCTION update_subscriptions_updated_at();
  END IF;
END $$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.is_user_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_limits(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_subscription_details(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_subscription_from_stripe(text, text, text, text, timestamptz, timestamptz, boolean) TO service_role;

-- Add helpful comments
COMMENT ON FUNCTION public.is_user_admin IS 'Checks if user has admin privileges (role=admin or email=admin@univoice.ro)';
COMMENT ON FUNCTION public.get_user_stats IS 'Returns user statistics with admin unlimited access (-1 for unlimited)';
COMMENT ON FUNCTION public.check_user_limits IS 'Checks user limits with admin bypass (admin always returns true)';
COMMENT ON FUNCTION public.get_subscription_details IS 'Returns detailed subscription information with plan limits';
COMMENT ON FUNCTION public.update_subscription_from_stripe IS 'Updates subscription data from Stripe webhooks';
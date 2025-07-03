/*
  # Stripe Integration Migration

  1. Updates to subscriptions table
    - Add Stripe-specific columns for better integration
    - Add indexes for performance
    - Add constraints for data integrity

  2. New functions
    - Functions to handle subscription updates from Stripe webhooks
    - Functions to get subscription status and limits

  3. Security
    - RLS policies remain unchanged
    - Add service role access for webhook functions
*/

-- Add additional columns to subscriptions table for Stripe integration
DO $$
BEGIN
  -- Add stripe_subscription_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN stripe_subscription_id text UNIQUE;
  END IF;

  -- Add current_period_start column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'current_period_start'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN current_period_start timestamptz;
  END IF;

  -- Add current_period_end column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'current_period_end'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN current_period_end timestamptz;
  END IF;

  -- Add cancel_at_period_end column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'cancel_at_period_end'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end boolean DEFAULT false;
  END IF;

  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id 
ON subscriptions (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id 
ON subscriptions (stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_status_plan 
ON subscriptions (status, plan);

-- Add trigger for updated_at on subscriptions
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update subscription from Stripe webhook
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

-- Function to get subscription details with Stripe info
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
BEGIN
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
      WHEN COALESCE(s.plan, 'free') = 'pro' THEN 50
      WHEN COALESCE(s.plan, 'free') = 'premium' THEN 200
      ELSE 5
    END as plan_limit,
    CASE 
      WHEN COALESCE(s.plan, 'free') = 'pro' THEN 500
      WHEN COALESCE(s.plan, 'free') = 'premium' THEN 2000
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
      5 as plan_limit,
      50 as content_limit;
  END IF;
END;
$$;

-- Function to check if subscription is active and not expired
CREATE OR REPLACE FUNCTION is_subscription_active(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscription_record RECORD;
BEGIN
  SELECT * INTO subscription_record
  FROM subscriptions
  WHERE id = p_user_id;
  
  -- If no subscription record, user is on free plan (considered active)
  IF subscription_record IS NULL THEN
    RETURN true;
  END IF;
  
  -- Free plan is always active
  IF COALESCE(subscription_record.plan, 'free') = 'free' THEN
    RETURN true;
  END IF;
  
  -- Check if paid subscription is active and not expired
  IF subscription_record.status = 'active' AND 
     (subscription_record.current_period_end IS NULL OR 
      subscription_record.current_period_end > now()) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Grant execute permissions to authenticated users and service role
GRANT EXECUTE ON FUNCTION update_subscription_from_stripe(text, text, text, text, timestamptz, timestamptz, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION get_subscription_details(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_subscription_active(uuid) TO authenticated;

-- Create a function to handle subscription cancellation
CREATE OR REPLACE FUNCTION cancel_subscription(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE subscriptions
  SET 
    plan = 'free',
    status = 'canceled',
    stripe_subscription_id = NULL,
    current_period_start = NULL,
    current_period_end = NULL,
    cancel_at_period_end = false,
    updated_at = now()
  WHERE id = p_user_id;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION cancel_subscription(uuid) TO service_role;

-- Add some helpful comments
COMMENT ON FUNCTION update_subscription_from_stripe IS 'Updates subscription data from Stripe webhook events';
COMMENT ON FUNCTION get_subscription_details IS 'Returns comprehensive subscription details including limits';
COMMENT ON FUNCTION is_subscription_active IS 'Checks if user has an active subscription';
COMMENT ON FUNCTION cancel_subscription IS 'Cancels a subscription and reverts to free plan';
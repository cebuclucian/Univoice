/*
  # Fix Function Parameter Names

  1. Functions Updated
    - `increment_plans_generated` - Fixed parameter name from user_id to input_user_id
    - `increment_content_generated` - Fixed parameter name from user_id to input_user_id
    - All other related functions to ensure consistency

  2. Changes Made
    - Use CREATE OR REPLACE FUNCTION to safely update existing functions
    - Maintain all existing functionality while fixing parameter naming
    - Ensure all functions use consistent parameter naming convention

  3. Security
    - All functions maintain SECURITY DEFINER for proper access control
    - No changes to RLS policies or permissions
*/

-- Fix increment_plans_generated function with correct parameter name
CREATE OR REPLACE FUNCTION increment_plans_generated(input_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update subscription record
  INSERT INTO subscriptions (id, plans_generated_this_month)
  VALUES (input_user_id, 1)
  ON CONFLICT (id)
  DO UPDATE SET 
    plans_generated_this_month = COALESCE(subscriptions.plans_generated_this_month, 0) + 1;
END;
$$;

-- Fix increment_content_generated function with correct parameter name
CREATE OR REPLACE FUNCTION increment_content_generated(input_user_id uuid, amount integer DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update subscription record
  INSERT INTO subscriptions (id, content_generated_this_month)
  VALUES (input_user_id, amount)
  ON CONFLICT (id)
  DO UPDATE SET 
    content_generated_this_month = COALESCE(subscriptions.content_generated_this_month, 0) + amount;
END;
$$;

-- Ensure is_user_admin function is properly defined
CREATE OR REPLACE FUNCTION is_user_admin(input_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin by email or role
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = input_user_id 
    AND (
      email = 'admin@univoice.ro' 
      OR raw_user_meta_data->>'role' = 'admin'
    )
  ) OR EXISTS (
    SELECT 1 
    FROM user_profiles 
    WHERE id = input_user_id 
    AND role = 'admin'
  );
END;
$$;

-- Ensure get_user_stats function is properly defined
CREATE OR REPLACE FUNCTION get_user_stats(input_user_id uuid)
RETURNS TABLE (
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
  user_subscription_plan text;
  is_admin boolean;
BEGIN
  -- Check if user is admin
  SELECT is_user_admin(input_user_id) INTO is_admin;
  
  -- Get subscription plan
  SELECT COALESCE(s.plan, 'free') INTO user_subscription_plan
  FROM subscriptions s
  WHERE s.id = input_user_id;
  
  -- If no subscription record exists, default to free
  IF user_subscription_plan IS NULL THEN
    user_subscription_plan := 'free';
  END IF;

  RETURN QUERY
  SELECT 
    COALESCE((
      SELECT COUNT(*)::bigint 
      FROM marketing_plans mp 
      WHERE mp.user_id = input_user_id
    ), 0) as total_plans,
    
    COALESCE((
      SELECT s.plans_generated_this_month 
      FROM subscriptions s 
      WHERE s.id = input_user_id
    ), 0) as plans_this_month,
    
    COALESCE((
      SELECT s.content_generated_this_month 
      FROM subscriptions s 
      WHERE s.id = input_user_id
    ), 0) as content_this_month,
    
    -- Set limits based on plan and admin status
    CASE 
      WHEN is_admin THEN -1  -- Unlimited for admins
      WHEN user_subscription_plan = 'premium' THEN 50
      WHEN user_subscription_plan = 'pro' THEN 20
      ELSE 5  -- free plan
    END as plan_limit,
    
    CASE 
      WHEN is_admin THEN -1  -- Unlimited for admins
      WHEN user_subscription_plan = 'premium' THEN 250
      WHEN user_subscription_plan = 'pro' THEN 100
      ELSE 50  -- free plan
    END as content_limit,
    
    user_subscription_plan as subscription_plan;
END;
$$;

-- Ensure check_user_limits function is properly defined
CREATE OR REPLACE FUNCTION check_user_limits(input_user_id uuid, check_type text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_usage integer;
  user_limit integer;
  user_plan text;
  is_admin boolean;
BEGIN
  -- Check if user is admin
  SELECT is_user_admin(input_user_id) INTO is_admin;
  
  -- Admins have unlimited access
  IF is_admin THEN
    RETURN true;
  END IF;
  
  -- Get user's subscription plan
  SELECT COALESCE(s.plan, 'free') INTO user_plan
  FROM subscriptions s
  WHERE s.id = input_user_id;
  
  -- If no subscription record exists, default to free
  IF user_plan IS NULL THEN
    user_plan := 'free';
  END IF;
  
  -- Check based on type
  IF check_type = 'plans' THEN
    -- Get current plans usage
    SELECT COALESCE(s.plans_generated_this_month, 0) INTO current_usage
    FROM subscriptions s
    WHERE s.id = input_user_id;
    
    -- Set limit based on plan
    CASE user_plan
      WHEN 'premium' THEN user_limit := 50;
      WHEN 'pro' THEN user_limit := 20;
      ELSE user_limit := 5; -- free plan
    END CASE;
    
  ELSIF check_type = 'content' THEN
    -- Get current content usage
    SELECT COALESCE(s.content_generated_this_month, 0) INTO current_usage
    FROM subscriptions s
    WHERE s.id = input_user_id;
    
    -- Set limit based on plan
    CASE user_plan
      WHEN 'premium' THEN user_limit := 250;
      WHEN 'pro' THEN user_limit := 100;
      ELSE user_limit := 50; -- free plan
    END CASE;
    
  ELSE
    -- Invalid check type
    RETURN false;
  END IF;
  
  -- Return true if under limit, false if at or over limit
  RETURN current_usage < user_limit;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION is_user_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_limits(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_plans_generated(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_content_generated(uuid, integer) TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION increment_plans_generated IS 'Increments the monthly plans counter for a user';
COMMENT ON FUNCTION increment_content_generated IS 'Increments the monthly content counter for a user';
COMMENT ON FUNCTION is_user_admin IS 'Checks if user has admin privileges';
COMMENT ON FUNCTION get_user_stats IS 'Returns user statistics with plan limits';
COMMENT ON FUNCTION check_user_limits IS 'Checks if user is within their plan limits';
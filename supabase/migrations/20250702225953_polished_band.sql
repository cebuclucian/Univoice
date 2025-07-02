/*
  # User Statistics Functions

  1. Functions
    - `get_user_stats(user_id)` - Returns comprehensive user statistics
    - `check_user_limits(user_id, check_type)` - Checks monthly limits
    - `increment_plans_generated(user_id)` - Increments plans counter
    - `increment_content_generated(user_id, amount)` - Increments content counter

  2. Security
    - Functions use SECURITY DEFINER for proper access
    - Grant execute permissions to authenticated users
*/

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.get_user_stats(uuid);
DROP FUNCTION IF EXISTS public.check_user_limits(uuid, text);
DROP FUNCTION IF EXISTS public.increment_plans_generated(uuid);
DROP FUNCTION IF EXISTS public.increment_content_generated(uuid, integer);
DROP FUNCTION IF EXISTS public.increment_content_generated(uuid);

-- Function to get comprehensive user statistics
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
AS $$
DECLARE
    current_month_start timestamptz;
    user_subscription RECORD;
BEGIN
    -- Calculate the start of the current month in UTC
    current_month_start := date_trunc('month', now() AT TIME ZONE 'UTC');

    -- Get or create subscription record
    SELECT * INTO user_subscription
    FROM public.subscriptions s
    WHERE s.id = user_id;

    -- If no subscription exists, create one with defaults
    IF user_subscription IS NULL THEN
        INSERT INTO public.subscriptions (id, plan, status, plans_generated_this_month, content_generated_this_month)
        VALUES (user_id, 'free', 'active', 0, 0)
        ON CONFLICT (id) DO NOTHING;
        
        -- Fetch the newly created or existing record
        SELECT * INTO user_subscription
        FROM public.subscriptions s
        WHERE s.id = user_id;
    END IF;

    RETURN QUERY
    SELECT
        (SELECT COUNT(*)::bigint FROM public.marketing_plans mp WHERE mp.user_id = get_user_stats.user_id) AS total_plans,
        COALESCE(user_subscription.plans_generated_this_month, 0) AS plans_this_month,
        COALESCE(user_subscription.content_generated_this_month, 0) AS content_this_month,
        CASE 
            WHEN COALESCE(user_subscription.plan, 'free') = 'pro' THEN 50
            WHEN COALESCE(user_subscription.plan, 'free') = 'premium' THEN 200
            ELSE 5
        END AS plan_limit,
        CASE 
            WHEN COALESCE(user_subscription.plan, 'free') = 'pro' THEN 500
            WHEN COALESCE(user_subscription.plan, 'free') = 'premium' THEN 2000
            ELSE 50
        END AS content_limit,
        COALESCE(user_subscription.plan, 'free') AS subscription_plan;
END;
$$;

-- Function to check if user has reached their limits
CREATE OR REPLACE FUNCTION public.check_user_limits(user_id uuid, check_type text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_stats RECORD;
    has_capacity boolean := false;
BEGIN
    -- Get current user stats
    SELECT * INTO user_stats
    FROM public.get_user_stats(check_user_limits.user_id);

    IF check_type = 'plans' THEN
        has_capacity := user_stats.plans_this_month < user_stats.plan_limit;
    ELSIF check_type = 'content' THEN
        has_capacity := user_stats.content_this_month < user_stats.content_limit;
    END IF;

    RETURN has_capacity;
END;
$$;

-- Function to increment plans generated counter
CREATE OR REPLACE FUNCTION public.increment_plans_generated(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert or update subscription record
    INSERT INTO public.subscriptions (id, plan, status, plans_generated_this_month, content_generated_this_month)
    VALUES (user_id, 'free', 'active', 1, 0)
    ON CONFLICT (id) 
    DO UPDATE SET 
        plans_generated_this_month = subscriptions.plans_generated_this_month + 1;
END;
$$;

-- Function to increment content generated counter
CREATE OR REPLACE FUNCTION public.increment_content_generated(user_id uuid, amount integer DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert or update subscription record
    INSERT INTO public.subscriptions (id, plan, status, plans_generated_this_month, content_generated_this_month)
    VALUES (user_id, 'free', 'active', 0, amount)
    ON CONFLICT (id) 
    DO UPDATE SET 
        content_generated_this_month = subscriptions.content_generated_this_month + amount;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_limits(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_plans_generated(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_content_generated(uuid, integer) TO authenticated;
-- Performance optimization for database queries
-- Create additional indexes for better query performance

-- Index for marketing plans with brand voice details
CREATE INDEX IF NOT EXISTS idx_marketing_plans_details_gin 
ON public.marketing_plans USING GIN (details);

-- Index for user profiles with role filtering
CREATE INDEX IF NOT EXISTS idx_user_profiles_role 
ON public.user_profiles (role) WHERE role != 'user';

-- Index for notifications with type and read status
CREATE INDEX IF NOT EXISTS idx_notifications_type_read 
ON public.notifications (type, is_read, created_at DESC);

-- Index for brand profiles with updated_at for cache invalidation
CREATE INDEX IF NOT EXISTS idx_brand_profiles_updated 
ON public.brand_profiles (user_id, updated_at DESC);

-- Index for subscriptions with plan type
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan 
ON public.subscriptions (plan, status);

-- Optimize the get_user_stats function for better performance
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
    plan_limits RECORD;
BEGIN
    -- Get subscription with plan limits in one query
    SELECT 
        s.plan,
        s.status,
        s.plans_generated_this_month,
        s.content_generated_this_month,
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
        user_subscription.plan_limit := 5;
        user_subscription.content_limit := 50;
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

-- Optimize brand voice history function
CREATE OR REPLACE FUNCTION get_brand_voice_history(user_id uuid)
RETURNS TABLE (
  plan_id uuid,
  plan_title text,
  created_at timestamptz,
  brand_voice_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate input
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'user_id cannot be null';
  END IF;

  RETURN QUERY
  SELECT 
    mp.id as plan_id,
    mp.title as plan_title,
    mp.created_at,
    COALESCE(
      CASE 
        WHEN mp.details ? 'brand_voice_used' THEN mp.details->'brand_voice_used'
        ELSE jsonb_build_object(
          'personality', COALESCE(bp.personality_traits, '[]'::text[]),
          'tone', COALESCE(bp.communication_tones, '[]'::text[]),
          'brand_name', COALESCE(bp.brand_name, ''),
          'brand_description', COALESCE(bp.brand_description, ''),
          'timestamp', mp.created_at::text,
          'brand_profile_updated_at', COALESCE(bp.updated_at, mp.created_at)::text
        )
      END,
      '{}'::jsonb
    ) as brand_voice_data
  FROM marketing_plans mp
  LEFT JOIN brand_profiles bp ON mp.brand_profile_id = bp.id
  WHERE mp.user_id = get_brand_voice_history.user_id
    AND COALESCE(mp.status, 'active') = 'active'
  ORDER BY mp.created_at DESC
  LIMIT 50; -- Limit for performance
END;
$$;

-- Create a materialized view for dashboard statistics (if needed for heavy queries)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.user_dashboard_stats AS
SELECT 
    u.id as user_id,
    COUNT(mp.id) as total_plans,
    COUNT(CASE WHEN mp.created_at >= date_trunc('month', now()) THEN 1 END) as plans_this_month,
    COUNT(CASE WHEN mp.status = 'active' THEN 1 END) as active_plans,
    COUNT(CASE WHEN mp.status = 'draft' THEN 1 END) as draft_plans,
    MAX(mp.created_at) as last_plan_created,
    COUNT(DISTINCT mp.brand_profile_id) as unique_brand_profiles
FROM auth.users u
LEFT JOIN public.marketing_plans mp ON u.id = mp.user_id
GROUP BY u.id;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_dashboard_stats_user_id 
ON public.user_dashboard_stats (user_id);

-- Function to refresh dashboard stats
CREATE OR REPLACE FUNCTION public.refresh_dashboard_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_dashboard_stats;
END;
$$;

-- Create a function to get cached dashboard stats
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(user_id uuid)
RETURNS TABLE(
    total_plans bigint,
    plans_this_month bigint,
    active_plans bigint,
    draft_plans bigint,
    last_plan_created timestamptz,
    unique_brand_profiles bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(uds.total_plans, 0)::bigint,
        COALESCE(uds.plans_this_month, 0)::bigint,
        COALESCE(uds.active_plans, 0)::bigint,
        COALESCE(uds.draft_plans, 0)::bigint,
        uds.last_plan_created,
        COALESCE(uds.unique_brand_profiles, 0)::bigint
    FROM public.user_dashboard_stats uds
    WHERE uds.user_id = get_dashboard_stats.user_id;
    
    -- If no data found, return zeros
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 0::bigint, 0::bigint, 0::bigint, 0::bigint, NULL::timestamptz, 0::bigint;
    END IF;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.refresh_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats(uuid) TO authenticated;
GRANT SELECT ON public.user_dashboard_stats TO authenticated;

-- Set up automatic refresh of materialized view (every hour)
-- This would typically be done with pg_cron extension in production
-- For now, we'll create a trigger to refresh on plan changes

CREATE OR REPLACE FUNCTION public.trigger_refresh_dashboard_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Refresh the materialized view asynchronously
    PERFORM pg_notify('refresh_dashboard_stats', NEW.user_id::text);
    RETURN NEW;
END;
$$;

-- Create trigger for automatic refresh
DROP TRIGGER IF EXISTS refresh_dashboard_stats_trigger ON public.marketing_plans;
CREATE TRIGGER refresh_dashboard_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.marketing_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_refresh_dashboard_stats();

-- Optimize notification queries
CREATE OR REPLACE FUNCTION public.get_user_notifications(
    p_user_id uuid,
    p_limit integer DEFAULT 20,
    p_offset integer DEFAULT 0,
    p_unread_only boolean DEFAULT false
)
RETURNS TABLE(
    id uuid,
    type text,
    title text,
    message text,
    action_label text,
    action_url text,
    is_read boolean,
    created_at timestamptz,
    metadata jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.type,
        n.title,
        n.message,
        n.action_label,
        n.action_url,
        n.is_read,
        n.created_at,
        n.metadata
    FROM public.notifications n
    WHERE n.user_id = p_user_id
      AND (NOT p_unread_only OR n.is_read = false)
      AND (n.expires_at IS NULL OR n.expires_at > now())
    ORDER BY n.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_notifications(uuid, integer, integer, boolean) TO authenticated;

-- Add query performance monitoring
CREATE TABLE IF NOT EXISTS public.query_performance_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    function_name text NOT NULL,
    execution_time_ms numeric NOT NULL,
    parameters jsonb,
    executed_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES auth.users(id)
);

-- Enable RLS on performance log
ALTER TABLE public.query_performance_log ENABLE ROW LEVEL SECURITY;

-- Create policy for performance log
CREATE POLICY "Users can view their own performance logs"
    ON public.query_performance_log
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Function to log query performance
CREATE OR REPLACE FUNCTION public.log_query_performance(
    p_function_name text,
    p_execution_time_ms numeric,
    p_parameters jsonb DEFAULT NULL,
    p_user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.query_performance_log (
        function_name,
        execution_time_ms,
        parameters,
        user_id
    ) VALUES (
        p_function_name,
        p_execution_time_ms,
        p_parameters,
        COALESCE(p_user_id, auth.uid())
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_query_performance(text, numeric, jsonb, uuid) TO authenticated;

-- Clean up old performance logs (keep only last 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_performance_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count integer;
BEGIN
    DELETE FROM public.query_performance_log
    WHERE executed_at < now() - interval '7 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cleanup_performance_logs() TO authenticated;
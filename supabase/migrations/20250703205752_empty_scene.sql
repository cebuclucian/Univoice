/*
  # Corectare funcție get_user_stats

  1. Problema
    - Funcția get_user_stats este apelată cu parametrul 'user_id', dar este definită cu 'input_user_id'
    - Acest lucru cauzează eroarea: "Could not find the function public.get_user_stats(user_id) in the schema cache"

  2. Soluție
    - Recreăm funcția cu parametrul corect 'user_id' pentru compatibilitate cu codul frontend
    - Păstrăm aceeași logică și funcționalitate
*/

-- Drop funcția existentă pentru a o recrea cu parametrul corect
DROP FUNCTION IF EXISTS public.get_user_stats(uuid);

-- Recreăm funcția cu parametrul 'user_id' în loc de 'input_user_id'
CREATE FUNCTION public.get_user_stats(user_id uuid)
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
    SELECT public.is_user_admin(user_id) INTO admin_status;
    
    -- Get subscription data
    SELECT 
        COALESCE(s.plan, 'free') as plan,
        COALESCE(s.plans_generated_this_month, 0) as plans_this_month,
        COALESCE(s.content_generated_this_month, 0) as content_this_month
    INTO user_subscription
    FROM public.subscriptions s
    WHERE s.id = user_id;

    -- If no subscription exists, create one
    IF user_subscription IS NULL THEN
        INSERT INTO public.subscriptions (id, plan, status, plans_generated_this_month, content_generated_this_month)
        VALUES (user_id, 'free', 'active', 0, 0)
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
        (SELECT COUNT(*)::bigint FROM public.marketing_plans mp WHERE mp.user_id = get_user_stats.user_id) AS total_plans,
        user_subscription.plans_this_month AS plans_this_month,
        user_subscription.content_this_month AS content_this_month,
        plan_limits_plans AS plan_limit,
        plan_limits_content AS content_limit,
        user_subscription.plan AS subscription_plan;
END;
$$;

-- Acordăm permisiuni de execuție utilizatorilor autentificați
GRANT EXECUTE ON FUNCTION public.get_user_stats(uuid) TO authenticated;

-- Adăugăm un comentariu util
COMMENT ON FUNCTION public.get_user_stats IS 'Returnează statisticile utilizatorului, inclusiv limitele planului și utilizarea curentă';

-- Actualizăm și funcția check_user_limits pentru a folosi parametrul corect
DROP FUNCTION IF EXISTS public.check_user_limits(uuid, text);

CREATE FUNCTION public.check_user_limits(user_id uuid, check_type text)
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
    SELECT public.is_user_admin(user_id) INTO admin_status;
    
    -- Admin has unlimited access
    IF admin_status THEN
        RETURN true;
    END IF;

    -- Get current user stats
    SELECT * INTO user_stats
    FROM public.get_user_stats(user_id);

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

-- Acordăm permisiuni de execuție
GRANT EXECUTE ON FUNCTION public.check_user_limits(uuid, text) TO authenticated;

-- Adăugăm un comentariu util
COMMENT ON FUNCTION public.check_user_limits IS 'Verifică dacă utilizatorul a atins limitele planului său';
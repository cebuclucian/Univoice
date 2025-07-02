/*
  # Adăugare funcții RPC pentru contoare și tracking

  1. Funcții RPC
    - `increment_plans_generated` - incrementează contorul de planuri generate
    - `get_user_stats` - returnează statistici utilizator
    - `track_brand_voice_usage` - urmărește utilizarea vocii brandului

  2. Îmbunătățiri
    - Adăugare index-uri pentru performanță
    - Funcții helper pentru statistici
*/

-- Funcție pentru incrementarea contorului de planuri generate
CREATE OR REPLACE FUNCTION increment_plans_generated(user_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO subscriptions (id, plans_generated_this_month)
  VALUES (user_id, 1)
  ON CONFLICT (id)
  DO UPDATE SET plans_generated_this_month = subscriptions.plans_generated_this_month + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcție pentru incrementarea contorului de conținut generat
CREATE OR REPLACE FUNCTION increment_content_generated(user_id uuid, amount integer DEFAULT 1)
RETURNS void AS $$
BEGIN
  INSERT INTO subscriptions (id, content_generated_this_month)
  VALUES (user_id, amount)
  ON CONFLICT (id)
  DO UPDATE SET content_generated_this_month = subscriptions.content_generated_this_month + amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcție pentru obținerea statisticilor utilizatorului
CREATE OR REPLACE FUNCTION get_user_stats(user_id uuid)
RETURNS TABLE(
  total_plans bigint,
  plans_this_month integer,
  content_this_month integer,
  plan_limit integer,
  content_limit integer,
  subscription_plan text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM marketing_plans WHERE marketing_plans.user_id = get_user_stats.user_id),
    COALESCE(s.plans_generated_this_month, 0),
    COALESCE(s.content_generated_this_month, 0),
    CASE 
      WHEN COALESCE(s.plan, 'free') = 'free' THEN 5
      WHEN COALESCE(s.plan, 'free') = 'pro' THEN 50
      ELSE -1
    END,
    CASE 
      WHEN COALESCE(s.plan, 'free') = 'free' THEN 50
      WHEN COALESCE(s.plan, 'free') = 'pro' THEN 500
      ELSE -1
    END,
    COALESCE(s.plan, 'free')
  FROM subscriptions s
  WHERE s.id = get_user_stats.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcție pentru resetarea contorilor lunari (va fi apelată lunar)
CREATE OR REPLACE FUNCTION reset_monthly_counters()
RETURNS void AS $$
BEGIN
  UPDATE subscriptions 
  SET 
    plans_generated_this_month = 0,
    content_generated_this_month = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcție pentru verificarea limitelor utilizatorului
CREATE OR REPLACE FUNCTION check_user_limits(user_id uuid, check_type text)
RETURNS boolean AS $$
DECLARE
  user_plan text;
  current_usage integer;
  plan_limit integer;
BEGIN
  SELECT plan INTO user_plan FROM subscriptions WHERE id = user_id;
  user_plan := COALESCE(user_plan, 'free');
  
  IF check_type = 'plans' THEN
    SELECT plans_generated_this_month INTO current_usage FROM subscriptions WHERE id = user_id;
    current_usage := COALESCE(current_usage, 0);
    
    plan_limit := CASE 
      WHEN user_plan = 'free' THEN 5
      WHEN user_plan = 'pro' THEN 50
      ELSE -1
    END;
    
  ELSIF check_type = 'content' THEN
    SELECT content_generated_this_month INTO current_usage FROM subscriptions WHERE id = user_id;
    current_usage := COALESCE(current_usage, 0);
    
    plan_limit := CASE 
      WHEN user_plan = 'free' THEN 50
      WHEN user_plan = 'pro' THEN 500
      ELSE -1
    END;
  ELSE
    RETURN false;
  END IF;
  
  -- -1 înseamnă unlimited
  IF plan_limit = -1 THEN
    RETURN true;
  END IF;
  
  RETURN current_usage < plan_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Adăugare index-uri pentru performanță
CREATE INDEX IF NOT EXISTS idx_marketing_plans_user_created 
ON marketing_plans(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketing_plans_brand_profile 
ON marketing_plans(brand_profile_id);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_unread 
ON ai_recommendations(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_scheduled 
ON scheduled_posts(user_id, scheduled_at);

-- Adăugare coloane pentru tracking îmbunătățit
DO $$
BEGIN
  -- Adaugă coloană pentru tracking-ul versiunii vocii brandului
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketing_plans' AND column_name = 'brand_voice_version'
  ) THEN
    ALTER TABLE marketing_plans ADD COLUMN brand_voice_version text;
  END IF;
  
  -- Adaugă coloană pentru tracking-ul tipului de plan
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketing_plans' AND column_name = 'plan_type'
  ) THEN
    ALTER TABLE marketing_plans ADD COLUMN plan_type text DEFAULT 'ai_generated';
  END IF;
  
  -- Adaugă coloană pentru status-ul planului
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketing_plans' AND column_name = 'status'
  ) THEN
    ALTER TABLE marketing_plans ADD COLUMN status text DEFAULT 'active';
  END IF;
END $$;

-- Funcție pentru tracking-ul utilizării vocii brandului
CREATE OR REPLACE FUNCTION track_brand_voice_usage(
  user_id uuid,
  brand_profile_id uuid,
  usage_type text,
  details jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
  INSERT INTO ai_recommendations (user_id, title, details, is_read)
  VALUES (
    user_id,
    'Brand Voice Usage Tracked',
    jsonb_build_object(
      'type', 'brand_voice_tracking',
      'brand_profile_id', brand_profile_id,
      'usage_type', usage_type,
      'timestamp', now(),
      'details', details
    ),
    true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pentru tracking automat al utilizării vocii brandului
CREATE OR REPLACE FUNCTION track_marketing_plan_brand_voice()
RETURNS TRIGGER AS $$
BEGIN
  -- Track când se creează un plan nou
  IF TG_OP = 'INSERT' THEN
    PERFORM track_brand_voice_usage(
      NEW.user_id,
      NEW.brand_profile_id,
      'marketing_plan_created',
      jsonb_build_object(
        'plan_id', NEW.id,
        'plan_title', NEW.title,
        'brand_voice_data', NEW.details->'brand_voice_used'
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Creează trigger-ul dacă nu există
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'track_marketing_plan_brand_voice_trigger'
  ) THEN
    CREATE TRIGGER track_marketing_plan_brand_voice_trigger
      AFTER INSERT ON marketing_plans
      FOR EACH ROW EXECUTE FUNCTION track_marketing_plan_brand_voice();
  END IF;
END $$;

-- Funcție pentru obținerea istoricului vocii brandului
CREATE OR REPLACE FUNCTION get_brand_voice_history(user_id uuid)
RETURNS TABLE(
  plan_id uuid,
  plan_title text,
  created_at timestamptz,
  brand_voice_data jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mp.id,
    mp.title,
    mp.created_at,
    mp.details->'brand_voice_used' as brand_voice_data
  FROM marketing_plans mp
  WHERE mp.user_id = get_brand_voice_history.user_id
    AND mp.details->'brand_voice_used' IS NOT NULL
  ORDER BY mp.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
/*
  # Create Brand Voice History Functions

  1. New Functions
    - `get_brand_voice_history` - Returns brand voice history for a user
    - `get_brand_voice_evolution` - Returns brand voice evolution analytics for a user

  2. Security
    - Functions use SECURITY DEFINER to access data with proper RLS policies
    - Input validation for user_id parameter

  3. Features
    - Brand voice history tracking from marketing plans
    - Evolution analytics with personality and tone trends
    - Proper JSON handling for brand voice data
*/

-- Function to get brand voice history for a user
CREATE OR REPLACE FUNCTION get_brand_voice_history(user_id uuid)
RETURNS TABLE (
  plan_id uuid,
  plan_title text,
  created_at timestamptz,
  brand_voice_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
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
      jsonb_build_object(
        'personality', bp.personality_traits,
        'tone', bp.communication_tones,
        'brand_name', bp.brand_name,
        'brand_description', bp.brand_description,
        'timestamp', mp.brand_voice_version,
        'brand_profile_updated_at', bp.updated_at
      ),
      '{}'::jsonb
    ) as brand_voice_data
  FROM marketing_plans mp
  LEFT JOIN brand_profiles bp ON mp.brand_profile_id = bp.id
  WHERE mp.user_id = get_brand_voice_history.user_id
  ORDER BY mp.created_at DESC;
END;
$$;

-- Function to get brand voice evolution analytics
CREATE OR REPLACE FUNCTION get_brand_voice_evolution(user_id uuid)
RETURNS TABLE (
  total_plans_created bigint,
  unique_voice_versions bigint,
  first_plan_date timestamptz,
  last_plan_date timestamptz,
  most_used_personality_traits text[],
  most_used_tones text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  personality_counts jsonb;
  tone_counts jsonb;
BEGIN
  -- Validate input
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'user_id cannot be null';
  END IF;

  -- Get personality trait counts
  SELECT jsonb_object_agg(trait, count)
  INTO personality_counts
  FROM (
    SELECT 
      unnest(bp.personality_traits) as trait,
      COUNT(*) as count
    FROM marketing_plans mp
    JOIN brand_profiles bp ON mp.brand_profile_id = bp.id
    WHERE mp.user_id = get_brand_voice_evolution.user_id
    GROUP BY unnest(bp.personality_traits)
    ORDER BY count DESC
    LIMIT 10
  ) personality_data;

  -- Get tone counts
  SELECT jsonb_object_agg(tone, count)
  INTO tone_counts
  FROM (
    SELECT 
      unnest(bp.communication_tones) as tone,
      COUNT(*) as count
    FROM marketing_plans mp
    JOIN brand_profiles bp ON mp.brand_profile_id = bp.id
    WHERE mp.user_id = get_brand_voice_evolution.user_id
    GROUP BY unnest(bp.communication_tones)
    ORDER BY count DESC
    LIMIT 10
  ) tone_data;

  RETURN QUERY
  SELECT 
    COUNT(mp.id) as total_plans_created,
    COUNT(DISTINCT mp.brand_voice_version) as unique_voice_versions,
    MIN(mp.created_at) as first_plan_date,
    MAX(mp.created_at) as last_plan_date,
    COALESCE(
      ARRAY(
        SELECT jsonb_object_keys(personality_counts)
        ORDER BY (personality_counts ->> jsonb_object_keys(personality_counts))::int DESC
        LIMIT 5
      ),
      ARRAY[]::text[]
    ) as most_used_personality_traits,
    COALESCE(
      ARRAY(
        SELECT jsonb_object_keys(tone_counts)
        ORDER BY (tone_counts ->> jsonb_object_keys(tone_counts))::int DESC
        LIMIT 5
      ),
      ARRAY[]::text[]
    ) as most_used_tones
  FROM marketing_plans mp
  LEFT JOIN brand_profiles bp ON mp.brand_profile_id = bp.id
  WHERE mp.user_id = get_brand_voice_evolution.user_id;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_brand_voice_history(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_brand_voice_evolution(uuid) TO authenticated;
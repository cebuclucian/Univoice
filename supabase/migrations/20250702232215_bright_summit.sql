/*
  # Fix Brand Voice History Array Handling

  1. Problem
    - The get_brand_voice_history function is failing with "malformed array literal" error
    - PostgreSQL is receiving string "[]" instead of proper array format
    - Default values for array columns need proper PostgreSQL array syntax

  2. Solution
    - Update the get_brand_voice_history function to handle empty arrays properly
    - Ensure array fields use proper PostgreSQL array literals
    - Add proper null checks and array handling
*/

-- Drop and recreate the get_brand_voice_history function with proper array handling
DROP FUNCTION IF EXISTS public.get_brand_voice_history(uuid);

CREATE OR REPLACE FUNCTION public.get_brand_voice_history(user_id uuid)
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
          'personality', 
          CASE 
            WHEN bp.personality_traits IS NULL OR array_length(bp.personality_traits, 1) IS NULL 
            THEN '[]'::jsonb
            ELSE to_jsonb(bp.personality_traits)
          END,
          'tone', 
          CASE 
            WHEN bp.communication_tones IS NULL OR array_length(bp.communication_tones, 1) IS NULL 
            THEN '[]'::jsonb
            ELSE to_jsonb(bp.communication_tones)
          END,
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
  LIMIT 50;
END;
$$;

-- Also fix the get_brand_voice_evolution function to handle arrays properly
DROP FUNCTION IF EXISTS public.get_brand_voice_evolution(uuid);

CREATE OR REPLACE FUNCTION public.get_brand_voice_evolution(user_id uuid)
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

  -- Get personality trait counts with proper array handling
  SELECT jsonb_object_agg(trait, count)
  INTO personality_counts
  FROM (
    SELECT 
      unnest(bp.personality_traits) as trait,
      COUNT(*) as count
    FROM marketing_plans mp
    JOIN brand_profiles bp ON mp.brand_profile_id = bp.id
    WHERE mp.user_id = get_brand_voice_evolution.user_id
      AND COALESCE(mp.status, 'active') = 'active'
      AND bp.personality_traits IS NOT NULL
      AND array_length(bp.personality_traits, 1) > 0
    GROUP BY unnest(bp.personality_traits)
    ORDER BY count DESC
    LIMIT 5
  ) personality_stats;

  -- Get tone counts with proper array handling
  SELECT jsonb_object_agg(tone, count)
  INTO tone_counts
  FROM (
    SELECT 
      unnest(bp.communication_tones) as tone,
      COUNT(*) as count
    FROM marketing_plans mp
    JOIN brand_profiles bp ON mp.brand_profile_id = bp.id
    WHERE mp.user_id = get_brand_voice_evolution.user_id
      AND COALESCE(mp.status, 'active') = 'active'
      AND bp.communication_tones IS NOT NULL
      AND array_length(bp.communication_tones, 1) > 0
    GROUP BY unnest(bp.communication_tones)
    ORDER BY count DESC
    LIMIT 5
  ) tone_stats;

  RETURN QUERY
  SELECT 
    COALESCE(stats.total_plans, 0::bigint) as total_plans_created,
    COALESCE(stats.unique_profiles, 0::bigint) as unique_voice_versions,
    stats.first_plan as first_plan_date,
    stats.last_plan as last_plan_date,
    COALESCE(
      CASE 
        WHEN personality_counts IS NOT NULL THEN
          ARRAY(SELECT jsonb_object_keys(personality_counts) ORDER BY (personality_counts->>jsonb_object_keys(personality_counts))::int DESC)
        ELSE ARRAY[]::text[]
      END,
      ARRAY[]::text[]
    ) as most_used_personality_traits,
    COALESCE(
      CASE 
        WHEN tone_counts IS NOT NULL THEN
          ARRAY(SELECT jsonb_object_keys(tone_counts) ORDER BY (tone_counts->>jsonb_object_keys(tone_counts))::int DESC)
        ELSE ARRAY[]::text[]
      END,
      ARRAY[]::text[]
    ) as most_used_tones
  FROM (
    SELECT 
      COUNT(mp.id) as total_plans,
      COUNT(DISTINCT mp.brand_profile_id) as unique_profiles,
      MIN(mp.created_at) as first_plan,
      MAX(mp.created_at) as last_plan
    FROM marketing_plans mp
    WHERE mp.user_id = get_brand_voice_evolution.user_id
      AND COALESCE(mp.status, 'active') = 'active'
  ) stats;
END;
$$;

-- Ensure proper default values for array columns in brand_profiles table
DO $$
BEGIN
  -- Update any NULL array values to proper empty arrays
  UPDATE brand_profiles 
  SET personality_traits = ARRAY[]::text[]
  WHERE personality_traits IS NULL;
  
  UPDATE brand_profiles 
  SET communication_tones = ARRAY[]::text[]
  WHERE communication_tones IS NULL;
END $$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_brand_voice_history(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_brand_voice_evolution(uuid) TO authenticated;
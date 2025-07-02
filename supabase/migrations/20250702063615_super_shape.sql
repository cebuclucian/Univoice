/*
  # Database Schema Setup

  1. New Tables
    - `user_profiles` - User profile information
    - `brand_profiles` - Brand voice and personality data
    - `subscriptions` - User subscription and usage tracking
    - `marketing_plans` - Generated marketing plans
    - `scheduled_posts` - Scheduled social media posts
    - `ai_recommendations` - AI-generated recommendations

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data

  3. Functions and Triggers
    - Auto-update timestamp function
    - Triggers for updated_at columns
*/

-- Drop existing policies if they exist to avoid conflicts
DO $$ 
BEGIN
  -- Drop user_profiles policies
  DROP POLICY IF EXISTS "Utilizatorii pot vedea propriul profil." ON user_profiles;
  DROP POLICY IF EXISTS "Utilizatorii pot insera propriul profil." ON user_profiles;
  DROP POLICY IF EXISTS "Utilizatorii pot actualiza propriul profil." ON user_profiles;
  DROP POLICY IF EXISTS "Utilizatorii pot șterge propriul profil." ON user_profiles;
  
  -- Drop brand_profiles policies
  DROP POLICY IF EXISTS "Utilizatorii pot vedea propriile profile de brand." ON brand_profiles;
  DROP POLICY IF EXISTS "Utilizatorii pot insera propriile profile de brand." ON brand_profiles;
  DROP POLICY IF EXISTS "Utilizatorii pot actualiza propriile profile de brand." ON brand_profiles;
  DROP POLICY IF EXISTS "Utilizatorii pot șterge propriile profile de brand." ON brand_profiles;
  
  -- Drop subscriptions policies
  DROP POLICY IF EXISTS "Utilizatorii pot vedea propriul abonament." ON subscriptions;
  DROP POLICY IF EXISTS "Utilizatorii pot insera propriul abonament." ON subscriptions;
  DROP POLICY IF EXISTS "Utilizatorii pot actualiza propriul abonament." ON subscriptions;
  DROP POLICY IF EXISTS "Utilizatorii pot șterge propriul abonament." ON subscriptions;
  
  -- Drop marketing_plans policies
  DROP POLICY IF EXISTS "Utilizatorii pot vedea propriile planuri de marketing." ON marketing_plans;
  DROP POLICY IF EXISTS "Utilizatorii pot insera propriile planuri de marketing." ON marketing_plans;
  DROP POLICY IF EXISTS "Utilizatorii pot actualiza propriile planuri de marketing." ON marketing_plans;
  DROP POLICY IF EXISTS "Utilizatorii pot șterge propriile planuri de marketing." ON marketing_plans;
  
  -- Drop scheduled_posts policies
  DROP POLICY IF EXISTS "Utilizatorii pot vedea propriile postări programate." ON scheduled_posts;
  DROP POLICY IF EXISTS "Utilizatorii pot insera propriile postări programate." ON scheduled_posts;
  DROP POLICY IF EXISTS "Utilizatorii pot actualiza propriile postări programate." ON scheduled_posts;
  DROP POLICY IF EXISTS "Utilizatorii pot șterge propriile postări programate." ON scheduled_posts;
  
  -- Drop ai_recommendations policies
  DROP POLICY IF EXISTS "Utilizatorii pot vedea propriile recomandări AI." ON ai_recommendations;
  DROP POLICY IF EXISTS "Utilizatorii pot insera propriile recomandări AI." ON ai_recommendations;
  DROP POLICY IF EXISTS "Utilizatorii pot actualiza propriile recomandări AI." ON ai_recommendations;
  DROP POLICY IF EXISTS "Utilizatorii pot șterge propriile recomandări AI." ON ai_recommendations;
EXCEPTION
  WHEN undefined_table THEN
    -- Tables don't exist yet, which is fine
    NULL;
  WHEN undefined_object THEN
    -- Policies don't exist yet, which is fine
    NULL;
END $$;

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user',
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS brand_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  brand_name text NOT NULL,
  brand_description text NOT NULL,
  content_example_1 text NOT NULL,
  content_example_2 text,
  personality_traits text[] NOT NULL DEFAULT '{}',
  communication_tones text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  plan text DEFAULT 'free',
  status text,
  stripe_customer_id text UNIQUE,
  plans_generated_this_month integer DEFAULT 0,
  content_generated_this_month integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS marketing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  brand_profile_id uuid REFERENCES brand_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scheduled_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  marketing_plan_id uuid REFERENCES marketing_plans(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL,
  content text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  status text DEFAULT 'scheduled'
);

CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  details text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Utilizatorii pot vedea propriul profil." ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Utilizatorii pot insera propriul profil." ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Utilizatorii pot actualiza propriul profil." ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Utilizatorii pot șterge propriul profil." ON user_profiles FOR DELETE USING (auth.uid() = id);

-- Create RLS policies for brand_profiles
CREATE POLICY "Utilizatorii pot vedea propriile profile de brand." ON brand_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Utilizatorii pot insera propriile profile de brand." ON brand_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Utilizatorii pot actualiza propriile profile de brand." ON brand_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Utilizatorii pot șterge propriile profile de brand." ON brand_profiles FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for subscriptions
CREATE POLICY "Utilizatorii pot vedea propriul abonament." ON subscriptions FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Utilizatorii pot insera propriul abonament." ON subscriptions FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Utilizatorii pot actualiza propriul abonament." ON subscriptions FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Utilizatorii pot șterge propriul abonament." ON subscriptions FOR DELETE USING (auth.uid() = id);

-- Create RLS policies for marketing_plans
CREATE POLICY "Utilizatorii pot vedea propriile planuri de marketing." ON marketing_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Utilizatorii pot insera propriile planuri de marketing." ON marketing_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Utilizatorii pot actualiza propriile planuri de marketing." ON marketing_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Utilizatorii pot șterge propriile planuri de marketing." ON marketing_plans FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for scheduled_posts
CREATE POLICY "Utilizatorii pot vedea propriile postări programate." ON scheduled_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Utilizatorii pot insera propriile postări programate." ON scheduled_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Utilizatorii pot actualiza propriile postări programate." ON scheduled_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Utilizatorii pot șterge propriile postări programate." ON scheduled_posts FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for ai_recommendations
CREATE POLICY "Utilizatorii pot vedea propriile recomandări AI." ON ai_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Utilizatorii pot insera propriile recomandări AI." ON ai_recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Utilizatorii pot actualiza propriile recomandări AI." ON ai_recommendations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Utilizatorii pot șterge propriile recomandări AI." ON ai_recommendations FOR DELETE USING (auth.uid() = user_id);

-- Create or replace function for updating updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_brand_profiles_updated_at ON brand_profiles;

-- Create triggers for auto-updating updated_at columns
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_profiles_updated_at
  BEFORE UPDATE ON brand_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  
  INSERT INTO public.subscriptions (id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
/*
  # Complete database schema setup

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text, nullable)
      - `avatar_url` (text, nullable)
      - `role` (text, default 'user')
      - `updated_at` (timestamptz, default now())
    
    - `brand_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `brand_name` (text, required)
      - `brand_description` (text, required)
      - `content_example_1` (text, required)
      - `content_example_2` (text, nullable)
      - `personality_traits` (text array)
      - `communication_tones` (text array)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
    
    - `subscriptions`
      - `id` (uuid, primary key, references auth.users)
      - `plan` (text, default 'free')
      - `status` (text, nullable)
      - `stripe_customer_id` (text, unique, nullable)
      - `plans_generated_this_month` (integer, default 0)
      - `content_generated_this_month` (integer, default 0)
    
    - `marketing_plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `brand_profile_id` (uuid, references brand_profiles)
      - `title` (text, required)
      - `details` (jsonb, default '{}')
      - `created_at` (timestamptz, default now())
    
    - `scheduled_posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `marketing_plan_id` (uuid, references marketing_plans)
      - `platform` (text, required)
      - `content` (text, required)
      - `scheduled_at` (timestamptz, required)
      - `status` (text, default 'scheduled')
    
    - `ai_recommendations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text, required)
      - `details` (text, required)
      - `is_read` (boolean, default false)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add triggers for automatic updated_at column updates

  3. Functions
    - `update_updated_at_column()` for automatic timestamp updates
    - `handle_new_user()` for automatic profile creation
*/

-- Crearea tabelei user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user',
  updated_at timestamptz DEFAULT now()
);

-- Crearea tabelei brand_profiles
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

-- Crearea tabelei subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  plan text DEFAULT 'free',
  status text,
  stripe_customer_id text UNIQUE,
  plans_generated_this_month integer DEFAULT 0,
  content_generated_this_month integer DEFAULT 0
);

-- Crearea tabelei marketing_plans
CREATE TABLE IF NOT EXISTS marketing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  brand_profile_id uuid REFERENCES brand_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Crearea tabelei scheduled_posts
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  marketing_plan_id uuid REFERENCES marketing_plans(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL,
  content text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  status text DEFAULT 'scheduled'
);

-- Crearea tabelei ai_recommendations
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  details text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Activarea Row Level Security pe toate tabelele
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Funcție pentru actualizarea automată a updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Funcție pentru crearea automată a profilului utilizatorului
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

-- Trigger pentru crearea automată a profilului utilizatorului
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;

-- Trigger pentru actualizarea automată a updated_at în user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_user_profiles_updated_at
      BEFORE UPDATE ON user_profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Trigger pentru actualizarea automată a updated_at în brand_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_brand_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_brand_profiles_updated_at
      BEFORE UPDATE ON brand_profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Politici RLS pentru user_profiles (cu verificare de existență)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Utilizatorii pot vedea propriul profil.'
  ) THEN
    CREATE POLICY "Utilizatorii pot vedea propriul profil." ON user_profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Utilizatorii pot insera propriul profil.'
  ) THEN
    CREATE POLICY "Utilizatorii pot insera propriul profil." ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Utilizatorii pot actualiza propriul profil.'
  ) THEN
    CREATE POLICY "Utilizatorii pot actualiza propriul profil." ON user_profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Utilizatorii pot șterge propriul profil.'
  ) THEN
    CREATE POLICY "Utilizatorii pot șterge propriul profil." ON user_profiles FOR DELETE USING (auth.uid() = id);
  END IF;
END $$;

-- Politici RLS pentru brand_profiles (cu verificare de existență)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'brand_profiles' AND policyname = 'Utilizatorii pot vedea propriile profile de brand.'
  ) THEN
    CREATE POLICY "Utilizatorii pot vedea propriile profile de brand." ON brand_profiles FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'brand_profiles' AND policyname = 'Utilizatorii pot insera propriile profile de brand.'
  ) THEN
    CREATE POLICY "Utilizatorii pot insera propriile profile de brand." ON brand_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'brand_profiles' AND policyname = 'Utilizatorii pot actualiza propriile profile de brand.'
  ) THEN
    CREATE POLICY "Utilizatorii pot actualiza propriile profile de brand." ON brand_profiles FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'brand_profiles' AND policyname = 'Utilizatorii pot șterge propriile profile de brand.'
  ) THEN
    CREATE POLICY "Utilizatorii pot șterge propriile profile de brand." ON brand_profiles FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Politici RLS pentru subscriptions (cu verificare de existență)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Utilizatorii pot vedea propriul abonament.'
  ) THEN
    CREATE POLICY "Utilizatorii pot vedea propriul abonament." ON subscriptions FOR SELECT USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Utilizatorii pot insera propriul abonament.'
  ) THEN
    CREATE POLICY "Utilizatorii pot insera propriul abonament." ON subscriptions FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Utilizatorii pot actualiza propriul abonament.'
  ) THEN
    CREATE POLICY "Utilizatorii pot actualiza propriul abonament." ON subscriptions FOR UPDATE USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Utilizatorii pot șterge propriul abonament.'
  ) THEN
    CREATE POLICY "Utilizatorii pot șterge propriul abonament." ON subscriptions FOR DELETE USING (auth.uid() = id);
  END IF;
END $$;

-- Politici RLS pentru marketing_plans (cu verificare de existență)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'marketing_plans' AND policyname = 'Utilizatorii pot vedea propriile planuri de marketing.'
  ) THEN
    CREATE POLICY "Utilizatorii pot vedea propriile planuri de marketing." ON marketing_plans FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'marketing_plans' AND policyname = 'Utilizatorii pot insera propriile planuri de marketing.'
  ) THEN
    CREATE POLICY "Utilizatorii pot insera propriile planuri de marketing." ON marketing_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'marketing_plans' AND policyname = 'Utilizatorii pot actualiza propriile planuri de marketing.'
  ) THEN
    CREATE POLICY "Utilizatorii pot actualiza propriile planuri de marketing." ON marketing_plans FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'marketing_plans' AND policyname = 'Utilizatorii pot șterge propriile planuri de marketing.'
  ) THEN
    CREATE POLICY "Utilizatorii pot șterge propriile planuri de marketing." ON marketing_plans FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Politici RLS pentru scheduled_posts (cu verificare de existență)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'scheduled_posts' AND policyname = 'Utilizatorii pot vedea propriile postări programate.'
  ) THEN
    CREATE POLICY "Utilizatorii pot vedea propriile postări programate." ON scheduled_posts FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'scheduled_posts' AND policyname = 'Utilizatorii pot insera propriile postări programate.'
  ) THEN
    CREATE POLICY "Utilizatorii pot insera propriile postări programate." ON scheduled_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'scheduled_posts' AND policyname = 'Utilizatorii pot actualiza propriile postări programate.'
  ) THEN
    CREATE POLICY "Utilizatorii pot actualiza propriile postări programate." ON scheduled_posts FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'scheduled_posts' AND policyname = 'Utilizatorii pot șterge propriile postări programate.'
  ) THEN
    CREATE POLICY "Utilizatorii pot șterge propriile postări programate." ON scheduled_posts FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Politici RLS pentru ai_recommendations (cu verificare de existență)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_recommendations' AND policyname = 'Utilizatorii pot vedea propriile recomandări AI.'
  ) THEN
    CREATE POLICY "Utilizatorii pot vedea propriile recomandări AI." ON ai_recommendations FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_recommendations' AND policyname = 'Utilizatorii pot insera propriile recomandări AI.'
  ) THEN
    CREATE POLICY "Utilizatorii pot insera propriile recomandări AI." ON ai_recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_recommendations' AND policyname = 'Utilizatorii pot actualiza propriile recomandări AI.'
  ) THEN
    CREATE POLICY "Utilizatorii pot actualiza propriile recomandări AI." ON ai_recommendations FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_recommendations' AND policyname = 'Utilizatorii pot șterge propriile recomandări AI.'
  ) THEN
    CREATE POLICY "Utilizatorii pot șterge propriile recomandări AI." ON ai_recommendations FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          role: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
        };
      };
      brand_profiles: {
        Row: {
          id: string;
          user_id: string;
          brand_name: string;
          brand_description: string;
          content_example_1: string;
          content_example_2: string | null;
          personality_traits: string[];
          communication_tones: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          brand_name: string;
          brand_description: string;
          content_example_1: string;
          content_example_2?: string | null;
          personality_traits?: string[];
          communication_tones?: string[];
        };
        Update: {
          brand_name?: string;
          brand_description?: string;
          content_example_1?: string;
          content_example_2?: string | null;
          personality_traits?: string[];
          communication_tones?: string[];
        };
      };
      subscriptions: {
        Row: {
          id: string;
          plan: string;
          status: string | null;
          stripe_customer_id: string | null;
          plans_generated_this_month: number;
          content_generated_this_month: number;
        };
        Insert: {
          id: string;
          plan?: string;
          status?: string | null;
          stripe_customer_id?: string | null;
          plans_generated_this_month?: number;
          content_generated_this_month?: number;
        };
        Update: {
          plan?: string;
          status?: string | null;
          stripe_customer_id?: string | null;
          plans_generated_this_month?: number;
          content_generated_this_month?: number;
        };
      };
      marketing_plans: {
        Row: {
          id: string;
          user_id: string;
          brand_profile_id: string;
          title: string;
          details: any;
          created_at: string;
        };
        Insert: {
          user_id: string;
          brand_profile_id: string;
          title: string;
          details?: any;
        };
        Update: {
          title?: string;
          details?: any;
        };
      };
      scheduled_posts: {
        Row: {
          id: string;
          user_id: string;
          marketing_plan_id: string;
          platform: string;
          content: string;
          scheduled_at: string;
          status: string;
        };
        Insert: {
          user_id: string;
          marketing_plan_id: string;
          platform: string;
          content: string;
          scheduled_at: string;
          status?: string;
        };
        Update: {
          platform?: string;
          content?: string;
          scheduled_at?: string;
          status?: string;
        };
      };
      ai_recommendations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          details: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          details: string;
          is_read?: boolean;
        };
        Update: {
          title?: string;
          details?: string;
          is_read?: boolean;
        };
      };
    };
  };
};
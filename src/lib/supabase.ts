import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SupabaseBlogPost {
  id: string;
  title: string;
  slug: string;
  pillar: string;
  excerpt: string;
  body: string;
  cover_image_url: string | null;
  read_time: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

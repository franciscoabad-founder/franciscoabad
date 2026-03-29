import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'placeholder-anon-key';
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder-service-role-key';

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn('VITE_SUPABASE_URL not configured');
}

// Public client — uses anon key, respects RLS
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client — uses service role key, bypasses RLS
// Only use server-side or in admin-authenticated contexts
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// ─── Database types ────────────────────────────────────────────────────────

export type BlogPostStatus = 'draft' | 'published' | 'archived';
export type OpportunityType = 'brand_deal' | 'consulting' | 'speaking';
export type OpportunityStatus =
  | 'prospecting'
  | 'in_talks'
  | 'proposal_sent'
  | 'negotiating'
  | 'closed_won'
  | 'closed_lost';
export type PaymentStatus = 'pending' | 'received' | 'overdue';

export interface AdminConfig {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

export interface IgDailyMetric {
  id: string;
  account: string;
  date: string;
  followers: number;
  new_followers: number;
  reach: number;
  impressions: number;
  profile_views: number;
  created_at: string;
}

export interface IgPostMetric {
  id: string;
  account: string;
  post_id: string;
  published_at: string;
  thumbnail_url: string | null;
  caption: string | null;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  reach: number;
  impressions: number;
  engagement_rate: number;
  created_at: string;
}

export interface LiDailyMetric {
  id: string;
  date: string;
  connections: number;
  new_connections: number;
  profile_views: number;
  post_impressions: number;
  created_at: string;
}

export interface LiPostMetric {
  id: string;
  post_id: string;
  published_at: string;
  text_preview: string | null;
  likes: number;
  comments: number;
  reposts: number;
  impressions: number;
  engagement_rate: number;
  created_at: string;
}

export interface YtDailyMetric {
  id: string;
  date: string;
  subscribers: number;
  new_subscribers: number;
  views: number;
  watch_time_hours: number;
  created_at: string;
}

export interface YtVideoMetric {
  id: string;
  video_id: string;
  published_at: string;
  title: string;
  thumbnail_url: string | null;
  views: number;
  likes: number;
  comments: number;
  watch_time_hours: number;
  ctr: number;
  avg_view_duration_seconds: number;
  created_at: string;
}

export interface Opportunity {
  id: string;
  type: OpportunityType;
  status: OpportunityStatus;
  title: string;
  company: string | null;
  contact_name: string | null;
  contact_email: string | null;
  value: number | null;
  currency: string;
  next_action: string | null;
  next_action_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OpportunityPayment {
  id: string;
  opportunity_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  due_date: string | null;
  received_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface LsProduct {
  id: string;
  ls_product_id: string;
  name: string;
  slug: string | null;
  description: string | null;
  price_cents: number;
  currency: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LsSale {
  id: string;
  ls_order_id: string;
  ls_product_id: string;
  product_name: string;
  customer_email: string;
  amount_cents: number;
  currency: string;
  status: string;
  ordered_at: string;
  created_at: string;
}

export interface CalBooking {
  id: string;
  cal_booking_id: string;
  event_type: string;
  attendee_name: string;
  attendee_email: string;
  starts_at: string;
  ends_at: string;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  pillar: string | null;
  excerpt: string | null;
  body_tiptap: Record<string, unknown> | null;
  body_html: string | null;
  cover_image_url: string | null;
  reading_time: number | null;
  status: BlogPostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MorningBriefing {
  id: string;
  date: string;
  content: string;
  generated_at: string;
  created_at: string;
}

// Legacy type kept for compatibility with existing Blog pages
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

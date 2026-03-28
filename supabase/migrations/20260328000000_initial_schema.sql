-- ============================================================
-- Francisco Abad — Content Intelligence Dashboard
-- Initial Schema Migration
-- 2026-03-28
-- ============================================================

-- ─── Enums ────────────────────────────────────────────────────────────────

CREATE TYPE blog_post_status AS ENUM ('draft', 'published', 'archived');

CREATE TYPE opportunity_type AS ENUM ('brand_deal', 'consulting', 'speaking');

CREATE TYPE opportunity_status AS ENUM (
  'prospecting',
  'in_talks',
  'proposal_sent',
  'negotiating',
  'closed_won',
  'closed_lost'
);

CREATE TYPE payment_status AS ENUM ('pending', 'received', 'overdue');


-- ─── admin_config ─────────────────────────────────────────────────────────
-- Key/value store for API tokens and dashboard configuration

CREATE TABLE admin_config (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text NOT NULL UNIQUE,
  value      text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_config_key ON admin_config (key);

ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_config_auth_all"
  ON admin_config FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ─── ig_daily_metrics ─────────────────────────────────────────────────────
-- Daily Instagram metrics per account

CREATE TABLE ig_daily_metrics (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account       text NOT NULL,
  date          date NOT NULL,
  followers     integer NOT NULL DEFAULT 0,
  new_followers integer NOT NULL DEFAULT 0,
  reach         integer NOT NULL DEFAULT 0,
  impressions   integer NOT NULL DEFAULT 0,
  profile_views integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account, date)
);

CREATE INDEX idx_ig_daily_account_date ON ig_daily_metrics (account, date DESC);

ALTER TABLE ig_daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ig_daily_auth_all"
  ON ig_daily_metrics FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ─── ig_post_metrics ──────────────────────────────────────────────────────
-- Performance per Instagram post

CREATE TABLE ig_post_metrics (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account         text NOT NULL,
  post_id         text NOT NULL UNIQUE,
  published_at    timestamptz NOT NULL,
  thumbnail_url   text,
  caption         text,
  likes           integer NOT NULL DEFAULT 0,
  comments        integer NOT NULL DEFAULT 0,
  saves           integer NOT NULL DEFAULT 0,
  shares          integer NOT NULL DEFAULT 0,
  reach           integer NOT NULL DEFAULT 0,
  impressions     integer NOT NULL DEFAULT 0,
  engagement_rate numeric(6, 4) NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ig_post_account_published ON ig_post_metrics (account, published_at DESC);

ALTER TABLE ig_post_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ig_post_auth_all"
  ON ig_post_metrics FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ─── li_daily_metrics ─────────────────────────────────────────────────────
-- Daily LinkedIn metrics

CREATE TABLE li_daily_metrics (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date             date NOT NULL UNIQUE,
  connections      integer NOT NULL DEFAULT 0,
  new_connections  integer NOT NULL DEFAULT 0,
  profile_views    integer NOT NULL DEFAULT 0,
  post_impressions integer NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_li_daily_date ON li_daily_metrics (date DESC);

ALTER TABLE li_daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "li_daily_auth_all"
  ON li_daily_metrics FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ─── li_post_metrics ──────────────────────────────────────────────────────
-- Performance per LinkedIn post

CREATE TABLE li_post_metrics (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         text NOT NULL UNIQUE,
  published_at    timestamptz NOT NULL,
  text_preview    text,
  likes           integer NOT NULL DEFAULT 0,
  comments        integer NOT NULL DEFAULT 0,
  reposts         integer NOT NULL DEFAULT 0,
  impressions     integer NOT NULL DEFAULT 0,
  engagement_rate numeric(6, 4) NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_li_post_published ON li_post_metrics (published_at DESC);

ALTER TABLE li_post_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "li_post_auth_all"
  ON li_post_metrics FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ─── yt_daily_metrics ─────────────────────────────────────────────────────
-- Daily YouTube metrics

CREATE TABLE yt_daily_metrics (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date              date NOT NULL UNIQUE,
  subscribers       integer NOT NULL DEFAULT 0,
  new_subscribers   integer NOT NULL DEFAULT 0,
  views             integer NOT NULL DEFAULT 0,
  watch_time_hours  numeric(10, 2) NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_yt_daily_date ON yt_daily_metrics (date DESC);

ALTER TABLE yt_daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "yt_daily_auth_all"
  ON yt_daily_metrics FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ─── yt_video_metrics ─────────────────────────────────────────────────────
-- Performance per YouTube video

CREATE TABLE yt_video_metrics (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id                   text NOT NULL UNIQUE,
  published_at               timestamptz NOT NULL,
  title                      text NOT NULL,
  thumbnail_url              text,
  views                      integer NOT NULL DEFAULT 0,
  likes                      integer NOT NULL DEFAULT 0,
  comments                   integer NOT NULL DEFAULT 0,
  watch_time_hours           numeric(10, 2) NOT NULL DEFAULT 0,
  ctr                        numeric(6, 4) NOT NULL DEFAULT 0,
  avg_view_duration_seconds  integer NOT NULL DEFAULT 0,
  created_at                 timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_yt_video_published ON yt_video_metrics (published_at DESC);

ALTER TABLE yt_video_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "yt_video_auth_all"
  ON yt_video_metrics FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ─── opportunities ────────────────────────────────────────────────────────
-- Brand deals, consulting and speaking pipeline

CREATE TABLE opportunities (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type             opportunity_type NOT NULL,
  status           opportunity_status NOT NULL DEFAULT 'prospecting',
  title            text NOT NULL,
  company          text,
  contact_name     text,
  contact_email    text,
  value            numeric(12, 2),
  currency         text NOT NULL DEFAULT 'USD',
  next_action      text,
  next_action_date date,
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_opportunities_status ON opportunities (status);
CREATE INDEX idx_opportunities_type   ON opportunities (type);
CREATE INDEX idx_opportunities_next_action_date ON opportunities (next_action_date ASC NULLS LAST);

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "opportunities_auth_all"
  ON opportunities FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ─── opportunity_payments ─────────────────────────────────────────────────
-- Payments linked to opportunities

CREATE TABLE opportunity_payments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id  uuid NOT NULL REFERENCES opportunities (id) ON DELETE CASCADE,
  amount          numeric(12, 2) NOT NULL,
  currency        text NOT NULL DEFAULT 'USD',
  status          payment_status NOT NULL DEFAULT 'pending',
  due_date        date,
  received_date   date,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_opp_payments_opportunity  ON opportunity_payments (opportunity_id);
CREATE INDEX idx_opp_payments_status       ON opportunity_payments (status);
CREATE INDEX idx_opp_payments_due_date     ON opportunity_payments (due_date ASC NULLS LAST);

ALTER TABLE opportunity_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "opp_payments_auth_all"
  ON opportunity_payments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ─── ls_products ──────────────────────────────────────────────────────────
-- Lemon Squeezy product catalog

CREATE TABLE ls_products (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ls_product_id text NOT NULL UNIQUE,
  name          text NOT NULL,
  slug          text,
  description   text,
  price_cents   integer NOT NULL DEFAULT 0,
  currency      text NOT NULL DEFAULT 'USD',
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ls_products_active ON ls_products (active);

ALTER TABLE ls_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ls_products_auth_all"
  ON ls_products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER trg_ls_products_updated_at
  BEFORE UPDATE ON ls_products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ─── ls_sales ─────────────────────────────────────────────────────────────
-- Lemon Squeezy orders, fed by webhooks

CREATE TABLE ls_sales (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ls_order_id     text NOT NULL UNIQUE,
  ls_product_id   text NOT NULL,
  product_name    text NOT NULL,
  customer_email  text NOT NULL,
  amount_cents    integer NOT NULL DEFAULT 0,
  currency        text NOT NULL DEFAULT 'USD',
  status          text NOT NULL DEFAULT 'paid',
  ordered_at      timestamptz NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ls_sales_ordered_at    ON ls_sales (ordered_at DESC);
CREATE INDEX idx_ls_sales_product       ON ls_sales (ls_product_id);
CREATE INDEX idx_ls_sales_status        ON ls_sales (status);

ALTER TABLE ls_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ls_sales_auth_all"
  ON ls_sales FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ─── cal_bookings ─────────────────────────────────────────────────────────
-- Cal.com bookings, fed by webhooks

CREATE TABLE cal_bookings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cal_booking_id  text NOT NULL UNIQUE,
  event_type      text NOT NULL,
  attendee_name   text NOT NULL,
  attendee_email  text NOT NULL,
  starts_at       timestamptz NOT NULL,
  ends_at         timestamptz NOT NULL,
  status          text NOT NULL DEFAULT 'accepted',
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cal_bookings_starts_at ON cal_bookings (starts_at ASC);
CREATE INDEX idx_cal_bookings_status    ON cal_bookings (status);

ALTER TABLE cal_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cal_bookings_auth_all"
  ON cal_bookings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ─── blog_posts ───────────────────────────────────────────────────────────
-- Posts with Tiptap JSON body, status enum, auto reading_time

CREATE TABLE blog_posts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  slug            text NOT NULL UNIQUE,
  pillar          text,
  excerpt         text,
  body_tiptap     jsonb,
  body_html       text,
  cover_image_url text,
  reading_time    integer,
  status          blog_post_status NOT NULL DEFAULT 'draft',
  published_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_posts_status       ON blog_posts (status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts (published_at DESC NULLS LAST);
CREATE INDEX idx_blog_posts_slug         ON blog_posts (slug);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public: only published posts are readable without auth
CREATE POLICY "blog_posts_public_read"
  ON blog_posts FOR SELECT
  TO anon
  USING (status = 'published');

-- Admin: full access for authenticated users
CREATE POLICY "blog_posts_auth_all"
  ON blog_posts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ─── morning_briefings ────────────────────────────────────────────────────
-- Daily briefings generated by Claude API

CREATE TABLE morning_briefings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date         date NOT NULL UNIQUE,
  content      text NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_morning_briefings_date ON morning_briefings (date DESC);

ALTER TABLE morning_briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "morning_briefings_auth_all"
  ON morning_briefings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

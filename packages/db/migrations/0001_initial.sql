-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Retailers
CREATE TABLE retailers (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  slug              text UNIQUE NOT NULL,
  affiliate_network text,                -- awin | cj | direct
  affiliate_id      text,
  base_url          text,
  feed_url          text,
  commission_pct    numeric(5,2),
  active            boolean DEFAULT true,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- Core deals table (retailers must exist first)
CREATE TABLE deals (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id        uuid REFERENCES retailers(id),
  external_id        text NOT NULL,
  title              text NOT NULL,
  description        text,
  url                text NOT NULL,
  affiliate_url      text NOT NULL,
  image_url          text,
  price_current      numeric(10,2) NOT NULL,
  price_was          numeric(10,2),
  discount_pct       numeric(5,2),
  authenticity_score integer DEFAULT 0,
  category           text,
  status             text DEFAULT 'pending', -- pending | approved | rejected | expired
  rejection_reason   text,
  embedding          vector(768),
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now(),
  expires_at         timestamptz,
  UNIQUE(retailer_id, external_id)
);

-- Price history (append-only)
CREATE TABLE price_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id     uuid REFERENCES deals(id),
  price       numeric(10,2) NOT NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Users (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id),
  signals_enabled boolean DEFAULT false,
  embedding       vector(768),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Extension signals
CREATE TABLE user_signals (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES user_profiles(id),
  session_id       text NOT NULL,        -- anonymous until linked
  signal_type      text NOT NULL,        -- view | cart | purchase | search | dwell
  retailer_slug    text,
  product_title    text,
  product_category text,
  price_seen       numeric(10,2),
  dwell_seconds    integer,
  processed        boolean DEFAULT false,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- Agent run logs
CREATE TABLE agent_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent           text NOT NULL,
  status          text NOT NULL,    -- success | error | partial
  items_processed integer DEFAULT 0,
  errors          integer DEFAULT 0,
  duration_ms     integer,
  metadata        jsonb,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Auto-update updated_at on every write
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deals_updated_at         BEFORE UPDATE ON deals         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER retailers_updated_at     BEFORE UPDATE ON retailers     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER price_history_updated_at BEFORE UPDATE ON price_history FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER user_signals_updated_at  BEFORE UPDATE ON user_signals  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER agent_logs_updated_at    BEFORE UPDATE ON agent_logs    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Row Level Security (enabled on all tables, never disabled)
ALTER TABLE deals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_signals  ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs    ENABLE ROW LEVEL SECURITY;

-- Policies: service role bypasses RLS automatically (used by agents).
-- Anon/authenticated access is locked down to only what the app needs.

-- Deals: public can read approved deals
CREATE POLICY "approved deals are public"
  ON deals FOR SELECT
  USING (status = 'approved');

-- Retailers: public can read active retailers
CREATE POLICY "active retailers are public"
  ON retailers FOR SELECT
  USING (active = true);

-- Price history: public can read
CREATE POLICY "price history is public"
  ON price_history FOR SELECT
  USING (true);

-- User profiles: users can only read/update their own row
CREATE POLICY "users read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "users insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User signals: users can insert their own signals; cannot read others
CREATE POLICY "users insert own signals"
  ON user_signals FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Agent logs: no direct client access (service role only)
-- No policies added — RLS enabled with no policies = deny all authenticated/anon clients

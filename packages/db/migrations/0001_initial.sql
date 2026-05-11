-- Core deals table
CREATE TABLE deals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id     uuid REFERENCES retailers(id),
  external_id     text NOT NULL,
  title           text NOT NULL,
  description     text,
  url             text NOT NULL,
  affiliate_url   text NOT NULL,
  image_url       text,
  price_current   numeric(10,2) NOT NULL,
  price_was       numeric(10,2),
  discount_pct    numeric(5,2),
  authenticity_score integer DEFAULT 0,
  category        text,
  status          text DEFAULT 'pending', -- pending | approved | rejected | expired
  rejection_reason text,
  embedding       vector(768),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  expires_at      timestamptz,
  UNIQUE(retailer_id, external_id)
);

-- Retailers
CREATE TABLE retailers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  slug            text UNIQUE NOT NULL,
  affiliate_network text, -- awin | cj | direct
  affiliate_id    text,
  base_url        text,
  feed_url        text,
  commission_pct  numeric(5,2),
  active          boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

-- Price history (one row per deal per day)
CREATE TABLE price_history (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id         uuid REFERENCES deals(id),
  price           numeric(10,2) NOT NULL,
  recorded_at     timestamptz DEFAULT now()
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
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES user_profiles(id),
  session_id      text NOT NULL, -- anonymous until linked
  signal_type     text NOT NULL, -- view | cart | purchase | search | dwell
  retailer_slug   text,
  product_title   text,
  product_category text,
  price_seen      numeric(10,2),
  dwell_seconds   integer,
  processed       boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

-- Agent run logs
CREATE TABLE agent_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent           text NOT NULL,
  status          text NOT NULL, -- success | error | partial
  items_processed integer DEFAULT 0,
  errors          integer DEFAULT 0,
  duration_ms     integer,
  metadata        jsonb,
  created_at      timestamptz DEFAULT now()
);
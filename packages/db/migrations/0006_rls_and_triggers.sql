-- =============================================================================
-- Migration 0006: Row Level Security + updated_at triggers
--
-- Run AFTER 0001–0005.
-- All DROP POLICY / CREATE POLICY pairs are idempotent — safe to re-run.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- updated_at trigger function (shared by all tables)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Attach to every table that has an updated_at column
DROP TRIGGER IF EXISTS trg_deals_updated_at          ON deals;
DROP TRIGGER IF EXISTS trg_user_profiles_updated_at  ON user_profiles;
DROP TRIGGER IF EXISTS trg_deal_ratings_updated_at   ON deal_ratings;
DROP TRIGGER IF EXISTS trg_deal_comments_updated_at  ON deal_comments;
DROP TRIGGER IF EXISTS trg_retailers_updated_at      ON retailers;

CREATE TRIGGER trg_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_deal_ratings_updated_at
  BEFORE UPDATE ON deal_ratings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_deal_comments_updated_at
  BEFORE UPDATE ON deal_comments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_retailers_updated_at
  BEFORE UPDATE ON retailers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- DEALS
-- Approved deals are public. All deals readable by authenticated users (deal
-- detail page). Only the service role (agents) may write.
-- =============================================================================
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deals_anon_read_approved"         ON deals;
DROP POLICY IF EXISTS "deals_authenticated_read_all"     ON deals;

CREATE POLICY "deals_anon_read_approved" ON deals
  FOR SELECT TO anon
  USING (status = 'approved');

CREATE POLICY "deals_authenticated_read_all" ON deals
  FOR SELECT TO authenticated
  USING (true);

-- Agents use service_role key which bypasses RLS — no INSERT/UPDATE policy needed.


-- =============================================================================
-- RETAILERS
-- Public read of active retailers only.
-- =============================================================================
ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "retailers_public_read" ON retailers;

CREATE POLICY "retailers_public_read" ON retailers
  FOR SELECT
  USING (active = true);


-- =============================================================================
-- PRICE_HISTORY
-- Public read (used for price history charts).
-- =============================================================================
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "price_history_public_read" ON price_history;

CREATE POLICY "price_history_public_read" ON price_history
  FOR SELECT
  USING (true);


-- =============================================================================
-- USER_PROFILES
-- Users can only see and edit their own profile.
-- Row is auto-created by the auth trigger (handled in app code).
-- =============================================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_profiles_own_select" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_own_insert" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_own_update" ON user_profiles;

CREATE POLICY "user_profiles_own_select" ON user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "user_profiles_own_insert" ON user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_own_update" ON user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);


-- =============================================================================
-- USER_SIGNALS
-- Authenticated users write and read their own signals.
-- Anonymous sessions may insert signals with a null user_id (pre-consent).
-- =============================================================================
ALTER TABLE user_signals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_signals_own_read"   ON user_signals;
DROP POLICY IF EXISTS "user_signals_own_write"  ON user_signals;
DROP POLICY IF EXISTS "user_signals_anon_insert" ON user_signals;

CREATE POLICY "user_signals_own_read" ON user_signals
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_signals_own_write" ON user_signals
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Anonymous signals: user_id must be NULL (pre-login browsing)
CREATE POLICY "user_signals_anon_insert" ON user_signals
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);


-- =============================================================================
-- DEAL_RATINGS
-- Anyone can read. Authenticated users manage only their own ratings.
-- =============================================================================
ALTER TABLE deal_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deal_ratings_public_read"  ON deal_ratings;
DROP POLICY IF EXISTS "deal_ratings_own_insert"   ON deal_ratings;
DROP POLICY IF EXISTS "deal_ratings_own_update"   ON deal_ratings;
DROP POLICY IF EXISTS "deal_ratings_own_delete"   ON deal_ratings;

CREATE POLICY "deal_ratings_public_read" ON deal_ratings
  FOR SELECT
  USING (true);

CREATE POLICY "deal_ratings_own_insert" ON deal_ratings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "deal_ratings_own_update" ON deal_ratings
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "deal_ratings_own_delete" ON deal_ratings
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- =============================================================================
-- DEAL_COMMENTS
-- Anyone can read. Authenticated users can create comments.
-- Users can only edit/delete their own comments.
-- =============================================================================
ALTER TABLE deal_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deal_comments_public_read"  ON deal_comments;
DROP POLICY IF EXISTS "deal_comments_own_insert"   ON deal_comments;
DROP POLICY IF EXISTS "deal_comments_own_update"   ON deal_comments;
DROP POLICY IF EXISTS "deal_comments_own_delete"   ON deal_comments;

CREATE POLICY "deal_comments_public_read" ON deal_comments
  FOR SELECT
  USING (true);

CREATE POLICY "deal_comments_own_insert" ON deal_comments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "deal_comments_own_update" ON deal_comments
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "deal_comments_own_delete" ON deal_comments
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- =============================================================================
-- COMMENT_REACTIONS
-- Anyone can read. Authenticated users manage only their own reactions.
-- =============================================================================
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comment_reactions_public_read" ON comment_reactions;
DROP POLICY IF EXISTS "comment_reactions_own_insert"  ON comment_reactions;
DROP POLICY IF EXISTS "comment_reactions_own_delete"  ON comment_reactions;

CREATE POLICY "comment_reactions_public_read" ON comment_reactions
  FOR SELECT
  USING (true);

CREATE POLICY "comment_reactions_own_insert" ON comment_reactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comment_reactions_own_delete" ON comment_reactions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- =============================================================================
-- AGENT_LOGS
-- No public or user-level access. Agents use service_role key (bypasses RLS).
-- Enable RLS to ensure no accidental exposure via anon/authenticated keys.
-- =============================================================================
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- No policies created — only service_role can access this table.

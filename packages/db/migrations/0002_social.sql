-- Deal ratings (1–5 stars, one per user per deal)
CREATE TABLE deal_ratings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id     uuid REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score       integer NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE(deal_id, user_id)
);

-- Deal comments (max one level of nesting via parent_id)
CREATE TABLE deal_comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id     uuid REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_id   uuid REFERENCES deal_comments(id) ON DELETE CASCADE,
  content     text NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 1000),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Comment reactions (like | heart | fire — one per user per comment per type)
CREATE TABLE comment_reactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id  uuid REFERENCES deal_comments(id) ON DELETE CASCADE NOT NULL,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type        text NOT NULL DEFAULT 'like' CHECK (type IN ('like','heart','fire')),
  created_at  timestamptz DEFAULT now(),
  UNIQUE(comment_id, user_id, type)
);

-- Auto-update triggers
CREATE TRIGGER deal_ratings_updated_at     BEFORE UPDATE ON deal_ratings     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER deal_comments_updated_at    BEFORE UPDATE ON deal_comments    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE deal_ratings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_comments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

-- Ratings policies
CREATE POLICY "ratings are public"         ON deal_ratings FOR SELECT USING (true);
CREATE POLICY "users insert own rating"    ON deal_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own rating"    ON deal_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users delete own rating"    ON deal_ratings FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "comments are public"        ON deal_comments FOR SELECT USING (true);
CREATE POLICY "users post comments"        ON deal_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users edit own comments"    ON deal_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users delete own comments"  ON deal_comments FOR DELETE USING (auth.uid() = user_id);

-- Reactions policies
CREATE POLICY "reactions are public"       ON comment_reactions FOR SELECT USING (true);
CREATE POLICY "users react"                ON comment_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users remove own reaction"  ON comment_reactions FOR DELETE USING (auth.uid() = user_id);

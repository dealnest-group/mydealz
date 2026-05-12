-- Add preference profile column to user_profiles
-- Stores category scores + price range computed by personalisation_agent.py
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferences jsonb;

-- Index for fast pgvector similarity search on deal embeddings
-- (Only useful once embedding_agent.py has populated the vectors)
CREATE INDEX IF NOT EXISTS deals_embedding_idx
  ON deals USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

-- Index for fast pgvector similarity on user embeddings
CREATE INDEX IF NOT EXISTS user_profiles_embedding_idx
  ON user_profiles USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 10);

-- RPC: returns approved deals sorted by cosine similarity to a user's embedding
-- Called from /for-you page when user has a profile embedding
CREATE OR REPLACE FUNCTION match_deals_for_user(user_id uuid, match_count int DEFAULT 24)
RETURNS TABLE (
  id              uuid,
  title           text,
  similarity      float
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  user_vec vector(768);
BEGIN
  SELECT embedding INTO user_vec
  FROM user_profiles
  WHERE user_profiles.id = user_id;

  IF user_vec IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
    SELECT
      deals.id,
      deals.title,
      1 - (deals.embedding <=> user_vec) AS similarity
    FROM deals
    WHERE
      deals.status    = 'approved'
      AND deals.embedding IS NOT NULL
    ORDER BY deals.embedding <=> user_vec
    LIMIT match_count;
END;
$$;

-- Grant execute to authenticated and anon (RLS on underlying tables still applies)
GRANT EXECUTE ON FUNCTION match_deals_for_user(uuid, int) TO authenticated, anon;

-- Idempotency support for the Listing Agent.
-- last_fetched_at lets the agent skip retailers synced within the last 25 minutes,
-- so a crash+restart never double-processes a retailer.
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS last_fetched_at timestamptz;
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Efficient "give me retailers not recently synced" query
CREATE INDEX IF NOT EXISTS idx_retailers_active_fetched
    ON retailers (last_fetched_at)
    WHERE active = true;

-- QA Agent: fast pending deal scan
CREATE INDEX IF NOT EXISTS idx_deals_pending
    ON deals (status)
    WHERE status = 'pending';

-- Deal feed queries: filter by retailer + status together
CREATE INDEX IF NOT EXISTS idx_deals_retailer_status
    ON deals (retailer_id, status);

-- Note: embedding indexes are in 0003_personalisation.sql — not duplicated here.

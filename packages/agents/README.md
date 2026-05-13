# packages/agents — Python AI Agent Workers

**Owner: Imran**

Five stateless Python scripts triggered by GitHub Actions cron. Each agent reads from Supabase, does its job, writes back, and exits. No long-running processes.

---

## Agents

| Agent | Trigger | What it does |
|---|---|---|
| `listing_agent.py` | Every 30 min | Fetches AWIN/CJ XML feeds, upserts pending deals. Idempotent via `last_fetched_at`. |
| `qa_agent.py` | Every 15 min | Validates pending deals (data quality + LLM authenticity score). No live scraping. |
| `scraper_agent.py` | Daily | Scrapes Aldi/Lidl (no AWIN feed) via ScraperAPI + OG image fetching. |
| `embedding_agent.py` | Nightly 03:00 | Generates 768-dim nomic-embed-text vectors for approved deals → `deals.embedding`. |
| `personalisation_agent.py` | Nightly 02:00 | Builds user preference profiles from ratings/comments/reactions → `user_profiles.preferences`. |

---

## Shared utilities

| File | Purpose |
|---|---|
| `llm.py` | LLM abstraction — Ollama locally, Groq in production. Has retry logic. **Never call Groq/Ollama directly.** |
| `db.py` | Supabase client factory. **Never call `create_client()` directly in agents.** |
| `logger.py` | Structured JSON logger — writes to stdout AND inserts to `agent_logs` table. |
| `embedder.py` | Embedding abstraction — fastembed locally, HuggingFace in production. |

---

## Rules every agent must follow

1. **Stateless** — no in-memory state between runs. Read from DB, write to DB, exit.
2. **`--dry-run` flag** — every agent must support `--dry-run`. Logs actions without writing to DB.
3. **Structured logging** — every agent calls `log()` from `logger.py` at the end of its run.
4. **Retry** — use the `with_retry` decorator (see `listing_agent.py`) for any external HTTP call.
5. **LLM via `llm.py` only** — never import `groq` or `ollama` directly in an agent script.
6. **`run_id`** — generate a UUID at the start of each run and pass it in the log metadata.

---

## Local development

```bash
# 1. Copy env file
cp .env.example .env.local
# Fill in SUPABASE_URL, SUPABASE_SERVICE_KEY. Leave AGENT_ENV=local.

# 2. Start Ollama (required for local LLM)
ollama serve
ollama pull llama3.1:8b
ollama pull nomic-embed-text

# 3. Run any agent in dry-run mode
python listing_agent.py --dry-run
python qa_agent.py --dry-run
python embedding_agent.py --dry-run
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Always | Project URL from Supabase dashboard |
| `SUPABASE_SERVICE_KEY` | Always | Service role key (bypasses RLS — keep secret) |
| `AGENT_ENV` | Always | `local` (Ollama) or `production` (Groq) |
| `GROQ_API_KEY` | Production | Groq API key |
| `AWIN_API_KEY` | Listing agent | AWIN publisher API key |
| `SCRAPERAPI_KEY` | Scraper agent | ScraperAPI key for Aldi/Lidl |
| `HF_API_KEY` | Optional | HuggingFace API key — falls back to fastembed if missing |

---

## Adding a new agent

1. Create `your_agent.py` in this directory.
2. Follow the pattern: `run(dry_run=False)` function, `argparse` for `--dry-run`, call `log()` at end.
3. Add a GitHub Actions workflow in `.github/workflows/your_agent.yml` (copy from `qa_agent.yml`).
4. Add the workflow's required secrets to `docs/ROLES.md` and notify Imran to add them to GitHub Secrets.
5. Write tests in `tests/test_your_agent.py` before raising a PR.

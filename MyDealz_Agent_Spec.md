# MyDealz — Agent Technical Specification

## Overview

Four Python agents run as stateless GitHub Actions jobs.
All share common utilities in `packages/agents/`.
Local dev uses Ollama. Production uses Groq API.
No long-running processes. No BullMQ. No separate queue server.

---

## Database schema (Supabase / Postgres)

```sql
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
```

---

## Shared utilities

### packages/agents/llm.py
```python
import os
from groq import Groq
import ollama

AGENT_ENV = os.getenv("AGENT_ENV", "local")

def complete(prompt: str, system: str = "", model: str = None) -> str:
    if AGENT_ENV == "local":
        model = model or "llama3.1:8b"
        response = ollama.chat(
            model=model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt}
            ]
        )
        return response["message"]["content"]
    else:
        model = model or "llama-3.1-8b-instant"
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt}
            ],
            max_tokens=512,
            temperature=0.1
        )
        return response.choices[0].message.content
```

### packages/agents/embedder.py
```python
import os
import requests
import ollama

AGENT_ENV = os.getenv("AGENT_ENV", "local")
HF_API_KEY = os.getenv("HF_API_KEY")
EMBED_MODEL = "nomic-ai/nomic-embed-text-v1"

def embed(text: str) -> list[float]:
    if AGENT_ENV == "local":
        response = ollama.embeddings(model="nomic-embed-text", prompt=text)
        return response["embedding"]
    else:
        response = requests.post(
            f"https://api-inference.huggingface.co/pipeline/feature-extraction/{EMBED_MODEL}",
            headers={"Authorization": f"Bearer {HF_API_KEY}"},
            json={"inputs": text, "options": {"wait_for_model": True}}
        )
        return response.json()[0]
```

---

## Agent 1 — Listing Agent

**File**: `packages/agents/listing_agent.py`
**Trigger**: Every 30 minutes — `.github/workflows/listing_agent.yml`

```python
"""
Listing Agent — fetches deals from AWIN/CJ feeds and writes pending listings to Supabase.
No LLM required. Pure data ingestion and normalisation.
"""
import argparse
import time
import xml.etree.ElementTree as ET
import requests
from db import get_client
from logger import log

def fetch_awin_feed(retailer: dict) -> list[dict]:
    response = requests.get(retailer["feed_url"], timeout=30)
    root = ET.fromstring(response.content)
    deals = []
    for item in root.findall(".//prod"):
        deals.append({
            "external_id": item.findtext("id"),
            "title": item.findtext("name"),
            "url": item.findtext("merchantProductUrl"),
            "affiliate_url": item.findtext("aw_deep_link"),
            "image_url": item.findtext("aw_image_url"),
            "price_current": float(item.findtext("search_price") or 0),
            "price_was": float(item.findtext("was_price") or 0) or None,
            "category": item.findtext("merchant_category"),
            "description": item.findtext("description"),
        })
    return deals

def normalise(deal: dict, retailer_id: str) -> dict:
    discount_pct = None
    if deal.get("price_was") and deal["price_was"] > deal["price_current"]:
        discount_pct = round(
            (deal["price_was"] - deal["price_current"]) / deal["price_was"] * 100, 1
        )
    return {
        "retailer_id": retailer_id,
        "external_id": deal["external_id"],
        "title": deal["title"][:500],
        "description": deal.get("description", "")[:2000],
        "url": deal["url"],
        "affiliate_url": deal["affiliate_url"],
        "image_url": deal.get("image_url"),
        "price_current": deal["price_current"],
        "price_was": deal.get("price_was"),
        "discount_pct": discount_pct,
        "category": deal.get("category"),
        "status": "pending",
    }

def run(dry_run: bool = False):
    start = time.time()
    db = get_client()
    retailers = db.table("retailers").select("*").eq("active", True).execute().data
    total, errors = 0, 0

    for retailer in retailers:
        try:
            raw = fetch_awin_feed(retailer)
            for item in raw:
                normalised = normalise(item, retailer["id"])
                if not dry_run:
                    db.table("deals").upsert(
                        normalised,
                        on_conflict="retailer_id,external_id"
                    ).execute()
                total += 1
        except Exception as e:
            errors += 1
            print(f"Error on {retailer['name']}: {e}")

    log("listing_agent", "success" if not errors else "partial",
        total, errors, int((time.time() - start) * 1000))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    run(dry_run=args.dry_run)
```

---

## Agent 2 — QA Agent

**File**: `packages/agents/qa_agent.py`
**Trigger**: Every 15 minutes — `.github/workflows/qa_agent.yml`

```python
"""
QA Agent — validates pending deals. Live price check + LLM authenticity scoring.
Uses Groq (prod) or Ollama (local) to score discount authenticity.
"""
import time
import requests
from bs4 import BeautifulSoup
from db import get_client
from llm import complete
from logger import log

AUTHENTICITY_PROMPT = """
You are a deals verification assistant. Given a deal listing, score how authentic the discount is.

Deal: {title}
Listed price: £{price_current}
Was price: £{price_was}
Discount: {discount_pct}%
Category: {category}

Score from 0-100 where:
100 = genuine discount, price history confirms it was higher
50  = plausible but unverifiable
0   = likely fake "was" price, inflated to manufacture a discount

Respond with ONLY a JSON object: {{"score": <number>, "reason": "<brief reason>"}}
"""

def check_live_price(url: str, expected_price: float) -> tuple[bool, float | None]:
    try:
        r = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
        soup = BeautifulSoup(r.text, "html.parser")
        # Look for common price patterns — extend per retailer
        price_el = soup.select_one("[itemprop='price'], .price, .product-price")
        if price_el:
            live_price = float(price_el.get("content") or price_el.text.strip()
                              .replace("£","").replace(",","").split()[0])
            return abs(live_price - expected_price) < 0.50, live_price
    except:
        pass
    return True, None  # If check fails, don't reject — just approve cautiously

def score_authenticity(deal: dict) -> tuple[int, str]:
    if not deal.get("price_was") or not deal.get("discount_pct"):
        return 75, "No was-price to verify"
    prompt = AUTHENTICITY_PROMPT.format(**deal)
    try:
        import json
        result = json.loads(complete(prompt))
        return result["score"], result["reason"]
    except:
        return 50, "Could not parse LLM response"

def run(dry_run: bool = False):
    start = time.time()
    db = get_client()
    pending = db.table("deals").select("*").eq("status", "pending").limit(200).execute().data
    approved, rejected, errors = 0, 0, 0

    for deal in pending:
        try:
            price_ok, live_price = check_live_price(deal["url"], deal["price_current"])
            if not price_ok:
                if not dry_run:
                    db.table("deals").update({
                        "status": "rejected",
                        "rejection_reason": f"Price mismatch: expected £{deal['price_current']}, found £{live_price}"
                    }).eq("id", deal["id"]).execute()
                rejected += 1
                continue

            score, reason = score_authenticity(deal)
            status = "approved" if score >= 40 else "rejected"
            if not dry_run:
                db.table("deals").update({
                    "status": status,
                    "authenticity_score": score,
                    "rejection_reason": reason if status == "rejected" else None
                }).eq("id", deal["id"]).execute()

            if status == "approved":
                approved += 1
            else:
                rejected += 1

        except Exception as e:
            errors += 1
            print(f"Error on deal {deal['id']}: {e}")

    log("qa_agent", "success" if not errors else "partial",
        approved + rejected, errors, int((time.time() - start) * 1000))

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    run(dry_run=args.dry_run)
```

---

## GitHub Actions schedules

### .github/workflows/listing_agent.yml
```yaml
name: Listing Agent
on:
  schedule:
    - cron: '*/30 * * * *'
  workflow_dispatch:
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - run: pip install -r packages/agents/requirements.txt
      - run: python packages/agents/listing_agent.py
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          AGENT_ENV: production
```

### .github/workflows/qa_agent.yml
```yaml
name: QA Agent
on:
  schedule:
    - cron: '*/15 * * * *'
  workflow_dispatch:
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - run: pip install -r packages/agents/requirements.txt
      - run: python packages/agents/qa_agent.py
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}
          AGENT_ENV: production
```

---

## packages/agents/requirements.txt
```
supabase==2.4.0
groq==0.8.0
ollama==0.2.1
requests==2.31.0
beautifulsoup4==4.12.3
python-dotenv==1.0.0
```

---

## Local dev setup
```bash
# 1. Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# 2. Pull models
ollama pull llama3.1:8b
ollama pull nomic-embed-text

# 3. Set env
cp packages/agents/.env.example packages/agents/.env.local
# Add SUPABASE_URL, SUPABASE_SERVICE_KEY, AGENT_ENV=local

# 4. Run listing agent in dry-run
cd packages/agents
python listing_agent.py --dry-run

# 5. Run QA agent in dry-run
python qa_agent.py --dry-run
```

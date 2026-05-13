#!/usr/bin/env python3
"""
QA Agent — validates pending deals using data quality checks and LLM scoring.

Live price scraping was removed: retailer sites (Amazon, Currys, Boots) block
bots within days, making it unreliable from day one. Feed freshness via the
Listing Agent's 25-minute cooldown is the accuracy mechanism instead.
Phase 2 will add per-retailer price APIs (Amazon PA-API etc.) when budget allows.
"""
import argparse
import json
import re
import time
import uuid
from datetime import datetime, timezone, timedelta

from db import get_client
from llm import complete
from logger import log

BATCH_SIZE = 200
MAX_DEAL_AGE_DAYS = 7
MIN_AUTHENTICITY_SCORE = 40

AUTHENTICITY_PROMPT = """\
You are a deals verification assistant for a UK price comparison site.

Deal: {title}
Listed price: £{price_current}
Was price: £{price_was}
Discount: {discount_pct}%
Category: {category}

Score the authenticity of this discount 0–100:
80–100 = genuine discount with a realistic was-price
40–79  = plausible but unverifiable from feed data
0–39   = likely fake "was" price or inflated discount

Respond ONLY with valid JSON (no other text): {{"score": <integer>, "reason": "<10 words max>"}}\
"""


def validate_deal(deal: dict) -> tuple[bool, str]:
    """Data quality checks — no network calls."""
    title = deal.get('title') or ''
    if len(title.strip()) < 5:
        return False, 'title too short'

    price = deal.get('price_current')
    if not isinstance(price, (int, float)) or price <= 0:
        return False, 'invalid price'

    if not re.match(r'^https?://', deal.get('url') or ''):
        return False, 'invalid url'

    if not re.match(r'^https?://', deal.get('affiliate_url') or ''):
        return False, 'missing affiliate url'

    # Verify stated discount_pct is consistent with price_current and price_was
    price_was = deal.get('price_was')
    discount_pct = deal.get('discount_pct')
    if price_was and price_was > 0 and discount_pct is not None:
        expected = round((price_was - price) / price_was * 100, 0)
        if abs(expected - float(discount_pct)) > 5:
            return False, f'discount mismatch: stated {discount_pct}% vs calculated {expected}%'

    # Auto-reject deals stuck in pending too long — the feed has moved on
    created_at = deal.get('created_at') or ''
    if created_at:
        try:
            age = datetime.now(timezone.utc) - datetime.fromisoformat(
                created_at.replace('Z', '+00:00')
            )
            if age > timedelta(days=MAX_DEAL_AGE_DAYS):
                return False, f'stale: pending for {age.days} days'
        except ValueError:
            pass

    return True, ''


def score_authenticity(deal: dict) -> tuple[int, str]:
    if not deal.get('price_was') or not deal.get('discount_pct'):
        return 75, 'no was-price to verify'
    try:
        raw = complete(AUTHENTICITY_PROMPT.format(
            title=(deal.get('title') or '')[:200],
            price_current=deal.get('price_current', 0),
            price_was=deal.get('price_was', 'N/A'),
            discount_pct=deal.get('discount_pct', 'N/A'),
            category=deal.get('category', 'unknown'),
        ))
        result = json.loads(raw)
        score = max(0, min(100, int(result.get('score', 50))))
        reason = str(result.get('reason', ''))[:200]
        return score, reason
    except Exception:
        return 50, 'could not parse llm response'


def run(dry_run: bool = False) -> None:
    start = time.time()
    run_id = str(uuid.uuid4())
    db = get_client()

    pending = (
        db.table('deals')
        .select('*')
        .eq('status', 'pending')
        .limit(BATCH_SIZE)
        .execute()
        .data
    )

    if not pending:
        log('qa_agent', 'success', 0, 0, 0, {'run_id': run_id, 'note': 'no pending deals'})
        return

    approved, rejected, errors = 0, 0, 0

    for deal in pending:
        try:
            valid, rejection_reason = validate_deal(deal)
            if not valid:
                if not dry_run:
                    db.table('deals').update({
                        'status': 'rejected',
                        'rejection_reason': rejection_reason,
                    }).eq('id', deal['id']).execute()
                rejected += 1
                continue

            score, reason = score_authenticity(deal)
            status = 'approved' if score >= MIN_AUTHENTICITY_SCORE else 'rejected'

            if not dry_run:
                db.table('deals').update({
                    'status': status,
                    'authenticity_score': score,
                    'rejection_reason': reason if status == 'rejected' else None,
                }).eq('id', deal['id']).execute()

            if status == 'approved':
                approved += 1
            else:
                rejected += 1

        except Exception as exc:
            errors += 1
            print(f'Error on deal {deal.get("id")}: {exc}')

    log(
        'qa_agent',
        'success' if not errors else 'partial',
        approved + rejected,
        errors,
        int((time.time() - start) * 1000),
        {'run_id': run_id, 'approved': approved, 'rejected': rejected, 'dry_run': dry_run},
    )


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    run(dry_run=args.dry_run)

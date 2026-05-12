#!/usr/bin/env python3
"""
QA Agent — validates pending deals. Live price check + LLM authenticity scoring.
Uses Groq (production) or Ollama (local) to score discount authenticity.
"""
import argparse
import json
import time
import requests
from bs4 import BeautifulSoup
from db import get_client
from llm import complete
from logger import log

AUTHENTICITY_PROMPT = """\
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

Respond with ONLY a JSON object: {{"score": <number>, "reason": "<brief reason>"}}\
"""


def check_live_price(url: str, expected_price: float) -> tuple[bool, float | None]:
    try:
        r = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
        soup = BeautifulSoup(r.text, 'html.parser')
        price_el = soup.select_one("[itemprop='price'], .price, .product-price")
        if price_el:
            raw = price_el.get('content') or price_el.text.strip()
            live_price = float(str(raw).replace('£', '').replace(',', '').split()[0])
            return abs(live_price - expected_price) < 0.50, live_price
    except Exception:
        pass
    return True, None  # fail open — don't reject if check fails


def score_authenticity(deal: dict) -> tuple[int, str]:
    if not deal.get('price_was') or not deal.get('discount_pct'):
        return 75, 'No was-price to verify'
    prompt = AUTHENTICITY_PROMPT.format(**deal)
    try:
        result = json.loads(complete(prompt))
        return int(result['score']), str(result['reason'])
    except Exception:
        return 50, 'Could not parse LLM response'


def run(dry_run: bool = False) -> None:
    start = time.time()
    db = get_client()
    pending = (
        db.table('deals').select('*').eq('status', 'pending').limit(200).execute().data
    )
    approved, rejected, errors = 0, 0, 0

    for deal in pending:
        try:
            price_ok, live_price = check_live_price(deal['url'], deal['price_current'])
            if not price_ok:
                if not dry_run:
                    db.table('deals').update({
                        'status': 'rejected',
                        'rejection_reason': (
                            f"Price mismatch: expected £{deal['price_current']}, found £{live_price}"
                        ),
                    }).eq('id', deal['id']).execute()
                rejected += 1
                continue

            score, reason = score_authenticity(deal)
            status = 'approved' if score >= 40 else 'rejected'
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
            print(f'Error on deal {deal["id"]}: {exc}')

    log(
        'qa_agent',
        'success' if not errors else 'partial',
        approved + rejected,
        errors,
        int((time.time() - start) * 1000),
    )


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    run(dry_run=args.dry_run)

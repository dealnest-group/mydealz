#!/usr/bin/env python3
"""
Personalisation Agent — builds user preference profiles from their activity.

Phase 1 (now):   Category + price-range preference weights → user_profiles.preferences jsonb
Phase 2 (later): Vector-based: weighted mean of deal embeddings → user_profiles.embedding

Weights used:
  rating × score  (e.g. 5-star = 5 pts, 3-star = 3 pts)
  comment         3 pts
  reaction fire   2 pts
  reaction heart  1.5 pts
  reaction like   1 pt
"""
import argparse
import json
import time
from db import get_client
from logger import log


REACTION_WEIGHTS = {'fire': 2.0, 'heart': 1.5, 'like': 1.0}


def build_profile(user_id: str, db) -> dict:
    """Returns a preference profile dict for a single user."""
    ratings   = db.table('deal_ratings').select('score, deals(category, price_current)') \
                  .eq('user_id', user_id).execute().data or []
    comments  = db.table('deal_comments').select('deals(category, price_current)') \
                  .eq('user_id', user_id).execute().data or []
    reactions = db.table('comment_reactions') \
                  .select('type, deal_comments(deals(category, price_current))') \
                  .eq('user_id', user_id).execute().data or []

    cat_scores: dict[str, float] = {}
    prices: list[float] = []

    def score_deal(category: str | None, price: float | None, weight: float) -> None:
        if category:
            cat_scores[category] = cat_scores.get(category, 0.0) + weight
        if price:
            prices.append(price)

    for r in ratings:
        deal = r.get('deals') or {}
        score_deal(deal.get('category'), deal.get('price_current'), float(r.get('score', 1)))

    for c in comments:
        deal = c.get('deals') or {}
        score_deal(deal.get('category'), deal.get('price_current'), 3.0)

    for r in reactions:
        deal = (r.get('deal_comments') or {}).get('deals') or {}
        w = REACTION_WEIGHTS.get(r.get('type', ''), 1.0)
        score_deal(deal.get('category'), deal.get('price_current'), w)

    top_categories = sorted(cat_scores.items(), key=lambda x: -x[1])[:5]
    avg_price = round(sum(prices) / len(prices), 2) if prices else None

    return {
        'top_categories': [{'category': c, 'score': round(s, 2)} for c, s in top_categories],
        'avg_price': avg_price,
        'interaction_count': len(ratings) + len(comments) + len(reactions),
    }


def run(dry_run: bool = False) -> None:
    start = time.time()
    db = get_client()

    # Only process users who have interacted
    raters    = {r['user_id'] for r in (db.table('deal_ratings').select('user_id').execute().data or [])}
    commenters= {c['user_id'] for c in (db.table('deal_comments').select('user_id').execute().data or [])}
    reactors  = {r['user_id'] for r in (db.table('comment_reactions').select('user_id').execute().data or [])}
    user_ids  = raters | commenters | reactors

    print(f'Users to profile: {len(user_ids)}')
    processed = errors = 0

    for uid in user_ids:
        try:
            profile = build_profile(uid, db)
            if dry_run:
                print(f'  [dry] {uid[:8]}.. -> {profile}')
            else:
                db.table('user_profiles').upsert(
                    {'id': uid, 'preferences': json.dumps(profile)},
                    on_conflict='id',
                ).execute()
                cats = [c['category'] for c in profile['top_categories']]
                print(f'  + {uid[:8]}.. top={cats}')
            processed += 1
        except Exception as exc:
            errors += 1
            print(f'  Error for {uid}: {exc}')

    log('personalisation_agent', 'success' if not errors else 'partial',
        processed, errors, int((time.time() - start) * 1000))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    run(dry_run=args.dry_run)

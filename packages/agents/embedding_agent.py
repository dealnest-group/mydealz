#!/usr/bin/env python3
"""
Embedding Agent — generates 768-dim nomic-embed-text vectors for all approved deals
and stores them in deals.embedding (pgvector). Requires HF_API_KEY or Ollama.

Run after listing_agent.py to make deals eligible for vector recommendations.
"""
import argparse
import os
import time
from db import get_client
from embedder import embed
from logger import log

BATCH_SIZE = 50  # deals processed per run


def build_text(deal: dict) -> str:
    """Concatenate deal fields into the text to embed."""
    parts = [
        deal.get('title') or '',
        deal.get('category') or '',
        deal.get('description') or '',
        deal.get('retailers', {}).get('name') if isinstance(deal.get('retailers'), dict) else '',
    ]
    return ' | '.join(p for p in parts if p)


def run(dry_run: bool = False, force: bool = False) -> None:
    start = time.time()
    db = get_client()

    query = (
        db.table('deals')
        .select('id, title, category, description, retailers(name)')
        .eq('status', 'approved')
        .limit(BATCH_SIZE)
    )
    if not force:
        query = query.is_('embedding', 'null')

    deals = query.execute().data
    print(f'Deals to embed: {len(deals)}')

    processed = errors = 0
    for deal in deals:
        text = build_text(deal)
        if not text.strip():
            continue
        try:
            vector = embed(text)
            if dry_run:
                print(f'  [dry] {deal["title"][:50]} -> vector[{len(vector)}]')
            else:
                db.table('deals').update({'embedding': vector}).eq('id', deal['id']).execute()
                print(f'  + {deal["title"][:50]}')
            processed += 1
        except Exception as exc:
            errors += 1
            print(f'  Error on {deal["id"]}: {exc}')

    log('embedding_agent', 'success' if not errors else 'partial',
        processed, errors, int((time.time() - start) * 1000))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--force', action='store_true', help='Re-embed deals that already have a vector')
    args = parser.parse_args()
    run(dry_run=args.dry_run, force=args.force)

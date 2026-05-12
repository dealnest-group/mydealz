#!/usr/bin/env python3
"""
Listing Agent — fetches deals from AWIN/CJ product feeds → upserts pending deals to Supabase.
Supports AWIN (API key + feed ID), CJ (direct URL), and any direct XML feed URL.
"""
import argparse
import os
import time
import xml.etree.ElementTree as ET
import requests
from db import get_client
from logger import log

AWIN_API_KEY = os.getenv('AWIN_API_KEY', '')

# The exact columns we pull from AWIN — don't remove any, listing_agent.py maps them
AWIN_COLUMNS = ','.join([
    'aw_product_id',
    'product_name',
    'merchant_product_url',
    'aw_deep_link',
    'aw_image_url',
    'description',
    'merchant_category',
    'search_price',
    'was_price',
])

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; MyDealz/1.0)',
}


def build_feed_url(retailer: dict) -> str | None:
    """
    Returns the full XML feed URL for a retailer.

    - affiliate_network='awin'  → constructs productdata.awin.com URL from feed_url (= feed ID)
    - affiliate_network='cj'    → feed_url is the direct CJ URL
    - affiliate_network='direct'→ feed_url is any direct XML URL
    - feed_url is None          → skip (no feed configured yet)
    """
    feed_url = retailer.get('feed_url') or ''
    network = (retailer.get('affiliate_network') or '').lower()

    if not feed_url:
        return None

    if network == 'awin':
        if not AWIN_API_KEY:
            print(f'  [skip] AWIN_API_KEY not set — cannot fetch {retailer["name"]}')
            return None
        # feed_url stores just the numeric Feed ID from AWIN dashboard
        feed_id = feed_url.strip()
        return (
            f'https://productdata.awin.com/datafeed/list/apikey/{AWIN_API_KEY}'
            f'/language/en/fid/{feed_id}'
            f'/columns/{AWIN_COLUMNS}'
            f'/format/xml/'
        )

    # CJ or direct — feed_url is the complete URL
    return feed_url


def fetch_feed(url: str) -> list[dict]:
    """Fetches and parses an AWIN-format XML product feed."""
    response = requests.get(url, headers=HEADERS, timeout=60)
    response.raise_for_status()
    root = ET.fromstring(response.content)
    deals = []

    for item in root.findall('.//prod'):
        # AWIN XML field names
        price_str  = item.findtext('search_price') or item.findtext('price') or '0'
        was_str    = item.findtext('was_price') or ''

        try:
            price = float(price_str.replace(',', ''))
        except ValueError:
            continue  # skip malformed price rows

        try:
            was = float(was_str.replace(',', '')) if was_str else None
        except ValueError:
            was = None

        deals.append({
            'external_id':  item.findtext('id') or item.findtext('aw_product_id') or '',
            'title':        item.findtext('name') or item.findtext('product_name') or '',
            'url':          item.findtext('merchantProductUrl') or item.findtext('merchant_product_url') or '',
            'affiliate_url':item.findtext('aw_deep_link') or '',
            'image_url':    item.findtext('aw_image_url') or None,
            'price_current':price,
            'price_was':    was if was and was > price else None,
            'category':     item.findtext('merchant_category') or item.findtext('category_name') or None,
            'description':  item.findtext('description') or '',
        })

    return deals


def normalise(deal: dict, retailer_id: str) -> dict:
    discount_pct = None
    if deal.get('price_was') and deal['price_was'] > deal['price_current'] > 0:
        discount_pct = round(
            (deal['price_was'] - deal['price_current']) / deal['price_was'] * 100, 1
        )
    return {
        'retailer_id':   retailer_id,
        'external_id':   str(deal['external_id'])[:200],
        'title':         (deal['title'] or '')[:500],
        'description':   (deal.get('description') or '')[:2000],
        'url':           deal['url'],
        'affiliate_url': deal['affiliate_url'] or deal['url'],
        'image_url':     deal.get('image_url'),
        'price_current': deal['price_current'],
        'price_was':     deal.get('price_was'),
        'discount_pct':  discount_pct,
        'category':      deal.get('category'),
        'status':        'pending',
    }


def run(dry_run: bool = False) -> None:
    start = time.time()
    db = get_client()
    retailers = (
        db.table('retailers')
        .select('*')
        .eq('active', True)
        .execute()
        .data
    )
    total, errors = 0, 0

    for retailer in retailers:
        url = build_feed_url(retailer)
        if not url:
            continue

        print(f"\nFetching {retailer['name']} ({retailer.get('affiliate_network','?')}) ...")
        try:
            raw = fetch_feed(url)
            print(f'  {len(raw)} products in feed')

            # Only upsert deals with a discount
            deals_with_discount = [d for d in raw if d.get('price_was')]
            print(f'  {len(deals_with_discount)} with a was-price (discount)')

            for item in deals_with_discount:
                normalised = normalise(item, retailer['id'])
                if dry_run:
                    print(f'  [dry] {normalised["title"][:55]:<55} £{normalised["price_current"]:>7.2f}')
                else:
                    db.table('deals').upsert(
                        normalised,
                        on_conflict='retailer_id,external_id',
                    ).execute()
                total += 1

        except Exception as exc:
            errors += 1
            print(f'  Error on {retailer["name"]}: {exc}')

    log(
        'listing_agent',
        'success' if not errors else 'partial',
        total,
        errors,
        int((time.time() - start) * 1000),
    )


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    run(dry_run=args.dry_run)

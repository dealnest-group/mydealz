#!/usr/bin/env python3
"""
Scraper Agent — scrapes deals from retailers that don't use AWIN/CJ affiliate feeds.
Currently supports: Aldi UK Specialbuys, Lidl UK weekly offers.
"""
import argparse
import json
import os
import re
import time
from typing import Optional
import requests
from bs4 import BeautifulSoup
from db import get_client
from logger import log

HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/124.0.0.0 Safari/537.36'
    ),
    'Accept-Language': 'en-GB,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

SCRAPERAPI_KEY = os.getenv('SCRAPERAPI_KEY')

RETAILERS = [
    {
        'name': 'Aldi UK',
        'slug': 'aldi-uk',
        'base_url': 'https://www.aldi.co.uk',
        'scrape_url': 'https://www.aldi.co.uk/en/specialbuys/',
        'affiliate_network': 'direct',
        'parser': 'aldi',
    },
    # Lidl prices are fully JS-rendered with heavy lazy loading.
    # Will be enabled once ScraperAPI session-based scraping is wired up.
    # {
    #     'name': 'Lidl UK',
    #     'slug': 'lidl-uk',
    #     'base_url': 'https://www.lidl.co.uk',
    #     'scrape_url': 'https://www.lidl.co.uk/c/offers',
    #     'affiliate_network': 'direct',
    #     'parser': 'lidl',
    # },
]


def fetch_og_image(product_url: str) -> Optional[str]:
    """Fetch a product page and return its og:image URL. No JS render needed."""
    try:
        if SCRAPERAPI_KEY:
            api_url = (
                f'http://api.scraperapi.com?api_key={SCRAPERAPI_KEY}'
                f'&url={requests.utils.quote(product_url, safe="")}'
                f'&country_code=gb'
            )
            r = requests.get(api_url, timeout=30)
        else:
            r = requests.get(product_url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(r.text, 'html.parser')
        og = soup.find('meta', property='og:image')
        if og and og.get('content'):
            return str(og['content'])
    except Exception as exc:
        print(f'  Image fetch failed: {exc}')
    return None


def fetch_page(url: str, wait_selector: str = '') -> Optional[BeautifulSoup]:
    try:
        if SCRAPERAPI_KEY:
            params = (
                f'http://api.scraperapi.com?api_key={SCRAPERAPI_KEY}'
                f'&url={requests.utils.quote(url, safe="")}'
                f'&render=true&country_code=gb'
            )
            if wait_selector:
                params += f'&wait_for_selector={requests.utils.quote(wait_selector, safe="")}'
            r = requests.get(params, timeout=60)
        else:
            r = requests.get(url, headers=HEADERS, timeout=15)
        r.raise_for_status()
        return BeautifulSoup(r.text, 'html.parser')
    except Exception as exc:
        print(f'  Fetch failed for {url}: {exc}')
        return None


def extract_next_data(soup: BeautifulSoup) -> Optional[dict]:
    """Extract product data from Next.js __NEXT_DATA__ JSON embedded in the page."""
    tag = soup.find('script', id='__NEXT_DATA__')
    if tag:
        try:
            return json.loads(tag.string)
        except Exception:
            pass
    return None


def extract_json_ld(soup: BeautifulSoup) -> list[dict]:
    """Extract Product structured data from JSON-LD scripts."""
    products = []
    for tag in soup.find_all('script', type='application/ld+json'):
        try:
            data = json.loads(tag.string)
            if isinstance(data, list):
                products.extend(d for d in data if d.get('@type') == 'Product')
            elif data.get('@type') == 'Product':
                products.append(data)
            elif data.get('@type') == 'ItemList':
                for item in data.get('itemListElement', []):
                    if item.get('@type') == 'Product':
                        products.append(item)
        except Exception:
            pass
    return products


def parse_price(text: str) -> Optional[float]:
    if not text:
        return None
    match = re.search(r'[\d,]+\.?\d*', text.replace(',', ''))
    return float(match.group()) if match else None


def parse_aldi(soup: BeautifulSoup, base_url: str) -> list[dict]:
    """Aldi UK Specialbuys — confirmed selectors as of 2026-05."""
    deals = []
    tiles = soup.select('div.product-tile[data-test="product-tile"]')
    for tile in tiles:
        try:
            title = tile.get('title', '').strip()
            link = tile.select_one('a[href]')
            href = link['href'] if link else ''
            if not href.startswith('http'):
                href = base_url + href

            # External ID is the numeric part at the end of the URL slug
            external_id = re.search(r'(\d{10,})$', href)
            external_id = external_id.group(1) if external_id else href.split('/')[-1]

            # Prices appear twice in the tile text (display + aria) — take first unique
            text = tile.get_text(separator=' ', strip=True)
            prices_found = list(dict.fromkeys(re.findall(r'£([\d,.]+)', text)))
            if not prices_found:
                continue
            price_current = float(prices_found[0].replace(',', ''))
            price_was = float(prices_found[1].replace(',', '')) if len(prices_found) > 1 and prices_found[1] != prices_found[0] else None

            # Image — Aldi lazy-loads via data-src
            img_el = tile.select_one('img[src], img[data-src]')
            image_url = None
            if img_el:
                image_url = img_el.get('src') or img_el.get('data-src')

            if title and price_current:
                deals.append({
                    'external_id': external_id,
                    'title': title[:500],
                    'description': '',
                    'url': href,
                    'affiliate_url': href,
                    'image_url': image_url,  # enriched later
                    'price_current': price_current,
                    'price_was': price_was,
                    'category': None,
                })
        except Exception as exc:
            print(f'  Tile parse error: {exc}')

    # Enrich images: fetch OG image from each product page
    print(f'  Fetching images for {len(deals)} products…')
    for deal in deals:
        if not deal.get('image_url') and deal.get('url'):
            deal['image_url'] = fetch_og_image(deal['url'])
            if deal['image_url']:
                print(f'    + {deal["title"][:40]}')

    return deals


def scrape_aldi(soup: BeautifulSoup, base_url: str) -> list[dict]:
    deals = []

    # Strategy 1: __NEXT_DATA__ JSON (Next.js sites embed page data here)
    next_data = extract_next_data(soup)
    if next_data:
        try:
            # Walk the Next.js page props to find product arrays
            props = next_data.get('props', {}).get('pageProps', {})
            products = (
                props.get('products')
                or props.get('items')
                or props.get('specialbuys')
                or []
            )
            for p in products:
                title = p.get('name') or p.get('title', '')
                price = p.get('price') or p.get('currentPrice') or p.get('salePrice')
                was = p.get('wasPrice') or p.get('originalPrice') or p.get('rrp')
                url = p.get('url') or p.get('link') or p.get('productUrl', '')
                if not url.startswith('http'):
                    url = base_url + url
                if title and price:
                    deals.append({
                        'external_id': p.get('id') or p.get('sku') or title[:50],
                        'title': str(title)[:500],
                        'description': str(p.get('description') or '')[:2000],
                        'url': url,
                        'affiliate_url': url,
                        'image_url': p.get('image') or p.get('imageUrl'),
                        'price_current': float(str(price).replace('£', '').replace(',', '')),
                        'price_was': float(str(was).replace('£', '').replace(',', '')) if was else None,
                        'category': p.get('category') or p.get('categoryName'),
                    })
            if deals:
                return deals
        except Exception as exc:
            print(f'  __NEXT_DATA__ parse failed: {exc}')

    # Strategy 2: JSON-LD structured data
    json_ld_products = extract_json_ld(soup)
    for p in json_ld_products:
        try:
            title = p.get('name', '')
            offer = p.get('offers', {})
            if isinstance(offer, list):
                offer = offer[0]
            price = parse_price(str(offer.get('price', '')))
            url = p.get('url') or offer.get('url', '')
            if title and price:
                deals.append({
                    'external_id': p.get('sku') or p.get('productID') or title[:50],
                    'title': str(title)[:500],
                    'description': str(p.get('description') or '')[:2000],
                    'url': url,
                    'affiliate_url': url,
                    'image_url': (p.get('image') or [None])[0] if isinstance(p.get('image'), list) else p.get('image'),
                    'price_current': price,
                    'price_was': None,
                    'category': p.get('category'),
                })
        except Exception:
            pass
    if deals:
        return deals

    # Strategy 3: BeautifulSoup HTML fallback — common deal card patterns
    card_selectors = [
        'article.product-tile',
        'div.product-tile',
        'li.product-item',
        'div[data-qa="product-card"]',
        'div.product-card',
        'div.special-buy-tile',
    ]
    for selector in card_selectors:
        cards = soup.select(selector)
        if cards:
            for card in cards:
                try:
                    title_el = card.select_one('h2, h3, .product-title, .tile-title, [data-qa="product-name"]')
                    price_el = card.select_one('.price, .current-price, [data-qa="price"]')
                    was_el = card.select_one('.was-price, .original-price, .rrp, del')
                    link_el = card.select_one('a[href]')

                    title = title_el.get_text(strip=True) if title_el else ''
                    price = parse_price(price_el.get_text(strip=True)) if price_el else None
                    was = parse_price(was_el.get_text(strip=True)) if was_el else None
                    href = link_el['href'] if link_el else ''
                    if not href.startswith('http'):
                        href = base_url + href

                    if title and price:
                        deals.append({
                            'external_id': href.split('/')[-1] or title[:50],
                            'title': title[:500],
                            'description': '',
                            'url': href,
                            'affiliate_url': href,
                            'image_url': None,
                            'price_current': price,
                            'price_was': was,
                            'category': None,
                        })
                except Exception:
                    pass
            if deals:
                return deals

    return deals


def normalise(deal: dict, retailer_id: str) -> dict:
    discount_pct = None
    if deal.get('price_was') and deal['price_was'] > deal['price_current']:
        discount_pct = round(
            (deal['price_was'] - deal['price_current']) / deal['price_was'] * 100, 1
        )
    return {
        'retailer_id': retailer_id,
        'external_id': str(deal['external_id'])[:200],
        'title': deal['title'],
        'description': deal.get('description') or '',
        'url': deal['url'],
        'affiliate_url': deal['affiliate_url'],
        'image_url': deal.get('image_url'),
        'price_current': deal['price_current'],
        'price_was': deal.get('price_was'),
        'discount_pct': discount_pct,
        'category': deal.get('category'),
        'status': 'pending',
    }


def run(dry_run: bool = False) -> None:
    start = time.time()
    db = get_client()
    total, errors = 0, 0

    parsers = {
        'aldi': parse_aldi,
        'generic': scrape_aldi,
    }

    for retailer_cfg in RETAILERS:
        scrape_url = retailer_cfg.pop('scrape_url')
        parser_name = retailer_cfg.pop('parser', 'generic')
        parser_fn = parsers.get(parser_name, scrape_aldi)
        print(f"\nScraping {retailer_cfg['name']} — {scrape_url}")

        try:
            # Upsert retailer row
            retailer = db.table('retailers').upsert(
                {**retailer_cfg, 'active': True},
                on_conflict='slug',
            ).execute().data[0]
            retailer_id = retailer['id']

            soup = fetch_page(scrape_url, wait_selector='div.product-tile')
            if not soup:
                errors += 1
                continue

            deals = parser_fn(soup, retailer_cfg['base_url'])
            print(f'  Found {len(deals)} deals')

            for deal in deals:
                normalised = normalise(deal, retailer_id)
                if dry_run:
                    print(f"  [dry-run] {normalised['title'][:60]} — £{normalised['price_current']}")
                else:
                    db.table('deals').upsert(
                        normalised,
                        on_conflict='retailer_id,external_id',
                    ).execute()
                total += 1

        except Exception as exc:
            errors += 1
            print(f"  Error scraping {retailer_cfg['name']}: {exc}")

    log(
        'scraper_agent',
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

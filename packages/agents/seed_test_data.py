#!/usr/bin/env python3
"""
Seed test deals — inserts realistic UK deals with product images into Supabase.
Run once to populate pending deals, then run qa_agent.py to score them with Groq.
"""
from db import get_client

TEST_RETAILER = {
    'name': 'Test Retailer',
    'slug': 'test-retailer',
    'affiliate_network': 'direct',
    'active': True,
}

# Images sourced from Unsplash (free to use, stable URLs)
TEST_DEALS = [
    {
        'external_id': 'test-001',
        'title': 'Dyson V11 Cordless Vacuum Cleaner',
        'description': 'Powerful cordless vacuum with up to 60 minutes of run time and whole-machine HEPA filtration.',
        'url': 'https://www.dyson.co.uk/vacuum-cleaners/cordless/dyson-v11',
        'affiliate_url': 'https://www.dyson.co.uk/vacuum-cleaners/cordless/dyson-v11',
        'image_url': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
        'price_current': 249.99,
        'price_was': 399.99,
        'category': 'Home Appliances',
        'status': 'pending',
    },
    {
        'external_id': 'test-002',
        'title': 'Samsung 55" 4K QLED Smart TV QE55Q60C',
        'description': '55 inch QLED TV with Quantum Dot technology, HDR, and Tizen OS smart platform.',
        'url': 'https://www.currys.co.uk/products/samsung-qe55q60c',
        'affiliate_url': 'https://www.currys.co.uk/products/samsung-qe55q60c',
        'image_url': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=600&q=80',
        'price_current': 399.00,
        'price_was': 599.00,
        'category': 'TVs',
        'status': 'pending',
    },
    {
        'external_id': 'test-003',
        'title': 'Apple AirPods Pro (2nd Generation) USB-C',
        'description': 'Active Noise Cancellation, Transparency mode, Adaptive Audio, USB-C charging case.',
        'url': 'https://www.apple.com/uk/shop/product/MTJV3ZM/A/airpods-pro',
        'affiliate_url': 'https://www.apple.com/uk/shop/product/MTJV3ZM/A/airpods-pro',
        'image_url': 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80',
        'price_current': 179.00,
        'price_was': 249.00,
        'category': 'Audio',
        'status': 'pending',
    },
    {
        'external_id': 'test-004',
        'title': 'Ninja AF100UK Air Fryer 3.8L',
        'description': 'Up to 75% less fat than traditional frying. 4 cooking programs.',
        'url': 'https://www.ninjakitchen.co.uk/product/ninja-air-fryer-af100uk',
        'affiliate_url': 'https://www.ninjakitchen.co.uk/product/ninja-air-fryer-af100uk',
        'image_url': 'https://images.unsplash.com/photo-1648152217474-1e1ef0e9ca53?w=600&q=80',
        'price_current': 79.99,
        'price_was': 129.99,
        'category': 'Kitchen',
        'status': 'pending',
    },
    {
        'external_id': 'test-005',
        'title': 'LEGO Technic Land Rover Defender 42110',
        'description': '2573 pieces. Authentic replica with functioning gearbox, suspension and steering.',
        'url': 'https://www.lego.com/en-gb/product/land-rover-defender-42110',
        'affiliate_url': 'https://www.lego.com/en-gb/product/land-rover-defender-42110',
        'image_url': 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80',
        'price_current': 149.99,
        'price_was': 229.99,
        'category': 'Toys',
        'status': 'pending',
    },
    {
        'external_id': 'test-006',
        'title': "De'Longhi Magnifica Evo Bean-to-Cup Coffee Machine",
        'description': 'Fully automatic espresso machine with integrated grinder and milk frother.',
        'url': 'https://www.johnlewis.com/delonghi-magnifica-evo',
        'affiliate_url': 'https://www.johnlewis.com/delonghi-magnifica-evo',
        'image_url': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
        'price_current': 399.00,
        'price_was': 599.00,
        'category': 'Kitchen',
        'status': 'pending',
    },
    {
        'external_id': 'test-007',
        'title': 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
        'description': 'Industry-leading noise cancellation, 30-hour battery, multipoint connection.',
        'url': 'https://www.sony.co.uk/store/product/wh1000xm5',
        'affiliate_url': 'https://www.sony.co.uk/store/product/wh1000xm5',
        'image_url': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
        'price_current': 259.00,
        'price_was': 380.00,
        'category': 'Audio',
        'status': 'pending',
    },
]


def run() -> None:
    db = get_client()

    retailer = db.table('retailers').upsert(
        TEST_RETAILER, on_conflict='slug'
    ).execute().data[0]
    retailer_id = retailer['id']
    print(f"Retailer: {retailer['name']} ({retailer_id})")

    for deal in TEST_DEALS:
        if deal.get('price_was') and deal['price_was'] > deal['price_current']:
            deal['discount_pct'] = round(
                (deal['price_was'] - deal['price_current']) / deal['price_was'] * 100, 1
            )
        deal['retailer_id'] = retailer_id
        db.table('deals').upsert(deal, on_conflict='retailer_id,external_id').execute()
        has_img = '[img]' if deal.get('image_url') else '     '
        print(f"  {has_img} {deal['title'][:52]:<52} {deal['price_current']:>7.2f}")

    print(f'\n{len(TEST_DEALS)} deals seeded with images.')
    print('Run next:  py qa_agent.py')


if __name__ == '__main__':
    run()

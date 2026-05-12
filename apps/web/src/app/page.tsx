import { supabase } from '@mydealz/db'
import { Hero, DealCard, CategoryFilter, DealSlider } from '@mydealz/ui'
import type { SliderDeal, HeroDeal } from '@mydealz/ui'

type DealRow = {
  id: string
  title: string
  price_current: number
  price_was: number | null
  discount_pct: number | null
  authenticity_score: number
  image_url: string | null
  affiliate_url: string
  url: string
  category: string | null
  created_at: string
  retailers: { name: string; slug: string } | null
  avgRating?: number
  ratingCount?: number
}

type RatingStat = { avg: number; count: number }

async function getRatingStats(dealIds: string[]): Promise<Map<string, RatingStat>> {
  if (!dealIds.length) return new Map()
  const { data } = await supabase
    .from('deal_ratings')
    .select('deal_id, score')
    .in('deal_id', dealIds)

  const rows = (data ?? []) as { deal_id: string; score: number }[]
  const map = new Map<string, { sum: number; count: number }>()
  for (const r of rows) {
    const prev = map.get(r.deal_id) ?? { sum: 0, count: 0 }
    map.set(r.deal_id, { sum: prev.sum + r.score, count: prev.count + 1 })
  }
  const result = new Map<string, RatingStat>()
  map.forEach(({ sum, count }, id) => {
    result.set(id, { avg: sum / count, count })
  })
  return result
}

async function getDeals(category?: string, search?: string): Promise<DealRow[]> {
  let query = supabase
    .from('deals')
    .select(`
      id, title, price_current, price_was, discount_pct,
      authenticity_score, image_url, affiliate_url, url,
      category, created_at,
      retailers ( name, slug )
    `)
    .eq('status', 'approved')
    .order('authenticity_score', { ascending: false })
    .limit(48)

  if (category) query = query.ilike('category', `%${category}%`)
  if (search)   query = query.ilike('title', `%${search}%`)

  const { data, error } = await query
  if (error) {
    console.error('Deals fetch error:', error.message)
    return []
  }
  return (data ?? []) as unknown as DealRow[]
}

function toHeroDeal(d: DealRow): HeroDeal {
  return {
    id: d.id,
    title: d.title,
    priceCurrent: d.price_current,
    priceWas: d.price_was,
    discountPct: d.discount_pct,
    authenticityScore: d.authenticity_score,
    imageUrl: d.image_url,
    affiliateUrl: d.affiliate_url,
    category: d.category,
    retailerName: d.retailers?.name ?? null,
    voteCount: 0,
  }
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2
        className="font-display font-bold text-ink"
        style={{ fontSize: 22, letterSpacing: '-0.015em' }}
      >
        {title}
      </h2>
      {subtitle && <p className="text-sm text-ink-60 mt-0.5">{subtitle}</p>}
    </div>
  )
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string }
}) {
  const category = searchParams.category ?? null
  const search   = searchParams.search   ?? null
  const deals = await getDeals(category ?? undefined, search ?? undefined)

  const ratingMap = await getRatingStats(deals.map((d) => d.id))
  const enriched = deals.map((d) => {
    const r = ratingMap.get(d.id)
    return r ? { ...d, avgRating: r.avg, ratingCount: r.count } : d
  })

  const hotDeals   = enriched.filter((d) => d.authenticity_score >= 90).slice(0, 8)
  const freshDeals = [...enriched]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8)
  const allDeals   = enriched

  const isFiltered = !!(category || search)

  const featuredDeals = hotDeals.slice(0, 3).map(toHeroDeal)

  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      {!isFiltered && (
        <>
          <Hero dealCount={deals.length} featuredDeals={featuredDeals} />
          <DealSlider
            title="Top Deals Right Now"
            deals={deals
              .filter((d) => d.authenticity_score >= 75)
              .slice(0, 10)
              .map((d): SliderDeal => ({
                id: d.id,
                title: d.title,
                priceCurrent: d.price_current,
                priceWas: d.price_was,
                discountPct: d.discount_pct,
                imageUrl: d.image_url,
                affiliateUrl: d.affiliate_url,
                retailerName: d.retailers?.name ?? null,
                authenticityScore: d.authenticity_score,
                category: d.category,
              }))}
          />
        </>
      )}

      {/* Category filter */}
      <CategoryFilter active={category} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">

        {deals.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-display font-bold text-ink-40" style={{ fontSize: 48 }}>—</p>
            <p className="text-ink-60 text-lg font-medium mt-4">No deals found for this category.</p>
            <a href="/" className="mt-4 inline-block text-sm font-semibold text-mydealz hover:underline">
              View all deals
            </a>
          </div>
        ) : isFiltered ? (
          <section>
            <SectionHeading
              title={search ? `Results for "${search}"` : `${category} Deals`}
              subtitle={`${deals.length} verified deals`}
            />
            <DealGrid deals={deals} />
          </section>
        ) : (
          <>
            {hotDeals.length > 0 && (
              <section>
                <SectionHeading
                  title="Hot Right Now"
                  subtitle="Highest authenticity scores today"
                />
                <DealGrid deals={hotDeals} />
              </section>
            )}

            {freshDeals.length > 0 && (
              <section>
                <SectionHeading
                  title="Just Added"
                  subtitle="Fresh deals in the last hour"
                />
                <DealGrid deals={freshDeals} isNew />
              </section>
            )}

            <section>
              <SectionHeading
                title="All Deals"
                subtitle={`${allDeals.length} verified deals`}
              />
              <DealGrid deals={allDeals} />
            </section>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-10 bg-ink">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logos/mydealz-icon.svg" alt="" width={28} height={28} />
                <span
                  className="font-display font-bold text-cream"
                  style={{ fontSize: 20, letterSpacing: '-0.02em' }}
                >
                  MyDealz
                </span>
              </div>
              <p className="text-sm" style={{ color: 'rgba(246,241,231,0.55)' }}>
                AI-curated UK deals · Updated every 30 minutes
              </p>
            </div>
            <div className="flex gap-8 text-sm" style={{ color: 'rgba(246,241,231,0.55)' }}>
              <a href="/privacy" className="hover:text-cream transition-colors">Privacy</a>
              <a href="/terms"   className="hover:text-cream transition-colors">Terms</a>
              <a href="/about"   className="hover:text-cream transition-colors">About</a>
            </div>
          </div>
          <div
            className="mt-8 pt-8 text-xs text-center"
            style={{ borderTop: '1px solid rgba(246,241,231,0.08)', color: 'rgba(246,241,231,0.3)' }}
          >
            © 2026 MyDealz · Part of DealNest Group · Affiliate links may earn commission.
          </div>
        </div>
      </footer>
    </main>
  )
}

function DealGrid({ deals, isNew = false }: { deals: DealRow[]; isNew?: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {deals.map((deal) => (
        <DealCard
          key={deal.id}
          id={deal.id}
          title={deal.title}
          priceCurrent={deal.price_current}
          priceWas={deal.price_was}
          discountPct={deal.discount_pct}
          authenticityScore={deal.authenticity_score}
          imageUrl={deal.image_url}
          affiliateUrl={deal.affiliate_url}
          category={deal.category}
          retailerName={deal.retailers?.name ?? null}
          isNew={isNew}
          avgRating={deal.avgRating}
          ratingCount={deal.ratingCount}
          voteCount={0}
        />
      ))}
    </div>
  )
}

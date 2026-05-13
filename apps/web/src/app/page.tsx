import { supabase } from '@mydealz/db'
import { Hero, DealCard, CategoryFilter, DealSlider } from '@mydealz/ui'
import type { SliderDeal } from '@mydealz/ui'
import { logger } from '@/lib/logger'

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

  const map = new Map<string, { sum: number; count: number }>()
  for (const r of data ?? []) {
    const prev = map.get(r.deal_id) ?? { sum: 0, count: 0 }
    map.set(r.deal_id, { sum: prev.sum + r.score, count: prev.count + 1 })
  }
  const result = new Map<string, RatingStat>()
  for (const [id, { sum, count }] of map) {
    result.set(id, { avg: sum / count, count })
  }
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
    logger.error('Deals fetch error', new Error(error.message))
    return []
  }
  return (data ?? []) as DealRow[]
}

function SectionHeading({
  title,
  subtitle,
  emoji,
}: {
  title: string
  subtitle?: string
  emoji: string
}) {
  return (
    <div className="flex items-end gap-3 mb-6">
      <span className="text-2xl">{emoji}</span>
      <div>
        <h2 className="text-xl font-black text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
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

  // Fetch all ratings in one batch query (2 queries total, not N+1)
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

  return (
    <main className="min-h-screen">
      {/* Hero — only on unfiltered home */}
      {!isFiltered && (
        <>
          <Hero dealCount={deals.length} />
          <div className="bg-[#fafaf8] border-b border-gray-100">
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
          </div>
        </>
      )}

      {/* Category filter */}
      <CategoryFilter active={category} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">

        {deals.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-500 text-lg font-medium">No deals found for this category.</p>
            <a href="/" className="mt-4 inline-block text-sm font-semibold text-brand-500 hover:underline">
              View all deals
            </a>
          </div>
        ) : isFiltered ? (
          /* Filtered view — simple grid */
          <section>
            <SectionHeading
              emoji="🏷️"
              title={search ? `Results for "${search}"` : `${category} Deals`}
              subtitle={`${deals.length} verified deals`}
            />
            <DealGrid deals={deals} />
          </section>
        ) : (
          /* Home feed — sections */
          <>
            {hotDeals.length > 0 && (
              <section>
                <SectionHeading
                  emoji="🔥"
                  title="Hot Right Now"
                  subtitle="Highest AI authenticity scores"
                />
                <DealGrid deals={hotDeals} />
              </section>
            )}

            {freshDeals.length > 0 && (
              <section>
                <SectionHeading
                  emoji="⚡"
                  title="Just Added"
                  subtitle="Fresh deals in the last hour"
                />
                <DealGrid deals={freshDeals} isNew />
              </section>
            )}

            <section>
              <SectionHeading
                emoji="✦"
                title="All Deals"
                subtitle={`${allDeals.length} AI-verified deals`}
              />
              <DealGrid deals={allDeals} />
            </section>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-10 bg-gray-950 text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xl font-black text-white">
                my<span className="text-brand-500">dealz</span>
              </p>
              <p className="text-sm mt-1">AI-curated UK deals · Updated every 30 minutes</p>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
              <a href="/terms"   className="hover:text-white transition-colors">Terms</a>
              <a href="/about"   className="hover:text-white transition-colors">About</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-xs text-center text-gray-600">
            © 2026 MyDealz. Deals verified by AI · Affiliate links may earn commission.
          </div>
        </div>
      </footer>
    </main>
  )
}

function DealGrid({
  deals,
  isNew = false,
}: {
  deals: DealRow[]
  isNew?: boolean
}) {
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
        />
      ))}
    </div>
  )
}

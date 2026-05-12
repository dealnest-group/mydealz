import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { DealCard, CategoryFilter } from '@mydealz/ui'

export const metadata: Metadata = {
  title: 'Deals For You — MyDealz',
  description: 'AI-curated deals personalised to your taste.',
}

type DealRow = {
  id: string
  title: string
  price_current: number
  price_was: number | null
  discount_pct: number | null
  authenticity_score: number
  image_url: string | null
  affiliate_url: string
  category: string | null
  retailers: { name: string } | null
}

type PreferenceProfile = {
  top_categories: { category: string; score: number }[]
  avg_price: number | null
  interaction_count: number
}

async function getPersonalisedDeals(userId: string): Promise<{
  deals: DealRow[]
  profile: PreferenceProfile | null
  ratings: Map<string, { avg: number; count: number }>
}> {
  const supabase = createClient()
  const { data: profileRow } = await supabase
    .from('user_profiles').select('preferences, embedding').eq('id', userId).maybeSingle()
  const profile = profileRow?.preferences as PreferenceProfile | null

  if (profileRow?.embedding) {
    const { data: vectorDeals } = await supabase.rpc('match_deals_for_user', { user_id: userId, match_count: 24 })
    if (vectorDeals?.length) {
      const ids = vectorDeals.map((d: { id: string }) => d.id)
      const { data } = await supabase
        .from('deals')
        .select('id, title, price_current, price_was, discount_pct, authenticity_score, image_url, affiliate_url, category, retailers(name)')
        .in('id', ids).eq('status', 'approved')
      const ratingsMap = await getRatings((data ?? []).map((d) => d.id), supabase)
      return { deals: (data ?? []) as unknown as DealRow[], profile, ratings: ratingsMap }
    }
  }

  const topCats = (profile?.top_categories ?? []).slice(0, 4).map((c) => c.category)
  let dealsData: DealRow[] = []
  if (topCats.length > 0) {
    const { data } = await supabase
      .from('deals')
      .select('id, title, price_current, price_was, discount_pct, authenticity_score, image_url, affiliate_url, category, retailers(name)')
      .eq('status', 'approved').in('category', topCats).order('authenticity_score', { ascending: false }).limit(24)
    dealsData = (data ?? []) as unknown as DealRow[]
  }
  if (dealsData.length < 8) {
    const existingIds = new Set(dealsData.map((d) => d.id))
    const { data: topDeals } = await supabase
      .from('deals')
      .select('id, title, price_current, price_was, discount_pct, authenticity_score, image_url, affiliate_url, category, retailers(name)')
      .eq('status', 'approved').order('authenticity_score', { ascending: false }).limit(24)
    for (const d of (topDeals ?? []) as unknown as DealRow[]) {
      if (!existingIds.has(d.id)) dealsData.push(d)
      if (dealsData.length >= 24) break
    }
  }
  const ratingsMap = await getRatings(dealsData.map((d) => d.id), supabase)
  return { deals: dealsData, profile, ratings: ratingsMap }
}

async function getRatings(ids: string[], supabase: ReturnType<typeof createClient>) {
  if (!ids.length) return new Map<string, { avg: number; count: number }>()
  const { data } = await supabase.from('deal_ratings').select('deal_id, score').in('deal_id', ids)
  const rows = (data ?? []) as { deal_id: string; score: number }[]
  const map = new Map<string, { sum: number; count: number }>()
  for (const r of rows) {
    const prev = map.get(r.deal_id) ?? { sum: 0, count: 0 }
    map.set(r.deal_id, { sum: prev.sum + r.score, count: prev.count + 1 })
  }
  const result = new Map<string, { avg: number; count: number }>()
  map.forEach(({ sum, count }, id) => result.set(id, { avg: sum / count, count }))
  return result
}

export default async function ForYouPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth?next=/for-you')

  const { deals, profile, ratings } = await getPersonalisedDeals(user.id)
  const topCats = (profile?.top_categories ?? []).slice(0, 3).map((c) => c.category)
  const hasHistory = (profile?.interaction_count ?? 0) > 0

  return (
    <main className="min-h-screen bg-cream">

      <CategoryFilter forYouActive />

      {/* Hero banner */}
      <div className="bg-ink">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div
            className="inline-flex items-center gap-2 text-mydealz text-xs font-mono font-medium px-4 py-1.5 rounded-full mb-5 uppercase"
            style={{ background: 'rgba(14,169,104,0.10)', border: '1px solid rgba(14,169,104,0.2)', letterSpacing: '0.15em' }}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Personal AI Feed
          </div>

          <h1
            className="font-display font-bold text-cream leading-[1.02]"
            style={{ fontSize: 'clamp(36px, 5vw, 56px)', letterSpacing: '-0.03em' }}
          >
            Deals made{' '}
            <span className="text-mydealz">just for you.</span>
          </h1>

          {hasHistory ? (
            <p className="mt-4 text-base max-w-md mx-auto" style={{ color: 'rgba(246,241,231,0.7)' }}>
              Based on your love of{' '}
              <span className="text-cream font-semibold">
                {topCats.length > 0 ? topCats.join(', ') : 'great deals'}
              </span>
              {' '}— curated by AI.
            </p>
          ) : (
            <p className="mt-4 text-base max-w-md mx-auto" style={{ color: 'rgba(246,241,231,0.7)' }}>
              Rate deals and leave comments — the more you interact, the smarter your feed gets.
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Preference tags */}
        {topCats.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-xs font-semibold text-ink-60 self-center mr-1">Your interests:</span>
            {topCats.map((cat) => (
              <span key={cat} className="text-xs font-semibold text-mydealz-deep bg-mydealz-soft border border-mydealz/20 px-3 py-1 rounded-full">
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Onboarding */}
        {!hasHistory && (
          <div className="bg-white rounded-[18px] border border-mist shadow-card p-8 mb-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-mydealz-soft rounded-2xl flex items-center justify-center shrink-0">
              <svg className="w-8 h-8 text-mydealz" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-ink mb-1" style={{ fontSize: 15 }}>Your AI is learning</h3>
              <p className="text-sm text-ink-60 mb-3">
                Rate deals, leave comments, and react to build your personal taste profile. The more you interact, the better your recommendations get.
              </p>
              <a href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-mydealz hover:underline">
                Browse deals to get started →
              </a>
            </div>
          </div>
        )}

        {/* Grid heading */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-ink" style={{ fontSize: 22, letterSpacing: '-0.015em' }}>
            {hasHistory ? 'Picked for you' : 'Top deals to explore'}
            <span className="ml-2 text-sm font-normal text-ink-40">({deals.length})</span>
          </h2>
          {hasHistory && (
            <span className="text-xs text-ink-40 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-mydealz" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Personalised by AI
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {deals.map((deal) => {
            const r = ratings.get(deal.id)
            return (
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
                avgRating={r?.avg}
                ratingCount={r?.count}
                voteCount={0}
              />
            )
          })}
        </div>
      </div>
    </main>
  )
}

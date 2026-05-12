import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { DealCard } from '@mydealz/ui'
import { DealImage } from './DealImage'
import { DealRating } from './DealRating'
import { DealComments } from './DealComments'

// ─── Types ───────────────────────────────────────────────────────────────────

type DealDetail = {
  id: string
  title: string
  description: string | null
  price_current: number
  price_was: number | null
  discount_pct: number | null
  authenticity_score: number
  image_url: string | null
  affiliate_url: string
  url: string
  category: string | null
  status: string
  created_at: string
  retailers: { name: string; slug: string; base_url: string | null } | null
}

type CommentRow = {
  id: string
  user_id: string
  content: string
  created_at: string
  parent_id: string | null
  user_email: string
  reactions: { type: 'like' | 'heart' | 'fire'; count: number; reacted: boolean }[]
  replies: CommentRow[]
}

// ─── Data fetchers ────────────────────────────────────────────────────────────

async function getDeal(id: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('deals')
    .select('*, retailers(name, slug, base_url)')
    .eq('id', id)
    .eq('status', 'approved')
    .single()
  return data as DealDetail | null
}

async function getRatingStats(dealId: string, userId: string | null) {
  const supabase = createClient()
  const { data } = await supabase
    .from('deal_ratings')
    .select('score, user_id')
    .eq('deal_id', dealId)

  if (!data || data.length === 0) return { avg: 0, total: 0, userScore: null }
  const avg = data.reduce((sum, r) => sum + r.score, 0) / data.length
  const userScore = userId ? (data.find((r) => r.user_id === userId)?.score ?? null) : null
  return { avg, total: data.length, userScore }
}

async function getComments(dealId: string, userId: string | null): Promise<CommentRow[]> {
  const supabase = createClient()

  const { data: comments } = await supabase
    .from('deal_comments')
    .select('id, user_id, content, created_at, parent_id')
    .eq('deal_id', dealId)
    .order('created_at', { ascending: false })

  if (!comments?.length) return []

  const { data: reactions } = await supabase
    .from('comment_reactions')
    .select('comment_id, type, user_id')
    .in('comment_id', comments.map((c) => c.id))

  // Build email lookup via admin — use service role to read auth.users email
  // We store email via a display_email column trick: use user_metadata
  // For now, derive display from user_id hash (email not exposed in anon queries)
  const commentMap = new Map<string, CommentRow>()

  for (const c of comments) {
    const commentReactions = (reactions ?? []).filter((r) => r.comment_id === c.id)
    const reactionSummary = ['like', 'heart', 'fire'].map((type) => ({
      type: type as 'like' | 'heart' | 'fire',
      count: commentReactions.filter((r) => r.type === type).length,
      reacted: userId ? commentReactions.some((r) => r.type === type && r.user_id === userId) : false,
    }))

    commentMap.set(c.id, {
      ...c,
      user_email: `user-${c.user_id.slice(0, 8)}@mydealz`,
      reactions: reactionSummary,
      replies: [],
    })
  }

  // Nest replies under parents
  const roots: CommentRow[] = []
  for (const [, comment] of commentMap) {
    if (comment.parent_id && commentMap.has(comment.parent_id)) {
      commentMap.get(comment.parent_id)!.replies.push(comment)
    } else {
      roots.push(comment)
    }
  }
  return roots
}

async function getSimilarDeals(dealId: string, category: string | null) {
  const supabase = createClient()
  let query = supabase
    .from('deals')
    .select('id, title, price_current, price_was, discount_pct, authenticity_score, image_url, affiliate_url, category, retailers(name, slug)')
    .eq('status', 'approved')
    .neq('id', dealId)
    .limit(4)

  if (category) query = query.eq('category', category)

  const { data } = await query
  return data ?? []
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const deal = await getDeal(params.id)
  if (!deal) return { title: 'Deal not found — MyDealz' }
  return {
    title: `${deal.title} — MyDealz`,
    description: deal.description ?? `${deal.retailers?.name ?? 'Top UK retailer'} deal — was £${deal.price_was}, now £${deal.price_current}.`,
    openGraph: { images: deal.image_url ? [deal.image_url] : [] },
  }
}

// ─── Score bar ───────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const { color, label, description } =
    score >= 80
      ? { color: 'bg-emerald-500', label: 'Genuine Discount', description: 'High confidence this is a real saving based on price history and retailer reputation.' }
      : score >= 50
      ? { color: 'bg-amber-400', label: 'Plausible Deal', description: 'Likely genuine but original price could not be fully verified.' }
      : { color: 'bg-red-400', label: 'Unverified', description: 'Could not confirm this is a genuine discount — check before buying.' }

  return (
    <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-900">AI Authenticity Score</p>
        <span className="text-2xl font-black text-gray-900">
          {score}<span className="text-sm font-medium text-gray-400">/100</span>
        </span>
      </div>
      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <div className="flex items-start gap-2">
        <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${color}`} />
        <div>
          <p className="text-sm font-semibold text-gray-700">{label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function DealPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const [deal, { data: { user } }] = await Promise.all([
    getDeal(params.id),
    supabase.auth.getUser(),
  ])
  if (!deal) notFound()

  const userId = user?.id ?? null
  const [ratings, comments, similar] = await Promise.all([
    getRatingStats(deal.id, userId),
    getComments(deal.id, userId),
    getSimilarDeals(deal.id, deal.category),
  ])

  const saving = deal.price_was && deal.price_was > deal.price_current
    ? (deal.price_was - deal.price_current).toFixed(2)
    : null
  const pct = deal.discount_pct ? Math.round(deal.discount_pct) : null
  const postedAt = new Date(deal.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
            <a href="/" className="hover:text-brand-500 font-medium transition-colors">Deals</a>
            <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {deal.category && (
              <>
                <a href={`/?category=${deal.category}`} className="hover:text-brand-500 transition-colors">{deal.category}</a>
                <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
            <span className="text-gray-400 truncate">{deal.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Image */}
          <DealImage imageUrl={deal.image_url} title={deal.title} category={deal.category} />

          {/* Info */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {deal.retailers?.name && (
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {deal.retailers.name}
                </span>
              )}
              {pct && pct > 0 && (
                <span className="text-xs font-black bg-brand-500 text-white px-3 py-1 rounded-full">
                  -{pct}% OFF
                </span>
              )}
              {deal.category && (
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {deal.category}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
              {deal.title}
            </h1>

            {deal.description && (
              <p className="text-gray-600 text-sm leading-relaxed">{deal.description}</p>
            )}

            {/* Price */}
            <div className="bg-white rounded-2xl shadow-card p-5 space-y-3">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-4xl font-black text-gray-900">£{deal.price_current.toFixed(2)}</span>
                {deal.price_was && (
                  <span className="text-xl text-gray-400 line-through font-medium">£{deal.price_was.toFixed(2)}</span>
                )}
              </div>
              {saving && (
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  You save £{saving}
                </span>
              )}
            </div>

            <ScoreBar score={deal.authenticity_score} />

            {/* CTA */}
            <a
              href={deal.affiliate_url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center justify-center gap-3 w-full bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-base font-bold py-4 px-6 rounded-2xl transition-colors shadow-sm shadow-brand-500/30"
            >
              View on {deal.retailers?.name ?? 'Retailer'}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <p className="text-center text-xs text-gray-400">
              Opens in a new tab · Affiliate link may earn MyDealz a small commission
            </p>

            <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">Posted {postedAt}</p>
          </div>
        </div>

        {/* ── Rating ── */}
        <DealRating
          dealId={deal.id}
          avgScore={ratings.avg}
          totalRatings={ratings.total}
          userScore={ratings.userScore}
          userId={userId}
        />

        {/* ── Similar deals ── */}
        {similar.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-2">
              <span className="text-2xl">✦</span>
              {deal.category ? `More ${deal.category} Deals` : 'You Might Also Like'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similar.map((s: any) => (
                <DealCard
                  key={s.id}
                  id={s.id}
                  title={s.title}
                  priceCurrent={s.price_current}
                  priceWas={s.price_was}
                  discountPct={s.discount_pct}
                  authenticityScore={s.authenticity_score}
                  imageUrl={s.image_url}
                  affiliateUrl={s.affiliate_url}
                  category={s.category}
                  retailerName={s.retailers?.name ?? null}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Comments ── */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <DealComments
            dealId={deal.id}
            initialComments={comments}
            userId={userId}
            userEmail={user?.email ?? null}
          />
        </div>

      </div>
    </main>
  )
}

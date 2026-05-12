'use client'

import { useRef, useState } from 'react'
import { CategoryIcon } from './CategoryIcon'

export type SliderDeal = {
  id: string
  title: string
  priceCurrent: number
  priceWas: number | null
  discountPct: number | null
  imageUrl: string | null
  affiliateUrl: string
  retailerName: string | null
  authenticityScore: number
  category: string | null
}

function SliderCard({ deal }: { deal: SliderDeal }) {
  const [imgFailed, setImgFailed] = useState(!deal.imageUrl)
  const pct = deal.discountPct ? Math.round(Math.abs(deal.discountPct)) : null
  const saving =
    deal.priceWas && deal.priceWas > deal.priceCurrent
      ? (deal.priceWas - deal.priceCurrent).toFixed(2)
      : null

  return (
    <a
      href={`/deals/${deal.id}`}
      className="group snap-start shrink-0 w-[280px] sm:w-[300px] flex flex-col rounded-[18px] overflow-hidden shadow-card hover:-translate-y-1 transition-all duration-200 bg-white border border-mist"
    >
      {/* Image */}
      <div className="relative overflow-hidden shrink-0" style={{ aspectRatio: '16/10' }}>
        {!imgFailed && deal.imageUrl ? (
          <img
            src={deal.imageUrl}
            alt={deal.title}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-mist gap-2">
            <CategoryIcon category={deal.category} className="w-10 h-10 text-ink-40" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3.5 left-3.5 flex gap-1.5">
          {pct && pct > 0 && (
            <span
              className="font-mono text-white"
              style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', background: '#0E1B2C', padding: '5px 9px', borderRadius: 6 }}
            >
              −{pct}%
            </span>
          )}
          {deal.retailerName && (
            <span
              className="font-mono text-ink-80"
              style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', background: 'rgba(255,255,255,0.92)', padding: '5px 9px', borderRadius: 6 }}
            >
              {deal.retailerName}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="text-sm font-medium text-ink line-clamp-2 flex-1 leading-[1.4]">
          {deal.title}
        </h3>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span
            className="font-display font-bold text-ink"
            style={{ fontSize: 22, letterSpacing: '-0.02em' }}
          >
            £{deal.priceCurrent.toFixed(2)}
          </span>
          {deal.priceWas && (
            <span className="text-sm text-ink-60 line-through">£{deal.priceWas.toFixed(2)}</span>
          )}
          {saving && (
            <span
              className="ml-auto font-mono text-mydealz-deep bg-mydealz-soft"
              style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 999 }}
            >
              Save £{saving}
            </span>
          )}
        </div>
        <div
          className="mt-1 text-center font-semibold text-mydealz group-hover:brightness-90 transition-[filter]"
          style={{ fontSize: 14 }}
        >
          Get this deal →
        </div>
      </div>
    </a>
  )
}

export function DealSlider({ deals, title = 'Featured Deals' }: { deals: SliderDeal[]; title?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'right' ? 320 : -320, behavior: 'smooth' })
  }

  if (deals.length === 0) return null

  return (
    <section className="py-10 bg-chalk">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className="font-display font-bold text-ink"
              style={{ fontSize: 22, letterSpacing: '-0.015em' }}
            >
              {title}
            </h2>
            <p className="text-sm text-ink-60 mt-0.5">Top verified deals right now</p>
          </div>
          {/* Arrow buttons */}
          <div className="hidden sm:flex gap-2">
            {(['left', 'right'] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => scroll(dir)}
                className="w-9 h-9 rounded-full border border-mist bg-white hover:border-mydealz flex items-center justify-center transition-colors"
                aria-label={`Scroll ${dir}`}
              >
                <svg className="w-4 h-4 text-ink-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d={dir === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Scroll track */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {deals.map((deal) => (
            <SliderCard key={deal.id} deal={deal} />
          ))}
        </div>

        <p className="text-center text-xs text-ink-40 mt-4 sm:hidden">Swipe to see more →</p>
      </div>
    </section>
  )
}

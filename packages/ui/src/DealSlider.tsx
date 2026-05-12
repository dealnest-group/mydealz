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
  const pct = deal.discountPct ? Math.round(deal.discountPct) : null
  const saving =
    deal.priceWas && deal.priceWas > deal.priceCurrent
      ? (deal.priceWas - deal.priceCurrent).toFixed(2)
      : null

  return (
    <a
      href={`/deals/${deal.id}`}
      className="group snap-start shrink-0 w-[280px] sm:w-[300px] flex flex-col rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-250 bg-white"
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-brand-50 to-orange-100 overflow-hidden shrink-0">
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
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 to-orange-100 gap-2">
            <CategoryIcon category={deal.category} className="w-12 h-12 text-brand-400" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {pct && pct > 0 && (
            <span className="bg-brand-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow">
              -{pct}%
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur text-[10px] font-bold text-brand-600 px-2 py-0.5 rounded-full">
            AI {deal.authenticityScore}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {deal.retailerName && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {deal.retailerName}
          </p>
        )}
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 flex-1 leading-snug">
          {deal.title}
        </h3>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-xl font-black text-gray-900">£{deal.priceCurrent.toFixed(2)}</span>
          {deal.priceWas && (
            <span className="text-xs text-gray-400 line-through">£{deal.priceWas.toFixed(2)}</span>
          )}
          {saving && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
              Save £{saving}
            </span>
          )}
        </div>
        <div className="mt-1 text-center text-sm font-bold text-brand-500 group-hover:text-brand-600 transition-colors">
          View Deal →
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
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✦</span>
            <div>
              <h2 className="text-xl font-black text-gray-900">{title}</h2>
              <p className="text-sm text-gray-400">Top verified deals right now</p>
            </div>
          </div>
          {/* Arrow buttons */}
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-brand-50 hover:border-brand-300 flex items-center justify-center transition-colors shadow-sm"
              aria-label="Scroll left"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-brand-50 hover:border-brand-300 flex items-center justify-center transition-colors shadow-sm"
              aria-label="Scroll right"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
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

        {/* Scroll hint on mobile */}
        <p className="text-center text-xs text-gray-400 mt-4 sm:hidden">Swipe to see more →</p>
      </div>
    </section>
  )
}

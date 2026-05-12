'use client'

import { useState } from 'react'
import { CategoryIcon } from './CategoryIcon'
import { StarRow } from './StarIcon'

export type DealCardProps = {
  id: string
  title: string
  priceCurrent: number
  priceWas: number | null
  discountPct: number | null
  authenticityScore: number
  imageUrl: string | null
  affiliateUrl: string
  category: string | null
  retailerName: string | null
  isNew?: boolean
  avgRating?: number
  ratingCount?: number
}

function ScorePill({ score }: { score: number }) {
  const { bg, text, label } =
    score >= 80
      ? { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Verified' }
      : score >= 50
      ? { bg: 'bg-amber-50',   text: 'text-amber-700',   label: 'Plausible' }
      : { bg: 'bg-gray-100',   text: 'text-gray-500',    label: 'Unverified' }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${bg} ${text}`}>
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      AI {label} · {score}
    </span>
  )
}

export function DealCard({
  id,
  title,
  priceCurrent,
  priceWas,
  discountPct,
  authenticityScore,
  imageUrl,
  category,
  retailerName,
  isNew = false,
  avgRating,
  ratingCount,
}: DealCardProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const saving = priceWas && priceWas > priceCurrent
    ? (priceWas - priceCurrent).toFixed(2)
    : null
  const pct = discountPct ? Math.round(discountPct) : null
  const detailUrl = `/deals/${id}`
  const showImage = !!imageUrl && !imgFailed

  return (
    <article className="group relative bg-white rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col">

      <a href={detailUrl} className="block relative aspect-[4/3] overflow-hidden shrink-0">
        {showImage ? (
          <img
            src={imageUrl!}
            alt={title}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 to-orange-100 gap-2">
            <CategoryIcon category={category} className="w-14 h-14 text-brand-400" />
            {category && (
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">
                {category}
              </span>
            )}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-3 left-3 flex gap-1.5">
          {pct && pct > 0 && (
            <span className="bg-brand-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow">
              -{pct}%
            </span>
          )}
          {isNew && (
            <span className="bg-gray-900 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              NEW
            </span>
          )}
        </div>
      </a>

      <div className="flex flex-col flex-1 p-4 gap-2.5">
        {retailerName && (
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
            {retailerName}
          </p>
        )}

        <a href={detailUrl} className="flex-1">
          <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 min-h-[2.5rem] hover:text-brand-500 transition-colors">
            {title}
          </h3>
        </a>

        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl font-black text-gray-900 leading-none">
            £{priceCurrent.toFixed(2)}
          </span>
          {priceWas && (
            <span className="text-sm text-gray-400 line-through leading-none mb-0.5">
              £{priceWas.toFixed(2)}
            </span>
          )}
          {saving && (
            <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              Save £{saving}
            </span>
          )}
        </div>

        {avgRating && avgRating > 0 && ratingCount && ratingCount > 0 && (
          <div className="flex items-center gap-1.5">
            <StarRow avg={avgRating} />
            <span className="text-xs font-semibold text-gray-600">{avgRating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({ratingCount})</span>
          </div>
        )}

        {authenticityScore > 0 && <ScorePill score={authenticityScore} />}

        <a
          href={detailUrl}
          className="mt-1 flex items-center justify-center gap-2 w-full bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-sm font-bold py-3 px-4 rounded-xl transition-colors duration-150 group/btn"
        >
          View Deal
          <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>
    </article>
  )
}

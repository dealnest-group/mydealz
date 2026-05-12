'use client'

import { useState } from 'react'
import { CategoryIcon } from './CategoryIcon'

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
  // Design-system fields
  verificationNote?: string
  verifierName?: string
  verifierInitials?: string
  verifiedAt?: string
  voteCount?: number
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden>
      <path
        d="M3 1.5 H13 V16.5 L8 12.5 L3 16.5 Z"
        fill={filled ? '#F4A547' : 'none'}
        stroke={filled ? '#F4A547' : '#3C4858'}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function VoteButton({ dir, active, onClick }: { dir: 1 | -1; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={dir > 0 ? 'Upvote' : 'Downvote'}
      className="flex items-center justify-center w-8 h-9 border-none bg-transparent cursor-pointer"
    >
      <svg width="12" height="8" viewBox="0 0 12 8" aria-hidden>
        <path
          d={dir > 0 ? 'M1 7 L6 1 L11 7' : 'M1 1 L6 7 L11 1'}
          fill="none"
          stroke={active ? '#0EA968' : '#6B7689'}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

export function DealCard({
  id,
  title,
  priceCurrent,
  priceWas,
  discountPct,
  imageUrl,
  affiliateUrl,
  category,
  retailerName,
  verificationNote,
  verifierName,
  verifierInitials,
  verifiedAt,
  voteCount = 0,
}: DealCardProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [voted, setVoted] = useState<-1 | 0 | 1>(0)

  const saving =
    priceWas && priceWas > priceCurrent
      ? (priceWas - priceCurrent).toFixed(2)
      : null
  const pct = discountPct ? Math.round(Math.abs(discountPct)) : null
  const showImage = !!imageUrl && !imgFailed

  function handleVote(dir: 1 | -1) {
    setVoted(v => (v === dir ? 0 : dir))
  }

  return (
    <article className="w-full max-w-[360px] bg-white rounded-[18px] border border-mist overflow-hidden shadow-card font-sans">

      {/* Image */}
      <div className="relative" style={{ aspectRatio: '16/10' }}>
        {showImage ? (
          <img
            src={imageUrl!}
            alt={title}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-mist gap-2">
            <CategoryIcon category={category} className="w-12 h-12 text-ink-40" />
          </div>
        )}

        {/* Overlay pills */}
        <div className="absolute top-3.5 left-3.5 flex gap-1.5">
          {pct && pct > 0 && (
            <span
              className="font-mono text-white"
              style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', background: '#0E1B2C', padding: '5px 9px', borderRadius: 6 }}
            >
              −{pct}%
            </span>
          )}
          {retailerName && (
            <span
              className="font-mono text-ink-80"
              style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', background: 'rgba(255,255,255,0.92)', padding: '5px 9px', borderRadius: 6 }}
            >
              {retailerName}
            </span>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={() => setIsSaved(s => !s)}
          aria-label={isSaved ? 'Unsave deal' : 'Save deal'}
          className="absolute top-3.5 right-3.5 flex items-center justify-center border-none cursor-pointer transition-transform duration-150 hover:scale-110"
          style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.92)' }}
        >
          <BookmarkIcon filled={isSaved} />
        </button>
      </div>

      {/* Body */}
      <div className="p-5">

        {/* Price row */}
        <div className="flex items-baseline gap-2.5 mb-2">
          <span className="font-display font-bold text-ink" style={{ fontSize: 28, letterSpacing: '-0.02em' }}>
            £{priceCurrent.toFixed(2)}
          </span>
          {priceWas && (
            <span className="text-ink-60 line-through" style={{ fontSize: 14 }}>
              £{priceWas.toFixed(2)}
            </span>
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

        {/* Title */}
        <p className="text-ink font-medium leading-[1.4] mb-1.5 line-clamp-2" style={{ fontSize: 15 }}>
          {title}
        </p>

        {/* Verification note */}
        {verificationNote && (
          <p className="text-ink-60 leading-[1.5] mb-4" style={{ fontSize: 13 }}>
            {verificationNote}
          </p>
        )}

        {/* Verifier row */}
        {verifierName && (
          <div className="flex items-center gap-2.5 mb-4">
            <div
              className="flex items-center justify-center shrink-0 bg-ink text-cream font-semibold"
              style={{ width: 22, height: 22, borderRadius: 999, fontSize: 10 }}
            >
              {verifierInitials ?? verifierName.slice(0, 2).toUpperCase()}
            </div>
            <p className="text-ink-60" style={{ fontSize: 13 }}>
              Verified by{' '}
              <span className="text-ink font-medium">{verifierName}</span>
              {verifiedAt && <span> · {verifiedAt}</span>}
            </p>
          </div>
        )}

        {/* Action row */}
        <div className="flex gap-2.5">
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center bg-mydealz text-white font-semibold transition-[filter] duration-100 ease-out hover:brightness-105"
            style={{ height: 44, borderRadius: 12, fontSize: 14, letterSpacing: '-0.005em' }}
          >
            Get this deal
          </a>

          {/* Vote pill */}
          <div
            className="flex items-center border border-mist"
            style={{ borderRadius: 12, padding: '0 4px' }}
          >
            <VoteButton dir={1} active={voted === 1} onClick={() => handleVote(1)} />
            <span
              className="font-mono text-ink text-center"
              style={{ fontSize: 13, fontWeight: 500, minWidth: 28 }}
            >
              {voteCount + voted}
            </span>
            <VoteButton dir={-1} active={voted === -1} onClick={() => handleVote(-1)} />
          </div>
        </div>

      </div>
    </article>
  )
}

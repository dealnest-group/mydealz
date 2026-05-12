'use client'

import React, { useState } from 'react'
import { DealCard } from './DealCard'
import type { DealCardProps } from './DealCard'

export type HeroDeal = Pick<
  DealCardProps,
  | 'id' | 'title' | 'priceCurrent' | 'priceWas' | 'discountPct'
  | 'retailerName' | 'imageUrl' | 'affiliateUrl'
  | 'voteCount' | 'verifierName' | 'verifierInitials' | 'verifiedAt' | 'verificationNote'
> & { authenticityScore: number; category: string | null }

type HeroProps = {
  dealCount?: number
  featuredDeals?: HeroDeal[]
}

const FALLBACK_DEALS: HeroDeal[] = [
  {
    id: 'hero-1',
    title: 'Russell Hobbs Inspire Kettle, 1.7L — brushed steel',
    priceCurrent: 29.00,
    priceWas: 49.99,
    discountPct: 42,
    retailerName: 'Tesco',
    imageUrl: null,
    affiliateUrl: '#',
    authenticityScore: 95,
    category: 'Home',
    voteCount: 142,
    verifierName: 'Rosie M.',
    verifierInitials: 'RM',
    verifiedAt: '14 min ago',
    verificationNote: "Cheapest we've seen in 8 months. Stock checked at 09:14 today — looking healthy.",
  },
  {
    id: 'hero-2',
    title: 'Anker 20W USB-C Charger — MagSafe compatible',
    priceCurrent: 12.99,
    priceWas: 24.99,
    discountPct: 48,
    retailerName: 'Argos',
    imageUrl: null,
    affiliateUrl: '#',
    authenticityScore: 91,
    category: 'Tech',
    voteCount: 87,
    verifierName: 'Dan P.',
    verifierInitials: 'DP',
    verifiedAt: '32 min ago',
    verificationNote: 'Price matched against Amazon. Argos have it in stock for next-day delivery.',
  },
  {
    id: 'hero-3',
    title: 'Heinz Beanz 6×415g — multipack',
    priceCurrent: 3.50,
    priceWas: 5.20,
    discountPct: 33,
    retailerName: "Sainsbury's",
    imageUrl: null,
    affiliateUrl: '#',
    authenticityScore: 88,
    category: 'Grocery',
    voteCount: 211,
    verifierName: 'Sam K.',
    verifierInitials: 'SK',
    verifiedAt: '1 hr ago',
    verificationNote: 'Lowest multipack price across the big four this week.',
  },
]

function MiniCard({ deal }: { deal: HeroDeal }) {
  const pct = deal.discountPct ? Math.round(Math.abs(deal.discountPct)) : null

  return (
    <div
      className="bg-white font-sans"
      style={{
        width: 260,
        borderRadius: 14,
        padding: 14,
        boxShadow: '0 16px 40px -16px rgba(0,0,0,0.4)',
        pointerEvents: 'none', // parent handles click
      }}
    >
      {/* Image placeholder */}
      <div
        className="relative mb-3"
        style={{
          height: 100,
          borderRadius: 8,
          background: 'repeating-linear-gradient(135deg, #E8E4DA 0 12px, rgba(14,27,44,0.04) 12px 13px)',
        }}
      >
        {pct && pct > 0 && (
          <span
            className="absolute top-2 left-2 font-mono text-white"
            style={{ fontSize: 10, fontWeight: 600, background: '#0E1B2C', padding: '3px 7px', borderRadius: 4 }}
          >
            −{pct}%
          </span>
        )}
        {deal.retailerName && (
          <span
            className="absolute top-2 right-2 font-mono text-ink-80"
            style={{ fontSize: 10, fontWeight: 600, background: 'rgba(255,255,255,0.92)', padding: '3px 7px', borderRadius: 4 }}
          >
            {deal.retailerName}
          </span>
        )}
      </div>
      <p className="font-medium text-ink mb-2 line-clamp-2" style={{ fontSize: 13, lineHeight: 1.4 }}>
        {deal.title}
      </p>
      <div className="flex items-baseline gap-1.5">
        <span className="font-display font-bold text-ink" style={{ fontSize: 18, letterSpacing: '-0.02em' }}>
          £{deal.priceCurrent.toFixed(2)}
        </span>
        {deal.priceWas && (
          <span className="text-ink-60 line-through" style={{ fontSize: 11 }}>
            £{deal.priceWas.toFixed(2)}
          </span>
        )}
        {deal.retailerName && (
          <span className="ml-auto text-ink-60" style={{ fontSize: 10 }}>{deal.retailerName}</span>
        )}
      </div>
    </div>
  )
}

// Position transforms for each slot: left-bg, front, right-bg
const SLOT_STYLES: Record<'left' | 'front' | 'right', React.CSSProperties> = {
  left: {
    transform: 'rotate(-4deg) translate(-90px, 30px)',
    opacity: 0.55,
    filter: 'blur(0.5px)',
    zIndex: 1,
    cursor: 'pointer',
  },
  front: {
    transform: 'none',
    opacity: 1,
    filter: 'none',
    zIndex: 2,
    cursor: 'default',
  },
  right: {
    transform: 'rotate(5deg) translate(100px, 60px)',
    opacity: 0.55,
    filter: 'none',
    zIndex: 1,
    cursor: 'pointer',
  },
}

function getSlot(i: number, activeIdx: number, total: number): 'left' | 'front' | 'right' {
  if (i === activeIdx) return 'front'
  if (total === 2) return i < activeIdx ? 'left' : 'right'
  // For 3 cards: the one "before" active is left, "after" is right
  const prev = (activeIdx + total - 1) % total
  return i === prev ? 'left' : 'right'
}

export function Hero({ dealCount = 0, featuredDeals = [] }: HeroProps) {
  const deals = featuredDeals.length > 0 ? featuredDeals.slice(0, 3) : FALLBACK_DEALS
  const [activeIdx, setActiveIdx] = useState(0)
  const checkedCount = dealCount > 0 ? dealCount.toLocaleString('en-GB') : '4,318'
  const active = deals[activeIdx]

  return (
    <section className="bg-ink text-cream w-full">
      <div className="max-w-7xl mx-auto" style={{ padding: '64px 48px 64px' }}>
        <div className="grid items-center" style={{ gridTemplateColumns: '1.1fr 1fr', gap: 48 }}>

          {/* ── Left: copy ── */}
          <div>
            <p
              className="font-mono text-mydealz uppercase"
              style={{ fontSize: 12, letterSpacing: '0.2em', marginBottom: 18 }}
            >
              ▣ {checkedCount} deals checked this morning
            </p>

            <h1
              className="font-display font-bold text-cream"
              style={{ fontSize: 'clamp(48px, 5.5vw, 76px)', lineHeight: 0.98, letterSpacing: '-0.035em', margin: 0 }}
            >
              The deals worth
              <br />
              <span className="text-mydealz">your attention.</span>
            </h1>

            <p
              className="leading-[1.5]"
              style={{ fontSize: 18, color: 'rgba(246,241,231,0.75)', maxWidth: 520, marginTop: 22 }}
            >
              We scan thousands of UK retailers a day and only show you the ones a real
              person has already checked. No coupons to clip. No fake countdowns. Just
              the cheapest price, today.
            </p>

            <div className="flex items-center gap-2.5" style={{ marginTop: 32 }}>
              <a
                href="/"
                className="flex items-center justify-center font-semibold bg-mydealz text-ink transition-[filter] duration-100 hover:brightness-105"
                style={{ height: 52, padding: '0 22px', borderRadius: 14, fontSize: 15, letterSpacing: '-0.005em' }}
              >
                Browse today's deals →
              </a>
              <a
                href="/about"
                className="flex items-center justify-center font-medium text-cream"
                style={{ height: 52, padding: '0 22px', borderRadius: 14, fontSize: 15, border: '1px solid rgba(246,241,231,0.25)' }}
              >
                How we check
              </a>
            </div>

            <div
              className="flex gap-8"
              style={{ marginTop: 44, paddingTop: 28, borderTop: '1px solid rgba(246,241,231,0.08)' }}
            >
              {[
                { n: '217k',   l: 'hunters in the UK' },
                { n: '£14.20', l: 'avg. saving per deal' },
                { n: '9 min',  l: 'median verification' },
              ].map(({ n, l }) => (
                <div key={l}>
                  <p className="font-display font-bold text-cream" style={{ fontSize: 26, letterSpacing: '-0.02em' }}>{n}</p>
                  <p style={{ fontSize: 12, color: 'rgba(246,241,231,0.55)', marginTop: 2 }}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: stacked card deck ── */}
          <div
            className="relative justify-center items-center hidden lg:flex"
            style={{ minHeight: 500 }}
          >
            {deals.map((deal, i) => {
              const slot = getSlot(i, activeIdx, deals.length)
              const isFront = slot === 'front'

              return (
                <div
                  key={deal.id}
                  onClick={() => !isFront && setActiveIdx(i)}
                  style={{
                    position: 'absolute',
                    transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease, filter 0.35s ease',
                    ...SLOT_STYLES[slot],
                  }}
                  title={!isFront ? `View: ${deal.title}` : undefined}
                >
                  {isFront ? (
                    <DealCard
                      id={active.id}
                      title={active.title}
                      priceCurrent={active.priceCurrent}
                      priceWas={active.priceWas}
                      discountPct={active.discountPct}
                      authenticityScore={active.authenticityScore}
                      imageUrl={active.imageUrl}
                      affiliateUrl={active.affiliateUrl}
                      category={active.category}
                      retailerName={active.retailerName}
                      voteCount={active.voteCount}
                      verifierName={active.verifierName}
                      verifierInitials={active.verifierInitials}
                      verifiedAt={active.verifiedAt}
                      verificationNote={active.verificationNote}
                    />
                  ) : (
                    <MiniCard deal={deal} />
                  )}
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </section>
  )
}

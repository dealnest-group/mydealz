'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StarIcon, StarRow } from '@mydealz/ui'

type Props = {
  dealId: string
  avgScore: number
  totalRatings: number
  userScore: number | null
  userId: string | null
}

export function DealRating({ dealId, avgScore, totalRatings, userScore, userId }: Props) {
  const [hovered, setHovered] = useState(0)
  const [current, setCurrent] = useState(userScore ?? 0)
  const [avg, setAvg] = useState(avgScore)
  const [total, setTotal] = useState(totalRatings)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  async function rate(score: number) {
    if (!userId) { window.location.href = '/auth'; return }
    if (submitting) return
    setSubmitting(true)
    const { error } = await supabase
      .from('deal_ratings')
      .upsert({ deal_id: dealId, user_id: userId, score }, { onConflict: 'deal_id,user_id' })
    if (!error) {
      const wasNew = current === 0
      const oldSum = avg * total
      const newTotal = wasNew ? total + 1 : total
      const newAvg = wasNew ? (oldSum + score) / newTotal : (oldSum - current + score) / newTotal
      setCurrent(score)
      setAvg(newAvg)
      setTotal(newTotal)
    }
    setSubmitting(false)
  }

  return (
    <div className="bg-white rounded-[18px] border border-mist shadow-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-ink" style={{ fontSize: 15 }}>Community Rating</h3>
        <span className="text-xs text-ink-40">{total} {total === 1 ? 'rating' : 'ratings'}</span>
      </div>

      <div className="flex items-center gap-3">
        <span
          className="font-display font-bold text-ink"
          style={{ fontSize: 36, letterSpacing: '-0.02em' }}
        >
          {avg > 0 ? avg.toFixed(1) : '—'}
        </span>
        <div>
          <div className="text-amber-DEFAULT">
            <StarRow avg={avg} size="md" />
          </div>
          <p className="text-xs text-ink-40 mt-0.5">out of 5</p>
        </div>
      </div>

      <div className="border-t border-mist pt-4">
        <p className="text-xs font-semibold text-ink-60 mb-2">
          {current > 0 ? `Your rating: ${current}/5` : userId ? 'Rate this deal:' : 'Sign in to rate'}
        </p>
        <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => rate(s)}
              onMouseEnter={() => setHovered(s)}
              disabled={submitting || !userId}
              className={`transition-all duration-100 ${
                s <= (hovered || current) ? 'text-amber-400 scale-110' : 'text-ink-40 hover:text-amber-300'
              } ${!userId ? 'cursor-pointer opacity-60' : 'cursor-pointer'}`}
            >
              <StarIcon filled={s <= (hovered || current)} />
            </button>
          ))}
        </div>
        {!userId && (
          <a href="/auth" className="text-xs text-mydealz font-semibold hover:underline mt-2 inline-block">
            Sign in to rate →
          </a>
        )}
      </div>
    </div>
  )
}

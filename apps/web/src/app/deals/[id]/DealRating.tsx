'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  dealId: string
  avgScore: number
  totalRatings: number
  userScore: number | null
  userId: string | null
}

function StarIcon({ filled, half = false }: { filled: boolean; half?: boolean }) {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      {half ? (
        <>
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill="url(#half)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </>
      ) : (
        <path
          fill={filled ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={filled ? 0 : 1.5}
          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
        />
      )}
    </svg>
  )
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
      const newAvg = wasNew
        ? (oldSum + score) / newTotal
        : (oldSum - current + score) / newTotal
      setCurrent(score)
      setAvg(newAvg)
      setTotal(newTotal)
    }
    setSubmitting(false)
  }

  const displayStars = hovered || current || avg
  const roundedAvg = Math.round(avg * 2) / 2

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Community Rating</h3>
        <span className="text-xs text-gray-400">{total} {total === 1 ? 'rating' : 'ratings'}</span>
      </div>

      {/* Average display */}
      <div className="flex items-center gap-3">
        <span className="text-4xl font-black text-gray-900">{avg > 0 ? avg.toFixed(1) : '—'}</span>
        <div>
          <div className="flex text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <StarIcon key={s} filled={s <= Math.floor(roundedAvg)} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">out of 5</p>
        </div>
      </div>

      {/* User rating */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-semibold text-gray-500 mb-2">
          {current > 0 ? `Your rating: ${current}/5` : userId ? 'Rate this deal:' : 'Sign in to rate'}
        </p>
        <div
          className="flex gap-1"
          onMouseLeave={() => setHovered(0)}
        >
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => rate(s)}
              onMouseEnter={() => setHovered(s)}
              disabled={submitting || !userId}
              className={`transition-all duration-100 ${
                s <= (hovered || current)
                  ? 'text-amber-400 scale-110'
                  : 'text-gray-300 hover:text-amber-300'
              } ${!userId ? 'cursor-pointer opacity-60' : 'cursor-pointer'}`}
            >
              <StarIcon filled={s <= (hovered || current)} />
            </button>
          ))}
        </div>
        {!userId && (
          <a href="/auth" className="text-xs text-brand-500 font-semibold hover:underline mt-2 inline-block">
            Sign in to rate →
          </a>
        )}
      </div>
    </div>
  )
}

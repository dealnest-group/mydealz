import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { ProfileSettings } from './ProfileSettings'
import { StarRow } from '@mydealz/ui'

export const metadata: Metadata = { title: 'My Profile — MyDealz' }

const REACTION_EMOJI: Record<string, string> = { like: '👍', heart: '❤️', fire: '🔥' }

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const AVATAR_COLORS = [
  'bg-brand-500', 'bg-blue-500', 'bg-purple-500',
  'bg-emerald-500', 'bg-rose-500', 'bg-amber-500',
]
function avatarColor(userId: string) {
  const hash = userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const displayName = (user.user_metadata?.name as string | undefined)
    || user.email!.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const memberSince = new Date(user.created_at).toLocaleDateString('en-GB', {
    month: 'long', year: 'numeric',
  })
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  // Parallel activity fetch
  const [commentsRes, ratingsRes, reactionsRes] = await Promise.all([
    supabase
      .from('deal_comments')
      .select('id, content, created_at, deals(id, title)')
      .eq('user_id', user.id)
      .is('parent_id', null)
      .order('created_at', { ascending: false })
      .limit(15),
    supabase
      .from('deal_ratings')
      .select('id, score, created_at, deals(id, title)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(15),
    supabase
      .from('comment_reactions')
      .select('id, type, created_at, deal_comments(id, deals(id, title))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(15),
  ])

  const comments  = commentsRes.data  ?? []
  const ratings   = ratingsRes.data   ?? []
  const reactions = reactionsRes.data ?? []

  // Merge all activity into a single timeline
  type ActivityItem =
    | { kind: 'comment'; id: string; content: string; dealId: string; dealTitle: string; date: string }
    | { kind: 'rating';  id: string; score: number;  dealId: string; dealTitle: string; date: string }
    | { kind: 'reaction';id: string; type: string;   dealId: string; dealTitle: string; date: string }

  const timeline: ActivityItem[] = [
    ...comments.map((c: any) => ({
      kind: 'comment' as const,
      id: c.id,
      content: c.content,
      dealId: c.deals?.id ?? '',
      dealTitle: c.deals?.title ?? 'a deal',
      date: c.created_at,
    })),
    ...ratings.map((r: any) => ({
      kind: 'rating' as const,
      id: r.id,
      score: r.score,
      dealId: r.deals?.id ?? '',
      dealTitle: r.deals?.title ?? 'a deal',
      date: r.created_at,
    })),
    ...reactions.map((r: any) => ({
      kind: 'reaction' as const,
      id: r.id,
      type: r.type,
      dealId: r.deal_comments?.deals?.id ?? '',
      dealTitle: r.deal_comments?.deals?.title ?? 'a deal',
      date: r.created_at,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const stats = [
    { label: 'Deals rated',  value: ratings.length,   icon: '★' },
    { label: 'Comments',     value: comments.length,  icon: '💬' },
    { label: 'Reactions',    value: reactions.length, icon: '❤️' },
  ]

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Profile header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-5">
            <div className={`w-20 h-20 rounded-2xl ${avatarColor(user.id)} flex items-center justify-center shadow-sm shrink-0`}>
              <span className="text-3xl font-black text-white">{initials}</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-black text-gray-900 truncate">{displayName}</h1>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
              <p className="text-xs text-gray-400 mt-1">Member since {memberSince}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-8 mt-6 pt-6 border-t border-gray-100">
            {stats.map(({ label, value, icon }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-black text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body grid */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

        {/* ── Activity feed (3 cols) ── */}
        <section className="lg:col-span-3 space-y-4">
          <h2 className="text-lg font-black text-gray-900">Recent Activity</h2>

          {timeline.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-card p-8 text-center">
              <p className="text-3xl mb-2">🎯</p>
              <p className="text-sm font-semibold text-gray-500">No activity yet</p>
              <p className="text-xs text-gray-400 mt-1">Rate a deal or leave a comment to get started.</p>
              <a href="/" className="mt-4 inline-block text-sm font-bold text-brand-500 hover:underline">
                Browse deals →
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              {timeline.map((item) => (
                <a
                  key={item.id}
                  href={item.dealId ? `/deals/${item.dealId}` : '#'}
                  className="group block bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 p-4"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      item.kind === 'comment'  ? 'bg-blue-50 text-blue-500' :
                      item.kind === 'rating'   ? 'bg-amber-50 text-amber-500' :
                      'bg-rose-50 text-rose-500'
                    }`}>
                      {item.kind === 'comment'  && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      )}
                      {item.kind === 'rating' && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )}
                      {item.kind === 'reaction' && (
                        <span className="text-sm">{REACTION_EMOJI[item.type] ?? '❤️'}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 leading-snug">
                        {item.kind === 'comment' && (
                          <>
                            You commented on{' '}
                            <span className="font-semibold text-gray-900 group-hover:text-brand-500 transition-colors">
                              {item.dealTitle}
                            </span>
                          </>
                        )}
                        {item.kind === 'rating' && (
                          <>
                            You rated{' '}
                            <span className="font-semibold text-gray-900 group-hover:text-brand-500 transition-colors">
                              {item.dealTitle}
                            </span>
                            {' '}{item.score}/5
                          </>
                        )}
                        {item.kind === 'reaction' && (
                          <>
                            You reacted {REACTION_EMOJI[item.type]} to a comment on{' '}
                            <span className="font-semibold text-gray-900 group-hover:text-brand-500 transition-colors">
                              {item.dealTitle}
                            </span>
                          </>
                        )}
                      </p>
                      {item.kind === 'comment' && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">&ldquo;{item.content}&rdquo;</p>
                      )}
                      {item.kind === 'rating' && (
                        <div className="mt-1">
                          <StarRow avg={item.score} />
                        </div>
                      )}
                      <p className="text-[11px] text-gray-400 mt-1">{timeAgo(item.date)}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* ── Settings (2 cols) ── */}
        <aside className="lg:col-span-2">
          <ProfileSettings user={{ email: user.email!, name: displayName }} />
        </aside>
      </div>
    </main>
  )
}

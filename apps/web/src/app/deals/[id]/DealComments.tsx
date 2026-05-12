'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Reaction = { type: 'like' | 'heart' | 'fire'; count: number; reacted: boolean }
type Comment = {
  id: string
  user_id: string
  user_email: string
  content: string
  created_at: string
  parent_id: string | null
  reactions: Reaction[]
  replies: Comment[]
}
type Props = { dealId: string; initialComments: Comment[]; userId: string | null; userEmail: string | null }

const REACTIONS: { type: 'like' | 'heart' | 'fire'; emoji: string }[] = [
  { type: 'like', emoji: '👍' },
  { type: 'heart', emoji: '❤️' },
  { type: 'fire', emoji: '🔥' },
]

const AVATAR_PALETTE = ['bg-mydealz', 'bg-blue-500', 'bg-purple-500', 'bg-sage', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500']
function avatarBg(userId: string) {
  const h = userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length]
}
function displayName(email: string) {
  return email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
function initials(email: string) {
  return displayName(email).split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function Avatar({ email, userId }: { email: string; userId: string }) {
  return (
    <div className={`w-8 h-8 rounded-full ${avatarBg(userId)} flex items-center justify-center shrink-0`}>
      <span className="text-[11px] font-bold text-white">{initials(email)}</span>
    </div>
  )
}

function ReactionBar({ reactions, commentId, userId, onReact }: {
  reactions: Reaction[]
  commentId: string
  userId: string | null
  onReact: (id: string, type: 'like' | 'heart' | 'fire') => void
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {REACTIONS.map(({ type, emoji }) => {
        const r = reactions.find((x) => x.type === type)
        const count = r?.count ?? 0
        const reacted = r?.reacted ?? false
        return (
          <button
            key={type}
            onClick={() => userId ? onReact(commentId, type) : (window.location.href = '/auth')}
            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-all ${
              reacted
                ? 'bg-mydealz-soft border-mydealz/30 text-mydealz-deep font-semibold'
                : 'bg-chalk border-mist text-ink-60 hover:border-mydealz/30 hover:bg-mydealz-soft'
            }`}
          >
            <span>{emoji}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        )
      })}
    </div>
  )
}

function CommentCard({ comment, dealId, userId, userEmail, depth, onReact, onReply }: {
  comment: Comment
  dealId: string
  userId: string | null
  userEmail: string | null
  depth: number
  onReact: (id: string, type: 'like' | 'heart' | 'fire') => void
  onReply: (parentId: string, content: string) => Promise<void>
}) {
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [posting, setPosting] = useState(false)

  async function submitReply() {
    if (!replyText.trim() || posting) return
    setPosting(true)
    await onReply(comment.id, replyText.trim())
    setReplyText('')
    setShowReply(false)
    setPosting(false)
  }

  return (
    <div className={depth > 0 ? 'ml-9 mt-3' : ''}>
      <div className="flex gap-3">
        <Avatar email={comment.user_email} userId={comment.user_id} />
        <div className="flex-1 min-w-0">
          <div className="bg-chalk rounded-2xl rounded-tl-sm px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-ink">{displayName(comment.user_email)}</span>
              <span className="text-[10px] text-ink-40">{timeAgo(comment.created_at)}</span>
            </div>
            <p className="text-sm text-ink-80 leading-relaxed whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-2 px-1">
            <ReactionBar reactions={comment.reactions} commentId={comment.id} userId={userId} onReact={onReact} />
            {depth === 0 && (
              <button
                onClick={() => userId ? setShowReply(!showReply) : (window.location.href = '/auth')}
                className="text-xs text-ink-40 hover:text-mydealz font-semibold transition-colors flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Reply
              </button>
            )}
          </div>

          {showReply && (
            <div className="mt-3 flex gap-2">
              {userEmail && <Avatar email={userEmail} userId={userId!} />}
              <div className="flex-1 flex gap-2">
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && submitReply()}
                  placeholder="Write a reply…"
                  className="flex-1 px-3 py-2 text-sm bg-chalk border border-mist rounded-xl outline-none focus:ring-2 focus:ring-mydealz/20 focus:border-mydealz/40 transition"
                  autoFocus
                />
                <button
                  onClick={submitReply}
                  disabled={!replyText.trim() || posting}
                  className="bg-mydealz hover:brightness-105 disabled:opacity-50 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-[filter] shrink-0"
                >
                  Post
                </button>
              </div>
            </div>
          )}

          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              dealId={dealId}
              userId={userId}
              userEmail={userEmail}
              depth={1}
              onReact={onReact}
              onReply={onReply}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function DealComments({ dealId, initialComments, userId, userEmail }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)
  const supabase = createClient()

  async function postComment(parentId: string | null, content: string) {
    if (!userId || !content.trim()) return
    const { data, error } = await supabase
      .from('deal_comments')
      .insert({ deal_id: dealId, user_id: userId, content: content.trim(), parent_id: parentId })
      .select('id, user_id, content, created_at, parent_id')
      .single()
    if (error || !data) return
    const newComment: Comment = {
      id: data.id, user_id: userId, user_email: userEmail ?? '',
      content: data.content, created_at: data.created_at,
      parent_id: data.parent_id, reactions: [], replies: [],
    }
    if (parentId) {
      setComments((prev) => prev.map((c) => c.id === parentId ? { ...c, replies: [...c.replies, newComment] } : c))
    } else {
      setComments((prev) => [newComment, ...prev])
    }
  }

  async function handlePost() {
    if (!text.trim() || posting) return
    setPosting(true)
    await postComment(null, text)
    setText('')
    setPosting(false)
  }

  async function handleReact(commentId: string, type: 'like' | 'heart' | 'fire') {
    if (!userId) return
    const updateReactions = (cs: Comment[]): Comment[] =>
      cs.map((c) => {
        if (c.id === commentId) {
          const existing = c.reactions.find((r) => r.type === type)
          const reacted = existing?.reacted ?? false
          const updated = c.reactions.map((r) =>
            r.type === type ? { ...r, count: r.count + (reacted ? -1 : 1), reacted: !reacted } : r,
          )
          if (!existing) updated.push({ type, count: 1, reacted: true })
          return { ...c, reactions: updated }
        }
        return { ...c, replies: updateReactions(c.replies) }
      })
    setComments((prev) => updateReactions(prev))
    const { data: existing } = await supabase
      .from('comment_reactions').select('id')
      .eq('comment_id', commentId).eq('user_id', userId).eq('type', type).maybeSingle()
    if (existing) {
      await supabase.from('comment_reactions').delete().eq('id', existing.id)
    } else {
      await supabase.from('comment_reactions').insert({ comment_id: commentId, user_id: userId, type })
    }
  }

  const totalComments = comments.reduce((sum, c) => sum + 1 + c.replies.length, 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-ink-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h3 className="font-semibold text-ink" style={{ fontSize: 15 }}>
          Comments
          {totalComments > 0 && <span className="ml-2 text-sm font-normal text-ink-40">({totalComments})</span>}
        </h3>
      </div>

      {userId ? (
        <div className="flex gap-3">
          <Avatar email={userEmail!} userId={userId} />
          <div className="flex-1 space-y-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your thoughts on this deal…"
              rows={2}
              className="w-full px-4 py-3 text-sm bg-chalk border border-mist rounded-2xl outline-none focus:ring-2 focus:ring-mydealz/20 focus:border-mydealz/40 transition resize-none text-ink placeholder-ink-40"
            />
            <div className="flex justify-end">
              <button
                onClick={handlePost}
                disabled={!text.trim() || posting}
                className="bg-mydealz hover:brightness-105 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-[filter]"
              >
                {posting ? 'Posting…' : 'Post comment'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-chalk border border-mist rounded-2xl p-4 text-center">
          <p className="text-sm text-ink-60 mb-3">Sign in to join the discussion</p>
          <a href="/auth" className="inline-flex items-center gap-2 bg-mydealz hover:brightness-105 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-[filter]">
            Sign in to comment
          </a>
        </div>
      )}

      {comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-ink-40 mt-2">No comments yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              dealId={dealId}
              userId={userId}
              userEmail={userEmail}
              depth={0}
              onReact={handleReact}
              onReply={(parentId, content) => postComment(parentId, content)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

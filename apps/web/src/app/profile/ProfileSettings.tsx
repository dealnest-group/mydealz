'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Props = { user: { email: string; name: string } }
type Section = 'profile' | 'password' | null

export function ProfileSettings({ user }: Props) {
  const [open, setOpen] = useState<Section>(null)
  const [name, setName] = useState(user.name)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const supabase = createClient()
  const router = useRouter()

  function flash(type: 'ok' | 'err', text: string) {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  async function saveName(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ data: { name: name.trim() } })
    setSaving(false)
    if (error) flash('err', error.message)
    else { flash('ok', 'Name updated'); router.refresh() }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPw !== confirmPw) { flash('err', 'Passwords do not match'); return }
    if (newPw.length < 6)    { flash('err', 'Password must be at least 6 characters'); return }
    setSaving(true)
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPw })
    if (signInErr) { setSaving(false); flash('err', 'Current password is incorrect'); return }
    const { error } = await supabase.auth.updateUser({ password: newPw })
    setSaving(false)
    if (error) flash('err', error.message)
    else { flash('ok', 'Password updated'); setCurrentPw(''); setNewPw(''); setConfirmPw(''); setOpen(null) }
  }

  const inputCls = 'w-full px-4 py-2.5 text-sm border border-mist rounded-xl outline-none focus:ring-2 focus:ring-mydealz/20 focus:border-mydealz/40 transition bg-cream text-ink placeholder-ink-40'

  return (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-ink" style={{ fontSize: 20, letterSpacing: '-0.015em' }}>
        Account Settings
      </h2>

      {msg && (
        <div className={`text-sm px-4 py-3 rounded-xl border ${
          msg.type === 'ok'
            ? 'bg-mydealz-soft border-mydealz/20 text-mydealz-deep'
            : 'bg-rust/10 border-rust/20 text-rust'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Display name */}
      <div className="bg-white rounded-[18px] border border-mist shadow-card overflow-hidden">
        <button
          onClick={() => setOpen(open === 'profile' ? null : 'profile')}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-chalk transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-mydealz-soft rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-mydealz-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-ink">Display Name</p>
              <p className="text-xs text-ink-60">{user.name}</p>
            </div>
          </div>
          <svg className={`w-4 h-4 text-ink-40 transition-transform ${open === 'profile' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open === 'profile' && (
          <form onSubmit={saveName} className="px-5 pb-5 space-y-3 border-t border-mist">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={`${inputCls} mt-4`} />
            <button type="submit" disabled={saving || !name.trim()} className="w-full bg-mydealz hover:brightness-105 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-[filter]">
              {saving ? 'Saving…' : 'Save Name'}
            </button>
          </form>
        )}
      </div>

      {/* Email (read-only) */}
      <div className="bg-white rounded-[18px] border border-mist shadow-card px-5 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-chalk rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-ink-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Email</p>
          <p className="text-xs text-ink-60">{user.email}</p>
        </div>
        <span className="ml-auto text-[10px] font-semibold text-ink-40 bg-chalk border border-mist px-2 py-0.5 rounded-full">
          Read-only
        </span>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-[18px] border border-mist shadow-card overflow-hidden">
        <button
          onClick={() => setOpen(open === 'password' ? null : 'password')}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-chalk transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-mydealz-soft rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-mydealz-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-ink">Change Password</p>
          </div>
          <svg className={`w-4 h-4 text-ink-40 transition-transform ${open === 'password' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open === 'password' && (
          <form onSubmit={changePassword} className="px-5 pb-5 space-y-3 border-t border-mist">
            {[
              { label: 'Current password', val: currentPw, set: setCurrentPw },
              { label: 'New password',     val: newPw,     set: setNewPw },
              { label: 'Confirm new',      val: confirmPw, set: setConfirmPw },
            ].map(({ label, val, set }) => (
              <div key={label}>
                <label className="block text-xs font-semibold text-ink-60 mb-1 mt-3">{label}</label>
                <input type="password" value={val} onChange={(e) => set(e.target.value)} required minLength={6} className={inputCls} />
              </div>
            ))}
            <button type="submit" disabled={saving} className="w-full bg-mydealz hover:brightness-105 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-[filter]">
              {saving ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        )}
      </div>

      {/* Sign out */}
      <div className="bg-white rounded-[18px] border border-mist shadow-card px-5 py-4">
        <p className="text-sm font-semibold text-ink mb-1">Sign Out</p>
        <p className="text-xs text-ink-60 mb-3">You'll need to sign in again on this device.</p>
        <form action="/auth/signout" method="POST">
          <button type="submit" className="text-sm font-semibold text-rust hover:bg-rust/10 px-4 py-2 rounded-xl border border-rust/20 transition-colors">
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}

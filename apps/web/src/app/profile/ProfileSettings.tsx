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
    // Re-authenticate then update password
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPw,
    })
    if (signInErr) { setSaving(false); flash('err', 'Current password is incorrect'); return }
    const { error } = await supabase.auth.updateUser({ password: newPw })
    setSaving(false)
    if (error) flash('err', error.message)
    else { flash('ok', 'Password updated'); setCurrentPw(''); setNewPw(''); setConfirmPw(''); setOpen(null) }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-gray-900">Account Settings</h2>

      {msg && (
        <div className={`text-sm px-4 py-3 rounded-xl border ${
          msg.type === 'ok'
            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
            : 'bg-red-50 border-red-100 text-red-600'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Profile details */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <button
          onClick={() => setOpen(open === 'profile' ? null : 'profile')}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900">Display Name</p>
              <p className="text-xs text-gray-400">{user.name}</p>
            </div>
          </div>
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${open === 'profile' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open === 'profile' && (
          <form onSubmit={saveName} className="px-5 pb-5 space-y-3 border-t border-gray-100">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full mt-4 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 transition"
            />
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
            >
              {saving ? 'Saving…' : 'Save Name'}
            </button>
          </form>
        )}
      </div>

      {/* Email (read-only) */}
      <div className="bg-white rounded-2xl shadow-card px-5 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Email</p>
          <p className="text-xs text-gray-400">{user.email}</p>
        </div>
        <span className="ml-auto text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          Read-only
        </span>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <button
          onClick={() => setOpen(open === 'password' ? null : 'password')}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-gray-900">Change Password</p>
          </div>
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${open === 'password' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open === 'password' && (
          <form onSubmit={changePassword} className="px-5 pb-5 space-y-3 border-t border-gray-100">
            {[
              { label: 'Current password', val: currentPw, set: setCurrentPw },
              { label: 'New password',     val: newPw,     set: setNewPw },
              { label: 'Confirm new',      val: confirmPw, set: setConfirmPw },
            ].map(({ label, val, set }) => (
              <div key={label}>
                <label className="block text-xs font-semibold text-gray-600 mb-1 mt-3">{label}</label>
                <input
                  type="password"
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 transition"
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
            >
              {saving ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        )}
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl shadow-card px-5 py-4">
        <p className="text-sm font-bold text-gray-900 mb-1">Sign Out</p>
        <p className="text-xs text-gray-400 mb-3">You'll need to sign in again on this device.</p>
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl border border-red-100 transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}

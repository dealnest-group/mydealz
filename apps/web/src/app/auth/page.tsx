'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Mode = 'signin' | 'signup'

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      })
      if (error) setError(error.message)
      else setSuccess('Check your email to confirm your account, then sign in.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else { router.push('/'); router.refresh() }
    }
    setLoading(false)
  }

  function switchMode(m: Mode) {
    setMode(m)
    setError('')
    setSuccess('')
  }

  const inputCls = `w-full px-4 py-3 text-sm border border-mist rounded-xl outline-none
    focus:ring-2 focus:ring-mydealz/20 focus:border-mydealz/40 transition
    bg-white text-ink placeholder-ink-40`

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-cream">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex flex-col items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/mydealz-icon.svg" alt="MyDealz" width={44} height={44} />
            <span
              className="font-display font-bold text-ink"
              style={{ fontSize: 26, letterSpacing: '-0.02em' }}
            >
              MyDealz
            </span>
          </a>
          <p className="mt-2 text-sm text-ink-60">
            {mode === 'signin' ? 'Welcome back' : 'Create your free account'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[18px] border border-mist shadow-card p-8">

          {/* Tabs */}
          <div className="flex rounded-xl p-1 mb-6" style={{ background: '#F6F1E7' }}>
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 text-sm font-semibold rounded-[10px] transition-all ${
                  mode === m
                    ? 'bg-white text-ink shadow-sm'
                    : 'text-ink-60 hover:text-ink'
                }`}
              >
                {m === 'signin' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-ink-80 mb-1.5">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required={mode === 'signup'}
                  className={inputCls}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-ink-80 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-80 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                className={inputCls}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-xs text-rust bg-rust/10 border border-rust/20 rounded-xl px-3 py-2.5">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 text-xs text-mydealz-deep bg-mydealz-soft border border-mydealz/20 rounded-xl px-3 py-2.5">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-mydealz text-white font-semibold py-3 px-4 rounded-xl transition-[filter] duration-100 hover:brightness-105 disabled:opacity-60 text-sm"
            >
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {mode === 'signin' && (
            <p className="text-center text-xs text-ink-40 mt-4">
              <a href="/auth/reset" className="hover:text-mydealz transition-colors">
                Forgot password?
              </a>
            </p>
          )}
        </div>

        <p className="text-center text-xs text-ink-60 mt-6">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-mydealz font-semibold hover:underline"
          >
            {mode === 'signin' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </div>
    </main>
  )
}

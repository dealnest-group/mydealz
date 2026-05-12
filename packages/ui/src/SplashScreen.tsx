'use client'

import { useEffect, useState } from 'react'

type Phase = 'hidden' | 'show' | 'fade'

export function SplashScreen() {
  const [phase, setPhase] = useState<Phase>('hidden')

  useEffect(() => {
    // localStorage persists forever — splash only shows on first ever visit
    if (localStorage.getItem('md-splash-done')) return

    setPhase('show')
    const t1 = setTimeout(() => setPhase('fade'), 2000)
    const t2 = setTimeout(() => {
      setPhase('hidden')
      localStorage.setItem('md-splash-done', '1')
    }, 2600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (phase === 'hidden') return null

  return (
    <div
      className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-gray-950 transition-opacity duration-600 ${
        phase === 'fade' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Glow */}
      <div className="absolute w-96 h-96 bg-brand-500 rounded-full blur-[120px] opacity-15 animate-float" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-amber-400 rounded-full blur-[100px] opacity-10 animate-float [animation-delay:1s]" />

      {/* Logo */}
      <div className="relative animate-scaleIn">
        <p className="text-6xl font-black tracking-tight select-none">
          <span className="text-white">my</span>
          <span className="text-brand-500">dealz</span>
        </p>
        <span className="absolute -top-1 -right-3 w-2.5 h-2.5 bg-brand-500 rounded-full animate-blink" />
      </div>

      <p
        className="mt-5 text-sm text-gray-500 tracking-widest uppercase font-medium animate-fadeInUp"
        style={{ animationDelay: '0.35s' }}
      >
        AI-curated UK deals
      </p>

      <div
        className="mt-10 w-32 h-0.5 bg-gray-800 rounded-full overflow-hidden animate-fadeInUp"
        style={{ animationDelay: '0.6s' }}
      >
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-amber-400 rounded-full"
          style={{ animation: 'loadBar 1.8s ease-in-out forwards' }}
        />
      </div>

      <style>{`
        @keyframes loadBar { from { width: 0% } to { width: 100% } }
      `}</style>
    </div>
  )
}

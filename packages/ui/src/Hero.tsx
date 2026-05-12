import React from 'react'

export function Hero({ dealCount = 0 }: { dealCount?: number }) {
  return (
    <section className="relative bg-gray-950 overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-500 rounded-full blur-[160px] opacity-10 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-400 rounded-full blur-[140px] opacity-8 translate-x-1/3 translate-y-1/3" />

      {/* Grid texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
        {/* Live badge */}
        <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-wide">
          <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" style={{ animation: 'blink 1.4s ease-in-out infinite' }} />
          Live · Updated every 30 minutes
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-4">
          Your Personal
          <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-orange-300 to-amber-300">
            AI Savings Companion
          </span>
        </h1>

        {/* Slogan */}
        <p className="text-brand-400 text-sm font-bold tracking-widest uppercase mb-6">
          Save Smarter. Every Time.
        </p>

        <p className="text-gray-400 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
          AI-verified deals from top UK retailers. Rate deals, save money,
          and MyDealz learns exactly what you love.
        </p>

        {/* Search */}
        <div className="flex max-w-lg mx-auto rounded-2xl overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_24px_64px_rgba(0,0,0,0.5)]">
          <div className="flex-1 flex items-center bg-white px-5 gap-3">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Search deals, brands, categories…"
              className="flex-1 py-4 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
            />
          </div>
          <button className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm px-7 transition-colors shrink-0">
            Search
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 mt-12">
          {[
            { value: dealCount > 0 ? `${dealCount}+` : '2,400+', label: 'Live Deals' },
            { value: '94%',  label: 'Authenticity Rate' },
            { value: '£47',  label: 'Avg. Saving' },
            { value: '14',   label: 'Top Retailers' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

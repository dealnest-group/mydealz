import React from 'react'

type HeaderProps = {
  user?: { email?: string } | null
  searchDefault?: string
}

export function Header({ user, searchDefault }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-ink border-b" style={{ borderColor: 'rgba(246,241,231,0.08)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center h-16 gap-8">

          {/* Logo lockup */}
          <a href="/" className="shrink-0 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/mydealz-icon.svg" alt="" width={32} height={32} />
            <span
              className="font-display font-bold text-cream"
              style={{ fontSize: 22, letterSpacing: '-0.02em' }}
            >
              MyDealz
            </span>
          </a>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 ml-8" style={{ fontSize: 14 }}>
            {['Trending', 'Categories', 'For you', 'Hunt squad'].map((label) => (
              <a
                key={label}
                href={`/${label.toLowerCase().replace(' ', '-')}`}
                className="text-cream/70 hover:text-cream transition-colors duration-150"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Search */}
          <form action="/" method="GET" className="flex-1 max-w-xs hidden lg:block">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: 'rgba(246,241,231,0.35)' }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                name="search"
                type="search"
                defaultValue={searchDefault}
                placeholder="Search deals…"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none transition-all"
                style={{
                  background: 'rgba(246,241,231,0.07)',
                  border: '1px solid rgba(246,241,231,0.12)',
                  color: '#F6F1E7',
                }}
              />
            </div>
          </form>

          {/* Auth */}
          <div className="ml-auto flex items-center gap-2.5 shrink-0">
            {user ? (
              <a
                href="/profile"
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: 'rgba(246,241,231,0.7)' }}
              >
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-mydealz text-ink font-bold text-xs shrink-0"
                >
                  {(user.email ?? 'U')[0].toUpperCase()}
                </span>
                <span className="hidden lg:block">{user.email?.split('@')[0]}</span>
              </a>
            ) : (
              <>
                <a
                  href="/auth"
                  className="text-sm font-medium px-4 py-2 rounded-[10px] transition-colors duration-150"
                  style={{
                    color: '#F6F1E7',
                    border: '1px solid rgba(246,241,231,0.2)',
                  }}
                >
                  Sign in
                </a>
                <a
                  href="/auth"
                  className="text-sm font-semibold px-4 py-2 rounded-[10px] bg-mydealz text-ink transition-[filter] duration-150 hover:brightness-105"
                >
                  Get the app
                </a>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}

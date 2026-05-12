import React from 'react'

type HeaderProps = {
  user?: { email?: string } | null
  searchDefault?: string
}

export function Header({ user, searchDefault }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass border-b border-gray-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">

          {/* Logo */}
          <a href="/" className="shrink-0 flex items-center gap-2">
            <span className="text-xl font-black tracking-tight leading-none">
              <span className="text-gray-900">my</span>
              <span className="text-brand-500">dealz</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 bg-brand-50 border border-brand-200 text-brand-600 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
              <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
              AI-Verified
            </span>
          </a>

          {/* Search — plain HTML form, works without JS */}
          <form action="/" method="GET" className="flex-1 max-w-md mx-auto">
            <div className="relative">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                name="search"
                type="search"
                defaultValue={searchDefault}
                placeholder="Search deals, brands…"
                className="w-full pl-10 pr-12 py-2.5 text-sm bg-gray-100 hover:bg-gray-50 focus:bg-white border border-transparent focus:border-brand-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 transition-all placeholder-gray-400"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg transition-colors"
              >
                Go
              </button>
            </div>
          </form>

          {/* Nav + Auth */}
          <nav className="hidden md:flex items-center gap-0.5 shrink-0">
            <a href="/" className="text-sm font-semibold text-gray-600 hover:text-brand-500 px-3 py-2 rounded-lg hover:bg-brand-50 transition-colors">
              Deals
            </a>
            <a href="/trending" className="text-sm font-semibold text-gray-600 hover:text-brand-500 px-3 py-2 rounded-lg hover:bg-brand-50 transition-colors">
              Trending
            </a>

            {user ? (
              <div className="flex items-center gap-2 ml-2">
                <span className="text-xs text-gray-500 max-w-[120px] truncate hidden lg:block">
                  {user.email}
                </span>
                <form action="/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="text-sm font-semibold text-gray-600 hover:text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <a
                href="/auth"
                className="ml-2 text-sm font-bold bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl transition-colors shadow-sm"
              >
                Sign In
              </a>
            )}
          </nav>

          {/* Mobile: auth icon */}
          <div className="md:hidden shrink-0 flex items-center gap-1">
            {user ? (
              <form action="/auth/signout" method="POST">
                <button className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-xs font-semibold">
                  Out
                </button>
              </form>
            ) : (
              <a href="/auth" className="p-2 text-brand-500 font-bold text-sm rounded-lg hover:bg-brand-50">
                Sign in
              </a>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}

import React from 'react'

const CATEGORIES = [
  { label: 'All Deals',    value: null,        emoji: '✦' },
  { label: 'Tech',         value: 'Tech',       emoji: '💻' },
  { label: 'Audio',        value: 'Audio',      emoji: '🎧' },
  { label: 'TVs',          value: 'TVs',        emoji: '📺' },
  { label: 'Kitchen',      value: 'Kitchen',    emoji: '🍳' },
  { label: 'Home',         value: 'Home',       emoji: '🏠' },
  { label: 'Toys',         value: 'Toys',       emoji: '🧸' },
  { label: 'Fashion',      value: 'Fashion',    emoji: '👗' },
  { label: 'Sports',       value: 'Sports',     emoji: '⚽' },
  { label: 'Beauty',       value: 'Beauty',     emoji: '✨' },
]

export function CategoryFilter({
  active,
  forYouActive = false,
}: {
  active?: string | null
  forYouActive?: boolean
}) {
  return (
    <div className="bg-white/70 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">

          {/* AI "Deals for you" pill — always first */}
          <a
            href="/for-you"
            className={`shrink-0 inline-flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-full border transition-all duration-150 whitespace-nowrap ${
              forYouActive
                ? 'bg-gradient-to-r from-brand-500 to-amber-500 text-white border-transparent shadow-md shadow-brand-500/40'
                : 'bg-gradient-to-r from-brand-500 to-amber-500 text-white border-transparent shadow-sm shadow-brand-500/20 opacity-90 hover:opacity-100 hover:shadow-md'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Deals for you
          </a>

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200 shrink-0" />

          {/* Category pills */}
          {CATEGORIES.map((cat) => {
            const isActive = !forYouActive && (active === cat.value || (!active && cat.value === null))
            return (
              <a
                key={cat.label}
                href={cat.value ? `/?category=${cat.value}` : '/'}
                className={`shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-full border transition-all duration-150 whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-500 text-white border-brand-500 shadow-sm shadow-brand-500/30'
                    : 'text-gray-600 border-gray-200 bg-white hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50'
                }`}
              >
                <span className="text-base leading-none">{cat.emoji}</span>
                {cat.label}
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}

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

export function CategoryFilter({ active }: { active?: string | null }) {
  return (
    <div className="bg-white/70 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const isActive = active === cat.value || (!active && cat.value === null)
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

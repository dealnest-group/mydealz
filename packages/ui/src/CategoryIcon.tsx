import React from 'react'

type IconProps = { className?: string }

const Laptop = ({ className }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const Headphones = ({ className }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M9 19V13a5 5 0 1110 0v6M9 19a2 2 0 01-2 2H6a2 2 0 01-2-2v-3a2 2 0 012-2h1a2 2 0 012 2v3zm6 0a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2h-1a2 2 0 00-2 2v3z" />
  </svg>
)

const Television = ({ className }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 7h18M5 17h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
)

const Kitchen = ({ className }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M3 10h18M3 14h18M10 4v16M14 4v16M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
  </svg>
)

const Home = ({ className }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const GameController = ({ className }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
  </svg>
)

const Shirt = ({ className }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M7 3l-4 4 3 1v11a1 1 0 001 1h10a1 1 0 001-1V8l3-1-4-4c0 0-1.5 2-4 2S7 3 7 3z" />
  </svg>
)

const Trophy = ({ className }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
)

const Sparkles = ({ className }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

const ShoppingBag = ({ className }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
)

const ICON_MAP: Array<{ keywords: string[]; Icon: React.FC<IconProps> }> = [
  { keywords: ['tech', 'electronic', 'computer', 'laptop', 'phone', 'tablet'],   Icon: Laptop },
  { keywords: ['audio', 'headphone', 'speaker', 'music', 'sound'],               Icon: Headphones },
  { keywords: ['tv', 'television', 'monitor', 'screen', 'display'],              Icon: Television },
  { keywords: ['kitchen', 'cooking', 'coffee', 'food', 'appliance', 'air fry'],  Icon: Kitchen },
  { keywords: ['home', 'garden', 'furniture', 'bedding', 'décor', 'decor'],      Icon: Home },
  { keywords: ['toy', 'game', 'gaming', 'lego', 'puzzle', 'play'],               Icon: GameController },
  { keywords: ['fashion', 'cloth', 'wear', 'shirt', 'dress', 'shoe', 'bag'],     Icon: Shirt },
  { keywords: ['sport', 'gym', 'fitness', 'outdoor', 'bicycle', 'run'],          Icon: Trophy },
  { keywords: ['beauty', 'skincare', 'makeup', 'perfume', 'health'],             Icon: Sparkles },
]

export function getCategoryIcon(category: string | null): React.FC<IconProps> {
  if (!category) return ShoppingBag
  const lower = category.toLowerCase()
  const match = ICON_MAP.find(({ keywords }) =>
    keywords.some((kw) => lower.includes(kw)),
  )
  return match?.Icon ?? ShoppingBag
}

export function CategoryIcon({
  category,
  className = 'w-12 h-12',
}: {
  category: string | null
  className?: string
}) {
  const Icon = getCategoryIcon(category)
  return <Icon className={className} />
}

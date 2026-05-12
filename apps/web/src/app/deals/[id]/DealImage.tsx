'use client'

import { useState } from 'react'
import { CategoryIcon } from '@mydealz/ui'

type Props = { imageUrl: string | null; title: string; category: string | null }

export function DealImage({ imageUrl, title, category }: Props) {
  const [failed, setFailed] = useState(!imageUrl)

  return (
    <div className="bg-white rounded-[18px] border border-mist shadow-card overflow-hidden aspect-square flex items-center justify-center">
      {!failed && imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          className="w-full h-full object-contain p-6"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-mist gap-4">
          <CategoryIcon category={category} className="w-24 h-24 text-ink-40" />
          {category && (
            <span className="text-sm font-mono font-medium text-ink-40 uppercase tracking-widest">
              {category}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

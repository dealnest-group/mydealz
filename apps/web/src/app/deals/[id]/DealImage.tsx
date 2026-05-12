'use client'

import { useState } from 'react'
import { CategoryIcon } from '@mydealz/ui'

type Props = {
  imageUrl: string | null
  title: string
  category: string | null
}

export function DealImage({ imageUrl, title, category }: Props) {
  const [failed, setFailed] = useState(!imageUrl)

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden aspect-square flex items-center justify-center">
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
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 to-orange-100 gap-4">
          <CategoryIcon
            category={category}
            className="w-24 h-24 text-brand-400"
          />
          {category && (
            <span className="text-sm font-bold text-brand-400 uppercase tracking-widest">
              {category}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

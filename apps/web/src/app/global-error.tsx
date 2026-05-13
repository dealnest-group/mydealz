'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'

// Catches errors in the root layout itself (rare but catastrophic without this)
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error('Global error boundary triggered', error, { digest: error.digest })
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center font-sans">
          <p className="text-5xl mb-6">💥</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">MyDealz crashed</h1>
          <p className="text-gray-500 mb-8">We&apos;ve been notified. Please try again.</p>
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-orange-500 text-white font-semibold rounded-xl"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  )
}

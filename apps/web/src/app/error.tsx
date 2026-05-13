'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error('Page-level error boundary triggered', error, { digest: error.digest })
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl mb-6">⚠️</p>
      <h2 className="text-2xl font-black text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-gray-500 mb-8 max-w-sm">
        We&apos;ve been notified and are looking into it. Try refreshing the page.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors"
        >
          Try again
        </button>
        <a
          href="/"
          className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
        >
          Go home
        </a>
      </div>
    </div>
  )
}

/**
 * Structured logger for the web app.
 *
 * In development: writes to the browser/server console.
 * In production:  console output is suppressed; errors are forwarded to Sentry.
 *
 * Never use console.log / console.error directly in app code — use this instead.
 * Rule: any `console.*` call is a lint error (configured in eslint.config.js).
 */

type Meta = Record<string, unknown>

function isDev() {
  return process.env.NODE_ENV !== 'production'
}

async function captureWithSentry(message: string, error?: unknown, meta?: Meta) {
  if (typeof window === 'undefined') return // server-side Sentry handled by SDK automatically
  try {
    const Sentry = await import('@sentry/nextjs')
    if (error instanceof Error) {
      Sentry.captureException(error, { extra: { message, ...meta } })
    } else {
      Sentry.captureMessage(message, { level: 'error', extra: meta })
    }
  } catch {
    // Sentry not installed yet — fail silently so logger never crashes the app
  }
}

export const logger = {
  info(message: string, meta?: Meta): void {
    if (isDev()) {
      // eslint-disable-next-line no-console
      console.log(`[info] ${message}`, meta ?? '')
    }
  },

  warn(message: string, meta?: Meta): void {
    if (isDev()) {
      // eslint-disable-next-line no-console
      console.warn(`[warn] ${message}`, meta ?? '')
    }
  },

  error(message: string, error?: unknown, meta?: Meta): void {
    if (isDev()) {
      // eslint-disable-next-line no-console
      console.error(`[error] ${message}`, error ?? '', meta ?? '')
    } else {
      void captureWithSentry(message, error, meta)
    }
  },
}

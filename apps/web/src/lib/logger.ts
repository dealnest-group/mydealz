/**
 * Structured logger for the web app.
 *
 * In development: writes to the browser/server console.
 * In production:  console output is suppressed; errors are forwarded to Sentry
 *                 if @sentry/nextjs is installed.
 *
 * Never use console.log / console.error directly in app code — use this instead.
 */

type Meta = Record<string, unknown>

function isDev() {
  return process.env.NODE_ENV !== 'production'
}

function captureWithSentry(message: string, error?: unknown, meta?: Meta) {
  if (typeof window === 'undefined') return // server side handled by Sentry SDK auto-init
  // Use eval-style require so the missing module never breaks build/typecheck.
  // @ts-expect-error — @sentry/nextjs is an optional runtime dependency
  let Sentry: typeof import('@sentry/nextjs') | undefined
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    Sentry = require('@sentry/nextjs')
  } catch {
    return
  }
  if (!Sentry) return
  if (error instanceof Error) {
    Sentry.captureException(error, { extra: { message, ...meta } })
  } else {
    Sentry.captureMessage(message, { level: 'error', extra: meta })
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
      captureWithSentry(message, error, meta)
    }
  },
}

// Sentry server init — runs only when @sentry/nextjs is installed
// AND SENTRY_DSN is set. No-op otherwise.
/* eslint-disable @typescript-eslint/no-require-imports */

if (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) {
  try {
    const Sentry = require('@sentry/nextjs')
    Sentry.init({
      dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      enabled: process.env.NODE_ENV === 'production',
    })
  } catch {
    // @sentry/nextjs not installed yet — skip
  }
}

export {}

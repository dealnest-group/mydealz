// Sentry client init — runs only when @sentry/nextjs is installed
// AND NEXT_PUBLIC_SENTRY_DSN is set. No-op otherwise so Vercel build
// never breaks during incremental rollout of error tracking.
/* eslint-disable @typescript-eslint/no-require-imports */

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  try {
    const Sentry = require('@sentry/nextjs')
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      enabled: process.env.NODE_ENV === 'production',
      beforeSend(event: { request?: { cookies?: unknown }; user?: { email?: string } }) {
        if (event.request?.cookies) delete event.request.cookies
        if (event.user?.email) delete event.user.email
        return event
      },
    })
  } catch {
    // @sentry/nextjs not installed yet — skip
  }
}

export {}

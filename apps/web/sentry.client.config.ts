import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Capture 10% of sessions for performance tracing in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Only enable in production — avoids noise during local dev
  enabled: process.env.NODE_ENV === 'production',

  // Strip PII from error reports
  beforeSend(event) {
    if (event.request?.cookies) delete event.request.cookies
    if (event.user?.email) delete event.user.email
    return event
  },
})

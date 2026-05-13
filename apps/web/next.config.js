// @ts-check

// Lazily load @sentry/nextjs — skip if not installed yet so Vercel build
// never breaks while the dependency is being added to the lockfile.
let withSentryConfig = (cfg, _opts) => cfg
try {
  withSentryConfig = require('@sentry/nextjs').withSentryConfig
} catch {
  // Sentry not installed yet — proceed without source map upload.
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@mydealz/ui', '@mydealz/db', '@mydealz/types'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.aldi.co.uk' },
      { protocol: 'https', hostname: 'dm.emea.cms.aldi.cx' },
      { protocol: 'https', hostname: '**.lidl.co.uk' },
      { protocol: 'https', hostname: '**.amazon.co.uk' },
      { protocol: 'https', hostname: '**.ebayimg.com' },
      { protocol: 'https', hostname: '**.currys.co.uk' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  disableServerWebpackPlugin: process.env.NODE_ENV !== 'production',
  disableClientWebpackPlugin: process.env.NODE_ENV !== 'production',
})

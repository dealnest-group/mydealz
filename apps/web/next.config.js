// @ts-check
const { withSentryConfig } = require('@sentry/nextjs')

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
  // Sentry source map upload — set SENTRY_AUTH_TOKEN in Vercel env vars
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Disable source map upload in local dev
  disableServerWebpackPlugin: process.env.NODE_ENV !== 'production',
  disableClientWebpackPlugin: process.env.NODE_ENV !== 'production',
})

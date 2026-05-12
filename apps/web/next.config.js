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

module.exports = nextConfig

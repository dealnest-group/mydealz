export const RETAILER_MATCHES = [
  'https://*.amazon.co.uk/*',
  'https://*.argos.co.uk/*',
  'https://*.currys.co.uk/*',
  'https://*.very.co.uk/*',
  'https://*.asos.com/*',
  'https://*.johnlewis.com/*',
  'https://*.next.co.uk/*',
  'https://*.boots.com/*',
  'https://*.ebay.co.uk/*',
  'https://*.tesco.com/*',
  'https://*.asda.com/*',
  'https://*.sainsburys.co.uk/*',
  'https://*.ao.com/*',
  'https://*.scan.co.uk/*',
] as const

export type RetailerMatch = (typeof RETAILER_MATCHES)[number]

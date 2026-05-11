// Shared TypeScript types

export interface Deal {
  id: string
  retailerId: string
  externalId: string
  title: string
  description?: string
  url: string
  affiliateUrl: string
  imageUrl?: string
  priceCurrent: number
  priceWas?: number
  discountPct?: number
  authenticityScore: number
  category?: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  rejectionReason?: string
  embedding?: number[]
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
}

export interface Retailer {
  id: string
  name: string
  slug: string
  affiliateNetwork?: string
  affiliateId?: string
  baseUrl?: string
  feedUrl?: string
  commissionPct?: number
  active: boolean
  createdAt: Date
}

export interface UserProfile {
  id: string
  signalsEnabled: boolean
  embedding?: number[]
  createdAt: Date
  updatedAt: Date
}

export interface UserSignal {
  id: string
  userId?: string
  sessionId: string
  signalType: 'view' | 'cart' | 'purchase' | 'search' | 'dwell'
  retailerSlug?: string
  productTitle?: string
  productCategory?: string
  priceSeen?: number
  dwellSeconds?: number
  processed: boolean
  createdAt: Date
}
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { appRouter, type Context } from '../index'

// ---------------------------------------------------------------------------
// Mock Supabase client
// ---------------------------------------------------------------------------

function makeMockSupabase(overrides: Record<string, unknown> = {}) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    ...overrides,
  }
  return {
    from: vi.fn().mockReturnValue(chain),
    _chain: chain,
  }
}

function makeContext(supabaseOverrides = {}, userId: string | null = null): Context {
  return {
    supabase: makeMockSupabase(supabaseOverrides) as unknown as Context['supabase'],
    userId,
  }
}

const caller = (ctx: Context) => appRouter.createCaller(ctx)

// ---------------------------------------------------------------------------
// deals.list
// ---------------------------------------------------------------------------

describe('deals.list', () => {
  it('returns approved deals with default pagination', async () => {
    const mockDeals = [
      { id: 'uuid-1', title: 'Deal 1', price_current: 10, status: 'approved' },
      { id: 'uuid-2', title: 'Deal 2', price_current: 20, status: 'approved' },
    ]
    const ctx = makeContext({ range: vi.fn().mockResolvedValue({ data: mockDeals, error: null }) })
    const result = await caller(ctx).deals.list({})
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('uuid-1')
  })

  it('applies category filter when provided', async () => {
    const ctx = makeContext({ range: vi.fn().mockResolvedValue({ data: [], error: null }) })
    await caller(ctx).deals.list({ category: 'Tech' })
    expect(ctx.supabase.from('deals')._chain.ilike).toHaveBeenCalledWith(
      'category',
      '%Tech%',
    )
  })

  it('applies search filter when provided', async () => {
    const ctx = makeContext({ range: vi.fn().mockResolvedValue({ data: [], error: null }) })
    await caller(ctx).deals.list({ search: 'laptop' })
    expect(ctx.supabase.from('deals')._chain.ilike).toHaveBeenCalledWith(
      'title',
      '%laptop%',
    )
  })

  it('escapes LIKE wildcards in search input', async () => {
    const ctx = makeContext({ range: vi.fn().mockResolvedValue({ data: [], error: null }) })
    // A user search of `100%_off` should not be treated as a LIKE pattern —
    // `%` and `_` get backslash-escaped so they match literally.
    await caller(ctx).deals.list({ search: '100%_off' })
    expect(ctx.supabase.from('deals')._chain.ilike).toHaveBeenCalledWith(
      'title',
      '%100\\%\\_off%',
    )
  })

  it('escapes LIKE wildcards in category input', async () => {
    const ctx = makeContext({ range: vi.fn().mockResolvedValue({ data: [], error: null }) })
    await caller(ctx).deals.list({ category: '50%' })
    expect(ctx.supabase.from('deals')._chain.ilike).toHaveBeenCalledWith(
      'category',
      '%50\\%%',
    )
  })

  it('escapes backslashes in input', async () => {
    const ctx = makeContext({ range: vi.fn().mockResolvedValue({ data: [], error: null }) })
    await caller(ctx).deals.list({ search: 'a\\b' })
    expect(ctx.supabase.from('deals')._chain.ilike).toHaveBeenCalledWith(
      'title',
      '%a\\\\b%',
    )
  })

  it('returns empty array when no deals found', async () => {
    const ctx = makeContext({ range: vi.fn().mockResolvedValue({ data: null, error: null }) })
    const result = await caller(ctx).deals.list({})
    expect(result).toEqual([])
  })

  it('throws INTERNAL_SERVER_ERROR on DB error', async () => {
    const ctx = makeContext({
      range: vi.fn().mockResolvedValue({ data: null, error: { message: 'connection failed' } }),
    })
    await expect(caller(ctx).deals.list({})).rejects.toMatchObject({ code: 'INTERNAL_SERVER_ERROR' })
  })

  it('rejects limit > 100', async () => {
    const ctx = makeContext()
    await expect(caller(ctx).deals.list({ limit: 101 })).rejects.toThrow()
  })
})

// ---------------------------------------------------------------------------
// deals.getById
// ---------------------------------------------------------------------------

describe('deals.getById', () => {
  const validId = '00000000-0000-0000-0000-000000000001'

  it('returns a deal for a valid ID', async () => {
    const mockDeal = { id: validId, title: 'Test Deal', status: 'approved' }
    const ctx = makeContext({ single: vi.fn().mockResolvedValue({ data: mockDeal, error: null }) })
    const result = await caller(ctx).deals.getById({ id: validId })
    expect(result.id).toBe(validId)
  })

  it('throws NOT_FOUND when deal does not exist', async () => {
    const ctx = makeContext({ single: vi.fn().mockResolvedValue({ data: null, error: null }) })
    await expect(caller(ctx).deals.getById({ id: validId })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    })
  })

  it('throws NOT_FOUND on DB error', async () => {
    const ctx = makeContext({
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
    })
    await expect(caller(ctx).deals.getById({ id: validId })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    })
  })

  it('rejects a non-UUID id', async () => {
    const ctx = makeContext()
    await expect(caller(ctx).deals.getById({ id: 'not-a-uuid' })).rejects.toThrow()
  })
})

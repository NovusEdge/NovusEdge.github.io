import { describe, expect, it } from 'vitest'
import { isMeaningSlug, voiceMeta, MEANING_POSTS } from './meaning-data'

describe('isMeaningSlug', () => {
  it('matches the series prefix only', () => {
    expect(isMeaningSlug('in-search-of-meaning-01')).toBe(true)
    expect(isMeaningSlug('in-search-of-meaning-12')).toBe(true)
    expect(isMeaningSlug('plan-a-ai')).toBe(false)
    expect(isMeaningSlug('in-search-of-meaning')).toBe(false)
  })
})

describe('voiceMeta', () => {
  it('ramps agitation up and drops it on the last line when the post gives none', () => {
    const ramp = Array.from({ length: 8 }, (_, i) => voiceMeta('in-search-of-meaning-99', i, 8).agit)
    expect(ramp[0]).toBeCloseTo(0.2)
    expect(ramp[5]).toBeGreaterThan(ramp[1])
    expect(Math.max(...ramp)).toBeLessThanOrEqual(1)
    expect(ramp[7]).toBeCloseTo(0.12)
  })

  it('gives a single line a middling agitation', () => {
    expect(voiceMeta('in-search-of-meaning-99', 0, 1).agit).toBe(0.5)
  })

  it('prefers the post data and falls back per field', () => {
    MEANING_POSTS['in-search-of-meaning-test'] = { hero: { text: 'x' }, voices: [{ agit: 0.9, audio: '/a.mp3' }, { audio: '/b.mp3' }] }
    expect(voiceMeta('in-search-of-meaning-test', 0, 3)).toEqual({ agit: 0.9, audio: '/a.mp3' })
    expect(voiceMeta('in-search-of-meaning-test', 1, 3).audio).toBe('/b.mp3')
    expect(voiceMeta('in-search-of-meaning-test', 1, 3).agit).toBeGreaterThan(0)
    expect(voiceMeta('in-search-of-meaning-test', 2, 3).audio).toBeUndefined()
    delete MEANING_POSTS['in-search-of-meaning-test']
  })
})

import { describe, it, expect } from 'vitest'
import { LOCALES, DEFAULT_LOCALE } from './paths'
import { prefixWith } from './use-locale-path'

const zh = LOCALES.find((l) => l.code === 'zh')!

describe('prefixWith', () => {
  it('leaves paths bare for the default locale', () => {
    expect(prefixWith('/blog', DEFAULT_LOCALE)).toBe('/blog')
    expect(prefixWith('/', DEFAULT_LOCALE)).toBe('/')
  })
  it('prefixes for a non-default locale', () => {
    expect(prefixWith('/blog', zh)).toBe('/zh/blog')
    expect(prefixWith('/', zh)).toBe('/zh')
  })
  it('is idempotent on an already prefixed path', () => {
    expect(prefixWith('/zh/blog', zh)).toBe('/zh/blog')
  })
})

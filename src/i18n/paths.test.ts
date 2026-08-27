import { describe, it, expect } from 'vitest'
import {
  LOCALES,
  DEFAULT_LOCALE,
  PREFIXED_LOCALES,
  localeFromPath,
  stripLocale,
  localePath,
} from './paths'

const de = LOCALES.find((l) => l.code === 'de')!
const zh = LOCALES.find((l) => l.code === 'zh')!

describe('manifest', () => {
  it('has exactly one default', () => {
    expect(LOCALES.filter((l) => l.default)).toHaveLength(1)
    expect(DEFAULT_LOCALE.code).toBe('en')
  })
  it('has unique codes and prefixes', () => {
    expect(new Set(LOCALES.map((l) => l.code)).size).toBe(LOCALES.length)
    expect(new Set(LOCALES.map((l) => l.prefix)).size).toBe(LOCALES.length)
  })
  it('excludes the default from the prefixed list', () => {
    expect(PREFIXED_LOCALES.map((l) => l.code)).toEqual(['fi', 'de', 'ja', 'zh'])
  })
})

describe('localeFromPath', () => {
  it('reads a prefixed locale', () => {
    expect(localeFromPath('/de/about').code).toBe('de')
    expect(localeFromPath('/zh').code).toBe('zh')
  })
  it('falls back to the default for bare paths', () => {
    expect(localeFromPath('/about').code).toBe('en')
    expect(localeFromPath('/').code).toBe('en')
  })
  it('does not treat a normal route as a locale', () => {
    expect(localeFromPath('/blog/hello-world').code).toBe('en')
    expect(localeFromPath('/stack/graph').code).toBe('en')
  })
})

describe('stripLocale', () => {
  it('removes a locale prefix', () => {
    expect(stripLocale('/de/about')).toBe('/about')
    expect(stripLocale('/zh/blog/hello-world')).toBe('/blog/hello-world')
  })
  it('maps a bare locale root to /', () => {
    expect(stripLocale('/de')).toBe('/')
  })
  it('leaves an English path alone', () => {
    expect(stripLocale('/about')).toBe('/about')
    expect(stripLocale('/')).toBe('/')
  })
})

describe('localePath', () => {
  it('adds a prefix', () => {
    expect(localePath('/about', de)).toBe('/de/about')
    expect(localePath('/', zh)).toBe('/zh')
  })
  it('swaps one prefix for another', () => {
    expect(localePath('/de/about', zh)).toBe('/zh/about')
  })
  it('strips back to bare for the default locale', () => {
    expect(localePath('/de/about', DEFAULT_LOCALE)).toBe('/about')
    expect(localePath('/de', DEFAULT_LOCALE)).toBe('/')
  })
})

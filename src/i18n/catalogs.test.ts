import { describe, it, expect } from 'vitest'
import { LOCALES } from './paths'
import { catalogs, i18nFor } from './index'

const PLACEHOLDER = /\{\{(\w+)\}\}/g
const tokens = (s: string) => new Set(Array.from(s.matchAll(PLACEHOLDER), (m) => m[1]))

describe('catalogs', () => {
  it('has a catalog for every locale in the manifest', () => {
    for (const l of LOCALES) expect(catalogs[l.code]).toBeDefined()
  })

  it('never carries a key English does not have', () => {
    const english = new Set(Object.keys(catalogs.en))
    for (const l of LOCALES) {
      const orphans = Object.keys(catalogs[l.code]).filter((k) => !english.has(k))
      expect(orphans, `orphan keys in ${l.code}.json`).toEqual([])
    }
  })

  it('keeps the same interpolation tokens as the English source', () => {
    for (const l of LOCALES) {
      for (const [key, value] of Object.entries(catalogs[l.code])) {
        expect(tokens(value), `${l.code}.json ${key}`).toEqual(tokens(catalogs.en[key]))
      }
    }
  })
})

describe('i18nFor', () => {
  it('resolves synchronously with the catalog already loaded', () => {
    expect(i18nFor('ja').t('nav.blog')).toBe('ブログ')
  })

  it('falls back to English for a missing key', () => {
    expect(i18nFor('de').t('nav.blog')).toBe('Blog')
  })
})

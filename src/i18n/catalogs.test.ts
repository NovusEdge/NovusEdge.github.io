import { describe, it, expect } from 'vitest'
import i18next from 'i18next'
import { LOCALES } from './paths'
import { catalogs, i18nFor } from './index'

const PLACEHOLDER = /\{\{(\w+)\}\}/g
const tokens = (s: string) => new Set(Array.from(s.matchAll(PLACEHOLDER), (m) => m[1]))

describe('catalogs', () => {
  it('has a catalog for every locale in the manifest', () => {
    for (const l of LOCALES) expect(catalogs[l.code]).toBeDefined()
  })

  it('carries exactly the English key set', () => {
    const english = Object.keys(catalogs.en).sort()
    for (const l of LOCALES) {
      expect(Object.keys(catalogs[l.code]).sort(), `${l.code}.json`).toEqual(english)
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
    expect(i18nFor('de').t('__missing__')).toBe('__missing__')
  })

  it('falls back to English for a key missing from a locale', () => {
    const probe = i18next.createInstance()
    probe.init({
      lng: 'de',
      fallbackLng: 'en',
      resources: {
        de: { translation: {} },
        en: { translation: { 'probe.key': 'English value' } },
      },
      initAsync: false,
      react: { useSuspense: false },
    })
    expect(probe.t('probe.key')).toBe('English value')
  })
})

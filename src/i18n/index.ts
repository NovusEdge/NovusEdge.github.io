import i18next, { type i18n } from 'i18next'
import { LOCALES } from './paths'
import en from './locales/en.json'
import fi from './locales/fi.json'
import de from './locales/de.json'
import ja from './locales/ja.json'
import zh from './locales/zh.json'

export const catalogs: Record<string, Record<string, string>> = { en, fi, de, ja, zh }

// i18next 26 renamed initImmediate to initAsync (default true); initAsync: false is the
// current spelling of the same contract, plus inline resources makes init() finish before it
// returns, so the first render already has strings. Any async path here flashes English through hydration.
const instances = new Map<string, i18n>()
for (const locale of LOCALES) {
  const instance = i18next.createInstance()
  instance.init({
    lng: locale.code,
    fallbackLng: 'en',
    resources: {
      [locale.code]: { translation: catalogs[locale.code] },
      en: { translation: catalogs.en },
    },
    interpolation: { escapeValue: false },
    initAsync: false,
    react: { useSuspense: false },
  })
  instances.set(locale.code, instance)
}

export const i18nFor = (code: string): i18n => instances.get(code) ?? instances.get('en')!

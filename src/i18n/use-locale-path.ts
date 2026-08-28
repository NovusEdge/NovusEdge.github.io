import { useCallback } from 'react'
import { localePath, type Locale } from './paths'
import { useLocale } from './context'

export const prefixWith = (path: string, locale: Locale) => localePath(path, locale)

export function useLocalePath() {
  const locale = useLocale()
  return useCallback((path: string) => prefixWith(path, locale), [locale])
}

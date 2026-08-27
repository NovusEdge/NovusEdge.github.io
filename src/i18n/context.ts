import { createContext, use } from 'react'
import { DEFAULT_LOCALE, type Locale } from './paths'

export const LocaleContext = createContext<Locale>(DEFAULT_LOCALE)
export const useLocale = () => use(LocaleContext)

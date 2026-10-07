import manifest from './locales.json'

export type Locale = {
  code: string
  prefix: string
  htmlLang: string
  label: string
  default: boolean
}

export const LOCALES = manifest as Locale[]
export const DEFAULT_LOCALE = LOCALES.find((l) => l.default)!
export const PREFIXED_LOCALES = LOCALES.filter((l) => !l.default)

export function localeFromPath(pathname: string): Locale {
  const first = pathname.split('/')[1]
  return PREFIXED_LOCALES.find((l) => l.code === first) ?? DEFAULT_LOCALE
}

export function stripLocale(pathname: string): string {
  const locale = localeFromPath(pathname)
  if (locale.default) return pathname
  const rest = pathname.slice(locale.prefix.length)
  return rest === '' ? '/' : rest
}

// GitHub Pages serves each route as <route>/index.html and 301s /about to /about/,
// so a link without the slash shows up in Search Console as "Page with redirect".
// Files (/feed.xml, images) keep their exact path.
export function withSlash(href: string): string {
  const [, path, rest] = /^([^?#]*)(.*)$/.exec(href)!
  if (!path.startsWith('/') || path.endsWith('/') || /\.[a-z0-9]+$/i.test(path)) return href
  return `${path}/${rest}`
}

export function localePath(pathname: string, locale: Locale): string {
  const bare = stripLocale(pathname)
  if (locale.default) return withSlash(bare)
  return withSlash(bare === '/' ? locale.prefix : `${locale.prefix}${bare}`)
}

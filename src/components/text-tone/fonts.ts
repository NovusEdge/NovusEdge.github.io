const CJK = '妈麻马骂石室诗士施氏嗜狮誓食十，'

// Only what this page sets beyond the global request in index.html (Spectral 400/600/italic 400,
// Plex Mono upright). Spectral's latin-ext subset carries the pinyin tone marks.
export const FONT_LINKS = [
  'https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Spectral:ital,wght@0,700;1,500&family=IBM+Plex+Mono:ital,wght@1,500&display=swap',
  `https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@500&text=${encodeURIComponent(CJK)}&display=swap`,
  'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@500&display=swap',
]
export const fontLinkId = (i: number) => `tt-font-${i}`

let links: Promise<void> | null = null

// Prerendered pages already carry these links in <head> (main.tsx); client navigation adds them here.
export function ensureFontLinks(): Promise<void> {
  links ??= Promise.all(
    FONT_LINKS.map((href, i) => {
      let el = document.getElementById(fontLinkId(i)) as HTMLLinkElement | null
      if (!el) {
        el = document.createElement('link')
        el.id = fontLinkId(i)
        el.rel = 'stylesheet'
        el.href = href
        document.head.appendChild(el)
      }
      if (el.sheet) return
      const link = el
      return new Promise<void>((done) => {
        link.addEventListener('load', () => done(), { once: true })
        link.addEventListener('error', () => done(), { once: true })
      })
    }),
  ).then(() => {})
  return links
}

// document.fonts.ready resolves at once while a stylesheet is still in flight, and fonts.load() finds
// no face before its stylesheet arrives, so this waits for the links first. False on timeout or failure.
export function whenFonts(faces: [font: string, text?: string][], ms = 3000): Promise<boolean> {
  if (typeof document === 'undefined') return Promise.resolve(false)
  const loaded = ensureFontLinks()
    .then(() => Promise.all(faces.map(([font, text]) => document.fonts.load(font, text))))
    .then(
      (sets) => sets.every((s) => s.length > 0),
      () => false,
    )
  return Promise.race([loaded, new Promise<boolean>((done) => setTimeout(() => done(false), ms))])
}

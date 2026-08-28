import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import { TLink } from './page-transition'
import { LOCALES, localePath } from '../i18n/paths'
import { useLocale } from '../i18n/context'

// Each option keeps its own language and its own lang attribute, so a reader who cannot
// read the active locale can still find theirs, and a screen reader switches voice.
export function LocaleSwitcher({ variant = 'header' }: { variant?: 'header' | 'landing' }) {
  const { pathname } = useLocation()
  const active = useLocale()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const landing = variant === 'landing'
  const trigger = landing
    ? 'text-bone/70 hover:text-bone'
    : 'text-charcoal/60 hover:text-gold dark:text-bone/60 dark:hover:text-gold'
  const panel = landing
    ? 'border-bone/20 bg-charcoal/95 text-bone'
    : 'border-charcoal/10 bg-bone/95 text-charcoal dark:border-bone/10 dark:bg-charcoal/95 dark:text-bone'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t('nav.language')}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex cursor-pointer items-center gap-1 font-display text-sm font-semibold uppercase tracking-wider transition-colors ${trigger}`}
      >
        {active.code}
        <span aria-hidden className={`text-[8px] transition-transform ${open ? 'rotate-180' : ''}`}>
          &#9662;
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute right-0 top-full z-50 mt-2 flex min-w-36 flex-col overflow-hidden rounded-xl border shadow-lg backdrop-blur-lg ${panel}`}
        >
          {LOCALES.map((l) => (
            <TLink
              key={l.code}
              role="menuitem"
              to={localePath(pathname, l)}
              hrefLang={l.htmlLang}
              lang={l.htmlLang}
              aria-current={l.code === active.code ? 'true' : undefined}
              className={`flex items-center justify-between gap-4 px-4 py-2 text-sm transition-colors hover:bg-gold/10 ${
                l.code === active.code ? 'text-gold' : ''
              }`}
            >
              {l.label}
              {l.code === active.code && <span aria-hidden>&#10003;</span>}
            </TLink>
          ))}
        </div>
      )}
    </div>
  )
}

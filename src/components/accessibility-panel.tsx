import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Accessibility, X } from 'lucide-react'

type Prefs = {
  fontSize: 'default' | 'large' | 'xlarge'
  contrast: 'default' | 'high'
  motion: 'default' | 'reduced'
  lineHeight: 'default' | 'relaxed' | 'loose'
}

const DEFAULT_PREFS: Prefs = {
  fontSize: 'default',
  contrast: 'default',
  motion: 'default',
  lineHeight: 'default',
}

const STORAGE_KEY = 'a11y-prefs'

function loadPrefs(): Prefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...DEFAULT_PREFS, ...JSON.parse(stored) } : DEFAULT_PREFS
  } catch {
    return DEFAULT_PREFS
  }
}

function savePrefs(prefs: Prefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}

function applyPrefs(prefs: Prefs) {
  const root = document.documentElement
  // font size
  root.classList.remove('a11y-font-large', 'a11y-font-xlarge')
  if (prefs.fontSize !== 'default') root.classList.add(`a11y-font-${prefs.fontSize}`)
  // contrast
  root.classList.toggle('a11y-high-contrast', prefs.contrast === 'high')
  // motion
  root.classList.toggle('a11y-reduced-motion', prefs.motion === 'reduced')
  // line height
  root.classList.remove('a11y-line-relaxed', 'a11y-line-loose')
  if (prefs.lineHeight !== 'default') root.classList.add(`a11y-line-${prefs.lineHeight}`)
}

export function AccessibilityPanel() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)

  useEffect(() => {
    const loaded = loadPrefs()
    setPrefs(loaded)
    applyPrefs(loaded)
  }, [])

  const update = <K extends keyof Prefs>(key: K, value: Prefs[K]) => {
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    savePrefs(next)
    applyPrefs(next)
  }

  const reset = () => {
    setPrefs(DEFAULT_PREFS)
    savePrefs(DEFAULT_PREFS)
    applyPrefs(DEFAULT_PREFS)
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        aria-label={t('a11y.settings')}
        aria-expanded={open}
        className="fixed bottom-6 left-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-charcoal/20 bg-bone shadow-lg transition-transform hover:scale-105 dark:border-bone/20 dark:bg-charcoal"
      >
        <Accessibility className="h-5 w-5 text-charcoal dark:text-bone" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="fixed bottom-20 left-6 z-50 w-72 rounded-lg border border-charcoal/20 bg-bone p-4 shadow-xl dark:border-bone/20 dark:bg-charcoal">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">{t('a11y.title')}</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label={t('a11y.close')}
                className="text-charcoal/60 hover:text-charcoal dark:text-bone/60 dark:hover:text-bone"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-charcoal/70 dark:text-bone/70">{t('a11y.fontSize')}</legend>
                <div className="flex gap-2">
                  {(['default', 'large', 'xlarge'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => update('fontSize', v)}
                      className={`flex-1 rounded border px-2 py-1.5 text-xs transition-colors ${
                        prefs.fontSize === v
                          ? 'border-gold bg-gold/20 text-charcoal dark:text-bone'
                          : 'border-charcoal/20 hover:border-gold/50 dark:border-bone/20'
                      }`}
                    >
                      {v === 'default' ? 'A' : v === 'large' ? 'A+' : 'A++'}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-sm font-medium text-charcoal/70 dark:text-bone/70">{t('a11y.lineSpacing')}</legend>
                <div className="flex gap-2">
                  {(['default', 'relaxed', 'loose'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => update('lineHeight', v)}
                      className={`flex-1 rounded border px-2 py-1.5 text-xs transition-colors ${
                        prefs.lineHeight === v
                          ? 'border-gold bg-gold/20 text-charcoal dark:text-bone'
                          : 'border-charcoal/20 hover:border-gold/50 dark:border-bone/20'
                      }`}
                    >
                      {v === 'default' ? t('a11y.normal') : v === 'relaxed' ? t('a11y.relaxed') : t('a11y.loose')}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-sm font-medium text-charcoal/70 dark:text-bone/70">{t('a11y.contrast')}</legend>
                <div className="flex gap-2">
                  {(['default', 'high'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => update('contrast', v)}
                      className={`flex-1 rounded border px-2 py-1.5 text-xs transition-colors ${
                        prefs.contrast === v
                          ? 'border-gold bg-gold/20 text-charcoal dark:text-bone'
                          : 'border-charcoal/20 hover:border-gold/50 dark:border-bone/20'
                      }`}
                    >
                      {v === 'default' ? t('a11y.default') : t('a11y.high')}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-sm font-medium text-charcoal/70 dark:text-bone/70">{t('a11y.motion')}</legend>
                <div className="flex gap-2">
                  {(['default', 'reduced'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => update('motion', v)}
                      className={`flex-1 rounded border px-2 py-1.5 text-xs transition-colors ${
                        prefs.motion === v
                          ? 'border-gold bg-gold/20 text-charcoal dark:text-bone'
                          : 'border-charcoal/20 hover:border-gold/50 dark:border-bone/20'
                      }`}
                    >
                      {v === 'default' ? t('a11y.default') : t('a11y.reduced')}
                    </button>
                  ))}
                </div>
              </fieldset>

              <button
                onClick={reset}
                className="w-full rounded border border-charcoal/20 px-3 py-1.5 text-xs text-charcoal/70 transition-colors hover:border-charcoal/40 dark:border-bone/20 dark:text-bone/70 dark:hover:border-bone/40"
              >
                {t('a11y.resetToDefaults')}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

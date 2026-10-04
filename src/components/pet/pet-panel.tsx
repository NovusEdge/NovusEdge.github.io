import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PawPrint, X } from 'lucide-react'
import { closePetPanel, openPetPanel, usePetPanelOpen } from '../../lib/pet/panel-store'
import { usePetPrefs } from '../../lib/pet/prefs-store'

export function PetPanel() {
  const { t } = useTranslation()
  const open = usePetPanelOpen()
  const [prefs, setPrefs] = usePetPrefs()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closePetPanel()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  if (!mounted) return null
  return (
    <>
      {/* with the friends off there is no desk to click, so a paw stands in for it */}
      {!prefs.on && (
        <button
          type="button"
          aria-label={t('pet.settings')}
          aria-expanded={open}
          data-pet-paw
          onClick={() => (open ? closePetPanel() : openPetPanel())}
          className="fixed bottom-6 left-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-charcoal/20 bg-bone shadow-lg transition-transform hover:scale-105 dark:border-bone/20 dark:bg-charcoal"
        >
          <PawPrint className="h-5 w-5 text-charcoal dark:text-bone" />
        </button>
      )}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={closePetPanel} />
          <div
            role="dialog"
            aria-label={t('pet.title')}
            className="fixed bottom-32 left-4 z-50 w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-charcoal/20 bg-bone p-4 shadow-xl dark:border-bone/20 dark:bg-charcoal"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-sm font-semibold uppercase tracking-wider">{t('pet.title')}</h2>
              <button type="button" autoFocus aria-label={t('pet.close')} onClick={closePetPanel} className="text-charcoal/60 hover:text-charcoal dark:text-bone/60 dark:hover:text-bone">
                <X className="h-4 w-4" />
              </button>
            </div>
            <fieldset className="mt-3">
              <legend className="mb-1.5 font-mono text-xs uppercase tracking-wider text-charcoal/60 dark:text-bone/60">{t('pet.friends')}</legend>
              <div className="flex gap-1.5">
                {([true, false] as const).map((on) => (
                  <button
                    key={String(on)}
                    type="button"
                    aria-pressed={prefs.on === on}
                    onClick={() => setPrefs({ on })}
                    className="rounded border border-charcoal/20 px-2.5 py-1 text-sm aria-pressed:border-gold aria-pressed:bg-gold/15 dark:border-bone/20"
                  >
                    {t(on ? 'pet.on' : 'pet.off')}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        </>
      )}
    </>
  )
}

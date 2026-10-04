import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PawPrint, X } from 'lucide-react'
import { usePetPrefs } from '../../lib/pet/prefs-store'

function Choice<T extends string>({ label, value, options, text, onPick }: { label: string; value: T; options: readonly T[]; text: (v: T) => string; onPick: (v: T) => void }) {
  return (
    <fieldset className="mt-3">
      <legend className="mb-1.5 font-mono text-xs uppercase tracking-wider text-charcoal/60 dark:text-bone/60">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onPick(o)}
            className="rounded border border-charcoal/20 px-2.5 py-1 text-sm aria-pressed:border-gold aria-pressed:bg-gold/15 dark:border-bone/20"
          >
            {text(o)}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export function PetPanel() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [prefs, setPrefs] = usePetPrefs()
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      toggleRef.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        aria-label={t('pet.settings')}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 left-20 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-charcoal/20 bg-bone shadow-lg transition-transform hover:scale-105 dark:border-bone/20 dark:bg-charcoal"
      >
        <PawPrint className="h-5 w-5 text-charcoal dark:text-bone" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div role="dialog" aria-label={t('pet.title')} className="fixed bottom-20 left-20 z-50 w-72 rounded-lg border border-charcoal/20 bg-bone p-4 shadow-xl dark:border-bone/20 dark:bg-charcoal">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-sm font-semibold uppercase tracking-wider">{t('pet.title')}</h2>
              <button
                type="button"
                autoFocus
                aria-label={t('pet.close')}
                onClick={() => setOpen(false)}
                className="text-charcoal/60 hover:text-charcoal dark:text-bone/60 dark:hover:text-bone"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Choice label={t('pet.cat')} value={prefs.on ? 'on' : 'off'} options={['on', 'off'] as const} text={(v) => t(`pet.${v}`)} onPick={(v) => setPrefs({ on: v === 'on' })} />
          </div>
        </>
      )}
    </>
  )
}

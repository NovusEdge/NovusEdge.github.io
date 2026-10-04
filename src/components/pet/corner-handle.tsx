import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { Side } from '../../lib/pet/corners'
import { usePetPanelOpen } from '../../lib/pet/panel-store'

export const CORNER_INSET = 16

type Props = { side: Side; width: number; height: number; hitTop: number; onOpen: () => void; children: ReactNode }

// The one focusable handle that opens the pet panel from a bottom corner. Only
// the painted rows below hitTop take clicks; the rest of the box belongs to the page.
export function CornerHandle({ side, width, height, hitTop, onOpen, children }: Props) {
  const { t } = useTranslation()
  const open = usePetPanelOpen()
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={t('pet.settings')}
      aria-haspopup="dialog"
      aria-expanded={open}
      className="group pointer-events-none fixed bottom-0 z-30 block leading-none focus-visible:outline-2 focus-visible:outline-gold"
      style={{ [side]: CORNER_INSET, width, height }}
    >
      {children}
      <span className="absolute left-0 cursor-pointer" style={{ top: hitTop, width, height: height - hitTop, pointerEvents: 'auto' }} />
      <span
        className={`pointer-events-none absolute bottom-full ${side === 'left' ? 'left-2' : 'right-2'} mb-1 whitespace-nowrap rounded border border-charcoal/20 bg-bone px-2 py-0.5 font-mono text-xs opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 dark:border-bone/20 dark:bg-charcoal`}
      >
        {t('pet.settings')}
      </span>
    </button>
  )
}

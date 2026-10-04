import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePetPanelOpen } from '../../lib/pet/panel-store'
import { clipSize, resolveClip, type Sprite } from '../../lib/pet/sprite'
import { DESK_LEFT, hitTop } from './desk-corner'
import { PixelSprite } from './pixel-sprite'

export const BEAT_CHANCE = 0.2

type Props = { me: Sprite; loop: string; beat: string; scale: number; reduced: boolean; onOpen: () => void }

export function PersonaCorner({ me, loop, beat, scale, reduced, onOpen }: Props) {
  const { t } = useTranslation()
  const open = usePetPanelOpen()
  const [clip, setClip] = useState(loop)
  useEffect(() => setClip(loop), [loop])
  const shown = resolveClip(me, clip)
  const base = resolveClip(me, loop)
  const { w, h } = clipSize(me, base.clip)
  const top = hitTop(me, base.name, h)
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={t('pet.settings')}
      aria-haspopup="dialog"
      aria-expanded={open}
      className="group pointer-events-none fixed bottom-0 z-30 block leading-none focus-visible:outline-2 focus-visible:outline-gold"
      style={{ left: DESK_LEFT, width: w * scale, height: h * scale }}
    >
      <span aria-hidden="true" className="pointer-events-none relative block" style={{ width: w * scale, height: h * scale }}>
        <PixelSprite
          sprite={me}
          clip={shown.name}
          scale={scale}
          playing={!reduced}
          frame={reduced ? 0 : undefined}
          onStep={(_, f) => {
            // beats start and end on the loop's frame 0, so they can only cut in there
            if (clip === loop && f === base.clip.frames[0] && Math.random() < BEAT_CHANCE) setClip(beat)
          }}
          onEnd={() => setClip(loop)}
        />
      </span>
      <span className="absolute left-0 cursor-pointer" style={{ top: top * scale, width: w * scale, height: (h - top) * scale, pointerEvents: 'auto' }} />
      <span className="pointer-events-none absolute bottom-full left-2 mb-1 whitespace-nowrap rounded border border-charcoal/20 bg-bone px-2 py-0.5 font-mono text-xs opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 dark:border-bone/20 dark:bg-charcoal">
        {t('pet.settings')}
      </span>
    </button>
  )
}

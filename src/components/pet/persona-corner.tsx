import { useEffect, useState } from 'react'
import { clipSize, resolveClip, type Sprite } from '../../lib/pet/sprite'
import { CornerHandle } from './corner-handle'
import { hitTop } from './desk-corner'
import { PixelSprite } from './pixel-sprite'

export const BEAT_CHANCE = 0.2

type Props = { me: Sprite; loop: string; beat: string; scale: number; reduced: boolean; onOpen: () => void }

export function PersonaCorner({ me, loop, beat, scale, reduced, onOpen }: Props) {
  const [clip, setClip] = useState(loop)
  useEffect(() => setClip(loop), [loop])
  const shown = resolveClip(me, clip)
  const base = resolveClip(me, loop)
  const { w, h } = clipSize(me, base.clip)
  const top = hitTop(me, base.name, h)
  return (
    <CornerHandle side="left" width={w * scale} height={h * scale} hitTop={top * scale} onOpen={onOpen}>
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
    </CornerHandle>
  )
}

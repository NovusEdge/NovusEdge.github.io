import { clipFor, type PetEvent, type PetState } from '../../lib/pet/pet-brain'
import type { Sprite } from '../../lib/pet/sprite'
import { PixelSprite } from './pixel-sprite'

type Send = (e: DistributiveOmit<PetEvent, 'now'>) => void
type DistributiveOmit<T, K extends string> = T extends unknown ? Omit<T, K> : never

export function StoatRoamer({ sprite, state, send, coat, scale }: { sprite: Sprite; state: PetState; send: Send; coat: string; scale: number }) {
  const clip = clipFor(state.mode)
  const travel = sprite.animations[clip]?.travel ?? 1
  return (
    <div
      style={{ position: 'fixed', left: state.x * scale, bottom: 0, zIndex: 30, lineHeight: 0, pointerEvents: 'auto' }}
      onPointerEnter={() => send({ type: 'hover' })}
      onClick={() => send({ type: 'click', roll: Math.random() })}
    >
      <PixelSprite
        sprite={sprite}
        clip={clip}
        variant={coat}
        scale={scale}
        // every stoat clip faces right
        flip={state.dir === -1}
        playing={state.mode !== 'parked'}
        onStep={(n) => state.target !== null && send({ type: 'step', px: n * travel })}
        onEnd={() => send({ type: 'end' })}
      />
    </div>
  )
}

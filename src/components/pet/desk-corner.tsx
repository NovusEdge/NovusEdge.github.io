import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { prefersReducedMotion } from '../../lib/motion'
import { meClips, type MeEvent, type MeState } from '../../lib/pet/me-brain'
import { edgeGlow, NET, pulseLevel } from '../../lib/pet/neural-net'
import type { Sprite } from '../../lib/pet/sprite'
import { subscribe } from '../../lib/pet/ticker'
import { PixelSprite } from './pixel-sprite'

export const DESK_LEFT = 16
// the net floats in the clear rows above the laptop
const NET_X = 40
const NET_Y = 0

function NetCanvas({ scale, typing }: { scale: number; typing: { current: boolean } }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!
    c.width = 24 * scale
    c.height = 12 * scale
    const ctx = c.getContext('2d')!
    let level = 0
    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height)
      NET.edges.forEach(([a, b], i) => {
        const g = edgeGlow(level, i, t)
        ctx.strokeStyle = `rgba(125, 196, 228, ${0.15 + 0.7 * g})`
        ctx.lineWidth = scale / 2
        ctx.beginPath()
        ctx.moveTo((NET.nodes[a].x + 0.5) * scale, (NET.nodes[a].y + 0.5) * scale)
        ctx.lineTo((NET.nodes[b].x + 0.5) * scale, (NET.nodes[b].y + 0.5) * scale)
        ctx.stroke()
      })
      ctx.fillStyle = `rgba(242, 201, 76, ${0.4 + 0.6 * level})`
      for (const n of NET.nodes) ctx.fillRect(n.x * scale, n.y * scale, scale, scale)
    }
    if (prefersReducedMotion()) {
      draw()
      return
    }
    return subscribe((dt) => {
      t += dt
      level = pulseLevel(level, typing.current, dt)
      draw()
    })
  }, [scale, typing])
  return <canvas ref={ref} aria-hidden="true" style={{ position: 'absolute', left: NET_X * scale, top: NET_Y * scale, width: 24 * scale, height: 12 * scale }} />
}

type Props = {
  me: Sprite
  stoat: Sprite
  scale: number
  state: MeState
  send: (e: MeEvent) => void
  reduced: boolean
  napping: boolean
  coat: string
  onOpen: () => void
}

export function DeskCorner({ me, stoat, scale, state, send, reduced, napping, coat, onOpen }: Props) {
  const { t } = useTranslation()
  const typing = useRef(false)
  const desk = me.animations.desk
  const [SX, SY, , SH] = desk.catSlot!
  const DW = desk.w!
  const DH = desk.h!
  const clips = meClips(state.mode)
  const standTop = me.animations.stand_up?.standAt?.[1] ?? DH - me.h
  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        aria-label={t('pet.settings')}
        className="group fixed bottom-0 z-30 block leading-none focus-visible:outline-2 focus-visible:outline-gold"
        style={{ left: DESK_LEFT, width: DW * scale, height: DH * scale }}
      >
        <span aria-hidden="true" className="relative block" style={{ width: DW * scale, height: DH * scale }}>
          <PixelSprite
            sprite={me}
            clip={clips.desk}
            scale={scale}
            playing={!reduced}
            frame={reduced ? 0 : undefined}
            onStep={(_, f) => {
              typing.current = !!f.typing
            }}
            onEnd={() => send({ type: 'end', now: performance.now(), roll: Math.random() })}
          />
          <NetCanvas scale={scale} typing={typing} />
          {napping && (
            <PixelSprite sprite={stoat} clip="sleep" variant={coat} scale={scale} playing={!reduced} style={{ position: 'absolute', left: SX * scale, top: (SY + SH - stoat.h) * scale }} />
          )}
        </span>
        <span className="pointer-events-none absolute bottom-full left-2 mb-1 whitespace-nowrap rounded border border-charcoal/20 bg-bone px-2 py-0.5 font-mono text-xs opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 dark:border-bone/20 dark:bg-charcoal">
          {t('pet.settings')}
        </span>
      </button>
      {clips.walker && (
        <div style={{ position: 'fixed', left: DESK_LEFT + state.x * scale, bottom: (DH - standTop - me.h) * scale, zIndex: 30, lineHeight: 0, pointerEvents: 'none' }}>
          <PixelSprite
            sprite={me}
            clip="walk"
            scale={scale}
            // me's walk faces right
            flip={state.dir === -1}
            onStep={(n) => send({ type: 'step', px: n * (me.animations.walk.travel ?? 1) })}
          />
        </div>
      )}
    </>
  )
}

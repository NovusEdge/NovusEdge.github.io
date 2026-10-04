import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import cat from '../../assets/sprites/cat.json'
import me from '../../assets/sprites/me.json'
import { prefersReducedMotion } from '../../lib/motion'
import { edgeGlow, NET, pulseLevel } from '../../lib/pet/neural-net'
import { usePetPrefs } from '../../lib/pet/prefs-store'
import type { Sprite } from '../../lib/pet/sprite'
import { useStageClaim } from '../../lib/pet/stage'
import { subscribe } from '../../lib/pet/ticker'
import { PixelSprite } from './pixel-sprite'

// me.json's catSlot infers as number[], so a direct cast to Sprite fails tsc
const ME = me as unknown as Sprite
const CAT = cat as unknown as Sprite
const DESK = ME.animations.desk
const DW = DESK.w!
const DH = DESK.h!
// the cat is left-aligned in the slot and stands on its floor, so the width is unused
const [SX, SY, , SH] = DESK.catSlot!
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

export function DeskScene({ scale = 3 }: { scale?: number }) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)
  const typing = useRef(false)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [prefs] = usePetPrefs()
  useEffect(() => setMounted(true), [])
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const reduced = mounted && prefersReducedMotion()
  const catHere = mounted && prefs.on
  useStageClaim(catHere && visible)

  return (
    <div ref={ref} role="img" aria-label={t('about.desk.alt')} style={{ position: 'relative', width: DW * scale, height: DH * scale }}>
      {mounted && (
        <>
          <PixelSprite
            sprite={ME}
            clip="desk"
            scale={scale}
            playing={!reduced}
            frame={reduced ? 0 : undefined}
            onStep={(_, f) => {
              typing.current = !!f.typing
            }}
          />
          <NetCanvas scale={scale} typing={typing} />
          {catHere && (
            <PixelSprite
              sprite={CAT}
              clip="sleep"
              variant={undefined}
              scale={scale}
              playing={!reduced}
              style={{ position: 'absolute', left: SX * scale, top: (SY + SH - CAT.h) * scale }}
            />
          )}
        </>
      )}
    </div>
  )
}

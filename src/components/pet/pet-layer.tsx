import { useEffect, useReducer, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import cat from '../../assets/sprites/cat.json'
import { catReducer, clipFor, initCat, lookPose, type CatEvent } from '../../lib/pet/cat-brain'
import { usePetPrefs } from '../../lib/pet/prefs-store'
import type { Sprite } from '../../lib/pet/sprite'
import { useStageClaimed } from '../../lib/pet/stage'
import { prefersReducedMotion } from '../../lib/motion'
import { PixelSprite } from './pixel-sprite'

export const SCALE = 2
const SCROLL_SETTLE = 600
const SCROLL_GO_EVERY = 8000
const SPRITE = cat as Sprite
const W = SPRITE.w

type BusEvent = { type: 'stoat'; dir: 1 | -1 }
const busSubs = new Set<(e: BusEvent) => void>()
export const catBus = {
  emit: (e: BusEvent) => busSubs.forEach((fn) => fn(e)),
  on: (fn: (e: BusEvent) => void) => {
    busSubs.add(fn)
    return () => {
      busSubs.delete(fn)
    }
  },
}

// plain Omit collapses a union to its shared keys
type DistributiveOmit<T, K extends string> = T extends unknown ? Omit<T, K> : never

const roomWidth = () => Math.max(0, Math.floor(window.innerWidth / SCALE) - W)

function Cat({ coat }: { coat: string }) {
  const [state, dispatch] = useReducer(catReducer, null, () =>
    initCat(performance.now(), roomWidth() - 8, prefersReducedMotion()),
  )
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null)
  const { pathname } = useLocation()
  const first = useRef(true)
  const send = (e: DistributiveOmit<CatEvent, 'now'>) => dispatch({ now: performance.now(), ...e } as CatEvent)

  useEffect(() => {
    const id = setInterval(() => send({ type: 'tick', width: roomWidth(), roll: Math.random() }), 1000)
    const input = () => send({ type: 'input' })
    const move = (e: PointerEvent) => {
      setPointer({ x: e.clientX, y: e.clientY })
      input()
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('keydown', input)
    let settle: ReturnType<typeof setTimeout> | undefined
    let lastGo = -Infinity
    const scroll = () => {
      input()
      clearTimeout(settle)
      settle = setTimeout(() => {
        const now = performance.now()
        if (now - lastGo < SCROLL_GO_EVERY) return
        lastGo = now
        send({ type: 'go', target: Math.floor(Math.random() * roomWidth()) })
      }, SCROLL_SETTLE)
    }
    window.addEventListener('scroll', scroll, { passive: true })
    const off = catBus.on((e) => send({ type: 'stoat', dir: e.dir, roll: Math.random() }))
    return () => {
      clearInterval(id)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('keydown', input)
      window.removeEventListener('scroll', scroll)
      clearTimeout(settle)
      off()
    }
  }, [])

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    send({ type: 'go', target: Math.floor(Math.random() * roomWidth()) })
  }, [pathname])

  const left = state.x * SCALE
  const top = window.innerHeight - SPRITE.h * SCALE
  const pose = state.mode === 'idle' ? lookPose({ x: left + (W * SCALE) / 2, y: top + 16 }, pointer, 200) : null
  const lookFrame = pose ? ['left', 'center', 'right', 'up'].indexOf(pose) : undefined
  const clip = pose && SPRITE.animations.look ? 'look' : clipFor(state.mode)
  const travel = SPRITE.animations[clip]?.travel ?? 1

  return (
    <div
      style={{ position: 'fixed', left, bottom: 0, zIndex: 30, lineHeight: 0, pointerEvents: 'auto' }}
      onPointerEnter={() => send({ type: 'hover' })}
      onClick={() => send({ type: 'click', roll: Math.random() })}
    >
      <PixelSprite
        sprite={SPRITE}
        clip={clip}
        variant={coat}
        scale={SCALE}
        // the sit faces left and the walk faces right; look poses are chosen in screen space, so never mirror them
        flip={clip === 'look' ? false : clip === 'walk' || clip === 'run' ? state.dir === -1 : state.dir === 1}
        playing={state.mode !== 'parked'}
        frame={clip === 'look' ? lookFrame : undefined}
        onStep={(n) => state.target !== null && send({ type: 'step', px: n * travel })}
        onEnd={() => send({ type: 'end' })}
      />
    </div>
  )
}

export function PetLayer() {
  const [prefs] = usePetPrefs()
  const claimed = useStageClaimed()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted || !prefs.cat || claimed) return null
  return <Cat coat={prefs.coat} />
}

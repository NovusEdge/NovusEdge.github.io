import { useEffect, useReducer, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import meJson from '../../assets/sprites/me.json'
import stoatJson from '../../assets/sprites/stoat.json'
import { prefersReducedMotion } from '../../lib/motion'
import { deskSide } from '../../lib/pet/corners'
import { initMe, meReducer } from '../../lib/pet/me-brain'
import { openPetPanel } from '../../lib/pet/panel-store'
import { atDesk, type DistributiveOmit, PERSONA_CLIPS, stoatOnRoute, usePersona } from '../../lib/pet/persona'
import { initPet, petReducer, stoatSpot, type PetEvent } from '../../lib/pet/pet-brain'
import { usePetPrefs } from '../../lib/pet/prefs-store'
import { stoatCoat } from '../../lib/pet/season'
import type { Sprite } from '../../lib/pet/sprite'
import { useStageClaimed } from '../../lib/pet/stage'
import { DeskCorner, DESK_LEFT, deskX, viewportWidth } from './desk-corner'
import { PersonaCorner } from './persona-corner'
import { StoatRoamer } from './stoat-roamer'

// both JSON files infer tuples (stoatSlot, standAt) as number[]
const ME = meJson as unknown as Sprite
const STOAT = stoatJson as unknown as Sprite
export const STOAT_SCALE = 2
const NARROW = '(max-width: 639px)'
const NEAR_RADIUS = 200
const SCROLL_SETTLE = 600
const SCROLL_GO_EVERY = 8000

const stoatRoom = () => Math.max(0, Math.floor(viewportWidth() / STOAT_SCALE) - STOAT.w)

function useDeskScale() {
  const [scale, setScale] = useState(() => (window.matchMedia(NARROW).matches ? 1 : 2))
  useEffect(() => {
    const mq = window.matchMedia(NARROW)
    const on = () => setScale(mq.matches ? 1 : 2)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return scale
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion)
  useEffect(() => {
    const check = () => setReduced(prefersReducedMotion())
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    mq.addEventListener('change', check)
    const mo = new MutationObserver(check)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    check()
    return () => {
      mq.removeEventListener('change', check)
      mo.disconnect()
    }
  }, [])
  return reduced
}

function Friends({ reduced }: { reduced: boolean }) {
  const persona = usePersona()
  const side = deskSide(persona)
  const desked = atDesk(persona)
  const deskScale = useDeskScale()
  const claimed = useStageClaimed()
  const coat = stoatCoat(new Date())
  const home = ME.animations.stand_up?.standAt?.[0] ?? 0
  const [pet, petDispatch] = useReducer(petReducer, null, () => initPet(performance.now(), Math.max(0, stoatRoom() - 40), reduced, persona === 'thinking'))
  const [me, meDispatch] = useReducer(meReducer, null, () => initMe(performance.now(), home, reduced, Math.random()))
  const petNow = (e: DistributiveOmit<PetEvent, 'now'>) => petDispatch({ now: performance.now(), ...e } as PetEvent)
  const latest = useRef({ pet, deskScale, side, desked })
  latest.current = { pet, deskScale, side, desked }
  const { pathname } = useLocation()
  const first = useRef(true)

  // stoat px of the desk's stoat slot, and the rightmost x pixel-me may walk to
  const deskStoatX = () => {
    const { side, desked, deskScale } = latest.current
    if (!desked) return null
    const [sx, , sw] = ME.animations.desk.stoatSlot!
    return Math.floor(deskX(side, sx, sw, deskScale, viewportWidth()) / STOAT_SCALE)
  }
  const meRoom = () => Math.floor((viewportWidth() - DESK_LEFT) / latest.current.deskScale) - ME.w

  useEffect(() => {
    const id = setInterval(() => {
      petNow({ type: 'tick', width: stoatRoom(), roll: Math.random(), desk: deskStoatX() })
      if (latest.current.desked) meDispatch({ type: 'tick', now: performance.now(), width: meRoom(), roll: Math.random() })
    }, 1000)
    const input = () => petNow({ type: 'input' })
    const move = (e: PointerEvent) => {
      input()
      const p = latest.current.pet
      const cx = (p.x + STOAT.w / 2) * STOAT_SCALE
      const cy = window.innerHeight - (STOAT.h / 2) * STOAT_SCALE
      if (Math.hypot(e.clientX - cx, e.clientY - cy) < NEAR_RADIUS) petNow({ type: 'near', dir: e.clientX < cx ? -1 : 1 })
    }
    let settle: ReturnType<typeof setTimeout> | undefined
    let lastGo = -Infinity
    const scroll = () => {
      input()
      clearTimeout(settle)
      settle = setTimeout(() => {
        const now = performance.now()
        if (now - lastGo < SCROLL_GO_EVERY) return
        lastGo = now
        petNow({ type: 'go', target: Math.floor(Math.random() * stoatRoom()) })
      }, SCROLL_SETTLE)
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('keydown', input)
    window.addEventListener('scroll', scroll, { passive: true })
    return () => {
      clearInterval(id)
      clearTimeout(settle)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('keydown', input)
      window.removeEventListener('scroll', scroll)
    }
  }, [])

  const was = useRef(persona)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const prev = was.current
    was.current = persona
    if (prev !== persona) meDispatch({ type: 'reset', now: performance.now(), roll: Math.random() })
    const target = Math.floor(Math.random() * stoatRoom())
    for (const e of stoatOnRoute(prev, persona, latest.current.pet.mode, stoatRoom(), STOAT.w, target)) petNow(e)
  }, [pathname])

  useEffect(() => {
    if (me.mode === 'sitting') petNow({ type: 'unfollow' })
    if (me.mode !== 'walking' || me.target === null) return
    petNow({ type: 'follow', target: Math.floor(deskX(side, me.target, ME.w, deskScale, viewportWidth()) / STOAT_SCALE), roll: Math.random() })
  }, [me.mode])

  const spot = stoatSpot(pet.mode, claimed)
  return (
    <>
      {desked ? (
        <DeskCorner me={ME} stoat={STOAT} scale={deskScale} side={side} state={me} send={meDispatch} reduced={reduced} napping={spot === 'desk'} coat={coat} onOpen={openPetPanel} />
      ) : (
        <PersonaCorner key={persona} me={ME} {...PERSONA_CLIPS[persona as keyof typeof PERSONA_CLIPS]} scale={deskScale} reduced={reduced} onOpen={openPetPanel} />
      )}
      {spot === 'floor' && <StoatRoamer sprite={STOAT} state={pet} send={petNow} coat={coat} scale={STOAT_SCALE} />}
    </>
  )
}

export function FriendsLayer() {
  const [prefs] = usePetPrefs()
  const [mounted, setMounted] = useState(false)
  const reduced = useReducedMotion()
  useEffect(() => setMounted(true), [])
  if (!mounted || !prefs.on) return null
  return <Friends key={String(reduced)} reduced={reduced} />
}

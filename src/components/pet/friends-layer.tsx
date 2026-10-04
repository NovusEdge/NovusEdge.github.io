import { useEffect, useReducer, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import meJson from '../../assets/sprites/me.json'
import stoatJson from '../../assets/sprites/stoat.json'
import { prefersReducedMotion } from '../../lib/motion'
import { initMe, meReducer } from '../../lib/pet/me-brain'
import { openPetPanel } from '../../lib/pet/panel-store'
import { initPet, petReducer, stoatSpot, type PetEvent } from '../../lib/pet/pet-brain'
import { usePetPrefs } from '../../lib/pet/prefs-store'
import { stoatCoat } from '../../lib/pet/season'
import type { Sprite } from '../../lib/pet/sprite'
import { useStageClaimed } from '../../lib/pet/stage'
import { DeskCorner, DESK_LEFT } from './desk-corner'
import { StoatRoamer } from './stoat-roamer'

// both JSON files infer tuples (stoatSlot, standAt) as number[]
const ME = meJson as unknown as Sprite
const STOAT = stoatJson as unknown as Sprite
export const STOAT_SCALE = 2
const NARROW = '(max-width: 639px)'
const NEAR_RADIUS = 200
const SCROLL_SETTLE = 600
const SCROLL_GO_EVERY = 8000

type DistributiveOmit<T, K extends string> = T extends unknown ? Omit<T, K> : never

const stoatRoom = () => Math.max(0, Math.floor(window.innerWidth / STOAT_SCALE) - STOAT.w)

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
  const deskScale = useDeskScale()
  const claimed = useStageClaimed()
  const coat = stoatCoat(new Date())
  const home = ME.animations.stand_up?.standAt?.[0] ?? 0
  const [pet, petDispatch] = useReducer(petReducer, null, () => initPet(performance.now(), Math.max(0, stoatRoom() - 40), reduced))
  const [me, meDispatch] = useReducer(meReducer, null, () => initMe(performance.now(), home, reduced, Math.random()))
  const petNow = (e: DistributiveOmit<PetEvent, 'now'>) => petDispatch({ now: performance.now(), ...e } as PetEvent)
  const latest = useRef({ pet, deskScale })
  latest.current = { pet, deskScale }
  const { pathname } = useLocation()
  const first = useRef(true)

  // stoat px of the desk's stoat slot, and the rightmost x pixel-me may walk to
  const deskStoatX = () => Math.floor((DESK_LEFT + ME.animations.desk.stoatSlot![0] * latest.current.deskScale) / STOAT_SCALE)
  const meRoom = () => Math.floor((window.innerWidth - DESK_LEFT) / latest.current.deskScale) - ME.w

  useEffect(() => {
    const id = setInterval(() => {
      petNow({ type: 'tick', width: stoatRoom(), roll: Math.random(), desk: deskStoatX() })
      meDispatch({ type: 'tick', now: performance.now(), width: meRoom(), roll: Math.random() })
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

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    petNow({ type: 'go', target: Math.floor(Math.random() * stoatRoom()) })
  }, [pathname])

  useEffect(() => {
    if (me.mode === 'sitting') petNow({ type: 'unfollow' })
    if (me.mode !== 'walking' || me.target === null) return
    petNow({ type: 'follow', target: Math.floor((DESK_LEFT + me.target * deskScale) / STOAT_SCALE), roll: Math.random() })
  }, [me.mode])

  const spot = stoatSpot(pet.mode, claimed)
  return (
    <>
      <DeskCorner me={ME} stoat={STOAT} side="left" scale={deskScale} state={me} send={meDispatch} reduced={reduced} napping={spot === 'desk'} coat={coat} onOpen={openPetPanel} />
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

import { createContext, use, useEffect, useRef, useState, type RefObject } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { Pause, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { prefersReducedMotion } from '../../lib/motion'

gsap.registerPlugin(useGSAP, ScrollTrigger, CustomEase, DrawSVGPlugin, MorphSVGPlugin)
if (typeof window !== 'undefined') {
  // One ease family for the page: okOut settles, okInOut travels, okLift overshoots a touch.
  CustomEase.create('okOut', '0.16, 1, 0.3, 1')
  CustomEase.create('okInOut', '0.76, 0, 0.24, 1')
  CustomEase.create('okLift', '0.3, 1.5, 0.5, 1')
}

export type MotionMode = 'pending' | 'full' | 'reduced'
export const MotionContext = createContext<MotionMode>('pending')
export const useMotion = () => use(MotionContext)

// prefersReducedMotion() is false during prerender, so it is read once after hydration. Until then
// every figure renders its motion markup without pause buttons, which is what the prerender emitted.
export function useMotionMode(): MotionMode {
  const [mode, setMode] = useState<MotionMode>('pending')
  useEffect(() => setMode(prefersReducedMotion() ? 'reduced' : 'full'), [])
  return mode
}

// Width only: the mobile URL bar changes the height on every scroll.
export function onWidthChange(fn: () => void) {
  let w = innerWidth
  const on = () => {
    if (innerWidth === w) return
    w = innerWidth
    fn()
  }
  addEventListener('resize', on)
  return () => removeEventListener('resize', on)
}

// A looping figure: built once `ready`, rebuilt on width change at the same time and paused state,
// paused while offscreen and while the reader has paused it.
export function useLoop(host: RefObject<HTMLElement | null>, build: () => gsap.core.Timeline, ready = true) {
  const mode = useMotion()
  const [paused, setPaused] = useState(false)
  const s = useRef({ tl: null as gsap.core.Timeline | null, user: false, vis: false })
  const apply = () => {
    const { tl, user, vis } = s.current
    if (tl) (user || !vis ? tl.pause() : tl.play())
  }
  useGSAP(
    (_, contextSafe) => {
      if (mode !== 'full' || !ready || !host.current) return
      const make = contextSafe!(() => {
        const t = s.current.tl?.time() ?? 0
        s.current.tl?.kill()
        s.current.tl = build().pause().time(t)
        apply()
      })
      make()
      ScrollTrigger.create({
        trigger: host.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (x) => {
          s.current.vis = x.isActive
          apply()
        },
      })
      const off = onWidthChange(make)
      return () => {
        off()
        s.current.tl = null
      }
    },
    { dependencies: [mode, ready], scope: host },
  )
  const toggle = () => {
    s.current.user = !s.current.user
    setPaused(s.current.user)
    apply()
  }
  return { paused, toggle, running: mode === 'full' && ready }
}

export function PauseButton({ paused, onToggle }: { paused: boolean; onToggle: () => void }) {
  const { t } = useTranslation()
  const Icon = paused ? Play : Pause
  return (
    <button type="button" className="tt-pp" aria-label={t('blog.textTone.pause')} aria-pressed={paused} onClick={onToggle}>
      <Icon className="tt-ic" aria-hidden="true" />
    </button>
  )
}

import { useEffect, useRef, useState, type RefObject } from 'react'
import { animate, stagger, utils } from 'animejs'
import { prefersReducedMotion } from '../lib/motion'

// End-of-post decorative flourish, a few anime.js variants to pick from.
// Dev switcher lives in post.tsx; once chosen, set DEFAULT_SIGNOFF and drop the picker.
export const SIGNOFF_VARIANTS = ['Terminal', 'Spore', 'Signal', 'Glitch'] as const

function useInView(ref: RefObject<HTMLElement | null>) {
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
  return seen
}

/* 1 — terminal: types out a sign-off, blinking cursor, gold reg-marks pop in */
function Terminal() {
  const ref = useRef<HTMLDivElement>(null)
  const seen = useInView(ref)
  const label = '[ transmission ends ]'

  useEffect(() => {
    if (prefersReducedMotion()) return
    utils.set(ref.current!.querySelectorAll('[data-char],[data-mark]'), { opacity: 0 })
  }, [])

  useEffect(() => {
    if (!seen || prefersReducedMotion()) return
    const root = ref.current!
    animate(root.querySelectorAll('[data-char]'), {
      opacity: [0, 1],
      translateY: [6, 0],
      duration: 60,
      delay: stagger(45),
      ease: 'out(2)',
    })
    animate(root.querySelectorAll('[data-mark]'), {
      opacity: [0, 1],
      scale: [0, 1],
      rotate: [-60, 0],
      delay: stagger(80, { start: 700 }),
      duration: 500,
      ease: 'outElastic(1, .6)',
    })
    animate(root.querySelectorAll('[data-cursor]'), { opacity: [1, 0], duration: 550, loop: true, alternate: true, ease: 'linear' })
  }, [seen])

  return (
    <div ref={ref} className="flex flex-col items-center gap-4 font-mono">
      <div className="text-sm uppercase tracking-[0.3em] text-charcoal/70 dark:text-bone/70">
        {label.split('').map((c, i) => (
          <span key={i} data-char className="inline-block whitespace-pre">
            {c}
          </span>
        ))}
        <span data-cursor className="ml-1 inline-block h-3.5 w-[7px] translate-y-[2px] bg-gold align-middle" />
      </div>
      <div className="flex gap-3 text-sm text-gold">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} data-mark>
            +
          </span>
        ))}
      </div>
    </div>
  )
}

/* 2 — spore: gold particles scatter + breathe out from a center (nods to the spore print) */
function Spore() {
  const ref = useRef<HTMLDivElement>(null)
  const seen = useInView(ref)
  const N = 28

  useEffect(() => {
    if (prefersReducedMotion()) return
    utils.set(ref.current!.querySelectorAll('[data-dot]'), { opacity: 0 })
  }, [])

  useEffect(() => {
    if (!seen || prefersReducedMotion()) return
    animate(ref.current!.querySelectorAll('[data-dot]'), {
      translateX: () => utils.random(-130, 130),
      translateY: () => utils.random(-64, 64),
      scale: [0, () => utils.random(0.4, 1.1)],
      opacity: [0, 0.9, 0.12],
      duration: () => utils.random(1700, 2700),
      delay: stagger(28),
      loop: true,
      ease: 'inOut(2)',
    })
  }, [seen])

  return (
    <div ref={ref} className="flex flex-col items-center gap-6">
      <div className="relative h-24 w-24">
        {Array.from({ length: N }).map((_, i) => (
          <span
            key={i}
            data-dot
            className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold"
          />
        ))}
      </div>
      <span className="font-mono text-xs uppercase tracking-[0.35em] text-charcoal/55 dark:text-bone/55">· novusedge ·</span>
    </div>
  )
}

/* 3 — signal: a waveform of bars pulses forever (nods to the anim1 art) */
function Signal() {
  const ref = useRef<HTMLDivElement>(null)
  const seen = useInView(ref)
  const N = 22

  useEffect(() => {
    if (!seen || prefersReducedMotion()) return
    animate(ref.current!.querySelectorAll('[data-bar]'), {
      scaleY: [0.15, 1],
      duration: 900,
      delay: stagger(70, { from: 'center' }),
      loop: true,
      alternate: true,
      ease: 'inOut(2)',
    })
  }, [seen])

  return (
    <div ref={ref} className="flex flex-col items-center gap-5">
      <div className="flex h-12 items-end gap-1.5">
        {Array.from({ length: N }).map((_, i) => (
          <span
            key={i}
            data-bar
            className="w-1 origin-bottom rounded-sm bg-gold/80"
            style={{ height: `${28 + (i % 3) * 22}%` }}
          />
        ))}
      </div>
      <span className="font-mono text-xs uppercase tracking-[0.35em] text-charcoal/55 dark:text-bone/55">[ signal lost ]</span>
    </div>
  )
}

/* 4 — glitch: scrambles through random glyphs and resolves to the sign-off */
function Glitch() {
  const ref = useRef<HTMLDivElement>(null)
  const seen = useInView(ref)
  const FINAL = '// end of file'
  const GLYPHS = '!<>-_\\/[]{}=+*^?#$%&'

  const scramble = (p: number) =>
    FINAL.split('')
      .map((ch, i) => (ch === ' ' ? ' ' : i / FINAL.length < p ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
      .join('')

  useEffect(() => {
    if (prefersReducedMotion()) return
    const el = ref.current!.querySelector('[data-glitch]')
    if (el) el.textContent = scramble(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!seen || prefersReducedMotion()) return
    const el = ref.current!.querySelector('[data-glitch]')
    if (!el) return
    const proxy = { p: 0 }
    animate(proxy, {
      p: 1,
      duration: 1500,
      ease: 'out(2)',
      onUpdate: () => {
        el.textContent = scramble(proxy.p)
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen])

  return (
    <div ref={ref} className="flex justify-center">
      <span data-glitch className="font-mono text-sm uppercase tracking-[0.25em] text-charcoal/70 dark:text-bone/70">
        {FINAL}
      </span>
    </div>
  )
}

const VARIANTS = [Terminal, Spore, Signal, Glitch]

export function PostSignoff({ variant }: { variant: number }) {
  const Flourish = VARIANTS[variant] ?? Terminal
  return (
    <div className="mt-20 flex justify-center border-t border-charcoal/10 pt-14 dark:border-bone/10">
      {/* key remounts on variant switch so the flourish replays */}
      <Flourish key={variant} />
    </div>
  )
}

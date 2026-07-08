import { useEffect, useRef, type ReactNode } from 'react'
import { animate, stagger, utils } from 'animejs'
import { prefersReducedMotion } from '../lib/motion'

// Ambient decoration for the left margin of the blog pages (lg+ only, subtle).
// anime.js variants to pick from; dev switcher lives on the page.
export const SIDE_VARIANTS = ['Waveform', 'Scanline', 'Kana', 'Particles'] as const

function Rail({ children }: { children: ReactNode }) {
  return (
    <div className="fixed left-6 top-1/2 z-40 hidden -translate-y-1/2 lg:block xl:left-10" aria-hidden>
      {children}
    </div>
  )
}

/* 1 — vertical equalizer of gold bars pulsing from the center */
function Waveform() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (prefersReducedMotion()) return
    animate(ref.current!.querySelectorAll('[data-bar]'), {
      scaleX: [0.3, 1],
      duration: 1100,
      delay: stagger(90, { from: 'center' }),
      loop: true,
      alternate: true,
      ease: 'inOut(2)',
    })
  }, [])
  return (
    <Rail>
      <div ref={ref} className="flex flex-col items-start gap-[6px] opacity-55">
        {Array.from({ length: 16 }).map((_, i) => (
          <span
            key={i}
            data-bar
            className="h-[3px] origin-left rounded-full bg-gold/70"
            style={{ width: `${14 + (i % 4) * 11}px` }}
          />
        ))}
      </div>
    </Rail>
  )
}

/* 2 — measurement scanline: a gold indicator travels a ticked axis */
function Scanline() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (prefersReducedMotion()) return
    animate(ref.current!.querySelectorAll('[data-dot]'), {
      translateY: [0, 232],
      duration: 2600,
      loop: true,
      alternate: true,
      ease: 'inOut(2)',
    })
  }, [])
  return (
    <Rail>
      <div ref={ref} className="relative h-60 w-6">
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-charcoal/15 dark:bg-bone/15" />
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            className="absolute left-1/2 h-px w-2 -translate-x-1/2 bg-charcoal/20 dark:bg-bone/20"
            style={{ top: `${i * 12.5}%` }}
          />
        ))}
        <span data-dot className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_8px_0] shadow-gold/60" />
      </div>
    </Rail>
  )
}

/* 3 — vertical lines of a quote, drifting in (ties to the JP motifs) */
// "Art is not for 'fixing' oneself. It's to show others that you're just as
//  broken, so they might feel less lonely."
const POEM = ['芸術は自分を「直す」ためではない', '同じように壊れていると誰かに示し', 'その孤独が少しでも和らぐように']
function Kana() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (prefersReducedMotion()) return
    animate(ref.current!.querySelectorAll('[data-line]'), {
      opacity: [0, 0.75],
      translateY: [-14, 0],
      duration: 1600,
      delay: stagger(400),
      ease: 'out(2)',
    })
  }, [])
  return (
    <Rail>
      <div
        ref={ref}
        className="flex flex-row-reverse gap-3.5 font-display text-sm leading-relaxed tracking-[0.15em] text-gold"
      >
        {POEM.map((line, i) => (
          <span key={i} data-line className="[writing-mode:vertical-rl]">
            {line}
          </span>
        ))}
      </div>
    </Rail>
  )
}

/* 4 — gold spores drifting upward */
function Particles() {
  const ref = useRef<HTMLDivElement>(null)
  const N = 14
  useEffect(() => {
    if (prefersReducedMotion()) return
    animate(ref.current!.querySelectorAll('[data-p]'), {
      translateY: [70, -70],
      translateX: () => utils.random(-7, 7),
      opacity: [0, 0.8, 0],
      duration: () => utils.random(2800, 4400),
      delay: stagger(230),
      loop: true,
      ease: 'linear',
    })
  }, [])
  return (
    <Rail>
      <div ref={ref} className="relative h-52 w-8">
        {Array.from({ length: N }).map((_, i) => (
          <span
            key={i}
            data-p
            className="absolute bottom-0 h-1 w-1 rounded-full bg-gold"
            style={{ left: `${15 + (i % 5) * 16}%` }}
          />
        ))}
      </div>
    </Rail>
  )
}

const VARIANTS = [Waveform, Scanline, Kana, Particles]

// heroGate: keep it hidden over a full-height dark hero, fade in once scrolled past it
export function SideFlourish({ variant, heroGate }: { variant: number; heroGate?: boolean }) {
  const Flourish = VARIANTS[variant] ?? Waveform
  const gate = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!heroGate) return
    const onScroll = () => {
      const vh = window.innerHeight
      const t = Math.min(1, Math.max(0, (window.scrollY - vh * 0.55) / (vh * 0.3)))
      if (gate.current) gate.current.style.opacity = String(t)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [heroGate])

  if (!heroGate) return <Flourish key={variant} />
  return (
    <div ref={gate} style={{ opacity: 0 }}>
      <Flourish key={variant} />
    </div>
  )
}

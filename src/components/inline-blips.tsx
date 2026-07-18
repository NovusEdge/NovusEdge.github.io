import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { TLink } from './page-transition'
import { blips } from '../lib/blips'

// Get count of blips between two dates
export function countBlipsBetween(after: string, before: string) {
  return blips.filter((b) => b.date < before && b.date > after).length
}

// Inline blip indicator — bracket style with scramble effect
export function InlineBlipCount({ count }: { count: number }) {
  const [hovered, setHovered] = useState(false)
  const [displayText, setDisplayText] = useState(`${count} blip${count > 1 ? 's' : ''}`)
  const targetText = `${count} blip${count > 1 ? 's' : ''}`
  const chars = '░▒▓█▄▀■□'

  useEffect(() => {
    if (!hovered) {
      setDisplayText(targetText)
      return
    }
    let iteration = 0
    const interval = setInterval(() => {
      setDisplayText(
        targetText
          .split('')
          .map((char, i) =>
            i < iteration ? char : char === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)],
          )
          .join(''),
      )
      iteration += 0.5
      if (iteration >= targetText.length) clearInterval(interval)
    }, 40)
    return () => clearInterval(interval)
  }, [hovered, targetText])

  if (count === 0) return null

  return (
    <TLink
      to="/blips"
      className="group my-8 flex items-center justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="relative inline-flex items-center">
        {/* Noise texture overlay */}
        <span
          className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        <span className="text-amber-500/60 font-mono text-sm transition-colors group-hover:text-amber-500">[</span>
        <span className="relative px-2 font-mono text-[11px] uppercase tracking-widest text-amber-500 transition-all group-hover:text-amber-400">
          {displayText}
        </span>
        <span className="text-amber-500/60 font-mono text-sm transition-colors group-hover:text-amber-500">]</span>
      </span>
    </TLink>
  )
}

// Floating pill — portaled to body, scroll-tied parallax like SideFlourish
export function FloatingPill() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let current = 0
    let target = 0
    let rafId: number

    const onScroll = () => {
      target = window.scrollY * 0.08 // parallax factor
    }

    const tick = () => {
      current += (target - current) * 0.06 // lerp
      if (ref.current) {
        ref.current.style.transform = `translateY(${current}px)`
      }
      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    rafId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  if (blips.length === 0) return null
  if (typeof document === 'undefined') return null

  return createPortal(
    <div ref={ref} className="group fixed right-6 top-1/3 z-50 hidden lg:block xl:right-10" aria-hidden>
      <TLink
        to="/blips"
        className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-gold bg-charcoal shadow-xl transition-transform hover:scale-110"
      >
        {/* Dither pattern */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='1' height='1' fill='%23d4a017'/%3E%3Crect x='2' y='2' width='1' height='1' fill='%23d4a017'/%3E%3C/svg%3E")`,
          }}
        />
        <span className="relative font-mono text-sm font-bold text-gold">{blips.length}</span>
      </TLink>
      {/* Hover preview */}
      <div className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 w-56 rounded border border-charcoal/20 bg-bone p-3 opacity-0 shadow-xl transition-opacity group-hover:opacity-100 dark:border-bone/20 dark:bg-charcoal">
        <span className="font-mono text-[9px] uppercase tracking-widest text-gold">latest blip</span>
        <p className="mt-1 text-xs text-charcoal/80 dark:text-bone/80 line-clamp-2">{blips[0]?.text}</p>
      </div>
    </div>,
    document.body,
  )
}

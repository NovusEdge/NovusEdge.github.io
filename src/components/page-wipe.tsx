import { useRef } from 'react'
import { useLocation } from 'react-router'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '../lib/motion'

// ponytail: wipe plays on arrival (cover -> sweep off). True cover-before-unmount needs
// blocking navigation/view transitions — add if arrival-only ever feels cheap.
export function PageWipe() {
  const ref = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  // previous-pathname ref instead of a one-shot boolean: StrictMode re-runs the
  // effect on mount, and a boolean guard would fire a wipe on first load in dev
  const prev = useRef<string | null>(null)

  useGSAP(() => {
    if (prev.current === null || prev.current === pathname) {
      prev.current = pathname
      return
    }
    prev.current = pathname
    if (prefersReducedMotion()) return
    gsap.fromTo(
      ref.current,
      { scaleX: 1 },
      { scaleX: 0, duration: 0.7, ease: 'power3.out', transformOrigin: 'left center', overwrite: true },
    )
  }, [pathname])

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 origin-left scale-x-0 bg-charcoal dark:bg-bone-tint/90"
    />
  )
}

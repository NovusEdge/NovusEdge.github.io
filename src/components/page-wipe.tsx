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
  const first = useRef(true)

  useGSAP(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (prefersReducedMotion()) return
    gsap.fromTo(
      ref.current,
      { scaleX: 1 },
      { scaleX: 0, duration: 0.7, ease: 'power3.out', transformOrigin: 'left center' },
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

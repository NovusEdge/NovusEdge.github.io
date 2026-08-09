import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { RefObject } from 'react'

gsap.registerPlugin(useGSAP)

// The accessibility panel's Reduced setting adds .a11y-reduced-motion to <html>.
// That class only shortens CSS animations, so GSAP tweens run past it unless
// every JS entry point checks the class here as well.
export const prefersReducedMotion = () => {
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('a11y-reduced-motion')) return true
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

// coarse pointer or small viewport: back off expensive per-frame effects on phones.
export const isMobile = () =>
  typeof matchMedia !== 'undefined' &&
  (matchMedia('(max-width: 768px)').matches || matchMedia('(pointer: coarse)').matches)

export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const targets = gsap.utils.toArray<HTMLElement>('[data-reveal]', scope.current)
      if (!targets.length) return
      gsap.from(
        targets,
        prefersReducedMotion()
          ? { opacity: 0, duration: 0.5, stagger: 0.08 }
          : { opacity: 0, y: 24, duration: 0.7, ease: 'power3.out', stagger: 0.08 },
      )
    },
    { scope },
  )
}

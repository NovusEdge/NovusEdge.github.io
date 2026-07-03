import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { RefObject } from 'react'

gsap.registerPlugin(useGSAP)

export const prefersReducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

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

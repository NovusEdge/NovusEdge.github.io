import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '../motion'

export function useReducedMotion() {
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

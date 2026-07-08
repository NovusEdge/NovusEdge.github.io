import { useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate, type LinkProps, type NavLinkProps } from 'react-router'
import { prefersReducedMotion } from '../lib/motion'

// A gold curtain that sweeps in to cover the page, swaps the route underneath, then sweeps
// out to reveal the new page. Driven by the Web Animations API so it works in every browser
// (no View Transitions API needed). TLink / TNavLink trigger it; plain navigations don't.

let panel: HTMLElement | null = null
let busy = false

export function GoldCurtain() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    panel = ref.current
    return () => {
      panel = null
    }
  }, [])
  return <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[60] origin-left scale-x-0 bg-gold" />
}

type Nav = ReturnType<typeof useNavigate>
const EASE = 'cubic-bezier(0.7, 0, 0.3, 1)'
const DUR = 340

async function sweep(navigate: Nav, to: string) {
  const el = panel
  if (!el || busy || prefersReducedMotion()) {
    navigate(to)
    return
  }
  busy = true
  // cover: gold grows from the left edge across the screen
  el.style.transformOrigin = 'left'
  const cover = el.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: DUR, easing: EASE, fill: 'forwards' })
  await cover.finished
  cover.commitStyles()
  cover.cancel()
  // swap the route while the screen is fully covered
  navigate(to)
  window.scrollTo(0, 0)
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  // reveal: gold collapses toward the right edge, uncovering the new page left to right
  el.style.transformOrigin = 'right'
  const reveal = el.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: DUR, easing: EASE, fill: 'forwards' })
  await reveal.finished
  reveal.commitStyles()
  reveal.cancel()
  busy = false
}

type Handler = React.MouseEventHandler<HTMLAnchorElement>
function useSweepClick(to: LinkProps['to'], onClick?: Handler): Handler {
  const navigate = useNavigate()
  return (e) => {
    onClick?.(e)
    if (e.defaultPrevented) return
    // let the browser handle new-tab / modified / non-primary clicks
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (typeof to !== 'string' || !to.startsWith('/')) return
    e.preventDefault()
    sweep(navigate, to)
  }
}

// drop-in replacements for Link / NavLink that run the gold-curtain transition
export function TLink({ to, onClick, ...rest }: LinkProps) {
  const handle = useSweepClick(to, onClick)
  return <Link to={to} onClick={handle} {...rest} />
}

export function TNavLink({ to, onClick, ...rest }: NavLinkProps) {
  const handle = useSweepClick(to, onClick)
  return <NavLink to={to} onClick={handle} {...rest} />
}

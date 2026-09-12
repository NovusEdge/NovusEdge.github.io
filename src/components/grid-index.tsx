import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { prefersReducedMotion } from '../lib/motion'
import type { GridHeading } from './grid-markdown'

/** Must match the rail breakpoint on .fg-index in global.css. */
const RAIL = '(min-width: 1280px)'

/**
 * One nav, two presentations: an inline block under the standfirst on narrow
 * screens, a fixed rail beside the column once there is a right margin to put
 * it in. Below 1280 the rail's computed left plus its width runs past the right
 * edge of the viewport, so that is where the two swap.
 *
 * The rail mounts through a portal because .page-enter finishes with a filled
 * identity transform, which makes it the containing block for anything fixed
 * inside it and pins the rail to the document instead of the viewport.
 */
export function GridIndex({ heads }: { heads: GridHeading[] }) {
  const [active, setActive] = useState<string | null>(null)
  const [past, setPast] = useState(false)
  const [rail, setRail] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(RAIL).matches)

  useEffect(() => {
    const mq = matchMedia(RAIL)
    const onChange = () => setRail(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Last heading to reach the upper part of the screen. One listener, same
  // approach as the shared table of contents. The mark is proportional rather
  // than a fixed offset so it does not lag a whole heading on tall viewports.
  useEffect(() => {
    const onScroll = () => {
      const mark = innerHeight * 0.4
      let current: string | null = null
      for (const h of heads) {
        const el = document.getElementById(h.id)
        if (el && el.getBoundingClientRect().top < mark) current = h.id
      }
      setActive(current)
      // The rail is a companion to the essay, so it retires once the shared
      // footer takes the lower half of the screen rather than floating over it.
      const footer = document.querySelector('.site-footer')
      setPast(!!footer && footer.getBoundingClientRect().top < innerHeight * 0.5)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [heads])

  const nav = (
    <nav className="fg-index" aria-label="Contents">
      <p className="fg-index-head" aria-hidden="true">
        Contents
      </p>
      <ol>
        {heads.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              aria-current={active === h.id ? 'true' : undefined}
              onClick={(e) => {
                e.preventDefault()
                document
                  .getElementById(h.id)
                  ?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
              }}
            >
              <span className="fg-index-tick" aria-hidden="true" />
              <span className="fg-index-n">{h.n}</span>
              <span className="fg-index-t">{h.text}</span>
              {h.label && <span className="fg-index-l">{h.label}</span>}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )

  if (!rail || typeof document === 'undefined') return nav
  if (past) return null
  // The wrapper carries .fg so the rail still reads the page's colour and
  // measurement custom properties from outside the page subtree.
  return createPortal(<div className="fg">{nav}</div>, document.body)
}

import { Children, cloneElement, isValidElement, useEffect, useRef, type CSSProperties, type ReactElement, type ReactNode } from 'react'
import { rng } from '../../lib/meaning-tangle'
import { prefersReducedMotion } from '../../lib/motion'

/**
 * A span that plays its CSS effect when it scrolls into view. The hidden starting state
 * hangs off .ms-armed, added on mount, so without JS or with reduced motion the text
 * simply shows in its final state.
 */
export function Reveal({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    el.classList.add('ms-armed')
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        el.classList.add('ms-in')
        io.disconnect()
      },
      // The huge top margin counts anything already above the screen as seen, so a jump
      // past the text (a fling, an anchor link) never leaves it stuck in its starting state.
      { rootMargin: '100000px 0px -20% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <span ref={ref} className={className}>
      {children}
    </span>
  )
}

// Each letter gets a fixed scatter from a seeded rng, so the server and client agree.
function scatter(node: ReactNode, r: () => number, i: { n: number }): ReactNode {
  if (typeof node === 'string') {
    return node.split(/(\s+)/).map((part, k) => {
      if (!part || /^\s+$/.test(part)) return part
      // Letters are inline-blocks, which a line may break between; the word must stay whole.
      return (
        <span key={k} className="ms-jw">
          {[...part].map((c, m) => {
            const style = { '--x': `${((r() - 0.5) * 18).toFixed(1)}px`, '--y': `${((r() - 0.5) * 14).toFixed(1)}px`, '--r': `${((r() - 0.5) * 40).toFixed(0)}deg`, '--d': `${(i.n++ * 0.012).toFixed(3)}s` }
            return (
              <span key={m} className="ms-j" style={style as CSSProperties}>
                {c}
              </span>
            )
          })}
        </span>
      )
    })
  }
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>
    return cloneElement(el, undefined, Children.map(el.props.children, (c) => scatter(c, r, i)))
  }
  return node
}

/** Letters knocked out of place that settle back into order as the sentence is reached. */
export function Jostle({ seed, children }: { seed: number; children: ReactNode }) {
  const r = rng(seed)
  const i = { n: 0 }
  return (
    <Reveal className="ms-jostle">
      <span className="sr-only">{children}</span>
      <span aria-hidden="true">{Children.map(children, (c) => scatter(c, r, i))}</span>
    </Reveal>
  )
}

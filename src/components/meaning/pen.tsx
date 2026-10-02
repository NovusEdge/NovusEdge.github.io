import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { onBoil } from '../../lib/boil'
import { canPen, loadPenFont, penLayout } from '../../lib/meaning-pen'
import { rng } from '../../lib/meaning-tangle'
import { prefersReducedMotion } from '../../lib/motion'
import { jitterPath } from './drawn'

type Layout = ReturnType<typeof penLayout>
// text: server render, no JS or reduced motion. pending: font loading, text hidden.
// pen: glyph outlines drawn then filled. wipe: the font lacks a glyph, so the live text is revealed.
type State = 'text' | 'pending' | 'pen' | 'wipe'

/** Text written on by pen in Caveat once it scrolls into view; the font sizes and wraps it. */
export function PenText({ text, lineHeight = 1, className = '' }: { text: string; lineHeight?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [state, setState] = useState<State>('text')
  const [layout, setLayout] = useState<Layout | null>(null)
  const [writing, setWriting] = useState(false)

  useEffect(() => {
    const el = ref.current
    // Wrap to the nearest block: an inline-block parent (the hero) is only as wide as this text.
    let box = el?.parentElement
    while (box && getComputedStyle(box).display.startsWith('inline')) box = box.parentElement
    if (!el || !box || prefersReducedMotion()) return
    const wrap = box
    const width = () => {
      const cs = getComputedStyle(wrap)
      return wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
    }
    setState('pending')
    let ro: ResizeObserver | null = null
    let alive = true
    loadPenFont()
      .then((font) => {
        if (!alive) return
        if (!canPen(font, text)) return setState('wipe')
        const build = () => setLayout(penLayout(font, text, parseFloat(getComputedStyle(el).fontSize), width(), lineHeight))
        build()
        setState('pen')
        ro = new ResizeObserver(build)
        ro.observe(wrap)
      })
      .catch(() => alive && setState('wipe'))
    return () => {
      alive = false
      ro?.disconnect()
    }
  }, [text, lineHeight])

  useEffect(() => {
    const el = ref.current
    if (!el || (state !== 'pen' && state !== 'wipe')) return
    let off = () => {}
    const io = new IntersectionObserver(
      ([entry]) => {
        off()
        if (!entry.isIntersecting) return
        setWriting(true)
        const paths = [...(svgRef.current?.querySelectorAll('path') ?? [])]
        if (!paths.length) return
        const variants = paths.map((p, i) => [1, 2, 3].map((v) => jitterPath(p.getAttribute('d') ?? '', 0.35, rng(i * 131 + v * 7919))))
        off = onBoil((f) => paths.forEach((p, i) => p.setAttribute('d', variants[i][f % 3])))
      },
      { rootMargin: '0px 0px -15% 0px' },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      off()
    }
  }, [state, layout])

  const stagger = layout ? Math.min(0.09, 3.2 / layout.glyphs.length) : 0
  return (
    <span ref={ref} className={`ms-pen ms-pen-${state}${writing ? ' ms-writing' : ''}${className ? ` ${className}` : ''}`}>
      <span className="ms-pen-text">{text}</span>
      {state === 'pen' && layout && (
        <svg ref={svgRef} aria-hidden="true" width={layout.width} height={layout.height} viewBox={`0 0 ${layout.width} ${layout.height}`}>
          {layout.glyphs.map((d, i) => (
            <path key={i} d={d} pathLength={1} style={{ '--d': `${(i * stagger).toFixed(3)}s` } as CSSProperties} />
          ))}
        </svg>
      )}
    </span>
  )
}

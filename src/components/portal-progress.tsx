import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { prefersReducedMotion } from '../lib/motion'
import { PORTAL_DOC, type PortalModule } from './portal-markdown'

export type ReadingProgress = {
  /** Per-module completion, 0 to 100, in module order. */
  modules: number[]
  /** Position across the whole body, 0 to 100. */
  total: number
  /** Index of the module under the reading line, or -1 above the first. */
  current: number
}

/**
 * One scroll listener feeds the contents panel and the fixed indicator.
 * A module counts as read once the reading line, 60% of the
 * way down the viewport, has passed its whole span, and the span runs to the
 * next heading rather than to the end of its own prose so the numbers never
 * disagree with each other. Module completion is a high-water mark, the way
 * a training record is: scrolling back up does not un-complete anything.
 * Position is live.
 */
export function useReadingProgress(mods: PortalModule[]): ReadingProgress {
  const [state, setState] = useState<ReadingProgress>(() => ({
    modules: mods.map(() => 0),
    total: 0,
    current: -1,
  }))

  useEffect(() => {
    let raf = 0
    let last = ''
    const high = mods.map(() => 0)
    const measure = () => {
      raf = 0
      const line = innerHeight * 0.6
      const body = document.querySelector('.op-body')
      const end = body ? body.getBoundingClientRect().bottom : innerHeight
      const tops = mods.map((m) => document.getElementById(m.id)?.getBoundingClientRect().top ?? Infinity)
      const modules = tops.map((top, i) => {
        const next = i + 1 < tops.length ? tops[i + 1] : end
        const span = next - top
        const now = span > 0 ? Math.round(Math.min(1, Math.max(0, (line - top) / span)) * 100) : 0
        high[i] = Math.max(high[i], now)
        return high[i]
      })
      let current = -1
      for (let i = 0; i < tops.length; i++) if (tops[i] < line) current = i
      const start = tops[0] ?? 0
      const total = end > start ? Math.round(Math.min(1, Math.max(0, (line - start) / (end - start))) * 100) : 0
      // Scroll fires far more often than the rounded numbers change.
      const key = `${modules.join(',')}|${total}|${current}`
      if (key === last) return
      last = key
      setState({ modules, total, current })
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    schedule()
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [mods])

  return state
}

const pct = (n: number | undefined) => `${String(n ?? 0).padStart(3, '0')}%`

/**
 * The position strip along the bottom of the viewport, with the contents
 * control at its right end. The two share the strip so the bottom edge
 * carries one piece of chrome rather than two fixed elements fighting for
 * the corner.
 *
 * Mounts through a portal because .page-enter finishes with a filled identity
 * transform, which makes it the containing block for anything fixed inside it
 * and pins the strip to the document instead of the viewport. The wrapper
 * carries .op so the strip reads the page's custom properties from outside
 * the page subtree.
 */
export function PortalProgress({ progress, mods }: { progress: ReadingProgress; mods: PortalModule[] }) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  // Decided at open time so the panel honours a setting changed mid-page.
  const [animate, setAnimate] = useState(false)
  const button = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  // The server cannot render portals. Match its empty output during hydration
  // before attaching the viewport controls to document.body.
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      button.current?.focus()
    }
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (panel.current?.contains(t) || button.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  if (!mounted || typeof document === 'undefined') return null

  const toggle = () => {
    setAnimate(!prefersReducedMotion())
    setOpen((o) => !o)
  }
  const jump = (id: string) => (e: MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    button.current?.focus()
    document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }
  const mod = Math.max(0, progress.current) + 1

  return createPortal(
    <div className="op">
      <div className="op-progress">
        <span className="op-progress-k">Position</span>
        <span
          className="op-progress-v"
          role="progressbar"
          aria-label="Reading position"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress.total}
        >
          {pct(progress.total)}
        </span>
        <span className="op-progress-track" aria-hidden="true">
          <span className="op-progress-fill" style={{ transform: `scaleX(${progress.total / 100})` }} />
        </span>
        <button
          ref={button}
          type="button"
          className="op-progress-btn"
          aria-expanded={open}
          aria-controls="op-contents"
          onClick={toggle}
        >
          <span className="op-progress-mod">
            Module {String(mod).padStart(2, '0')} of {String(mods.length).padStart(2, '0')}
          </span>
          <span className="op-progress-btn-l">Contents</span>
          <span className="op-progress-caret" aria-hidden="true" />
        </button>
      </div>
      {open && (
        <div
          ref={panel}
          id="op-contents"
          className={animate ? 'op-contents op-contents-in' : 'op-contents'}
          role="region"
          aria-label="Modules"
        >
          <p className="op-contents-head">
            <span>Modules</span>
            <span className="op-k">{PORTAL_DOC}</span>
          </p>
          <ol>
            {mods.map((m, i) => (
              <li key={m.id}>
                <a href={`#${m.id}`} aria-current={progress.current === i ? 'true' : undefined} onClick={jump(m.id)}>
                  <span className="op-contents-n">{m.n}</span>
                  <span className="op-contents-t">{m.text}</span>
                  <span className="op-contents-v">{pct(progress.modules[i])}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>,
    document.body,
  )
}

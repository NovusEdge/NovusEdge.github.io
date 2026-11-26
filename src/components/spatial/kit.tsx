import { createContext, useContext, useEffect, useRef, useState, type FocusEvent, type PointerEvent, type ReactNode, type RefObject } from 'react'
import { motion as fm } from 'framer-motion'
import { prefersReducedMotion } from '../../lib/motion'
import './figures.css'

// How long a beat stays up: time to see the change, plus reading time for its label.
// `floor` is for a beat whose own animation or side text outlasts its label.
export const pace = (labels: string[], floor = 1200) => labels.map((label) => Math.max(floor, 600 + 220 * label.split(' ').length))

// Where a point lands on screen in the isometric view, relative to the origin's own spot and in the
// units of `unit`: x runs down and to the right, y down and to the left, z straight up.
export const iso = (x: number, y: number, z: number, unit: number): [number, number] => [(x - y) * unit * 0.866, (x + y) * unit * 0.5 - z * unit]

// The rules every self-playing piece on the page shares: no motion under reduced motion, run only
// while on screen, stop while keyboard focus is on it, and one `paused` switch.
// `hold` goes on the element that shows the motion. Focus on the pause button does not hold: if it
// did, pressing play from the keyboard would do nothing until focus moved on. Only :focus-visible
// counts, because a tap or click also focuses the element and nothing on a touch screen blurs it again.
// `hoverHold` adds a hold while a mouse is over the element, for a piece with no pause button.
// A figure with a button must not have it: the reader pointing at the figure sees it freeze.
// Mouse only: a tap has no matching leave.
const onPause = (target: Element) => target.closest('[data-fig-pause]') !== null

export function useAutoplay(ref: RefObject<HTMLElement | null>, { hoverHold = false } = {}) {
  const [motion, setMotion] = useState(false)
  const [onScreen, setOnScreen] = useState(false)
  const [paused, setPaused] = useState(false)
  const [held, setHeld] = useState(false)
  const focus = {
    onFocus: ({ target }: FocusEvent) => setHeld(target.matches(':focus-visible') && !onPause(target)),
    onBlur: () => setHeld(false),
  }

  useEffect(() => {
    if (prefersReducedMotion()) return
    setMotion(true)
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting))
    observer.observe(ref.current!)
    return () => observer.disconnect()
  }, [ref])

  return {
    motion,
    running: motion && onScreen && !paused && !held,
    paused,
    toggle: () => setPaused((p) => !p),
    hold: hoverHold
      ? {
          ...focus,
          onPointerEnter: (e: PointerEvent) => {
            if (e.pointerType === 'mouse') setHeld(true)
          },
          onPointerLeave: () => setHeld(false),
        }
      : focus,
  }
}

// Every option is laid out in the same grid cell and only one is visible, so the cell is always as
// tall as its tallest option and nothing below it moves when the shown one changes. -1 shows none.
export function Swap({ options, show }: { options: ReactNode[]; show: number }) {
  return (
    <span className="sp-swap">
      {options.map((option, i) => (
        <span key={i} style={{ visibility: i === show ? 'visible' : 'hidden' }}>
          {option}
        </span>
      ))}
    </span>
  )
}

const FigContext = createContext({ motion: false, paused: false, toggle: () => {} })

// The figure's one pause control. Fig places it, unless the figure has footage: that figure sets
// `ownPause` and renders this inside the `sp-media` box that holds its video.
// It renders nothing until motion is known to be allowed, so never under reduced motion.
// The icon is two filled shapes of four points each, so `d` interpolates point for point: the two
// pause bars become the left and right halves of the play triangle, cut down its vertical midline.
const BARS = ['M5 5L9 5L9 19L5 19Z', 'M15 5L19 5L19 19L15 19Z']
const TRIANGLE = ['M7 5L13 8.5L13 15.5L7 19Z', 'M13 8.5L19 12L19 12L13 15.5Z']

export function FigPause() {
  const { motion, paused, toggle } = useContext(FigContext)
  if (!motion) return null
  return (
    <button type="button" data-fig-pause className="sp-figpause" aria-label="Pause animation" aria-pressed={paused} onClick={toggle}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {(paused ? TRIANGLE : BARS).map((d, i) => (
          <fm.path key={i} initial={false} animate={{ d }} transition={{ type: 'spring', stiffness: 420, damping: 30 }} />
        ))}
      </svg>
    </button>
  )
}

// A figure plays by itself: it steps through `labels` and hands the beat to its children. `ms` is
// how long a beat stays, either one number for all or one per beat.
// The pause button sits at the end of the label row, so it never covers the drawing. A figure
// without labels animates in CSS only and gets the button in the corner of its stage. With
// `ownPause` Fig renders no button, because the figure has put it on its video.
// The first render is the `rest` beat. Under reduced motion it is also the only one, unless `still`
// names a different beat for readers who will never see the others.
// `fadeLoop`: the step from the last beat back to the first resets the whole drawing at once, so the
// stage fades in over it. A figure that already animates its own way back turns this off.
// data-paused is set only once motion is known to be allowed: the site's reduced-motion class runs each
// CSS animation once to its end state, and pausing it at 0% would freeze the start state instead.
export function Fig({
  id,
  caption,
  labels,
  rest = 0,
  still,
  ms = 2800,
  fadeLoop = true,
  ownPause = false,
  children,
}: {
  id: string
  caption: string
  labels?: string[]
  rest?: number
  still?: number
  ms?: number | number[]
  fadeLoop?: boolean
  ownPause?: boolean
  children: ReactNode | ((beat: number) => ReactNode)
}) {
  const ref = useRef<HTMLElement>(null)
  const [beat, setBeat] = useState(rest)
  const [lap, setLap] = useState(0)
  const { motion, running, paused, toggle, hold } = useAutoplay(ref)
  const count = labels?.length ?? 0
  const wait = typeof ms === 'number' ? ms : ms[beat]

  useEffect(() => {
    if (still !== undefined && prefersReducedMotion()) setBeat(still)
  }, [still])

  useEffect(() => {
    if (!running || count < 2) return
    const timer = setTimeout(() => {
      setBeat((beat + 1) % count)
      if (beat + 1 === count) setLap((l) => l + 1)
    }, wait)
    return () => clearTimeout(timer)
  }, [running, beat, count, wait])

  return (
    <figure ref={ref} className="sp-fig not-prose" data-wf-figure={id} data-paused={motion && !running ? '' : undefined}>
      <FigContext.Provider value={{ motion, paused, toggle }}>
        {labels && (
          <div className="sp-bar">
            <p className="sp-beat">
              <Swap
                show={beat}
                options={labels.map((label, i) => (
                  <>
                    <i>
                      {i + 1}/{count}
                    </i>
                    {label}
                  </>
                ))}
              />
            </p>
            {!ownPause && <FigPause />}
          </div>
        )}
        {/* Two names for one keyframe: an animation restarts only when its name changes. */}
        <div className="sp-stage" style={fadeLoop && lap ? { animationName: lap % 2 ? 'sp-lap-a' : 'sp-lap-b' } : undefined} {...hold}>
          {typeof children === 'function' ? children(beat) : children}
          {!labels && !ownPause && <FigPause />}
        </div>
      </FigContext.Provider>
      <figcaption>{caption}</figcaption>
    </figure>
  )
}

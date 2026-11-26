import { useEffect, useRef, type CSSProperties, type PointerEvent } from 'react'
import { createTimeline, stagger } from 'animejs'
import { HeroField } from './hero-field'
import { iso, useAutoplay } from './kit'
import './figures.css'
import './hero.css'

const LABEL =
  'An isometric drawing of a small house. In the animation it starts out built wrong: the roof lopsided and shifted, the walls not meeting at the corners, the side window floating outside the right wall. Three calls fix it in turn: align(walls), insert(window_side, wall_right), attach(roof, walls.top).'

// The house is drawn finished, and that is what the server, a reader without JS and a reader with
// reduced motion all see. `BROKEN` is how far each layer is knocked out of place (x and y in SVG
// units, then degrees) before the three calls put it back.
const BROKEN: Record<string, [number, number, number]> = {
  'wall-back-left': [-9, -5, 0],
  'wall-back-right': [8, -7, 0],
  'wall-front': [-11, 9, 0],
  'wall-right': [13, 6, 0],
  'window-side': [64, -18, 0],
  roof: [34, -30, -8],
}
// One loop, in ms. It opens and closes on the finished house so the repeat has no seam:
// hold, come apart (APART), then the three calls, then hold again until END.
// `at` is when a call starts typing and `move` when its layers start to travel. The window
// eases out and stops flush; everything else overshoots.
const APART = 700
const CALLS = [
  { call: 'align(walls)', at: 1900, move: 2350, parts: ['wall-back-left', 'wall-back-right', 'wall-front', 'wall-right'], ease: 'outBack(1.6)', duration: 650 },
  { call: 'insert(window_side, wall_right)', at: 3250, move: 3850, parts: ['window-side'], ease: 'outCubic', duration: 600 },
  { call: 'attach(roof, walls.top)', at: 4500, move: 4950, parts: ['roof'], ease: 'outBack(1.4)', duration: 700 },
]
const MEET = 4950 + 620
const END = 8000

const [W, D, H, SLAB, EAVE] = [4, 3, 2.4, 0.3, 0.35]
const TOP = H + SLAB
const U = 34
type V = [number, number, number]
const at = (v: V) => {
  const [x, y] = iso(...v, U)
  return `${(190 + x).toFixed(1)},${(170 + y).toFixed(1)}`
}
const face = (...corners: V[]) => corners.map(at).join(' ')
const CORNERS: V[] = [
  [0, 0, H],
  [W, 0, H],
  [W, D, H],
  [0, D, H],
]
const GRID = Array.from({ length: 8 }, (_, i) => i - 1.5)

const depth = (d: number) => ({ '--d': d }) as CSSProperties

function Sockets() {
  return CORNERS.map((corner) => {
    const [cx, cy] = at(corner).split(',')
    return <circle key={corner.join()} data-socket className="sh-socket" cx={cx} cy={cy} r="3.5" />
  })
}

export function SpatialHero({ title, description, date }: { title: string; description?: string; date: string }) {
  const root = useRef<HTMLElement>(null)
  const art = useRef<HTMLDivElement>(null)
  const timeline = useRef<ReturnType<typeof createTimeline> | null>(null)
  const { motion, running, paused, toggle, hold } = useAutoplay(root, { hoverHold: true })

  useEffect(() => {
    if (!motion) return
    const el = root.current!
    const all = (selector: string) => el.querySelectorAll(selector)
    const tl = createTimeline({ loop: true, autoplay: false })
    tl.add(all('[data-chip]'), { opacity: [1, 0], duration: 250, ease: 'linear' }, APART)
    tl.add(all('[data-wall-sockets]'), { opacity: [1, 0], duration: 250, ease: 'linear' }, APART)
    // The letters go out only once their chip is invisible, ready to be typed back in.
    tl.add(all('[data-char]'), { opacity: [1, 0], duration: 1, ease: 'linear' }, APART + 260)
    CALLS.forEach((beat, i) => {
      const chip = all('[data-chip]')[i]
      tl.add(chip, { opacity: [0, 1], duration: 120, ease: 'linear' }, beat.at)
      tl.add(chip.querySelectorAll('[data-char]'), { opacity: [0, 1], duration: 40, delay: stagger(14), ease: 'linear' }, beat.at + 60)
      beat.parts.forEach((part, n) => {
        const [x, y, r] = BROKEN[part]
        const layer = all(`[data-part="${part}"]`)
        tl.add(layer, { translateX: [0, x], translateY: [0, y], rotate: [0, r], duration: 650, ease: 'inOutCubic' }, APART + n * 40)
        tl.add(layer, { translateX: [x, 0], translateY: [y, 0], rotate: [r, 0], duration: beat.duration, ease: beat.ease }, beat.move + n * 60)
      })
    })
    // The voxel map shows through while code is moving things, then drops back.
    tl.add(all('[data-grid]'), { opacity: [0.16, 0.5], duration: 400, ease: 'outQuad' }, CALLS[0].move)
    tl.add(all('[data-grid]'), { opacity: [0.5, 0.16], duration: 600, ease: 'outQuad' }, MEET + 80)
    tl.add(all('[data-wall-sockets]'), { opacity: [0, 0.55], duration: 300, ease: 'linear' }, CALLS[0].move + 700)
    // Wall and roof sockets flare together at the moment the roof seats.
    tl.add(all('[data-wall-sockets]'), { opacity: [0.55, 1], duration: 120, ease: 'linear' }, MEET)
    tl.add(all('[data-socket]'), { scale: [1, 2.3], duration: 160, ease: 'outQuad' }, MEET)
    tl.add(all('[data-socket]'), { scale: [2.3, 1], duration: 360, ease: 'outQuad' }, MEET + 160)
    // Nothing moves here: it only stretches the loop so the finished house is held until END.
    tl.add({ duration: 1 }, END - 1)
    timeline.current = tl
    return () => {
      tl.revert()
      timeline.current = null
    }
  }, [motion])

  useEffect(() => {
    if (running) timeline.current?.play()
    else timeline.current?.pause()
  }, [running])

  // Writes two custom properties on the art box; each layer multiplies them by its own depth in CSS.
  const lean = (e: PointerEvent, rest = false) => {
    if (!motion || e.pointerType !== 'mouse' || !art.current) return
    const box = art.current.getBoundingClientRect()
    art.current.style.setProperty('--px', rest ? '0' : ((e.clientX - box.left) / box.width - 0.5).toFixed(3))
    art.current.style.setProperty('--py', rest ? '0' : ((e.clientY - box.top) / box.height - 0.5).toFixed(3))
  }

  return (
    <header ref={root} className="sp-fig sp-hero" data-wf-slot="hero" onPointerMove={lean} onPointerLeave={(e) => lean(e, true)}>
      <div data-wf-region="head" className="spp-head">
        <time dateTime={date} className="spp-kicker">
          {date}
        </time>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>

      <div ref={art} className="sp-hero-art">
        {/* The hero has no pause button. A mouse stops the loop by hovering and a keyboard by focusing the
            drawing, which takes focus only while there is a loop to stop. Touch and pen have neither, so a
            tap toggles pause. pointerup does not fire for a touch that turned into a scroll. */}
        <div
          role="img"
          aria-label={LABEL}
          tabIndex={motion ? 0 : undefined}
          {...hold}
          className="sh-stage"
          data-paused={paused ? '' : undefined}
          onPointerUp={(e) => {
            if (motion && e.pointerType !== 'mouse') toggle()
          }}
        >
          <HeroField running={running} />
          <svg viewBox="0 0 440 360" aria-hidden="true">
            <g data-grid data-depth style={depth(4)} className="sh-grid">
              {GRID.map((i) => (
                <path key={i} d={`M${at([i, -1.5, 0])} L${at([i, 4.5, 0])} M${at([-1.5, i - 1, 0])} L${at([5.5, i - 1, 0])}`} />
              ))}
            </g>
            <g data-depth style={depth(6)}>
              <polygon className="sh-plate" points={face([-0.5, -0.5, 0], [W + 0.5, -0.5, 0], [W + 0.5, D + 0.5, 0], [-0.5, D + 0.5, 0])} />
            </g>
            <g data-depth style={depth(8)}>
              <g data-part="wall-back-left">
                <polygon className="sh-wall sh-inner" points={face([0, 0, 0], [0, D, 0], [0, D, H], [0, 0, H])} />
              </g>
              <g data-part="wall-back-right">
                <polygon className="sh-wall sh-inner" points={face([0, 0, 0], [W, 0, 0], [W, 0, H], [0, 0, H])} />
              </g>
            </g>
            <g data-depth style={depth(10)}>
              <g data-part="wall-front">
                <polygon className="sh-wall" points={face([0, D, 0], [W, D, 0], [W, D, H], [0, D, H])} />
                <g data-layer="door">
                  <polygon className="sh-wall sh-shade" points={face([0.5, D, 0], [1.3, D, 0], [1.3, D, 1.6], [0.5, D, 1.6])} />
                </g>
                <g data-layer="window-front">
                  <polygon className="sh-wall sh-glass" points={face([2.2, D, 1], [3.3, D, 1], [3.3, D, 1.8], [2.2, D, 1.8])} />
                </g>
              </g>
              <g data-part="wall-right">
                <polygon className="sh-wall sh-shade" points={face([W, 0, 0], [W, D, 0], [W, D, H], [W, 0, H])} />
                <polygon className="sh-hole" points={face([W, 0.9, 1], [W, 2.1, 1], [W, 2.1, 1.8], [W, 0.9, 1.8])} />
              </g>
            </g>
            <g data-depth style={depth(12)}>
              <g data-part="window-side">
                <polygon className="sh-wall sh-glass" points={face([W, 0.9, 1], [W, 2.1, 1], [W, 2.1, 1.8], [W, 0.9, 1.8])} />
              </g>
            </g>
            <g data-wall-sockets data-depth style={depth(10)}>
              <Sockets />
            </g>
            <g data-depth style={depth(15)}>
              <g data-part="roof">
                <polygon className="sh-wall sh-shade" points={face([W + EAVE, -EAVE, H], [W + EAVE, D + EAVE, H], [W + EAVE, D + EAVE, TOP], [W + EAVE, -EAVE, TOP])} />
                <polygon className="sh-wall" points={face([-EAVE, D + EAVE, H], [W + EAVE, D + EAVE, H], [W + EAVE, D + EAVE, TOP], [-EAVE, D + EAVE, TOP])} />
                <polygon className="sh-wall sh-roof" points={face([-EAVE, -EAVE, TOP], [W + EAVE, -EAVE, TOP], [W + EAVE, D + EAVE, TOP], [-EAVE, D + EAVE, TOP])} />
                <Sockets />
              </g>
            </g>
          </svg>
        </div>
        <p role="status" className="sr-only">
          {paused && 'Animation paused. Tap the drawing to resume.'}
        </p>
        <ol aria-hidden="true">
          {CALLS.map((beat) => (
            <li key={beat.call} data-chip>
              {[...beat.call].map((char, i) => (
                <span key={i} data-char>
                  {char}
                </span>
              ))}
            </li>
          ))}
        </ol>
      </div>
    </header>
  )
}

import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { onBoil } from '../../lib/boil'
import type { VoiceMeta } from '../../lib/meaning-data'
import { sideRows, type VoiceLine } from '../../lib/meaning-voices'
import { HEAD, drawTangle, drawTendrils, ellipseAt, lerp, makeStrokes, makeTendrils, presence, pullToward, rng, smooth } from '../../lib/meaning-tangle'
import { isMobile, prefersReducedMotion } from '../../lib/motion'
import { jitterPath } from './drawn'

/** The page's sticky canvas. The page owns it so the tangle can cover the whole screen. */
export const TangleLayerContext = createContext<RefObject<HTMLCanvasElement | null> | null>(null)

// Head and shoulders in a 280x380 box; HEAD is this head's ellipse.
export const FIGURE_PATH =
  'M 140 42 C 92 40 62 82 64 138 C 66 196 100 236 142 238 C 186 238 218 196 216 136 C 214 80 186 44 140 42 Z' +
  ' M 118 236 C 120 256 118 268 112 280 M 164 236 C 162 256 164 268 170 280' +
  ' M 112 280 C 70 288 34 310 22 372 M 170 280 C 212 288 248 310 258 372'

// How long the last line holds in the head before the tangle spills back out.
const SETTLE_MS = 2500
// Fraction of the viewport height the stage's top must rise past before the page snaps to it.
const SNAP_AT = 0.45

const inkColor = () => getComputedStyle(document.querySelector('.ms') ?? document.documentElement).getPropertyValue('--ms-ink').trim() || '#1a1a1a'

// Erasing on the canvas, not painting paper behind the prose: a backing would sit
// above the site's grain overlay and show as a grain-free box around the column.
function eraseColumn(ctx: CanvasRenderingContext2D, x0: number, x1: number, h: number, amount: number) {
  const pad = 28
  const w = x1 - x0 + 2 * pad
  const g = ctx.createLinearGradient(x0 - pad, 0, x1 + pad, 0)
  const on = `rgba(0,0,0,${amount})`
  g.addColorStop(0, 'rgba(0,0,0,0)')
  g.addColorStop(pad / w, on)
  g.addColorStop(1 - pad / w, on)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  ctx.fillStyle = g
  ctx.fillRect(x0 - pad, 0, w, h)
  ctx.restore()
}

// solo: the phone layout stacks every line in one slot under the figure, so only the newest shows.
function lineOpacity(i: number, shown: number, solo: boolean) {
  if (i >= shown) return 0
  const age = shown - 1 - i
  if (solo) return age === 0 ? 1 : 0
  return age < 2 ? 1 : Math.max(0.18, 1 - age * 0.22)
}

export function Voices({ lines, meta, locale }: { lines: VoiceLine[]; meta: VoiceMeta[]; locale: string }) {
  const { t } = useTranslation()
  const layer = useContext(TangleLayerContext)
  // Rendered still on the server and before hydration, so nothing is hidden if JS never runs.
  const [mode, setMode] = useState<'still' | 'motion'>('still')
  const [sound, setSound] = useState(false)
  const [shown, setShown] = useState(0)
  const shownRef = useRef(0)
  const doneAt = useRef<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const figRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const stillCanvas = useRef<HTMLCanvasElement>(null)
  const soundRef = useRef(false)
  const audioCtx = useRef<AudioContext | null>(null)
  const playing = useRef<HTMLAudioElement[]>([])
  const hasAudio = locale === 'en' && meta.some((m) => m.audio)
  const { row, rows } = sideRows(lines)
  const done = shown === lines.length

  const playLine = (i: number) => {
    const src = meta[i]?.audio
    const ac = audioCtx.current
    if (!src || !ac || !soundRef.current) return
    const el = new Audio(src)
    const pan = ac.createStereoPanner()
    pan.pan.value = lines[i].side === 'left' ? -0.7 : 0.7
    ac.createMediaElementSource(el).connect(pan).connect(ac.destination)
    playing.current.push(el)
    el.play().catch(() => {})
  }

  // The page holds still while the voices play: the first time the stage's top passes
  // SNAP_AT scrolling down, the page glides to it and scroll is blocked until the last line
  // has settled, then it moves on to the next paragraph. Only a tap (or the focused next
  // button) advances a line; Esc or skip lets go.
  const [held, setHeld] = useState(false)
  const hold = useRef({ on: false, passed: false, off: () => {} })
  const nextRef = useRef<HTMLButtonElement>(null)

  const release = (moveOn: boolean) => {
    if (!hold.current.on) return
    hold.current.off()
    hold.current = { on: false, passed: true, off: () => {} }
    setHeld(false)
    const after = sectionRef.current?.nextElementSibling
    if (moveOn && after) window.scrollTo({ top: scrollY + after.getBoundingClientRect().top - innerHeight * 0.25, behavior: 'smooth' })
  }

  const advance = () => {
    const next = shownRef.current === lines.length ? 0 : shownRef.current + 1
    shownRef.current = next
    doneAt.current = next === lines.length ? performance.now() : null
    setShown(next)
    if (next) playLine(next - 1)
    if (next === lines.length && hold.current.on) window.setTimeout(() => release(true), SETTLE_MS)
  }
  const releaseRef = useRef(release)
  useEffect(() => {
    releaseRef.current = release
  })

  const startHold = (section: HTMLElement) => {
    if (hold.current.on || hold.current.passed) return
    const block = (e: Event) => e.preventDefault()
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return releaseRef.current(false)
      // A focused button handles its own Space and Enter; cancelling the keydown would stop its click.
      if ((e.key === ' ' || e.key === 'Enter') && document.activeElement instanceof HTMLButtonElement) return
      if ([' ', 'ArrowDown', 'PageDown', 'ArrowUp', 'PageUp', 'Home', 'End'].includes(e.key)) e.preventDefault()
    }
    const opts = { passive: false } as const
    addEventListener('wheel', block, opts)
    addEventListener('touchmove', block, opts)
    addEventListener('keydown', key)
    // Blocking first means leftover wheel momentum cannot fight the glide.
    window.scrollTo({ top: scrollY + section.getBoundingClientRect().top, behavior: 'smooth' })
    hold.current = {
      on: true,
      passed: false,
      off: () => {
        removeEventListener('wheel', block)
        removeEventListener('touchmove', block)
        removeEventListener('keydown', key)
      },
    }
    setHeld(true)
    nextRef.current?.focus({ preventScroll: true })
  }
  const startHoldRef = useRef(startHold)
  useEffect(() => {
    startHoldRef.current = startHold
  })
  useEffect(() => () => hold.current.off(), [])

  const toggleSound = () => {
    soundRef.current = !soundRef.current
    setSound(soundRef.current)
    audioCtx.current ??= new AudioContext()
    if (!soundRef.current) playing.current.forEach((a) => a.pause())
  }

  useEffect(() => {
    // Motion hides every line until a tap reveals it, so enter it only when the effect below can run.
    if (!prefersReducedMotion() && layer?.current?.getContext('2d')) setMode('motion')
  }, [layer])

  useEffect(
    () => () => {
      playing.current.forEach((a) => a.pause())
      void audioCtx.current?.close()
      audioCtx.current = null
    },
    [],
  )

  useEffect(() => {
    const list = listRef.current
    if (mode !== 'motion' || !list) return
    const solo = matchMedia('(max-width: 760px)').matches
    ;[...list.children].forEach((el, i) => ((el as HTMLElement).style.opacity = String(lineOpacity(i, shown, solo))))
  }, [mode, shown])

  // The figure boils with the page's drawings.
  useEffect(() => {
    if (mode !== 'motion' || !pathRef.current) return
    const path = pathRef.current
    const variants = [1, 2, 3].map((v) => jitterPath(FIGURE_PATH, 0.8, rng(v * 7919)))
    return onBoil((f) => path.setAttribute('d', variants[f % 3]))
  }, [mode])

  // Still mode: one tangle in the head, redrawn when the theme changes.
  useEffect(() => {
    const canvas = stillCanvas.current
    if (mode !== 'still' || !canvas) return
    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const dpr = Math.min(devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const s = width / 280
      drawTangle(ctx, makeStrokes(46, 80, 11), { x: HEAD.x * s, y: HEAD.y * s, rx: HEAD.rx * s, ry: HEAD.ry * s }, 0.5, 0, inkColor(), 0.85, 1.3)
    }
    draw()
    const mo = new MutationObserver(draw)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => mo.disconnect()
  }, [mode])

  // Motion mode: the tangle creeps over the page on approach, gathers into the head while the
  // stage fills the screen, leans toward whoever spoke last, and spills out once the last line settles.
  useEffect(() => {
    const canvas = layer?.current
    const section = sectionRef.current
    const fig = figRef.current
    const list = listRef.current
    if (mode !== 'motion' || !canvas || !section || !fig || !list) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const items = [...list.children] as HTMLElement[]
    const strokes = makeStrokes(80, 110, 5)
    const tendrils = makeTendrils(16, 9)
    const dpr = Math.min(devicePixelRatio || 1, isMobile() ? 1.5 : 2)
    let ink = inkColor()
    let agit = 0.15
    let m = 0
    let pull = { dx: 0, dy: 0 }
    let raf = 0
    let last = ''
    let lastBase = ''
    let prevTop = Infinity

    // A paragraph is as wide as the reading column; the tangle is erased over that column so it
    // never crosses prose, and stays free to wander through the margin notes.
    const textBlock = section.parentElement?.closest('.ms-prose')?.querySelector(':scope > p, .ms-row > p') ?? null

    const clear = () => {
      last = ''
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    const ease = (from: number, to: number, snap: number) => (Math.abs(to - from) < snap ? to : from + (to - from) * 0.05)

    const tick = (now: number) => {
      const vw = canvas.clientWidth
      const vh = canvas.clientHeight
      if (canvas.width !== Math.round(vw * dpr) || canvas.height !== Math.round(vh * dpr)) {
        canvas.width = Math.round(vw * dpr)
        canvas.height = Math.round(vh * dpr)
      }
      const r = section.getBoundingClientRect()
      // Crossing the snap line downward; arriving from below (a back-scroll or a link) never holds.
      const snapAt = vh * SNAP_AT
      if (prevTop > snapAt && r.top <= snapAt && r.bottom > 0) startHoldRef.current(section)
      prevTop = r.top
      const shownNow = shownRef.current
      const onScreen = (Math.min(r.bottom, vh) - Math.max(r.top, 0)) / vh
      const settled = doneAt.current !== null && now - doneAt.current > SETTLE_MS
      // The gather is a switch, eased over time, not tied to scroll position: it happens once
      // the stage owns the screen (the snap, or a reader who scrolls back fully onto it).
      m = ease(m, (hold.current.on || onScreen > 0.95) && !settled ? 1 : 0, 0.002)

      const pres = presence(r.top, r.bottom, vh)
      const target = m > 0.5 ? (shownNow ? meta[shownNow - 1].agit : 0.15) : r.top > 0 ? lerp(0.2, 0.7, pres) : 0.12
      agit = ease(agit, target, 0.005)

      const fr = fig.getBoundingClientRect()
      const s = fr.width / 280
      const cr = canvas.getBoundingClientRect()
      const head = { x: fr.left - cr.left + HEAD.x * s, y: fr.top - cr.top + HEAD.y * s, rx: HEAD.rx * s, ry: HEAD.ry * s }
      // On the section so the next button fades in with the figure.
      section.style.setProperty('--ms-fig', String(smooth(0.5, 1, m)))

      const col = textBlock?.getBoundingClientRect()
      const alpha = lerp((0.06 + agit * 0.12) * pres, 0.85, m)
      const e = ellipseAt(m, vw, vh, head)
      const speaker = shownNow && m > 0.5 ? items[shownNow - 1].getBoundingClientRect() : null
      const want = speaker
        ? pullToward(head, { x: speaker.left - cr.left + speaker.width / 2, y: speaker.top - cr.top + speaker.height / 2 }, meta[shownNow - 1].agit)
        : { dx: 0, dy: 0 }
      pull = { dx: ease(pull.dx, want.dx, 0.25), dy: ease(pull.dy, want.dy, 0.25) }
      e.x += pull.dx * m
      e.y += pull.dy * m
      const frame = Math.floor(now / (140 - agit * 85))
      // Most frames are identical; repaint only when an input of the image moved.
      const base = [Math.round(e.x * 2), Math.round(e.y * 2), Math.round(e.rx * 2), Math.round(e.ry * 2), Math.round(agit * 50), Math.round(alpha * 100), canvas.width, canvas.height, ink, Math.round(col?.left ?? 0), Math.round(col?.width ?? 0)].join()
      // While anything but the boil frame moves (gathering, spilling, approach fade), half the
      // points: those phases repaint the whole tangle every frame. The settled frame repaints in full.
      const stride = base === lastBase ? 1 : 2
      lastBase = base
      const key = `${frame},${base},${stride}`
      if (key !== last) {
        clear()
        last = key
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        if (alpha > 0.005) {
          drawTangle(ctx, strokes, e, agit, frame, ink, alpha, lerp(1.4, 1.3, m), stride)
          if (m > 0.6) {
            const d = Math.hypot(pull.dx, pull.dy)
            drawTendrils(ctx, tendrils, e, agit, frame, ink, alpha, 1.3, d ? { x: pull.dx / d, y: pull.dy / d } : { x: 0, y: 0 })
          }
          if (m < 1 && col) eraseColumn(ctx, col.left - cr.left, col.right - cr.left, vh, 1 - m)
        }
      }
      raf = requestAnimationFrame(tick)
    }

    // Runs only while the section is within reach of the viewport.
    const io = new IntersectionObserver(
      ([entry]) => {
        cancelAnimationFrame(raf)
        if (entry.isIntersecting) raf = requestAnimationFrame(tick)
        else clear()
      },
      // Bottom margin is the approach side: start 1.3 screens before the section's top enters, run 0.9 after it leaves.
      { rootMargin: '90% 0px 130% 0px' },
    )
    io.observe(section)
    const mo = new MutationObserver(() => (ink = inkColor()))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => {
      io.disconnect()
      mo.disconnect()
      cancelAnimationFrame(raf)
      clear()
    }
  }, [mode, layer, meta])

  return (
    <section
      ref={sectionRef}
      className={`ms-voices ${mode === 'still' ? 'ms-still' : 'ms-motion'}`}
      style={{ '--ms-n': lines.length, '--ms-rows': rows } as CSSProperties}
      onClick={mode === 'motion' ? advance : undefined}
    >
      <div className="ms-stage">
        <div ref={figRef} className="ms-figure" role="img" aria-label={t('blog.meaning.figure')}>
          <svg viewBox="0 0 280 380" aria-hidden="true">
            <path ref={pathRef} d={FIGURE_PATH} />
          </svg>
          {mode === 'still' && <canvas ref={stillCanvas} aria-hidden="true" />}
        </div>
        <ol ref={listRef} className="ms-voice-list">
          {lines.map((line, i) => (
            <li key={i} data-side={line.side} style={{ '--ms-i': i + 1, '--ms-row': row[i] } as CSSProperties}>
              {line.text}
              {mode === 'still' && sound && meta[i]?.audio && (
                <button type="button" className="ms-play" aria-label={t('blog.meaning.play')} onClick={() => playLine(i)}>
                  ▸
                </button>
              )}
            </li>
          ))}
        </ol>
        {mode === 'motion' && (
          // The whole stage takes the tap; this button is the keyboard and screen-reader way in.
          <button ref={nextRef} type="button" className="ms-next">
            {done ? t('blog.meaning.again') : t('blog.meaning.next')}
          </button>
        )}
        {held && (
          <button
            type="button"
            className="ms-skip"
            onClick={(e) => {
              e.stopPropagation()
              release(true)
            }}
          >
            {t('blog.meaning.skip')}
          </button>
        )}
        {hasAudio && (
          <button
            type="button"
            className="ms-sound"
            aria-pressed={sound}
            onClick={(e) => {
              e.stopPropagation()
              toggleSound()
            }}
          >
            {sound ? t('blog.meaning.soundOn') : t('blog.meaning.soundOff')}
          </button>
        )}
      </div>
    </section>
  )
}

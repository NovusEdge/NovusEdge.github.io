import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { onBoil } from '../../lib/boil'
import type { VoiceMeta } from '../../lib/meaning-data'
import { linesToPlay, type VoiceLine } from '../../lib/meaning-voices'
import { HEAD, drawTangle, ellipseAt, lerp, makeStrokes, presence, rng, sectionProgress, smooth, stagePhase } from '../../lib/meaning-tangle'
import { isMobile, prefersReducedMotion } from '../../lib/motion'
import { jitterPath } from './drawn'

/** The page's sticky canvas. The page owns it so the tangle can cover the whole screen. */
export const TangleLayerContext = createContext<RefObject<HTMLCanvasElement | null> | null>(null)

// Head and shoulders in a 280x380 box; HEAD is this head's ellipse.
export const FIGURE_PATH =
  'M 140 42 C 92 40 62 82 64 138 C 66 196 100 236 142 238 C 186 238 218 196 216 136 C 214 80 186 44 140 42 Z' +
  ' M 118 236 C 120 256 118 268 112 280 M 164 236 C 162 256 164 268 170 280' +
  ' M 112 280 C 70 288 34 310 22 372 M 170 280 C 212 288 248 310 258 372'

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

function lineOpacity(i: number, shown: number) {
  if (i >= shown) return 0
  const age = shown - 1 - i
  return age < 2 ? 1 : Math.max(0.18, 1 - age * 0.22)
}

export function Voices({ lines, meta, locale }: { lines: VoiceLine[]; meta: VoiceMeta[]; locale: string }) {
  const { t } = useTranslation()
  const layer = useContext(TangleLayerContext)
  // Rendered still on the server and before hydration, so nothing is hidden if JS never runs.
  const [mode, setMode] = useState<'still' | 'motion'>('still')
  const [sound, setSound] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const figRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const stillCanvas = useRef<HTMLCanvasElement>(null)
  const soundRef = useRef(false)
  const audioCtx = useRef<AudioContext | null>(null)
  const playing = useRef<HTMLAudioElement[]>([])
  const hasAudio = locale === 'en' && meta.some((m) => m.audio)

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
  const playRef = useRef(playLine)
  useEffect(() => {
    playRef.current = playLine
  })
  // Held across motion-effect re-runs so a changed lines/meta identity does not replay clips.
  const played = useRef(new Set<number>())
  const lastShown = useRef(-1)

  const toggleSound = () => {
    soundRef.current = !soundRef.current
    setSound(soundRef.current)
    audioCtx.current ??= new AudioContext()
    if (!soundRef.current) playing.current.forEach((a) => a.pause())
  }

  useEffect(() => {
    // Motion hides every line until scroll reveals it, so enter it only when the effect below can run.
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

  // Motion mode: scroll drives the lines and the tangle on the page's sticky canvas.
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
    const dpr = Math.min(devicePixelRatio || 1, isMobile() ? 1.5 : 2)
    let ink = inkColor()
    let agit = 0.15
    let raf = 0
    let last = ''
    let lastBase = ''

    // A paragraph is as wide as the reading column; the tangle is erased over that column so it
    // never crosses prose, and stays free to wander through the margin notes.
    const textBlock = section.parentElement?.closest('.ms-prose')?.querySelector(':scope > p, .ms-row > p') ?? null

    const clear = () => {
      last = ''
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    const tick = (now: number) => {
      const vw = canvas.clientWidth
      const vh = canvas.clientHeight
      if (canvas.width !== Math.round(vw * dpr) || canvas.height !== Math.round(vh * dpr)) {
        canvas.width = Math.round(vw * dpr)
        canvas.height = Math.round(vh * dpr)
      }
      const r = section.getBoundingClientRect()
      const { m, shown } = stagePhase(sectionProgress(r.top, r.height, vh), lines.length)
      if (shown !== lastShown.current) {
        items.forEach((el, i) => (el.style.opacity = String(lineOpacity(i, shown))))
        for (const i of linesToPlay(Math.max(0, lastShown.current), shown, played.current)) {
          played.current.add(i)
          playRef.current(i)
        }
        lastShown.current = shown
      }
      const pres = presence(r.top, r.bottom, vh)
      const target = m > 0.5 ? (shown ? meta[shown - 1].agit : 0.15) : r.top > 0 ? lerp(0.2, 0.7, pres) : 0.12
      // Snap so the easing stops changing the redraw key.
      agit = Math.abs(target - agit) < 0.005 ? target : agit + (target - agit) * 0.05

      const fr = fig.getBoundingClientRect()
      const s = fr.width / 280
      const cr = canvas.getBoundingClientRect()
      const head = { x: fr.left - cr.left + HEAD.x * s, y: fr.top - cr.top + HEAD.y * s, rx: HEAD.rx * s, ry: HEAD.ry * s }
      fig.style.setProperty('--ms-fig', String(smooth(0.5, 1, m)))

      const col = textBlock?.getBoundingClientRect()
      const alpha = lerp((0.06 + agit * 0.12) * pres, 0.85, m)
      const e = ellipseAt(m, vw, vh, head)
      const frame = Math.floor(now / (140 - agit * 85))
      // Most frames mid-section are identical; repaint only when an input of the image moved.
      const base = [Math.round(e.x * 2), Math.round(e.y * 2), Math.round(e.rx * 2), Math.round(e.ry * 2), Math.round(agit * 50), Math.round(alpha * 100), canvas.width, canvas.height, ink, Math.round(col?.left ?? 0), Math.round(col?.width ?? 0)].join()
      // While anything but the boil frame moves (pull-in, approach fade), half the points:
      // those phases repaint the whole tangle every frame. The settled frame repaints in full.
      const stride = base === lastBase ? 1 : 2
      lastBase = base
      const key = `${frame},${base},${stride}`
      if (key !== last) {
        clear()
        last = key
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        if (alpha > 0.005) {
          drawTangle(ctx, strokes, e, agit, frame, ink, alpha, lerp(1.4, 1.3, m), stride)
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
  }, [mode, layer, lines, meta])

  return (
    <section ref={sectionRef} className={`ms-voices ${mode === 'still' ? 'ms-still' : 'ms-motion'}`} style={{ '--ms-n': lines.length } as CSSProperties}>
      <div className="ms-stage">
        <div ref={figRef} className="ms-figure" role="img" aria-label={t('blog.meaning.figure')}>
          <svg viewBox="0 0 280 380" aria-hidden="true">
            <path ref={pathRef} d={FIGURE_PATH} />
          </svg>
          {mode === 'still' && <canvas ref={stillCanvas} aria-hidden="true" />}
        </div>
        <ol ref={listRef} className="ms-voice-list">
          {lines.map((line, i) => (
            <li key={i} data-side={line.side} style={{ '--ms-row': i + 1 } as CSSProperties}>
              {line.text}
              {mode === 'still' && sound && meta[i]?.audio && (
                <button type="button" className="ms-play" aria-label={t('blog.meaning.play')} onClick={() => playLine(i)}>
                  ▸
                </button>
              )}
            </li>
          ))}
        </ol>
        {hasAudio && (
          <button type="button" className="ms-sound" aria-pressed={sound} onClick={toggleSound}>
            {sound ? t('blog.meaning.soundOn') : t('blog.meaning.soundOff')}
          </button>
        )}
      </div>
    </section>
  )
}

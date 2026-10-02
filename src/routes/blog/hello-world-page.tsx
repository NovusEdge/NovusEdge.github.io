import { lazy, Suspense, useEffect, useRef, useState, type PointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { createTimeline } from 'animejs'
import { Meta } from '../../lib/meta'
import type { Post } from '../../lib/posts'
import { isMobile, prefersReducedMotion } from '../../lib/motion'
import { scrollOut, signal, smoothstep, type Stroke } from '../../lib/voyager'
import { VoyagerSound } from '../../lib/voyager-sound'
import { makeRig } from '../../components/voyager/rig'
import { TLink } from '../../components/page-transition'
import { PostSignoff } from '../../components/post-signoff'
import { useLocalePath } from '../../i18n/use-locale-path'

const RecordScene = lazy(() => import('../../components/voyager/record-scene'))

const PLAQUE_SOURCE = 'https://commons.wikimedia.org/wiki/File:Voyager_plaque.svg'
const GREETINGS_SOURCE = 'https://commons.wikimedia.org/wiki/Category:Greetings_messages_on_the_Voyager_Golden_Record'
const GIF = '/assets/gifs/helloworld.gif'
// Real greetings from the Golden Record (NASA, public domain via Wikimedia Commons). English
// plays when the heading resolves; each ping sends the next one out.
const GREETINGS = ['en', 'cs', 'nl', 'th', 'vi', 'nan'].map((k) => `/assets/voyager/greetings/${k}.mp3`)

// pending: server render and the first client frame, before we know what the browser can do.
type Mode = 'pending' | 'live' | 'still' | 'gif'

const hasWebGL = () => {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

// Seconds after the etching finishes: the signal trace runs, a vertical scan paints the
// greeting in as blocks, then the real heading fades up over them.
const SCAN_AT = 1.2
const SCAN_FOR = 1.8
const RESOLVE_FOR = 0.8

export function HelloWorldPage({ post, image }: { post: Post; image?: string | null }) {
  const { t } = useTranslation()
  const lp = useLocalePath()
  const [mode, setMode] = useState<Mode>('pending')
  const [strokes, setStrokes] = useState<Stroke[] | null>(null)
  const [running, setRunning] = useState(true)
  const runningRef = useRef(true)
  runningRef.current = running
  const [touch, setTouch] = useState(false)
  const rig = useRef(makeRig()).current
  const flightRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const waveRef = useRef<HTMLCanvasElement>(null)
  const pixelRef = useRef<HTMLCanvasElement>(null)
  const plateRef = useRef<HTMLParagraphElement>(null)
  const hintRef = useRef<HTMLParagraphElement>(null)
  const signalStart = useRef<number | null>(null)
  const burst = useRef(0)
  const sound = useRef<VoyagerSound | null>(null)
  const [soundOn, setSoundOn] = useState(false)
  const nextGreeting = useRef(1)
  const resolved = useRef(false)

  useEffect(() => {
    // Space is dark in either theme; borrowing the site's dark class restyles the nav and
    // sign-off to match. Only a class this page added is taken away again.
    const root = document.documentElement
    const added = !root.classList.contains('dark')
    root.classList.add('vg-space', 'dark')
    setTouch(matchMedia('(pointer: coarse)').matches)
    if (prefersReducedMotion()) setMode('still')
    else if (!hasWebGL()) setMode('gif')
    else setMode('live')
    return () => {
      root.classList.remove('vg-space')
      if (added) root.classList.remove('dark')
    }
  }, [])

  useEffect(() => {
    if (mode !== 'live') return
    let alive = true
    fetch('/assets/voyager/plaque-lines.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((s: Stroke[]) => alive && setStrokes(s))
      .catch(() => alive && setMode('gif'))
    return () => {
      alive = false
    }
  }, [mode])

  // The record tumbles in out of the dark, turns face-on, and the cover is etched.
  useEffect(() => {
    if (mode !== 'live' || !strokes) return
    const tl = createTimeline({ onComplete: () => (signalStart.current = performance.now()) })
    tl.add(rig.intro, { z: [-40, 0], duration: 2800, ease: 'outExpo' }, 0)
      .add(rig.intro, { tumble: [1, 0], duration: 3200, ease: 'outCubic' }, 0)
      .add(rig.intro, { draw: [0, 1], duration: 4600, ease: 'inOutSine' }, 2200)
    return () => void tl.pause()
  }, [mode, strokes, rig])

  // Scroll pulls the record away; the canvas sleeps once the flight has left the screen.
  useEffect(() => {
    const flight = flightRef.current
    if (mode !== 'live' || !flight) return
    const onScroll = () => {
      const r = flight.getBoundingClientRect()
      rig.scroll = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)))
    }
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    const io = new IntersectionObserver(([e]) => setRunning(e.isIntersecting))
    io.observe(flight)
    return () => {
      removeEventListener('scroll', onScroll)
      io.disconnect()
    }
  }, [mode, rig])

  // The overlay: signal trace, scan, heading, plate. Written straight to the DOM each frame.
  useEffect(() => {
    if (mode !== 'live') return
    let raf = 0
    let blocks: { x: number; y: number }[] | null = null
    let block = 6
    let lastNow = performance.now()
    let lastDraw = rig.intro.draw
    let lastT = -1
    const dpr = Math.min(devicePixelRatio || 1, 2)

    const buildBlocks = (cv: HTMLCanvasElement, h1: HTMLHeadingElement) => {
      const { width, height } = cv.getBoundingClientRect()
      const off = document.createElement('canvas')
      off.width = Math.ceil(width)
      off.height = Math.ceil(height)
      const o = off.getContext('2d', { willReadFrequently: true })!
      const cs = getComputedStyle(h1)
      o.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
      o.textAlign = 'center'
      o.textBaseline = 'middle'
      o.fillStyle = '#fff'
      o.fillText(h1.textContent ?? '', width / 2, height / 2)
      block = Math.max(4, Math.round(parseFloat(cs.fontSize) / 16))
      const data = o.getImageData(0, 0, off.width, off.height).data
      const out: { x: number; y: number }[] = []
      for (let y = 0; y < off.height; y += block)
        for (let x = 0; x < off.width; x += block) {
          const i = ((y + (block >> 1)) * off.width + x + (block >> 1)) * 4 + 3
          if (data[i] > 110) out.push({ x, y })
        }
      return out
    }

    // Canvas sizes come from a ResizeObserver, not a per-frame getBoundingClientRect,
    // which would force a layout every frame.
    const size = new Map<Element, { width: number; height: number }>()
    const ro = new ResizeObserver((es) => es.forEach((e) => size.set(e.target, e.contentRect)))
    if (waveRef.current) ro.observe(waveRef.current)
    if (pixelRef.current) ro.observe(pixelRef.current)
    let pixelsDone = false
    let waveBlank = false

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      // Scrolled past the flight: nothing here is on screen.
      if (!runningRef.current) {
        sound.current?.update({ drawRate: 0, spin: 0, scroll: 1, signal: 0 })
        return
      }
      const out = scrollOut(rig.scroll)
      const t = signalStart.current === null ? -1 : (now - signalStart.current) / 1000
      const wave = waveRef.current
      const pix = pixelRef.current
      const h1 = titleRef.current
      if (!wave || !pix || !h1) return

      const titleIn = smoothstep(SCAN_AT + SCAN_FOR, SCAN_AT + SCAN_FOR + RESOLVE_FOR, t)
      const snd = sound.current
      if (snd?.on) {
        const dt = Math.max(1e-3, (now - lastNow) / 1000)
        snd.update({ drawRate: (rig.intro.draw - lastDraw) / dt, spin: rig.spin, scroll: rig.scroll, signal: smoothstep(0, 0.8, t) })
        if (lastT < SCAN_AT && t >= SCAN_AT) snd.chirp()
      }
      if (!resolved.current && titleIn >= 1) {
        resolved.current = true
        snd?.greet(GREETINGS[0])
      }
      lastNow = now
      lastDraw = rig.intro.draw
      lastT = t
      h1.style.opacity = String(titleIn * out.title)
      if (plateRef.current) plateRef.current.style.opacity = String(out.plate)
      if (hintRef.current) hintRef.current.style.opacity = String(smoothstep(SCAN_AT + SCAN_FOR + RESOLVE_FOR, SCAN_AT + SCAN_FOR + RESOLVE_FOR + 1, t) * 0.7 * out.title)

      // The trace: speeds up and roughens while the record is spun, spikes on a ping.
      const wr = size.get(wave)
      if (!wr) return
      if (wave.width !== Math.round(wr.width * dpr)) {
        wave.width = Math.round(wr.width * dpr)
        wave.height = Math.round(wr.height * dpr)
      }
      const w = wave.getContext('2d')!
      const waveIn = smoothstep(0, 0.8, t) * out.title
      if (waveIn > 0 || !waveBlank) {
        w.setTransform(dpr, 0, 0, dpr, 0, 0)
        w.clearRect(0, 0, wr.width, wr.height)
        waveBlank = waveIn <= 0
      }
      if (waveIn > 0) {
        burst.current *= 0.94
        const speed = 1 + Math.min(6, Math.abs(rig.spin) * 1.5)
        const amp = (wr.height / 2 - 3) * (0.55 + burst.current)
        w.globalAlpha = waveIn
        w.strokeStyle = '#e9c46a'
        w.lineWidth = 1.4
        w.beginPath()
        const steps = Math.ceil(wr.width / 2)
        for (let i = 0; i <= steps; i++) {
          const x = i / steps
          const y = wr.height / 2 - signal(x, (t * speed) % 1000) * amp * (1 + burst.current * Math.sin(x * 40 + t * 20))
          if (i) w.lineTo(x * wr.width, y)
          else w.moveTo(0, y)
        }
        w.stroke()
      }

      // The scan: the greeting painted in as gold blocks behind a sweeping line, left to right.
      const pr = size.get(pix)
      if (!pr || pixelsDone) return
      if (pix.width !== Math.round(pr.width * dpr)) {
        pix.width = Math.round(pr.width * dpr)
        pix.height = Math.round(pr.height * dpr)
        blocks = null
      }
      const p = pix.getContext('2d')!
      p.setTransform(dpr, 0, 0, dpr, 0, 0)
      p.clearRect(0, 0, pr.width, pr.height)
      const sweep = smoothstep(SCAN_AT, SCAN_AT + SCAN_FOR, t)
      const fade = 1 - titleIn
      // Once the heading has resolved, the blocks are gone for good.
      pixelsDone = fade <= 0
      if (sweep > 0 && fade > 0) {
        blocks ??= buildBlocks(pix, h1)
        const sx = sweep * pr.width
        p.globalAlpha = fade * out.title
        p.fillStyle = '#e9c46a'
        for (const b of blocks) if (b.x < sx) p.fillRect(b.x, b.y, block - 1, block - 1)
        if (sweep < 1) {
          p.fillStyle = '#fff3cf'
          p.fillRect(sx, 0, 2, pr.height)
        }
      }
    }
    document.fonts.ready.then(() => (raf = requestAnimationFrame(tick)))
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [mode, rig])

  // Hovering tilts the record toward the cursor, dragging spins it, a click sends a ping.
  const drag = useRef<{ x: number; y: number; last: number; moved: boolean } | null>(null)
  const onPointerMove = (e: PointerEvent) => {
    const r = stageRef.current?.getBoundingClientRect()
    if (!r) return
    if (e.pointerType === 'mouse') {
      rig.pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1
      rig.pointer.y = ((e.clientY - r.top) / r.height) * 2 - 1
    }
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.last
    d.last = e.clientX
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) d.moved = true
    rig.spin = Math.max(-14, Math.min(14, rig.spin - dx * 0.05))
  }
  const onPointerDown = (e: PointerEvent) => (drag.current = { x: e.clientX, y: e.clientY, last: e.clientX, moved: false })
  const onPointerUp = () => {
    if (drag.current && !drag.current.moved) {
      rig.queued++
      burst.current = 0.9
      if (sound.current?.on) {
        sound.current.ping()
        // The ping goes out first; the greeting follows it into the dark.
        const src = GREETINGS[nextGreeting.current++ % GREETINGS.length]
        window.setTimeout(() => sound.current?.greet(src), 450)
      }
    }
    drag.current = null
  }

  const toggleSound = () => {
    sound.current ??= new VoyagerSound()
    if (sound.current.on) sound.current.stop()
    else {
      sound.current.start()
      // Turned on after the greeting already resolved: say hello now.
      if (resolved.current) sound.current.greet(GREETINGS[0])
    }
    setSoundOn(sound.current.on)
  }
  useEffect(() => () => sound.current?.stop(), [])

  const launched = t('blog.hello.plate', { date: post.date.slice(0, 10) })
  const live = mode === 'live'

  return (
    <div className="vg" lang={post.contentLocale}>
      <Meta title={post.title} description={post.description || post.title} image={image} />

      <section ref={flightRef} className={`vg-flight vg-mode-${mode}`}>
        <div
          ref={stageRef}
          className="vg-stage"
          onPointerMove={live ? onPointerMove : undefined}
          onPointerDown={live ? onPointerDown : undefined}
          onPointerUp={live ? onPointerUp : undefined}
          onPointerLeave={live ? () => ((drag.current = null), (rig.pointer.x = rig.pointer.y = 0)) : undefined}
        >
          {live && strokes && (
            <Suspense fallback={null}>
              <div className="vg-canvas" aria-hidden="true">
                <RecordScene rig={rig} strokes={strokes} mobile={isMobile()} running={running} />
              </div>
            </Suspense>
          )}
          {(mode === 'still' || mode === 'pending') && (
            <div className="vg-still" role="img" aria-label={t('blog.hello.figure')}>
              <img src="/assets/voyager/plaque.svg" alt="" />
            </div>
          )}
          {mode === 'gif' && <img className="vg-gif" src={GIF} alt={t('blog.hello.figure')} />}

          <div className="vg-signal">
            {live && <canvas ref={waveRef} className="vg-wave" aria-hidden="true" />}
            <div className="vg-title-box">
              {live && <canvas ref={pixelRef} className="vg-pixels" aria-hidden="true" />}
              <h1 ref={titleRef} className="vg-title">
                {post.title}
              </h1>
            </div>
            {live && (
              <p ref={hintRef} className="vg-hint" aria-hidden="true">
                {touch ? t('blog.hello.hintTouch') : t('blog.hello.hint')}
              </p>
            )}
          </div>
          {live && (
            <button
              type="button"
              className="vg-sound"
              aria-pressed={soundOn}
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onClick={toggleSound}
            >
              {soundOn ? t('blog.hello.soundOn') : t('blog.hello.soundOff')}
            </button>
          )}
          <p ref={plateRef} className="vg-plate">
            {launched}
          </p>
        </div>
      </section>

      <div className="vg-after">
        <TLink to={lp('/blog')} className="vg-back">
          {t('blog.backToBlog')}
        </TLink>
        <p className="vg-credit">
          {t('blog.hello.credit')}{' '}
          <a href={PLAQUE_SOURCE} target="_blank" rel="noreferrer noopener">
            Voyager_plaque.svg
          </a>{' '}
          {t('blog.hello.creditLicense')}{' '}
          <a href={GREETINGS_SOURCE} target="_blank" rel="noreferrer noopener">
            {t('blog.hello.creditVoices')}
          </a>
        </p>
        <PostSignoff variant={0} />
      </div>
    </div>
  )
}

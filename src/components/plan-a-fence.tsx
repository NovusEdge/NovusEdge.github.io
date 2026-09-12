import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../lib/motion'

gsap.registerPlugin(ScrollTrigger)

type Rgb = [number, number, number]

type Palette = { ink: Rgb; ox: Rgb; ground: Rgb; fence: Rgb; faded: Rgb; sweep: Rgb }

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

function readPalette(el: Element): Palette {
  const style = getComputedStyle(el)
  const read = (token: string): Rgb => {
    const rgb = new THREE.Color(style.getPropertyValue(token).trim()).getRGB({ r: 0, g: 0, b: 0 }, THREE.SRGBColorSpace)
    return [rgb.r, rgb.g, rgb.b]
  }
  const ink = read('--pa-ink')
  const ox = read('--pa-ox-mark')
  const ground = read('--pa-ground')
  return { ink, ox, ground, fence: mix(ink, ground, 0.3), faded: mix(ox, ground, 0.55), sweep: mix(ink, ground, 0.2) }
}

const INTERIOR = 220
const EXTERIOR = 320
const COUNT = INTERIOR + EXTERIOR
const COLS = 15

// World units. The camera frames [-1, 1] on both axes regardless of pixel size.
const FENCE = 0.36
const STROKE = 0.007
const MARK_R = 0.015
const DENSE_PITCH = 0.034
const WIDE_PITCH = (FENCE * 2 * 0.9) / (COLS - 1)
const EXT_CELLS = 22
const EXT_EXTENT = 0.96
const EXT_CLEAR = FENCE + 0.05

const DAMP = 0.08
const STAGGER = 0.25
const EPS = 0.001
const FENCE_DRAW_SECONDS = 1.2
const SWEEP_SECONDS = 1.6
const SWEEP_HOLD = 0.35
const SWEEP_FADE = 0.45

// Ids are slugified h2 text from plan-a-ai.md. Renaming a heading in the post
// silently drops its trigger, so both move together.
const SECTIONS: [id: string, state: number][] = [
  ['the-timing', 0],
  ['what-plan-a-says', 1],
  ['self-improvement-does-not-need-more-compute', 2],
  ['research-transparency-is-not-model-transparency', 3],
  ['when-is-research-finished', 4],
  ['what-verification-can-and-cannot-do', 5],
  ['mutually-assured-compute-destruction', 6],
  ['the-part-i-like', 7],
  ['their-open-questions', 8],
  ['two-layers', 8],
  ['what-i-think', 9],
]
const LAST_STATE = 9
const EXTERIOR_AT = [0, 0, 30, 70, 110, 160, 200, 230, 280, 320]
const CAPTIONS: Record<number, string> = {
  1: 'Every declared chip is counted.',
  2: 'Capability starts arriving without new chips. Nothing counts it.',
  3: 'The chips are still counted, but what runs on them is unknown.',
  4: 'Some work is declared but not yet published. No rule says when.',
  5: 'Inspectors check the counted chips. They cannot see anything else.',
  6: 'The uncounted part keeps growing.',
  7: 'The same chips, spread out and shared.',
  8: 'The uncounted part starts to organise itself.',
  9: 'The boundary still holds. It has stopped meaning anything.',
}

function captionFor(state: number, t: TFunction): string {
  for (let k = state; k >= 0; k--) if (CAPTIONS[k]) return t(`blog.planA.caption.${k}`)
  return ''
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

type Sim = {
  palette: Palette
  index: number
  applied: number
  snap: boolean
  visible: boolean
  invalidate: () => void
  pos: Float32Array
  goal: Float32Array
  target: Float32Array
  color: Float32Array
  goalColor: Float32Array
  targetColor: Float32Array
  scale: Float32Array
  goalScale: Float32Array
  targetScale: Float32Array
  hollowMix: Float32Array
  goalHollow: Float32Array
  targetHollow: Float32Array
  startAt: Float32Array
  delay: Float32Array
  pair: Float32Array
  dense: Float32Array
  wide: Float32Array
  scatter: Float32Array
  cells: Float32Array
  faded: Uint8Array
  sweep: { active: boolean; t: number; x: number; prevX: number }
  fence: { progress: number }
}

function lattice(pitch: number): Float32Array {
  const out = new Float32Array(INTERIOR * 2)
  const half = (COLS - 1) / 2
  for (let i = 0; i < INTERIOR; i++) {
    out[i * 2] = ((i % COLS) - half) * pitch
    out[i * 2 + 1] = (half - Math.floor(i / COLS)) * pitch
  }
  return out
}

function createSim(palette: Palette): Sim {
  const rand = mulberry32(20260709)
  const cell = (EXT_EXTENT * 2) / EXT_CELLS

  const candidates: { x: number; y: number; cx: number; cy: number }[] = []
  for (let r = 0; r < EXT_CELLS; r++) {
    for (let c = 0; c < EXT_CELLS; c++) {
      const cx = -EXT_EXTENT + (c + 0.5) * cell
      const cy = -EXT_EXTENT + (r + 0.5) * cell
      const x = cx + (rand() - 0.5) * cell * 0.76
      const y = cy + (rand() - 0.5) * cell * 0.76
      if (Math.abs(x) < EXT_CLEAR && Math.abs(y) < EXT_CLEAR) continue
      candidates.push({ x, y, cx: cx + (rand() - 0.5) * cell * 0.24, cy: cy + (rand() - 0.5) * cell * 0.24 })
    }
  }
  shuffle(candidates, rand)

  const scatter = new Float32Array(EXTERIOR * 2)
  const cells = new Float32Array(EXTERIOR * 2)
  for (let j = 0; j < EXTERIOR; j++) {
    const p = candidates[j]
    scatter[j * 2] = p.x
    scatter[j * 2 + 1] = p.y
    cells[j * 2] = p.cx
    cells[j * 2 + 1] = p.cy
  }

  const faded = new Uint8Array(INTERIOR)
  for (const i of shuffle([...Array(INTERIOR).keys()], rand).slice(0, INTERIOR / 4)) faded[i] = 1

  const delay = new Float32Array(COUNT)
  for (let i = 0; i < COUNT; i++) delay[i] = ((i * 0.6180339887) % 1) * STAGGER

  const pair = new Float32Array([-MARK_R * 1.4, 0, MARK_R * 1.4, 0])

  return {
    palette,
    index: 0,
    applied: -1,
    snap: true,
    visible: true,
    invalidate: () => {},
    pos: new Float32Array(COUNT * 2),
    goal: new Float32Array(COUNT * 2),
    target: new Float32Array(COUNT * 2),
    color: new Float32Array(COUNT * 3),
    goalColor: new Float32Array(COUNT * 3),
    targetColor: new Float32Array(COUNT * 3),
    scale: new Float32Array(COUNT),
    goalScale: new Float32Array(COUNT),
    targetScale: new Float32Array(COUNT),
    hollowMix: new Float32Array(COUNT),
    goalHollow: new Float32Array(COUNT),
    targetHollow: new Float32Array(COUNT),
    startAt: new Float32Array(COUNT).fill(-1),
    delay,
    pair,
    dense: lattice(DENSE_PITCH),
    wide: lattice(WIDE_PITCH),
    scatter,
    cells,
    faded,
    sweep: { active: false, t: 0, x: -FENCE, prevX: -FENCE },
    fence: { progress: 0 },
  }
}

function setTarget(sim: Sim, i: number, src: Float32Array, at: number, scale: number, hollow: number, color: Rgb) {
  sim.target[i * 2] = src[at * 2]
  sim.target[i * 2 + 1] = src[at * 2 + 1]
  sim.targetScale[i] = scale
  sim.targetHollow[i] = hollow
  sim.targetColor[i * 3] = color[0]
  sim.targetColor[i * 3 + 1] = color[1]
  sim.targetColor[i * 3 + 2] = color[2]
}

function adoptTarget(sim: Sim, i: number) {
  sim.goal[i * 2] = sim.target[i * 2]
  sim.goal[i * 2 + 1] = sim.target[i * 2 + 1]
  sim.goalScale[i] = sim.targetScale[i]
  sim.goalHollow[i] = sim.targetHollow[i]
  sim.goalColor[i * 3] = sim.targetColor[i * 3]
  sim.goalColor[i * 3 + 1] = sim.targetColor[i * 3 + 1]
  sim.goalColor[i * 3 + 2] = sim.targetColor[i * 3 + 2]
  // A hidden mark has no position worth travelling from, so it takes its new
  // place and colour outright and only its scale animates.
  if (sim.scale[i] < EPS) {
    sim.pos[i * 2] = sim.goal[i * 2]
    sim.pos[i * 2 + 1] = sim.goal[i * 2 + 1]
    sim.hollowMix[i] = sim.goalHollow[i]
    sim.color[i * 3] = sim.goalColor[i * 3]
    sim.color[i * 3 + 1] = sim.goalColor[i * 3 + 1]
    sim.color[i * 3 + 2] = sim.goalColor[i * 3 + 2]
  }
}

function applyState(sim: Sim, k: number, now: number) {
  for (let i = 0; i < INTERIOR; i++) {
    const shown = k > 0 || i < 2
    const src = k === 0 && i < 2 ? sim.pair : k >= 7 ? sim.wide : sim.dense
    setTarget(sim, i, src, i, shown ? 1 : 0, k >= 3 ? 1 : 0, k >= 4 && sim.faded[i] ? sim.palette.faded : sim.palette.ox)
  }
  for (let j = 0; j < EXTERIOR; j++) {
    const shown = j < EXTERIOR_AT[k]
    setTarget(sim, INTERIOR + j, k >= 8 ? sim.cells : sim.scatter, j, shown ? 1 : 0, 0, sim.palette.ink)
  }
  for (let i = 0; i < COUNT; i++) sim.startAt[i] = now + sim.delay[i]

  sim.sweep.active = k === 5
  sim.sweep.t = 0
  sim.sweep.x = sim.sweep.prevX = -FENCE
  sim.applied = k

  if (!sim.snap) return
  sim.snap = false
  for (let i = 0; i < COUNT; i++) {
    sim.startAt[i] = -1
    adoptTarget(sim, i)
    sim.pos[i * 2] = sim.goal[i * 2]
    sim.pos[i * 2 + 1] = sim.goal[i * 2 + 1]
    sim.scale[i] = sim.goalScale[i]
    sim.hollowMix[i] = sim.goalHollow[i]
    sim.color[i * 3] = sim.goalColor[i * 3]
    sim.color[i * 3 + 1] = sim.goalColor[i * 3 + 1]
    sim.color[i * 3 + 2] = sim.goalColor[i * 3 + 2]
  }
  sim.fence.progress = k >= 1 ? 1 : 0
  sim.sweep.active = false
}

type Props = { state: RefObject<Sim> }

// Four independent strips, one per side, in perimeter order. drawRange grows
// over the index buffer to draw the stroke; the vertex buffer is never
// rewritten after construction.
function fenceGeometry(): { geometry: THREE.BufferGeometry; quads: number } {
  const perSide = 24
  const half = FENCE + STROKE / 2
  const corners = [
    [-half, half],
    [half, half],
    [half, -half],
    [-half, -half],
  ]
  const positions: number[] = []
  const index: number[] = []
  for (let s = 0; s < 4; s++) {
    const [ax, ay] = corners[s]
    const [bx, by] = corners[(s + 1) % 4]
    const dx = bx - ax
    const dy = by - ay
    const len = Math.hypot(dx, dy)
    const nx = (-dy / len) * (STROKE / 2)
    const ny = (dx / len) * (STROKE / 2)
    const ex = (dx / len) * (STROKE / 2)
    const ey = (dy / len) * (STROKE / 2)
    const base = positions.length / 3
    for (let t = 0; t <= perSide; t++) {
      const u = t / perSide
      const px = ax + dx * u + (t === 0 ? -ex : t === perSide ? ex : 0)
      const py = ay + dy * u + (t === 0 ? -ey : t === perSide ? ey : 0)
      positions.push(px + nx, py + ny, 0, px - nx, py - ny, 0)
    }
    for (let t = 0; t < perSide; t++) {
      const a = base + t * 2
      index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(index)
  geometry.setDrawRange(0, 0)
  return { geometry, quads: perSide * 4 }
}

function Fence({ state }: Props) {
  const { geometry, quads } = useMemo(fenceGeometry, [])
  const material = useMemo(() => new THREE.MeshBasicMaterial(), [])
  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )

  // The draw range follows progress rather than the step, because a snap in
  // MarkField writes progress directly and runs after this callback.
  useFrame((r3f, delta) => {
    const sim = state.current
    if (!sim.visible) return
    material.color.setRGB(...sim.palette.fence, THREE.SRGBColorSpace)
    const goal = sim.index >= 1 ? 1 : 0
    const step = Math.min(delta, 0.05) / FENCE_DRAW_SECONDS
    const p = sim.fence.progress
    sim.fence.progress = goal > p ? Math.min(goal, p + step) : Math.max(goal, p - step)
    const count = Math.floor(sim.fence.progress * quads) * 6
    if (count !== geometry.drawRange.count) geometry.setDrawRange(0, count)
    if (sim.fence.progress !== goal) r3f.invalidate()
  })

  return <mesh geometry={geometry} material={material} frustumCulled={false} />
}

const tmpColor = new THREE.Color()
const tmpMatrix = new THREE.Matrix4()

function writeInstance(mesh: THREE.InstancedMesh, i: number, x: number, y: number, s: number) {
  tmpMatrix.set(s, 0, 0, x, 0, s, 0, y, 0, 0, 1, 0, 0, 0, 0, 1)
  mesh.setMatrixAt(i, tmpMatrix)
  mesh.setColorAt(i, tmpColor)
}

function MarkField({ state }: Props) {
  const filled = useRef<THREE.InstancedMesh>(null)
  const rings = useRef<THREE.InstancedMesh>(null)
  const invalidate = useThree((s) => s.invalidate)

  useEffect(() => {
    state.current.invalidate = invalidate
  }, [state, invalidate])

  useFrame((r3f, delta) => {
    const sim = state.current
    const a = filled.current
    const b = rings.current
    if (!sim.visible || !a || !b) return

    const now = r3f.clock.elapsedTime
    if (sim.index !== sim.applied) applyState(sim, sim.index, now)

    const k = 1 - Math.pow(1 - DAMP, Math.min(delta, 0.05) * 60)
    let busy = false

    for (let i = 0; i < COUNT; i++) {
      if (sim.startAt[i] >= 0) {
        if (now < sim.startAt[i]) busy = true
        else {
          sim.startAt[i] = -1
          adoptTarget(sim, i)
        }
      }

      const x2 = i * 2
      const x3 = i * 3
      const dx = sim.goal[x2] - sim.pos[x2]
      const dy = sim.goal[x2 + 1] - sim.pos[x2 + 1]
      const ds = sim.goalScale[i] - sim.scale[i]
      const dh = sim.goalHollow[i] - sim.hollowMix[i]
      const dr = sim.goalColor[x3] - sim.color[x3]
      const dg = sim.goalColor[x3 + 1] - sim.color[x3 + 1]
      const db = sim.goalColor[x3 + 2] - sim.color[x3 + 2]
      if (Math.max(Math.abs(dx), Math.abs(dy), Math.abs(ds), Math.abs(dh), Math.abs(dr), Math.abs(dg), Math.abs(db)) > EPS) {
        busy = true
        sim.pos[x2] += dx * k
        sim.pos[x2 + 1] += dy * k
        sim.scale[i] += ds * k
        sim.hollowMix[i] += dh * k
        sim.color[x3] += dr * k
        sim.color[x3 + 1] += dg * k
        sim.color[x3 + 2] += db * k
      }

      tmpColor.setRGB(sim.color[x3], sim.color[x3 + 1], sim.color[x3 + 2], THREE.SRGBColorSpace)
      writeInstance(a, i, sim.pos[x2], sim.pos[x2 + 1], sim.scale[i] * (1 - sim.hollowMix[i]))
      writeInstance(b, i, sim.pos[x2], sim.pos[x2 + 1], sim.scale[i] * sim.hollowMix[i])
    }

    a.instanceMatrix.needsUpdate = true
    b.instanceMatrix.needsUpdate = true
    if (a.instanceColor) a.instanceColor.needsUpdate = true
    if (b.instanceColor) b.instanceColor.needsUpdate = true

    if (busy) r3f.invalidate()
  })

  return (
    <>
      <instancedMesh ref={filled} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <circleGeometry args={[MARK_R, 12]} />
        <meshBasicMaterial />
      </instancedMesh>
      <instancedMesh ref={rings} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <ringGeometry args={[MARK_R * 0.45, MARK_R, 12]} />
        <meshBasicMaterial />
      </instancedMesh>
    </>
  )
}

function Sweep({ state }: Props) {
  const mesh = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>>(null)

  useFrame((r3f, delta) => {
    const sim = state.current
    const m = mesh.current
    if (!sim.visible || !m) return
    const sw = sim.sweep
    if (!sw.active) {
      m.visible = false
      return
    }

    sw.t += Math.min(delta, 0.05)
    const u = Math.min(sw.t / SWEEP_SECONDS, 1)
    sw.prevX = sw.x
    sw.x = -FENCE + FENCE * 2 * (0.5 - Math.cos(Math.PI * u) / 2)

    // Marks the line crossed this frame snap to full oxide and fill in; the
    // field's own damping brings them back to what they were.
    for (let i = 0; i < INTERIOR; i++) {
      const px = sim.pos[i * 2]
      if (sim.goalScale[i] > 0 && px > sw.prevX && px <= sw.x) {
        sim.color[i * 3] = sim.palette.ox[0]
        sim.color[i * 3 + 1] = sim.palette.ox[1]
        sim.color[i * 3 + 2] = sim.palette.ox[2]
        sim.hollowMix[i] = 0
      }
    }

    const fade = Math.max(0, (sw.t - SWEEP_SECONDS - SWEEP_HOLD) / SWEEP_FADE)
    if (fade >= 1) {
      sw.active = false
      m.visible = false
      r3f.invalidate()
      return
    }
    m.visible = true
    m.position.x = sw.x
    m.material.color.setRGB(...mix(sim.palette.sweep, sim.palette.ground, fade), THREE.SRGBColorSpace)
    r3f.invalidate()
  })

  return (
    <mesh ref={mesh} visible={false} scale={[STROKE * 0.8, FENCE * 2, 1]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial />
    </mesh>
  )
}

function stateAtScroll(): number {
  const line = window.innerHeight * 0.6
  let state = 0
  for (const [id, k] of SECTIONS) {
    const el = document.getElementById(id)
    if (el && el.getBoundingClientRect().top <= line) state = k
  }
  return state
}

function Figure({ palette }: { palette: Palette }) {
  const { t } = useTranslation()
  const sim = useRef<Sim>(null!)
  if (sim.current === null) sim.current = createSim(palette)
  const figure = useRef<HTMLElement>(null)
  const caption = useRef<HTMLElement>(null)
  const [reduced] = useState(prefersReducedMotion)

  useEffect(() => {
    sim.current.palette = palette
    sim.current.applied = -1
    sim.current.snap = true
    sim.current.invalidate()
  }, [palette])

  useEffect(() => {
    const el = figure.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      sim.current.visible = entry.isIntersecting
      if (entry.isIntersecting) sim.current.invalidate()
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useGSAP(
    () => {
      const cap = caption.current
      const initial = reduced ? LAST_STATE : stateAtScroll()
      sim.current.index = initial
      sim.current.snap = true
      if (cap) cap.textContent = captionFor(initial, t)
      if (reduced) return

      const show = (k: number) => {
        sim.current.index = k
        sim.current.invalidate()
        const text = captionFor(k, t)
        if (!cap || cap.textContent === text) return
        gsap.to(cap, {
          opacity: 0,
          duration: 0.2,
          overwrite: true,
          onComplete: () => {
            cap.textContent = text
            gsap.to(cap, { opacity: 1, duration: 0.2 })
          },
        })
      }

      SECTIONS.forEach(([id, k], n) => {
        const next = SECTIONS[n + 1]?.[0]
        ScrollTrigger.create({
          trigger: `#${id}`,
          start: 'top 60%',
          endTrigger: next ? `#${next}` : '.pa-body',
          end: next ? 'top 60%' : 'bottom 60%',
          onEnter: () => show(k),
          onEnterBack: () => show(k),
        })
      })
    },
    { dependencies: [reduced, t], revertOnUpdate: true },
  )

  return (
    <figure ref={figure} className="pa-fence">
      <p className="pa-fence-head">{t('blog.planA.counted')}</p>
      <div className="pa-fence-canvas" aria-hidden="true">
        <Canvas
          flat
          orthographic
          frameloop="demand"
          shadows={false}
          gl={{ antialias: true, alpha: true }}
          camera={{ manual: true, position: [0, 0, 10], left: -1, right: 1, top: 1, bottom: -1, near: 0.1, far: 100 }}
          onCreated={({ camera }) => camera.updateProjectionMatrix()}
        >
          <Fence state={sim} />
          <MarkField state={sim} />
          <Sweep state={sim} />
        </Canvas>
      </div>
      <figcaption ref={caption} />
      <ul className="pa-fence-legend">
        <li>
          <span className="pa-fence-swatch pa-fence-swatch-ox" aria-hidden="true" />
          {t('blog.planA.declared')}
        </li>
        <li>
          <span className="pa-fence-swatch pa-fence-swatch-ink" aria-hidden="true" />
          {t('blog.planA.uncounted')}
        </li>
      </ul>
      <p className="sr-only">
        {t('blog.planA.figureDescription')}
      </p>
    </figure>
  )
}

export function PlanAFence() {
  const [enabled, setEnabled] = useState(false)
  const [palette, setPalette] = useState<Palette | null>(null)

  useEffect(() => {
    const el = document.querySelector('.pa')
    if (!el) return
    const sync = () => setPalette(readPalette(el))
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // Read at mount rather than at render: the route is prerendered in Node,
  // and below 1700px no WebGL context should ever exist.
  useEffect(() => {
    const mq = matchMedia('(min-width: 1700px)')
    const sync = () => setEnabled(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return enabled && palette ? <Figure palette={palette} /> : null
}

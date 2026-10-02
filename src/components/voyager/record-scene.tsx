import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, Stars } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import * as THREE from 'three'
import { drawWindows, partialStroke, scrollOut, strokeLength, type Stroke } from '../../lib/voyager'
import type { Rig } from './rig'

const GOLD = '#f1cf85'
const ETCH = '#4a3510'
const GLOW = '#ffd27a'
const PING_LIFE = 2.6

// Draws the cover etching up to `draw` (0..1) into the albedo canvas, and only the
// strokes still being cut into the glow canvas, so the stylus tip blooms and cools.
function paint(albedo: HTMLCanvasElement, glow: HTMLCanvasElement, strokes: Stroke[], windows: [number, number][], draw: number) {
  const S = albedo.width
  const a = albedo.getContext('2d')!
  const g = glow.getContext('2d')!
  a.fillStyle = GOLD
  a.fillRect(0, 0, S, S)
  g.clearRect(0, 0, S, S)
  for (const ctx of [a, g]) {
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }
  a.strokeStyle = ETCH
  g.strokeStyle = GLOW
  const R = S / 2
  strokes.forEach(([w, flat], i) => {
    const [s, e] = windows[i]
    if (draw <= s) return
    const frac = (draw - s) / (e - s)
    const pts = partialStroke(flat, frac)
    if (pts.length < 4) return
    const path = new Path2D()
    path.moveTo(R + pts[0] * R, R + pts[1] * R)
    for (let k = 2; k < pts.length; k += 2) path.lineTo(R + pts[k] * R, R + pts[k + 1] * R)
    a.lineWidth = Math.max(1, w * R * 1.6)
    a.stroke(path)
    // Cooling: a stroke glows while it is cut and for a short while after.
    const heat = 1 - Math.min(1, Math.max(0, (draw - e) / 0.05))
    if (heat > 0 && draw < 1) {
      g.globalAlpha = heat
      g.lineWidth = Math.max(2, w * R * 4)
      g.stroke(path)
      g.globalAlpha = 1
    }
  })
}

function Record({ rig, strokes, size }: { rig: Rig; strokes: Stroke[]; size: number }) {
  const group = useRef<THREE.Group>(null)
  const { viewport, camera } = useThree()
  const windows = useMemo(() => drawWindows(strokes.map(([, f]) => strokeLength(f))), [strokes])
  const { albedo, glow, map, emissiveMap } = useMemo(() => {
    const albedo = document.createElement('canvas')
    const glow = document.createElement('canvas')
    albedo.width = albedo.height = glow.width = glow.height = size
    const map = new THREE.CanvasTexture(albedo)
    map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = 8
    const emissiveMap = new THREE.CanvasTexture(glow)
    return { albedo, glow, map, emissiveMap }
  }, [size])
  const painted = useRef(-1)
  useEffect(() => {
    // New canvases start blank, whatever the last frame painted.
    painted.current = -1
    return () => {
      map.dispose()
      emissiveMap.dispose()
    }
  }, [map, emissiveMap])
  const tilt = useRef({ x: 0, y: 0 })
  const angle = useRef(0)

  useFrame((_, dt) => {
    const d = Math.round(rig.intro.draw * 400) / 400
    if (d !== painted.current) {
      paint(albedo, glow, strokes, windows, d)
      map.needsUpdate = true
      emissiveMap.needsUpdate = true
      painted.current = d
    }
    const g = group.current
    if (!g) return
    const out = scrollOut(rig.scroll)
    // The disc fits the shorter side of the screen, raised a little to leave the lower third for the signal.
    const view = viewport.getCurrentViewport(camera, [0, 0, 0])
    const fit = Math.min(view.width * 0.4, view.height * 0.27)
    g.scale.setScalar(fit)
    g.position.set(out.x * view.width * 0.2, view.height * 0.12 + out.y * view.height * 0.2, rig.intro.z + out.z)
    rig.at = { x: g.position.x, y: g.position.y, z: g.position.z, s: fit }

    const ease = 1 - Math.pow(0.001, dt)
    tilt.current.x += (-rig.pointer.y * 0.28 - tilt.current.x) * ease
    tilt.current.y += (rig.pointer.x * 0.36 - tilt.current.y) * ease
    rig.spin *= Math.pow(0.35, dt)
    angle.current += (rig.spin + 0.04) * dt
    const t = rig.intro.tumble
    g.rotation.set(tilt.current.x + t * 2.3, tilt.current.y + t * 3.1, angle.current + t * 1.4)
  })

  return (
    <group ref={group}>
      <mesh>
        <circleGeometry args={[1, 128]} />
        <meshStandardMaterial
          map={map}
          bumpMap={map}
          bumpScale={-2}
          emissiveMap={emissiveMap}
          emissive={GLOW}
          emissiveIntensity={2.2}
          metalness={1}
          roughness={0.32}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.02]}>
        <cylinderGeometry args={[1, 1, 0.04, 128, 1, true]} />
        <meshStandardMaterial color="#b98b2e" metalness={1} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0, -0.04]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[1, 128]} />
        <meshStandardMaterial color="#8a6a26" metalness={1} roughness={0.4} />
      </mesh>
    </group>
  )
}

// Expanding rings sent from the record each time it is clicked.
function Pings({ rig }: { rig: Rig }) {
  const rings = useRef<THREE.Mesh[]>([])
  const clock = useThree((s) => s.clock)
  useFrame(() => {
    const now = clock.elapsedTime
    if (rig.queued) {
      rig.pings = [...rig.pings, now].slice(-rings.current.length)
      rig.queued = 0
    }
    rig.pings = rig.pings.filter((t) => now - t < PING_LIFE)
    rings.current.forEach((m, i) => {
      const born = rig.pings[i]
      if (born === undefined) {
        m.visible = false
        return
      }
      const k = (now - born) / PING_LIFE
      m.visible = true
      m.scale.setScalar(rig.at.s * (1.02 + k * k * 3.5))
      ;(m.material as THREE.MeshBasicMaterial).opacity = (1 - k) * (1 - k) * 0.7
      m.position.set(rig.at.x, rig.at.y, rig.at.z - k * 3)
    })
  })
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} ref={(m) => void (m && (rings.current[i] = m))} visible={false}>
          <ringGeometry args={[0.98, 1, 160]} />
          <meshBasicMaterial color={GLOW} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      ))}
    </>
  )
}

function Sky({ rig, count }: { rig: Rig; count: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (!ref.current) return
    ref.current.rotation.y += dt * 0.004
    // Scrolling away dollies through the stars a little, so the record reads as leaving.
    ref.current.position.z = scrollOut(rig.scroll).z * -0.12
  })
  return (
    <group ref={ref}>
      <Stars radius={90} depth={70} count={count} factor={3.2} saturation={0} fade speed={0.6} />
    </group>
  )
}

export default function RecordScene({ rig, strokes, mobile, running }: { rig: Rig; strokes: Stroke[]; mobile: boolean; running: boolean }) {
  return (
    <Canvas
      frameloop={running ? 'always' : 'never'}
      dpr={[1, mobile ? 1.5 : 2]}
      camera={{ position: [0, 0, 5], fov: 40, near: 0.1, far: 400 }}
      gl={{ antialias: !mobile, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#05070d']} />
      <ambientLight intensity={0.12} />
      {/* The distant sun. */}
      <directionalLight position={[-4, 3, 6]} intensity={2.6} color="#fff1d6" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="ring" intensity={2.4} color="#ffe2a8" position={[-3, 2, 4]} scale={3} />
        <Lightformer form="rect" intensity={1.2} color="#9fb4ff" position={[4, -2, 3]} scale={[3, 6, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#ffffff" position={[0, 5, -2]} scale={[8, 1, 1]} />
      </Environment>
      <Sky rig={rig} count={mobile ? 2500 : 6000} />
      <Record rig={rig} strokes={strokes} size={mobile ? 1024 : 2048} />
      <Pings rig={rig} />
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={0.75} luminanceThreshold={0.62} luminanceSmoothing={0.2} />
      </EffectComposer>
    </Canvas>
  )
}

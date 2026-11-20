import { useEffect, useRef } from 'react'
import { Camera, Geometry, Mesh, Program, Renderer, Transform } from 'ogl'
import { isMobile } from '../../lib/motion'
import { buildCloud } from './attractor'
import { TRACES } from './timeline-data'
import type { Scene } from './scene'

const VERTEX = /* glsl */ `
attribute vec3 position;
attribute vec4 meta;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec2 uG[${TRACES.length}];
uniform vec2 uOffset;
uniform float uTime;
uniform float uSize;
uniform float uGain;
varying vec3 vColor;

void main() {
  vec2 g = uG[int(meta.y + 0.5)];
  float d = g.x - meta.x;
  float vis = step(0.0, d) * step(0.0005, g.x);
  // the drawing end of a trajectory that is still being revealed
  float front = (1.0 - smoothstep(0.0, 0.07, d)) * (1.0 - step(0.999, g.x));
  // two pulses per trajectory, running the orbit at about one time unit a second
  float behind = fract((fract(uTime * 0.045 + meta.w) - meta.x) * 2.0);
  float pulse = exp(-behind * 16.0);
  float glow = 0.5 + 1.9 * pulse + 3.0 * front + 1.4 * g.y;
  vec3 teal = vec3(0.14, 0.95, 0.60);
  vec3 hot = vec3(1.0, 0.84, 0.46);
  vColor = mix(teal, hot, clamp(g.y * 0.9 + front, 0.0, 1.0)) * glow * meta.z * uGain * vis;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_Position.xy += uOffset * gl_Position.w;
  gl_PointSize = uSize * (1.0 + 0.8 * pulse + g.y) * (14.0 / -mv.z);
}
`

const FRAGMENT = /* glsl */ `
precision highp float;
varying vec3 vColor;
void main() {
  float a = smoothstep(0.5, 0.05, length(gl_PointCoord - 0.5));
  gl_FragColor = vec4(vColor * a, 1.0);
}
`

const TOTAL = TRACES.reduce((n, t) => n + t, 0)
const HALO_STRIDE = 6

export function AttractorStage({ scene }: { scene: Scene }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const mobile = isMobile()
    let renderer: Renderer
    try {
      renderer = new Renderer({ canvas, dpr: Math.min(devicePixelRatio, mobile ? 1.5 : 2), alpha: false, antialias: false, depth: false })
    } catch {
      // No WebGL: the page is charcoal with the same content and no figure.
      return
    }
    const gl = renderer.gl
    gl.clearColor(0.102, 0.102, 0.102, 1)

    // Phones get a third of the points, spaced wider along the same span of orbit.
    const cloud = mobile ? buildCloud(TRACES, 1400, 0.014) : buildCloud(TRACES, 4200, 0.005)
    const geometry = new Geometry(gl, {
      position: { size: 3, data: cloud.position },
      meta: { size: 4, data: cloud.meta },
    })
    // The glow is a second pass over every sixth point, drawn large and faint.
    const sparse = Math.floor(cloud.count / HALO_STRIDE)
    const haloPosition = new Float32Array(sparse * 3)
    const haloMeta = new Float32Array(sparse * 4)
    for (let i = 0; i < sparse; i++) {
      haloPosition.set(cloud.position.subarray(i * HALO_STRIDE * 3, i * HALO_STRIDE * 3 + 3), i * 3)
      haloMeta.set(cloud.meta.subarray(i * HALO_STRIDE * 4, i * HALO_STRIDE * 4 + 4), i * 4)
    }
    const haloGeometry = new Geometry(gl, { position: { size: 3, data: haloPosition }, meta: { size: 4, data: haloMeta } })
    // A plain array: ogl only resolves `uG[0]` to this uniform when Array.isArray(value).
    const uG: number[] = new Array(TRACES.length * 2).fill(0)
    const shared = { uG: { value: uG }, uOffset: { value: [0, 0] }, uTime: { value: 0 } }
    const make = () => {
      const p = new Program(gl, {
        vertex: VERTEX,
        fragment: FRAGMENT,
        uniforms: { ...shared, uSize: { value: 2 }, uGain: { value: 1 } },
        transparent: true,
        depthTest: false,
        depthWrite: false,
      })
      p.setBlendFunc(gl.ONE, gl.ONE)
      return p
    }
    const program = make()
    const haloProgram = make()
    const mesh = new Transform()
    new Mesh(gl, { mode: gl.POINTS, geometry: haloGeometry, program: haloProgram }).setParent(mesh)
    new Mesh(gl, { mode: gl.POINTS, geometry, program }).setParent(mesh)
    const camera = new Camera(gl, { fov: 35, near: 0.1, far: 60 })
    camera.position.z = 14

    let aspect = 1
    const size = () => {
      // The layer, not the canvas: ogl's constructor has already pinned the canvas to 300x150 inline.
      const w = canvas.parentElement!.clientWidth
      const h = canvas.parentElement!.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h)
      aspect = w / h
      camera.perspective({ aspect })
    }
    size()
    // Width only: the layer is 100lvh, and the mobile URL bar would otherwise resize it on every scroll.
    let lastW = innerWidth
    const onResize = () => {
      if (innerWidth === lastW) return
      lastW = innerWidth
      size()
      last = ''
    }
    addEventListener('resize', onResize)

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    const onMove = (e: PointerEvent) => {
      pointer.tx = e.clientX / innerWidth - 0.5
      pointer.ty = e.clientY / innerHeight - 0.5
    }
    if (!mobile && !scene.still) addEventListener('pointermove', onMove, { passive: true })

    // Fewer points over the same area need more light each to reach the same bloom.
    const base = 0.125 * Math.sqrt(222600 / cloud.count)
    let time = 0
    let then = performance.now()
    let last = ''
    let raf = 0
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, (now - then) / 1000)
      then = now
      time += dt * scene.flow
      pointer.x += (pointer.tx - pointer.x) * 0.04
      pointer.y += (pointer.ty - pointer.y) * 0.04

      let drawn = 0
      scene.groups.forEach((g, i) => {
        uG[i * 2] = g.reveal
        uG[i * 2 + 1] = g.heat
        drawn += g.reveal * TRACES[i]
      })
      // A held frame costs nothing: skip the draw until something the shader reads has changed.
      const key = `${time.toFixed(3)}|${uG.join()}|${scene.alpha.toFixed(3)}|${scene.zoom.toFixed(3)}|${scene.ox.toFixed(3)}|${scene.oy.toFixed(3)}|${scene.yaw.toFixed(3)}|${scene.pitch.toFixed(3)}|${(pointer.x * scene.flow).toFixed(3)}|${(pointer.y * scene.flow).toFixed(3)}`
      if (key === last) return
      last = key

      // One thread has to read as a line and 53 must not burn out, so per-point light falls as traces accumulate.
      const gain = base * scene.alpha * (1 + 4 * Math.pow(1 - drawn / TOTAL, 3))
      const px = (mobile ? 2.3 : 2.1) * renderer.dpr
      program.uniforms.uGain.value = gain
      program.uniforms.uSize.value = px
      haloProgram.uniforms.uGain.value = gain * 0.085
      haloProgram.uniforms.uSize.value = px * 9
      shared.uTime.value = time
      shared.uOffset.value = [scene.ox, scene.oy]
      const fit = Math.min(1, aspect * 1.2)
      mesh.scale.set(scene.zoom * fit)
      mesh.rotation.x = -0.95 + scene.pitch + pointer.y * 0.25 * scene.flow + Math.sin(time * 0.05) * 0.12
      mesh.rotation.y = scene.yaw + pointer.x * 0.35 * scene.flow + Math.sin(time * 0.07) * 0.4
      mesh.rotation.z = 0.55 + time * 0.02
      renderer.render({ scene: mesh, camera })
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('resize', onResize)
      removeEventListener('pointermove', onMove)
      // No loseContext here: StrictMode re-runs this effect on the same canvas, and a lost context stays lost.
      geometry.remove()
      haloGeometry.remove()
      program.remove()
      haloProgram.remove()
    }
  }, [scene])

  return (
    <div className="ml-stage" aria-hidden="true">
      <canvas ref={ref} />
    </div>
  )
}

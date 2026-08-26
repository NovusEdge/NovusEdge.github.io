import { useEffect, useRef, useState } from 'react'
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl'
import { TLink } from './page-transition'
import { ArrowRight } from './icons'
import { isMobile, prefersReducedMotion } from '../lib/motion'
import type { Post } from '../lib/posts'

const VERTEX = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`

// Port of ykob/sketch-threejs "distort": object.vs displaces sphere vertices by
// noise scaled by distort^2 + radius, posteffect.fs splits the channels
// horizontally by 300 * spring acceleration with a per-row simplex wobble.
// There is no mesh here, so the vertex displacement becomes a UV scale about
// centre driven by the same noise.
const FRAGMENT = `
precision highp float;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uCover;
uniform float uTime;
uniform float uRadius;
uniform float uDistort;
uniform float uAccel;
uniform float uGlitch;

varying vec2 vUv;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float random2(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec2 diffUv(vec2 uv, float v, float diff) {
  float wobble = snoise(vec2(gl_FragCoord.y + uTime) / 100.0);
  return uv + (vec2(v + wobble, 0.0) * diff + vec2(v * 1.1, 0.0)) / uResolution;
}

float randomNoise(vec2 p) {
  return (random2(p - vec2(sin(uTime))) * 2.0 - 1.0) * max(abs(uAccel), 0.02) * 0.12;
}

void main() {
  float t = uTime / 1000.0;
  vec2 centred = (vUv - 0.5) * uCover;

  float n = snoise(vUv * 1.8 + vec2(t * 40.0)) * 0.7
          + snoise(vUv * 4.5 - vec2(t * 26.0)) * 0.3;
  float scale = n * pow(uDistort, 2.0) * 0.05 + uRadius;
  vec2 uv = centred / max(scale, 0.05) + 0.5;

  // The sphere's vertex displacement has no 2D counterpart in the scale term
  // alone; this is the part that actually reads as liquid on a flat image.
  vec2 warp = vec2(
    snoise(vUv * 2.2 + vec2(t * 30.0, 0.0)),
    snoise(vUv * 2.2 + vec2(0.0, t * 22.0) + 31.4)
  );
  uv += warp * (0.0018 + pow(uDistort, 2.0) * 0.007);

  // Burst glitch: tear the image into horizontal bands and slide a random
  // subset of them sideways. The seed only changes every ~12 frames so a band
  // holds its offset long enough to read as a tear.
  float band = floor(vUv.y * 13.0);
  float seed = floor(uTime * 0.08);
  float pick = random2(vec2(band, seed));
  float shift = random2(vec2(band * 1.7, seed + 3.0));
  float torn = step(0.82, pick) * uGlitch;
  uv.x += (shift - 0.5) * 0.012 * torn;

  float diff = 7.0 * abs(uAccel) + 0.08 + 6.0 * torn;
  vec2 uvR = diffUv(uv, 0.0, diff);
  vec2 uvG = diffUv(uv, 1.0, diff);
  vec2 uvB = diffUv(uv, -1.0, diff);

  float r = texture2D(uTexture, uvR).r + randomNoise(uvR);
  float g = texture2D(uTexture, uvG).g + randomNoise(uvG);
  float b = texture2D(uTexture, uvB).b + randomNoise(uvB);

  float blown = step(0.93, shift) * torn;
  vec3 rgb = vec3(r, g, b) + vec3(0.0, 0.12, 0.18) * blown;
  gl_FragColor = vec4(rgb, 1.0);
}
`

type Vec2 = { x: number; y: number }

// Port of ykob's old/Force2. acceleration is deliberately never zeroed between
// frames; that carry-over is what gives the spring its lag.
class Force2 {
  velocity: Vec2 = { x: 0, y: 0 }
  acceleration: Vec2 = { x: 0, y: 0 }
  anchor: Vec2 = { x: 0, y: 0 }
  k = 0.045
  d = 0.16

  applyHook(restLength: number, k: number) {
    let fx = this.velocity.x - this.anchor.x
    let fy = this.velocity.y - this.anchor.y
    const len = Math.hypot(fx, fy)
    if (len === 0) return
    const distance = len - restLength
    fx = (fx / len) * -k * distance
    fy = (fy / len) * -k * distance
    this.acceleration.x += fx
    this.acceleration.y += fy
  }

  applyDrag(value: number) {
    const len = Math.hypot(this.acceleration.x, this.acceleration.y)
    if (len === 0) return
    this.acceleration.x += (-this.acceleration.x / len) * len * value
    this.acceleration.y += (-this.acceleration.y / len) * len * value
  }

  updateVelocity() {
    this.velocity.x += this.acceleration.x
    this.velocity.y += this.acceleration.y
  }
}

const randomInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min))

function DistortCanvas({
  src,
  active,
  onGlitch,
}: {
  src: string
  active: boolean
  onGlitch?: (on: boolean) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const forceRef = useRef(new Force2())
  const timeUnitRef = useRef(1)
  const activeRef = useRef(active)
  activeRef.current = active

  // Each pointer entry winds the spring one notch, matching the sketch's
  // click ratchet. The image stays a link, so the wind happens on hover.
  useEffect(() => {
    if (!active) return
    const force = forceRef.current
    if (force.anchor.x < 3) {
      force.k += 0.005
      force.d -= 0.02
      force.anchor.x += 0.8
      timeUnitRef.current += 0.4
    } else {
      force.k = 0.05
      force.d = 0.16
      force.anchor.x = 1.0
      timeUnitRef.current = 1
    }
    return () => {
      force.anchor.x = 1.0
    }
  }, [active])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const force = forceRef.current
    force.anchor.x = 1
    force.velocity.x = 1

    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: false })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 1)

    const texture = new Texture(gl, {
      generateMipmaps: false,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE,
    })

    const program = new Program(gl, {
      vertex: VERTEX,
      fragment: FRAGMENT,
      uniforms: {
        uTexture: { value: texture },
        uResolution: { value: [1, 1] },
        uCover: { value: [1, 1] },
        uTime: { value: 0 },
        uRadius: { value: 1 },
        uDistort: { value: 0.4 },
        uAccel: { value: 0 },
        uGlitch: { value: 0 },
      },
    })
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })
    container.appendChild(gl.canvas)

    let imageAspect = 1
    const scaled = document.createElement('canvas')
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      imageAspect = image.naturalWidth / image.naturalHeight
      resize()
    }
    image.src = src

    // The source is ~1200px of fine ink strokes drawn into a 440px canvas.
    // Sampling that down in the shader aliases hard, and a sub-pixel channel
    // offset then lands on different strokes, which reads as rainbow fringing
    // instead of chromatic aberration. Pre-scale on the 2D context instead.
    function uploadScaled(w: number, h: number) {
      if (!image.naturalWidth) return
      const target = Math.max(2, Math.round(h * 1.4))
      scaled.width = Math.round(target * imageAspect)
      scaled.height = target
      const ctx = scaled.getContext('2d')
      if (!ctx) return
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(image, 0, 0, scaled.width, scaled.height)
      texture.image = scaled
      texture.needsUpdate = true
    }

    function resize() {
      const { clientWidth: w, clientHeight: h } = container!
      if (!w || !h) return
      renderer.setSize(w, h)
      program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height]
      const ratio = w / h / imageAspect
      program.uniforms.uCover.value = ratio > 1 ? [1, 1 / ratio] : [ratio, 1]
      uploadScaled(gl.canvas.width, gl.canvas.height)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(container)
    resize()

    let frame = 0
    let tick = 0
    let visible = true
    let burstFrames = 0
    let nextBurst = randomInt(60, 180)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    io.observe(container)

    const update = () => {
      frame = requestAnimationFrame(update)
      if (!visible) return

      tick++
      // The sketch keeps the spring alive by being clicked. Nothing clicks this
      // card, so drive it: two detuned sines never line up, so the split never
      // damps to a still frame.
      const drive = activeRef.current ? 0.009 : 0.0022
      force.acceleration.x += (Math.sin(tick * 0.071) + Math.sin(tick * 0.017)) * drive

      force.applyHook(0, force.k)
      force.applyDrag(force.d)
      force.updateVelocity()

      program.uniforms.uTime.value += timeUnitRef.current
      // Force2 never zeroes acceleration, and the per-frame drive above feeds
      // it faster than applyDrag bleeds it off, so both uniforms need a ceiling
      // or the channel split swallows the image.
      // The sketch feeds spring velocity into the sphere's radius. Here that
      // reads as the card zooming on hover, so the framing stays pinned and
      // only the warp and the split respond.
      program.uniforms.uDistort.value = Math.min(force.velocity.x / 2 - 0.1, 0.55)
      program.uniforms.uAccel.value = Math.min(Math.hypot(force.acceleration.x, force.acceleration.y), 0.035)

      if (burstFrames > 0) {
        burstFrames--
        if (burstFrames === 0) {
          program.uniforms.uGlitch.value = 0
          onGlitch?.(false)
          nextBurst = randomInt(activeRef.current ? 25 : 90, activeRef.current ? 110 : 300)
        }
      } else if (--nextBurst <= 0) {
        burstFrames = randomInt(3, activeRef.current ? 16 : 9)
        program.uniforms.uGlitch.value = 1
        onGlitch?.(true)
      }

      renderer.render({ scene: mesh })
    }
    frame = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      io.disconnect()
      image.onload = null
      container.removeChild(gl.canvas)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [src])

  return <div ref={containerRef} className="absolute inset-0 [&>canvas]:h-full [&>canvas]:w-full" />
}

// feDisplacementMap takes its scale as an SVG attribute, not a CSS property, so
// the resting and hover strengths have to be two separate filters.
function WarpFilters() {
  return (
    <svg aria-hidden className="pointer-events-none absolute h-0 w-0">
      <defs>
        {[
          { id: 'attrition-warp', scale: 1 },
          { id: 'attrition-warp-hot', scale: 3.5 },
        ].map(({ id, scale }) => (
          <filter key={id} id={id} x="-25%" y="-25%" width="150%" height="150%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.045" numOctaves="2" seed="7" result="noise">
              <animate
                attributeName="baseFrequency"
                dur="9s"
                values="0.008 0.045;0.021 0.095;0.008 0.045"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={scale} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        ))}
      </defs>
    </svg>
  )
}

// The description loses focus as it runs, and refocuses left to right on hover.
function FadingText({ text, revealed }: { text: string; revealed: boolean }) {
  const words = text.split(' ')
  return (
    <span>
      {words.map((word, i) => {
        const decay = words.length > 1 ? i / (words.length - 1) : 0
        return (
          <span
            key={i}
            className="mr-[0.25em] inline-block transition-all duration-500 ease-out"
            style={{
              filter: revealed ? 'blur(0px)' : `blur(${decay * 2.6}px)`,
              opacity: revealed ? 1 : 1 - decay * 0.72,
              transitionDelay: revealed ? `${i * 45}ms` : '0ms',
            }}
          >
            {word}
          </span>
        )
      })}
    </span>
  )
}

type Props = {
  post: Post
  img: string
  dayOf: (date: string) => string
  monthOf: (date: string) => string
}

export function AttritionCard({ post, img, dayOf, monthOf }: Props) {
  const [hovered, setHovered] = useState(false)
  const [shaded, setShaded] = useState(false)
  // setState identity is stable, so the canvas can hold this across its lifetime.
  const [glitching, setGlitching] = useState(false)

  useEffect(() => {
    setShaded(!prefersReducedMotion() && !isMobile())
  }, [])

  return (
    <li
      data-post
      className="group grid gap-x-6 gap-y-4 md:grid-cols-12 md:items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div data-col className="md:col-span-2 md:self-start">
        <time dateTime={post.date} className="flex items-baseline gap-2.5 md:flex-col md:gap-1.5">
          <span className="font-display text-3xl font-black leading-none tracking-tight text-charcoal/90 transition-colors duration-200 group-hover:text-cyan-400 dark:text-bone/90">
            {dayOf(post.date)}
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-charcoal/60 dark:text-bone/60">
            {monthOf(post.date)}
          </span>
        </time>
      </div>

      <div data-col className="md:col-span-4 order-2">
        <TLink to={`/blog/${post.slug}`} className="block">
          <div
            data-thumb
            className="relative overflow-hidden rounded-lg border border-charcoal/10 dark:border-bone/10 bg-black aspect-[4/5] w-full max-w-[220px] shadow-md transition-all duration-300 group-hover:border-cyan-400/40 group-hover:shadow-cyan-400/20 group-hover:shadow-lg"
          >
            {shaded ? (
              <DistortCanvas src={img} active={hovered} onGlitch={setGlitching} />
            ) : (
              <img src={img} alt="" className="h-full w-full object-cover" />
            )}
          </div>
        </TLink>
      </div>

      <div data-col className="md:col-span-6 flex flex-col justify-center order-3">
        {shaded && <WarpFilters />}
        <TLink
          to={`/blog/${post.slug}`}
          className="font-display text-2xl font-bold leading-snug text-charcoal transition-colors duration-200 group-hover:text-cyan-400 dark:text-bone md:text-3xl"
          style={
            shaded
              ? {
                  filter: `url(#attrition-warp${hovered ? '-hot' : ''})`,
                  textShadow: glitching
                    ? '0.028em 0 rgba(34,211,238,0.5), -0.028em 0 rgba(244,63,94,0.45)'
                    : hovered
                      ? '0.012em 0 rgba(34,211,238,0.35), -0.012em 0 rgba(244,63,94,0.3)'
                      : '0.005em 0 rgba(34,211,238,0.22), -0.005em 0 rgba(244,63,94,0.2)',
                  transform: glitching ? 'translateX(-0.006em) skewX(-0.4deg)' : 'none',
                  transition: glitching ? 'none' : 'text-shadow 200ms, transform 200ms',
                }
              : undefined
          }
        >
          {post.title}
        </TLink>
        {post.description && (
          <p
            className="mt-3 text-sm font-medium leading-relaxed text-charcoal/75 dark:text-bone/75"
            style={shaded ? { filter: 'url(#attrition-warp)' } : undefined}
          >
            <FadingText text={post.description} revealed={hovered} />
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          {post.tags.map((t) => (
            <span
              key={t}
              className="font-mono text-[10px] font-medium uppercase tracking-wider text-charcoal/65 dark:text-bone/65 border border-charcoal/15 rounded px-1.5 py-0.5 dark:border-bone/15 transition-colors group-hover:border-cyan-400/30 group-hover:text-cyan-400/80"
            >
              #{t}
            </span>
          ))}
          <ArrowRight className="ml-auto h-4 w-4 shrink-0 -translate-x-1 text-cyan-400 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
        </div>
      </div>
    </li>
  )
}

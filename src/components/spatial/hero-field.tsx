import { useEffect, useRef, type CSSProperties } from 'react'

// The hero's floor grid, carried on past its drawn edge as a tick at each crossing, on the same
// isometric ground plane. The ticks shorten and fade with distance from the house, and a ring
// travels outward through them.
// One full-canvas fragment shader, drawn at 30 fps and only while the hero's own loop runs.

const VERT = 'attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }'

// u_view is the SVG's box inside the canvas (x, y, width, height in canvas pixels, y down).
// 440x360 is the hero's viewBox, (190, 170) its origin and 34 its unit: the constants in hero.tsx.
// The projection inverted here is kit.tsx's iso() at z = 0.
const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform vec4 u_view;
uniform float u_time;
uniform vec3 u_ink;
uniform vec3 u_gold;

void main() {
  vec2 px = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y);
  vec2 s = (px - u_view.xy) / u_view.zw * vec2(440.0, 360.0) - vec2(190.0, 170.0);
  float a = s.x / (34.0 * 0.866);
  float b = s.y / (34.0 * 0.5);
  vec2 g = vec2(a + b, b - a) * 0.5;

  // The drawn grid's lines cross at half-integers, so that is where the dots sit.
  vec2 cell = floor(g) + 0.5;
  vec2 q = abs(g - cell);
  // Distance from the house's middle, per cell, so a whole tick shares one size.
  float r = length(cell - vec2(2.0, 1.5));
  // The drawn grid covers x -1.5..5.5 and y -2.5..4.5. No ticks inside it.
  float outside = step(3.6, max(abs(cell.x - 2.0), abs(cell.y - 1.0)));

  // Squared by hand: pow() of a negative base is undefined in GLSL and came out as NaN.
  float off = (r - mod(u_time * 1.1, 13.0)) / 0.9;
  float ring = exp(-off * off);
  // Each crossing is a tick: a short piece of both grid lines. Under the ring the arms reach the
  // cell's edge, so the grid joins up for a moment where the ring passes.
  float arm = min(0.5, mix(0.2, 0.07, smoothstep(4.0, 10.0, r)) + 0.34 * ring);
  // One canvas pixel in ground units, which is also the half-width of a line.
  float px1 = 440.0 / (u_view.z * 34.0);
  float along = 1.0 - smoothstep(arm - px1, arm, max(q.x, q.y));
  float across = 1.0 - smoothstep(px1 * 0.6, px1 * 1.6, min(q.x, q.y));
  float tick = along * across;

  vec2 uv = px / u_res;
  float edge = smoothstep(0.0, 0.14, min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y)));
  float alpha = tick * outside * edge * (1.0 - smoothstep(5.0, 10.5, r)) * (0.3 + 0.24 * ring);
  gl_FragColor = vec4(mix(u_ink, u_gold, ring * 0.6) * alpha, alpha);
}
`

const FRAME_MS = 33
// The still a reader with reduced motion gets: the ring part-way out, where it shows.
const STILL = 6.2

const rgb = (css: string) => (css.match(/[\d.]+/g) ?? ['0', '0', '0']).slice(0, 3).map((n) => Number(n) / 255)

export function HeroField({ running }: { running: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const run = useRef<(on: boolean) => void>(() => {})

  useEffect(() => {
    const el = canvas.current!
    const svg = el.parentElement?.querySelector('svg')
    // No WebGL: the canvas stays empty and the hero is the drawing it was without this.
    const gl = el.getContext('webgl', { antialias: false, depth: false, stencil: false, powerPreference: 'low-power' })
    if (!gl || !svg) return

    const program = gl.createProgram()!
    for (const [type, source] of [
      [gl.VERTEX_SHADER, VERT],
      [gl.FRAGMENT_SHADER, FRAG],
    ] as const) {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      gl.attachShader(program, shader)
    }
    gl.bindAttribLocation(program, 0, 'p')
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    const uniform = (name: string) => gl.getUniformLocation(program, name)
    const [uRes, uView, uTime, uInk, uGold] = ['u_res', 'u_view', 'u_time', 'u_ink', 'u_gold'].map(uniform)

    let time = STILL
    let last = 0
    let raf = 0
    let lost = false

    const draw = () => {
      if (lost) return
      gl.uniform1f(uTime, time)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    // The canvas's `color` and `outline-color` carry the ink and gold tokens, so the theme reaches the shader.
    const colours = () => {
      const style = getComputedStyle(el)
      gl.uniform3fv(uInk, rgb(style.color))
      gl.uniform3fv(uGold, rgb(style.outlineColor))
    }
    const size = () => {
      const box = el.getBoundingClientRect()
      const art = svg.getBoundingClientRect()
      if (!box.width || !box.height) return
      // 1.5 is enough for soft dots, and keeps a retina phone from shading four times the pixels.
      const scale = Math.min(devicePixelRatio, 1.5)
      el.width = Math.round(box.width * scale)
      el.height = Math.round(box.height * scale)
      gl.viewport(0, 0, el.width, el.height)
      gl.uniform2f(uRes, el.width, el.height)
      gl.uniform4f(uView, (art.left - box.left) * scale, (art.top - box.top) * scale, art.width * scale, art.height * scale)
      draw()
    }
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (now - last < FRAME_MS) return
      // A long gap is a hidden tab coming back, not elapsed animation.
      time += Math.min(now - last, 100) / 1000
      last = now
      draw()
    }
    run.current = (on) => {
      cancelAnimationFrame(raf)
      raf = 0
      if (on && !lost) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }

    colours()
    size()
    const resize = new ResizeObserver(size)
    resize.observe(el)
    const theme = new MutationObserver(() => {
      colours()
      draw()
    })
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    // ponytail: a lost context stays lost until reload; the hero reads fine without the field.
    // Hidden, because Chrome paints a canvas whose context is lost as an opaque white box.
    const onLost = () => {
      lost = true
      cancelAnimationFrame(raf)
      el.style.visibility = 'hidden'
    }
    el.addEventListener('webglcontextlost', onLost)

    return () => {
      cancelAnimationFrame(raf)
      run.current = () => {}
      resize.disconnect()
      theme.disconnect()
      el.removeEventListener('webglcontextlost', onLost)
      // Not WEBGL_lose_context: getContext hands the same context back to a remount of this canvas
      // (StrictMode, a hot reload), and a lost one draws nothing.
      gl.deleteProgram(program)
    }
  }, [])

  useEffect(() => {
    run.current(running)
  }, [running])

  return <canvas ref={canvas} aria-hidden="true" data-depth style={{ '--d': 3 } as CSSProperties} className="sh-field" />
}

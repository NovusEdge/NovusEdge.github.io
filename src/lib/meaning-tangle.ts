export type Pt = [number, number]
export type Ellipse = { x: number; y: number; rx: number; ry: number }
export type TangleCtx = Pick<CanvasRenderingContext2D, 'save' | 'restore' | 'beginPath' | 'moveTo' | 'quadraticCurveTo' | 'stroke'> & {
  strokeStyle: string | CanvasGradient | CanvasPattern
  globalAlpha: number
  lineWidth: number
  lineCap: CanvasLineCap
  lineJoin: CanvasLineJoin
}

/** The figure's head in its own 280x380 drawing box. */
export const HEAD: Ellipse = { x: 140, y: 140, rx: 62, ry: 78 }

export function rng(seed: number) {
  let s = seed >>> 0
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296
}

// Random walks that steer back toward the centre at the rim, so the tangle
// fills whatever ellipse it is scaled into.
export function makeStrokes(n: number, pts: number, seed: number): Pt[][] {
  const r = rng(seed)
  const strokes: Pt[][] = []
  for (let k = 0; k < n; k++) {
    const a = r() * Math.PI * 2
    const rad = Math.sqrt(r()) * 0.85
    let x = Math.cos(a) * rad
    let y = Math.sin(a) * rad
    let ang = r() * Math.PI * 2
    const turn = 0.6 + r() * 1.4
    const p: Pt[] = []
    for (let i = 0; i < pts; i++) {
      ang += (r() - 0.5) * turn
      if (Math.hypot(x, y) > 0.86) {
        const diff = ((Math.atan2(-y, -x) - ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI
        ang += diff * 0.5
      }
      x += Math.cos(ang) * 0.03
      y += Math.sin(ang) * 0.03
      p.push([x, y])
    }
    strokes.push(p)
  }
  return strokes
}

// A new frame value re-rolls the jitter; changing it a few times a second is the boil.
// Line weight, jitter and stroke count follow the ellipse so a small head is not
// a solid blob; k is 1 at the head's drawing size and clamps for the full screen.
export function drawTangle(ctx: TangleCtx, strokes: Pt[][], e: Ellipse, agit: number, frame: number, color: string, alpha: number, lineWidth: number, stride = 1) {
  const a = Math.min(1, Math.max(0, agit))
  const k = Math.min(1.5, Math.max(0.5, Math.min(e.rx, e.ry) / 62))
  const count = Math.round(strokes.length * (0.25 + 0.75 * a) * Math.min(1, k))
  const amp = (0.5 + a * 2.2) * k
  const r = rng(frame * 977 + 13)
  ctx.save()
  ctx.strokeStyle = color
  ctx.globalAlpha = alpha
  ctx.lineWidth = lineWidth * k
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (let k = 0; k < count; k++) {
    const s = strokes[k]
    const len = Math.floor(s.length * (0.4 + 0.6 * a))
    ctx.beginPath()
    let px = 0
    let py = 0
    for (let i = 0; i < len; i += stride) {
      const X = e.x + s[i][0] * e.rx + (r() - 0.5) * amp
      const Y = e.y + s[i][1] * e.ry + (r() - 0.5) * amp
      if (i === 0) ctx.moveTo(X, Y)
      else ctx.quadraticCurveTo(px, py, (px + X) / 2, (py + Y) / 2)
      px = X
      py = Y
    }
    ctx.stroke()
  }
  ctx.restore()
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function smooth(a: number, b: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export function sectionProgress(top: number, height: number, vh: number) {
  return Math.max(0, Math.min(1, -top / (height - vh)))
}

export function stagePhase(q: number, count: number) {
  const m = smooth(0, 0.16, q) * (1 - smooth(0.88, 1, q))
  const shown = Math.min(count, Math.floor(smooth(0.16, 0.86, q) * (count + 0.999)))
  return { m, shown }
}

export function presence(top: number, bottom: number, vh: number) {
  return smooth(1.3 * vh, 0, top) * smooth(0, 0.9 * vh, bottom)
}

export function ellipseAt(m: number, vw: number, vh: number, head: Ellipse): Ellipse {
  const R = Math.hypot(vw, vh) * 0.62
  return { x: lerp(vw / 2, head.x, m), y: lerp(vh / 2, head.y, m), rx: lerp(R, head.rx, m), ry: lerp(R, head.ry, m) }
}

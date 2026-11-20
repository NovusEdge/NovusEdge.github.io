// Heights of the first ten non-trivial zeros of the zeta function, to four places.
export const ZEROS = [14.1347, 21.022, 25.0109, 30.4249, 32.9351, 37.5862, 40.9187, 43.3271, 48.0052, 49.7738] as const

// Share of zeros proven to lie on the critical line. The first two are the August row of the
// timeline; the last is Friday's claim, which is what the pending pill is for.
export const ON_LINE = [
  { share: 41.6, label: 'before August' },
  { share: 67.25, label: 'August, Claude' },
  { share: 100, label: '20 November, claimed' },
] as const

// Page counts as the post gives them. One pixel per page in the figure.
export const PAGES = [
  { pages: 4, what: 'Remark, the announcement' },
  { pages: 79, what: 'The Navier–Stokes paper' },
  { pages: 250_000, what: 'Claude’s “book” of the Riemann proof', more: true },
] as const

// The archive, from the mirror's verification notes (github.com/Deicyde/riemann-hypothesis).
export const ARCHIVE = [
  ['tarball parts', '14'],
  ['joined size', '239 MB'],
  ['.lean files', '175,187'],
  ['lines of Lean', '17,374,215'],
  ['papers', '0'],
] as const

const path = (points: [number, number][]) => points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('')

// Exponent of the running time against n, both scaled to 0..1. Shapes only: brute force is the
// diagonal, ETH's floor a line of slope ETH_C, and a 2^o(n) algorithm any curve that ends up
// under every such line.
export const ETH_C = 0.5
export const subExponent = (x: number) => 0.4 * Math.pow(x, 0.45)
// Where the curve goes under ETH's floor: 0.4·x^0.45 = ETH_C·x.
export const ETH_CROSS = Math.pow(0.4 / ETH_C, 1 / 0.55)

export function plot(fn: (x: number) => number, from: number, to: number, box: { x: number; y: number; w: number; h: number }, steps = 60) {
  const points: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const x = from + ((to - from) * i) / steps
    points.push([box.x + x * box.w, box.y + box.h - fn(x) * box.h])
  }
  return path(points)
}

// A quantity that reaches infinity at t = 1. The exponent is the self-similar rate for speed;
// the figure only needs the shape.
export const blowup = (t: number) => 0.22 / Math.sqrt(1 - t)
// The other answer: it stays bounded for all time.
export const smooth = (t: number) => 0.22 + 0.1 * Math.sin(t * 5) * Math.exp(-t * 1.6) + 0.05 * t

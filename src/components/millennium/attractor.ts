// Four-wing attractor: dx = a·x + y·z, dy = b·x + c·y − x·z, dz = −z − x·y.
// These values keep every seed inside |p| < 6 over 4000 time units (see millennium.test.ts);
// c = −0.8 with a = 0.4 collapses the four wings to two.
export const PARAMS = { a: 0.2, b: 0.01, c: -0.4 } as const

export type Vec3 = [number, number, number]

const { a, b, c } = PARAMS

export function rk4(p: Vec3, dt: number): Vec3 {
  const [x, y, z] = p
  const k1x = a * x + y * z, k1y = b * x + c * y - x * z, k1z = -z - x * y
  const x2 = x + (dt / 2) * k1x, y2 = y + (dt / 2) * k1y, z2 = z + (dt / 2) * k1z
  const k2x = a * x2 + y2 * z2, k2y = b * x2 + c * y2 - x2 * z2, k2z = -z2 - x2 * y2
  const x3 = x + (dt / 2) * k2x, y3 = y + (dt / 2) * k2y, z3 = z + (dt / 2) * k2z
  const k3x = a * x3 + y3 * z3, k3y = b * x3 + c * y3 - x3 * z3, k3z = -z3 - x3 * y3
  const x4 = x + dt * k3x, y4 = y + dt * k3y, z4 = z + dt * k3z
  const k4x = a * x4 + y4 * z4, k4y = b * x4 + c * y4 - x4 * z4, k4z = -z4 - x4 * y4
  return [
    x + (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x),
    y + (dt / 6) * (k1y + 2 * k2y + 2 * k3y + k4y),
    z + (dt / 6) * (k1z + 2 * k2z + 2 * k3z + k4z),
  ]
}

function mulberry32(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type Cloud = {
  count: number
  position: Float32Array
  // per point: arc position 0..1 along its trajectory, group index, brightness, trajectory phase
  meta: Float32Array
}

// One group per timeline result; `sizes[g]` trajectories are drawn when result g lands.
// Every trajectory is `length` RK4 steps of `dt` after a burn-in that puts the seed on the attractor.
export function buildCloud(sizes: readonly number[], length: number, dt: number, seed = 20261120): Cloud {
  const rand = mulberry32(seed)
  const total = sizes.reduce((n, s) => n + s, 0)
  const count = total * length
  const position = new Float32Array(count * 3)
  const meta = new Float32Array(count * 4)
  let i = 0
  sizes.forEach((size, group) => {
    for (let t = 0; t < size; t++) {
      let p: Vec3 = [rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1]
      for (let k = 0; k < 2500; k++) p = rk4(p, 0.01)
      const phase = rand()
      for (let k = 0; k < length; k++) {
        p = rk4(p, dt)
        // One point in five is scattered off the line as dust, the haze around the thumbnail's arms.
        const dust = k % 5 === 4
        const j = dust ? 0.16 : 0.012
        position[i * 3] = p[0] + (rand() - 0.5) * j
        position[i * 3 + 1] = p[1] + (rand() - 0.5) * j
        position[i * 3 + 2] = p[2] + (rand() - 0.5) * j
        meta[i * 4] = k / (length - 1)
        meta[i * 4 + 1] = group
        meta[i * 4 + 2] = dust ? 0.35 : 0.75 + rand() * 0.5
        meta[i * 4 + 3] = phase
        i++
      }
    }
  })
  return { count, position, meta }
}

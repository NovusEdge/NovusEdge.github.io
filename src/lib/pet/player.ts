import type { Clip } from './sprite'

export type Playhead = { frame: number; elapsed: number; done: boolean }

export const startPlayhead = (): Playhead => ({ frame: 0, elapsed: 0, done: false })

export const clampDelta = (dt: number) => Math.min(100, Math.max(0, dt))

export function advance(clip: Clip, p: Playhead, dt: number) {
  if (p.done) return { head: p, stepped: 0 }
  let { frame, elapsed } = p
  let stepped = 0
  elapsed += dt
  while (elapsed >= clip.frames[frame].ms) {
    if (!clip.loop && frame === clip.frames.length - 1) return { head: { frame, elapsed: 0, done: true }, stepped }
    elapsed -= clip.frames[frame].ms
    frame = (frame + 1) % clip.frames.length
    stepped++
  }
  return { head: { frame, elapsed, done: false }, stepped }
}

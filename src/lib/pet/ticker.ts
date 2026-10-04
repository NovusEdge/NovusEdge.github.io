import { clampDelta } from './player'

const subs = new Set<(dt: number) => void>()
let raf = 0
let last = 0

function loop(now: number) {
  const dt = clampDelta(now - last)
  last = now
  for (const fn of subs) fn(dt)
  raf = subs.size ? requestAnimationFrame(loop) : 0
}

// One rAF loop for every sprite on the page, stopped when nothing listens.
export function subscribe(fn: (dt: number) => void) {
  subs.add(fn)
  if (!raf) {
    last = performance.now()
    raf = requestAnimationFrame(loop)
  }
  return () => {
    subs.delete(fn)
  }
}

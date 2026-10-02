export const BOIL_MS = 125

const subscribers = new Set<(frame: number) => void>()
let timer: ReturnType<typeof setInterval> | undefined
let frame = 0

// One interval for every drawing on the page, so they boil in step and an
// off-screen drawing costs nothing.
export function onBoil(fn: (frame: number) => void) {
  subscribers.add(fn)
  timer ??= setInterval(() => {
    frame++
    subscribers.forEach((s) => s(frame))
  }, BOIL_MS)
  return () => {
    subscribers.delete(fn)
    if (!subscribers.size && timer) {
      clearInterval(timer)
      timer = undefined
    }
  }
}

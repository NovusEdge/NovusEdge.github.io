// Sprites by numbpill (numbpill.tumblr.com, ko-fi.com/numbpilled).
//
// Chrome and Safari only play the first frame of a GIF or SVG favicon, so frames are
// swapped by hand. Background tabs throttle timers to ~1/s, so the away dance plays at
// about a frame a second.
const SPRITES = {
  blob: { frames: 10, ms: 70 },
  bear: { frames: 6, ms: 100 },
}
type Sprite = keyof typeof SPRITES

// A path href makes every swap a request, and Chrome shows the static fallback icon
// while it is in flight, which reads as a stray frame.
const toDataUrl = (path: string) =>
  fetch(path)
    .then((res) => res.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(blob)
        }),
    )

const load = (sprite: Sprite) =>
  Promise.all(Array.from({ length: SPRITES[sprite].frames }, (_, i) => toDataUrl(`/favicon/${sprite}-${i}.png`)))

export async function animateFavicon() {
  const frames: Record<Sprite, string[]> = { blob: await load('blob'), bear: await load('bear') }

  document.querySelectorAll('link[rel="icon"]').forEach((el) => el.remove())
  const link = document.createElement('link')
  link.rel = 'icon'
  link.type = 'image/png'
  document.head.appendChild(link)

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches
  let timer = 0

  const play = (sprite: Sprite) => {
    clearTimeout(timer)
    let i = 0
    const step = () => {
      link.href = frames[sprite][i]
      if (still) return
      i = (i + 1) % frames[sprite].length
      timer = window.setTimeout(step, SPRITES[sprite].ms)
    }
    step()
  }

  const update = () => play(document.hidden ? 'bear' : 'blob')
  document.addEventListener('visibilitychange', update)
  update()
}

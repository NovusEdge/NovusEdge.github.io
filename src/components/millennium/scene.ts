import gsap from 'gsap'
import { animate, utils } from 'animejs'
import { TRACES } from './timeline-data'

export type Zone = 'hero' | 'read' | 'timeline' | 'still' | 'after' | 'next'
type Group = { reveal: number; heat: number; on: boolean }

// The renderer reads this every frame; GSAP and anime.js write to it. `reveal` is how far along
// its path each group's trajectories are drawn, `heat` the gold flash that cools after a burst,
// `flow` the speed of the pulses and the drift (0 holds the frame).
export type Scene = {
  groups: Group[]
  alpha: number
  flow: number
  zoom: number
  ox: number
  oy: number
  yaw: number
  pitch: number
  still: boolean
}

export function createScene(still: boolean): Scene {
  return {
    groups: TRACES.map(() => ({ reveal: still ? 1 : 0, heat: 0, on: still })),
    alpha: 1,
    flow: still ? 0 : 1,
    zoom: 1,
    ox: 0,
    oy: 0,
    yaw: 0,
    pitch: 0,
    still,
  }
}

type Pose = Pick<Scene, 'alpha' | 'flow' | 'zoom' | 'ox' | 'oy'>
// wide: the figure shares the viewport with type beside it. tall: phones and the list timeline,
// where it sits behind or above. In the list it only shows through the gaps between strips.
const POSES: Record<Zone, { wide: Pose; tall: Pose }> = {
  hero: { wide: { alpha: 1, flow: 1, zoom: 1.18, ox: 0.44, oy: 0.06 }, tall: { alpha: 1, flow: 1, zoom: 0.95, ox: 0, oy: 0.34 } },
  read: { wide: { alpha: 0.18, flow: 0.7, zoom: 1.55, ox: 0, oy: 0 }, tall: { alpha: 0.18, flow: 0.7, zoom: 1.3, ox: 0, oy: 0 } },
  timeline: { wide: { alpha: 1, flow: 1, zoom: 0.92, ox: -0.4, oy: 0.34 }, tall: { alpha: 0.85, flow: 1, zoom: 1.05, ox: 0, oy: 0 } },
  still: { wide: { alpha: 0.95, flow: 0, zoom: 0.98, ox: 0, oy: 0 }, tall: { alpha: 0.95, flow: 0, zoom: 1, ox: 0, oy: 0 } },
  after: { wide: { alpha: 0.2, flow: 0, zoom: 1.55, ox: 0, oy: 0 }, tall: { alpha: 0.2, flow: 0, zoom: 1.3, ox: 0, oy: 0 } },
  // The speculation section looks forward, so the held frame starts to move again, at a quarter speed.
  next: { wide: { alpha: 0.2, flow: 0.25, zoom: 1.55, ox: 0, oy: 0 }, tall: { alpha: 0.2, flow: 0.25, zoom: 1.3, ox: 0, oy: 0 } },
}

export function pose(scene: Scene, zone: Zone, tall: boolean) {
  const to = POSES[zone][tall ? 'tall' : 'wide']
  if (scene.still) {
    gsap.set(scene, { ...to, flow: 0 })
    return
  }
  const { flow, ...rest } = to
  gsap.to(scene, { ...rest, duration: 1.5, ease: 'expo.out', overwrite: 'auto' })
  // Stopping takes longer than moving, so the freeze reads as the figure running down.
  const slow = flow === 0 || zone === 'next'
  gsap.to(scene, { flow, duration: slow ? 2.2 : 0.8, ease: zone === 'next' ? 'power2.in' : slow ? 'power3.out' : 'power2.out', overwrite: 'auto' })
}

export function turn(scene: Scene, yaw: number, pitch: number) {
  if (scene.still) return
  gsap.to(scene, { yaw, pitch, duration: 2.6, ease: 'power2.inOut', overwrite: 'auto' })
}

// Draws groups below `count` and retracts the rest back along their own paths.
export function showCount(scene: Scene, count: number) {
  if (scene.still) return
  let drawn = 0
  scene.groups.forEach((g, i) => {
    const on = i < count
    if (g.on === on) return
    g.on = on
    utils.remove(g)
    if (on) {
      const delay = drawn++ * 110
      animate(g, { reveal: 1, duration: 1500, delay, ease: 'inOutSine' })
      animate(g, { heat: [1, 0], duration: 2600, delay, ease: 'outQuad' })
    } else {
      g.heat = 0
      animate(g, { reveal: 0, duration: 700, delay: (scene.groups.length - 1 - i) * 45, ease: 'inOutQuad' })
    }
  })
}

export function disposeScene(scene: Scene) {
  gsap.killTweensOf(scene)
  scene.groups.forEach((g) => utils.remove(g))
}

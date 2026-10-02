/**
 * Mutable state the page writes and the scene reads every frame. Kept outside React so
 * scroll, pointer and the intro timeline can drive the scene without re-rendering it.
 */
export type Rig = {
  intro: { z: number; tumble: number; draw: number }
  scroll: number
  pointer: { x: number; y: number }
  /** Radians per second around the record's own axis, from dragging. */
  spin: number
  /** Scene-clock times of live pings, written by the scene. */
  pings: number[]
  /** Clicks waiting for the scene to timestamp them. */
  queued: number
  /** Where the scene last placed the record, so pings leave from it. */
  at: { x: number; y: number; z: number; s: number }
}

export const makeRig = (): Rig => ({
  intro: { z: -40, tumble: 1, draw: 0 },
  scroll: 0,
  pointer: { x: 0, y: 0 },
  spin: 0,
  pings: [],
  queued: 0,
  at: { x: 0, y: 0, z: -40, s: 1 },
})

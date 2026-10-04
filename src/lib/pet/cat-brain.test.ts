import { describe, expect, it } from 'vitest'
import { catReducer, clipFor, initCat, lookPose, type CatEvent, type CatState } from './cat-brain'

const run = (s: CatState, ...events: CatEvent[]) => events.reduce(catReducer, s)
const tick = (now: number, roll = 1, width = 500): CatEvent => ({ type: 'tick', now, width, roll })

describe('idle chain', () => {
  it('idles, grooms, loafs, then sleeps as the page sits untouched', () => {
    const s = initCat(0, 100, false)
    expect(run(s, tick(19_000)).mode).toBe('idle')
    expect(run(s, tick(21_000)).mode).toBe('groom')
    expect(run(s, tick(41_000)).mode).toBe('loaf')
    expect(run(s, tick(61_000)).mode).toBe('sleep')
  })

  it('restarts the chain on input, and wakes a sleeping cat first', () => {
    const asleep = run(initCat(0, 100, false), tick(61_000))
    const woke = run(asleep, { type: 'input', now: 62_000 })
    expect(woke.mode).toBe('wake')
    expect(run(woke, { type: 'end', now: 63_000 }).mode).toBe('idle')
    expect(run(woke, { type: 'end', now: 63_000 }, tick(70_000)).mode).toBe('idle')
  })
})

describe('reactions', () => {
  it('startles on hover, then settles back to idle', () => {
    const s = run(initCat(0, 100, false), { type: 'hover', now: 1 })
    expect(s.mode).toBe('startle')
    expect(run(s, { type: 'end', now: 2 }).mode).toBe('idle')
  })

  it('does not startle while asleep', () => {
    const s = run(initCat(0, 100, false), tick(61_000), { type: 'hover', now: 61_500 })
    expect(s.mode).toBe('sleep')
  })

  it('ignores some clicks, pounces or swats on the rest', () => {
    const s = initCat(0, 100, false)
    expect(run(s, { type: 'click', now: 1, roll: 0.1 }).mode).toBe('idle')
    expect(run(s, { type: 'click', now: 1, roll: 0.4 }).mode).toBe('pounce')
    expect(run(s, { type: 'click', now: 1, roll: 0.9 }).mode).toBe('swat')
  })
})

describe('moving', () => {
  it('walks to a near target and runs to a far one, facing the way it goes', () => {
    const s = initCat(0, 100, false)
    expect(run(s, { type: 'go', now: 1, target: 110 })).toMatchObject({ mode: 'walk', dir: 1 })
    expect(run(s, { type: 'go', now: 1, target: 10 })).toMatchObject({ mode: 'run', dir: -1 })
  })

  it('moves by the stepped px and sits on arrival without overshooting', () => {
    const walking = run(initCat(0, 100, false), { type: 'go', now: 1, target: 103 })
    const s = run(walking, { type: 'step', now: 2, px: 2 }, { type: 'step', now: 3, px: 2 })
    expect(s).toMatchObject({ mode: 'sit_down', x: 103, target: null })
    expect(run(s, { type: 'end', now: 4 }).mode).toBe('idle')
  })

  it('clamps into a viewport that shrank under it', () => {
    const s = run(initCat(0, 900, false), tick(1, 1, 300))
    expect(s.x).toBe(300)
  })

  it('does zoomies to one edge and back on a rare tick', () => {
    const z = run(initCat(0, 100, false), tick(1_000, 0))
    expect(z).toMatchObject({ mode: 'zoomies', target: 500, dir: 1 })
    const back = run(z, { type: 'step', now: 2_000, px: 400 })
    expect(back).toMatchObject({ mode: 'zoomies', target: 100, dir: -1 })
    expect(run(back, { type: 'step', now: 3_000, px: 400 }).mode).toBe('sit_down')
  })

  it('walks to a negative target with viewport shrink and arrives when clamped', () => {
    const walking = run(initCat(0, 100, false), { type: 'go', now: 1, target: -10 })
    expect(walking.target).toBe(0)
    const s = run(walking, { type: 'step', now: 2, px: 100 })
    expect(s).toMatchObject({ mode: 'sit_down', x: 0, target: null })
  })

  it('clamps zoomies target with negative viewport width', () => {
    const z = run(initCat(0, 100, false), tick(1_000, 0, -10))
    expect(z).toMatchObject({ mode: 'zoomies', target: 0 })
  })
})

describe('stoat', () => {
  it('startles an awake cat and sometimes chases', () => {
    const s = initCat(0, 100, false)
    expect(run(s, { type: 'stoat', now: 1, dir: 1, roll: 0.9 }).mode).toBe('startle')
    expect(run(s, { type: 'stoat', now: 1, dir: 1, roll: 0.1 }).mode).toBe('zoomies')
  })

  it('leaves a sleeping cat asleep', () => {
    const s = run(initCat(0, 100, false), tick(61_000), { type: 'stoat', now: 61_100, dir: 1, roll: 0.1 })
    expect(s.mode).toBe('sleep')
  })
})

describe('reduced motion', () => {
  it('starts parked and ignores everything', () => {
    const s = initCat(0, 100, true)
    const after = run(s, tick(90_000, 0), { type: 'hover', now: 1 }, { type: 'go', now: 2, target: 0 }, { type: 'click', now: 3, roll: 0.5 })
    expect(after.mode).toBe('parked')
    expect(clipFor('parked')).toBe('sleep')
  })

  it('clamps parked cat position when viewport shrinks', () => {
    const s = run(initCat(0, 900, true), tick(1, 1, 300))
    expect(s.mode).toBe('parked')
    expect(s.x).toBe(300)
  })
})

describe('lookPose', () => {
  it('looks toward a near pointer and ignores a far one', () => {
    const cat = { x: 100, y: 100 }
    expect(lookPose(cat, { x: 40, y: 100 }, 200)).toBe('left')
    expect(lookPose(cat, { x: 160, y: 100 }, 200)).toBe('right')
    expect(lookPose(cat, { x: 100, y: 20 }, 200)).toBe('up')
    expect(lookPose(cat, { x: 105, y: 110 }, 200)).toBe('center')
    expect(lookPose(cat, { x: 900, y: 100 }, 200)).toBeNull()
    expect(lookPose(cat, null, 200)).toBeNull()
  })
})

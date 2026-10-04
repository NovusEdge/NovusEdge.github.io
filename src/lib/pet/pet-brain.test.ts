import { describe, expect, it } from 'vitest'
import { clipFor, initPet, NEAR_COOLDOWN, petReducer, stoatSpot, type PetEvent, type PetState } from './pet-brain'

const run = (s: PetState, ...events: PetEvent[]) => events.reduce(petReducer, s)
const tick = (now: number, roll = 1, width = 500, desk: number | null = null): PetEvent => ({ type: 'tick', now, width, roll, desk })

describe('idle chain', () => {
  it('sits, grooms, curls, then sleeps as the page sits untouched', () => {
    const s = initPet(0, 100, false)
    expect(run(s, tick(19_000)).mode).toBe('idle')
    expect(run(s, tick(21_000)).mode).toBe('groom')
    expect(run(s, tick(41_000)).mode).toBe('loaf')
    expect(run(s, tick(61_000)).mode).toBe('sleep')
  })

  it('wakes on input and settles back to idle', () => {
    const woke = run(initPet(0, 100, false), tick(61_000), { type: 'input', now: 62_000 })
    expect(woke.mode).toBe('wake')
    expect(run(woke, { type: 'end', now: 63_000 }).mode).toBe('idle')
  })
})

describe('desk nap', () => {
  it('sometimes walks to the desk to sleep instead of sleeping where it is', () => {
    const going = run(initPet(0, 100, false), tick(61_000, 0.1, 500, 30))
    expect(going).toMatchObject({ mode: 'run', target: 30, napAtDesk: true })
    const arrived = run(going, { type: 'step', now: 62_000, px: 70 })
    expect(arrived).toMatchObject({ mode: 'desk_nap', x: 30, target: null, napAtDesk: false })
    expect(run(arrived, { type: 'input', now: 63_000 }).mode).toBe('wake')
  })

  it('sleeps on the floor when there is no desk or the roll misses', () => {
    expect(run(initPet(0, 100, false), tick(61_000, 0.1, 500, null)).mode).toBe('sleep')
    expect(run(initPet(0, 100, false), tick(61_000, 0.9, 500, 30)).mode).toBe('sleep')
  })

  it('stays napping through route changes', () => {
    const napping = run(initPet(0, 30, false), tick(61_000, 0.1, 500, 30))
    expect(napping.mode).toBe('desk_nap')
    expect(run(napping, { type: 'go', now: 62_000, target: 200 }).mode).toBe('desk_nap')
  })
})

describe('reactions', () => {
  it('startles on hover, and not while asleep', () => {
    expect(run(initPet(0, 100, false), { type: 'hover', now: 1 }).mode).toBe('startle')
    expect(run(initPet(0, 100, false), tick(61_000), { type: 'hover', now: 61_500 }).mode).toBe('sleep')
  })

  it('ignores some clicks, pounces or peeks on the rest', () => {
    const s = initPet(0, 100, false)
    expect(run(s, { type: 'click', now: 1, roll: 0.1 }).mode).toBe('idle')
    expect(run(s, { type: 'click', now: 1, roll: 0.4 }).mode).toBe('pounce')
    expect(run(s, { type: 'click', now: 1, roll: 0.9 }).mode).toBe('peek')
  })

  it('periscopes toward a near pointer at most once per cooldown', () => {
    const s = initPet(0, 100, false)
    const looked = run(s, { type: 'near', now: 10_000, dir: -1 })
    expect(looked).toMatchObject({ mode: 'periscope', dir: -1 })
    const settled = run(looked, { type: 'end', now: 12_000 })
    expect(run(settled, { type: 'near', now: 12_000, dir: 1 }).mode).toBe('idle')
    expect(run(settled, { type: 'near', now: 10_000 + NEAR_COOLDOWN, dir: 1 }).mode).toBe('periscope')
  })
})

describe('moving', () => {
  it('walks to a near target and bounds to a far one, facing the way it goes', () => {
    const s = initPet(0, 100, false)
    expect(run(s, { type: 'go', now: 1, target: 110 })).toMatchObject({ mode: 'walk', dir: 1 })
    expect(run(s, { type: 'go', now: 1, target: 10 })).toMatchObject({ mode: 'run', dir: -1 })
  })

  it('sits down on arrival without overshooting', () => {
    const walking = run(initPet(0, 100, false), { type: 'go', now: 1, target: 103 })
    const s = run(walking, { type: 'step', now: 2, px: 2 }, { type: 'step', now: 3, px: 2 })
    expect(s).toMatchObject({ mode: 'sit_down', x: 103, target: null })
  })

  it('follows pixel-me only on a good roll and only while resting awake', () => {
    const s = initPet(0, 100, false)
    expect(run(s, { type: 'follow', now: 1, target: 200, roll: 0.1 })).toMatchObject({ mode: 'run', target: 200 })
    expect(run(s, { type: 'follow', now: 1, target: 200, roll: 0.9 }).mode).toBe('idle')
    expect(run(s, tick(61_000), { type: 'follow', now: 61_500, target: 200, roll: 0.1 }).mode).toBe('sleep')
  })

  it('clamps into a viewport that shrank under it, even when parked', () => {
    expect(run(initPet(0, 900, false), tick(1, 1, 300)).x).toBe(300)
    expect(run(initPet(0, 900, true), tick(1, 1, 300))).toMatchObject({ mode: 'parked', x: 300 })
    expect(run(initPet(0, 100, false), tick(1, 1, -10)).x).toBe(0)
  })

  it('does zoomies to one edge and back on a rare tick', () => {
    const z = run(initPet(0, 100, false), tick(1_000, 0))
    expect(z).toMatchObject({ mode: 'zoomies', target: 500, dir: 1 })
    const back = run(z, { type: 'step', now: 2_000, px: 400 })
    expect(back).toMatchObject({ mode: 'zoomies', target: 100, dir: -1 })
    expect(run(back, { type: 'step', now: 3_000, px: 400 }).mode).toBe('sit_down')
  })
})

describe('reduced motion', () => {
  it('starts parked and ignores everything', () => {
    const s = initPet(0, 100, true)
    const after = run(s, tick(90_000, 0, 500, 30), { type: 'hover', now: 1 }, { type: 'go', now: 2, target: 0 }, { type: 'click', now: 3, roll: 0.5 }, { type: 'near', now: 4, dir: 1 })
    expect(after.mode).toBe('parked')
  })
})

describe('clips and placement', () => {
  it('maps modes to stoat clips', () => {
    expect(clipFor('idle')).toBe('sit')
    expect(clipFor('loaf')).toBe('curl')
    expect(clipFor('walk')).toBe('bound')
    expect(clipFor('run')).toBe('bound')
    expect(clipFor('zoomies')).toBe('bound')
    expect(clipFor('parked')).toBe('sleep')
    expect(clipFor('desk_nap')).toBe('sleep')
    expect(clipFor('pounce')).toBe('pounce')
  })

  it('never shows the roaming stoat while a fixed-place stoat holds the stage', () => {
    expect(stoatSpot('idle', false)).toBe('floor')
    expect(stoatSpot('desk_nap', false)).toBe('desk')
    expect(stoatSpot('idle', true)).toBeNull()
    expect(stoatSpot('desk_nap', true)).toBeNull()
  })
})

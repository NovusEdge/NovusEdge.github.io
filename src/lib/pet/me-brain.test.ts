import { describe, expect, it } from 'vitest'
import { initMe, meClips, meReducer, WALK_EVERY_MAX, WALK_EVERY_MIN, WALK_MAX, WALK_MIN, type MeEvent, type MeState } from './me-brain'

const run = (s: MeState, ...events: MeEvent[]) => events.reduce(meReducer, s)
const HOME = 70

describe('desk and walk cycle', () => {
  it('works at the desk until the next walk is due', () => {
    const s = initMe(0, HOME, false, 0)
    expect(s).toMatchObject({ mode: 'desk', x: HOME, nextWalk: WALK_EVERY_MIN })
    expect(run(s, { type: 'tick', now: WALK_EVERY_MIN - 1, width: 1000, roll: 0 }).mode).toBe('desk')
    const due = run(s, { type: 'tick', now: WALK_EVERY_MIN, width: 1000, roll: 0 })
    expect(due).toMatchObject({ mode: 'due', target: HOME + WALK_MIN })
    expect(run(due, { type: 'wrap' }).mode).toBe('standing')
  })

  it('keeps showing the desk until the desk loop wraps', () => {
    const due = run(initMe(0, HOME, false, 0), { type: 'tick', now: WALK_EVERY_MIN, width: 1000, roll: 0 })
    expect(meClips(due.mode)).toEqual({ desk: 'desk', walker: false })
    expect(run(due, { type: 'tick', now: WALK_EVERY_MIN + 5000, width: 1000, roll: 0 }, { type: 'end', now: 1, roll: 0 }).mode).toBe('due')
    expect(run(initMe(0, HOME, false, 0), { type: 'wrap' }).mode).toBe('desk')
  })

  it('a due walk under reduced motion never leaves', () => {
    const s = initMe(0, HOME, true, 0)
    expect(run(s, { type: 'tick', now: 10 * WALK_EVERY_MAX, width: 1000, roll: 0 }, { type: 'wrap' }).mode).toBe('still')
  })

  it('walks whole 8 px multiples so the walker is home on walk frame 0', () => {
    for (const roll of [0, 0.13, 0.5, 0.77, 1]) {
      for (const width of [HOME + 8, HOME + 9, HOME + 50, HOME + 63, 1000]) {
        const due = run(initMe(0, HOME, false, 0), { type: 'tick', now: WALK_EVERY_MIN, width, roll })
        expect(due.mode).toBe('due')
        expect((due.target! - HOME) % 8).toBe(0)
        expect(due.target! - HOME).toBeGreaterThanOrEqual(8)
        expect(due.target!).toBeLessThanOrEqual(width)
      }
    }
  })

  it('skips the walk and reschedules when there is under 8 px of room', () => {
    const s = run(initMe(0, HOME, false, 0), { type: 'tick', now: WALK_EVERY_MIN, width: HOME + 7, roll: 1 })
    expect(s).toMatchObject({ mode: 'desk', target: null, nextWalk: WALK_EVERY_MIN + WALK_EVERY_MAX })
  })

  it('stands, walks out, comes back, sits down, and schedules the next walk', () => {
    const due = run(initMe(0, HOME, false, 0), { type: 'tick', now: WALK_EVERY_MIN, width: 1000, roll: 1 }, { type: 'wrap' })
    expect(due).toMatchObject({ mode: 'standing', target: HOME + WALK_MAX })
    const walking = run(due, { type: 'end', now: 61_000, roll: 0 })
    expect(walking).toMatchObject({ mode: 'walking', dir: 1 })
    const turned = run(walking, { type: 'step', px: WALK_MAX })
    expect(turned).toMatchObject({ mode: 'returning', x: HOME + WALK_MAX, target: HOME, dir: -1 })
    const back = run(turned, { type: 'step', px: WALK_MAX })
    expect(back).toMatchObject({ mode: 'sitting', x: HOME, target: null })
    const seated = run(back, { type: 'end', now: 100_000, roll: 1 })
    expect(seated).toMatchObject({ mode: 'desk', nextWalk: 100_000 + WALK_EVERY_MAX })
  })

  it('keeps the walk inside a narrow viewport', () => {
    const due = run(initMe(0, HOME, false, 0), { type: 'tick', now: WALK_EVERY_MIN, width: HOME + 10, roll: 1 })
    expect(due.target).toBe(HOME + 8)
  })

  it('turns back if the viewport shrinks under a walk', () => {
    const walking = run(initMe(0, HOME, false, 0), { type: 'tick', now: WALK_EVERY_MIN, width: 1000, roll: 1 }, { type: 'wrap' }, { type: 'end', now: 61_000, roll: 0 }, { type: 'step', px: 48 })
    expect(run(walking, { type: 'tick', now: 62_000, width: HOME + 20, roll: 0 })).toMatchObject({ mode: 'returning', x: HOME + 16, target: HOME })
  })

  it('turns back on a whole 8 px multiple so sit_down starts on walk frame 0', () => {
    const walking = run(initMe(0, HOME, false, 0), { type: 'tick', now: WALK_EVERY_MIN, width: 1000, roll: 1 }, { type: 'wrap' }, { type: 'end', now: 61_000, roll: 0 }, { type: 'step', px: 48 })
    for (const width of [HOME + 8, HOME + 15, HOME + 23, HOME + 47]) {
      const turned = run(walking, { type: 'tick', now: 62_000, width, roll: 0 })
      expect(turned.mode).toBe('returning')
      expect((turned.x - HOME) % 8).toBe(0)
      expect(turned.x).toBeLessThanOrEqual(width)
    }
  })

  it('never leaves the desk under reduced motion', () => {
    const s = initMe(0, HOME, true, 0)
    expect(run(s, { type: 'tick', now: 10 * WALK_EVERY_MAX, width: 1000, roll: 0 }, { type: 'end', now: 1, roll: 0 }).mode).toBe('still')
  })

  it('maps modes to the desk clip and the walker', () => {
    expect(meClips('desk')).toEqual({ desk: 'desk', walker: false })
    expect(meClips('still')).toEqual({ desk: 'desk', walker: false })
    expect(meClips('due')).toEqual({ desk: 'desk', walker: false })
    expect(meClips('standing')).toEqual({ desk: 'stand_up', walker: false })
    expect(meClips('walking')).toEqual({ desk: 'desk_empty', walker: true })
    expect(meClips('returning')).toEqual({ desk: 'desk_empty', walker: true })
    expect(meClips('sitting')).toEqual({ desk: 'sit_down', walker: false })
  })
})

describe('persona change', () => {
  it('snaps a walk back to the desk', () => {
    const due = run(initMe(0, HOME, false, 0), { type: 'tick', now: WALK_EVERY_MIN, width: 1000, roll: 0 })
    const walking = run(due, { type: 'wrap' }, { type: 'end', now: 1, roll: 0 }, { type: 'step', px: 8 })
    expect(walking.mode).toBe('walking')
    const s = run(walking, { type: 'reset', now: 5000, roll: 0 })
    expect(s).toMatchObject({ mode: 'desk', x: HOME, target: null, dir: 1, nextWalk: 5000 + WALK_EVERY_MIN })
  })

  it('leaves a reduced-motion pixel-me alone', () => {
    const s = initMe(0, HOME, true, 0)
    expect(run(s, { type: 'reset', now: 5000, roll: 0 })).toBe(s)
  })
})

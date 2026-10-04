import { describe, expect, it } from 'vitest'
import { initMe, meClips, meReducer, WALK_EVERY_MAX, WALK_EVERY_MIN, WALK_MAX, WALK_MIN, type MeEvent, type MeState } from './me-brain'

const run = (s: MeState, ...events: MeEvent[]) => events.reduce(meReducer, s)
const HOME = 70

describe('desk and walk cycle', () => {
  it('works at the desk until the next walk is due', () => {
    const s = initMe(0, HOME, false, 0)
    expect(s).toMatchObject({ mode: 'desk', x: HOME, nextWalk: WALK_EVERY_MIN })
    expect(run(s, { type: 'tick', now: WALK_EVERY_MIN - 1, width: 1000, roll: 0 }).mode).toBe('desk')
    expect(run(s, { type: 'tick', now: WALK_EVERY_MIN, width: 1000, roll: 0 })).toMatchObject({ mode: 'standing', target: HOME + WALK_MIN })
  })

  it('stands, walks out, comes back, sits down, and schedules the next walk', () => {
    const due = run(initMe(0, HOME, false, 0), { type: 'tick', now: WALK_EVERY_MIN, width: 1000, roll: 1 })
    expect(due.target).toBe(HOME + WALK_MAX)
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
    expect(due.target).toBe(HOME + 10)
  })

  it('turns back if the viewport shrinks under a walk', () => {
    const walking = run(initMe(0, HOME, false, 0), { type: 'tick', now: WALK_EVERY_MIN, width: 1000, roll: 1 }, { type: 'end', now: 61_000, roll: 0 }, { type: 'step', px: 50 })
    expect(run(walking, { type: 'tick', now: 62_000, width: HOME + 20, roll: 0 })).toMatchObject({ mode: 'returning', x: HOME + 20, target: HOME })
  })

  it('never leaves the desk under reduced motion', () => {
    const s = initMe(0, HOME, true, 0)
    expect(run(s, { type: 'tick', now: 10 * WALK_EVERY_MAX, width: 1000, roll: 0 }, { type: 'end', now: 1, roll: 0 }).mode).toBe('still')
  })

  it('maps modes to the desk clip and the walker', () => {
    expect(meClips('desk')).toEqual({ desk: 'desk', walker: false })
    expect(meClips('still')).toEqual({ desk: 'desk', walker: false })
    expect(meClips('standing')).toEqual({ desk: 'stand_up', walker: false })
    expect(meClips('walking')).toEqual({ desk: 'desk_empty', walker: true })
    expect(meClips('returning')).toEqual({ desk: 'desk_empty', walker: true })
    expect(meClips('sitting')).toEqual({ desk: 'sit_down', walker: false })
  })
})

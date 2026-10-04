import { describe, expect, it } from 'vitest'
import { advance, clampDelta, startPlayhead } from './player'
import type { Clip } from './sprite'

const clip = (loop: boolean): Clip => ({
  loop,
  frames: [
    { ms: 100, px: [] },
    { ms: 200, px: [] },
  ],
})

describe('advance', () => {
  it('holds a frame until its ms have passed', () => {
    const { head, stepped } = advance(clip(true), startPlayhead(), 99)
    expect(head.frame).toBe(0)
    expect(stepped).toBe(0)
  })

  it('steps across several frames in one large delta', () => {
    const { head, stepped } = advance(clip(true), startPlayhead(), 350)
    expect(head).toMatchObject({ frame: 0, elapsed: 50 })
    expect(stepped).toBe(2)
  })

  it('stops a one-shot on its last frame and marks it done', () => {
    const { head } = advance(clip(false), startPlayhead(), 1000)
    expect(head).toMatchObject({ frame: 1, done: true })
  })

  it('does nothing once a one-shot is done', () => {
    const done = advance(clip(false), startPlayhead(), 1000).head
    expect(advance(clip(false), done, 500)).toEqual({ head: done, stepped: 0 })
  })
})

describe('clampDelta', () => {
  it('caps a long pause at 100 ms so a hidden tab does not fast-forward', () => {
    expect(clampDelta(60_000)).toBe(100)
    expect(clampDelta(16)).toBe(16)
    expect(clampDelta(-5)).toBe(0)
  })
})

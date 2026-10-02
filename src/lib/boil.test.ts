import { afterEach, describe, expect, it, vi } from 'vitest'
import { BOIL_MS, onBoil } from './boil'

afterEach(() => vi.useRealTimers())

describe('onBoil', () => {
  it('ticks every subscriber on one shared interval and stops when the last leaves', () => {
    vi.useFakeTimers()
    const a = vi.fn()
    const b = vi.fn()
    const offA = onBoil(a)
    const offB = onBoil(b)
    vi.advanceTimersByTime(BOIL_MS * 2)
    expect(a).toHaveBeenCalledTimes(2)
    expect(b).toHaveBeenCalledTimes(2)
    offA()
    offA()
    offB()
    expect(vi.getTimerCount()).toBe(0)
    vi.advanceTimersByTime(BOIL_MS * 4)
    expect(a).toHaveBeenCalledTimes(2)
  })
})

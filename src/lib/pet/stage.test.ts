import { describe, expect, it } from 'vitest'
import { claimStage, stageClaimed } from './stage'

describe('stage claims', () => {
  it('is free until something claims it and free again after release', () => {
    expect(stageClaimed()).toBe(false)
    const release = claimStage()
    expect(stageClaimed()).toBe(true)
    release()
    expect(stageClaimed()).toBe(false)
  })

  it('stays claimed until every claimant releases', () => {
    const a = claimStage()
    const b = claimStage()
    a()
    expect(stageClaimed()).toBe(true)
    b()
    expect(stageClaimed()).toBe(false)
  })

  it('ignores a double release', () => {
    const a = claimStage()
    const b = claimStage()
    a()
    a()
    expect(stageClaimed()).toBe(true)
    b()
  })
})

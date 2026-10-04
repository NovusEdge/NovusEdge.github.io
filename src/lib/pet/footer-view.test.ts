import { describe, expect, it } from 'vitest'
import { footerInView, setFooterInView } from './footer-view'

describe('footer-view', () => {
  it('starts out of view and follows the setter', () => {
    expect(footerInView()).toBe(false)
    setFooterInView(true)
    expect(footerInView()).toBe(true)
    setFooterInView(false)
    expect(footerInView()).toBe(false)
  })
})

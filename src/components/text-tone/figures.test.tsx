import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { i18nFor } from '../../i18n'
import { MotionContext, type MotionMode } from './loop-pause'
import { FortySheets } from './forty-sheets'
import { RateCards } from './rate-cards'

const render = (node: ReactNode, mode: MotionMode = 'pending') =>
  renderToStaticMarkup(
    <I18nextProvider i18n={i18nFor('en')}>
      <MotionContext value={mode}>{node}</MotionContext>
    </I18nextProvider>,
  )
const count = (html: string, s: string) => html.split(s).length - 1

describe('FortySheets', () => {
  it('prerenders forty sheets a row with no pause button', () => {
    const html = render(<FortySheets />)
    expect(count(html, '<i')).toBe(80)
    expect(html).not.toContain('tt-pp')
  })

  it('shows the end counts under reduced motion', () => {
    const html = render(<FortySheets />, 'reduced')
    expect(count(html, 'tt-lit')).toBe(44)
    expect(html).toContain('4 of 40 changed')
    expect(html).toContain('40 of 40 changed')
  })

  it('gets one pause button when it loops', () => {
    expect(count(render(<FortySheets />, 'full'), 'aria-pressed="false"')).toBe(1)
  })
})

describe('RateCards', () => {
  it('prerenders one card each for typing and speaking and a stack of five for the model', () => {
    const html = render(<RateCards />)
    expect(count(html, 'class="tt-card"')).toBe(7)
    expect(html).toContain('one hole, one token · 0 s')
  })
})

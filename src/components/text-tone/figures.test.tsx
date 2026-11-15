import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { i18nFor } from '../../i18n'
import { MotionContext, type MotionMode } from './loop-pause'
import { FortySheets } from './forty-sheets'
import { RateCards } from './rate-cards'
import { TonesFigure } from './tones-figure'
import { HarakatFigure } from './harakat-figure'
import { ClosingStage } from './closing-stage'

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

describe('TonesFigure', () => {
  it('prerenders four toned words and the poem, all marked as Chinese', () => {
    const html = render(<TonesFigure />)
    expect(count(html, 'class="tt-tone"')).toBe(4)
    expect(count(html, 'lang="zh-Hans"')).toBe(5)
    expect(html).toContain('Shíshì shīshì Shī Shì')
    expect(html).not.toContain('tt-static')
  })

  it('shows every form at once under reduced motion', () => {
    expect(render(<TonesFigure />, 'reduced')).toContain('tt-static')
  })
})

describe('HarakatFigure', () => {
  it('prerenders the bare word four times and three vowelled readings, all right-to-left', () => {
    const html = render(<HarakatFigure />)
    expect(count(html, 'class="tt-vw"')).toBe(4)
    expect(count(html, 'class="tt-hk"')).toBe(3)
    expect(count(html, 'lang="ar" dir="rtl"')).toBe(7)
  })

  it('shows every reading at once under reduced motion', () => {
    expect(render(<HarakatFigure />, 'reduced')).toContain('tt-static')
  })
})

describe('ClosingStage', () => {
  it('draws seven bands of paper under the arc', () => {
    expect(count(render(<ClosingStage />), '<circle')).toBe(7)
  })

  it('keeps the pause button outside the image role', () => {
    const html = render(<ClosingStage />, 'full')
    const img = html.indexOf('role="img"')
    const imgEnd = html.indexOf('</p></div>', img)
    expect(img).toBeGreaterThan(-1)
    expect(imgEnd).toBeGreaterThan(img)
    expect(html.slice(img, imgEnd)).not.toContain('<button')
    // The button mounts only once fonts load, which never happens in static markup.
    expect(html.indexOf('<button')).toBe(-1)
  })
})

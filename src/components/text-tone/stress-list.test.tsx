import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { i18nFor } from '../../i18n'
import { LocaleContext } from '../../i18n/context'
import { LOCALES } from '../../i18n/paths'
import { MotionContext, type MotionMode } from './loop-pause'
import { StressList, TypedLine } from './stress-list'

function render(node: ReactNode, mode: MotionMode = 'pending', code = 'en') {
  return renderToStaticMarkup(
    <I18nextProvider i18n={i18nFor(code)}>
      <LocaleContext value={LOCALES.find((l) => l.code === code)!}>
        <MotionContext value={mode}>{node}</MotionContext>
      </LocaleContext>
    </I18nextProvider>,
  )
}

describe('StressList', () => {
  it('prerenders seven playable rows labelled with the stressed word and its meaning', () => {
    const html = render(<StressList />)
    expect(html.match(/<button/g)).toHaveLength(7)
    expect(html).toContain('stressed on she. Someone else did."')
    expect(html).toContain('<strong class="tt-em"><span class="tt-w">money</span></strong>.')
    expect(html).toContain('<span class="tt-w">money.</span>')
  })

  it('sets the italic in the sixth meaning and keeps it out of the label', () => {
    const html = render(<StressList />)
    expect(html).toContain('just not <em>that</em> money.')
    expect(html).toContain('just not that money."')
  })

  it('captions the example as English-only outside English', () => {
    expect(render(<StressList />)).not.toContain('tt-note')
    expect(render(<StressList />, 'pending', 'fi')).toContain('tt-note')
  })
})

describe('TypedLine', () => {
  it('renders only under reduced motion', () => {
    expect(render(<TypedLine />, 'pending')).toBe('')
    expect(render(<TypedLine />, 'full')).toBe('')
    expect(render(<TypedLine />, 'reduced')).toContain('typed, with no stress')
  })
})

import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { i18nFor } from '../../i18n'
import { Voices } from './voices'

const lines = [
  { side: 'left' as const, text: 'You are thinking.' },
  { side: 'right' as const, text: 'About what?' },
  { side: 'left' as const, text: 'Something is.' },
]
const quiet = lines.map(() => ({ agit: 0.3 }))
const voiced = [{ agit: 0.3, audio: '/a.mp3' }, { agit: 0.5 }, { agit: 0.1 }]

function render(meta = quiet, locale = 'en') {
  return renderToStaticMarkup(
    <I18nextProvider i18n={i18nFor('en')}>
      <Voices lines={lines} meta={meta} locale={locale} />
    </I18nextProvider>,
  )
}

describe('Voices', () => {
  it('keeps the lines in reading order in one list, sides marked for layout', () => {
    const html = render()
    const order = ['You are thinking.', 'About what?', 'Something is.'].map((t) => html.indexOf(t))
    expect(order).toEqual([...order].sort((a, b) => a - b))
    expect(html.match(/<ol/g)).toHaveLength(1)
    expect(html).toContain('data-side="left"')
    expect(html).toContain('data-side="right"')
  })

  it('renders still, with every line visible, before hydration', () => {
    const html = render()
    expect(html).toContain('ms-still')
    expect(html).not.toContain('opacity:0')
  })

  it('labels the figure', () => {
    expect(render()).toContain('role="img"')
  })

  it('shows the sound toggle only on the English page with at least one clip', () => {
    expect(render(quiet, 'en')).not.toContain('ms-sound')
    expect(render(voiced, 'en')).toContain('ms-sound')
    expect(render(voiced, 'de')).not.toContain('ms-sound')
  })
})

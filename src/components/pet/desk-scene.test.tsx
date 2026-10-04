import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { i18nFor } from '../../i18n'
import { DeskScene } from './desk-scene'

describe('DeskScene', () => {
  it('reserves the desk box on the server and labels it', () => {
    const html = renderToStaticMarkup(
      <I18nextProvider i18n={i18nFor('en')}>
        <DeskScene scale={3} />
      </I18nextProvider>,
    )
    expect(html).toContain('width:297px')
    expect(html).toContain('height:171px')
    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="Aliasgar at the desk, typing, with a cat asleep beside the laptop"')
    expect(html).not.toContain('<canvas')
  })
})

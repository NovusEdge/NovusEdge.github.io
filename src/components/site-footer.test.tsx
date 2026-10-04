import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { i18nFor } from '../i18n'
import { SiteFooter } from './site-footer'

describe('SiteFooter server render', () => {
  it('prerenders the plain "@" button, the hands, the word and the credit', () => {
    const html = renderToStaticMarkup(
      <I18nextProvider i18n={i18nFor('en')}>
        <SiteFooter />
      </I18nextProvider>,
    )
    expect(html).toContain('aria-label="Get in touch"')
    expect(html).toContain('>@</span>')
    expect(html).toContain('get in touch')
    expect(html).toContain('hand-left.png')
    expect(html).toContain('hand-right.png')
    expect(html).toContain('Creation')
    expect(html).toContain('tab critters by')
    expect(html).not.toContain('footer-bubble')
  })
})

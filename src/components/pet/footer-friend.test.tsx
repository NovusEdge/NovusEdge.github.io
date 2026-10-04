import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { I18nextProvider } from 'react-i18next'
import { i18nFor } from '../../i18n'
import { FooterFriend } from './footer-friend'

describe('FooterFriend', () => {
  it('renders only the plain button on the server', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <I18nextProvider i18n={i18nFor('en')}>
          <FooterFriend plain={<button>@</button>} onCard={() => {}} />
        </I18nextProvider>
      </MemoryRouter>,
    )
    expect(html).toBe('<button>@</button>')
  })
})

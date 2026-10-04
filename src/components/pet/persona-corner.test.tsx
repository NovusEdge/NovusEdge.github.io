import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { i18nFor } from '../../i18n'
import meJson from '../../assets/sprites/me.json'
import type { Sprite } from '../../lib/pet/sprite'
import { PersonaCorner } from './persona-corner'

const ME = meJson as unknown as Sprite

describe('PersonaCorner', () => {
  it('renders a labelled settings button even before its clips are drawn', () => {
    const html = renderToStaticMarkup(
      <I18nextProvider i18n={i18nFor('en')}>
        <PersonaCorner me={ME} loop="no_such_clip" beat="also_missing" scale={2} reduced onOpen={() => {}} />
      </I18nextProvider>,
    )
    expect(html).toContain('aria-label="Pixel friends settings"')
    expect(html).toContain('aria-haspopup="dialog"')
  })
})

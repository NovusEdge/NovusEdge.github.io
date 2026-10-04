import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { MemoryRouter } from 'react-router'
import { i18nFor } from '../../i18n'
import { PetPanel } from './pet-panel'

describe('PetPanel', () => {
  it('renders nothing on the server', () => {
    expect(
      renderToStaticMarkup(
        <I18nextProvider i18n={i18nFor('en')}>
          <MemoryRouter>
            <PetPanel />
          </MemoryRouter>
        </I18nextProvider>,
      ),
    ).toBe('')
  })

  it('has its labels in English', () => {
    const t = i18nFor('en').t
    expect(t('pet.settings')).toBe('Pixel friends settings')
    expect(t('pet.friends')).toBe('Pixel friends')
  })
})

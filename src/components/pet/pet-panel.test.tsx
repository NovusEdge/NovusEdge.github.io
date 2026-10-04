import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { i18nFor } from '../../i18n'
import { PetPanel } from './pet-panel'

describe('PetPanel', () => {
  it('renders a labelled, closed toggle button', () => {
    const html = renderToStaticMarkup(
      <I18nextProvider i18n={i18nFor('en')}>
        <PetPanel />
      </I18nextProvider>,
    )
    expect(html).toContain('aria-label="Pet settings"')
    expect(html).toContain('aria-expanded="false"')
  })

  it('resolves keys that prefix other keys', () => {
    const t = i18nFor('en').t
    expect(t('pet.coat')).toBe('Coat')
    expect(t('pet.coat.tuxedo')).toBe('Tuxedo')
    expect(t('pet.stoat')).toBe('Stoat visits')
    expect(t('pet.stoat.off')).toBe('Never')
  })
})

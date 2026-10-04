import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { PetLayer } from './pet-layer'

describe('PetLayer', () => {
  it('renders nothing on the server so prerendered HTML is unchanged', () => {
    expect(
      renderToStaticMarkup(
        <MemoryRouter>
          <PetLayer />
        </MemoryRouter>,
      ),
    ).toBe('')
  })
})

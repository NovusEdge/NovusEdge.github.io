import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { FriendsLayer } from './friends-layer'

describe('FriendsLayer', () => {
  it('renders nothing on the server so prerendered HTML is unchanged', () => {
    expect(
      renderToStaticMarkup(
        <MemoryRouter>
          <FriendsLayer />
        </MemoryRouter>,
      ),
    ).toBe('')
  })
})

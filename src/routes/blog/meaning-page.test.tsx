import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { MemoryRouter } from 'react-router'
import { i18nFor } from '../../i18n'
import { MeaningPage } from './meaning-page'
import type { Post } from '../../lib/posts'

const post = (slug: string): Post => ({
  slug,
  title: 'In Search of Meaning #1',
  date: '2026-09-16',
  tags: [],
  description: 'A brief note on meaning and purpose',
  content: '## The doubt\n\ntext',
  contentLocale: 'en',
})

function render(p: Post) {
  return renderToStaticMarkup(
    <I18nextProvider i18n={i18nFor('en')}>
      <MemoryRouter>
        <MeaningPage post={p} />
      </MemoryRouter>
    </I18nextProvider>,
  )
}

describe('MeaningPage', () => {
  it('sets the hero from the post data and the title as the heading', () => {
    const html = render(post('in-search-of-meaning-01'))
    expect(html).toContain('cogito, ergo sum')
    expect(html).toMatch(/<h1[^>]*>In Search of Meaning #1<\/h1>/)
  })

  it('falls back to the description for an entry with no data', () => {
    expect(render(post('in-search-of-meaning-77'))).toContain('A brief note on meaning and purpose')
  })

  it('credits the thumbnail photo when the post names a source', () => {
    expect(render(post('in-search-of-meaning-01'))).toContain('href="https://www.instagram.com/p/C_niznfC7Yh/"')
    expect(render(post('in-search-of-meaning-77'))).not.toContain('ms-credit')
  })

  it('puts the tangle canvas in a hidden sticky layer', () => {
    expect(render(post('in-search-of-meaning-01'))).toMatch(/class="ms-tangle-layer" aria-hidden="true"><canvas/)
  })
})

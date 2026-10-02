import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { i18nFor } from '../../i18n'
import { MeaningMarkdown, doodleLines } from './markdown'

const SLUG = 'in-search-of-meaning-test'

function render(md: string) {
  return renderToStaticMarkup(
    <I18nextProvider i18n={i18nFor('en')}>
      <MeaningMarkdown slug={SLUG} locale="en">{md}</MeaningMarkdown>
    </I18nextProvider>,
  )
}

describe('MeaningMarkdown', () => {
  it('underlines headings and keeps their ids', () => {
    const html = render('## The doubt\n\ntext')
    expect(html).toContain('id="the-doubt"')
    expect(html).toContain('ms-draw-underline')
  })

  it('rings a #ring link instead of linking it', () => {
    const html = render('to [demolish everything](#ring) and start')
    expect(html).toContain('class="ms-ring"')
    expect(html).toContain('ms-draw-ring')
    expect(html).not.toContain('href="#ring"')
  })

  it('draws a squiggle in place of a rule', () => {
    const html = render('one\n\n---\n\ntwo')
    expect(html).toContain('ms-divider')
    expect(html).not.toContain('<hr')
  })

  it('turns a [!voices] blockquote into the stage', () => {
    const html = render('> [!voices]\n> - ← one\n> - → two\n')
    expect(html).toContain('ms-voices')
    expect(html).not.toContain('<blockquote')
  })

  it('leaves other blockquotes as blockquotes', () => {
    expect(render('> Just a quote.')).toContain('<blockquote')
  })

  it('opens external links in a new tab', () => {
    expect(render('[x](https://example.com)')).toContain('target="_blank"')
  })
})

describe('doodleLines', () => {
  it('places a doodle on the first paragraph after its heading', () => {
    const md = '## One\n\nfirst\n\n## Two\n\n> quote\n\nsecond para\n'
    const map = doodleLines(md, SLUG, [{ after: 'two', kind: 'spiral', side: 'right' }])
    expect([...map.keys()]).toEqual([9])
  })

  it('ignores a doodle whose heading is gone', () => {
    expect(doodleLines('## One\n\ntext', SLUG, [{ after: 'renamed', kind: 'star', side: 'left' }]).size).toBe(0)
  })
})

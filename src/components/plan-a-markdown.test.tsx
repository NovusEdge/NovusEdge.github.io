import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { i18nFor } from '../i18n'
import { PlanAMarkdown } from './plan-a-markdown'

const SLUG = 'fine-tuning-openjev-on-62695-ab-tests'

function render(md: string, slug?: string) {
  return renderToStaticMarkup(
    <I18nextProvider i18n={i18nFor('en')}>
      <PlanAMarkdown slug={slug}>{md}</PlanAMarkdown>
    </I18nextProvider>,
  )
}

describe('PlanAMarkdown', () => {
  it('takes heading ids from the post it is given', () => {
    expect(render('## The setup\n\ntext\n\n## And yet', SLUG)).toContain('id="and-yet"')
  })

  it('keeps Plan A ids by default', () => {
    expect(render('## The Timing')).toContain('id="the-timing"')
  })

  it('swaps an image for the figure registered under its src', () => {
    const html = renderToStaticMarkup(
      <I18nextProvider i18n={i18nFor('en')}>
        <PlanAMarkdown slug={SLUG} figures={{ '/a.png': <svg data-test="drawn" /> }}>
          {'![Alt text.](/a.png)\n\n![Other.](/b.png)'}
        </PlanAMarkdown>
      </I18nextProvider>,
    )
    expect(html).toContain('data-test="drawn"')
    expect(html).toContain('aria-label="Alt text."')
    expect(html).not.toContain('src="/a.png"')
    expect(html).toContain('src="/b.png"')
  })

  it('leaves quotes inside fenced code straight', () => {
    const html = render('He said "hi".\n\n```python\ntok("x")\n```', SLUG)
    expect(html).toContain('tok(&quot;x&quot;)')
    expect(html).toContain('“hi”')
  })
})

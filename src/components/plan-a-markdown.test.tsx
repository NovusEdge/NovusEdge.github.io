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
    expect(render('## Data and method\n\ntext\n\n## Cross-split evaluation', SLUG)).toContain('id="cross-split-evaluation"')
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

  it('marks figures in prose and leaves years alone', () => {
    const html = renderToStaticMarkup(
      <I18nextProvider i18n={i18nFor('en')}>
        <PlanAMarkdown slug={SLUG} numbers>
          {'In 2015 it hit **0.812**, up +0.107 on 62,695 arms, 90.3% of the time.'}
        </PlanAMarkdown>
      </I18nextProvider>,
    )
    for (const n of ['0.812', '+0.107', '62,695', '90.3%']) expect(html).toContain(`<span class="pa-num">${n}</span>`)
    expect(html).not.toContain('<span class="pa-num">2015</span>')
  })

  it('highlights fenced code and gives it a language tab and a copy button', () => {
    const html = renderToStaticMarkup(
      <I18nextProvider i18n={i18nFor('en')}>
        <PlanAMarkdown slug={SLUG} highlight>
          {'```python\nfrom x import y\n```'}
        </PlanAMarkdown>
      </I18nextProvider>,
    )
    expect(html).toContain('hljs-keyword')
    expect(html).toContain('>python<')
    expect(html).toMatch(/<button[^>]*>copy<\/button>/)
  })

  it('leaves quotes inside fenced code straight', () => {
    const html = render('He said "hi".\n\n```python\ntok("x")\n```', SLUG)
    expect(html).toContain('tok(&quot;x&quot;)')
    expect(html).toContain('“hi”')
  })
})

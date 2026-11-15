import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { TextToneMarkdown } from './markdown'

const figures = { tones: <div data-fig="tones" />, stress_list: <div data-fig="stress_list" /> }
const render = (md: string, locale = 'en') =>
  renderToStaticMarkup(<TextToneMarkdown figures={figures} locale={locale}>{md}</TextToneMarkdown>)

describe('TextToneMarkdown', () => {
  it('renders a paragraph that is exactly a placeholder as its figure', () => {
    const html = render('before\n\n{{tones}}\n\nafter')
    expect(html).toContain('<div data-fig="tones"></div>')
    expect(html).not.toContain('{{tones}}')
  })

  it('reads an underscored placeholder as one token, not emphasis', () => {
    expect(render('{{stress_list}}')).toContain('data-fig="stress_list"')
  })

  it('leaves a placeholder inside other text, or an unknown one, as prose', () => {
    expect(render('see {{tones}} here')).toContain('<p>see {{tones}} here</p>')
    expect(render('{{nope}}')).toContain('<p>{{nope}}</p>')
  })

  it('renders a #stat link as a stat span with no link', () => {
    const html = render('about [52 words a minute](#stat) today')
    expect(html).toContain('<span class="tt-n">52 words a minute</span>')
    expect(html).not.toContain('href="#stat"')
  })

  it('adds the trailing slash to internal links', () => {
    expect(render('[flocc](/portfolio/flocc)')).toContain('href="/portfolio/flocc/"')
  })

  it('marks Arabic runs right-to-left in every locale', () => {
    for (const locale of ['en', 'zh']) {
      expect(render('so كتب is', locale)).toContain('<span lang="ar" dir="rtl">كتب</span>')
    }
  })

  it('marks Han runs, the poem comma included, except where Han is the body text', () => {
    expect(render('opens with 石室诗士施氏，嗜狮 (x)')).toContain('<span lang="zh-Hans">石室诗士施氏，嗜狮</span>')
    expect(render('is 妈, mother', 'zh')).not.toContain('lang="zh-Hans"')
    expect(render('is 妈, mother', 'ja')).not.toContain('lang="zh-Hans"')
  })
})

import { describe, expect, it } from 'vitest'
import { blogHeadings } from './blog-headings'

describe('translated blog headings', () => {
  it('keeps distinct canonical anchors for CJK headings and their source lines', () => {
    const headings = blogHeadings('## 数学の話\n\n本文\n\n## 定義の話', 'what-did-we-all-miss')
    expect(headings).toEqual([
      { id: 'the-million-dollar-joke', text: '数学の話', line: 1 },
      { id: 'whose-definition', text: '定義の話', line: 5 },
    ])
  })

  it('preserves Plan A animation anchors in translated content', () => {
    const headings = blogHeadings('## 時間\n\n## 計画\n\n## 自己改善', 'plan-a-ai')
    expect(headings.map((head) => head.id)).toEqual(['the-timing', 'what-plan-a-says', 'self-improvement-does-not-need-more-compute'])
  })
})

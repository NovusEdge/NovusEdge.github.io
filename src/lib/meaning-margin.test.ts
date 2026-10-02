import { describe, expect, it } from 'vitest'
import { arrangeMargin } from './meaning-margin'

const t = (value: string) => ({ type: 'text', value })
const e = (tagName: string, children: unknown[] = [], properties: Record<string, unknown> = {}) => ({ type: 'element', tagName, properties, children })
const p = (s: string) => e('p', [t(s)])
const note = (s: string) => e('blockquote', [t('\n'), p(`[!note] ${s}`), t('\n')])
const img = (alt: string) => e('p', [e('img', [], { src: '/a.webp', alt })])
const voices = () => e('blockquote', [p('[!voices]'), e('ul', [e('li', [t('← one')])])])

// Children of the arranged root, without the whitespace text nodes between blocks.
const blocks = (nodes: unknown[]) => arrangeMargin(nodes as never).filter((n) => n.type === 'element')
const cls = (n: { properties?: Record<string, unknown> }) => (n.properties?.className as string[]) ?? []

describe('arrangeMargin', () => {
  it('pairs a note with the paragraph before it', () => {
    const [row] = blocks([p('a long enough paragraph '.repeat(10)), t('\n'), note('is it, though?')])
    expect(cls(row)).toEqual(['ms-row'])
    const [side, text] = row.children!
    expect(text.tagName).toBe('p')
    expect(cls(side)).toEqual(['ms-side'])
    expect(side.children![0].tagName).toBe('aside')
    expect(side.children![0].children![0].value).toBe('is it, though?')
  })

  it('stacks consecutive notes and images in one margin', () => {
    const [row] = blocks([p('x'.repeat(200)), note('one'), img('a sketch'), note('two')])
    const side = row.children![0]
    expect(side.children!.map((c) => c.tagName)).toEqual(['aside', 'figure', 'aside'])
    expect(side.children![1].children![1].children![0].value).toBe('a sketch')
  })

  it('leaves a note inline when nothing can anchor it', () => {
    const out = blocks([note('first thing'), voices(), note('after the voices')])
    expect(out.map((n) => n.tagName)).toEqual(['aside', 'blockquote', 'aside'])
  })

  it('keeps ordinary quotes and paragraphs with text and an image as they are', () => {
    const mixed = e('p', [t('see '), e('img', [], { src: '/a.webp', alt: 'x' })])
    const out = blocks([p('x'.repeat(200)), e('blockquote', [p('just a quote')]), mixed])
    expect(out.map((n) => n.tagName)).toEqual(['p', 'blockquote', 'p'])
  })

  it('marks a short first paragraph as the lede, and only that', () => {
    expect(cls(blocks([p('cogito, ergo sum.'), p('next')])[0])).toContain('ms-lede')
    expect(cls(blocks([p('x'.repeat(200)), p('short')])[0])).not.toContain('ms-lede')
    expect(cls(blocks([p('x'.repeat(200)), p('short')])[1])).not.toContain('ms-lede')
  })
})

import { describe, it, expect } from 'vitest'
import { parseFrontmatter } from './frontmatter'

describe('parseFrontmatter', () => {
  it('parses scalar fields, inline arrays, and strips quotes', () => {
    const raw = `---\ntitle: hello, world!\ndate: 2023-05-23\ntags: [writeup, ctf]\ndescription: "a quoted one"\n---\n\n# Body\n`
    const { data, content } = parseFrontmatter(raw)
    expect(data.title).toBe('hello, world!')
    expect(data.date).toBe('2023-05-23')
    expect(data.tags).toEqual(['writeup', 'ctf'])
    expect(data.description).toBe('a quoted one')
    expect(content.trim()).toBe('# Body')
  })

  it('returns whole input as content when no frontmatter', () => {
    const { data, content } = parseFrontmatter('# just markdown')
    expect(data).toEqual({})
    expect(content).toBe('# just markdown')
  })
})

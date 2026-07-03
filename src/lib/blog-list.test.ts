import { describe, it, expect } from 'vitest'
import { filterPosts, groupByYear } from './blog-list'
import type { Post } from './posts'

const p = (slug: string, date: string, title = slug, tags: string[] = []): Post => ({
  slug, date, title, tags, description: '', content: '',
})

describe('filterPosts', () => {
  const list = [p('alfred', '2023-06-13', 'Alfred Writeup', ['ctf']), p('uni', '2023-09-07', 'University!!', ['blog-update'])]
  it('matches title case-insensitively', () => {
    expect(filterPosts(list, 'ALFRED')).toHaveLength(1)
  })
  it('matches tags', () => {
    expect(filterPosts(list, 'ctf')[0].slug).toBe('alfred')
  })
  it('empty query returns all', () => {
    expect(filterPosts(list, '  ')).toHaveLength(2)
  })
})

describe('groupByYear', () => {
  it('groups date-desc posts into year buckets, newest year first', () => {
    const g = groupByYear([p('b', '2024-01-01'), p('a', '2023-06-01')])
    expect(g.map((x) => x.year)).toEqual(['2024', '2023'])
    expect(g[1].posts[0].slug).toBe('a')
  })
})

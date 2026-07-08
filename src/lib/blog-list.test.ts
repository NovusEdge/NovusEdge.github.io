import { describe, it, expect } from 'vitest'
import { filterPosts, groupByYear, fuzzyMatch } from './blog-list'
import type { Post } from './posts'

const p = (slug: string, date: string, title = slug, tags: string[] = [], description = ''): Post => ({
  slug, date, title, tags, description, content: '',
})

describe('fuzzyMatch', () => {
  it('matches a plain substring', () => {
    expect(fuzzyMatch('alfred writeup', 'alfred')).toBe(true)
  })
  it('matches a subsequence (typo/partial tolerant)', () => {
    expect(fuzzyMatch('alfred writeup', 'alfrd')).toBe(true) // dropped an 'e'
    expect(fuzzyMatch('tiling window managers', 'tlng')).toBe(true)
  })
  it('rejects when a char is missing or out of order', () => {
    expect(fuzzyMatch('alfred', 'alfredz')).toBe(false)
    expect(fuzzyMatch('alfred', 'derfla')).toBe(false)
  })
})

describe('filterPosts', () => {
  const list = [
    p('alfred', '2023-06-13', 'Alfred Writeup', ['ctf'], 'bruteforcing a jenkins login'),
    p('uni', '2023-09-07', 'University!!', ['blog-update'], 'moving to finland'),
  ]
  it('matches title case-insensitively', () => {
    expect(filterPosts(list, 'ALFRED')).toHaveLength(1)
  })
  it('matches tags', () => {
    expect(filterPosts(list, 'ctf')[0].slug).toBe('alfred')
  })
  it('matches fuzzily on title', () => {
    expect(filterPosts(list, 'alfrd')[0].slug).toBe('alfred')
  })
  it('matches on description', () => {
    expect(filterPosts(list, 'jenkins')[0].slug).toBe('alfred')
    expect(filterPosts(list, 'finland')[0].slug).toBe('uni')
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

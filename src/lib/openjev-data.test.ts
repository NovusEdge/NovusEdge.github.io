import { describe, expect, it } from 'vitest'
import { posts } from './posts'
import { blogHeadings } from './blog-headings'
import { BANDS, BIG, LOSS, OPENJEV_SLUG, ROWS, STATES, STATE_HEADINGS, rowLayout, stateAt, transitionOps } from './openjev-data'

const post = posts.find((p) => p.slug === OPENJEV_SLUG)!

describe('openjev board data', () => {
  it('finds the post', () => {
    expect(post).toBeDefined()
  })

  it('keys every state to a heading the post still has', () => {
    const ids = blogHeadings(post.content, OPENJEV_SLUG).map((h) => h.id)
    for (const [id] of STATE_HEADINGS) expect(ids, id).toContain(id)
  })

  it('maps the last heading to the last state', () => {
    expect(STATE_HEADINGS.at(-1)![1]).toBe(STATES.length - 1)
  })

  it('shows only numbers the post states', () => {
    const shown = [
      ...Object.values(ROWS).flatMap((r) => ('display' in r ? [r.display] : [])),
      ...BANDS.map((b) => b.display),
      ...LOSS.liveDisplay,
      LOSS.deadDisplay,
      BIG.display,
    ]
    for (const n of shown) expect(post.content, n).toContain(n)
  })

  it('orders every state by score, empty rows last', () => {
    for (const s of STATES) {
      const values = s.rows.map((id) => ROWS[id].value ?? -Infinity)
      expect(values).toEqual([...values].sort((a, b) => b - a))
    }
  })

  it('draws humans as a tick with no bar', () => {
    expect(ROWS.humans.mark).toBe('tick')
    expect(rowLayout(0).humans.frac).toBe(0)
  })

  it('places shown rows in order and hides the rest', () => {
    const lay = rowLayout(0)
    expect(lay.claim).toMatchObject({ shown: true, y: 30 })
    expect(lay.sota).toMatchObject({ shown: true, y: 58 })
    expect(lay.email.shown).toBe(false)
  })

  it('fades out a row left visible by an interrupted transition', () => {
    const stale = new Set(['exploratory', 'sota', 'humans', 'llama'])
    const ops = transitionOps(4, (id) => stale.has(id))
    expect(ops.exploratory).toMatchObject({ opacity: 0 })
    expect(ops.rank).toMatchObject({ opacity: 1, y: 86, snap: true })
    expect(ops.sota).toMatchObject({ opacity: 1, y: 170, snap: false })
  })

  it('picks the last heading above the line', () => {
    const tops = new Map([['data-and-method', -400], ['cross-split-evaluation', 200], ['split-structure', 900]])
    expect(stateAt(tops, 480)).toBe(1)
    expect(stateAt(new Map(), 480)).toBe(0)
  })
})

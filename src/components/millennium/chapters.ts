import type { Zone } from './scene'

export const SLOTS = ['timeline', 'eth_figure', 'ns_figure', 'rh_figure', 'proof_scale', 'lean_statement'] as const
export type Slot = (typeof SLOTS)[number]

export type Block = { kind: 'md'; text: string } | { kind: 'slot'; name: Slot }
export type Source = { host: string; url: string }
export type Chapter = {
  id: string
  // heading text without a trailing parenthesis, which is returned as `aside`
  title: string
  aside?: string
  blocks: Block[]
  sources: Source[]
}

type Look = {
  kanji: string
  // the name in the chapter rail when the heading is too long for it
  short?: string
  zone: Zone
  // a gap above the chapter where the figure shows at full strength
  opens?: 'window' | 'still'
  paper?: boolean
  // rows of RESULTS whose status is shown under the heading
  results?: number[]
}

// Keyed by heading id. A heading that is not listed still renders, as a plain chapter.
export const LOOKS: Record<string, Look> = {
  friday: { kanji: '金曜', zone: 'read' },
  'how-we-got-here': { kanji: '経緯', zone: 'read' },
  eth: { kanji: '時間', zone: 'read', opens: 'window', results: [6] },
  navierstokes: { kanji: '流体', zone: 'read', opens: 'window', results: [4, 7] },
  'the-riemann-hypothesis': { kanji: '零点', short: 'Riemann', zone: 'read', opens: 'window', results: [8] },
  'is-it-real': { kanji: '検証', zone: 'after', opens: 'still' },
  'where-this-goes-speculation': { kanji: '推測', zone: 'next', paper: true },
  'whats-next': { kanji: '次', zone: 'next' },
}

export const PLAIN: Look = { kanji: '', zone: 'read' }

// The same ids markdown.tsx gives its headings, so links to a section keep working.
export const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')

const HEADING = /^## +(.+?)[ \t]*$/gm
const PLACEHOLDER = /^\{\{(\w+)\}\}[ \t]*$/gm
const LINK = /\[[^\]]+\]\((https?:\/\/[^)\s]+)\)/g
const TITLE = /^(.*?)\s*(\([^)]*\))?$/

export const splitTitle = (text: string): [string, string | undefined] => {
  const [, main, aside] = TITLE.exec(text) ?? [null, text, undefined]
  return [main ?? text, aside]
}

function blocks(body: string): Block[] {
  const out: Block[] = []
  let at = 0
  const push = (text: string) => {
    const t = text.trim()
    if (!t) return
    const last = out[out.length - 1]
    // An unknown placeholder stays in the text, so nothing is silently dropped.
    if (last?.kind === 'md') last.text += `\n\n${t}`
    else out.push({ kind: 'md', text: t })
  }
  for (const m of body.matchAll(PLACEHOLDER)) {
    if (!(SLOTS as readonly string[]).includes(m[1])) continue
    push(body.slice(at, m.index))
    out.push({ kind: 'slot', name: m[1] as Slot })
    at = m.index + m[0].length
  }
  push(body.slice(at))
  return out
}

function sources(body: string): Source[] {
  const seen = new Map<string, Source>()
  for (const [, url] of body.matchAll(LINK)) {
    if (!seen.has(url)) seen.set(url, { url, host: new URL(url).hostname.replace(/^www\./, '') })
  }
  return [...seen.values()]
}

// lead: any text above the first heading. Each `## ` heading opens a chapter; a `{{slot}}` line of
// its own inside one places a figure there.
export function parsePost(content: string): { lead: string; chapters: Chapter[] } {
  const heads = [...content.matchAll(HEADING)]
  const lead = (heads.length ? content.slice(0, heads[0].index) : content).trim()
  const chapters = heads.map((h, i) => {
    const body = content.slice(h.index + h[0].length, heads[i + 1]?.index ?? content.length)
    const [title, aside] = splitTitle(h[1])
    return { id: slug(h[1]), title, aside, blocks: blocks(body), sources: sources(body) }
  })
  return { lead, chapters }
}

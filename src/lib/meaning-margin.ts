import { nodeText, voicesFromNode } from './meaning-voices'

type Hast = { type: string; tagName?: string; value?: string; properties?: Record<string, unknown>; children?: Hast[] }

const NOTE = '[!note]'
// Blocks a margin note or image can sit beside. The voices stage and rules are full-width or
// decorative, so anything after them renders inline instead.
const ANCHORS = new Set(['p', 'ul', 'ol', 'h2', 'h3', 'pre', 'table', 'blockquote'])
const LEDE_MAX = 140

const isEl = (n: Hast | undefined): n is Hast & { tagName: string; children: Hast[] } => n?.type === 'element'
const el = (tagName: string, className: string, children: Hast[]): Hast => ({ type: 'element', tagName, properties: { className: [className] }, children })
const classes = (n: Hast) => (n.properties?.className as string[] | undefined) ?? []

function toNote(n: Hast): Hast | null {
  if (n.tagName !== 'blockquote') return null
  const p = n.children?.find(isEl)
  const first = p?.children?.[0]
  if (p?.tagName !== 'p' || first?.type !== 'text' || !first.value?.trimStart().startsWith(NOTE)) return null
  const rest = first.value.trimStart().slice(NOTE.length).trimStart()
  return el('aside', 'ms-note', [...(rest ? [{ type: 'text', value: rest }] : []), ...(p.children ?? []).slice(1)])
}

function toFigure(n: Hast): Hast | null {
  if (n.tagName !== 'p') return null
  const kids = n.children ?? []
  const imgs = kids.filter(isEl)
  if (imgs.length !== 1 || imgs[0].tagName !== 'img') return null
  if (kids.some((k) => k.type === 'text' && k.value?.trim())) return null
  const alt = String(imgs[0].properties?.alt ?? '')
  return el('figure', 'ms-fig', [imgs[0], ...(alt ? [el('figcaption', 'ms-fig-cap', [{ type: 'text', value: alt }])] : [])])
}

/**
 * Pairs each block with the `> [!note]` quotes and lone images that follow it, as a
 * `div.ms-row` of [block, div.ms-side]. A short first paragraph becomes the handwritten lede.
 */
export function arrangeMargin(children: Hast[]): Hast[] {
  const out: Hast[] = []
  let lastBlock = -1
  for (const c of children) {
    if (!isEl(c)) {
      out.push(c)
      continue
    }
    const side = toNote(c) ?? toFigure(c)
    const prev = out[lastBlock]
    if (side && prev && (classes(prev).includes('ms-row') || (ANCHORS.has(prev.tagName ?? '') && !voicesFromNode(prev)))) {
      if (classes(prev).includes('ms-row')) prev.children![1].children!.push(side)
      else out[lastBlock] = el('div', 'ms-row', [prev, el('div', 'ms-side', [side])])
      continue
    }
    out.push(side ?? c)
    lastBlock = out.length - 1
  }
  const first = out.find(isEl)
  if (first?.tagName === 'p' && !toFigure(first) && nodeText(first).trim().length <= LEDE_MAX) {
    first.properties = { ...first.properties, className: [...classes(first), 'ms-lede'] }
  }
  return out
}

export function rehypeMargin() {
  return (tree: Hast) => {
    tree.children = arrangeMargin(tree.children ?? [])
  }
}

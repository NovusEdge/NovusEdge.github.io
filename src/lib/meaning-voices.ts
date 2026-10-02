export type VoiceSide = 'left' | 'right'
export type VoiceLine = { side: VoiceSide; text: string }

const MARKER = '[!voices]'

type HastNode = { type?: string; tagName?: string; value?: string; children?: HastNode[] }

export function nodeText(node: unknown): string {
  const n = node as HastNode | null
  if (!n) return ''
  if (n.value) return n.value
  return (n.children ?? []).map(nodeText).join('')
}

export function parseVoiceItem(raw: string): VoiceLine | null {
  const m = raw.trim().match(/^([←→])\s*(.*)$/s)
  if (!m || !m[2].trim()) return null
  return { side: m[1] === '←' ? 'left' : 'right', text: m[2].trim() }
}

export function voicesFromNode(node: unknown): VoiceLine[] | null {
  const kids = ((node as HastNode | null)?.children ?? []).filter((c) => c.type === 'element')
  if (kids[0]?.tagName !== 'p' || nodeText(kids[0]).trim() !== MARKER) return null
  const lines = kids
    .filter((c) => c.tagName === 'ul' || c.tagName === 'ol')
    .flatMap((list) => (list.children ?? []).filter((c) => c.tagName === 'li'))
    .map((li) => parseVoiceItem(nodeText(li)))
    .filter((l): l is VoiceLine => l !== null)
  return lines.length ? lines : null
}

// While animating, each side fills its own column from the top; reading order comes from
// the reveal, so the stage needs only as many rows as the longer side.
export function sideRows(lines: VoiceLine[]) {
  const count = { left: 0, right: 0 }
  const row = lines.map((l) => ++count[l.side])
  return { row, rows: Math.max(count.left, count.right) }
}
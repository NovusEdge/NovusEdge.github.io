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

// A jump past several lines plays only the newest, so a fling or an anchor
// link never fires a burst of clips.
export function linesToPlay(prev: number, next: number, played: ReadonlySet<number>): number[] {
  if (next <= prev || next === 0 || played.has(next - 1)) return []
  return [next - 1]
}

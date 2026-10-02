import type { Font, PathCommand } from 'opentype.js'

// Path.toPathData in opentype.js 2.0.0 emits NaN for some coordinates (its rounding cache
// overflows), so the path data is written here from the commands.
export function pathData(commands: PathCommand[]) {
  const n = (v: number) => v.toFixed(1)
  return commands
    .map((c) => {
      if (c.type === 'Z') return 'Z'
      if (c.type === 'Q') return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`
      if (c.type === 'C') return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`
      return `${c.type}${n(c.x)} ${n(c.y)}`
    })
    .join('')
}

// Caveat 700 subset to Latin (pyftsubset U+0020-007E,U+00A0-017F,U+2010-2027, kern kept).
// A locale outside that range fails canPen and gets the ink wipe instead.
const FONT_URL = '/fonts/Caveat-Bold.ttf'

let fontPromise: Promise<Font> | null = null

export function loadPenFont() {
  fontPromise ??= Promise.all([import('opentype.js'), fetch(FONT_URL).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(`${FONT_URL}: ${r.status}`))))]).then(
    ([ot, buf]) => ot.parse(buf),
  )
  // A failed load is retried on the next call instead of being cached.
  fontPromise.catch(() => (fontPromise = null))
  return fontPromise
}

export function penLines(text: string, measure: (s: string) => number, maxWidth: number) {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word
    if (line && measure(next) > maxWidth) {
      lines.push(line)
      line = word
    } else line = next
  }
  if (line) lines.push(line)
  return lines
}

export const canPen = (font: Font, text: string) => [...text].every((c) => /\s/.test(c) || font.hasChar(c))

export function penLayout(font: Font, text: string, fontSize: number, maxWidth: number, lineHeight: number) {
  const lh = fontSize * lineHeight
  const ascent = (font.ascender / font.unitsPerEm) * fontSize
  const em = ((font.ascender - font.descender) / font.unitsPerEm) * fontSize
  const lines = penLines(text, (s) => font.getAdvanceWidth(s, fontSize), maxWidth)
  const glyphs = lines.flatMap((line, i) =>
    font
      .getPaths(line, 0, i * lh + (lh - em) / 2 + ascent, fontSize)
      .map((p) => pathData(p.commands))
      .filter(Boolean),
  )
  const width = Math.max(0, ...lines.map((l) => font.getAdvanceWidth(l, fontSize)))
  return { glyphs, width, height: lines.length * lh }
}

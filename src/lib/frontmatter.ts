// ponytail: flat key: value + inline [a, b] arrays only — that's the whole blog schema.
// Swap for a yaml lib if nested frontmatter ever appears.
export function parseFrontmatter(raw: string): {
  data: Record<string, string | string[]>
  content: string
} {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  if (!m) return { data: {}, content: raw }
  const data: Record<string, string | string[]> = {}
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':')
    if (i === -1) continue
    const key = line.slice(0, i).trim()
    const v = line.slice(i + 1).trim()
    if (v.startsWith('[') && v.endsWith(']')) {
      data[key] = v
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean)
    } else {
      data[key] = v.replace(/^['"]|['"]$/g, '')
    }
  }
  return { data, content: raw.slice(m[0].length) }
}

export type Blip = {
  date: string
  text?: string
  media?: string
  tags?: string[]
}

// ponytail: the schema is a flat list of `- key: value` blocks (see blips.yaml
// header) - no nesting, no multiline scalars. A hand-rolled parser covers that
// without pulling in a yaml dependency. Swap for a real yaml lib if the
// schema ever grows past this.
function parseValue(v: string): string | string[] {
  const trimmed = v.trim()
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean)
  }
  return trimmed.replace(/^['"]|['"]$/g, '')
}

function parseBlips(raw: string): Blip[] {
  const items: Record<string, string | string[]>[] = []
  let current: Record<string, string | string[]> | null = null

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || trimmed === '[]') continue

    const itemStart = /^-\s*(\w+):\s*(.*)$/.exec(trimmed)
    const cont = /^(\w+):\s*(.*)$/.exec(trimmed)

    if (itemStart) {
      if (current) items.push(current)
      current = { [itemStart[1]]: parseValue(itemStart[2]) }
    } else if (cont && current) {
      current[cont[1]] = parseValue(cont[2])
    }
  }
  if (current) items.push(current)

  return items
    .filter((item) => typeof item.date === 'string' && item.date)
    .map((item) => ({
      date: item.date as string,
      text: typeof item.text === 'string' ? item.text : undefined,
      media: typeof item.media === 'string' ? item.media : undefined,
      tags: Array.isArray(item.tags) ? item.tags : undefined,
    }))
}

const yamlFiles = import.meta.glob('../content/blips/blips.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const rawYaml = Object.values(yamlFiles)[0] ?? ''

// filename (e.g. "shot.png") -> resolved asset URL, via Vite's asset pipeline
const assetFiles = import.meta.glob('../content/blips/assets/*', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>

export function getBlipMediaUrl(filename?: string): string | undefined {
  if (!filename) return undefined
  const match = Object.entries(assetFiles).find(([path]) => path.endsWith(`/${filename}`))
  return match?.[1]
}

export const blips: Blip[] = parseBlips(rawYaml).sort((a, b) => b.date.localeCompare(a.date))

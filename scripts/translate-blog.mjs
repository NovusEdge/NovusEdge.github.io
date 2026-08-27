import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'

// Verified against https://ai.google.dev/gemini-api/docs/models on 2026-08-27.
const MODEL = 'gemini-3.7-flash'
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

const LOCALES = JSON.parse(readFileSync('src/i18n/locales.json', 'utf8')).filter((l) => !l.default)
const BLOG_DIR = 'src/content/blog'
const LOCK_PATH = 'src/i18n/content-translations.lock.json'

const force = process.argv.includes('--force')
const checkOnly = process.argv.includes('--check')
const dryRun = process.argv.includes('--dry-run')

const key = process.env.GEMINI_API_KEY
if (!key && !checkOnly && !dryRun) {
  console.error('GEMINI_API_KEY is not set. Run with: node --env-file=<path to .env> scripts/translate-blog.mjs')
  process.exit(1)
}

const sha = (s) => createHash('sha256').update(s).digest('hex')
const readJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {})
const writeJson = (p, o) =>
  writeFileSync(p, JSON.stringify(Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]])), null, 2) + '\n')

const slugs = readdirSync(BLOG_DIR)
  .filter((f) => f.endsWith('.md') && !/\.[a-z]{2}\.md$/.test(f))
  .map((f) => f.slice(0, -3))

function parseFrontmatter(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  if (!m) return { data: {}, order: [], body: raw }
  const data = {}
  const order = []
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':')
    if (i === -1) continue
    const key = line.slice(0, i).trim()
    data[key] = line.slice(i + 1).trim()
    order.push(key)
  }
  return { data, order, body: raw.slice(m[0].length) }
}

// Splits on fenced code blocks so we never send code through translation.
function splitChunks(body) {
  const parts = body.split(/(```[\s\S]*?```)/)
  return parts.map((text, i) => ({ text, isCode: i % 2 === 1 }))
}

async function translateStrings(locale, strings) {
  const prompt = [
    `Translate the following JSON array of strings from English into ${locale.label} (${locale.htmlLang}).`,
    'These are excerpts from a blog post on a personal website about software engineering,',
    'security research, and AI systems.',
    '',
    'Rules:',
    '- Return only a JSON array of strings, in the same order, same length as the input.',
    '- Preserve markdown syntax exactly (links, headings, emphasis, inline code spans).',
    '- Preserve any {{placeholder}} tokens exactly as written, including their spelling.',
    '- Keep the register casual and match the tone of the original.',
    '- Leave proper nouns, brand names, and technology names untranslated.',
    '- An empty string stays an empty string.',
    '',
    JSON.stringify(strings, null, 2),
  ].join('\n')

  const res = await fetch(`${ENDPOINT}?key=${key}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  })
  if (!res.ok) throw new Error(`${locale.code}: ${res.status} ${await res.text()}`)
  const resBody = await res.json()
  const parsed = JSON.parse(resBody.candidates[0].content.parts[0].text)
  if (!Array.isArray(parsed) || parsed.length !== strings.length) {
    throw new Error(`${locale.code}: expected an array of ${strings.length} strings, got ${JSON.stringify(parsed)}`)
  }
  return parsed
}

function buildFrontmatter(data, order, overrides) {
  const lines = order.map((k) => {
    const v = k in overrides ? overrides[k] : data[k]
    return `${k}: ${v}`
  })
  return `---\n${lines.join('\n')}\n---\n`
}

const lock = readJson(LOCK_PATH)
const staleSlugs = slugs.filter((slug) => {
  const raw = readFileSync(`${BLOG_DIR}/${slug}.md`, 'utf8')
  return force || lock[slug] !== sha(raw)
})

if (checkOnly) {
  const missing = []
  for (const slug of slugs) {
    for (const locale of LOCALES) {
      if (!existsSync(`${BLOG_DIR}/${slug}.${locale.code}.md`)) missing.push(`${slug}.${locale.code}`)
    }
  }
  if (staleSlugs.length || missing.length) {
    if (staleSlugs.length) console.error(`stale posts: ${staleSlugs.join(', ')}`)
    if (missing.length) console.error(`missing translations: ${missing.join(', ')}`)
    process.exit(1)
  }
  console.log('blog translations are current')
  process.exit(0)
}

const todoSlugs = dryRun ? staleSlugs.slice(0, 1) : staleSlugs
if (!todoSlugs.length) {
  console.log('nothing to translate')
  process.exit(0)
}

let failed = false
for (const slug of todoSlugs) {
  const raw = readFileSync(`${BLOG_DIR}/${slug}.md`, 'utf8')
  const { data, order, body } = parseFrontmatter(raw)
  const chunks = splitChunks(body)
  const proseIdx = chunks.map((c, i) => (c.isCode ? -1 : i)).filter((i) => i !== -1)
  const proseStrings = [data.title ?? '', data.description ?? '', ...proseIdx.map((i) => chunks[i].text)]

  for (const locale of LOCALES) {
    const outPath = `${BLOG_DIR}/${slug}.${locale.code}.md`
    let translated
    try {
      translated = await translateStrings(locale, proseStrings)
    } catch (err) {
      console.error(err.message)
      failed = true
      continue
    }

    const [title, description, ...proseTranslated] = translated
    proseIdx.forEach((chunkIndex, j) => {
      chunks[chunkIndex] = { ...chunks[chunkIndex], text: proseTranslated[j] }
    })
    const translatedBody = chunks.map((c) => c.text).join('')
    const frontmatter = buildFrontmatter(data, order, { title, description })
    const out = frontmatter + translatedBody

    if (dryRun) {
      console.log(`--- ${outPath} (dry run) ---`)
      console.log(out)
    } else {
      writeFileSync(outPath, out)
      console.log(`wrote ${outPath}`)
    }
  }

  if (!dryRun) lock[slug] = sha(raw)
}

if (failed) {
  console.error('some translations were rejected. The lock file is unchanged, so the next run retries them.')
  process.exit(1)
}

if (!dryRun) {
  writeJson(LOCK_PATH, lock)
  console.log(`lock updated for ${todoSlugs.length} post(s)`)
}

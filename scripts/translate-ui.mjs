import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'

// Verified against https://ai.google.dev/gemini-api/docs/models on 2026-08-27.
const MODEL = 'gemini-3.7-flash'
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

const LOCALES = JSON.parse(readFileSync('src/i18n/locales.json', 'utf8'))
const EN_PATH = 'src/i18n/locales/en.json'
const LOCK_PATH = 'src/i18n/translations.lock.json'

const force = process.argv.includes('--force')
const checkOnly = process.argv.includes('--check')

const key = process.env.GEMINI_API_KEY
if (!key && !checkOnly) {
  console.error('GEMINI_API_KEY is not set. Run with: node --env-file=<path to .env> scripts/translate-ui.mjs')
  process.exit(1)
}

const sha = (s) => createHash('sha256').update(s).digest('hex')
const tokens = (s) => new Set(Array.from(s.matchAll(/\{\{(\w+)\}\}/g), (m) => m[1]))
const sameTokens = (a, b) => a.size === b.size && [...a].every((x) => b.has(x))
const readJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {})
const writeJson = (p, o) =>
  writeFileSync(p, JSON.stringify(Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]])), null, 2) + '\n')

const english = JSON.parse(readFileSync(EN_PATH, 'utf8'))
const lock = readJson(LOCK_PATH)

const staleKeys = Object.keys(english).filter((k) => force || lock[k] !== sha(english[k]))

async function translate(locale, entries) {
  const prompt = [
    `Translate this JSON object of user interface strings from English into ${locale.label} (${locale.htmlLang}).`,
    'These are navigation labels, buttons, headings, and accessibility labels for a personal website',
    'about software engineering, security research, and AI systems.',
    '',
    'Rules:',
    '- Return only a JSON object. No prose, no code fence.',
    '- Keep every key exactly as given.',
    '- Keep every {{placeholder}} token exactly as written, including its spelling.',
    '- Keep the register casual and short. These are interface labels, not documentation.',
    '- Leave proper nouns, brand names, and technology names untranslated.',
    '',
    JSON.stringify(entries, null, 2),
  ].join('\n')

  const res = await fetch(`${ENDPOINT}?key=${key}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      // no temperature: Google deprecated the sampling parameters on current models in July 2026
      generationConfig: { responseMimeType: 'application/json' },
    }),
  })
  if (!res.ok) throw new Error(`${locale.code}: ${res.status} ${await res.text()}`)
  const body = await res.json()
  return JSON.parse(body.candidates[0].content.parts[0].text)
}

if (checkOnly) {
  if (staleKeys.length) {
    console.error(`stale or untranslated keys: ${staleKeys.join(', ')}`)
    process.exit(1)
  }
  console.log('translations are current')
  process.exit(0)
}

let failed = false
for (const locale of LOCALES.filter((l) => !l.default)) {
  const path = `src/i18n/locales/${locale.code}.json`
  const catalog = readJson(path)
  const missing = Object.keys(english).filter((k) => !(k in catalog))
  const todo = [...new Set([...staleKeys, ...missing])]
  if (!todo.length) {
    console.log(`${locale.code}: up to date`)
    continue
  }

  const translated = await translate(locale, Object.fromEntries(todo.map((k) => [k, english[k]])))

  for (const k of todo) {
    const value = translated[k]
    if (typeof value !== 'string') {
      console.error(`${locale.code}: ${k} came back as ${typeof value}, keeping the previous value`)
      failed = true
      continue
    }
    if (!sameTokens(tokens(value), tokens(english[k]))) {
      console.error(`${locale.code}: ${k} changed its {{placeholders}}, keeping the previous value`)
      failed = true
      continue
    }
    catalog[k] = value
  }

  for (const k of Object.keys(catalog)) if (!(k in english)) delete catalog[k]
  writeJson(path, catalog)
  console.log(`${locale.code}: wrote ${todo.length} keys`)
}

if (failed) {
  console.error('some keys were rejected. The lock file is unchanged, so the next run retries them.')
  process.exit(1)
}

writeJson(LOCK_PATH, Object.fromEntries(Object.keys(english).map((k) => [k, sha(english[k])])))
console.log(`lock updated for ${Object.keys(english).length} keys`)

import { readFileSync, readdirSync, writeFileSync, mkdirSync, cpSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ORIGIN = 'https://novusedge.github.io'
const dist = 'dist'

// ponytail: 15-line frontmatter re-parse — shared TS module isn't importable from a plain .mjs build script
function fm(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw)
  const data = {}
  if (m) for (const line of m[1].split('\n')) {
    const i = line.indexOf(':')
    if (i > 0) data[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')
  }
  return data
}

const posts = readdirSync('src/content/blog')
  .filter((f) => f.endsWith('.md'))
  .map((f) => ({ slug: f.replace(/\.md$/, ''), ...fm(readFileSync(`src/content/blog/${f}`, 'utf8')) }))
  .sort((a, b) => (b.date || '').localeCompare(a.date || ''))

// 1) 404.html for GitHub Pages
cpSync(`${dist}/404/index.html`, `${dist}/404.html`)

// 2) redirect stubs for old chirpy URLs /posts/<slug>/ -> /blog/<slug>
for (const { slug } of posts) {
  const to = `/blog/${slug}`
  mkdirSync(`${dist}/posts/${slug}`, { recursive: true })
  writeFileSync(
    `${dist}/posts/${slug}/index.html`,
    `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${to}"><link rel="canonical" href="${ORIGIN}${to}"><script>location.replace(${JSON.stringify(to)})</script>`,
  )
}

// 3) RSS
const esc = (s = '') => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const items = posts
  .map(
    (p) => `  <item>
    <title>${esc(p.title)}</title>
    <link>${ORIGIN}/blog/${p.slug}</link>
    <guid>${ORIGIN}/blog/${p.slug}</guid>
    <pubDate>${(() => {
      const d = new Date(p.date)
      if (isNaN(d.getTime())) throw new Error(`postbuild: invalid date for post "${p.slug}": ${JSON.stringify(p.date)}`)
      return d.toUTCString()
    })()}</pubDate>
    <description>${esc(p.description)}</description>
  </item>`,
  )
  .join('\n')
writeFileSync(
  `${dist}/feed.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>NovusEdge</title>
  <link>${ORIGIN}</link>
  <description>Security, systems, and writeups.</description>
${items}
</channel></rss>`,
)

// 4) sitemap - walk the shipped dist/ tree instead of hand-listing routes, so
// the sitemap always matches what actually got prerendered. Every directory
// containing an index.html becomes a URL (the dist root itself maps to '/'),
// excluding the /posts/* redirect stubs (added above, not real pages) and /404.
function findPageDirs(dir, base = '') {
  const routes = []
  if (existsSync(join(dir, 'index.html'))) routes.push(base === '' ? '/' : base)
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) routes.push(...findPageDirs(full, `${base}/${entry}`))
  }
  return routes
}
const shippedRoutes = findPageDirs(dist)
  .filter((r) => !r.startsWith('/posts/') && r !== '/404')
  .sort()
const urls = shippedRoutes
  .map((u) => `  <url><loc>${ORIGIN}${u}</loc></url>`)
  .join('\n')
writeFileSync(
  `${dist}/sitemap.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`,
)

console.log(`postbuild: 404.html, ${posts.length} redirects, feed.xml, sitemap.xml`)

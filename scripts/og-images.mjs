// Builds a 1200x630 JPEG share card per published post from its thumbnail and
// writes src/content/og-images.json, which the prerender reads for og:image.
// Needs ffmpeg/ffprobe on PATH, which the CI runner lacks, so the cards are
// committed. Rerun after adding a post or changing a thumbnail:
//   node scripts/og-images.mjs
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const W = 1200
const H = 630
// Inside this band a centre crop loses at most ~8% per side; outside it the
// whole thumbnail is kept, centred over a blurred copy of itself.
const COVER_MIN = 1.75
const COVER_MAX = 2.1
const OUT_DIR = 'public/assets/og'
const MANIFEST = 'src/content/og-images.json'

const thumbnails = JSON.parse(readFileSync('src/content/thumbnails.json', 'utf8'))
const ANIMATED = /\.(mp4|webm|mov|gif)$/i

const published = readdirSync('src/content/blog')
  .filter((f) => f.endsWith('.md'))
  .map((f) => f.slice(0, -3))
  .filter((slug) => {
    const head = readFileSync(`src/content/blog/${slug}.md`, 'utf8').split(/^---$/m)[1] ?? ''
    return !/^draft:\s*true\s*$/m.test(head)
  })

function probe(path) {
  const out = execFileSync('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height:format=duration', '-of', 'json', path,
  ])
  const { streams, format } = JSON.parse(out)
  return { w: streams[0].width, h: streams[0].height, duration: Number(format?.duration) || 0 }
}

function source(entry) {
  // An animated hero with a still `list` image (OpenJev) shares the curated still.
  if (ANIMATED.test(entry.hero) && entry.list && !ANIMATED.test(entry.list)) return entry.list
  return entry.hero
}

function render(src, out) {
  const { w, h, duration } = probe(src)
  const ratio = w / h
  const cover = `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}`
  const filter =
    ratio >= COVER_MIN && ratio <= COVER_MAX
      ? `${cover},setsar=1`
      : `split[a][b];[a]${cover},gblur=sigma=40,eq=brightness=-0.12[bg];` +
        `[b]scale=${W - 80}:${H - 80}:force_original_aspect_ratio=decrease[fg];` +
        `[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1`
  // Animated thumbnails can open on a blank or faded frame, so take the middle one.
  const seek = ANIMATED.test(src) && duration > 0 ? ['-ss', String(duration / 2)] : []
  execFileSync('ffmpeg', [
    '-v', 'error', '-y', '-i', src, ...seek,
    '-filter_complex', filter, '-frames:v', '1', '-q:v', '3', out,
  ])
  return ratio
}

rmSync(OUT_DIR, { recursive: true, force: true })
mkdirSync(OUT_DIR, { recursive: true })
const manifest = {}
for (const slug of published.sort()) {
  const entry = thumbnails[slug]
  if (!entry) continue
  const src = `public${source(entry)}`
  const out = `${OUT_DIR}/${slug}.jpg`
  const ratio = render(src, out)
  manifest[slug] = `/assets/og/${slug}.jpg`
  console.log(`${slug}  ${ratio.toFixed(2)}:1 -> ${out}`)
}
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
console.log(`${Object.keys(manifest).length} cards, manifest at ${MANIFEST}`)

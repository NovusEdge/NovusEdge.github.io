// Generates the spoken readings of "I didn't say she stole the money" for the
// didnt-say post: one clip per stressed word plus a flat reading, in the
// ElevenLabs voice River, with character timings. Clips are stored as assets
// and only missing ones are generated, so delete a clip to redo it.
// Run: node --env-file=.env scripts/generate-stress-clips.mjs
// Then: uv run --no-project --with praat-parselmouth python scripts/extract-stress-pitch.py
//
// Eleven v4 has no SSML and no per-word emphasis control. Capitals help a
// little; what works is a spoken lead-in that sets up the contrast, so the
// stress lands where a person would put it. The lead-in is cut off afterwards.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'

const OUT = 'public/assets/blog/didnt-say'
const ALIGN = 'scripts/stress-align'
const VOICE = 'SAz9YHcvj6GT2YYXdXww' // River: calm, neutral, American
const MODEL = 'eleven_v4'
const SEED = 4171
const WORDS = ['I', "didn't", 'say', 'she', 'stole', 'the', 'money']
const FILES = ['i', 'didnt', 'say', 'she', 'stole', 'the', 'money']
// A lead-in must not contain "I didn", or the trim would find it instead of the sentence.
const LEAD_IN = [
  "Don't look at me, that was Sam.",
  // Picked by ear from eight denial lead-ins; "it's true" put the stress on "stole".
  'Everyone keeps saying I did. But',
  'I mean, I hinted at it, sure. But',
  'It was her brother, obviously.',
  'She borrowed it!',
  'She took some money, just not that money.',
  'She stole the car.',
]

const sentence = (stress) => WORDS.map((w, j) => (j === stress ? w.toUpperCase() : w)).join(' ') + '.'
const CLIPS = [
  ...FILES.map((name, i) => ({ name, text: `${LEAD_IN[i]} ${sentence(i)}`, stability: 0.3 })),
  { name: 'flat', text: `[reading it out flatly, like a transcript] ${sentence(-1)}`, stability: 0.9 },
]

// Cuts the clip to start just before the sentence's first character and
// shifts the timings to match, removing the lead-in or a spoken tag.
function trimToSentence(src, dest, al) {
  const i = al.characters.join('').toLowerCase().indexOf("i didn't")
  const t0 = Math.max(0, al.character_start_times_seconds[i] - 0.05)
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(t0), '-i', src, '-q:a', '2', dest])
  const shift = (xs) => xs.slice(i).map((t) => Math.max(0, +(t - t0).toFixed(3)))
  return {
    characters: al.characters.slice(i),
    character_start_times_seconds: shift(al.character_start_times_seconds),
    character_end_times_seconds: shift(al.character_end_times_seconds),
  }
}

const key = process.env.ELEVENLABS_API_KEY
if (!key) {
  console.error('ELEVENLABS_API_KEY is not set. Run with: node --env-file=.env scripts/generate-stress-clips.mjs')
  process.exit(1)
}
mkdirSync(OUT, { recursive: true })
mkdirSync(ALIGN, { recursive: true })

for (const clip of CLIPS) {
  if (existsSync(`${OUT}/${clip.name}.mp3`)) continue
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({ text: clip.text, model_id: MODEL, seed: SEED, voice_settings: { stability: clip.stability } }),
  })
  if (!res.ok) throw new Error(`${clip.name}: ${res.status} ${await res.text()}`)
  const body = await res.json()
  const raw = `${OUT}/${clip.name}.raw.mp3`
  writeFileSync(raw, Buffer.from(body.audio_base64, 'base64'))
  const alignment = trimToSentence(raw, `${OUT}/${clip.name}.mp3`, body.alignment)
  rmSync(raw)
  writeFileSync(`${ALIGN}/${clip.name}.align.json`, JSON.stringify({ text: clip.text, alignment }))
  console.log(`${clip.name}: ${clip.text}`)
}

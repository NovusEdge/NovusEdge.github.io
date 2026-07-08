import {
  siRust,
  siGo,
  siC,
  siDotnet,
  siPython,
  siTypescript,
  siJavascript,
  siLua,
  siLinux,
  siDocker,
  siNeovim,
  siGit,
  siPostgresql,
  siNeo4j,
  siQdrant,
  siRedis,
  siReact,
  siTailwindcss,
  siVite,
  siGreensock,
  siWebgl,
  siWebassembly,
  siClaude,
  siGooglegemini,
  siHuggingface,
  siOllama,
  siLangchain,
  siPytorch,
  siEspressif,
  siRaspberrypi,
  siArduino,
  siNpm,
  siWebrtc,
} from 'simple-icons'

export type Icon = { path: string; hex: string; title: string }
export type Tech = { name: string; icon: Icon; mono?: boolean }

// ponytail: custom icons for tech without simple-icons entries
const customIcons: Record<string, Icon> = {
  memgraph: { title: 'Memgraph', hex: '6236FF', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zm-5 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm10 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm-5 5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z' },
  mcp: { title: 'MCP', hex: 'D4A03C', path: 'M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l6.9 3.45L12 11.08 5.1 7.63 12 4.18zM4 8.82l7 3.5v7.36l-7-3.5V8.82zm9 10.86v-7.36l7-3.5v7.36l-7 3.5z' },
  pixi: { title: 'Pixi', hex: 'FFC131', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 4h2v3h-2V6zm-5 2.5h2v7h-2v-7zm8 0h2v7h-2v-7zm-4 1.5h2v5h-2V10z' },
  rf: { title: 'RF', hex: '00B4D8', path: 'M12 2c-.55 0-1 .45-1 1v3.07A7.003 7.003 0 0 0 5 13c0 3.87 3.13 7 7 7s7-3.13 7-7a7.003 7.003 0 0 0-6-6.93V3c0-.55-.45-1-1-1zm0 6a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z' },
}

export { siClaude }

export const DOMAINS = [
  {
    jp: '知',
    title: 'AI & agent cognition',
    blurb: 'Engrammic, Veil, agent memory. Teaching machines what they know versus what they merely generated. The day job.',
  },
  {
    jp: '営',
    title: 'Founder & CTO',
    blurb: 'Raising, hiring, strategy, and actually shipping. Turning a research idea into something with a runway.',
  },
  {
    jp: '機',
    title: 'Hardware & RF',
    blurb: 'ØCLOAK and neuro-llm. At-cost anti-surveillance devices, and reading intent off the body. Still leveling up.',
  },
  {
    jp: '遊',
    title: 'Systems & chaos',
    blurb: 'Low-level tooling, Linux ricing, and joke repos that somehow pull a hundred stars. Breaking things to see how they work.',
  },
]

export const STACK: { label: string; jp: string; items: Tech[] }[] = [
  {
    label: 'languages',
    jp: '言語',
    items: [
      { name: 'Rust', icon: siRust, mono: true },
      { name: 'Go', icon: siGo },
      { name: 'C', icon: siC },
      { name: 'C#', icon: siDotnet },
      { name: 'Python', icon: siPython },
      { name: 'TypeScript', icon: siTypescript },
      { name: 'JavaScript', icon: siJavascript },
      { name: 'Lua', icon: siLua },
    ],
  },
  {
    label: 'systems & data',
    jp: '基盤',
    items: [
      { name: 'Linux', icon: siLinux },
      { name: 'Docker', icon: siDocker },
      { name: 'Neovim', icon: siNeovim },
      { name: 'Git', icon: siGit },
      { name: 'Postgres', icon: siPostgresql },
      { name: 'Neo4j', icon: siNeo4j },
      { name: 'Memgraph', icon: customIcons.memgraph },
      { name: 'Qdrant', icon: siQdrant },
      { name: 'Redis', icon: siRedis },
      { name: 'npm', icon: siNpm },
      { name: 'Pixi', icon: customIcons.pixi },
    ],
  },
  {
    label: 'web & motion',
    jp: '動き',
    items: [
      { name: 'React', icon: siReact },
      { name: 'Tailwind', icon: siTailwindcss },
      { name: 'Vite', icon: siVite },
      { name: 'GSAP', icon: siGreensock },
      { name: 'WebGL', icon: siWebgl, mono: true },
      { name: 'WASM', icon: siWebassembly },
    ],
  },
  {
    label: 'ai',
    jp: '知能',
    items: [
      { name: 'Claude', icon: siClaude },
      { name: 'Gemini', icon: siGooglegemini },
      { name: 'HuggingFace', icon: siHuggingface },
      { name: 'Ollama', icon: siOllama, mono: true },
      { name: 'LangChain', icon: siLangchain },
      { name: 'PyTorch', icon: siPytorch },
      { name: 'MCP', icon: customIcons.mcp },
    ],
  },
  {
    label: 'hardware',
    jp: '機械',
    items: [
      { name: 'ESP32', icon: siEspressif },
      { name: 'Raspberry Pi', icon: siRaspberrypi },
      { name: 'Arduino', icon: siArduino },
      { name: 'RF', icon: customIcons.rf },
      { name: 'P2P', icon: siWebrtc },
    ],
  },
]

// real repo-language distribution (non-fork, both accounts)
export const LANGS = [
  { name: 'Rust', n: 8, color: '#DEA584' },
  { name: 'Go', n: 7, color: '#00ADD8' },
  { name: 'C', n: 4, color: '#A8B9CC' },
  { name: 'Python', n: 4, color: '#3776AB' },
  { name: 'Assembly', n: 2, color: '#A6772F' },
  { name: 'JavaScript', n: 2, color: '#E5C000' },
  { name: 'Shell', n: 2, color: '#89E051' },
  { name: 'Other', n: 7, color: '#8A8A8A' },
]
export const LANG_TOTAL = LANGS.reduce((s, l) => s + l.n, 0)

// what i'm actively deep in right now (keep this current)
export const LATELY = 'deep in agent memory and fundraising. hardware on weekends. everything else is muscle memory.'

// one line per stack group: how i use it and why  (keyed by STACK label)
export const GROUP_NOTES: Record<string, string> = {
  languages: 'the alphabet. Rust when it must not break, Python when it must ship today.',
  'systems & data': 'where things run and remember. Linux, containers, and a graph or two.',
  'web & motion': 'how ideas get a face. this site included.',
  ai: 'the day job. agent memory, inference, epistemics.',
  hardware: 'new territory. still burning myself on the soldering iron.',
}

// honest depth, not a rating. daily driver / comfortable / just dabbling  (keyed by tool name)
export type Depth = 'daily' | 'comfortable' | 'dabbling'
export const DEPTH: Record<string, Depth> = {
  Rust: 'daily', Python: 'daily', TypeScript: 'daily', Claude: 'daily', Linux: 'daily', Neovim: 'daily', Git: 'daily', Docker: 'daily',
  MCP: 'daily', Memgraph: 'comfortable', Pixi: 'comfortable', npm: 'daily',
  Go: 'comfortable', C: 'comfortable', 'C#': 'comfortable', JavaScript: 'comfortable', PyTorch: 'comfortable', LangChain: 'comfortable',
  Postgres: 'comfortable', Neo4j: 'comfortable', Qdrant: 'comfortable', Redis: 'comfortable', React: 'comfortable', Tailwind: 'comfortable',
  Vite: 'comfortable', Ollama: 'comfortable', HuggingFace: 'comfortable', Gemini: 'comfortable', GSAP: 'comfortable',
  Lua: 'dabbling', WebGL: 'dabbling', WASM: 'dabbling', ESP32: 'dabbling', 'Raspberry Pi': 'dabbling', Arduino: 'dabbling',
  P2P: 'dabbling', RF: 'dabbling',
}

// the stack doing real work. `tech` names must match STACK item names (they render as icons)
export const PROJECTS: { name: string; tech: string[]; blurb: string }[] = [
  { name: 'Engrammic', tech: ['TypeScript', 'Python', 'MCP', 'Memgraph', 'Docker', 'Redis', 'Qdrant', 'Ollama', 'HuggingFace'], blurb: 'epistemic memory for AI agents.' },
  { name: 'Veil', tech: ['TypeScript', 'Go', 'Pixi', 'npm', 'Docker'], blurb: 'persistent, sourced memory for AI agents.' },
  { name: 'ØCLOAK', tech: ['ESP32', 'C', 'Rust', 'P2P', 'RF'], blurb: 'at-cost anti-surveillance hardware.' },
  { name: 'palpatine', tech: ['Claude', 'TypeScript', 'JavaScript'], blurb: 'the joke repo that pulled 101 stars.' },
]

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
} from 'simple-icons'

export type Icon = { path: string; hex: string; title: string }
export type Tech = { name: string; icon: Icon; mono?: boolean }

export { siClaude }

export const DOMAINS = [
  {
    jp: '攻',
    title: 'Offensive security & systems',
    blurb: 'CTFs, malware dev, forkbombs, and low-level tooling. Breaking things to understand how they actually work.',
  },
  {
    jp: '記',
    title: 'AI memory & epistemics',
    blurb: 'Engrammic, Veil, agent cognition. Teaching machines what they know versus what they merely generated.',
  },
  {
    jp: '隠',
    title: 'Privacy, hardware & RF',
    blurb: 'ØCLOAK and neuro-llm. At-cost anti-surveillance devices, and reading intent straight off the body.',
  },
  {
    jp: '遊',
    title: 'Weird things for fun',
    blurb: 'Games, Linux ricing, and joke repos that somehow pull a hundred stars.',
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
      { name: 'Qdrant', icon: siQdrant },
      { name: 'Redis', icon: siRedis },
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
    ],
  },
  {
    label: 'hardware',
    jp: '機械',
    items: [
      { name: 'ESP32', icon: siEspressif },
      { name: 'Raspberry Pi', icon: siRaspberrypi },
      { name: 'Arduino', icon: siArduino },
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

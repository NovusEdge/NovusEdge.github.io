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
  siSqlite,
  siUv,
  siRuff,
  siPydantic,
  siStripe,
  siQemu,
  siNixos,
  siGodotengine,
} from 'simple-icons'

export type Icon = { path: string; hex: string; title: string }
export type Tech = { name: string; icon: Icon; mono?: boolean }

// ponytail: custom icons for tech without simple-icons entries
const customIcons: Record<string, Icon> = {
  memgraph: { title: 'Memgraph', hex: '6236FF', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zm-5 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm10 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm-5 5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z' },
  mcp: { title: 'MCP', hex: 'D4A03C', path: 'M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l6.9 3.45L12 11.08 5.1 7.63 12 4.18zM4 8.82l7 3.5v7.36l-7-3.5V8.82zm9 10.86v-7.36l7-3.5v7.36l-7 3.5z' },
  pixi: { title: 'Pixi', hex: 'FFC131', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 4h2v3h-2V6zm-5 2.5h2v7h-2v-7zm8 0h2v7h-2v-7zm-4 1.5h2v5h-2V10z' },
  rf: { title: 'RF', hex: '00B4D8', path: 'M12 2c-.55 0-1 .45-1 1v3.07A7.003 7.003 0 0 0 5 13c0 3.87 3.13 7 7 7s7-3.13 7-7a7.003 7.003 0 0 0-6-6.93V3c0-.55-.45-1-1-1zm0 6a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z' },
  cedar: { title: 'Cedar', hex: '2E5E4E', path: 'M12 2L4 5.2v6.3c0 4.9 3.4 9.1 8 10.5 4.6-1.4 8-5.6 8-10.5V5.2L12 2z' },
  litellm: { title: 'LiteLLM', hex: '6C47FF', path: 'M6 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 12a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm12-6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM8 5h4v2H8V5zm0 12h4v2H8v-2zm4-12h2v14h-2V5z' },
  mypy: { title: 'mypy', hex: '1F5082', path: 'M4 5h3l5 7 5-7h3v14h-3v-8l-5 6.5L7 11v8H4V5z' },
  datasette: { title: 'Datasette', hex: '0074D9', path: 'M12 2C7.58 2 4 3.34 4 5s3.58 3 8 3 8-1.34 8-3-3.58-3-8-3zM4 7.5V12c0 1.66 3.58 3 8 3s8-1.34 8-3V7.5c-1.7 1.2-4.7 1.8-8 1.8S5.7 8.7 4 7.5zm0 6.5V18c0 1.66 3.58 3 8 3s8-1.34 8-3v-4c-1.7 1.2-4.7 1.8-8 1.8S5.7 15.2 4 14z' },
}

export { siClaude }

// Every prose string on /stack lives in the i18n catalogs, keyed by these
// `key` fields: stack.domains.<key>.title/.blurb, stack.groups.<key>,
// stack.groupNotes.<key>, stack.projects.<slug>. Tool and project names stay
// in English on every locale.
export const DOMAINS = [
  { key: 'ai', jp: '知' },
  { key: 'founder', jp: '営' },
  { key: 'hardware', jp: '機' },
  { key: 'systems', jp: '遊' },
]

export const STACK: { key: string; jp: string; items: Tech[] }[] = [
  {
    key: 'languages',
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
    key: 'systems',
    jp: '基盤',
    items: [
      { name: 'Linux', icon: siLinux },
      { name: 'Docker', icon: siDocker },
      { name: 'QEMU', icon: siQemu },
      { name: 'Nix', icon: siNixos },
      { name: 'Neovim', icon: siNeovim },
      { name: 'Git', icon: siGit },
      { name: 'Postgres', icon: siPostgresql },
      { name: 'Neo4j', icon: siNeo4j },
      { name: 'Memgraph', icon: customIcons.memgraph },
      { name: 'Qdrant', icon: siQdrant },
      { name: 'Redis', icon: siRedis },
      { name: 'SQLite', icon: siSqlite },
      { name: 'npm', icon: siNpm },
      { name: 'Pixi', icon: customIcons.pixi },
      { name: 'uv', icon: siUv, mono: true },
      { name: 'Ruff', icon: siRuff },
      { name: 'mypy', icon: customIcons.mypy },
    ],
  },
  {
    key: 'web',
    jp: '動き',
    items: [
      { name: 'React', icon: siReact },
      { name: 'Tailwind', icon: siTailwindcss },
      { name: 'Vite', icon: siVite },
      { name: 'GSAP', icon: siGreensock },
      { name: 'WebGL', icon: siWebgl, mono: true },
      { name: 'WASM', icon: siWebassembly },
      { name: 'Godot', icon: siGodotengine },
    ],
  },
  {
    key: 'ai',
    jp: '知能',
    items: [
      { name: 'Claude', icon: siClaude },
      { name: 'Gemini', icon: siGooglegemini },
      { name: 'HuggingFace', icon: siHuggingface },
      { name: 'Ollama', icon: siOllama, mono: true },
      { name: 'LangChain', icon: siLangchain },
      { name: 'PyTorch', icon: siPytorch },
      { name: 'MCP', icon: customIcons.mcp },
      { name: 'LiteLLM', icon: customIcons.litellm },
      { name: 'Pydantic AI', icon: siPydantic },
    ],
  },
  {
    key: 'policy',
    jp: '規範',
    items: [
      { name: 'Cedar', icon: customIcons.cedar },
      { name: 'Stripe', icon: siStripe },
      { name: 'Datasette', icon: customIcons.datasette },
    ],
  },
  {
    key: 'hardware',
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

// Primary language of each non-fork repo owned by NovusEdge, from the GitHub
// API on 2026-09-25. Repos with no detected language are left out. Org work
// (engrammic-ai, BotSpot) is not counted.
export const LANGS = [
  { name: 'Python', n: 8, color: '#3776AB' },
  { name: 'Go', n: 7, color: '#00ADD8' },
  { name: 'Rust', n: 7, color: '#DEA584' },
  { name: 'JavaScript', n: 3, color: '#E5C000' },
  { name: 'TypeScript', n: 3, color: '#3178C6' },
  { name: 'Shell', n: 3, color: '#89E051' },
  { name: 'C', n: 2, color: '#A8B9CC' },
  { name: 'Other', n: 8, color: '#8A8A8A' },
]
export const LANG_TOTAL = LANGS.reduce((s, l) => s + l.n, 0)

// honest depth, not a rating. daily driver / comfortable / just dabbling  (keyed by tool name)
export type Depth = 'daily' | 'comfortable' | 'dabbling'
export const DEPTH: Record<string, Depth> = {
  Rust: 'daily', Python: 'daily', TypeScript: 'daily', Claude: 'daily', Linux: 'daily', Neovim: 'daily', Git: 'daily', Docker: 'daily',
  MCP: 'daily', Memgraph: 'comfortable', Pixi: 'comfortable', npm: 'daily',
  uv: 'daily', Ruff: 'daily', mypy: 'daily', SQLite: 'comfortable',
  Cedar: 'comfortable', 'Pydantic AI': 'comfortable', LiteLLM: 'comfortable',
  Stripe: 'dabbling', Datasette: 'dabbling',
  Go: 'comfortable', C: 'comfortable', 'C#': 'comfortable', JavaScript: 'comfortable', PyTorch: 'comfortable', LangChain: 'comfortable',
  Postgres: 'comfortable', Neo4j: 'comfortable', Qdrant: 'comfortable', Redis: 'comfortable', React: 'comfortable', Tailwind: 'comfortable',
  Vite: 'comfortable', Ollama: 'comfortable', HuggingFace: 'comfortable', Gemini: 'comfortable', GSAP: 'comfortable',
  Lua: 'dabbling', WebGL: 'dabbling', WASM: 'dabbling', ESP32: 'dabbling', 'Raspberry Pi': 'dabbling', Arduino: 'dabbling',
  P2P: 'dabbling', RF: 'dabbling',
  QEMU: 'comfortable', Nix: 'dabbling', Godot: 'dabbling',
}

// the stack doing real work. `tech` names must match STACK item names (they render as icons)
export const PROJECTS: { slug: string; name: string; tech: string[] }[] = [
  { slug: 'engrammic', name: 'Engrammic', tech: ['TypeScript', 'Python', 'MCP', 'Memgraph', 'Docker', 'Redis', 'Qdrant', 'Ollama', 'HuggingFace'] },
  { slug: 'veil', name: 'Veil', tech: ['TypeScript', 'Go', 'Pixi', 'npm', 'Docker'] },
  { slug: 'docket', name: 'docket', tech: ['Python', 'Claude'] },
  { slug: 'stoat', name: 'stoat', tech: ['Go', 'QEMU', 'Nix', 'Linux'] },
  { slug: 'ocloak', name: 'ØCLOAK', tech: ['ESP32', 'C', 'Rust', 'P2P', 'RF'] },
  { slug: 'money-mesh', name: 'money-mesh', tech: ['Python', 'Cedar', 'LiteLLM', 'Pydantic AI', 'SQLite', 'Stripe', 'uv', 'MCP'] },
  { slug: 'anti-slop', name: 'anti-slop', tech: ['Claude', 'JavaScript', 'Python'] },
  { slug: 'goob', name: 'goob', tech: ['Godot', 'Python', 'Go'] },
  { slug: 'palpatine', name: 'palpatine', tech: ['Claude', 'TypeScript', 'JavaScript'] },
]

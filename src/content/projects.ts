export type Project = {
  slug: string
  title: string
  jp?: string
  year: string
  lang?: string
  stars?: number
  group: 'now' | 'chaos'
  phase: 'building' | 'shipped' | 'on-ice' | 'chaos-era'
  featured?: boolean
  description: string
  tech: string[]
  image?: string
  links: { label: string; href: string }[]
  body: string
}

// Curated from the repos. Grouped by the arc: what I'm building now, and the
// chaos I cut my teeth on. body is markdown for the detail page.
export const projects: Project[] = [
  {
    slug: 'palpatine',
    title: 'Palpatine',
    jp: '策',
    year: '2026',
    lang: 'JavaScript',
    stars: 101,
    group: 'chaos',
    phase: 'shipped',
    featured: true,
    description:
      'A "strategic" advisor to "help you achieve your goals." Half a joke, and somehow my most-starred repo by a mile.',
    tech: ['Claude', 'TypeScript', 'JavaScript'],
    links: [{ label: 'github', href: 'https://github.com/NovusEdge/palpatine' }],
    body: 'A tongue-in-cheek "strategic advisor" that dispenses gloriously unhinged guidance. It was never meant to be serious, which is exactly why it became my most-starred project. The internet rewards the right kind of nonsense.',
  },

  // ---- building now ----
  {
    slug: 'engrammic',
    title: 'Engrammic',
    jp: '記',
    year: '2026',
    lang: 'Python',
    group: 'now',
    phase: 'building',
    featured: true,
    description:
      'Epistemic memory for AI agents: claims, evidence, and provenance as a first-class graph. Before intelligence can be trusted, it has to learn to doubt.',
    tech: ['TypeScript', 'Python', 'MCP', 'Memgraph', 'Docker', 'Redis', 'Qdrant', 'Ollama', 'HuggingFace'],
    links: [
      { label: 'engrammic.ai', href: 'https://engrammic.ai' },
      { label: 'research', href: 'https://engrammic.ai/research' },
      { label: 'github', href: 'https://github.com/engrammic-ai/engrammic' },
    ],
    body: 'Engrammic treats agent memory as epistemology, not retrieval: memory that fades without reinforcement, claims that require sources, and an auditable chain from observation to conclusion. A whole ecosystem sits under it (an engine, an MCP server, a modality-agnostic substrate), but the thesis is simple: an agent should know what it knows versus what it merely generated.',
  },
  {
    slug: 'veil',
    title: 'Veil',
    jp: '帳',
    year: '2026',
    lang: 'TypeScript',
    group: 'now',
    phase: 'building',
    featured: true,
    description: "Your agent forgets. This one doesn't. Persistent, sourced memory for AI agents, shipped as a drop-in npm package.",
    tech: ['TypeScript', 'Go', 'Pixi', 'npm', 'Docker'],
    links: [
      { label: 'github', href: 'https://github.com/engrammic-ai/veil' },
      { label: 'npm', href: 'https://www.npmjs.com/package/@engrammic/veil' },
    ],
    body: 'The Engrammic ideas, packaged so any agent can have durable, sourced memory in a couple of lines. `npm install -g @engrammic/veil` and your agent stops starting from zero every session.',
  },
  {
    slug: 'primitives',
    title: 'Primitives',
    jp: '型',
    year: '2026',
    lang: 'Python',
    group: 'now',
    phase: 'shipped',
    description:
      "The schema library behind Engrammic: the types and rules that turn an agent's observations into claims, facts, and beliefs.",
    tech: ['Python', 'pip'],
    links: [
      { label: 'github', href: 'https://github.com/engrammic-ai/primitives' },
      { label: 'pypi', href: 'https://pypi.org/project/engrammic-primitives/' },
    ],
    body: 'The schema library under Engrammic: types and rules for turning observations into claims, facts, and beliefs. `pip install engrammic-primitives`.',
  },
  {
    slug: 'ocloak',
    title: 'ØCLOAK',
    jp: '隠',
    year: '2026',
    lang: 'Hardware',
    group: 'now',
    phase: 'building',
    featured: true,
    description:
      'Crowdsourced privacy infrastructure against mass surveillance: at-cost RF / WiFi-sensing hardware plus a P2P threat-intel network. Offense is shipping; defense is empty.',
    tech: ['ESP32', 'C', 'Rust', 'P2P', 'RF'],
    links: [{ label: 'github', href: 'https://github.com/NovusEdge/ocloak' }],
    body: 'WiFi sensing ships in routers and sees through walls. A $9 ESP32 does through-wall presence detection. Surveillance is commoditizing fast and defense is basically empty, so ØCLOAK fills the gap: at-cost devices you own outright and an anonymous, location-based threat-intel network. No subscriptions, no VC, open firmware.',
  },
  {
    slug: 'neuro-llm',
    title: 'neuro-llm',
    jp: '囁',
    year: '2026',
    lang: 'Python',
    group: 'now',
    phase: 'building',
    description:
      'Silent tongue-articulation to text: a quiet neural interface for driving LLM agents without saying a word. Early, and mostly [redacted].',
    tech: ['Python', 'firmware', 'signals'],
    links: [{ label: 'github', href: 'https://github.com/NovusEdge/whisperless' }],
    body: 'Teaching machines to read intent straight off the body: silent articulation captured and turned into text you can feed an agent. Hardware, firmware, and a pile of hypotheses. Early days, and I am keeping most of it under wraps for now.',
  },

  // ---- chaos & tools (the CTF-kid era) ----
  {
    slug: 'puffgo',
    title: 'puffgo',
    jp: '爆',
    year: '2021',
    lang: 'Go',
    group: 'chaos',
    phase: 'chaos-era',
    description: 'A Go package implementing a simple logic-bomb: payload that waits quietly, then goes off on a trigger.',
    tech: ['Go'],
    links: [{ label: 'github', href: 'https://github.com/NovusEdge/puffgo' }],
    body: 'A small Go package that packs a logic-bomb: dormant until a condition fires, then it does its thing. A study in triggers and payloads more than a weapon, but a fun one.',
  },
  {
    slug: 'gfb',
    title: 'gfb',
    jp: '増',
    year: '2021',
    lang: 'Go',
    group: 'chaos',
    phase: 'chaos-era',
    description: 'A forkbomb as a Go package, via cgo. A tiny lesson in how fast you can bring a machine to its knees.',
    tech: ['Go', 'cgo'],
    links: [{ label: 'github', href: 'https://github.com/NovusEdge/gfb' }],
    body: 'A Go/cgo forkbomb wrapped as a package. Mostly an excuse to poke at cgo and resource limits and watch a VM fall over. Do not run it on anything you like.',
  },
  {
    slug: 'loxoten',
    title: 'loxoten',
    jp: '壊',
    year: '2022',
    lang: 'C',
    group: 'chaos',
    phase: 'chaos-era',
    description: 'A command-line tool to corrupt files, byte by byte: controlled destruction for testing (and mischief).',
    tech: ['C'],
    links: [{ label: 'github', href: 'https://github.com/NovusEdge/loxoten' }],
    body: 'A little C CLI that deliberately mangles files. Useful for testing how software handles corruption, and just satisfying in a chaotic-neutral sort of way.',
  },
  {
    slug: 'malware-dev-guide',
    title: 'Malware Dev Guide',
    jp: '毒',
    year: '2023',
    group: 'chaos',
    phase: 'chaos-era',
    description: 'A community malware-development guide (with @AraChn3): the offensive-security notes I wish I had when starting out.',
    tech: ['guide', 'offsec'],
    links: [{ label: 'github', href: 'https://github.com/NovusEdge/malware-development-guide' }],
    body: 'Notes and walkthroughs on malware development, put together with @AraChn3. The kind of practical, no-fluff reference that is weirdly hard to find when you are learning offensive security.',
  },
  {
    slug: 'thm-writeups',
    title: 'THM Writeups',
    jp: '攻',
    year: '2022',
    group: 'chaos',
    phase: 'chaos-era',
    description: 'A pile of TryHackMe CTF writeups: the room-by-room grind that taught me to break things. Several live on the blog too.',
    tech: ['CTF', 'writeups'],
    links: [{ label: 'github', href: 'https://github.com/NovusEdge/thm-writeups' }],
    body: 'The archive of TryHackMe rooms I worked through: enumeration, footholds, privesc, repeat. Half the reason this site has a blog. Many of these are written up in full over there.',
  },
]

export const getProject = (slug: string) => projects.find((p) => p.slug === slug)

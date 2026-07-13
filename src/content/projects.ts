export type Project = {
  slug: string
  title: string
  jp?: string
  year: string
  lang?: string
  stars?: number
  group: 'now' | 'shipped' | 'chaos' | 'oss'
  phase: 'building' | 'shipped' | 'on-ice' | 'chaos-era' | 'contributor'
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
    group: 'shipped',
    phase: 'shipped',
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
    group: 'shipped',
    phase: 'shipped',
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
    group: 'shipped',
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
    slug: 'goob',
    title: 'goob',
    jp: '猫',
    year: '2026',
    lang: 'GDScript',
    group: 'now',
    phase: 'building',
    featured: true,
    description:
      'A desktop pet cat that lives on your screen - wanders, naps, chases your cursor, and comments on what your machine is doing via LLM. Bring your own spritesheet.',
    tech: ['Godot', 'Python', 'Go', 'LLM'],
    links: [{ label: 'github', href: 'https://github.com/NovusEdge/goob' }],
    body: 'A fullscreen transparent overlay pet built in Godot 4. The cat wanders, naps, follows your cursor, reacts to CPU load and battery, and comments via canned lines or a live LLM daemon. Not hardcoded to a cat - bring your own creature spritesheet.',
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

  // ---- open source contributions ----
  {
    slug: 'deepspeed',
    title: 'DeepSpeed',
    jp: '速',
    year: '2026',
    lang: 'Python',
    group: 'oss',
    phase: 'contributor',
    description: 'Microsoft\'s deep learning optimization library. Contributed type hints, changelog tooling, and warning fixes. Multiple merged PRs.',
    tech: ['Python', 'PyTorch', 'distributed'],
    links: [
      { label: 'upstream', href: 'https://github.com/deepspeedai/DeepSpeed' },
      { label: 'my PRs', href: 'https://github.com/deepspeedai/DeepSpeed/pulls?q=author%3ANovusEdge' },
    ],
    body: 'Contributing to Microsoft\'s DeepSpeed: type hints for better DX, changelog automation, and fixing silent failure modes. The kind of unglamorous work that makes a library nicer to use.',
  },
  {
    slug: 'tapestry',
    title: 'Tapestry',
    jp: '織',
    year: '2026',
    lang: 'Python',
    group: 'oss',
    phase: 'contributor',
    description: 'The AI Alliance\'s distributed training framework. Contributed eval schema, CI fixes, and active on the M1 roadmap.',
    tech: ['Python', 'distributed', 'federated'],
    links: [
      { label: 'upstream', href: 'https://github.com/The-AI-Alliance/tapestry' },
      { label: 'my PRs', href: 'https://github.com/The-AI-Alliance/tapestry/pulls?q=author%3ANovusEdge' },
    ],
    body: 'Active contributor to Tapestry, the AI Alliance\'s distributed training project. Merged PRs on the eval gate schema and CI, and engaged on the M1 heterogeneous-hardware epic.',
  },
  {
    slug: 'lightgbm',
    title: 'LightGBM',
    jp: '木',
    year: '2023',
    lang: 'C++',
    group: 'oss',
    phase: 'contributor',
    description: 'Microsoft\'s gradient boosting framework. Early contributions to the project.',
    tech: ['C++', 'Python', 'ML'],
    links: [
      { label: 'upstream', href: 'https://github.com/microsoft/LightGBM' },
    ],
    body: 'Contributed to Microsoft\'s LightGBM, a fast gradient boosting framework used across industry.',
  },
  {
    slug: 'rosin',
    title: 'ROSIN',
    jp: '機',
    year: '2022',
    lang: 'C++',
    group: 'oss',
    phase: 'contributor',
    description: 'ROS-Industrial quality-assured robot software components. Contributed to the EU-funded robotics ecosystem.',
    tech: ['C++', 'ROS', 'robotics'],
    links: [
      { label: 'project', href: 'https://rosin-project.eu' },
    ],
    body: 'Contributed to the ROSIN (ROS-Industrial) ecosystem, an EU-funded project building quality-assured components for industrial robotics.',
  },
]

export const getProject = (slug: string) => projects.find((p) => p.slug === slug)

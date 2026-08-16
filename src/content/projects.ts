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
    stars: 105,
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
    slug: 'stoat',
    title: 'stoat',
    jp: '貂',
    year: '2026',
    lang: 'Go',
    group: 'now',
    phase: 'building',
    featured: true,
    description:
      'Local QEMU VMs on Linux from a TUI and a CLI. No libvirt, no daemon, one binary.',
    tech: ['Go', 'QEMU', 'KVM', 'cloud-init', 'Bubble Tea', 'Nix'],
    links: [{ label: 'github', href: 'https://github.com/NovusEdge/stoat' }],
    body: "Running a throwaway VM on Linux means libvirt, a daemon, and XML, or it means a QEMU command line you re-derive every time. stoat is one binary instead. Alpine live VMs come up networked and ssh-reachable with no `setup-alpine` step, because the apkovl overlay is baked into the boot. Ubuntu, Debian, Fedora, and Arch cloud images provision via cloud-init on first boot, and persistent disk VMs cover everything else. VMs are tracked by pidfile rather than supervised, so stoat can exit and the VM keeps running. The TUI is for poking around; the CLI (`ls`, `up`, `ssh`, `provision`, `recipe`, `doctor`) covers the same ground for scripts.",
  },
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
    body: 'Engrammic treats agent memory as epistemology: memory that fades without reinforcement, claims that require sources, and an auditable chain from observation to conclusion. A whole ecosystem sits under it (an engine, an MCP server, a modality-agnostic substrate), and the thesis stays simple. An agent should know what it knows versus what it merely generated.',
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
    slug: 'money-mesh',
    title: 'money-mesh',
    jp: '網',
    year: '2026',
    lang: 'Python',
    group: 'now',
    phase: 'building',
    description:
      'A leaderless mesh of self-replicating earning agents under an immutable core. The spend cap holds by arithmetic, not by good intentions.',
    tech: ['Python', 'Cedar', 'LiteLLM', 'Pydantic AI', 'SQLite', 'Stripe', 'MCP'],
    links: [],
    body: "No supervisor, no orchestrator. Every node carries the same capability-locked immutable core (intent, guardrails, alignment), holds a slice of a conserved budget token, invents its own product, and measures its own revenue from real receipts rather than self-report. A node spawns a peer by handing over part of its budget, so recursive self-replication stays bounded: spawning only ever divides an existing pot. Cedar sits at the enforcement point as a real policy engine, so the guardrail is code the node cannot talk its way past.",
  },
  {
    slug: 'anti-slop',
    title: 'anti-slop',
    jp: '削',
    year: '2026',
    lang: 'JavaScript',
    group: 'shipped',
    phase: 'shipped',
    description:
      'A Claude Code plugin that strips the AI out of AI-written prose. Forty banned words, STE grammar, no LinkedIn cadence.',
    tech: ['Claude Code', 'JavaScript', 'Python', 'ASD-STE100'],
    links: [{ label: 'github', href: 'https://github.com/NovusEdge/anti-slop' }],
    body: "Every model writes the same way: `delve`, `robust`, `crucial`, `it's not X, it's Y`, a one-line paragraph dropped in for punch. anti-slop bans that vocabulary outright, enforces ASD-STE100 grammar (one fact per sentence, active voice, simple tenses, keep the articles), and kills the structural tells. A `SessionStart` hook injects the rules and restores them after a compaction drops them. A `UserPromptSubmit` hook lints the previous turn and restates the rule every tenth prompt, because a rule stated once at turn 1 has stopped steering by turn 40. A standalone Python linter runs the mechanical subset as a pre-commit hook.",
  },
  {
    slug: 'goob',
    title: 'goob',
    jp: '猫',
    year: '2026',
    lang: 'GDScript',
    group: 'shipped',
    phase: 'shipped',
    description:
      'A desktop pet cat that lives on your screen - wanders, naps, chases your cursor, and comments on what your machine is doing via LLM. Bring your own spritesheet.',
    tech: ['Godot', 'Python', 'Go', 'LLM'],
    links: [{ label: 'github', href: 'https://github.com/NovusEdge/goob' }],
    body: 'A fullscreen transparent overlay pet built in Godot 4. The cat wanders, naps, follows your cursor, reacts to CPU load and battery, and comments via canned lines or a live LLM daemon. Not hardcoded to a cat - bring your own creature spritesheet.',
  },

  // ---- chaos & tools (the CTF-kid era) ----
  {
    slug: 'screenjack',
    title: 'screenjack',
    jp: '奪',
    year: '2026',
    lang: 'Rust',
    group: 'chaos',
    phase: 'chaos-era',
    featured: true,
    description:
      'Fullscreen takeover tool for pranking your friends. Locks their screen, displays your image/GIF, blocks input until they hit the secret exit combo.',
    tech: ['Rust', 'TUI', 'Docker', 'Rubber Ducky'],
    links: [
      { label: 'github', href: 'https://github.com/ARaChn3/screenjack' },
      { label: 'writeup', href: 'https://arachn3.gitbook.io/malware-development-guide/intermediate-malware/screenjackers' },
    ],
    body: 'Takes over the entire screen with an image or looping GIF. Blocks keyboard and mouse input on Linux (X11) and Windows. Exit requires holding Ctrl+Shift+Escape for 2 seconds. Comes with a TUI orchestrator for managing assets, building cross-platform payloads in Docker, and generating Rubber Ducky deployment scripts.',
  },
  {
    slug: 'hirejack',
    title: 'hirejack',
    jp: '刺',
    year: '2025',
    lang: 'Go',
    group: 'chaos',
    phase: 'chaos-era',
    description:
      'ATS security auditor: 84 payloads across SQLi, XXE, DoS, ML poisoning, and LLM prompt injection. Weaponized resumes for testing how hiring systems break.',
    tech: ['Go', 'Node.js', 'PDF'],
    links: [{ label: 'github', href: 'https://github.com/ARaChn3/hirejack' }],
    body: 'Tests Applicant Tracking Systems for parsing vulnerabilities, injection vectors, and LLM prompt injection in AI-based screening. Five stealth levels from raw payloads to polyglot/orphan object techniques. Canary tokens detect when ATS systems parse the injected content. Web UI for visual payload selection, CLI for automation.',
  },
  {
    slug: 'prepender',
    title: 'prepender',
    jp: '染',
    year: '2024',
    lang: 'Rust',
    group: 'chaos',
    phase: 'chaos-era',
    description:
      'Binary infector that creates prepender/postpender executables. The infected binary runs both payload and host, in whichever order you choose.',
    tech: ['Rust', 'ELF'],
    links: [{ label: 'github', href: 'https://github.com/ARaChn3/prepender' }],
    body: 'Embeds a payload into an existing binary. On execution, the stub extracts both payload and host to /tmp and runs them in sequence. Prepender mode runs payload first; postpender mode runs host first. Inspired by guitmz\'s Linux.Fe2O3.',
  },
  {
    slug: 'glowworm',
    title: 'glowworm',
    jp: '蟲',
    year: '2023',
    lang: 'Go',
    group: 'chaos',
    phase: 'chaos-era',
    description:
      'A network worm that lights up your network. Self-propagates via SSH and SMB, cross-platform.',
    tech: ['Go', 'SSH', 'SMB'],
    links: [{ label: 'github', href: 'https://github.com/ARaChn3/glowworm' }],
    body: 'Self-replicating worm written in Go. Scans network ranges, spreads via SSH and SMB, runs on Windows and Linux. Configurable scan ranges and spreading vectors. Educational/research purposes only.',
  },
  {
    slug: 'remy',
    title: 'remy',
    jp: '鼠',
    year: '2022',
    lang: 'Rust',
    group: 'chaos',
    phase: 'chaos-era',
    description:
      'A simple remote access trojan in Rust. HTTP-based C2, file ops, screenshots, cross-platform.',
    tech: ['Rust', 'HTTP', 'C2'],
    links: [{ label: 'github', href: 'https://github.com/ARaChn3/remy' }],
    body: 'Minimal RAT with HTTP-based command and control. Supports command execution, file upload/download, and screenshot capture. Runs on Windows and Linux. Educational/research purposes only.',
  },
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

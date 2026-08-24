import {
  siQemu,
  siNixos,
  siGodotengine,
  siLinux,
  siCplusplus,
  siRos,
  siClaude,
  siAlpinelinux,
  siGnubash,
  siPypi,
  siPydantic,
  siGooglecloud,
  siStripe,
  siGooglegemini,
} from 'simple-icons'
import { STACK, type Icon } from '../routes/stack/data'

export type TechRef = { name: string; icon?: Icon; href?: string }

// Every tech already on /stack keeps that page's icon, so a name renders the
// same mark in both places.
const fromStack: Record<string, Icon> = Object.fromEntries(
  STACK.flatMap((g) => g.items).map((t) => [t.name.toLowerCase(), t.icon]),
)

// Marks that /stack has no reason to carry.
const extraIcons: Record<string, Icon> = {
  qemu: siQemu,
  kvm: siQemu,
  nix: siNixos,
  godot: siGodotengine,
  alpine: siAlpinelinux,
  'c++': siCplusplus,
  ros: siRos,
  'claude code': siClaude,
  pip: siPypi,
  cgo: siGnubash,
  'bubble tea': siGnubash,
  'cloud-init': siLinux,
  distributed: siLinux,
  pydantic: siPydantic,
  gcp: siGooglecloud,
  stripe: siStripe,
  gemini: siGooglegemini,
  claude: siClaude,
}

// A tag with no entry here renders as plain text. Add one when the target
// page is worth a visitor's click.
const urls: Record<string, string> = {
  go: 'https://go.dev',
  rust: 'https://www.rust-lang.org',
  python: 'https://www.python.org',
  typescript: 'https://www.typescriptlang.org',
  javascript: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
  c: 'https://en.cppreference.com/w/c',
  'c++': 'https://isocpp.org',
  qemu: 'https://www.qemu.org',
  kvm: 'https://linux-kvm.org',
  'cloud-init': 'https://cloud-init.io',
  'bubble tea': 'https://github.com/charmbracelet/bubbletea',
  nix: 'https://nixos.org',
  godot: 'https://godotengine.org',
  docker: 'https://www.docker.com',
  sqlite: 'https://sqlite.org',
  redis: 'https://redis.io',
  qdrant: 'https://qdrant.tech',
  memgraph: 'https://memgraph.com',
  ollama: 'https://ollama.com',
  huggingface: 'https://huggingface.co',
  pytorch: 'https://pytorch.org',
  mcp: 'https://modelcontextprotocol.io',
  cedar: 'https://www.cedarpolicy.com',
  litellm: 'https://litellm.ai',
  'pydantic ai': 'https://ai.pydantic.dev',
  stripe: 'https://stripe.com',
  npm: 'https://www.npmjs.com',
  pip: 'https://pypi.org',
  pixi: 'https://pixi.sh',
  esp32: 'https://www.espressif.com/en/products/socs/esp32',
  ros: 'https://www.ros.org',
  'claude code': 'https://claude.com/claude-code',
  'asd-ste100': 'https://asd-ste100.org',
  claude: 'https://claude.ai',
  pydantic: 'https://docs.pydantic.dev',
  gcp: 'https://cloud.google.com',
  gemini: 'https://deepmind.google/technologies/gemini',
}

export function techRef(name: string): TechRef {
  const k = name.toLowerCase()
  return { name, icon: fromStack[k] || extraIcons[k], href: urls[k] }
}

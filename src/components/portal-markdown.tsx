import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

/** Document reference the whole page hangs off. Modules are DOC/NN. */
export const PORTAL_DOC = 'OP-2609'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

/**
 * Editorial, not derived: each line summarises its section without engaging
 * with it. A heading with no entry here renders without a line rather than
 * with a guessed one.
 */
const MODULE_LINES: Record<string, string> = {
  'the-joke-about-the-million-dollars':
    'Reviews a widely circulated remark about compute expenditure and the result it accompanied.',
  'what-a-definition-buys-you':
    'Examines two public statements on general intelligence and the definitions each relies on.',
  'everybody-is-just-tired':
    'Describes reduced engagement with the subject area and attributes it to sustained exposure.',
  'the-two-kinds-of-company':
    'Distinguishes organisations that produce new capability from organisations that resell it.',
  'the-robots-nobody-is-watching':
    'Summarises recent funding activity in physical intelligence and its coverage to date.',
  'more-than-half-the-internet':
    'Reports current figures on automated web traffic and machine performance in conversational tests.',
  'play-with-it':
    'Recommends practices for maintaining curiosity and identifies appropriate targets for frustration.',
  'where-this-leaves-me':
    'Restates the preceding findings and closes with one suggested action.',
}

export type PortalModule = { id: string; text: string; line?: string; n: string; ref: string }

/**
 * Numbering comes from a scan of the raw markdown. react-markdown gives no
 * guarantee about the order its `h2` components run in, so a render-time
 * counter would number the modules at random.
 */
export function portalModules(markdown: string): PortalModule[] {
  return [...markdown.matchAll(/^## (.+)$/gm)].map((m, i) => {
    const id = slugify(m[1])
    const n = String(i + 1).padStart(2, '0')
    return { id, text: m[1], line: MODULE_LINES[id], n, ref: `${PORTAL_DOC}/${n}` }
  })
}

function buildComponents(mods: Map<string, PortalModule>): Components {
  return {
    h2({ children, ...props }) {
      const id = slugify(String(children))
      const mod = mods.get(id)
      return (
        <div className="op-mod">
          <p className="op-mod-ref">
            <span>Module {mod?.n}</span>
            {mod && <span className="op-mod-doc">{mod.ref}</span>}
          </p>
          <span className="op-mod-num" aria-hidden="true">
            {mod?.n}
          </span>
          <h2 id={id} {...props}>
            {children}
          </h2>
          {mod?.line && <p className="op-mod-line">{mod.line}</p>}
        </div>
      )
    },
    h3({ children, ...props }) {
      return (
        <h3 id={slugify(String(children))} {...props}>
          {children}
        </h3>
      )
    },
    a({ href, children, ...props }) {
      const external = !!href && /^https?:\/\//.test(href)
      return (
        <a href={href} {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})} {...props}>
          {children}
        </a>
      )
    },
  }
}

export function PortalMarkdown({ children }: { children: string }) {
  const mods = new Map(portalModules(children).map((m) => [m.id, m]))
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={buildComponents(mods)}>
      {children}
    </ReactMarkdown>
  )
}

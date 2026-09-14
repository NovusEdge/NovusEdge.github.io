import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { blogHeadings, headingId as slugify } from '../lib/blog-headings'
import { Children, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * Editorial, not derived: the chip names what the section does to the argument,
 * which the heading text does not say. A heading with no entry here gets no chip
 * rather than a guessed one.
 */
const SECTION_LABELS: Record<string, string> = {
  'the-room': 'Field note',
  'where-i-stand': 'Position',
  'the-jobs-number': 'Figures',
  storage: 'Constraint',
  'how-much-power': 'Scale',
  'who-pays': 'Cost',
  hamina: 'Counter-example',
  'the-heat-doesnt-come-back': 'Correction',
  regulation: 'Friction',
  'lumi-is-right-there': 'Precedent',
  'my-stake': 'Interest',
  water: 'Uncertainty',
  'what-ive-got': 'Open',
}

export type GridHeading = { id: string; text: string; line: number; label?: string; n: string }

/**
 * Numbering comes from a scan of the raw markdown. react-markdown gives no
 * guarantee about the order its `h2` components run in, so a render-time
 * counter numbers the sections at random.
 */
export function gridHeadings(markdown: string, t?: TFunction): GridHeading[] {
  return blogHeadings(markdown, 'googles-13-billion-in-finland').map((head, i) => {
    return { ...head, label: SECTION_LABELS[head.id] ? t?.(`blog.grid.section.${head.id}`) ?? SECTION_LABELS[head.id] : undefined, n: String(i + 1).padStart(2, '0') }
  })
}

const MONEY = /(€\s?\d+(?:[.,]\d+)?(?:\s+(?:billion|million))?(?:\/MWh)?|\d+(?:[.,]\d+)?\s?c\/kWh)/gi

/** Money and price only. Gigawatts and percentages stay cold: the page reads cost as heat. */
export function markMoney(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child !== 'string') return child
    const parts = child.split(MONEY)
    if (parts.length === 1) return child
    return parts.map((part, i) => (i % 2 === 1 ? <span key={i} className="fg-fig">{part}</span> : part))
  })
}

/** Lattice pylon straddling the conductor hairline, one per section boundary. */
function Pylon() {
  return (
    <svg className="fg-node" viewBox="0 0 20 26" aria-hidden="true">
      <path d="M10 0v26M3 26 10 5M17 26 10 5M2 8h16M4.5 13h11" />
      <circle cx="2" cy="8" r="1.2" />
      <circle cx="18" cy="8" r="1.2" />
    </svg>
  )
}

function buildComponents(heads: Map<number, GridHeading>): Components {
  return {
    h2({ children, node, ...props }) {
      const head = heads.get(node?.position?.start.line ?? 0)
      const id = head?.id ?? slugify(String(children))
      return (
        <div className="fg-sec">
          <Pylon />
          {head?.label && (
            <p className="fg-chip">
              <span className="fg-chip-n">{head.n}</span>
              {head.label}
            </p>
          )}
          <h2 id={id} {...props}>
            {children}
          </h2>
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
    p({ children, ...props }) {
      return <p {...props}>{markMoney(children)}</p>
    },
    li({ children, ...props }) {
      return <li {...props}>{markMoney(children)}</li>
    },
    a({ href, children, ...props }) {
      const external = !!href && /^https?:\/\//.test(href)
      return (
        <a href={href} {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})} {...props}>
          {markMoney(children)}
        </a>
      )
    },
  }
}

export function GridMarkdown({ children }: { children: string }) {
  const { t } = useTranslation()
  const heads = new Map(gridHeadings(children, t).map((h) => [h.line, h]))
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={buildComponents(heads)}>
      {children}
    </ReactMarkdown>
  )
}

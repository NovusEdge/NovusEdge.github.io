import { useTranslation } from 'react-i18next'
import { blogHeadings, headingId as slugify } from '../lib/blog-headings'
import { Children, isValidElement, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

function flattenText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(flattenText).join('')
  if (isValidElement(node)) return flattenText((node.props as { children?: ReactNode }).children)
  return ''
}

function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href)
}

function hostOf(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, '')
  } catch {
    return href
  }
}

/**
 * ET Book is a book face and straight quotes read as a typewriter in it, which
 * breaks the one effect this page exists for. The split keeps code spans and
 * link destinations out of the substitution, so a URL's apostrophes and the
 * quotes inside `code` survive untouched.
 */
function smarten(md: string): string {
  return md
    .split(/(`[^`]*`|\]\([^)]*\))/g)
    .map((part, i) =>
      i % 2 === 1
        ? part
        : part
            .replace(/(\w)'(\w)/g, '$1’$2')
            .replace(/(^|[\s([{])"/gm, '$1“')
            .replace(/"/g, '”')
            .replace(/(^|[\s([{])'/gm, '$1‘'),
    )
    .join('')
}

/**
 * Citation order comes from a scan of the raw markdown, not from render order:
 * react-markdown gives no guarantee about the sequence its `a` components run
 * in, so a counter incremented during render numbers the notes at random.
 * Repeat hrefs share a number, which is what a reference list does anyway.
 */
function citationIndex(markdown: string): Map<string, number> {
  const order = new Map<string, number>()
  let n = 0
  for (const m of markdown.matchAll(/\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g)) {
    const href = m[1]
    if (!order.has(href)) order.set(href, ++n)
  }
  return order
}

function SideNote({ num, href, label }: { num: number; href: string; label: string }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState(false)
  const [below, setBelow] = useState(false)
  const note = useRef<HTMLSpanElement>(null)
  const id = useId()
  const compact = () => matchMedia('(min-width: 1024px) and (max-width: 1699px)').matches
  const expanded = open || preview
  const description = t('blog.planA.note', { number: num, host: hostOf(href) })

  useEffect(() => {
    if (!expanded) return
    const dismiss = (event: PointerEvent) => {
      const toggle = event.target instanceof Element && event.target.closest('button')?.getAttribute('aria-controls') === id
      if (event.target instanceof Node && !note.current?.contains(event.target) && !toggle) {
        setOpen(false)
        setPreview(false)
      }
    }
    const position = () => {
      if (!compact()) {
        setPreview(false)
        return
      }
      const content = note.current?.querySelector<HTMLElement>('.pa-sn-content')
      if (content && note.current) {
        setBelow(note.current.getBoundingClientRect().top < content.offsetHeight + 90)
      }
    }
    position()
    document.addEventListener('pointerdown', dismiss)
    window.addEventListener('scroll', position, { passive: true })
    window.addEventListener('resize', position)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      window.removeEventListener('scroll', position)
      window.removeEventListener('resize', position)
    }
  }, [expanded, id])

  return (
    <>
      <sup className="pa-sn-mark">{num}</sup>
      <button
        type="button"
        className="pa-sn-toggle"
        aria-expanded={open}
        aria-controls={id}
        aria-label={description}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false)
        }}
      >
        {num}
      </button>
      <span
        ref={note}
        className={`pa-sn${expanded ? ' pa-sn-open' : ''}`}
        data-side={below ? 'below' : 'above'}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse' && compact()) setPreview(true)
        }}
        onPointerLeave={() => {
          if (!note.current?.contains(document.activeElement)) setPreview(false)
        }}
        onFocus={(event) => {
          if (compact() && event.target.matches(':focus-visible')) setPreview(true)
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setOpen(false)
            setPreview(false)
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            if (compact()) note.current?.querySelector<HTMLButtonElement>('.pa-sn-peek')?.focus()
            setOpen(false)
            setPreview(false)
          }
        }}
      >
        <button
          type="button"
          className="pa-sn-peek"
          aria-expanded={expanded}
          aria-controls={id}
          aria-label={description}
          onClick={() => {
            setOpen(!expanded)
            setPreview(false)
          }}
        >
          {String(num).padStart(2, '0')}
        </button>
        <span id={id} className="pa-sn-content" role="note" aria-label={description}>
          <span className="pa-sn-num">{num}</span>
          {label}
          {', '}
          <a href={href} target="_blank" rel="noreferrer noopener">
            {hostOf(href)}
          </a>
        </span>
      </span>
    </>
  )
}

/**
 * A credit written as a markdown link would be swept up by the `a` handler and
 * turned into a numbered sidenote, so the caption carries a bare URL instead
 * and gets its anchor here. The link text is the host, matching the sidenotes.
 */
function Figure({ src, alt, title }: { src?: string; alt?: string; title?: string }) {
  const href = title?.match(/https?:\/\/\S+$/)?.[0]
  const text = href ? title!.slice(0, -href.length).trim() : title
  return (
    <figure className="pa-fig">
      <img src={src} alt={alt ?? ''} loading="lazy" />
      {title && (
        <figcaption>
          {text}
          {href && (
            <>
              {' '}
              <a href={href} target="_blank" rel="noreferrer noopener">
                {hostOf(href)}
              </a>
            </>
          )}
        </figcaption>
      )}
    </figure>
  )
}

/**
 * The post treats Plan A as the name of a work, so every mention gets quote
 * marks and the page accent. Callers that also need the heading id must derive
 * it from the untransformed children: slugify() reads the text through
 * String(children), and that returns [object Object] once spans are in there.
 */
export function markPlanA(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child !== 'string') return child
    const parts = child.split(/\bPlan A\b/g)
    if (parts.length === 1) return child
    return parts.flatMap((part, i) =>
      i === 0
        ? [part]
        : [
            <span key={i} className="pa-q">
              {'“Plan A”'}
            </span>,
            part,
          ],
    )
  })
}

// Decimals, percentages, signed deltas and comma-grouped counts. Bare integers
// stay plain so years and small counts do not light up the paragraph.
const FIGURE = /([+−-]?\d+\.\d+%?|\d{1,3}(?:,\d{3})+|\d+%|[+−]\d+)/g

function markNumbers(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child !== 'string') return child
    const parts = child.split(FIGURE)
    if (parts.length === 1) return child
    return parts.map((part, i) =>
      i % 2 ? (
        <span key={i} className="pa-num">
          {part}
        </span>
      ) : (
        part
      ),
    )
  })
}

function CodeBlock({ lang, children }: { lang?: string; children: ReactNode }) {
  const pre = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)
  const copy = () => {
    void navigator.clipboard.writeText(pre.current?.textContent ?? '').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <div className="pa-code">
      <div className="pa-code-bar">
        <span>{lang ?? ''}</span>
        <button type="button" onClick={copy}>
          {copied ? 'copied' : 'copy'}
        </button>
      </div>
      <pre ref={pre}>{children}</pre>
    </div>
  )
}

type Options = { figures: Record<string, ReactNode>; numbers: boolean; highlight: boolean }

function buildComponents(cites: Map<string, number>, heads: Map<number, string>, { figures, numbers, highlight }: Options): Components {
  const mark = numbers ? (c: ReactNode) => markNumbers(markPlanA(c)) : markPlanA
  const extra: Components = {}
  if (numbers) {
    extra.strong = ({ children }) => <strong>{markNumbers(children)}</strong>
    extra.em = ({ children }) => <em>{markNumbers(children)}</em>
    extra.td = ({ children, node: _node, ...props }) => <td {...props}>{markNumbers(children)}</td>
  }
  if (highlight) {
    extra.pre = ({ children, node }) => {
      const code = node?.children[0]
      const cls = code?.type === 'element' ? code.properties?.className : undefined
      const lang = Array.isArray(cls) ? cls.map(String).find((c) => c.startsWith('language-'))?.slice(9) : undefined
      return <CodeBlock lang={lang}>{children}</CodeBlock>
    }
  }
  return {
    ...extra,
    img({ src, alt, title }) {
      const drawn = typeof src === 'string' ? figures[src] : undefined
      if (drawn) {
        return (
          <figure className="pa-fig oj-chart" aria-label={alt}>
            {drawn}
          </figure>
        )
      }
      return <Figure src={typeof src === 'string' ? src : undefined} alt={alt} title={title} />
    },
    // A figure cannot live inside the <p> react-markdown wraps a lone image in.
    p({ children, node, ...props }) {
      const kids = node?.children.filter((c) => c.type !== 'text' || c.value.trim() !== '')
      if (kids?.length === 1 && kids[0].type === 'element' && kids[0].tagName === 'img') {
        return <>{children}</>
      }
      return <p {...props}>{mark(children)}</p>
    },
    li({ children, node: _node, ...props }) {
      return <li {...props}>{mark(children)}</li>
    },
    h2({ children, node, ...props }) {
      const id = heads.get(node?.position?.start.line ?? 0) ?? slugify(String(children))
      return <h2 id={id} {...props}>{markPlanA(children)}</h2>
    },
    h3({ children, ...props }) {
      const id = slugify(String(children))
      return <h3 id={id} {...props}>{markPlanA(children)}</h3>
    },
    a({ href, children, ...props }) {
      if (!href || !isExternal(href)) {
        return <a href={href} {...props}>{children}</a>
      }
      const num = cites.get(href)
      // A link whose text carries markup arrives as React nodes, and
      // String() on those prints [object Object] into the sidenote.
      const label = flattenText(children) || hostOf(href)
      return (
        <>
          <a href={href} target="_blank" rel="noreferrer noopener" {...props}>
            {children}
          </a>
          {num !== undefined && <SideNote num={num} href={href} label={label} />}
        </>
      )
    },
  }
}

/**
 * `figures` swaps an image for a drawn figure, keyed by the image's src.
 * `numbers` sets figures in prose apart; `highlight` colours fenced code.
 */
export function PlanAMarkdown({
  children,
  slug = 'plan-a-ai',
  figures = {},
  numbers = false,
  highlight = false,
}: {
  children: string
  slug?: string
  figures?: Record<string, ReactNode>
  numbers?: boolean
  highlight?: boolean
}) {
  const md = smarten(children)
  const heads = new Map(blogHeadings(md, slug).map((head) => [head.line, head.id]))
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={highlight ? [rehypeHighlight] : []}
      components={buildComponents(citationIndex(md), heads, { figures, numbers, highlight })}
    >
      {md}
    </ReactMarkdown>
  )
}

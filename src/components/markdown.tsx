import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { Redacted } from './redacted'
import { ShaderCanvas } from './shader-canvas'
import { CodeCompare } from './code-compare'
import { HueDiagram } from './hue-diagram'
import { Spoiler } from './spoiler'
import { withSlash } from '../i18n/paths'

// hast -> plain text, just enough to sniff a marker
function nodeText(node: unknown): string {
  const n = node as { value?: string; children?: unknown[] } | null
  if (!n) return ''
  if (n.value) return n.value
  return (n.children ?? []).map(nodeText).join('')
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

// ponytail: extract YouTube video ID from various URL formats
function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

// `status:<tone> label` inline code renders as a pill; tones are fixed so a typo falls back to plain code.
const STATUS = /^status:(ok|wait|warn)\s+(.+)$/
const STATUS_TONE = {
  ok: 'border-paper-deep/40 bg-paper/10 text-paper-deep dark:border-paper/40 dark:text-paper',
  wait: 'border-gold/50 bg-gold/10 text-[#9a7020] dark:text-gold',
  warn: 'border-red-700/40 bg-red-700/10 text-red-800 dark:border-red-400/40 dark:text-red-300',
} as const

const components: Components = {
  h2({ children, ...props }) {
    const text = String(children)
    const id = slugify(text)
    return <h2 id={id} {...props}>{children}</h2>
  },
  h3({ children, ...props }) {
    const text = String(children)
    const id = slugify(text)
    return <h3 id={id} {...props}>{children}</h3>
  },
  // ponytail: amber callout keyed off a leading ⚠️, spoiler keyed off "SPOILER:"
  blockquote({ node, children, ...props }) {
    const text = nodeText(node).trimStart()
    if (text.startsWith('⚠️')) {
      return (
        <blockquote
          {...props}
          className="not-italic rounded-md border-l-4 border-amber-500/70 bg-amber-500/10 px-4 py-3 text-sm font-medium text-charcoal/80 dark:text-bone/80 [&_p]:my-1 [&_p]:before:content-none [&_p]:after:content-none"
        >
          {children}
        </blockquote>
      )
    }
    // A blockquote opening with a curly quote is a pull quote; a last paragraph starting with an em dash is its attribution.
    if (text.startsWith('“')) {
      return (
        <blockquote
          {...props}
          className="not-italic my-12 border-l-0 border-y !border-gold/60 py-8 pl-0 text-charcoal dark:text-bone [&_p]:my-0 [&_p]:!font-display [&_p]:!text-[30px] [&_p]:font-semibold [&_p]:leading-snug [&_p]:before:content-none [&_p]:after:content-none [&_p:last-child:not(:first-child)]:mt-5 [&_p:last-child:not(:first-child)]:!font-mono [&_p:last-child:not(:first-child)]:!text-[12px] [&_p:last-child:not(:first-child)]:font-normal [&_p:last-child:not(:first-child)]:uppercase [&_p:last-child:not(:first-child)]:tracking-[0.2em] [&_p:last-child:not(:first-child)]:text-gold"
        >
          {children}
        </blockquote>
      )
    }
    return <blockquote {...props}>{children}</blockquote>
  },
  // `[ REDACTED ]` inline code becomes the scramble-on-rest, reveal-on-hover redaction.
  code({ node, className, children, ...props }) {
    if (nodeText(node).trim() === '[ REDACTED ]') return <Redacted />
    const status = STATUS.exec(nodeText(node).trim())
    if (status) {
      const [, tone, label] = status as unknown as [string, keyof typeof STATUS_TONE, string]
      return (
        <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 font-mono text-[0.7em] uppercase tracking-wider ${STATUS_TONE[tone]}`}>
          {label}
        </span>
      )
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  },
  // ponytail: ```glsl-live renders interactive shader, ```compare renders side-by-side
  pre({ node, children }) {
    const code = node?.children?.[0] as { properties?: { className?: string[] }; children?: unknown[] } | undefined
    const classes = code?.properties?.className ?? []
    const lang = classes.find((c: string) => c.startsWith('language-'))?.replace('language-', '')

    if (lang === 'glsl-live') {
      return <ShaderCanvas fragmentShader={nodeText(code)} />
    }
    if (lang === 'hue-diagram') {
      return <HueDiagram />
    }
    if (lang === 'compare') {
      const src = nodeText(code)
      const [leftBlock, rightBlock] = src.split(/\n---\n/)
      const parseBlock = (block: string) => {
        const lines = block.trim().split('\n')
        const label = lines[0].startsWith('//') ? lines[0].replace(/^\/\/\s*/, '') : ''
        const code = label ? lines.slice(1).join('\n') : block
        return { label, code }
      }
      return <CodeCompare left={parseBlock(leftBlock || '')} right={parseBlock(rightBlock || '')} />
    }
    if (lang?.startsWith('spoiler')) {
      const label = lang.replace('spoiler', '').trim() || undefined
      const content = nodeText(code).trim()
      return (
        <Spoiler label={label}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </Spoiler>
      )
    }
    return <pre>{children}</pre>
  },
  a({ node, href, ...props }) {
    return <a href={href && withSlash(href)} {...props} />
  },
  // ponytail: YouTube embeds via ![alt](youtube-url) syntax
  img({ src, alt, ...props }) {
    const ytId = src ? getYouTubeId(src) : null
    if (ytId) {
      return (
        <div className="my-6 aspect-video w-full overflow-hidden rounded-lg border border-charcoal/10 dark:border-bone/10">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${ytId}`}
            title={alt || 'YouTube video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      )
    }
    return <img src={src} alt={alt} {...props} />
  },
}

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-display prose-a:text-paper-deep prose-a:no-underline hover:prose-a:underline dark:prose-a:text-paper prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-code:font-normal prose-img:rounded-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeHighlight, rehypeKatex]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}

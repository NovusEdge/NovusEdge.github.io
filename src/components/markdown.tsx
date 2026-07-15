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
  // ponytail: amber callout keyed off a leading ⚠️ so normal `>` quotes are untouched.
  blockquote({ node, children, ...props }) {
    if (!nodeText(node).trimStart().startsWith('⚠️')) {
      return <blockquote {...props}>{children}</blockquote>
    }
    return (
      <blockquote
        {...props}
        className="not-italic rounded-md border-l-4 border-amber-500/70 bg-amber-500/10 px-4 py-3 text-sm font-medium text-charcoal/80 dark:text-bone/80 [&_p]:my-1 [&_p]:before:content-none [&_p]:after:content-none"
      >
        {children}
      </blockquote>
    )
  },
  // `[ REDACTED ]` inline code becomes the scramble-on-rest, reveal-on-hover redaction.
  code({ node, className, children, ...props }) {
    if (nodeText(node).trim() === '[ REDACTED ]') return <Redacted />
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
    return <pre>{children}</pre>
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

import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Redacted } from './redacted'

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
    <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-display prose-a:text-paper-deep prose-a:no-underline hover:prose-a:underline dark:prose-a:text-paper prose-code:font-mono prose-img:rounded-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}

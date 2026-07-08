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

const components: Components = {
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

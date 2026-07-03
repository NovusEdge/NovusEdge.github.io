import { Link } from 'react-router'
import { Meta } from '../lib/meta'
import { MonoTag } from '../components/motifs'

export default function NotFound() {
  return (
    <>
      <Meta title="404" />
      <section className="flex min-h-screen flex-col items-center justify-center px-6">
        <MonoTag>404 — not found</MonoTag>
        <h1 className="mt-4 font-display text-7xl font-black">
          迷子<span className="text-gold">.</span>
        </h1>
        <p className="mt-4 text-charcoal/60 dark:text-bone/60">This page doesn't exist (anymore).</p>
        <Link to="/" className="link-draw mt-8 font-mono text-xs uppercase tracking-[0.25em] text-paper-deep dark:text-paper">
          ← home
        </Link>
      </section>
    </>
  )
}

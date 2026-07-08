import { Link } from 'react-router'
import { Meta } from '../lib/meta'
import { MonoTag } from '../components/motifs'
import Magnetic from '../components/react-bits/Magnetic'

export default function NotFound() {
  return (
    <>
      <Meta title="404" />
      <section className="flex min-h-screen flex-col items-center justify-center px-6">
        <MonoTag>404 : not found</MonoTag>
        <h1 className="mt-4 font-display text-7xl font-black">
          迷子<span className="text-gold">.</span>
        </h1>
        <p className="mt-4 text-charcoal/60 dark:text-bone/60">This page does not exist or has moved.</p>
        <div className="mt-8">
          <Magnetic range={20}>
            <Link
              to="/"
              className="group border border-charcoal/10 hover:border-gold px-3.5 py-1.5 rounded bg-bone-tint/10 dark:border-bone/10 dark:bg-charcoal-tint/10 dark:hover:border-gold transition-colors font-mono text-xs uppercase tracking-[0.25em] text-paper-deep dark:text-paper inline-block"
            >
              [ home ]
            </Link>
          </Magnetic>
        </div>
      </section>
    </>
  )
}

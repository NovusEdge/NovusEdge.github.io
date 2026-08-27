import { useTranslation } from 'react-i18next'
import { TLink } from '../components/page-transition'
import { Meta } from '../lib/meta'
import { MonoTag } from '../components/motifs'
import Magnetic from '../components/react-bits/Magnetic'
import { useLocalePath } from '../i18n/use-locale-path'

export default function NotFound() {
  const { t } = useTranslation()
  const lp = useLocalePath()
  return (
    <>
      <Meta title="404" />
      <section className="flex min-h-screen flex-col items-center justify-center px-6">
        <MonoTag>{t('notFound.tag')}</MonoTag>
        <h1 className="mt-4 font-display text-7xl font-black">
          迷子<span className="text-gold">.</span>
        </h1>
        <p className="mt-4 text-charcoal/60 dark:text-bone/60">{t('notFound.message')}</p>
        <div className="mt-8">
          <Magnetic range={20}>
            <TLink
              to={lp('/')}
              className="group border border-charcoal/10 hover:border-gold px-3.5 py-1.5 rounded bg-bone-tint/10 dark:border-bone/10 dark:bg-charcoal-tint/10 dark:hover:border-gold transition-colors font-mono text-xs uppercase tracking-[0.25em] text-paper-deep dark:text-paper inline-block"
            >
              {t('notFound.home')}
            </TLink>
          </Magnetic>
        </div>
      </section>
    </>
  )
}

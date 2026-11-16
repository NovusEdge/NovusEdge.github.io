import { Meta } from '../../lib/meta'
import { Rule, MonoTag, JPLabel } from '../../components/motifs'

// English only on purpose: a legal notice should not go through the machine translation
// the rest of the UI uses, so this route is prerendered for the default locale alone.
const UPDATED = '16 November 2026'
const EMAIL = 'aliasgar@khimani.dev'

export default function OutreachPrivacy() {
  return (
    <>
      <Meta
        title="Outreach privacy notice"
        description="How Aliasgar Khimani gets and uses work contact details when telling public bodies about accessibility problems on their websites."
      />
      <article className="mx-auto max-w-4xl px-6 pb-24 pt-36">
        <MonoTag>Privacy · updated {UPDATED}</MonoTag>
        <div className="relative mt-3 w-fit">
          <div className="absolute -left-10 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-2 lg:flex">
            <JPLabel>個人情報</JPLabel>
            <span aria-hidden className="h-4 w-px bg-gold/50" />
          </div>
          <h1 className="font-display text-4xl font-black text-charcoal md:text-5xl dark:text-bone">
            Privacy notice for accessibility outreach
          </h1>
        </div>
        <Rule className="mt-8" />

        <div className="prose prose-neutral prose-blog mt-10 max-w-none leading-relaxed text-charcoal/80 dark:prose-invert dark:text-bone/85 prose-headings:mb-4 prose-headings:mt-10 prose-headings:font-display prose-h2:text-2xl">
          <p>
            If I emailed you about the accessibility of your organisation's website, this page explains where I got your
            contact details, what I do with them, and how to make me stop.
          </p>

          <h2>Who I am</h2>
          <p>
            Aliasgar Khimani, a self-employed web accessibility auditor based in Finland. I am the data controller. You can
            reach me at <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
          </p>

          <h2>What I hold about you</h2>
          <ul>
            <li>Your work email address, and your name and role if your organisation publishes them.</li>
            <li>The name of the organisation you work for.</li>
            <li>Any emails you send me, and whether you asked me not to contact you again.</li>
          </ul>
          <p>
            I collect no other personal data. My accessibility checks look only at your organisation's public web pages, as
            any visitor sees them, and record nothing about visitors or staff.
          </p>

          <h2>Where it comes from</h2>
          <p>
            From your organisation's own website, usually the feedback address in its accessibility statement or its
            published contact page, and from official public registers of public bodies.
          </p>

          <h2>Why I use it, and on what basis</h2>
          <p>
            To tell your organisation about accessibility problems I found on its public website, to offer my audit services,
            and to answer your replies. The legal basis is legitimate interests (Article 6(1)(f) of the GDPR and the UK GDPR):
            contacting an organisation at its published work address, about its own website, with an easy way to opt out.
          </p>

          <h2>Who else sees it</h2>
          <ul>
            <li>The people who work with me on these audits. They follow my instructions and this notice.</li>
            <li>Google, which runs my email.</li>
            <li>GitHub, which stores our working files in private repositories.</li>
            <li>Anthropic, whose AI service I use to check findings and draft messages.</li>
            <li>Ukko, my invoicing service, but only if your organisation becomes a client.</li>
          </ul>
          <p>
            I do not sell, rent or share contact details for anyone else's marketing. Google, GitHub and Anthropic are based
            in the United States. When your data leaves the EU or UK, the transfer relies on the European Commission's standard
            contractual clauses or another safeguard the GDPR and UK GDPR allow. Email me if you want details of these
            safeguards.
          </p>

          <h2>How decisions are made</h2>
          <p>
            Software, including AI, helps me find accessibility problems and draft messages. A person decides who to contact
            and reads every email before it is sent. I make no automated decisions that affect you.
          </p>

          <h2>How long I keep it</h2>
          <ul>
            <li>If you do not reply, I delete your details 12 months after my last email.</li>
            <li>
              If you ask me not to contact you, I keep only your email address on a do-not-contact list, so that I never
              write to you again.
            </li>
            <li>If your organisation becomes a client, I keep correspondence and invoices for as long as accounting law requires.</li>
          </ul>

          <h2>Your rights</h2>
          <p>
            You can ask me for a copy of what I hold, ask me to correct or delete it, ask me to limit how I use it, or object
            to my using it. I answer within one month.{' '}
            <strong>Reply "no thanks" to any of my emails and I will not write to you again.</strong> If you are unhappy with
            how I handle your data, you can complain to the{' '}
            <a href="https://tietosuoja.fi/en/home" target="_blank" rel="noopener noreferrer">
              Data Protection Ombudsman of Finland
            </a>{' '}
            or, in the UK, to the{' '}
            <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer">
              Information Commissioner's Office
            </a>
            .
          </p>
        </div>
      </article>
    </>
  )
}

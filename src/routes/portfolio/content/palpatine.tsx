import { Term } from '../kit'
import type { ProjectContent } from './types'

export const palpatine: ProjectContent = {
  lede: 'A Claude Code plugin that reads any situation for power dynamics and answers in fifty words. It started as a joke and became my most-starred repo by a wide margin.',

  sections: [
    {
      id: 'fifty-words',
      title: 'What it does',
      body: (
        <>
          <p>
            You type a situation after <code>/palpatine</code>. It names the actual problem, usually the thing you
            left out of your own description, then gives numbered actions with owners and deadlines. Fifty words,
            no preamble, no disclaimer, no suggestion that you talk it through with them first.
          </p>
          <Term>{`/palpatine my boss keeps taking credit for my work in meetings

Problem: You're a production asset, not visible. Boss has
no incentive to change.

1. CC stakeholders on status updates
2. Volunteer for work where boss isn't the only audience
3. Own a deliverable nobody else can run
4. If they escalate: paper trail, or exit`}</Term>
        </>
      ),
    },
    {
      id: 'five-triggers',
      title: 'How it decides what to answer',
      body: (
        <>
          <p>
            There is no mode picker. The skill scans what you typed for a handful of literal phrases and branches
            on the first match.
          </p>
          <ul>
            <li>
              <strong>Advise</strong>: a plain question or situation, answered with a diagnosis and actions
            </li>
            <li>
              <strong>Analyze</strong>: you paste text, it tells you what is wrong and how to fix it
            </li>
            <li>
              <strong>Write</strong>: "draft" or "help me say" gets you the artifact itself
            </li>
            <li>
              <strong>Counter</strong>: "against me" gets the other side's playbook and a pre-empt
            </li>
            <li>
              <strong>Escalate</strong>: "burn it down" gets a ladder with the cost of each rung
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'keyword-scoring',
      title: 'The scoring underneath',
      body: (
        <>
          <p>
            The 48 Laws of Power, the 33 Strategies of War, and the Art of Seduction sit underneath as JSON
            indexes: id, name, essence, a <code>when</code> list, a <code>keywords</code> list. A hook reads your
            message off stdin and scores every law by counting hits, two points per keyword match, three per{' '}
            <code>when</code> phrase match. No embedding model runs. No LLM call happens. The highest scorers feed
            the answer. The answer never cites a law number back at you, because nobody wants Law 15 quoted at them
            mid-crisis.
          </p>
        </>
      ),
    },
    {
      id: 'file-on-disk',
      title: 'Always-on mode',
      body: (
        <>
          <p>
            <code>/palpatine on</code> touches <code>~/.claude/palpatine-enabled</code>. <code>/palpatine off</code>{' '}
            deletes it. That file's existence is the entire state machine for always-on mode. A{' '}
            <code>SessionStart</code> hook checks it once per session.
          </p>
          <Term>{`THE DARK SIDE CLOUDS EVERYTHING

"I can see you. Your mind is mine to control."

Strategic lens ACTIVE. Flag power dynamics in interpersonal situations.
Append **Power dynamics:** with leverage points and applicable laws.

/palpatine off to disable.`}</Term>
          <p>With the file present, every interpersonal exchange gets a power-dynamics note appended. Purely technical tasks skip it.</p>
        </>
      ),
    },
    {
      id: 'the-stars',
      title: 'Reception',
      body: (
        <p>
          It ships under the Sith Public License, which grants permission to do whatever you want with it and
          disclaims responsibility for burned bridges, enemies made, and HR meetings attended. I built it in a
          weekend expecting nobody to notice. It has 105 stars, more than every other project on this site
          combined. I write earnest tools for months and a joke license beats all of them.
        </p>
      ),
    },
  ],
}

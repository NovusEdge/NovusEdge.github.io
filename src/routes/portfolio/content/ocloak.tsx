import type { ProjectContent } from './types'
import { Figures } from '../kit'

export const ocloak: ProjectContent = {
  lede: 'I’m researching affordable hardware and software that make surveillance data less reliable. ØCLOAK is still experimental; no hardware has shipped.',
  sections: [
    {
      id: 'through-a-wall',
      title: 'The sensing problem',
      body: (
        <>
          <p>
            WiFi sensing infers activity from changes in radio signals. Research systems have demonstrated
            through-wall motion detection with inexpensive equipment. That interests me because the person being
            sensed may not own or control the equipment collecting the signal.
          </p>
          <p>
            The capabilities vary with placement, antennas, frequency, and the surrounding room. Motion detection,
            breathing estimation, and pose reconstruction are different tasks. A result on one does not establish
            the others.
          </p>
          <p>
            The project’s <a href="https://github.com/NovusEdge/ocloak">research notes</a> cover WiFi sensing,
            Bluetooth trackers, device fingerprinting, and the limits of the proposed defenses.
          </p>
        </>
      ),
    },
    {
      id: 'one-device',
      title: 'The proposed hardware',
      body: (
        <>
          <p>
            The current design has two units. A mains-powered home unit would hold a switched reflector with enough
            physical area to affect radio paths in a room. A portable unit would carry the functions that need to
            travel with a person, including experiments with Bluetooth and WiFi decoys.
          </p>
          <p>
            The reflector experiment asks whether changing those paths can reduce the accuracy of a sensing
            receiver while leaving ordinary communications usable. That benefit has to be measured at the intended
            frequency, size, and cost before it can become a product claim.
          </p>
          <Figures items={[
            { value: '2.4 GHz', label: 'planned reflector test', note: 'efficacy remains unmeasured' },
            { value: '4–32', label: 'elements in the sweep', note: 'compare several reflector sizes' },
          ]} />
          <p>
            The design excludes jamming. Reflection and decoy traffic still need technical testing and a review of
            the rules that apply to the eventual device.
          </p>
        </>
      ),
    },
    {
      id: 'the-map',
      title: 'Software and community reports',
      body: (
        <>
          <p>
            A separate software idea is to generate coherent decoy activity that makes behavioural profiling less
            reliable. Random noise may be easy to filter, so the question is whether useful decoys can be generated
            more cheaply than an adversary can remove them.
          </p>
          <p>
            A community network for sharing observations remains part of the longer-term plan. It would need a way
            to assess reports without exposing the people submitting them. Rotating identifiers or rounding a
            location would not, by themselves, establish anonymity.
          </p>
        </>
      ),
    },
    {
      id: 'dual-use',
      title: 'How I want to fund it',
      body: (
        <>
          <p>
            The intended model is open hardware sold near manufacturing cost, with grants, crowdfunding, and
            donations supporting development. I don’t want a subscription or a VC-funded business that depends on
            collecting data from the people using it.
          </p>
          <p>
            RF work can also have defense applications. The current plan puts consumer privacy first; counter-drone
            work is a possible later direction, not the funding source for this phase.
          </p>
        </>
      ),
    },
    {
      id: 'status',
      title: 'Where it stands',
      body: (
        <>
          <p>
            The repository contains research, product plans, bench protocols, and software tools. The hardware
            still depends on the reflector experiment. A successful result would be followed by prototype work,
            legal review, and certification before production.
          </p>
          <p>
            An ultrasonic scanning tool is available for experiments with recorded audio. The browser illustration
            below shows the intended effect of obfuscation; it is not a measurement of ØCLOAK hardware.
          </p>
        </>
      ),
    },
  ],
}

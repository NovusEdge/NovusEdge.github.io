import type { ProjectContent } from './types'
import { Figures, Pull } from '../kit'

export const ocloak: ProjectContent = {
  lede: 'WiFi routers can see through walls now, off commodity hardware, and nobody consented to it. ØCLOAK builds an at-cost detector for that and the trackers around it, plus an anonymous network that turns scattered sightings into a map.',

  sections: [
    {
      id: 'through-a-wall',
      title: 'How cheap the hardware got',
      body: (
        <>
          <p>
            802.11bf, the WiFi sensing standard, was ratified in September 2025. It reads motion, presence, and
            breathing through walls using the radio signal a router already sends. Vodafone shipped a consumer
            version, "Who's Home," in December 2025.
          </p>
          <p>
            The physics behind it is not new. Every WiFi receiver already computes channel state information to
            decode its own traffic; sensing just reads that data instead of discarding it. RuView, an open-source
            implementation, has 76,000 GitHub stars and runs through-wall presence detection on a $9 ESP32.
          </p>
          <Figures
            items={[
              { value: '$9', label: 'esp32 board', note: 'runs through-wall presence detection' },
              { value: '76k', label: 'stars on ruview', note: 'the open-source implementation' },
              { value: '$2,000', label: 'cheapest tscm sweep', note: 'sold to corporate clients' },
            ]}
          />
          <p>
            BLE trackers run on the same asymmetry: cheap hardware, the entire iPhone install base acting as unpaid
            relays, and a protocol nobody has to authenticate against to use. Facial recognition is a commodity API
            now too.
          </p>
          <p>
            Defense against any of this tops out at a handful of TSCM sweeps priced for corporate clients. Almost
            nothing exists for a renter who wants to know what's reading their apartment.
          </p>
        </>
      ),
    },
    {
      id: 'one-device',
      title: 'Down to one device',
      body: (
        <>
          <p>
            The early hardware plan had four devices: a WiFi sensing detector, a broader RF detector, a passive
            RF-blocking pouch, and a bundle of all three. The roadmap has since narrowed to one lead product:
            ØCLOAK Guard.
          </p>
          <p>
            Guard runs on a single ESP32-C3 and does two things. In BLE mode it watches for AirTag, SmartTag, and
            Tile advertisements, plus the non-compliant clones that skip the anti-stalking rotation schedule
            entirely. In WiFi mode it watches for the sounding frames (NDP and NDPA) that 802.11bf sensing
            sessions send, frames that carry no payload encryption because they're control-plane traffic. Combined
            mode runs both and alerts on either.
          </p>
          <p>
            Target price is $20 to $25. Manufacturing follows the Pine64 playbook: turnkey builds through Seeed
            Fusion, 3D-printed enclosures for the first few hundred units, injection molding once around a thousand
            are committed. ØCLOAK deprioritized the blocking pouches and anti-facial-recognition glasses from the
            original lineup for now: commodity market for one, a different supply chain for the other.
          </p>
          <Pull>
            Detection and passive shielding are legal everywhere. Active jamming is legal nowhere, in the US or the
            EU. Guard only listens.
          </Pull>
        </>
      ),
    },
    {
      id: 'the-map',
      title: 'Mapping the sightings',
      body: (
        <>
          <p>
            A detector alone tells you about one room. ØCLOAK's network takes sightings from Guard devices and from
            manual reports, then turns them into a location-tagged map, the way Waze turns individual drivers into
            traffic data.
          </p>
          <p>
            Contribution has no account behind it. Each device generates a pseudonymous key that rotates, and
            location gets rounded to a grid cell before it ever leaves the device, precise enough to be useful and
            fuzzy enough that a report can't be traced to an address. Reports carry weight: hardware-sourced
            detections count more than manual ones until other users confirm them.
          </p>
          <p>
            The plan starts centralized, one API server and one map, because a peer-to-peer layer is real
            infrastructure work on its own. Decentralization comes later, once there's enough traffic to make
            community-run coordination nodes worth running.
          </p>
        </>
      ),
    },
    {
      id: 'grant-list',
      title: 'Funding without VC',
      body: (
        <>
          <p>
            No VC. Venture money on a privacy company brings growth mandates and an eventual exit, and both point
            toward monetizing the exact data the product promises to protect. ØCLOAK runs on grants, crowdfunding,
            and donations instead.
          </p>
          <Figures
            items={[
              { value: '€5k–50k', label: 'nlnet ngi zero', note: 'deadline the 1st of every even month' },
              { value: '$50k–200k', label: 'open technology fund', note: 'paid out of USAGM money' },
              { value: '58%', label: 'crowd supply success', note: 'kickstarter runs 30%' },
            ]}
          />
          <p>
            NLnet's NGI Zero fund is the first target: low bureaucracy, EU-based, and small enough to apply for
            without a lawyer. The Open Technology Fund pays four times more. It also means US government money
            behind an anti-surveillance tool, the same awkward optics Tor has fielded questions about for years.
            That tradeoff is still open.
          </p>
          <p>
            Hardware launches go through Crowd Supply for the success rate above, plus a 100% delivery rate on
            funded campaigns. Grants and donations alone still run a deficit at scale. Signal spends about $36
            million a year and outspends its own revenue. ØCLOAK's projections assume the blend every project in
            this space ends up needing: grants, donations, and corporate sponsors together.
          </p>
        </>
      ),
    },
    {
      id: 'pointed-outward',
      title: 'A path into defense work',
      body: (
        <>
          <p>
            The transferable asset here is the RF work: channel state analysis, SDR spectrum handling, emitter
            fingerprinting, sensor fusion, adversarial ML. Consumer privacy hardware is one packaging of that skill.
            Counter-drone detection is another, and the physics barely changes. A drone is an RF emitter with a
            control link and a video downlink, plus an acoustic and optical signature. Detect, track, classify.
          </p>
          <p>
            I'm still weighing that direction. It also fights everything above. Defense work ends the
            open-source and community model through export control and secrecy. Dual-use founders
            usually get absorbed by the paying customer, and the privacy track goes vestigial unless something
            structural protects it.
          </p>
          <p>
            The shape that survives both: one detection engine trained on drone and emitter data recorded
            first-hand, with two surfaces over it. A networked defense product that pays for the research, and a
            local-only consumer detector with zero telemetry. Drone detection needs drone data, so the consumer
            device never has to become a harvesting flywheel. The crowdsourced sensor network sits on hold while
            that question stays open.
          </p>
        </>
      ),
    },
    {
      id: 'status',
      title: 'Status: nothing shipped yet',
      body: (
        <>
          <p>
            Research and planning. I've written down the threat model, the hardware bill of materials, and the
            network architecture. No board has shipped to anyone yet.
          </p>
          <p>
            The roadmap's first concrete steps: order five ESP32-C3 dev boards, get BLE scanning to detect a real
            AirTag advertisement, get WiFi monitor mode capturing real sounding frames, and file the NLnet
            application before its next deadline. That's where the project stands: prototype hardware before a
            grant, before a crowdfunding campaign, before anything ships.
          </p>
        </>
      ),
    },
  ],
}

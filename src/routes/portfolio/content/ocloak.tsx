import type { ProjectContent } from './types'
import { Figures, Pull } from '../kit'

export const ocloak: ProjectContent = {
  lede: 'WiFi routers can see through walls now, off commodity hardware, and nobody consented to it. ØCLOAK builds an at-cost detector for that and the trackers around it, plus an anonymous network that turns scattered sightings into a map.',

  sections: [
    {
      id: 'through-a-wall',
      title: 'A $9 board sees through your wall',
      body: (
        <>
          <p>
            802.11bf, the WiFi-sensing standard, was ratified in September 2025. It reads motion, presence, and
            breathing through a wall, off the same signal your router already broadcasts. Vodafone shipped a
            consumer version, "Who's Home," three months later.
          </p>
          <p>
            None of the physics is new. Every WiFi chip already computes channel state information to decode its own
            traffic; sensing just keeps that data instead of throwing it away. RuView, the open-source build, has
            76,000 stars and does through-wall presence detection on a $9 ESP32.
          </p>
          <Figures
            items={[
              { value: '$9', label: 'esp32 board', note: 'runs through-wall presence detection' },
              { value: '76k', label: 'stars on ruview', note: 'the open-source implementation' },
              { value: '$2,000', label: 'cheapest tscm sweep', note: 'sold to corporate clients' },
            ]}
          />
          <p>
            BLE trackers run the same asymmetry: a cheap tag, the entire iPhone install base relaying for free, and
            a protocol nobody has to authenticate against. Facial recognition is a commodity API. Defense against
            any of it stops at a handful of TSCM sweeps priced for corporate clients. A renter who wants to know
            what's reading their apartment gets nothing.
          </p>
        </>
      ),
    },
    {
      id: 'one-device',
      title: 'One device, not four',
      body: (
        <>
          <p>
            The plan started with four devices: a WiFi-sensing detector, a broader RF detector, a passive blocking
            pouch, and a bundle. It's one now: ØCLOAK Guard.
          </p>
          <p>
            Guard runs on a single ESP32-C3 and does two things. In BLE mode it watches for AirTag, SmartTag, and
            Tile beacons, plus the off-brand clones that skip the anti-stalking rotation entirely. In WiFi mode it
            watches for the NDP and NDPA sounding frames an 802.11bf session sends; those frames are control-plane,
            so they carry no payload encryption to hide behind. Combined mode runs both.
          </p>
          <p>
            Target price is $20 to $25. Manufacturing follows the Pine64 playbook: turnkey boards through Seeed
            Fusion, 3D-printed enclosures for the first few hundred units, injection molding once a thousand are
            committed. The blocking pouches and anti-facial-recognition glasses are parked. One's a commodity
            market; the other's a different supply chain.
          </p>
          <Pull>
            Detection and passive shielding are legal everywhere. Active jamming is legal nowhere, US or EU. Guard
            only listens.
          </Pull>
        </>
      ),
    },
    {
      id: 'the-map',
      title: "One room isn't a map",
      body: (
        <>
          <p>
            A detector tells you about one room. The network turns a lot of rooms into a map. Guards and manual
            reports feed sightings in, and the map tags them by location, the way Waze turns single drivers into
            traffic.
          </p>
          <p>
            There's no account behind a report. Each device mints a rotating pseudonymous key, and location is
            rounded to a grid cell before it ever leaves the device: precise enough to be useful, fuzzy enough that
            a report can't be pinned to an address. Hardware detections outweigh manual ones until other users
            confirm them.
          </p>
          <p>
            It starts centralized, one API server and one map, because a peer-to-peer layer is its own
            infrastructure project. Decentralization waits until there's enough traffic to make community-run nodes
            worth running.
          </p>
        </>
      ),
    },
    {
      id: 'grant-list',
      title: 'No VC',
      body: (
        <>
          <p>
            No VC. Venture money on a privacy company comes with a growth mandate and an exit, and both point at
            monetizing the exact data the product exists to protect. ØCLOAK runs on grants, crowdfunding, and
            donations.
          </p>
          <Figures
            items={[
              { value: '€5k–50k', label: 'nlnet ngi zero', note: 'deadline the 1st of every even month' },
              { value: '$50k–200k', label: 'open technology fund', note: 'paid out of USAGM money' },
              { value: '58%', label: 'crowd supply success', note: 'kickstarter runs 30%' },
            ]}
          />
          <p>
            NLnet's NGI Zero is the first target: low bureaucracy, EU-based, small enough to apply for without a
            lawyer. The Open Technology Fund pays four times more, and it means US government money behind an
            anti-surveillance tool, the same optics Tor has answered for since forever. That trade is still open.
            Hardware launches go through Crowd Supply for the success rate and its 100% delivery record on funded
            campaigns. Grants and donations alone still lose money at scale. Signal spends about $36 million a year
            and outspends its own revenue, and the projections here assume the blend every project in this space
            ends up needing.
          </p>
        </>
      ),
    },
    {
      id: 'pointed-outward',
      title: 'The exit that eats the mission',
      body: (
        <>
          <p>
            The real asset underneath all of this is the RF work: channel-state analysis, SDR spectrum handling,
            emitter fingerprinting, sensor fusion, adversarial ML. Consumer privacy hardware is one way to package
            that skill. Counter-drone detection is another, and the physics barely moves: a drone is an RF emitter
            with a control link and a video downlink, plus an acoustic and optical signature. Detect, track,
            classify.
          </p>
          <p>
            I'm still weighing it, because it fights everything above. Defense work ends the open-source and
            community model through export control and secrecy. Dual-use founders usually get absorbed by the paying
            customer, and the privacy side goes vestigial unless something structural protects it.
          </p>
          <p>
            The shape that survives both: one detection engine trained on drone and emitter data I record
            first-hand, with two faces over it. A networked defense product pays for the research; a local-only
            consumer detector ships with zero telemetry. Drone detection needs drone data, so the consumer device
            never has to become a harvesting flywheel. The crowdsourced network stays on hold while that question is
            open.
          </p>
          <p>
            I haven't picked a side, and I'm not pretending the tension resolves cleanly. If you work in this
            space, defense or privacy, I want to hear how you'd draw the line. The inbox is open.
          </p>
        </>
      ),
    },
    {
      id: 'status',
      title: 'What exists so far',
      body: (
        <>
          <p>
            Research and planning. The threat model, the hardware bill of materials, and the network architecture
            are written down. No board has shipped to anyone.
          </p>
          <p>
            The first steps are small: order five ESP32-C3 dev boards, get BLE scanning to flag a real AirTag, get
            WiFi monitor mode capturing real sounding frames, and file the NLnet application before its next
            deadline. Prototype hardware first, then a grant, then a campaign, then anything ships.
          </p>
        </>
      ),
    },
  ],
}

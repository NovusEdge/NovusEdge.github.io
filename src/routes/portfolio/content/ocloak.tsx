import type { ProjectContent } from './types'
import { Figures } from '../kit'

export const ocloak: ProjectContent = {
  lede: 'Your WiFi router can see you breathe through a wall. The standard shipped in 2025; consumer products followed three months later. ØCLOAK is an at-cost detector and a crowdsourced map of where the sensors are.',

  sections: [
    {
      id: 'through-a-wall',
      title: 'The $9 through-wall sensor',
      body: (
        <>
          <p>
            <code>802.11bf</code>, the WiFi-sensing amendment, was ratified in September 2025. It reads motion, presence, and
            respiration through drywall, using the same signal your router already broadcasts. Vodafone's "Who's Home"
            shipped that December.
          </p>
          <p>
            The physics has been possible for years. Every WiFi chip computes channel state information to decode
            traffic; sensing keeps that data instead of discarding it. Through-wall presence detection has been
            demoed on a $9 ESP32.
          </p>
          <Figures
            items={[
              { value: '$9', label: 'esp32 board', note: 'runs through-wall presence detection' },
              { value: '$2,000', label: 'cheapest tscm sweep', note: 'priced for corporate clients' },
            ]}
          />
          <p>
            BLE trackers work the same way: a cheap tag, every iPhone relaying for free, no authentication on the
            protocol. Defenses exist, but they're priced for corporate TSCM budgets. A renter can't afford that.
          </p>
        </>
      ),
    },
    {
      id: 'one-device',
      title: 'The Guard',
      body: (
        <>
          <p>
            ØCLOAK Guard is a single device on an <code>ESP32-C3</code>. BLE mode watches for AirTag, SmartTag, and Tile beacons,
            including the off-brand clones that skip anti-stalking rotation. WiFi mode watches for the <code>NDP</code> and{' '}
            <code>NDPA</code> sounding frames that start an 802.11bf session. Control-plane traffic, no payload encryption
            to hide behind.
          </p>
          <p>
            Target price: $20–25. First run ships turnkey boards through Seeed Fusion with 3D-printed enclosures;
            injection molding at a thousand units.
          </p>
          <p>
            The Guard <strong>never transmits</strong>. Passive detection is legal in the US and EU. Jamming is not; the Guard
            doesn't jam.
          </p>
        </>
      ),
    },
    {
      id: 'the-map',
      title: 'The map',
      body: (
        <>
          <p>
            One detector tells you about one room. The network turns many rooms into a map. Guards and manual reports
            feed sightings in; the map tags them by location, the way Waze turns drivers into traffic data.
          </p>
          <p>
            Reports carry no account. Each device mints a rotating pseudonymous key, and location rounds to a grid
            cell before leaving the device. A report lands in the right neighborhood but can't trace to an address.
            Hardware detections outweigh manual ones until other users confirm them.
          </p>
          <p>
            The first version is centralized: one API, one map. Decentralization is its own infrastructure project and
            waits until the traffic justifies community-run nodes.
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
            Venture money comes with a growth mandate and an exit, and both point at monetizing the data the product
            exists to protect. ØCLOAK runs on grants, crowdfunding, and donations.
          </p>
          <Figures
            items={[
              { value: '€5k–50k', label: 'nlnet ngi zero', note: 'deadline the 1st of every even month' },
              { value: '$50k–200k', label: 'open technology fund', note: 'USAGM funding' },
              { value: '58%', label: 'crowd supply success rate', note: 'kickstarter runs 30%' },
            ]}
          />
          <p>
            NLnet's NGI Zero is the first target: low paperwork, EU-based, small enough to apply without counsel.
            Hardware launches go through Crowd Supply, which has a 58% success rate and a 100% delivery record on funded campaigns.
          </p>
        </>
      ),
    },
    {
      id: 'dual-use',
      title: 'The dual-use question',
      body: (
        <>
          <p>
            The underlying skill is RF detection: channel-state analysis, SDR spectrum work, emitter fingerprinting,
            sensor fusion. Consumer privacy hardware is one application. Counter-drone detection is another; a drone
            is just an RF emitter with a control link and video downlink, and the detection work is the same.
          </p>
          <p>
            Defense work pays better but kills the open-source model through export control and secrecy. Dual-use
            founders usually get absorbed by the paying customer; the privacy side goes vestigial.
          </p>
          <p>
            The structure I'm testing: a detection engine trained on drone and emitter data I record myself, with two
            products over it. A networked defense system funds the research; a local-only consumer detector ships
            with zero telemetry. Drone detection needs drone data, so the consumer device never becomes a harvesting
            flywheel.
          </p>
          <p>
            If you work in this space, defense or privacy, I'd like to hear how you'd draw the line.
          </p>
        </>
      ),
    },
    {
      id: 'status',
      title: 'Status',
      body: (
        <>
          <p>
            Paper stage. The threat model, BOM, and network architecture are written. No hardware has shipped.
          </p>
          <p>
            Next: five <code>ESP32-C3</code> dev boards, BLE scanning that flags a real AirTag, WiFi monitor mode capturing
            real sounding frames, and the NLnet application before its next deadline. The hardware proves out before
            the grant filing; the grant lands before crowdfunding. Nothing ships until all three.
          </p>
        </>
      ),
    },
  ],
}

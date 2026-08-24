import type { ProjectContent } from './types'
import { Figures } from '../kit'

// The page renders these sections as one continuous column, no headings. Each
// entry is a reveal-on-scroll unit and an anchor; its title is internal only.
export const ocloak: ProjectContent = {
  lede: 'Your WiFi router can see you breathe through a wall. The standard shipped in 2025; consumer products followed three months later. ØCLOAK is an at-cost detector and a crowdsourced map of where the sensors are.',

  sections: [
    {
      id: 'through-a-wall',
      title: 'The through-wall sensor',
      body: (
        <>
          <p>
            <code>802.11bf</code>, the WiFi-sensing amendment, was ratified in September 2025. It reads{' '}
            <strong>motion, presence, and respiration</strong> through drywall, using the same signal your router{' '}
            <em>already</em> broadcasts. Vodafone's "Who's Home" shipped that December, and consumer products followed
            within three months of the standard landing.
          </p>
          <p>
            <strong>None of this is new physics.</strong> Every WiFi chip computes channel state information to decode
            traffic, a fine-grained read of how the signal bends on its way between antennas. Sensing keeps that read{' '}
            <em>instead of discarding it</em>. Enough of it, over time, resolves a body moving behind a wall, a chest
            rising and falling, a room that sits <em>empty</em> or holds <em>a dozen people</em>. Through-wall presence
            detection has run on a <strong>$9 ESP32</strong>.
          </p>
          <Figures
            items={[
              { value: '$9', label: 'esp32 board', note: 'runs through-wall presence detection' },
              { value: '$2,000', label: 'cheapest tscm sweep', note: 'priced for corporate clients' },
            ]}
          />
          <p>
            BLE trackers reach the same result from the other direction: a cheap tag, every nearby iPhone relaying its
            location for free, and <em>no authentication anywhere</em> in the protocol. Countermeasures exist for both,
            but they carry corporate TSCM price tags. A renter who wants to know whether their unit is being watched has{' '}
            <strong>nothing they can afford</strong>.
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
            ØCLOAK Guard answers that with a <strong>single device</strong> on an <code>ESP32-C3</code>. In BLE mode it
            watches for AirTag, SmartTag, and Tile beacons, including the off-brand clones that skip the anti-stalking
            key rotation Apple and Samsung added. In WiFi mode it watches for the <code>NDP</code> and <code>NDPA</code>{' '}
            sounding frames that open an 802.11bf session. Both ride in <em>control-plane traffic</em>, which carries no
            payload encryption to hide behind, so a passive listener flags a sensing session the moment it starts.
          </p>
          <p>
            The Guard <strong>never transmits</strong>. It listens, and it reports what it heard.{' '}
            <strong>Passive detection is legal</strong> in the US and the EU; active jamming is legal in <em>neither</em>,
            and the Guard does not jam. It tells you a sensor is in the room and leaves the next move to you: cover it,
            unplug it, walk away, or flood its read with noise.
          </p>
          <p>
            Target price is <strong>$20–25</strong>. The first run ships turnkey boards through Seeed Fusion with
            3D-printed enclosures; injection molding takes over at a thousand units.
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
            One Guard tells you about <strong>one room</strong>. The network turns many rooms into <strong>a map</strong>.
            Guards and manual reports feed sightings in, the map tags each by location, and a picture of where the
            sensors sit builds the way Waze builds traffic out of drivers.
          </p>
          <p>
            <strong>A report carries no account.</strong> Each device mints a rotating pseudonymous key, and the
            location rounds to a grid cell before it ever leaves the device, so a sighting lands in the right
            neighborhood and stops there. It traces back to <em>no</em> address, and to <em>no</em> person who filed it.
            A hardware detection from a Guard outweighs a manual report until other users confirm it, which keeps one
            bad actor from painting the map.
          </p>
          <p>
            The first version is <strong>centralized</strong>: one API, one map, because that is the version that can
            exist this year. Decentralization is its own infrastructure project, and it waits until the traffic
            justifies community-run nodes.
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
            Underneath both the Guard and the map is <strong>one skill: RF detection</strong>. Channel-state analysis,
            SDR spectrum work, emitter fingerprinting, sensor fusion. Consumer privacy hardware is one application of
            it. Counter-drone detection is another, and the work barely changes; a drone is an RF emitter with a control
            link and a video downlink, and finding it is <em>the same problem</em> as finding a sensing session.
          </p>
          <p>
            Defense work pays better, and it kills the open-source model through export control and secrecy. Dual-use
            founders usually get absorbed by the paying customer, and the privacy side goes <strong>vestigial</strong>.
          </p>
          <p>
            The structure I am testing keeps the two apart <em>on purpose</em>: one detection engine, trained on drone
            and emitter data I record myself, with two products over it. A networked defense system funds the research;
            a local-only consumer detector ships with <strong>zero telemetry</strong>. Drone detection needs drone data
            I gather directly, so the consumer device never has to become a harvesting flywheel to feed the model.
          </p>
          <p>
            If you work in this space, defense or privacy, I would like to hear how you would draw the line.
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
            Where it stands: <strong>paper</strong>. The threat model, the bill of materials, and the network
            architecture are written; <em>no hardware has shipped</em>. Next is five <code>ESP32-C3</code> dev boards,
            BLE scanning that flags a real AirTag, WiFi monitor mode capturing real sounding frames, and an NLnet grant
            application before its next deadline. The hardware proves out first, the grant follows, and nothing ships to
            anyone until both hold.
          </p>
        </>
      ),
    },
  ],
}

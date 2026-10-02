const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** What the scene is doing this frame, as the sound layer hears it. */
export type SoundState = {
  /** Etching progress per second; 0 when nothing is being cut. */
  drawRate: number
  /** Record spin in radians per second, either direction. */
  spin: number
  /** Scroll progress through the flight, 0..1. */
  scroll: number
  /** 0..1, how far the signal trace has faded in. */
  signal: number
}

/** Target gains (and the scratch filter frequency) for a frame. Pure so it can be tested. */
export function mix(s: SoundState) {
  const away = 1 - 0.85 * clamp01(s.scroll)
  const spin = Math.abs(s.spin)
  return {
    drone: 0.09 * away,
    // The etch runs at about 0.22 per second at full speed.
    etch: 0.22 * clamp01(s.drawRate / 0.25),
    hiss: 0.025 * clamp01(s.signal) * away,
    scratch: 0.3 * clamp01(spin / 6) * away,
    scratchHz: 300 + Math.min(spin, 14) * 140,
  }
}

/**
 * Every sound on the page, synthesised with Web Audio so there are no files to host.
 * Nothing exists until start(), which must run from a click so the browser allows audio.
 */
export class VoyagerSound {
  private ctx: AudioContext | null = null
  private master!: GainNode
  private gains!: Record<'drone' | 'etch' | 'hiss' | 'scratch', GainNode>
  private scratchFilter!: BiquadFilterNode

  get on() {
    return !!this.ctx
  }

  start() {
    if (this.ctx) return
    const ctx = new AudioContext()
    this.ctx = ctx
    this.master = ctx.createGain()
    this.master.gain.value = 0
    this.master.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 0.8)
    this.master.connect(ctx.destination)

    const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const data = noise.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const noiseSource = () => {
      const s = ctx.createBufferSource()
      s.buffer = noise
      s.loop = true
      s.start()
      return s
    }
    const gain = () => {
      const g = ctx.createGain()
      g.gain.value = 0
      g.connect(this.master)
      return g
    }
    this.gains = { drone: gain(), etch: gain(), hiss: gain(), scratch: gain() }

    // A low drone: two detuned tones, an octave and a fifth apart, through a lowpass.
    const low = ctx.createBiquadFilter()
    low.type = 'lowpass'
    low.frequency.value = 240
    low.connect(this.gains.drone)
    for (const [f, type] of [[55, 'sine'], [82.6, 'triangle'], [110.4, 'sine']] as const) {
      const o = ctx.createOscillator()
      o.type = type
      o.frequency.value = f
      o.connect(low)
      o.start()
    }

    // The stylus cutting gold: narrow, bright noise.
    const etch = ctx.createBiquadFilter()
    etch.type = 'bandpass'
    etch.frequency.value = 3200
    etch.Q.value = 5
    noiseSource().connect(etch).connect(this.gains.etch)

    // Carrier static under the signal trace.
    const hiss = ctx.createBiquadFilter()
    hiss.type = 'highpass'
    hiss.frequency.value = 5200
    noiseSource().connect(hiss).connect(this.gains.hiss)

    // Record scratch, pitched by how fast the record spins.
    this.scratchFilter = ctx.createBiquadFilter()
    this.scratchFilter.type = 'bandpass'
    this.scratchFilter.Q.value = 6
    noiseSource().connect(this.scratchFilter).connect(this.gains.scratch)
  }

  stop() {
    const ctx = this.ctx
    if (!ctx) return
    this.ctx = null
    // Decoded clips belong to this context; a later start() makes a new one.
    this.clips.clear()
    this.speaking = false
    this.master.gain.setTargetAtTime(0, ctx.currentTime, 0.08)
    window.setTimeout(() => void ctx.close(), 400)
  }

  update(s: SoundState) {
    const ctx = this.ctx
    if (!ctx) return
    const m = mix(s)
    const at = ctx.currentTime
    for (const k of ['drone', 'etch', 'hiss', 'scratch'] as const) this.gains[k].gain.setTargetAtTime(m[k], at, 0.08)
    this.scratchFilter.frequency.setTargetAtTime(m.scratchHz, at, 0.05)
  }

  /** A rising chirp as the scan starts painting the greeting. */
  chirp() {
    const ctx = this.ctx
    if (!ctx) return
    const t = ctx.currentTime
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'square'
    o.frequency.setValueAtTime(380, t)
    o.frequency.exponentialRampToValueAtTime(2600, t + 0.4)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.05, t + 0.03)
    g.gain.exponentialRampToValueAtTime(0.0005, t + 0.5)
    o.connect(g).connect(this.master)
    o.start(t)
    o.stop(t + 0.55)
  }

  private clips = new Map<string, Promise<AudioBuffer>>()
  private speaking = false

  /**
   * Plays one of the record's real spoken greetings, band-limited like a radio
   * transmission. Skipped while another is still speaking so pings cannot pile them up.
   */
  greet(src: string) {
    const ctx = this.ctx
    if (!ctx || this.speaking) return
    this.speaking = true
    let clip = this.clips.get(src)
    if (!clip) {
      clip = fetch(src)
        .then((r) => r.arrayBuffer())
        .then((b) => ctx.decodeAudioData(b))
      this.clips.set(src, clip)
    }
    clip
      .then((buf) => {
        if (this.ctx !== ctx) return (this.speaking = false)
        const s = ctx.createBufferSource()
        s.buffer = buf
        const lo = ctx.createBiquadFilter()
        lo.type = 'highpass'
        lo.frequency.value = 320
        const hi = ctx.createBiquadFilter()
        hi.type = 'lowpass'
        hi.frequency.value = 3400
        const g = ctx.createGain()
        g.gain.value = 0.9
        s.connect(lo).connect(hi).connect(g).connect(this.master)
        s.onended = () => (this.speaking = false)
        s.start()
      })
      .catch(() => {
        this.clips.delete(src)
        this.speaking = false
      })
  }

  /** A sonar ping with a fading echo, for each ring sent out. */
  ping() {
    const ctx = this.ctx
    if (!ctx) return
    const t = ctx.currentTime
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    const echo = ctx.createDelay()
    const feedback = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(1320, t)
    o.frequency.exponentialRampToValueAtTime(880, t + 1.2)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.2, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0005, t + 1.6)
    echo.delayTime.value = 0.32
    feedback.gain.value = 0.35
    o.connect(g)
    g.connect(this.master)
    g.connect(echo).connect(feedback).connect(echo)
    feedback.connect(this.master)
    o.start(t)
    o.stop(t + 1.7)
  }
}

import { clipUrl } from './stage-data'

type Ctx = Pick<AudioContext, 'resume' | 'close' | 'decodeAudioData' | 'createBufferSource' | 'destination'>
type Playing = { key: object; node: AudioBufferSourceNode; onEnd: () => void }

export function createClips(
  load: (url: string) => Promise<Response> = (url) => fetch(url),
  makeContext: () => Ctx = () => new AudioContext(),
) {
  let ctx: Ctx | null = null
  let current: Playing | null = null
  let seq = 0
  const cache = new Map<string, Promise<AudioBuffer>>()

  const api = {
    // Safari unlocks audio only inside the gesture, so this runs at the top of a tap, before any await.
    unlock() {
      ctx ??= makeContext()
      ctx.resume().catch(() => {})
      return ctx
    },
    buffer(src: string) {
      let p = cache.get(src)
      if (!p) {
        const c = ctx ?? api.unlock()
        const mine: Promise<AudioBuffer> = load(clipUrl(src))
          .then((r) => {
            if (!r.ok) throw new Error(`${src}: ${r.status}`)
            return r.arrayBuffer()
          })
          .then((b) => c.decodeAudioData(b))
        p = mine
        cache.set(src, mine)
        // A failed load is dropped so the next tap fetches again; the identity check keeps a stale
        // rejection that outlives close() from deleting a newer entry.
        mine.catch(() => cache.get(src) === mine && cache.delete(src))
      }
      return p
    },
    // One clip at a time across the page. A tap on the playing key stops it; a tap that loses the
    // race to a later tap while its clip loads never starts.
    async play(key: object, src: string, onStart: () => void, onEnd: () => void) {
      const c = api.unlock()
      const again = current?.key === key
      api.stop()
      if (again) return
      const mine = ++seq
      let buf: AudioBuffer
      try {
        buf = await api.buffer(src)
      } catch {
        return
      }
      if (mine !== seq) return
      const node = c.createBufferSource()
      node.buffer = buf
      node.connect(c.destination)
      node.start()
      const me: Playing = { key, node, onEnd }
      current = me
      node.onended = () => current === me && api.stop()
      onStart()
    },
    stop() {
      const me = current
      current = null
      if (!me) return
      me.node.onended = null
      try {
        me.node.stop()
      } catch {
        // already ended
      }
      me.onEnd()
    },
    close() {
      seq++
      api.stop()
      ctx?.close().catch(() => {})
      ctx = null
      cache.clear()
    },
  }
  return api
}

export const clips = createClips()

import { describe, expect, it, vi } from 'vitest'
import { createClips } from './clips'

function fakeContext() {
  const started: string[] = []
  const ctx = {
    resume: vi.fn(async () => {}),
    close: vi.fn(async () => {}),
    decodeAudioData: vi.fn(async (b: ArrayBuffer) => ({ length: b.byteLength }) as unknown as AudioBuffer),
    destination: {} as AudioDestinationNode,
    createBufferSource: vi.fn(() => {
      const node = {
        buffer: null as AudioBuffer | null,
        onended: null as (() => void) | null,
        connect: vi.fn(),
        start: vi.fn(() => started.push(String((node.buffer as unknown as { length: number }).length))),
        stop: vi.fn(),
      }
      return node as unknown as AudioBufferSourceNode
    }),
  }
  return { ctx, started }
}

const ok = (bytes: number) => Promise.resolve(new Response(new ArrayBuffer(bytes)))

describe('clips', () => {
  it('fetches a clip again after a failed load', async () => {
    const { ctx } = fakeContext()
    const load = vi.fn().mockRejectedValueOnce(new Error('offline')).mockImplementation(() => ok(8))
    const c = createClips(load, () => ctx)
    c.unlock()
    await expect(c.buffer('i.mp3')).rejects.toThrow('offline')
    await expect(c.buffer('i.mp3')).resolves.toBeDefined()
    expect(load).toHaveBeenCalledTimes(2)
    expect(load).toHaveBeenCalledWith('/assets/blog/didnt-say/i.mp3')
  })

  it('treats an HTTP error as a failed load', async () => {
    const { ctx } = fakeContext()
    const load = vi.fn().mockResolvedValueOnce(new Response(null, { status: 404 })).mockImplementation(() => ok(8))
    const c = createClips(load, () => ctx)
    c.unlock()
    await expect(c.buffer('i.mp3')).rejects.toThrow('404')
    await expect(c.buffer('i.mp3')).resolves.toBeDefined()
  })

  it('plays only the later of two taps when the first clip is still loading', async () => {
    const { ctx, started } = fakeContext()
    let release!: () => void
    const slow = new Promise<Response>((done) => (release = () => done(new Response(new ArrayBuffer(1)))))
    const load = vi.fn((url: string) => (url.endsWith('i.mp3') ? slow : ok(2)))
    const c = createClips(load, () => ctx)
    const a = {}, b = {}
    const first = c.play(a, 'i.mp3', vi.fn(), vi.fn())
    const second = c.play(b, 'say.mp3', vi.fn(), vi.fn())
    await second
    release()
    await first
    expect(started).toEqual(['2'])
  })

  it('stops the playing clip when the same key taps again, and calls its onEnd', async () => {
    const { ctx } = fakeContext()
    const c = createClips(() => ok(4), () => ctx)
    const key = {}, onEnd = vi.fn()
    await c.play(key, 'i.mp3', vi.fn(), onEnd)
    await c.play(key, 'i.mp3', vi.fn(), vi.fn())
    expect(onEnd).toHaveBeenCalledOnce()
    expect(ctx.createBufferSource).toHaveBeenCalledOnce()
  })
})

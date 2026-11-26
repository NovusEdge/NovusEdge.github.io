import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { createTimeline } from 'animejs'
import { prefersReducedMotion } from '../../lib/motion'
import { FigPause, Swap } from './kit'
import './jump-footage.css'

const DIR = '/assets/blog/spatial/fun'

// celeste-ledge.webm/.mp4 is 1.2 s of Celeste's launch trailer (youtu.be/FqBj2IGg6Uw, 0:24.33 to
// 0:25.50), cropped and slowed to half speed, with the first frame that shows jump dust repeated
// for 3 s. The camera does not move in it, so the marks stay where they are put.
// Times are seconds of the clip; positions are px in its 960 × 540 frame, read off the held frame.
const HOLD = 1.4
const GROW = [1.9, 3.1]
// The trailer is 1080p, 6 px per game px, and the crop is scaled by 1.5.
const GAME_PX = 9
const PLANK = { end: 455, top: 463, feet: 408 }
const ALT = 'Madeline, a small red-haired figure, in mid-jump just above the right-hand end of a thin wooden plank, with a puff of white dust where she left it.'

const pct = (x: number, y: number, w?: number, h?: number): CSSProperties => ({
  left: `${x / 9.6}%`,
  top: `${y / 5.4}%`,
  width: w === undefined ? undefined : `${w / 9.6}%`,
  height: h === undefined ? undefined : `${h / 5.4}%`,
})

// The resting state of every mark is its finished state, which is what the still shows.
function Marks({ on, grace, reach }: { on: boolean; grace: number; reach: number }) {
  return (
    <div className="jf-scene" data-on={on ? '' : undefined} aria-hidden="true">
      <i className="jf-rule" style={pct(PLANK.end, 240, undefined, 250)} />
      <span className="jf-label jf-label--mid" style={pct(PLANK.end, 212)}>
        plank ends
      </span>
      <i className="jf-window" style={pct(PLANK.end, PLANK.top - 5, reach * GAME_PX, 14)} />
      <span className="jf-label" style={pct(PLANK.end + reach * GAME_PX + 12, PLANK.top + 2)}>
        <b className="jf-timer">+{grace.toFixed(2)} s</b>
      </span>
      <i className="jf-dot" style={pct(PLANK.feet, PLANK.top)} />
      <span className="jf-label jf-label--left" style={pct(PLANK.feet - 50, PLANK.top - 8)}>
        jump starts
      </span>
    </div>
  )
}

// `grace` is JumpGraceTime in seconds and `run` is MaxRun in game px per second.
export function JumpFootage({ grace, run, onLoop }: { grace: number; run: number; onLoop: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const ref = useRef<HTMLVideoElement>(null)
  const [still, setStill] = useState(false)
  const [step, setStep] = useState(0)
  const reach = grace * run
  const steps = ['Madeline runs along a plank, at half speed', `she jumps near its end; a jump would still count ${grace} s past the end, which is ${reach} px at a run`]

  useEffect(() => {
    if (prefersReducedMotion()) return setStill(true)
    const video = ref.current!
    const fig = video.closest('.sp-fig')!
    const timer = root.current!.querySelector('.jf-timer')!

    // The overlay has no clock of its own: every frame the video shows seeks this to the same time.
    // The tween starts at 0 with a keyframe that waits, so a seek to any time, the loop back to the
    // start included, lands inside it. A tween that starts later leaves its mark untouched until then.
    const motion = createTimeline({ autoplay: false, defaults: { ease: 'linear' } }).add(
      root.current!.querySelector('.jf-window')!,
      {
        scaleX: [
          { from: 0, to: 0, duration: GROW[0] * 1000 },
          { to: 1, duration: (GROW[1] - GROW[0]) * 1000 },
        ],
      },
      0,
    )
    let last = 0
    const show = (t: number) => {
      if (t < last) onLoop()
      last = t
      setStep(t >= HOLD ? 1 : 0)
      motion.seek(t * 1000)
      const grown = Math.min(1, Math.max(0, (t - GROW[0]) / (GROW[1] - GROW[0])))
      timer.textContent = `+${(grace * grown).toFixed(2)} s`
    }
    show(0)

    // requestVideoFrameCallback runs once per frame the video presents, seeks while paused included.
    // Without it the loop runs on every animation frame for as long as the figure is mounted.
    let handle = 0
    const perFrame = 'requestVideoFrameCallback' in video
    const tick = (_now: number, frame?: VideoFrameCallbackMetadata) => {
      show(frame?.mediaTime ?? video.currentTime)
      handle = perFrame ? video.requestVideoFrameCallback(tick) : requestAnimationFrame(tick)
    }
    handle = perFrame ? video.requestVideoFrameCallback(tick) : requestAnimationFrame(tick)

    // Its own observer as well as data-paused: Fig sets that attribute an effect later than this
    // one runs, and a play() in that gap would start the download at page load.
    let seen = false
    const sync = () => {
      // The rejections are the browser blocking autoplay, which leaves the poster up, and our own pause() landing mid-load.
      if (seen && !fig.hasAttribute('data-paused')) video.play().catch(() => {})
      else video.pause()
    }
    const onScreen = new IntersectionObserver(([entry]) => {
      seen = entry.isIntersecting
      sync()
    })
    onScreen.observe(video)
    const onPause = new MutationObserver(sync)
    onPause.observe(fig, { attributes: true, attributeFilter: ['data-paused'] })
    return () => {
      if (perFrame) video.cancelVideoFrameCallback(handle)
      else cancelAnimationFrame(handle)
      motion.revert()
      onScreen.disconnect()
      onPause.disconnect()
    }
    // onLoop is a state setter in the one caller.
  }, [grace, onLoop])

  return (
    <div ref={root}>
      <div className="jf sp-media">
        {still ? (
          <img src={`${DIR}/celeste-ledge.webp`} alt={ALT} width="960" height="540" loading="lazy" />
        ) : (
          <video ref={ref} muted playsInline loop preload="none" poster={`${DIR}/celeste-ledge.webp`} width="960" height="540" aria-label={`A short clip at half speed that pauses on one frame: ${ALT}`}>
            <source src={`${DIR}/celeste-ledge.webm`} type="video/webm" />
            <source src={`${DIR}/celeste-ledge.mp4`} type="video/mp4" />
          </video>
        )}
        {/* The camera is still, so once the marks are up they stay up while she finishes the jump. */}
        <Marks on={still || step === 1} grace={grace} reach={reach} />
        <FigPause />
      </div>
      <p className="sp-beat jf-beat">{still ? steps[1] : <Swap show={step} options={steps} />}</p>
    </div>
  )
}

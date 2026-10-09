import { useLayoutEffect, useRef, useState } from 'react'
import { useLang } from '../i18n'
import { gsap, prefersReducedMotion } from '../motion'

/** Real readiness: web fonts + every image/asset of the first paint (window load). */
function whenPageLoads() {
  const fonts = document.fonts?.ready ?? Promise.resolve()
  const load = document.readyState === 'complete' ? Promise.resolve() : new Promise<void>((r) => window.addEventListener('load', () => r(), { once: true }))
  return [fonts, load] as Promise<unknown>[]
}

const MIN_MS = 1500 // long enough to read the pipeline, short enough not to annoy
const MAX_MS = 5000 // never hold the page hostage on a slow image

/**
 * Intro as a CI run, the three roles as stages: build software → run quality checks → automate the deploy.
 * Progress follows real loading (fonts + window load), the E/ ring fills with it, and on success the
 * monogram flies into the header logo's exact spot while the panel lifts away.
 */
export function Preloader({ onDone }: { onDone: () => void }) {
  const { t } = useLang()
  const steps = t.ui.preloaderSteps
  const [gone, setGone] = useState(false)
  const [stage, setStage] = useState(0) // index of the running step; steps.length = all passed
  const root = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const mark = useRef<HTMLDivElement>(null)
  const ring = useRef<SVGCircleElement>(null)
  const slash = useRef<SVGPathElement>(null)
  const pct = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const done = useRef(onDone)
  done.current = onDone

  useLayoutEffect(() => {
    const html = document.documentElement
    if (prefersReducedMotion()) {
      html.dataset.logoLanded = 'true'
      done.current()
      setGone(true)
      return
    }

    const RING = 2 * Math.PI * 21.25
    const p = { v: 0 } // displayed progress 0..1
    let target = 0
    let finished = false
    const started = performance.now()

    const render = () => {
      ring.current!.style.strokeDashoffset = String(RING * (1 - p.v))
      bar.current!.style.transform = `scaleX(${p.v})`
      pct.current!.textContent = `${String(Math.round(p.v * 100)).padStart(3, '0')}%`
      setStage(Math.min(steps.length, Math.floor(p.v * steps.length + 0.0001)))
    }

    let tick = () => {}
    const ctx = gsap.context(() => {
      gsap.set(ring.current, { strokeDasharray: RING, strokeDashoffset: RING })
      gsap.set(slash.current, { scaleY: 0, transformOrigin: '50% 100%' })
      gsap.from('.boot__mark-e, .boot__log, .boot__meter', { autoAlpha: 0, y: 12, duration: 0.7, stagger: 0.06, ease: 'power3.out' })

      // Each finished task moves the target; until then progress creeps so it never looks frozen.
      const tasks = whenPageLoads()
      let settled = 0
      tasks.forEach((task) => task.then(() => (target = Math.max(target, (++settled / tasks.length) * 0.9))))
      Promise.all(tasks).then(() => (finished = true))

      tick = () => {
        const elapsed = performance.now() - started
        const ready = (finished && elapsed > MIN_MS) || elapsed > MAX_MS
        const creep = Math.min(0.85, elapsed / (MIN_MS * 1.6)) // time-based floor while waiting
        const goal = ready ? 1 : Math.min(0.97, Math.max(target, creep))
        p.v += (goal - p.v) * (ready ? 0.14 : 0.06)
        if (ready && 1 - p.v < 0.004) p.v = 1
        render()
        if (p.v === 1) {
          gsap.ticker.remove(tick)
          exit()
        }
      }
      gsap.ticker.add(tick)

      const exit = () => {
        gsap
          .timeline()
          .to(slash.current, { scaleY: 1, duration: 0.45, ease: 'expo.out' })
          .to('.boot__log, .boot__meter', { autoAlpha: 0, y: -8, duration: 0.35, ease: 'power2.in' }, '+=0.15')
          .add(() => {
            html.dataset.logoLanded = 'true'
            done.current()
            // Unlocking the page brings the scrollbar back and shifts the header; measure on the next frame.
            requestAnimationFrame(() => requestAnimationFrame(land))
          })
      }

      const land = () => {
        const logo = document.querySelector<SVGElement>('.header .logo')
        const from = mark.current!.getBoundingClientRect()
        const tl = gsap.timeline({ onComplete: () => setGone(true) })
        tl.to(panel.current, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'power4.inOut' })
        const first = logo?.getBoundingClientRect()
        if (logo && first && first.width > 0 && first.bottom > 0) {
          // FLIP onto the header logo (same artwork). The target is re-read every frame, so the mark still
          // lands exactly even if the header settles (scrollbar, fonts) mid-flight.
          const fly = { t: 0 }
          tl.to(
            fly,
            {
              t: 1,
              duration: 1,
              ease: 'expo.inOut',
              onUpdate: () => {
                const to = logo.getBoundingClientRect()
                const x = (to.left + to.width / 2 - (from.left + from.width / 2)) * fly.t
                const y = (to.top + to.height / 2 - (from.top + from.height / 2)) * fly.t
                const k = 1 + (to.width / from.width - 1) * fly.t
                mark.current!.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${k})`
              },
            },
            0,
          ).to(mark.current, { autoAlpha: 0, duration: 0.15 })
        } else {
          tl.to(mark.current, { autoAlpha: 0, scale: 0.8, duration: 0.5 }, 0)
        }
      }
    }, root)

    return () => {
      gsap.ticker.remove(tick)
      ctx.revert()
    }
    // Steps only change with language; the run itself happens once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (gone) return null

  return (
    <div className="boot" ref={root} role="status" aria-label={t.ui.loading}>
      <div className="boot__panel" ref={panel} />

      <div className="boot__center">
        <div className="boot__mark" ref={mark} aria-hidden="true">
          <svg viewBox="0 0 44 44">
            <defs>
              <linearGradient id="boot-iri" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#7ef0ff" />
                <stop offset="50%" stopColor="#c86cff" />
                <stop offset="100%" stopColor="#ff7ac8" />
              </linearGradient>
            </defs>
            <circle className="boot__track" cx="22" cy="22" r="21.25" />
            <circle ref={ring} className="boot__ring" cx="22" cy="22" r="21.25" transform="rotate(-90 22 22)" />
            <path className="boot__mark-e" d="M11 12h12v4h-8v4h7v4h-7v4h8v4H11z" />
            <path ref={slash} d="M25.5 32l6-20h4l-6 20z" fill="url(#boot-iri)" />
          </svg>
        </div>

        <ol className="boot__log">
          {steps.map((step, i) => {
            const state = i < stage ? 'is-done' : i === stage ? 'is-running' : ''
            return (
              <li key={step} className={state}>
                <span className="boot__status" aria-hidden="true">
                  {i < stage ? '✓' : ''}
                </span>
                {step}
              </li>
            )
          })}
        </ol>

        <div className="boot__meter">
          <span className="boot__bar">
            <span ref={bar} />
          </span>
          <span className="boot__pct" ref={pct}>
            000%
          </span>
        </div>
      </div>
    </div>
  )
}

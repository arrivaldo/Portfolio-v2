import { useLayoutEffect, useRef, useState } from 'react'
import { useLang } from '../i18n'
import { gsap, prefersReducedMotion } from '../motion'
import { GlassShape } from './GlassShape'

/** Real readiness: web fonts + every image/asset of the first paint (window load). */
function whenPageLoads() {
  const fonts = document.fonts?.ready ?? Promise.resolve()
  const load = document.readyState === 'complete' ? Promise.resolve() : new Promise<void>((r) => window.addEventListener('load', () => r(), { once: true }))
  return [fonts, load] as Promise<unknown>[]
}

const MIN_MS = 2600 // long enough for the shapes to make most of a lap
const MAX_MS = 6000 // never hold the page hostage on a slow image

/** The same iridescent glass pieces as the article covers (GlassShape has 5 variants) orbit the word. */
const SHAPES = [0, 1, 2, 3, 4]

/**
 * Intro (orbit, chosen 2026-10-12 over split / fill / slot / cards / blur / stack / iris / wave): "Engineer" with the
 * full name beneath it and "(Loading) 0%" in the corners, while the glass shapes orbit the word in 3D — passing in
 * front of and behind it. When ready they spiral into it, the name drops away and the word flies onto the hero's
 * "Engineer" while the panel fades around it.
 */
export function Preloader({ onDone }: { onDone: () => void }) {
  const { t } = useLang()
  const [gone, setGone] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const pct = useRef<HTMLSpanElement>(null)
  const done = useRef(onDone)
  done.current = onDone
  const word = t.profile.role[1]
  const name = t.profile.fullName

  useLayoutEffect(() => {
    if (prefersReducedMotion()) {
      done.current()
      setGone(true)
      return
    }

    // The hero's "Engineer" stays hidden until the preloader word lands on it.
    const landing = document.querySelector<HTMLElement>('[data-intro-target]')
    if (landing) landing.style.visibility = 'hidden'

    let tick = () => {}
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root)
      const el = q('.mono__word')[0] as HTMLElement
      const bg = q('.mono__bg')[0] as HTMLElement
      const shapes = q('.orbit__shape') as HTMLElement[]
      const st = { a: 0, r: 1 }
      // Ellipse around the word; the near half (sin > 0) passes in front of it, the far half behind and smaller.
      const place = () => {
        const rx = el.offsetWidth * 0.62
        const ry = el.offsetHeight * 0.55
        shapes.forEach((s, k) => {
          const a = st.a + (k / shapes.length) * Math.PI * 2
          const z = Math.sin(a)
          gsap.set(s, { x: Math.cos(a) * rx * st.r, y: z * ry * st.r, scale: (0.75 + 0.25 * z) * (0.3 + 0.7 * st.r), zIndex: z > 0 ? 2 : 0 })
        })
      }
      const spin = gsap.to(st, { a: Math.PI * 2, duration: 7, ease: 'none', repeat: -1, onUpdate: place })
      place()

      // Entrance: the word fades in while the shapes close in from a wide orbit.
      gsap
        .timeline()
        .from(el, { autoAlpha: 0, duration: 0.8, ease: 'power2.out' })
        .from(st, { r: 2.2, duration: 1.6, ease: 'expo.out', onUpdate: place }, 0.2)
        .from(shapes, { autoAlpha: 0, duration: 0.6, stagger: 0.06 }, 0.2)
        .from('.mono__name i', { yPercent: 110, duration: 0.9, stagger: 0.025, ease: 'expo.out' }, 0.45)
        .from('.mono__corner > span', { yPercent: 110, duration: 0.8, stagger: 0.06, ease: 'expo.out' }, 0.2)

      // Progress: each finished task moves the target; until then it creeps so it never looks frozen.
      const p = { v: 0 }
      let target = 0
      let finished = false
      const started = performance.now()
      const tasks = whenPageLoads()
      let settled = 0
      tasks.forEach((task) => task.then(() => (target = Math.max(target, (++settled / tasks.length) * 0.9))))
      Promise.all(tasks).then(() => (finished = true))

      tick = () => {
        const elapsed = performance.now() - started
        const ready = (finished && elapsed > MIN_MS) || elapsed > MAX_MS
        const creep = Math.min(0.85, elapsed / (MIN_MS * 1.3))
        const goal = ready ? 1 : Math.min(0.97, Math.max(target, creep))
        p.v += (goal - p.v) * (ready ? 0.12 : 0.05)
        if (ready && 1 - p.v < 0.004) p.v = 1
        pct.current!.textContent = `${Math.round(p.v * 100)}%`
        if (p.v === 1) {
          gsap.ticker.remove(tick)
          exit()
        }
      }
      gsap.ticker.add(tick)

      // Exit: the orbit speeds up and spirals into the word, then the word flies to the hero.
      const exit = () => {
        gsap
          .timeline()
          .to(spin, { timeScale: 5, duration: 0.6, ease: 'power2.in' }, 0)
          .to(st, { r: 0, duration: 0.7, ease: 'power3.in', onUpdate: place }, 0)
          .to(shapes, { autoAlpha: 0, duration: 0.25 }, 0.5)
          .add(() => spin.kill())
          .to('.mono__corner > span', { yPercent: -110, duration: 0.5, stagger: 0.04, ease: 'power3.in' }, 0.1)
          .to('.mono__name i', { yPercent: -110, duration: 0.45, stagger: 0.012, ease: 'power3.in' }, 0.1)
          .add(fly, 0.75)
      }

      // The plain word flies onto the hero's "Engineer" (same family and weight) while the panel fades around it.
      const fly = () => {
        const target = document.querySelector<HTMLElement>('[data-intro-target]')
        if (!target) {
          done.current()
          gsap.to(root.current, { autoAlpha: 0, duration: 0.6, onComplete: () => setGone(true) })
          return
        }
        const from = el.getBoundingClientRect()
        const to = target.getBoundingClientRect()
        const cs = getComputedStyle(target)
        gsap.set(el, { position: 'fixed', left: from.left, top: from.top, margin: 0, color: 'var(--text)' })
        gsap
          .timeline({
            onComplete: () => {
              target.style.visibility = ''
              setGone(true)
            },
          })
          .to(el, {
            left: to.left,
            top: to.top,
            fontSize: cs.fontSize,
            fontWeight: cs.fontWeight,
            letterSpacing: cs.letterSpacing === 'normal' ? 0 : cs.letterSpacing,
            lineHeight: cs.lineHeight,
            duration: 1.3,
            ease: 'expo.inOut',
          })
          .to(bg, { autoAlpha: 0, duration: 0.9, ease: 'power2.inOut' }, 0.35)
          .add(() => done.current(), 0.6)
      }
    }, root)

    return () => {
      gsap.ticker.remove(tick)
      ctx.revert()
      if (landing) landing.style.visibility = ''
    }
    // The intro runs once; copy only seeds it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (gone) return null

  return (
    <div className="mono" ref={root} role="status" aria-label={t.ui.loading}>
      <div className="mono__bg" aria-hidden="true" />
      <div className="mono__stage">
        <div className="orbit" aria-hidden="true">
          {SHAPES.map((v) => (
            <span key={v} className="orbit__shape">
              <GlassShape variant={v} />
            </span>
          ))}
        </div>
        <div className="mono__word" aria-hidden="true">
          {word}
        </div>
        <div className="mono__name" aria-hidden="true">
          {[...name].map((c, k) => (
            <i key={k}>{c === ' ' ? ' ' : c}</i>
          ))}
        </div>
      </div>

      <div className="mono__corner mono__corner--left" aria-hidden="true">
        <span>({t.ui.loading})</span>
      </div>
      <div className="mono__corner mono__corner--right" aria-hidden="true">
        <span ref={pct}>0%</span>
      </div>
    </div>
  )
}

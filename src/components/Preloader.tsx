import { useLayoutEffect, useRef, useState } from 'react'
import { useLang } from '../i18n'
import { gsap, prefersReducedMotion } from '../motion'

/** Real readiness: web fonts + every image/asset of the first paint (window load). */
function whenPageLoads() {
  const fonts = document.fonts?.ready ?? Promise.resolve()
  const load = document.readyState === 'complete' ? Promise.resolve() : new Promise<void>((r) => window.addEventListener('load', () => r(), { once: true }))
  return [fonts, load] as Promise<unknown>[]
}

const MIN_MS = 2600 // long enough for the drawing to read
const MAX_MS = 6000 // never hold the page hostage on a slow image

/**
 * Intro (blueprint, chosen 2026-10-17 over caret / slice / spotlight / assemble / orbit / roles / echo / magnet /
 * sundial / tag; before that also split / fill / slot / cards / blur / stack / iris / wave): "Engineer" drawn like a
 * technical drawing — faint grid, guides, dimension lines that measure the word and crop marks — with the full name
 * beneath it and "(Loading) 0%" in the corners. The drawing fills with real progress; when ready it fades, the name
 * drops away and the word flies onto the hero's "Engineer" while the panel fades around it.
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
      const q = gsap.utils.selector(root) as (s: string) => HTMLElement[]
      const el = q('.mono__word')[0]
      const box = q('.mono__box')[0]
      const bg = q('.mono__bg')[0]

      // The dimension lines quote the word's real size.
      q('.bp__dim--w b')[0].textContent = `${Math.round(el.offsetWidth)} px`
      q('.bp__dim--h b')[0].textContent = `${Math.round(el.offsetHeight)} px`

      // Entrance: the word fades in, crop marks snap on, then the name and the corners rise.
      gsap
        .timeline()
        .from(box, { autoAlpha: 0, duration: 0.8, ease: 'power2.out' })
        .from('.bp__mark', { autoAlpha: 0, scale: 1.6, duration: 0.8, stagger: 0.06, ease: 'expo.out' }, 0.3)
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
        // Capped by elapsed time too, so the drawing plays out over at least MIN_MS even when everything is cached.
        const goal = ready ? 1 : Math.min(0.97, Math.max(target, creep), elapsed / MIN_MS)
        p.v += (goal - p.v) * (ready ? 0.12 : 0.05)
        if (ready && 1 - p.v < 0.004) p.v = 1
        pct.current!.textContent = `${Math.round(p.v * 100)}%`
        root.current!.style.setProperty('--p', `${p.v}`)
        if (p.v === 1) {
          gsap.ticker.remove(tick)
          exit()
        }
      }
      gsap.ticker.add(tick)

      // Exit: the drawing fades, name and corners drop out, then the word flies to the hero.
      const exit = () => {
        gsap
          .timeline()
          .to('.bp', { autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, 0.15)
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
      <div className="bp bp__grid" aria-hidden="true" />
      <div className="mono__stage">
        <div className="mono__box" aria-hidden="true">
          <div className="mono__word">{word}</div>
          <span className="bp bp__guide bp__guide--top" />
          <span className="bp bp__guide bp__guide--base" />
          <span className="bp bp__dim bp__dim--w">
            <b />
          </span>
          <span className="bp bp__dim bp__dim--h">
            <b />
          </span>
          {['tl', 'tr', 'bl', 'br'].map((c) => (
            <span key={c} className={`bp bp__mark bp__mark--${c}`} />
          ))}
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

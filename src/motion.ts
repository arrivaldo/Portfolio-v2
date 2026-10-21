import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { type RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { blockIn, charsIn, mediaIn, rowsIn } from './anim'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches
export const hasFinePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches

let lenis: Lenis | null = null

/**
 * Scroll reveals wait for the intro: anything already on screen at load would otherwise play under the
 * preloader. Queued reveals start a beat after the hero entrance begins.
 */
let introDone = false
const afterIntro: (() => void)[] = []
export function onIntro(fn: () => void) {
  if (introDone) fn()
  else afterIntro.push(fn)
}
function markIntro() {
  if (introDone) return
  introDone = true
  afterIntro.splice(0).forEach((fn, i) => gsap.delayedCall(0.5 + i * 0.08, fn))
}

/** Play a paused timeline once its trigger scrolls into view (and the intro is over). */
export function revealOnScroll(trigger: Element, tl: gsap.core.Timeline | gsap.core.Tween, start = 'top 88%') {
  tl.pause()
  return ScrollTrigger.create({ trigger, start, once: true, onEnter: () => onIntro(() => tl.play()) })
}

export function scrollToTarget(target: string | number) {
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.4 })
    return
  }
  if (typeof target === 'number') window.scrollTo({ top: target })
  else document.querySelector(target)?.scrollIntoView()
}

/** Freeze page scroll while a modal is open, and let it go again. */
export function pauseScroll() {
  lenis?.stop()
  document.documentElement.style.overflow = 'hidden'
}
export function resumeScroll() {
  document.documentElement.style.overflow = ''
  lenis?.start()
}

/**
 * Whether the page is scrolling right now (true from the first scroll event until ~150 ms after the last).
 * The 3D scenes skip their frames meanwhile, so the scroll gets the whole frame budget.
 */
let lastScroll = -Infinity
const scrollWatchers = new Set<(scrolling: boolean) => void>()
let settleTimer = 0
if (typeof window !== 'undefined')
  window.addEventListener(
    'scroll',
    () => {
      if (performance.now() - lastScroll > 150) scrollWatchers.forEach((fn) => fn(true))
      lastScroll = performance.now()
      clearTimeout(settleTimer)
      settleTimer = window.setTimeout(() => scrollWatchers.forEach((fn) => fn(false)), 150)
    },
    { passive: true },
  )
export const isScrolling = () => performance.now() - lastScroll < 150
export function useScrolling() {
  const [scrolling, setScrolling] = useState(false)
  useEffect(() => {
    scrollWatchers.add(setScrolling)
    return () => void scrollWatchers.delete(setScrolling)
  }, [])
  return scrolling
}

/** Resolves in the browser's next idle moment (or after `timeout` ms at the latest). */
export const idle = (timeout = 1500) =>
  new Promise<void>((resolve) => ('requestIdleCallback' in window ? requestIdleCallback(() => resolve(), { timeout }) : setTimeout(resolve, 200)))

/**
 * Idle *and* not scrolling: mounting a scene is one long task (the globe builds its hex grid), so it waits for the
 * visitor to pause rather than land in the middle of a scroll.
 */
export async function quiet() {
  for (;;) {
    await idle()
    if (!isScrolling()) return
    await new Promise((r) => setTimeout(r, 120))
  }
}

/** Lenis smooth scroll driven by GSAP's ticker, plus in-page anchor handling. */
export function useSmoothScroll(ready: boolean) {
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)

    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]')
      if (!link) return
      const hash = link.getAttribute('href')!
      if (hash === '#') return
      e.preventDefault()
      scrollToTarget(hash === '#top' ? 0 : hash)
    }
    document.addEventListener('click', onClick)

    if (prefersReducedMotion()) return () => document.removeEventListener('click', onClick)

    lenis = new Lenis({ lerp: 0.1 })
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => lenis?.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      document.removeEventListener('click', onClick)
      gsap.ticker.remove(raf)
      lenis?.destroy()
      lenis = null
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('is-loading', !ready)
    if (ready) lenis?.start()
    else lenis?.stop()
    if (ready) ScrollTrigger.refresh()
    if (ready) markIntro()
  }, [ready])
}

/**
 * Header + hero entrance in the page's motion style (anim.ts), played when the preloader hands over (its "Engineer"
 * lands on the hero's own, which is left alone here). Built paused at mount, so everything is already in its
 * start state and nothing flashes while the preloader fades.
 */
export function useIntro(ready: boolean) {
  const intro = useRef<gsap.core.Timeline | null>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const title = document.querySelector<HTMLElement>('.hero h1.hero__title')!
      const word = title.querySelector<HTMLElement>('.rotator__word')!
      // When the letters have landed they go back to plain inline text (.is-settled, see sections.css).
      const tl = gsap.timeline({ paused: true, onComplete: () => title.querySelector('.rotator')?.classList.add('is-settled') })
      // mask: the title box is the mask the letters rise from.
      tl.fromTo(title, { clipPath: 'inset(-40% -10% 0% -10%)' }, { clipPath: 'inset(-40% -10% 0% -10%)', duration: 1.6, clearProps: 'clipPath' }, 0)
      tl.add(charsIn(gsap.utils.toArray<HTMLElement>('.hc', word), 1.3), 0)
        .add(blockIn(gsap.utils.toArray('.header__name, .nav a, .header__end > *'), 0.05), 0.1)
        .add(blockIn(gsap.utils.toArray('.cta > *'), 0.12), 0.35)
        .add(blockIn(gsap.utils.toArray('.hero__goal')), 0.5)
        .add(blockIn(gsap.utils.toArray('.socials li'), 0.07), 0.65)
        .from('.hero .circle-wrap', { opacity: 0, scale: 0.6, duration: 1.8, stagger: 0.15, ease: 'expo.out' }, 0.3)
      intro.current = tl
    })
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (ready) intro.current?.play()
  }, [ready])
}

/**
 * CSS animations keep invalidating style (and, for the SVG covers, layout) every frame even when their section is
 * far off screen, which made scrolling stutter. Sections outside the viewport (plus a margin) get `.is-offscreen`,
 * which pauses every animation inside them (index.css); they resume where they were when scrolled back.
 */
export function usePauseOffscreen() {
  useEffect(() => {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle('is-offscreen', !e.isIntersecting)), { rootMargin: '200px 0px' })
    document.querySelectorAll('main section, .footer').forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])
}

/**
 * v1's card spotlight (SpotlighBorder.js): while the pointer is over the container, every `cards` element gets its
 * position in --mx/--my, so a radial glow on each card's border is centred on the pointer and neighbours catch its
 * edge. Cards are looked up on every move, so ones that remount keep working. Pass `target` to reuse a ref the
 * container already has. Styles live in projects.css.
 */
export function useSpotlight<T extends HTMLElement>(cards: string, target?: RefObject<T | null>) {
  const own = useRef<T>(null)
  const ref = target ?? own
  useEffect(() => {
    const box = ref.current
    if (!box || !hasFinePointer() || prefersReducedMotion()) return
    const onMove = (e: PointerEvent) => {
      box.querySelectorAll<HTMLElement>(cards).forEach((card) => {
        const r = card.getBoundingClientRect()
        card.style.setProperty('--mx', `${e.clientX - r.left}px`)
        card.style.setProperty('--my', `${e.clientY - r.top}px`)
      })
    }
    const on = () => box.classList.add('is-lit')
    const off = () => box.classList.remove('is-lit')
    box.addEventListener('pointermove', onMove)
    box.addEventListener('pointerenter', on)
    box.addEventListener('pointerleave', off)
    return () => {
      box.removeEventListener('pointermove', onMove)
      box.removeEventListener('pointerenter', on)
      box.removeEventListener('pointerleave', off)
    }
  }, [cards, ref])
  return ref
}

/** Elements with `data-magnetic` (optionally a strength, e.g. "0.5") pull toward the cursor. */
export function useMagnetic() {
  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return
    let current: HTMLElement | null = null

    const release = (el: HTMLElement) => gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.35)' })

    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element).closest?.<HTMLElement>('[data-magnetic]') ?? null
      if (el !== current) {
        if (current) release(current)
        current = el
      }
      if (!el) return
      const r = el.getBoundingClientRect()
      const strength = Number(el.dataset.magnetic) || 0.35
      gsap.to(el, {
        x: (e.clientX - (r.left + r.width / 2)) * strength,
        y: (e.clientY - (r.top + r.height / 2)) * strength,
        duration: 0.5,
        ease: 'power3.out',
      })
    }
    const onLeave = () => {
      if (current) release(current)
      current = null
    }

    document.addEventListener('pointermove', onMove)
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])
}

/** Background circles drift with scroll (`data-speed`) and with the mouse (`data-depth`). */
export function useParallax() {
  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-speed]').forEach((el) => {
        gsap.to(el, {
          y: () => Number(el.dataset.speed) * 300,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
        })
      })
    })

    if (!hasFinePointer()) return () => ctx.revert()

    const movers = gsap.utils.toArray<HTMLElement>('[data-depth]').map((el) => ({
      depth: Number(el.dataset.depth),
      x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3.out' }),
    }))
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / innerWidth - 0.5
      const ny = e.clientY / innerHeight - 0.5
      movers.forEach((m) => {
        m.x(nx * m.depth)
        m.y(ny * m.depth)
      })
    }
    window.addEventListener('pointermove', onMove)
    return () => {
      window.removeEventListener('pointermove', onMove)
      ctx.revert()
    }
  }, [])
}

/**
 * Scroll reveals in the page's motion style (anim.ts), all held until the intro is over:
 * - `[data-reveal]` enters as one block.
 * - `[data-reveal-stagger]` enters its children one after another (children with their own data-reveal-img skip it).
 * - `[data-reveal-img]` brings a media box in whole (images are never uncovered progressively).
 * - `[data-reveal-rows="<row selector>"]` draws a list in row by row (rowsIn).
 * - `data-reveal-start="<ScrollTrigger start>"` overrides when a stagger block fires (e.g. sections near the fold).
 */
export function useReveal() {
  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => revealOnScroll(el, blockIn(el)))
      gsap.utils.toArray<HTMLElement>('[data-reveal-stagger]').forEach((el) => revealOnScroll(el, blockIn([...el.children].filter((c) => !c.matches('[data-reveal-img]')), 0.08), el.dataset.revealStart ?? 'top 85%'))
      gsap.utils.toArray<HTMLElement>('[data-reveal-img]').forEach((el) => revealOnScroll(el, mediaIn(el), 'top 85%'))
      gsap.utils.toArray<HTMLElement>('[data-reveal-rows]').forEach((el) => revealOnScroll(el, rowsIn([...el.querySelectorAll(el.dataset.revealRows!)]), 'top 85%'))
    })
    return () => ctx.revert()
  }, [])
}

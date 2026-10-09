import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useEffect } from 'react'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches
export const hasFinePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches

let lenis: Lenis | null = null

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
  }, [ready])
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

/** Fade-up for `[data-reveal]` and staggered children for `[data-reveal-stagger]`. */
export function useReveal() {
  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 48,
          autoAlpha: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })
      gsap.utils.toArray<HTMLElement>('[data-reveal-stagger]').forEach((el) => {
        gsap.from(el.children, {
          y: 40,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        })
      })
    })
    return () => ctx.revert()
  }, [])
}

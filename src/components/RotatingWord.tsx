import { useLayoutEffect, useRef } from 'react'
import { gsap, onIntro, prefersReducedMotion } from '../motion'

type Props = { words: string[]; interval?: number }

/**
 * Cycles through words with a 3D cube flip: the current word tips back and blurs out,
 * the next one rolls in from below and an iridescent highlight sweeps across it.
 * The container width eases between word lengths so nothing around it jumps.
 */
export function RotatingWord({ words, interval = 3000 }: Props) {
  const root = useRef<HTMLSpanElement>(null)
  const key = words.join('|')

  useLayoutEffect(() => {
    const el = root.current!
    const items = gsap.utils.toArray<HTMLElement>('.rotator__word', el)
    let index = 0

    // Width in em so it follows the responsive font size.
    const widthOf = (w: HTMLElement) => `${w.offsetWidth / parseFloat(getComputedStyle(el).fontSize)}em`
    const ctx = gsap.context(() => {
      gsap.set(items, { autoAlpha: 0 })
      gsap.set(items[0], { autoAlpha: 1 })
      gsap.set(el, { width: widthOf(items[0]) })
    }, el)
    document.fonts?.ready.then(() => gsap.set(el, { width: widthOf(items[index]) }))

    if (prefersReducedMotion() || items.length < 2) return () => ctx.revert()

    // Rotation starts once the hero entrance has played (the first word enters with it).
    let id = 0
    let alive = true
    onIntro(() => alive && (id = window.setInterval(rotate, interval)))
    function rotate() {
      if (document.hidden) return
      const prev = items[index]
      index = (index + 1) % items.length
      const next = items[index]
      ctx.add(() => {
        gsap
          .timeline()
          .to(prev, { rotateX: 90, yPercent: -45, autoAlpha: 0, filter: 'blur(12px)', duration: 0.65, ease: 'power3.in' })
          .to(el, { width: widthOf(next), duration: 0.9, ease: 'expo.inOut' }, 0.15)
          .fromTo(
            next,
            { rotateX: -90, yPercent: 45, autoAlpha: 0, filter: 'blur(12px)' },
            { rotateX: 0, yPercent: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out', clearProps: 'transform,filter' },
            0.45,
          )
          // The gradient is only applied while sweeping; at rest the word is solid so it renders as crisp as the rest.
          .fromTo(
            next,
            { backgroundPosition: '100% 0' },
            {
              backgroundPosition: '0% 0',
              duration: 1.4,
              ease: 'power2.out',
              onStart: () => next.classList.add('is-sweeping'),
              onComplete: () => next.classList.remove('is-sweeping'),
            },
            0.5,
          )
      })
    }

    return () => {
      alive = false
      clearInterval(id)
      ctx.revert()
    }
  }, [key, interval])

  return (
    <span className="rotator" ref={root} aria-hidden="true">
      {words.map((w) => (
        <span key={w} className="rotator__word">
          {[...w].map((c, k) => (
            <span key={k} className="hc">
              {c}
            </span>
          ))}
        </span>
      ))}
    </span>
  )
}

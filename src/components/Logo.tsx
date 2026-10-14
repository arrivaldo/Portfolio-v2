import { useEffect, useId, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../motion'

/**
 * "E/" monogram (same mark as the v1 favicon): the E follows the theme, the slash carries the iridescent accent.
 * The slash draws itself in once the page is ready and spins whenever the theme changes.
 */
export function Logo({ size = 44 }: { size?: number }) {
  const id = useId().replace(/:/g, '')
  const slash = useRef<SVGPathElement>(null)
  const ring = useRef<SVGCircleElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const html = document.documentElement
    const s = slash.current!
    const r = ring.current!
    gsap.set(s, { transformOrigin: '50% 100%', scaleY: 0 })
    gsap.set(r, { strokeDasharray: 134, strokeDashoffset: 134 })

    let drawn = false
    const draw = () => {
      if (drawn || html.classList.contains('is-loading')) return
      drawn = true
      gsap.timeline({ delay: 0.3 })
        .to(r, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' })
        .to(s, { scaleY: 1, duration: 0.7, ease: 'expo.out' }, 0.5)
    }
    let theme = html.dataset.theme
    const spin = () => {
      if (html.dataset.theme === theme) return
      theme = html.dataset.theme
      gsap.fromTo(s, { rotate: 0 }, { rotate: 360, transformOrigin: '50% 50%', duration: 0.9, ease: 'expo.inOut' })
    }

    draw()
    const mo = new MutationObserver(() => {
      draw()
      spin()
    })
    mo.observe(html, { attributes: true, attributeFilter: ['class', 'data-theme'] })
    return () => mo.disconnect()
  }, [])

  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 44 44" aria-hidden="true">
      <defs>
        <linearGradient id={`logo-${id}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#7ef0ff" />
          <stop offset="50%" stopColor="#c86cff" />
          <stop offset="100%" stopColor="#ff7ac8" />
        </linearGradient>
      </defs>
      <circle ref={ring} className="logo__ring" cx="22" cy="22" r="21.25" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(-90 22 22)" />
      <path d="M11 12h12v4h-8v4h7v4h-7v4h8v4H11z" fill="currentColor" />
      <path ref={slash} className="logo__slash" d="M25.5 32l6-20h4l-6 20z" fill={`url(#logo-${id})`} />
    </svg>
  )
}

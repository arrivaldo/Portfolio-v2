import { useLayoutEffect, useRef } from 'react'
import { charsIn } from '../anim'
import { gsap, prefersReducedMotion, revealOnScroll } from '../motion'

/** `as` is limited to text tags — React Three Fiber also registers 3D elements in JSX's intrinsic elements. */
type Props = { text: string; as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'; className?: string }

/** Text split into words and letters that rise from behind their word's box when scrolled into view. */
export function SplitReveal({ text, as = 'h2', className }: Props) {
  const ref = useRef<HTMLHeadingElement>(null)
  // All allowed tags share the same props; typing it as one keeps TS from expanding the union.
  const Tag = as as 'h2'

  useLayoutEffect(() => {
    if (!ref.current || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      revealOnScroll(ref.current!, charsIn(gsap.utils.toArray<HTMLElement>('.split__char', ref.current)))
    }, ref)
    return () => ctx.revert()
  }, [text])

  return (
    <Tag ref={ref} className={`split ${className ?? ''}`}>
      {/* Screen readers get the plain text; aria-label isn't allowed on a plain span, so it's real (hidden) text. */}
      <span className="visually-hidden">{text}</span>
      {text.split(' ').map((word, i) => (
        <span key={`${word}-${i}`} className="split__mask" aria-hidden="true">
          <span className="split__word">
            {[...word].map((c, k) => (
              <span key={k} className="split__char">
                {c}
              </span>
            ))}
          </span>
        </span>
      ))}
    </Tag>
  )
}

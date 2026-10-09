import { useLayoutEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../motion'

/** `as` is limited to text tags — React Three Fiber also registers 3D elements in JSX's intrinsic elements. */
type Props = { text: string; as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'; className?: string }

/** Heading whose words slide up from behind a mask when scrolled into view. */
export function SplitReveal({ text, as = 'h2', className }: Props) {
  const ref = useRef<HTMLHeadingElement>(null)
  // All allowed tags share the same props; typing it as one keeps TS from expanding the union.
  const Tag = as as 'h2'

  useLayoutEffect(() => {
    if (!ref.current || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('.split__word', {
        yPercent: 115,
        rotate: 4,
        duration: 1.1,
        stagger: 0.06,
        ease: 'power4.out',
        scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true },
      })
    }, ref)
    return () => ctx.revert()
  }, [text])

  return (
    <Tag ref={ref} className={`split ${className ?? ''}`} aria-label={text}>
      {text.split(' ').map((word, i) => (
        <span key={`${word}-${i}`} className="split__mask" aria-hidden="true">
          <span className="split__word">{word}</span>
        </span>
      ))}
    </Tag>
  )
}

import { useEffect, useRef } from 'react'
import { gsap } from '../motion'

/** Thin bar at the top of the viewport that fills with page scroll. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tween = gsap.to(bar.current, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  return <div className="scroll-progress" ref={bar} aria-hidden="true" />
}

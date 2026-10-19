import { type ReactNode, useLayoutEffect, useRef } from 'react'
import { blockIn } from '../anim'
import { gsap, prefersReducedMotion, revealOnScroll } from '../motion'
import { SplitReveal } from './SplitReveal'

type Props = { label: string; title: string; lead?: ReactNode; aside?: ReactNode }

/**
 * Shared section heading: label | title | lead or action, one row, vertically centred, hairline above. Every section uses it.
 * On scroll-in the label and title enter letter by letter (SplitReveal) and the lead/action follows.
 */
export function SectionHead({ label, title, lead, aside }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!ref.current || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const side = ref.current!.querySelectorAll('.section-head__lead, .section-head__aside')
      if (side.length) revealOnScroll(ref.current!, blockIn(side).delay(0.25))
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} className="section-head section-head--split">
      <SplitReveal as="span" className="label" text={label} />
      <SplitReveal className="section-title" text={title} />
      {lead && <p className="section-head__lead">{lead}</p>}
      {aside && <div className="section-head__aside">{aside}</div>}
    </div>
  )
}

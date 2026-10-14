import { type ReactNode, useLayoutEffect, useRef } from 'react'
import { blockIn } from '../anim'
import { gsap, prefersReducedMotion, revealOnScroll } from '../motion'
import { SplitReveal } from './SplitReveal'

type Props = { label: string; title: string; lead?: ReactNode; aside?: ReactNode }

/**
 * Heading styles under comparison. Pick with ?head=compact|rule|stacked|split|classic.
 * split (default, chosen 2026-10-07): label | title | lead or action, one row, vertically centred, hairline above.
 * compact: one-line mid-size title, lead/action on the same baseline at the right.
 * rule: mid-size title followed by a hairline that runs to the action; lead underneath.
 * stacked: label, title and lead in one left column — no side gap at all.
 * classic: the previous big 72px title with the lead at the bottom-right.
 */
const param = new URLSearchParams(window.location.search).get('head')
const variant = (['compact', 'rule', 'stacked', 'classic'] as const).find((v) => v === param) ?? 'split'

/**
 * Shared section heading: mono label, title, and an optional lead or action. Every section uses it.
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
    <div ref={ref} className={`section-head section-head--${variant}`}>
      <SplitReveal as="span" className="label" text={label} />
      <SplitReveal className="section-title" text={title} />
      {lead && <p className="section-head__lead">{lead}</p>}
      {aside && <div className="section-head__aside">{aside}</div>}
    </div>
  )
}

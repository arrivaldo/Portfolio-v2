import { useId, type ReactNode } from 'react'

/* Line glyphs for the What I do cards, one per card in Process.tsx order. Every stroke uses pathLength=1 so CSS can
   draw it in (.g-draw) or run a pulse along it (.g-flow) without measuring paths. */
const glyphs: ReactNode[] = [
  // Software: </> with a blinking caret.
  <>
    <path className="g-draw" pathLength={1} d="M22 20 10 32l12 12" />
    <path className="g-draw" pathLength={1} d="M42 20l12 12-12 12" />
    <path className="g-draw" pathLength={1} d="M36 14 28 50" />
    <path className="g-caret" d="M50 50h6" />
  </>,
  // AI & Automation: agent nodes with a signal running through them.
  <>
    <path className="g-draw" pathLength={1} d="M14 44 30 20l20 10-8 22z" />
    <path className="g-flow" pathLength={1} d="M14 44 30 20l20 10-8 22z" />
    <circle className="g-node" cx="14" cy="44" r="4" />
    <circle className="g-node" cx="30" cy="20" r="4" />
    <circle className="g-node" cx="50" cy="30" r="4" />
    <circle className="g-node" cx="42" cy="52" r="4" />
  </>,
  // Solutions: a hub connecting clients, systems and code.
  <>
    <rect className="g-draw" pathLength={1} x="25" y="25" width="14" height="14" rx="3" />
    <path className="g-draw g-spoke" pathLength={1} d="M32 25V12M32 39v13M25 32H12M39 32h13" />
    <circle className="g-node" cx="32" cy="9" r="3" />
    <circle className="g-node" cx="32" cy="55" r="3" />
    <circle className="g-node" cx="9" cy="32" r="3" />
    <circle className="g-node" cx="55" cy="32" r="3" />
  </>,
  // Quality: a shield with a passing check.
  <>
    <path className="g-draw" pathLength={1} d="M32 10 50 17v14c0 11-8 19-18 23-10-4-18-12-18-23V17z" />
    <path className="g-draw g-check" pathLength={1} d="m24 32 6 6 11-12" />
  </>,
  // Product engineering: a trace with a spike, and the lens that finds the root cause.
  <>
    <path className="g-draw" pathLength={1} d="M8 34h10l4-10 6 20 4-10h6" />
    <path className="g-flow" pathLength={1} d="M8 34h10l4-10 6 20 4-10h6" />
    <circle className="g-draw" pathLength={1} cx="44" cy="30" r="9" />
    <path className="g-draw" pathLength={1} d="m50.5 36.5 7 7" />
  </>,
  // Business architecture: a process mapped into steps.
  <>
    <rect className="g-draw" pathLength={1} x="8" y="12" width="16" height="12" rx="3" />
    <rect className="g-draw" pathLength={1} x="40" y="12" width="16" height="12" rx="3" />
    <rect className="g-draw" pathLength={1} x="24" y="42" width="16" height="12" rx="3" />
    <path className="g-draw g-arrow" pathLength={1} d="M24 18h16M48 24v6c0 6-4 9-8 12M16 24v6c0 6 4 9 8 12" />
  </>,
]

/** Muted glyph with an electric-blue copy on top that fades in when the card is hovered. */
export function ServiceGlyph({ index }: { index: number }) {
  const id = useId()
  const glyph = glyphs[index % glyphs.length]
  return (
    <svg className="svc-glyph" viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: 'var(--svc-b)' }} />
          <stop offset="1" style={{ stopColor: 'var(--svc-a)' }} />
        </linearGradient>
      </defs>
      <g className="svc-glyph__base">{glyph}</g>
      <g className="svc-glyph__lit" stroke={`url(#${id})`}>{glyph}</g>
    </svg>
  )
}

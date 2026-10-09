import type { CSSProperties } from 'react'

type Props = {
  size: number
  style: CSSProperties
  /** Scroll parallax factor (negative moves up). */
  speed?: number
  /** Mouse parallax in px. */
  depth?: number
}

/** Decorative outline circle that drifts with scroll and mouse. */
export function Circle({ size, style, speed = 0.2, depth = 30 }: Props) {
  return (
    <span className="circle-wrap" style={{ width: size, height: size, ...style }} data-speed={speed} aria-hidden="true">
      <span className="circle" data-depth={depth} />
    </span>
  )
}

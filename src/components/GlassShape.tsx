import { useId } from 'react'

type Palette = { bg: [string, string, string]; a: string[]; b: string[]; glow: string }

/** One palette per cover so every article reads as its own piece. */
const palettes: Palette[] = [
  { bg: ['#bfe3ff', '#6aa6d6', '#24456b'], a: ['#ffd2f2', '#c86cff', '#5a2bd9', '#ff7ac8'], b: ['#7ef0ff', '#e9a5ff', '#3b1a8f'], glow: '#e66cff' },
  { bg: ['#ffe1cf', '#e8744f', '#4a1410'], a: ['#fff1e6', '#ff8a5c', '#d42a3c', '#ffc36b'], b: ['#ffe6a8', '#ff6f91', '#7a0f2a'], glow: '#ff4d5e' },
  { bg: ['#d4fff4', '#38b89c', '#0b3b3a'], a: ['#f0fff9', '#5ef2c6', '#118a8a', '#b6ff7a'], b: ['#e4ffb0', '#4fd1ff', '#0a4f63'], glow: '#3cf0b8' },
  { bg: ['#ffe6c4', '#9a6cff', '#1d1046'], a: ['#fff3d6', '#ff9a3d', '#7b3dff', '#ff6fd8'], b: ['#ffd76b', '#b48cff', '#2a1170'], glow: '#ff9a3d' },
  { bg: ['#fff6c2', '#f7d93a', '#8a6a05'], a: ['#fffbe0', '#ffd23f', '#3a3532', '#ffb02e'], b: ['#ffffff', '#ffe36e', '#2d2a28'], glow: '#ffef7a' },
]

type Props = { variant?: number }

/** Iridescent glass cover for the article cards; each variant has its own form, palette and motion. */
export function GlassShape({ variant = 0 }: Props) {
  const id = useId().replace(/:/g, '')
  const v = ((variant % palettes.length) + palettes.length) % palettes.length
  const p = palettes[v]
  const a = `url(#a-${id})`
  const b = `url(#b-${id})`
  const orb = `url(#orb-${id})`
  const soft = `url(#soft-${id})`

  return (
    <svg className={`glass glass--v${v}`} viewBox="0 0 240 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id={`bg-${id}`} cx="35%" cy="30%" r="90%">
          <stop offset="0%" stopColor={p.bg[0]} />
          <stop offset="45%" stopColor={p.bg[1]} />
          <stop offset="100%" stopColor={p.bg[2]} />
        </radialGradient>
        <linearGradient id={`a-${id}`} x1="0" y1="0" x2="1" y2="1">
          {p.a.map((c, i) => (
            <stop key={c} offset={`${(i / (p.a.length - 1)) * 100}%`} stopColor={c} />
          ))}
        </linearGradient>
        <linearGradient id={`b-${id}`} x1="1" y1="0" x2="0" y2="1">
          {p.b.map((c, i) => (
            <stop key={c} offset={`${(i / (p.b.length - 1)) * 100}%`} stopColor={c} />
          ))}
        </linearGradient>
        <radialGradient id={`orb-${id}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fff" stopOpacity=".95" />
          <stop offset="35%" stopColor={p.a[1]} />
          <stop offset="100%" stopColor={p.a[2]} />
        </radialGradient>
        <filter id={`blur-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id={`soft-${id}`}>
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>

      <rect width="240" height="240" fill={`url(#bg-${id})`} />
      {/* The shape moves inside its frame; the background stays put. */}
      <g className="glass__float">
        <ellipse className="glass__glow" cx="124" cy="128" rx="78" ry="58" fill={p.glow} opacity=".35" filter={`url(#blur-${id})`} />

        {v === 0 && (
          // Interlocking rings.
          <g className="glass__spin">
            <g transform="rotate(-28 120 120)">
              <ellipse cx="120" cy="124" rx="70" ry="44" fill="none" stroke={a} strokeWidth="30" opacity=".95" />
              <ellipse cx="120" cy="124" rx="70" ry="44" fill="none" stroke={b} strokeWidth="12" opacity=".7" filter={soft} />
            </g>
            <g className="glass__inner">
              <g transform="rotate(34 120 120)">
                <ellipse cx="118" cy="118" rx="52" ry="30" fill="none" stroke={b} strokeWidth="18" opacity=".75" />
              </g>
            </g>
          </g>
        )}

        {v === 1 && (
          // Record button: glass rings around a beating core.
          <g>
            <g className="glass__spin">
              <circle cx="120" cy="120" r="80" fill="none" stroke={b} strokeWidth="6" strokeDasharray="34 18" strokeLinecap="round" opacity=".8" />
            </g>
            <g className="glass__inner">
              <circle cx="120" cy="120" r="58" fill="none" stroke={a} strokeWidth="22" opacity=".95" />
              <circle cx="120" cy="120" r="58" fill="none" stroke={b} strokeWidth="8" strokeDasharray="60 300" strokeLinecap="round" opacity=".7" filter={soft} />
            </g>
            <circle className="glass__beat" cx="120" cy="120" r="26" fill={orb} />
          </g>
        )}

        {v === 2 && (
          // Conversion: two glass arrows chasing each other around a gem.
          <g className="glass__spin">
            <path d="M58 120a62 62 0 0 1 108-42" fill="none" stroke={a} strokeWidth="24" strokeLinecap="round" />
            <path d="M170 64l8 30-30-6z" fill={p.a[1]} stroke={p.a[1]} strokeWidth="6" strokeLinejoin="round" />
            <path d="M182 120a62 62 0 0 1-108 42" fill="none" stroke={b} strokeWidth="24" strokeLinecap="round" />
            <path d="M70 176l-8-30 30 6z" fill={p.b[1]} stroke={p.b[1]} strokeWidth="6" strokeLinejoin="round" />
            <g className="glass__inner">
              <rect x="104" y="104" width="32" height="32" rx="9" fill={orb} transform="rotate(45 120 120)" />
            </g>
          </g>
        )}

        {v === 3 && (
          // Three.js plane: a waving wireframe with a ringed orb orbiting above it.
          <g>
            <g className="glass__wave">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <path
                  key={i}
                  d={`M-200 ${122 + i * 16}q35 -${22 - i * 2} 70 0t70 0t70 0t70 0t70 0t70 0t70 0`}
                  fill="none"
                  stroke={i % 2 ? b : a}
                  strokeWidth={3 + i * 0.6}
                  strokeLinecap="round"
                  opacity={0.95 - i * 0.1}
                />
              ))}
            </g>
            <g className="glass__orbit">
              <circle cx="120" cy="76" r="28" fill={orb} />
              <g className="glass__inner">
                <ellipse cx="120" cy="76" rx="48" ry="12" fill="none" stroke={b} strokeWidth="5" opacity=".85" transform="rotate(-18 120 76)" />
              </g>
            </g>
          </g>
        )}

        {v === 4 && (
          // Closure: a function's braces wrapped around the scope it keeps alive.
          <g>
            <g className="glass__spin">
              <circle cx="120" cy="120" r="82" fill="none" stroke={b} strokeWidth="4" strokeDasharray="4 14" strokeLinecap="round" opacity=".7" />
            </g>
            <g className="glass__braces">
              <path d="M92 58c-22 0-22 14-22 30v14c0 10-6 18-16 18 10 0 16 8 16 18v14c0 16 0 30 22 30" fill="none" stroke={a} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M148 58c22 0 22 14 22 30v14c0 10 6 18 16 18-10 0-16 8-16 18v14c0 16 0 30-22 30" fill="none" stroke={a} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <g className="glass__inner">
              <circle cx="120" cy="120" r="22" fill={orb} />
              <circle cx="120" cy="84" r="7" fill={p.a[2]} />
              <circle cx="151" cy="138" r="5" fill={p.a[2]} opacity=".8" />
              <circle cx="89" cy="138" r="6" fill={p.a[2]} opacity=".9" />
            </g>
          </g>
        )}

        {/* Highlights stay put while the shape turns, like a fixed light source. */}
        <g className="glass__shine">
          <path d="M70 92c18-26 58-36 88-18" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".7" filter={soft} />
          <path d="M150 170c14-6 24-16 28-28" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".5" filter={soft} />
        </g>
      </g>
    </svg>
  )
}

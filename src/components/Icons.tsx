import type { ReactElement, SVGProps } from 'react'
import type { Social } from '../data'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

const base = (size: number): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
})

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export const ArrowRight = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...stroke} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const ArrowLeft = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...stroke} {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
)

export const ArrowUpRight = ({ size = 16, ...p }: IconProps) => (
  <svg {...base(size)} {...stroke} {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)

export const Sun = ({ size = 16, ...p }: IconProps) => (
  <svg {...base(size)} {...stroke} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)

export const Moon = ({ size = 16, ...p }: IconProps) => (
  <svg {...base(size)} {...stroke} {...p}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
)

export const Download = ({ size = 14, ...p }: IconProps) => (
  <svg {...base(size)} {...stroke} {...p}>
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </svg>
)

const socialPaths: Record<Social['id'], ReactElement> = {
  github: (
    <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 2.9.8.1-.6.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2z" />
  ),
  linkedin: (
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11.5H3zM9.5 9.75h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6v5.9h-4v-5.2c0-1.3 0-2.9-1.8-2.9s-2.1 1.4-2.1 2.8v5.3h-4z" />
  ),
  whatsapp: (
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3z" />
  ),
  email: <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2.4V17h16V7.4l-8 5.3zM5.8 7 12 11.1 18.2 7z" />,
}

export const SocialIcon = ({ id, size = 13 }: { id: Social['id']; size?: number }) => (
  <svg {...base(size)} fill="currentColor">
    {socialPaths[id]}
  </svg>
)

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Edges, OrbitControls, Sparkles } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import * as THREE from 'three'
import { prefersReducedMotion } from '../motion'

/**
 * Ported from v1 (components/ui/TechCubeScene.tsx) and re-skinned with v2's system: monochrome materials
 * that follow the light/dark theme, the header's "E/" monogram on the faces, and the logo's iridescent
 * accent on the orbiting particles. It turns toward whichever corner card is hovered.
 * Loaded lazily — only ?svc=cube pulls three.js into the page.
 */

export type CubeFacePosition = 'tl' | 'tr' | 'bl' | 'br'
type Theme = 'dark' | 'light'

/** Same stops as the logo slash (Logo.tsx). */
export const IRIDESCENT = ['#7ef0ff', '#c86cff', '#ff7ac8']

/** Scene palette per theme, taken from the tokens in index.css. */
const PALETTE = {
  dark: {
    shell: '#141414',
    edge: '#f1f1f1',
    bracket: '#f1f1f1',
    bracketGlow: 0.7,
    ringOpacity: 0.2,
    platform: '#1a1a1a',
    platformEdge: '#3b3b3b',
    shadow: 0.6,
    ink: '#f1f1f1',
    ambient: 0.35,
    light: 2,
    bloom: true,
    sparkles: true,
  },
  light: {
    shell: '#f7f7f5',
    edge: '#141414',
    bracket: '#141414',
    bracketGlow: 0,
    ringOpacity: 0.28,
    platform: '#e6e6e3',
    platformEdge: '#bbbbbb',
    shadow: 0.3,
    ink: '#141414',
    ambient: 0.9,
    light: 0.8,
    bloom: false,
    sparkles: false,
  },
} as const

type Palette = (typeof PALETTE)[Theme]

/** Follows `data-theme` on <html>, which useTheme toggles. */
function useDocTheme(): Theme {
  const read = (): Theme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')
  const [theme, setTheme] = useState(read)
  useEffect(() => {
    const mo = new MutationObserver(() => setTheme(read()))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
  }, [])
  return theme
}

const FACE_TARGETS: Record<CubeFacePosition, { yaw: number; pitch: number }> = {
  tl: { yaw: -0.55, pitch: 0.18 },
  tr: { yaw: 0.55, pitch: 0.18 },
  bl: { yaw: -0.55, pitch: -0.18 },
  br: { yaw: 0.55, pitch: -0.18 },
}

const CORNER_DEFS: [number, number, number][] = []
for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) CORNER_DEFS.push([sx, sy, sz])

function easeOutBack(x: number) {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

/** The header monogram (Logo.tsx paths, 44×44 space) painted onto a texture. */
function useMonogramTexture(p: Palette, theme: Theme) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    ctx.scale(512 / 44, 512 / 44)
    if (theme === 'dark') {
      ctx.shadowColor = '#c86cff'
      ctx.shadowBlur = 2
    }
    ctx.strokeStyle = p.ink
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(22, 22, 21.25, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = p.ink
    ctx.fill(new Path2D('M11 12h12v4h-8v4h7v4h-7v4h8v4H11z'))
    const grad = ctx.createLinearGradient(25.5, 32, 35.5, 12)
    IRIDESCENT.forEach((c, i) => grad.addColorStop(i / 2, c))
    ctx.fillStyle = grad
    ctx.fill(new Path2D('M25.5 32l6-20h4l-6 20z'))
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [p, theme])
  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

/** One per side face, so the mark is always visible while the cube turns. */
const SIDE_FACES: { position: [number, number, number]; rotation: [number, number, number] }[] = [
  { position: [0, 0, 0.96], rotation: [0, 0, 0] },
  { position: [0.96, 0, 0], rotation: [0, Math.PI / 2, 0] },
  { position: [0, 0, -0.96], rotation: [0, Math.PI, 0] },
  { position: [-0.96, 0, 0], rotation: [0, -Math.PI / 2, 0] },
]

function Monograms({ p, theme }: { p: Palette; theme: Theme }) {
  const map = useMonogramTexture(p, theme)
  return (
    <>
      {SIDE_FACES.map((f, i) => (
        <mesh key={i} position={f.position} rotation={f.rotation}>
          <planeGeometry args={[1.25, 1.25]} />
          <meshBasicMaterial map={map} transparent toneMapped={false} depthWrite={false} />
        </mesh>
      ))}
    </>
  )
}

function Shell({ size, p }: { size: number; p: Palette }) {
  const geo = useMemo(() => new THREE.BoxGeometry(size, size, size), [size])
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={p.shell} transparent opacity={0.9} roughness={0.35} metalness={0.1} />
      <Edges scale={1.001} threshold={15} color={p.edge} linewidth={1.6} />
    </mesh>
  )
}

function CornerBrackets({ size, p, blockSize = 0.11 }: { size: number; p: Palette; blockSize?: number }) {
  const h = size / 2
  return (
    <group>
      {CORNER_DEFS.map((c, i) => (
        <mesh key={i} position={[c[0] * h, c[1] * h, c[2] * h]}>
          <boxGeometry args={[blockSize, blockSize, blockSize]} />
          <meshStandardMaterial color={p.bracket} emissive={p.bracket} emissiveIntensity={p.bracketGlow} roughness={0.4} metalness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function OrbitalRing({
  radius,
  rotation,
  speed,
  p,
  particleCount = 3,
}: {
  radius: number
  rotation: [number, number, number]
  speed: number
  p: Palette
  particleCount?: number
}) {
  const particlesRef = useRef<(THREE.Mesh | null)[]>([])
  const offsets = useMemo(
    () => Array.from({ length: particleCount }, (_, i) => (i / particleCount) * Math.PI * 2),
    [particleCount],
  )
  const torusGeo = useMemo(() => new THREE.TorusGeometry(radius, 0.005, 8, 96), [radius])

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed
    offsets.forEach((offset, i) => {
      const angle = t + offset
      particlesRef.current[i]?.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
    })
  })

  return (
    <group rotation={rotation}>
      <mesh geometry={torusGeo}>
        <meshBasicMaterial color={p.edge} transparent opacity={p.ringOpacity} toneMapped={false} />
      </mesh>
      {offsets.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            particlesRef.current[i] = el
          }}
        >
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshBasicMaterial color={IRIDESCENT[i % IRIDESCENT.length]} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function PlatformLayer({ y, size, height, p }: { y: number; size: number; height: number; p: Palette }) {
  const boxGeo = useMemo(() => new THREE.BoxGeometry(size, height, size), [size, height])
  return (
    <mesh position={[0, y, 0]} geometry={boxGeo}>
      <meshStandardMaterial color={p.platform} roughness={0.6} metalness={0.2} />
      <Edges scale={1.001} threshold={15} color={p.platformEdge} linewidth={1.2} />
    </mesh>
  )
}

const SPIN_DURATION = 1.3

function CoreCube({
  activeFace,
  spinTrigger,
  p,
  theme,
  still,
}: {
  activeFace: CubeFacePosition | null
  spinTrigger?: number
  p: Palette
  theme: Theme
  still: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [pointerHovered, setPointerHovered] = useState(false)
  const spinState = useRef({ active: false, t: 0, prevEased: 0 })
  const prevSpinTrigger = useRef(spinTrigger ?? 0)

  useFrame((_, delta) => {
    const g = groupRef.current
    if (!g) return

    if (spinTrigger !== undefined && spinTrigger !== prevSpinTrigger.current) {
      prevSpinTrigger.current = spinTrigger
      spinState.current = { active: true, t: 0, prevEased: 0 }
    }

    if (activeFace) {
      const target = FACE_TARGETS[activeFace]
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, target.yaw, 4, delta)
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, target.pitch, 4, delta)
    } else {
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0, 4, delta)
      if (!still) g.rotation.y += delta * (pointerHovered ? 0.6 : 0.25)
    }

    const spin = spinState.current
    if (spin.active) {
      spin.t += delta
      const k = Math.min(spin.t / SPIN_DURATION, 1)
      const eased = 1 - Math.pow(1 - k, 3)
      g.rotation.y += (eased - spin.prevEased) * Math.PI * 4
      spin.prevEased = eased
      if (k >= 1) spinState.current = { active: false, t: 0, prevEased: 0 }
    }
  })

  return (
    <group
      ref={groupRef}
      onPointerOver={(e) => {
        e.stopPropagation()
        setPointerHovered(true)
      }}
      onPointerOut={() => setPointerHovered(false)}
    >
      <Shell size={1.9} p={p} />
      <CornerBrackets size={1.9} p={p} />
      <Monograms p={p} theme={theme} />
      <pointLight color="#ffffff" intensity={(pointerHovered || activeFace ? 2 : 1) * p.light} distance={6} />
      {/* The platform shares the cube's rotation group so both always move together. */}
      <group position={[0, -1.05, 0]}>
        <PlatformLayer y={0} size={2.05} height={0.16} p={p} />
        <PlatformLayer y={-0.22} size={2.55} height={0.14} p={p} />
      </group>
    </group>
  )
}

function AssemblyRig({
  revealed,
  activeFace,
  spinTrigger,
  p,
  theme,
  still,
}: {
  revealed: boolean
  activeFace: CubeFacePosition | null
  spinTrigger?: number
  p: Palette
  theme: Theme
  still: boolean
}) {
  const wrapRef = useRef<THREE.Group>(null)
  const progressRef = useRef(still ? 1 : 0)

  useFrame((_, delta) => {
    if (revealed && progressRef.current < 1) progressRef.current = Math.min(1, progressRef.current + delta / 0.9)
    wrapRef.current?.scale.setScalar(Math.max(0.0001, easeOutBack(progressRef.current)))
  })

  return (
    <group ref={wrapRef} scale={0.0001}>
      <CoreCube activeFace={activeFace} spinTrigger={spinTrigger} p={p} theme={theme} still={still} />
      <OrbitalRing radius={2.0} rotation={[Math.PI / 2.4, 0, 0]} speed={0.3} p={p} particleCount={3} />
      <OrbitalRing radius={2.35} rotation={[Math.PI / 2.4, 0, 0]} speed={-0.2} p={p} particleCount={2} />
      <ContactShadows position={[0, -1.36, 0]} opacity={p.shadow} scale={5} blur={2.4} far={2} color="#000000" />
    </group>
  )
}

export default function TechCubeScene({
  revealed = true,
  active = true,
  activeFace = null,
  spinTrigger,
}: {
  revealed?: boolean
  /** Pauses rendering while the section is off screen. */
  active?: boolean
  activeFace?: CubeFacePosition | null
  spinTrigger?: number
}) {
  const theme = useDocTheme()
  const p = PALETTE[theme]
  const still = prefersReducedMotion()

  return (
    <Canvas
      camera={{ position: [6.0, 4.0, 7.6], fov: 30 }}
      dpr={[1, 2]}
      frameloop={active ? 'always' : 'never'}
      gl={{ alpha: true, antialias: true }}
      style={{ touchAction: 'pan-y' }}
    >
      <ambientLight intensity={p.ambient} />
      <directionalLight position={[3, 5, 2]} intensity={0.6} />
      <spotLight
        color="#ffffff"
        position={[-1.8, 2.6, 1.5]}
        target-position={[0, -0.97, 0]}
        angle={0.3}
        penumbra={0.45}
        intensity={2 * p.light}
        distance={6}
        decay={2}
      />
      {/* Local lighting instead of drei's <Environment>: no HDR download from a third-party CDN to wait on. */}
      <hemisphereLight color="#ffffff" groundColor={p.platform} intensity={p.ambient} />
      <directionalLight position={[-4, 2, -3]} intensity={0.35 * p.light} />

      <AssemblyRig revealed={revealed} activeFace={activeFace} spinTrigger={spinTrigger} p={p} theme={theme} still={still} />
      {p.sparkles && !still && <Sparkles count={14} scale={3.4} size={1.2} speed={0.3} color="#c86cff" />}

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={!activeFace && !still}
        autoRotateSpeed={1}
        rotateSpeed={0.6}
        minPolarAngle={Math.PI / 3.4}
        maxPolarAngle={Math.PI / 1.85}
      />

      {p.bloom && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom intensity={0.25} luminanceThreshold={0.75} luminanceSmoothing={0.15} radius={0.15} />
        </EffectComposer>
      )}
    </Canvas>
  )
}

import { useEffect, useRef, useState } from 'react'
import { AmbientLight, CircleGeometry, Color, DirectionalLight, DoubleSide, InstancedMesh, Matrix4, MeshLambertMaterial, Object3D, PerspectiveCamera, PointLight, Scene, Vector3, WebGLRenderer, type MeshPhongMaterial } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import ThreeGlobe from 'three-globe'
import dotsUrl from '../assets/globe-dots.bin?url'
import { V1_ARCS } from '../assets/globeArcs'
import { isScrolling, prefersReducedMotion } from '../motion'

// The hex-dot globe from portfolio v1 (components/ui/Globe.tsx + GridGlobe.tsx), rebuilt on plain three.js with
// v1's arcs and settings as they were: same routes, colours, stroke, dash timing and pulsing rings. Navy globe in
// dark (v1's own colour), pale blue in light. Lazy-loaded by the Lab bento; it only renders while on screen.
/** v1 drew from the first two of its three colours. */
const V1_COLORS = ['#06b6d4', '#3b82f6']
const ARC_TIME = 1000
const ARC_LENGTH = 0.9
const CAMERA_Z = 300

/** Home: every route below starts here (the caption reads "México → the world"). */
const CDMX = { lat: 19.4326, lng: -99.1332 }
/** Electric blue, the Lab's accent, so these routes read apart from v1's cyan/blue ones. */
const HOME_COLOR = '#5ce1ff'
/** Places my work has reached from Mexico City; the arcs leave CDMX one after another. */
const HOME_ROUTES: [lat: number, lng: number, alt: number][] = [
  [40.7128, -74.006, 0.25], // New York
  [37.7749, -122.4194, 0.2], // San Francisco
  [48.1351, 11.582, 0.45], // Munich
  [40.4168, -3.7038, 0.4], // Madrid
  [4.711, -74.0721, 0.2], // Bogotá
  [-23.5505, -46.6333, 0.35], // São Paulo
]
/** Land dots: H3 resolution-3 cells (avg. edge 68.98 km) drawn at 30% of their size, as v1's hexPolygonMargin(0.7). */
const DOT_RADIUS = (68.98 / 6371) * 100 * 0.3

type Theme = 'light' | 'dark'

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

/**
 * The land dots come precomputed (scripts/build-globe-dots.mjs) as Int16 [lat, lng] × 100 pairs, a small cacheable
 * asset. They used to be built here from country polygons with h3-js — the long task that made the page stutter —
 * and then drawn as ~200 meshes; now they are one instanced mesh, one draw call.
 */
let dots: Promise<Int16Array> | null = null
const loadDots = () => (dots ??= fetch(dotsUrl).then((r) => r.arrayBuffer()).then((b) => new Int16Array(b)))
/** Lets the Lab fetch the dots ahead of time, together with this chunk. */
export const preloadGlobeData = () => loadDots()

/** One flat hexagon per land cell, lying on the globe's surface. */
function landDots(globe: ThreeGlobe, data: Int16Array, color: string, opacity: number) {
  const count = data.length / 2
  const mesh = new InstancedMesh(new CircleGeometry(DOT_RADIUS, 6), new MeshLambertMaterial({ color, opacity, transparent: opacity < 1, side: DoubleSide }), count)
  const o = new Object3D()
  const normal = new Vector3()
  const m = new Matrix4()
  for (let i = 0; i < count; i++) {
    const { x, y, z } = globe.getCoords(data[i * 2] / 100, data[i * 2 + 1] / 100, 0.001)
    o.position.set(x, y, z)
    normal.set(x, y, z).multiplyScalar(2)
    o.lookAt(normal)
    o.updateMatrix()
    m.copy(o.matrix)
    mesh.setMatrixAt(i, m)
  }
  mesh.instanceMatrix.needsUpdate = true
  return mesh
}

export default function LabGlobe({ active = true }: { active?: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  const loop = useRef<{ start: () => void; stop: () => void } | null>(null)
  const theme = useDocTheme()

  useEffect(() => {
    const el = host.current!
    const dark = theme === 'dark'
    const still = prefersReducedMotion()

    const renderer = new WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)) // 2× costs ~78% more pixels for no visible gain at this size
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%'
    el.appendChild(renderer.domElement)

    const scene = new Scene()
    const camera = new PerspectiveCamera(50, 1, 180, 1800)
    scene.add(new AmbientLight(dark ? '#38bdf8' : '#ffffff', dark ? 0.6 : 1.4))
    const left = new DirectionalLight('#ffffff', dark ? 1 : 0.8)
    left.position.set(-400, 100, 400)
    const top = new DirectionalLight('#ffffff', dark ? 1 : 0.8)
    top.position.set(-200, 500, 200)
    const point = new PointLight('#ffffff', 0.8)
    point.position.set(-200, 500, 200)
    scene.add(left, top, point)

    const arcs = [
      ...V1_ARCS.map(([order, startLat, startLng, endLat, endLng, arcAlt], i) => ({ order, startLat, startLng, endLat, endLng, arcAlt, color: V1_COLORS[i % 2] })),
      // From home: staggered so a new line leaves CDMX every moment.
      ...HOME_ROUTES.map(([endLat, endLng, arcAlt], i) => ({ order: i * 2.5, startLat: CDMX.lat, startLng: CDMX.lng, endLat, endLng, arcAlt, color: HOME_COLOR })),
    ]
    // Ring sources: every distinct arc end, fading in its arc's colour (as in v1).
    const rgb = (hex: string) => [1, 3, 5].map((k) => parseInt(hex.slice(k, k + 2), 16)).join(', ')
    const ends = arcs
      .flatMap((a) => [
        { lat: a.startLat, lng: a.startLng, color: a.color },
        { lat: a.endLat, lng: a.endLng, color: a.color },
      ])
      .filter((p, i, all) => all.findIndex((q) => q.lat === p.lat && q.lng === p.lng) === i)
    const globe = new ThreeGlobe()
      .showAtmosphere(true)
      .atmosphereColor(dark ? '#ffffff' : '#5ce1ff')
      .atmosphereAltitude(0.1)
      .arcsData(arcs)
      .arcColor('color')
      .arcAltitude('arcAlt')
      .arcDashLength(ARC_LENGTH)
      .arcDashInitialGap((d) => (d as { order: number }).order)
      .arcDashGap(15)
      .arcDashAnimateTime(still ? 0 : ARC_TIME)
      .arcStroke((d) => ((d as { color: string }).color === HOME_COLOR ? 0.5 : [0.32, 0.28, 0.3][Math.round(Math.random() * 2)]))
      .ringColor((d: object) => (t: number) => `rgba(${rgb((d as { color: string }).color)}, ${1 - t})`)
      .ringMaxRadius(3)
      .ringPropagationSpeed(3)
      .ringRepeatPeriod(ARC_TIME * ARC_LENGTH)
    const material = globe.globeMaterial() as MeshPhongMaterial
    material.color = new Color(dark ? '#062056' : '#e8f0ff')
    material.emissive = new Color(dark ? '#062056' : '#d6e4ff')
    material.emissiveIntensity = 0.1
    material.shininess = 0.9
    scene.add(globe)
    // Land dots: one instanced mesh from the precomputed cells, drawn once so its material compiles while offscreen.
    let alive = true
    loadDots().then((data) => {
      if (!alive) return
      globe.add(landDots(globe, data, dark ? '#ffffff' : '#1f7aff', dark ? 0.7 : 0.55))
      renderer.render(scene, camera)
    })
    // Every 2 s a random ~80% of the arc ends pulse, like v1.
    // Home always pulses; the rest as in v1.
    const home = { lat: CDMX.lat, lng: CDMX.lng, color: HOME_COLOR }
    const pulse = () => globe.ringsData([home, ...ends.filter((p) => (p.lat !== CDMX.lat || p.lng !== CDMX.lng) && Math.random() < 0.8)])
    if (!still) pulse()
    else globe.ringsData([home])
    const rings = still ? 0 : window.setInterval(pulse, 2000)

    // Start with Mexico in view, just left of centre, so the routes leaving CDMX show from the first frame.
    const start = globe.getCoords(20, -78, 0)
    camera.position.set(start.x, start.y, start.z).setLength(CAMERA_Z)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enablePan = false
    controls.enableZoom = false
    controls.autoRotate = !still
    controls.autoRotateSpeed = 0.6
    controls.minPolarAngle = Math.PI / 3.5
    controls.maxPolarAngle = Math.PI - Math.PI / 3
    // OrbitControls sets touch-action: none; let vertical swipes keep scrolling the page on phones.
    renderer.domElement.style.touchAction = 'pan-y'

    const resize = () => {
      const { width, height } = el.getBoundingClientRect()
      if (!width || !height) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.render(scene, camera)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    // The render loop runs only while the bento is on screen.
    let raf = 0
    // Frames are skipped while the page scrolls (the globe holds still for a moment) so the scroll stays smooth.
    const frame = () => {
      if (!isScrolling()) {
        controls.update()
        renderer.render(scene, camera)
      }
      raf = requestAnimationFrame(frame)
    }
    loop.current = {
      start: () => (raf ||= requestAnimationFrame(frame)),
      stop: () => {
        cancelAnimationFrame(raf)
        raf = 0
      },
    }

    return () => {
      loop.current?.stop()
      loop.current = null
      clearInterval(rings)
      alive = false
      ro.disconnect()
      controls.dispose()
      globe._destructor()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [theme])

  useEffect(() => {
    if (active) loop.current?.start()
    else loop.current?.stop()
  }, [active, theme])

  return <div ref={host} className="lab-globe" />
}

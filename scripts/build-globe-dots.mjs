// Precomputes the Lab globe's land dots: the same H3 cells (resolution 3) that three-globe's hexPolygons layer used
// to compute in the browser from the country polygons, stored as their centres in a small binary file. The globe
// then draws them as one instanced mesh, so the page ships neither h3-js nor the 364 KB country GeoJSON, and skips
// the long task that built the grid at runtime.
//
//   node scripts/build-globe-dots.mjs
//
// Output: src/assets/globe-dots.bin — Int16 pairs [lat, lng] × 100 (0.01° precision), little-endian.
import { readFileSync, writeFileSync } from 'node:fs'
import { polygonToCells, cellToLatLng } from 'h3-js'

const RES = 3
const geo = JSON.parse(readFileSync(new URL('./data/countries.geo.json', import.meta.url)))

const cells = new Set()
for (const f of geo.features) {
  const g = f.geometry
  const polygons = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : []
  for (const poly of polygons) for (const c of polygonToCells(poly, RES, true)) cells.add(c)
}

const out = new Int16Array(cells.size * 2)
let i = 0
for (const c of cells) {
  const [lat, lng] = cellToLatLng(c)
  out[i++] = Math.round(lat * 100)
  out[i++] = Math.round(lng * 100)
}
writeFileSync(new URL('../src/assets/globe-dots.bin', import.meta.url), Buffer.from(out.buffer))
console.log(`${cells.size} land cells → src/assets/globe-dots.bin (${out.byteLength} bytes)`)

// Stand-in for `h3-js` (see vite.config.ts). three-globe uses it to build hex layers; the Lab globe draws its land dots
// from cells precomputed by scripts/build-globe-dots.mjs instead, so none of these are ever called.
const unavailable = (): never => {
  throw new Error('h3-js is stubbed out in this build')
}
export const latLngToCell = unavailable
export const cellToLatLng = unavailable
export const cellToBoundary = unavailable
export const polygonToCells = unavailable

// Stand-in for `three/tsl` (see vite.config.ts): the names three-globe's heatmap layer reads. The Lab globe has no
// heatmap, so none of these are ever called.
const unavailable = (): never => {
  throw new Error('three/tsl is stubbed out in this build')
}
export { unavailable as Fn, unavailable as If, unavailable as uniform, unavailable as storage, unavailable as float, unavailable as Loop, unavailable as sqrt, unavailable as sin, unavailable as cos, unavailable as asin, unavailable as exp, unavailable as negate }
export const instanceIndex = undefined

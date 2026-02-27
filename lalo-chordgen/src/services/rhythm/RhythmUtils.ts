/**
 * Rhythm utilities for grouping beats and computing shared grids
 */

/** Compute the least common multiple of two integers */
function lcmTwo(a: number, b: number): number {
  if (a === 0 || b === 0) return 0
  const _g = (x: number, y: number): number => y === 0 ? x : _g(y, x % y)
  return Math.abs((a * b) / _g(a, b))
}

export function lcm(values: number[]): number {
  if (!values || values.length === 0) return 0
  return values.reduce((acc, v) => lcmTwo(acc, v), values[0])
}

/**
 * Build grouping blocks that sum to totalBeats by repeating the provided pattern.
 * Example: totalBeats=7, pattern=[2,2,3] -> [2,2,3]
 * If totalBeats=9 and pattern=[2,3] -> [2,3,2,2]
 */
export function groupIntoBlocks(totalBeats: number, pattern: number[] = [2,3]): number[] {
  if (totalBeats <= 0) return []
  if (!pattern || pattern.length === 0) return [totalBeats]

  const out: number[] = []
  let idx = 0
  let remaining = totalBeats
  while (remaining > 0) {
    const p = pattern[idx % pattern.length]
    const take = Math.min(p, remaining)
    out.push(take)
    remaining -= take
    idx++
  }
  return out
}

/**
 * Compute a common grid in beats for an array of meters (numerators).
 * E.g., meters [4,8] -> lcm(4,8)=8 which can be used as smallest repeating grid.
 */
export function lcmGridForMeters(meters: number[]): number {
  return lcm(meters.filter(m=>m>0))
}

/** Snap a beat value to nearest subdivision (e.g., 0.5 for eighth-note) */
export function snapToSubdivision(beat: number, subdivision: number): number {
  if (!subdivision || subdivision <= 0) return beat
  return Math.round(beat / subdivision) * subdivision
}

export default { groupIntoBlocks, lcmGridForMeters, snapToSubdivision }

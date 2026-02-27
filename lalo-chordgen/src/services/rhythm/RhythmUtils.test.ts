import { describe, it, expect } from 'vitest'
import { lcm, groupIntoBlocks, lcmGridForMeters, snapToSubdivision } from './RhythmUtils'

describe('RhythmUtils', () => {
  it('computes lcm of an array', () => {
    expect(lcm([4, 8])).toBe(8)
    expect(lcm([3, 4])).toBe(12)
    expect(lcm([5, 7])).toBe(35)
  })

  it('groups into pattern blocks', () => {
    expect(groupIntoBlocks(7, [2,2,3])).toEqual([2,2,3])
    expect(groupIntoBlocks(9, [2,3])).toEqual([2,3,2,2])
    expect(groupIntoBlocks(5, [3,2])).toEqual([3,2])
  })

  it('computes lcm grid for meters', () => {
    expect(lcmGridForMeters([4,8])).toBe(8)
    expect(lcmGridForMeters([3,5])).toBe(15)
  })

  it('snaps to subdivision', () => {
    expect(snapToSubdivision(1.27, 0.25)).toBeCloseTo(1.25)
    expect(snapToSubdivision(2.6, 0.5)).toBe(2.5)
  })
})

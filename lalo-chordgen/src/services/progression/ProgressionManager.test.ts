import { describe, it, expect } from 'vitest'
import { generateBassLine } from './ProgressionManager'

describe('ProgressionManager.generateBassLine', () => {
  it('generates a bass line for a simple progression', () => {
    const section: any = {
      progression: [
        { notes: [60,64,67], duration: 4 },
        { notes: [65,69,72], duration: 2 },
      ]
    }

    const bass = generateBassLine(section, { octaveBase: 36, minNote: 28, maxNote: 52 })
    // first chord duration 4 -> 4 notes, second chord 2 -> 2 notes
    expect(bass.length).toBe(6)
    // first beat should be root of first chord adjusted into bass octave
    expect(bass[0].note).toBeGreaterThanOrEqual(28)
    expect(bass[0].note).toBeLessThanOrEqual(52)
    // second chord first note should follow same constraints
    expect(bass[4].note).toBeGreaterThanOrEqual(28)
    expect(bass[4].note).toBeLessThanOrEqual(52)
  })
})

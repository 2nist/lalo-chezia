/**
 * Card Music Theory
 * Transposition and mode reharmonization logic for card-based interactions
 */

import * as MusicTheory from '../musicTheory/MusicTheoryEngine'
import type { ModeName } from '../../types/chord'

/**
 * Transpose notes to fit within a scale/mode
 * Finds the closest scale degree for each note
 */
export function transposeToMode(
  notes: number[],
  fromRoot: number,
  toRoot: number,
  mode: ModeName = 'Ionian'
): number[] {
  if (!notes || notes.length === 0) return []

  // Modal intervals starting from the root
  const modeIntervals: Record<ModeName, number[]> = {
    Ionian: [0, 2, 4, 5, 7, 9, 11],     // Major
    Dorian: [0, 2, 3, 5, 7, 9, 10],     // Minor with raised 6
    Phrygian: [0, 1, 3, 5, 7, 8, 10],   // Minor with flat 2
    Lydian: [0, 2, 4, 6, 7, 9, 11],     // Major with raised 4
    Mixolydian: [0, 2, 4, 5, 7, 9, 10], // Dominant
    Aeolian: [0, 2, 3, 5, 7, 8, 10],    // Natural minor
    Locrian: [0, 1, 3, 5, 6, 8, 10],    // Diminished
  }

  const scaleIntervals = modeIntervals[mode] || modeIntervals.Ionian
  const transpositionInterval = toRoot - fromRoot

  return notes.map(note => {
    const noteRelativeToFromRoot = (note - fromRoot + 120) % 12
    
    // Find closest scale degree
    let closestInterval = scaleIntervals[0]
    let minDistance = Math.abs(noteRelativeToFromRoot - scaleIntervals[0])

    for (const interval of scaleIntervals) {
      const distance = Math.abs(noteRelativeToFromRoot - interval)
      if (distance < minDistance) {
        minDistance = distance
        closestInterval = interval
      }
    }

    return toRoot + closestInterval + Math.floor((note - fromRoot) / 12) * 12 + transpositionInterval
  })
}

/**
 * Get notes for a mode card
 * Returns the scale degrees that define the mode
 */
export function getModeNotes(root: number, mode: ModeName): number[] {
  const modeIntervals: Record<ModeName, number[]> = {
    Ionian: [0, 2, 4, 5, 7, 9, 11],
    Dorian: [0, 2, 3, 5, 7, 9, 10],
    Phrygian: [0, 1, 3, 5, 7, 8, 10],
    Lydian: [0, 2, 4, 6, 7, 9, 11],
    Mixolydian: [0, 2, 4, 5, 7, 9, 10],
    Aeolian: [0, 2, 3, 5, 7, 8, 10],
    Locrian: [0, 1, 3, 5, 6, 8, 10],
  }

  const intervals = modeIntervals[mode]
  return intervals.map(i => root + i)
}

/**
 * Apply texture/voicing effect to notes
 */
export function applyVoicingEffect(
  notes: number[],
  voicingType: 'drop2' | 'drop3' | 'spread' | 'tight' | 'octave'
): number[] {
  if (!notes || notes.length === 0) return notes

  const sorted = [...notes].sort((a, b) => a - b)

  switch (voicingType) {
    case 'drop2':
      return MusicTheory.applyDropVoicing(sorted, 2)
    case 'drop3':
      return MusicTheory.applyDropVoicing(sorted, 3)
    case 'spread': {
      // Spread notes across wider range
      const spread: number[] = []
      sorted.forEach((note, i) => {
        spread.push(note + i * 7) // Add intervals of a perfect 5th
      })
      return spread
    }
    case 'tight': {
      // Compress into smaller range
      return sorted.slice(0, 3)
    }
    case 'octave': {
      // Double each note an octave up
      return sorted.flatMap(note => [note, note + 12])
    }
    default:
      return sorted
  }
}

/**
 * Modify duration based on modifier card
 */
export function modifyDuration(
  duration: number,
  modifier: 'half' | 'double' | 'dotted' | 'triplet'
): number {
  switch (modifier) {
    case 'half':
      return duration / 2
    case 'double':
      return duration * 2
    case 'dotted':
      return duration * 1.5
    case 'triplet':
      return (duration / 3) * 2
    default:
      return duration
  }
}

/**
 * Combine intensity from multiple cards (e.g., if mode card + intensity modifier)
 */
export function combineIntensity(values: number[]): number {
  const average = values.reduce((a, b) => a + b, 0) / values.length
  return Math.min(1, Math.max(0, average))
}

/**
 * Calculate harmonic tension based on scale degree
 * Used for determining chord selection
 */
export function getHarmonicTension(scaleDegree: 1 | 2 | 3 | 4 | 5 | 6 | 7): number {
  const tensions: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, number> = {
    1: 0.0,  // I - resolved
    2: 0.6,  // ii - tension
    3: 0.4,  // iii - mild tension
    4: 0.7,  // IV - high tension
    5: 0.8,  // V - very high tension
    6: 0.3,  // vi - mild tension
    7: 0.9,  // vii - maximum tension
  }
  return tensions[scaleDegree]
}

/**
 * Chord Quality Types
 * Defines all supported chord qualities for generation
 */
export type ChordQuality =
  | "Maj"
  | "min"
  | "dim"
  | "aug"
  | "sus2"
  | "sus4"
  | "Maj7"
  | "min7"
  | "dom7"
  | "dim7"
  | "hdim7"
  | "minMaj7"
  | "aug7"
  | "Maj9"
  | "min9"
  | "dom9";

/**
 * Chord Metadata
 * Additional information about a chord for UI and processing
 */
export interface ChordMetadata {
  root: number;
  quality: ChordQuality;
  inversion?: number;
  drop?: number;
  velocities?: number[];
  gate?: number[];
  strum?: number[];
}

/**
 * Chord Definition
 * Represents a single chord with its notes and metadata
 */
export interface Chord {
  notes: number[];
  duration: number;
  metadata?: ChordMetadata;
}

/**
 * Scale Degree
 * Represents a scale degree (1-7) for diatonic chord generation
 */
export type ScaleDegree = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Mode Names
 * Musical modes supported by the chord generator
 */
export type ModeName =
  | "Ionian"
  | "Dorian"
  | "Phrygian"
  | "Lydian"
  | "Mixolydian"
  | "Aeolian"
  | "Locrian";

/**
 * Scale Degree with Free Mode
 * 0 represents free mode (manual root selection)
 */
export type DegreeWithFree = 0 | ScaleDegree;

/**
 * Voicing Options
 * Options for chord voicing and arrangement
 */
export interface VoicingOptions {
  inversion?: number;
  drop?: number;
  octave?: number;
  range?: {
    min: number;
    max: number;
  };
}

/**
 * Chord Generation Parameters
 * Parameters for generating a chord
 */
export interface ChordGenerationParams {
  root: number;
  quality: ChordQuality;
  extension?: 7 | 9 | 11 | 13;
  voicing?: VoicingOptions;
}

/**
 * Diatonic Chord Parameters
 * Parameters for generating diatonic chords
 */
export interface DiatonicChordParams {
  keyRoot: number;
  degree: ScaleDegree;
  mode: ModeName;
  extension?: 7 | 9 | 11 | 13;
  voicing?: VoicingOptions;
}
/**
 * Section Type
 * Type of song section
 */
export type SectionType = "intro" | "verse" | "chorus" | "bridge" | "outro" | "solo" | "instrumental";

import type { Chord, ChordQuality } from "./chord";

/**
 * Section Definition
 * Represents a song section with its progression
 */
export interface Section {
  id: string;
  name: string;
  sectionType: SectionType;
  progression: Chord[];
  modeProgressions?: {
    harmony: Chord[];
    drum?: Chord[];
    other?: Chord[];
  };
  repeats: number;
  beatsPerBar: number;
  rootHeld?: number | null;
  currentNotes: number[];
  transitions: {
    type: "none" | "fade" | "jump" | "crossfade";
    length: number;
  };
}

/**
 * Progression Definition
 * Array of chords representing a chord progression
 */
export type Progression = Chord[];

/**
 * Song Form Template
 * Template for common song structures
 */
export interface SongFormTemplate {
  id: string;
  name: string;
  description: string;
  structure: string[];
  sections: Record<string, {
    name: string;
    type: SectionType;
    defaultRepeats?: number;
  }>;
}

/**
 * Progression Snapshot
 * Saved progression with metadata for later recall
 */
export interface ProgressionSnapshot {
  name: string;
  progression: Progression;
  metadata: {
    savedAt: number;
    tempo?: number;
    key?: number;
    mode?: string;
    tags?: string[];
    description?: string;
  };
}

/**
 * Pattern Definition
 * Reusable chord progression pattern
 */
export interface Pattern {
  id: string;
  name: string;
  description: string;
  degrees: string[];
  semitones: number[];
  qualities?: ChordQuality[];
  defaultQuality?: ChordQuality;
  duration: number;
  custom?: boolean;
}

/**
 * Detected Pattern
 * Pattern found in an existing progression
 */
export interface DetectedPattern {
  id: string;
  name: string;
  description: string;
  startIndex: number;
  length: number;
  root: number;
}

/**
 * Apply Pattern Options
 * Options for applying a pattern to generate a progression
 */
export interface ApplyPatternOptions {
  root?: number;
  duration?: number;
  inversion?: number;
  drop?: number;
}
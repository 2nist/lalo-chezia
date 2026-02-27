/**
 * Card Type System
 * Comprehensive type definitions for the music card system
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export enum CardCategory {
  TONE = 'tone',
  TIME = 'time',
}

export enum CardScope {
  GLOBAL = 'global',
  LOCAL = 'local',
}

export enum CardDurationType {
  /** One-shot event (e.g., cadence, transition) - plays once with fixed duration */
  INSTANCE = 'instance',
  /** Continuous state (e.g., mode, time signature) - stays active until replaced */
  CONTINUOUS = 'continuous',
}

export enum ToneCardType {
  // Global Tone
  MODE = 'mode',
  CHORD_PROGRESSION = 'chord_progression',
  MODAL_INTERCHANGE = 'modal_interchange',
  HARMONIC_FUNCTION = 'harmonic_function',
  CHORD_SUBSTITUTION = 'chord_substitution',
  VOICING = 'voicing',
  
  // Local Tone
  CADENCE = 'cadence',
  BASS_PATTERN = 'bass_pattern',
  SPECIFIC_CHORD = 'specific_chord',
  SCALE = 'scale',
}

export enum TimeCardType {
  // Global Time
  TIME_SIGNATURE = 'time_signature',
  POLYRHYTHM = 'polyrhythm',
  SUBDIVISION = 'subdivision',
  TEMPO_MODIFIER = 'tempo_modifier',
  
  // Local Time
  NOTE_GROUPING = 'note_grouping',
  CLAVE_PATTERN = 'clave_pattern',
  RHYTHMIC_PATTERN = 'rhythmic_pattern',
  DRUM_GROOVE = 'drum_groove',
}

// ============================================================================
// PARAMETER SYSTEM
// ============================================================================

export enum ParameterType {
  NUMBER = 'number',
  STRING = 'string',
  SELECT = 'select',
  BOOLEAN = 'boolean',
  NOTES = 'notes',
  CHORD_SEQUENCE = 'chord_sequence',
}

export interface ParameterDefinition {
  key: string;
  label: string;
  type: ParameterType;
  defaultValue: any;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  description?: string;
}

// ============================================================================
// MUSIC DATA STRUCTURES
// ============================================================================

export interface ToneMusicData {
  // Pitch/Harmony data
  notes?: string[];           // e.g., ['C', 'E', 'G']
  intervals?: number[];       // e.g., [0, 4, 7] (semitones from root)
  chordSequence?: string[];   // e.g., ['I', 'V', 'vi', 'IV']
  mode?: string;              // e.g., 'Dorian', 'Mixolydian'
  scale?: string[];           // e.g., ['C', 'D', 'E', 'F', 'G', 'A', 'B']
  root?: string;              // e.g., 'C', 'F#', 'Bb'
  quality?: string;           // e.g., 'major', 'minor', 'diminished'
  tensions?: string[];        // e.g., ['9', '11', '13']
  voicing?: string;           // e.g., 'closed', 'open', 'drop2'
  bassMovement?: 'stepwise' | 'leaps' | 'chromatic' | 'pedal';
}

export interface TimeMusicData {
  // Rhythm/Duration data
  meter?: string;             // e.g., '4/4', '7/8', '6/8'
  beatsPerMeasure?: number;   // e.g., 4, 7, 6
  beatDivision?: number;      // e.g., 2 (simple), 3 (compound)
  subdivision?: number;       // e.g., 16 (16th notes)
  pattern?: number[];         // e.g., [1, 0, 0, 1, 0, 1, 0, 0] (1=hit, 0=rest)
  noteGrouping?: number[];    // e.g., [2, 2, 3] for 7/8
  polyrhythm?: [number, number]; // e.g., [3, 4] for 3-against-4
  lcm?: number;              // Least common multiple for polyrhythms
  tempoBPM?: number;         // e.g., 120
  tempoModifier?: number;    // e.g., 1.0, 0.5, 2.0
  swingRatio?: number;       // e.g., 0.67 for triplet swing
  clavePattern?: string;     // e.g., 'son', 'rumba', 'bossa'
}

  // ============================================================================
  // MIDI DATA STRUCTURES
  // ============================================================================

  export interface MIDINoteData {
    pitch: number;              // MIDI note number (0-127)
    velocity: number;           // Note velocity (0-127)
    startTime: number;          // Start time in beats
    duration: number;           // Note duration in beats
  }

  export interface MIDIClipData {
    notes: MIDINoteData[];      // Array of MIDI notes
    tempo?: number;             // Tempo in BPM
    timeSignature?: [number, number]; // [numerator, denominator] e.g., [4, 4]
    lengthInBeats?: number;     // Total length of clip in beats
  }

// ============================================================================
// CARD INTERFACE
// ============================================================================

export interface Card {
  // Identity
  id: string;
  name: string;
  category: CardCategory;
  scope: CardScope;
  
  // Type-specific classification
  toneType?: ToneCardType;
  timeType?: TimeCardType;
  
  // Duration behavior
  durationType: CardDurationType;  // Required: determines if card is instant or continuous
  lengthBeats?: number;            // Optional: beat length of ONE iteration (for INSTANCE cards)
  repeatCount?: number;            // Optional: how many times pattern repeats (default: 1)
  
  // Music theory data
  toneMusicData?: ToneMusicData;
  timeMusicData?: TimeMusicData;
  
  // MIDI performance data
  midiClip?: MIDIClipData;    // Optional: actual MIDI performance data for patterns
  
  // UI metadata
  description: string;
  tags: string[];
  color?: string;
  icon?: string;
  
  // Interaction & Parameters
  parameters?: ParameterDefinition[];
  
  // Application logic reference
  applyFunction?: string;     // Reference to function name in cardMusicTheory.ts
  
  // Metadata
  source?: string;            // e.g., 'Polyrhythm Odyssey', 'Open Music Theory'
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// CARD COLLECTIONS
// ============================================================================

export interface CardCollection {
  id: string;
  name: string;
  description: string;
  cards: Card[];
  tags: string[];
}

export interface CardDatabase {
  version: string;
  cards: Card[];
  collections: CardCollection[];
}

// ============================================================================
// CARD APPLICATION
// ============================================================================

export interface CardApplicationContext {
  sourceCard?: Card;          // The card being modified (for local cards)
  globalCards: Card[];        // All active global cards
  currentKey?: string;        // Current musical key
  currentMeter?: string;      // Current time signature
}

export interface CardApplicationResult {
  success: boolean;
  modifiedData?: any;
  errors?: string[];
  warnings?: string[];
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type ToneCard = Card & {
  category: CardCategory.TONE;
  toneType: ToneCardType;
  toneMusicData: ToneMusicData;
};

export type TimeCard = Card & {
  category: CardCategory.TIME;
  timeType: TimeCardType;
  timeMusicData: TimeMusicData;
};

export type GlobalCard = Card & {
  scope: CardScope.GLOBAL;
};

export type LocalCard = Card & {
  scope: CardScope.LOCAL;
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isToneCard(card: Card): card is ToneCard {
  return card.category === CardCategory.TONE;
}

export function isTimeCard(card: Card): card is TimeCard {
  return card.category === CardCategory.TIME;
}

export function isGlobalCard(card: Card): card is GlobalCard {
  return card.scope === CardScope.GLOBAL;
}

export function isLocalCard(card: Card): card is LocalCard {
  return card.scope === CardScope.LOCAL;
}

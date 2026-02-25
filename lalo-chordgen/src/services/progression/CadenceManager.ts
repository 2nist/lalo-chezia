/**
 * Cadence Manager
 * Manages musical cadences - harmonic progressions that provide resolution and structure
 * 
 * Research-based implementation covering all major cadence types and their variations
 */

import type { Chord, ChordQuality } from "../../types/chord";
import type { Pattern, ApplyPatternOptions } from "../../types/progression";
import * as MusicTheory from "../musicTheory/MusicTheoryEngine";

// ============================================================================

/**
 * Cadence types and their characteristics
 */
export interface CadenceDefinition {
  id: string;
  name: string;
  description: string;
  type: CadenceType;
  strength: CadenceStrength;
  emotionalQuality: string;
  typicalUse: string;
  degrees: string[];
  qualities: ChordQuality[];
  semitones: number[];
  duration: number;
  resolution: string;
  voiceLeading: string[];
}

export type CadenceType = 
  | "authentic" 
  | "plagal" 
  | "half" 
  | "deceptive" 
  | "imperfect" 
  | "interrupted"
  | "modal"
  | "jazz"
  | "blues";

export type CadenceStrength = "strong" | "moderate" | "weak" | "ambiguous";

// ============================================================================

/**
 * Comprehensive cadence library based on music theory research
 */
const CADENCE_LIBRARY: CadenceDefinition[] = [
  // Authentic Cadences (V-I)
  {
    id: "perfect_authentic",
    name: "Perfect Authentic Cadence (PAC)",
    description: "The strongest cadence - V to I with both chords in root position and tonic in melody",
    type: "authentic",
    strength: "strong",
    emotionalQuality: "Final, conclusive, satisfying",
    typicalUse: "End of phrases, sections, and entire pieces",
    degrees: ["5", "1"],
    qualities: ["dom7", "Maj"],
    semitones: [7, 0],
    duration: 2,
    resolution: "Strong V-I resolution with leading tone motion",
    voiceLeading: ["7→1 (leading tone to tonic)", "4→3 (subdominant to mediant)"]
  },
  {
    id: "imperfect_authentic",
    name: "Imperfect Authentic Cadence (IAC)",
    description: "Authentic cadence with some element imperfect - inverted chords or non-tonic melody",
    type: "authentic",
    strength: "moderate",
    emotionalQuality: "Conclusive but less final than PAC",
    typicalUse: "End of phrases within a piece",
    degrees: ["5", "1"],
    qualities: ["dom7", "Maj"],
    semitones: [7, 0],
    duration: 2,
    resolution: "V-I with some inversion or non-tonic melody",
    voiceLeading: ["7→1 (leading tone to tonic)", "varied soprano motion"]
  },
  {
    id: "half_cadence",
    name: "Half Cadence (HC)",
    description: "Progression ending on V chord - creates suspension and expectation",
    type: "half",
    strength: "weak",
    emotionalQuality: "Suspenseful, questioning, incomplete",
    typicalUse: "End of phrases that need continuation",
    degrees: ["4", "5"],
    qualities: ["Maj", "dom7"],
    semitones: [5, 7],
    duration: 2,
    resolution: "Creates tension requiring continuation",
    voiceLeading: ["4→7 (subdominant to leading tone)", "varied inner voices"]
  },
  {
    id: "plagal_cadence",
    name: "Plagal Cadence (Amen Cadence)",
    description: "IV-I progression - gentle, church-like resolution",
    type: "plagal",
    strength: "moderate",
    emotionalQuality: "Gentle, peaceful, sacred",
    typicalUse: "Endings of hymns, chorales, and gentle conclusions",
    degrees: ["4", "1"],
    qualities: ["Maj", "Maj"],
    semitones: [5, 0],
    duration: 2,
    resolution: "Subdominant to tonic - smooth, gentle",
    voiceLeading: ["4→1 (subdominant to tonic)", "6→5 (mediant to submediant)"]
  },
  {
    id: "deceptive_cadence",
    name: "Deceptive Cadence (DC)",
    description: "V-vi progression - subverts expectation of V-I resolution",
    type: "deceptive",
    strength: "weak",
    emotionalQuality: "Surprising, unresolved, yearning",
    typicalUse: "Creating surprise, extending phrases, avoiding finality",
    degrees: ["5", "6"],
    qualities: ["dom7", "min"],
    semitones: [7, 9],
    duration: 2,
    resolution: "V to vi instead of expected I",
    voiceLeading: ["7→1 (leading tone to tonic)", "2→1 (supertonic to tonic)"]
  },
  {
    id: "interrupted_cadence",
    name: "Interrupted Cadence",
    description: "V-vi or V-IV - interrupts the expected authentic resolution",
    type: "interrupted",
    strength: "weak",
    emotionalQuality: "Interrupted, diverted, unexpected",
    typicalUse: "Creating dramatic turns, avoiding closure",
    degrees: ["5", "6"],
    qualities: ["dom7", "min"],
    semitones: [7, 9],
    duration: 2,
    resolution: "Interrupts expected V-I with alternative chord",
    voiceLeading: ["7→1 (leading tone to tonic)", "varied resolution"]
  },

  // Modal Cadences
  {
    id: "dorian_cadence",
    name: "Dorian Mode Cadence",
    description: "i-IV-i progression characteristic of Dorian mode",
    type: "modal",
    strength: "moderate",
    emotionalQuality: "Medieval, folk-like, bittersweet",
    typicalUse: "Modal compositions, folk music, film scores",
    degrees: ["1", "4", "1"],
    qualities: ["min", "Maj", "min"],
    semitones: [0, 5, 0],
    duration: 3,
    resolution: "Modal i-IV-i with characteristic bVI-I motion",
    voiceLeading: ["1→4→1", "b3→4→b3", "5→1→5"]
  },
  {
    id: "phrygian_cadence",
    name: "Phrygian Mode Cadence",
    description: "i-bII-i progression with characteristic half-step motion",
    type: "modal",
    strength: "moderate",
    emotionalQuality: "Exotic, Spanish, dramatic",
    typicalUse: "Flamenco, film scores, exotic passages",
    degrees: ["1", "b2", "1"],
    qualities: ["min", "Maj", "min"],
    semitones: [0, 1, 0],
    duration: 3,
    resolution: "Half-step motion from bII to i",
    voiceLeading: ["1→b2→1", "b3→b2→b3", "5→b2→5"]
  },
  {
    id: "lydian_cadence",
    name: "Lydian Mode Cadence",
    description: "I-II-I progression using the characteristic #4",
    type: "modal",
    strength: "moderate",
    emotionalQuality: "Dreamy, ethereal, floating",
    typicalUse: "Film scores, ambient music, dream sequences",
    degrees: ["1", "2", "1"],
    qualities: ["Maj", "Maj", "Maj"],
    semitones: [0, 2, 0],
    duration: 3,
    resolution: "Major II to I with #4 tension",
    voiceLeading: ["1→2→1", "3→#4→3", "5→6→5"]
  },
  {
    id: "mixolydian_cadence",
    name: "Mixolydian Mode Cadence",
    description: "I-bVII-I progression characteristic of Mixolydian",
    type: "modal",
    strength: "moderate",
    emotionalQuality: "Bluesy, rock, folk",
    typicalUse: "Rock music, folk, blues-influenced compositions",
    degrees: ["1", "b7", "1"],
    qualities: ["Maj", "Maj", "Maj"],
    semitones: [0, 10, 0],
    duration: 3,
    resolution: "bVII to I with characteristic blues feel",
    voiceLeading: ["1→b7→1", "3→b7→3", "5→b7→5"]
  },

  // Jazz Cadences
  {
    id: "jazz_ii_v_i",
    name: "Jazz ii-V-I Cadence",
    description: "The most important jazz progression - iiø7-V7-Imaj7",
    type: "jazz",
    strength: "strong",
    emotionalQuality: "Sophisticated, jazzy, resolved",
    typicalUse: "Jazz standards, sophisticated harmonies",
    degrees: ["2", "5", "1"],
    qualities: ["min7", "dom7", "Maj7"],
    semitones: [2, 7, 0],
    duration: 3,
    resolution: "Strong voice leading with tritone resolution",
    voiceLeading: ["2→1 (supertonic to tonic)", "4→3 (subdominant to mediant)", "6→5 (submediant to dominant)"]
  },
  {
    id: "jazz_v_i",
    name: "Jazz V-I Cadence",
    description: "Dominant 7th to major 7th - classic jazz resolution",
    type: "jazz",
    strength: "strong",
    emotionalQuality: "Jazzy, sophisticated, resolved",
    typicalUse: "Jazz endings, sophisticated progressions",
    degrees: ["5", "1"],
    qualities: ["dom7", "Maj7"],
    semitones: [7, 0],
    duration: 2,
    resolution: "Dominant 7th to major 7th",
    voiceLeading: ["7→1 (leading tone to tonic)", "4→3 (subdominant to mediant)"]
  },
  {
    id: "jazz_turnaround",
    name: "Jazz Turnaround",
    description: "vi-ii-V-I progression for returning to beginning",
    type: "jazz",
    strength: "moderate",
    emotionalQuality: "Circular, returning, sophisticated",
    typicalUse: "End of phrases to return to beginning",
    degrees: ["6", "2", "5", "1"],
    qualities: ["min7", "min7", "dom7", "Maj7"],
    semitones: [9, 2, 7, 0],
    duration: 4,
    resolution: "Circle of fifths motion",
    voiceLeading: ["6→5→4→3", "1→2→1→7", "3→4→5→1"]
  },
  {
    id: "jazz_deceptive",
    name: "Jazz Deceptive Cadence",
    description: "V-vi7 or V-ii7 - jazz variation of deceptive cadence",
    type: "jazz",
    strength: "weak",
    emotionalQuality: "Surprising, sophisticated",
    typicalUse: "Jazz compositions, avoiding predictable endings",
    degrees: ["5", "6"],
    qualities: ["dom7", "min7"],
    semitones: [7, 9],
    duration: 2,
    resolution: "Unexpected minor 7th chord",
    voiceLeading: ["7→1 (leading tone to tonic)", "varied resolution"]
  },

  // Blues Cadences
  {
    id: "blues_turnaround",
    name: "Blues Turnaround",
    description: "I7-IV7-I7-V7 progression for returning to top",
    type: "blues",
    strength: "moderate",
    emotionalQuality: "Bluesy, driving, circular",
    typicalUse: "End of 12-bar blues to return to beginning",
    degrees: ["1", "4", "1", "5"],
    qualities: ["dom7", "dom7", "dom7", "dom7"],
    semitones: [0, 5, 0, 7],
    duration: 4,
    resolution: "Dominant 7th chords throughout",
    voiceLeading: ["1→4→1→5", "3→4→3→2", "5→1→5→4"]
  },
  {
    id: "blues_cadence",
    name: "Blues Cadence",
    description: "IV7-I7 or V7-I7 with dominant 7th chords",
    type: "blues",
    strength: "moderate",
    emotionalQuality: "Bluesy, soulful, resolved",
    typicalUse: "Blues endings, soul music",
    degrees: ["4", "1"],
    qualities: ["dom7", "dom7"],
    semitones: [5, 0],
    duration: 2,
    resolution: "Dominant 7th to dominant 7th",
    voiceLeading: ["4→1 (subdominant to tonic)", "varied inner voices"]
  },

  // Classical Cadences
  {
    id: "imperfect_half",
    name: "Imperfect Half Cadence",
    description: "Any progression ending on V - less predictable than ii-V",
    type: "imperfect",
    strength: "weak",
    emotionalQuality: "Suspenseful, open-ended",
    typicalUse: "Classical phrases requiring continuation",
    degrees: ["1", "5"],
    qualities: ["Maj", "dom7"],
    semitones: [0, 7],
    duration: 2,
    resolution: "Tonic to dominant - creates expectation",
    voiceLeading: ["1→7 (tonic to leading tone)", "varied inner voices"]
  },
  {
    id: "perfect_half",
    name: "Perfect Half Cadence",
    description: "ii-V progression ending on dominant",
    type: "imperfect",
    strength: "weak",
    emotionalQuality: "Classical, structured, expecting continuation",
    typicalUse: "Classical music phrases",
    degrees: ["2", "5"],
    qualities: ["min", "dom7"],
    semitones: [2, 7],
    duration: 2,
    resolution: "Subdominant to dominant",
    voiceLeading: ["2→1 (supertonic to tonic)", "4→3 (subdominant to mediant)"]
  },
  {
    id: "plagal_half",
    name: "Plagal Half Cadence",
    description: "I-IV progression - gentle suspension",
    type: "imperfect",
    strength: "weak",
    emotionalQuality: "Gentle, questioning",
    typicalUse: "Gentle phrases requiring continuation",
    degrees: ["1", "4"],
    qualities: ["Maj", "Maj"],
    semitones: [0, 5],
    duration: 2,
    resolution: "Tonic to subdominant",
    voiceLeading: ["1→4 (tonic to subdominant)", "varied inner voices"]
  }
];

// ============================================================================

/**
 * Cadence analysis result
 */
export interface CadenceAnalysis {
  cadence: CadenceDefinition;
  confidence: number;
  position: number;
  strength: CadenceStrength;
  emotionalImpact: string;
  voiceLeadingNotes: string[];
  suggestions: string[];
}

// ============================================================================

/**
 * Get all cadences of a specific type
 * @param type - Cadence type to filter by
 * @returns Array of cadences of the specified type
 */
export function getCadencesByType(type: CadenceType): CadenceDefinition[] {
  return CADENCE_LIBRARY.filter(cadence => cadence.type === type);
}

/**
 * Get all cadences by strength level
 * @param strength - Cadence strength to filter by
 * @returns Array of cadences with the specified strength
 */
export function getCadencesByStrength(strength: CadenceStrength): CadenceDefinition[] {
  return CADENCE_LIBRARY.filter(cadence => cadence.strength === strength);
}

/**
 * Find cadences in a chord progression
 * @param progression - Chord progression to analyze
 * @param keyRoot - Root note of the key (MIDI number)
 * @returns Array of detected cadences with analysis
 */
export function detectCadences(
  progression: Chord[],
  keyRoot: number = 60
): CadenceAnalysis[] {
  if (!progression || progression.length < 2) {
    return [];
  }

  const analyses: CadenceAnalysis[] = [];
  const offsets = progression
    .map(chord => chord.notes[0])
    .map(note => (((note - keyRoot) % 12) + 12) % 12);

  // Check each cadence against the progression
  CADENCE_LIBRARY.forEach(cadence => {
    if (cadence.semitones.length > offsets.length) return;

    for (let start = 0; start <= offsets.length - cadence.semitones.length; start++) {
      let match = true;
      let confidence = 0;

      // Check if cadence matches at this position
      for (let i = 0; i < cadence.semitones.length; i++) {
        if (cadence.semitones[i] !== offsets[start + i]) {
          match = false;
          break;
        }
      }

      if (match) {
        // Calculate confidence based on chord qualities
        let qualityMatches = 0;
        for (let i = 0; i < cadence.degrees.length; i++) {
          const chord = progression[start + i];
          const expectedQuality = cadence.qualities[i];
          
          if (chord.metadata?.quality === expectedQuality) {
            qualityMatches++;
          }
        }
        confidence = qualityMatches / cadence.degrees.length;

        const analysis: CadenceAnalysis = {
          cadence,
          confidence,
          position: start,
          strength: cadence.strength,
          emotionalImpact: cadence.emotionalQuality,
          voiceLeadingNotes: cadence.voiceLeading,
          suggestions: generateCadenceSuggestions(cadence, confidence)
        };

        analyses.push(analysis);
      }
    }
  });

  return analyses.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Generate suggestions for a detected cadence
 * @param cadence - The detected cadence
 * @param confidence - Confidence level of the detection
 * @returns Array of suggestions for improvement or variation
 */
function generateCadenceSuggestions(cadence: CadenceDefinition, confidence: number): string[] {
  const suggestions: string[] = [];

  if (confidence < 0.8) {
    suggestions.push(`Consider using ${cadence.qualities.join('-')} chord qualities for stronger ${cadence.name}`);
  }

  if (cadence.type === "authentic" && confidence < 1.0) {
    suggestions.push("Ensure V chord has dominant 7th quality for stronger resolution");
    suggestions.push("Use root position chords for maximum strength");
  }

  if (cadence.type === "plagal") {
    suggestions.push("Use smooth voice leading: 4→1, 6→5");
    suggestions.push("Consider adding 6/4 chord before final I for Amen cadence");
  }

  if (cadence.type === "deceptive") {
    suggestions.push("Emphasize the surprise with dynamic contrast");
    suggestions.push("Consider extending with additional harmony after vi");
  }

  if (cadence.strength === "weak") {
    suggestions.push("This cadence creates suspension - ensure continuation follows");
    suggestions.push("Consider strengthening with better voice leading");
  }

  return suggestions;
}

/**
 * Apply a cadence to generate a chord progression
 * @param cadenceId - Cadence ID or name
 * @param options - Root note, duration, and voicing options
 * @returns Generated cadence progression, or null if cadence not found
 */
export function applyCadence(
  cadenceId: string,
  options: ApplyPatternOptions = {}
): Chord[] | null {
  const cadence = findCadence(cadenceId);
  if (!cadence) return null;

  const root = options.root ?? 60;
  const duration = options.duration ?? cadence.duration ?? 2;
  const inversion = options.inversion ?? 0;
  const drop = options.drop ?? 0;

  return cadence.degrees.map((degree, index) => {
    const quality = cadence.qualities[index] as ChordQuality;
    const chordRoot = root + MusicTheory.parseDegree(degree);
    let notes = MusicTheory.getChordNotes(chordRoot, quality);

    if (inversion !== 0 || drop !== 0) {
      notes = MusicTheory.applyVoicing(notes, inversion, drop);
    }

    return {
      notes,
      duration,
      metadata: {
        root: chordRoot,
        quality,
        degree: parseInt(degree) || undefined,
        inversion,
        drop,
      },
    };
  });
}

/**
 * Find a cadence by ID or name
 * @param idOrName - Cadence ID or name (case-insensitive)
 * @returns Cadence if found, undefined otherwise
 */
export function findCadence(idOrName: string): CadenceDefinition | undefined {
  const normalized = idOrName?.toLowerCase();
  if (!normalized) return undefined;

  return CADENCE_LIBRARY.find(
    cadence =>
      cadence.id.toLowerCase() === normalized ||
      cadence.name.toLowerCase() === normalized
  );
}

/**
 * Get cadence recommendations based on context
 * @param currentProgression - Current chord progression
 * @param desiredEmotion - Desired emotional quality
 * @param strengthPreference - Preferred strength level
 * @returns Array of recommended cadences
 */
export function getCadenceRecommendations(
  currentProgression: Chord[] = [],
  desiredEmotion?: string,
  strengthPreference?: CadenceStrength
): CadenceDefinition[] {
  let candidates = [...CADENCE_LIBRARY];

  // Filter by emotional quality if specified
  if (desiredEmotion) {
    candidates = candidates.filter(cadence =>
      cadence.emotionalQuality.toLowerCase().includes(desiredEmotion.toLowerCase())
    );
  }

  // Filter by strength if specified
  if (strengthPreference) {
    candidates = candidates.filter(cadence => cadence.strength === strengthPreference);
  }

  // Sort by relevance and strength
  return candidates.sort((a, b) => {
    // Prefer stronger cadences first
    const strengthOrder = { strong: 4, moderate: 3, weak: 2, ambiguous: 1 };
    const aStrength = strengthOrder[a.strength];
    const bStrength = strengthOrder[b.strength];

    if (aStrength !== bStrength) return bStrength - aStrength;

    // Then by type relevance
    const typeOrder = { authentic: 4, plagal: 3, jazz: 2, modal: 2, blues: 2, half: 1, deceptive: 1 };
    const aType = typeOrder[a.type as keyof typeof typeOrder] || 1;
    const bType = typeOrder[b.type as keyof typeof typeOrder] || 1;

    return bType - aType;
  });
}

/**
 * Analyze the strength and function of a cadence progression
 * @param cadenceProgression - Cadence chord progression
 * @param keyRoot - Root note of the key
 * @returns Detailed analysis of the cadence
 */
export function analyzeCadence(
  cadenceProgression: Chord[],
  keyRoot: number = 60
): CadenceAnalysis | null {
  const detections = detectCadences(cadenceProgression, keyRoot);
  return detections.length > 0 ? detections[0] : null;
}

/**
 * Get all available cadence types with descriptions
 * @returns Object mapping cadence types to descriptions
 */
export function getCadenceTypes(): Record<CadenceType, string> {
  return {
    authentic: "V-I progressions providing strong resolution",
    plagal: "IV-I progressions with gentle, sacred character",
    half: "Progressions ending on V, creating suspension",
    deceptive: "V-vi progressions subverting expected resolution",
    imperfect: "Variations of standard cadences with less strength",
    interrupted: "Cadences that interrupt expected resolution",
    modal: "Cadences characteristic of specific modes",
    jazz: "Jazz-influenced cadences with extended harmonies",
    blues: "Blues-style cadences with dominant 7th chords"
  };
}

/**
 * Get cadence by strength level with examples
 * @param strength - Desired strength level
 * @returns Cadences of the specified strength with examples
 */
export function getCadencesByStrengthWithExamples(strength: CadenceStrength): {
  cadences: CadenceDefinition[];
  examples: string[];
} {
  const cadences = getCadencesByStrength(strength);
  const examples = cadences.map(c => `${c.name}: ${c.degrees.join(' → ')}`);

  return { cadences, examples };
}

/**
 * Create a custom cadence from degree and quality sequences
 * @param name - Cadence name
 * @param degreeSequence - Space-separated scale degrees
 * @param qualitySequence - Space-separated chord qualities
 * @param description - Cadence description
 * @param type - Cadence type
 * @param strength - Cadence strength
 * @returns Created cadence definition
 */
export function createCustomCadence(
  name: string,
  degreeSequence: string,
  qualitySequence: string,
  description: string,
  type: CadenceType,
  strength: CadenceStrength
): CadenceDefinition | null {
  if (!name || !degreeSequence || !qualitySequence) return null;

  const degrees = degreeSequence.trim().split(/\s+/);
  const qualities = qualitySequence.trim().split(/\s+/);

  if (degrees.length !== qualities.length || degrees.length < 2) return null;

  const semitones = degrees.map(degree => MusicTheory.parseDegree(degree));

  return {
    id: `custom_${name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
    name,
    description,
    type,
    strength,
    emotionalQuality: "Custom",
    typicalUse: "User-defined",
    degrees,
    qualities: qualities as ChordQuality[],
    semitones,
    duration: degrees.length,
    resolution: "Custom resolution",
    voiceLeading: ["Custom voice leading"]
  };
}

/**
 * Get cadence statistics for educational purposes
 * @returns Statistics about cadence types and their characteristics
 */
export function getCadenceStatistics() {
  const stats = {
    totalCadences: CADENCE_LIBRARY.length,
    byType: {} as Record<CadenceType, number>,
    byStrength: {} as Record<CadenceStrength, number>,
    averageDuration: 0,
    mostCommonType: "",
    strongestCadences: [] as CadenceDefinition[]
  };

  // Count by type
  CADENCE_LIBRARY.forEach(cadence => {
    stats.byType[cadence.type] = (stats.byType[cadence.type] || 0) + 1;
    stats.byStrength[cadence.strength] = (stats.byStrength[cadence.strength] || 0) + 1;
  });

  // Calculate average duration
  stats.averageDuration = CADENCE_LIBRARY.reduce((sum, c) => sum + c.duration, 0) / CADENCE_LIBRARY.length;

  // Find most common type
  stats.mostCommonType = Object.entries(stats.byType).reduce((a, b) => 
    stats.byType[a as CadenceType] > stats.byType[b[0] as CadenceType] ? a : b[0]
  )[0] as CadenceType;

  // Find strongest cadences
  stats.strongestCadences = CADENCE_LIBRARY.filter(c => c.strength === "strong");

  return stats;
}
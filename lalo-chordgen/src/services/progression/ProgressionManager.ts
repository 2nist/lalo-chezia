/**
 * Progression Manager
 * Manages song sections, progressions, pattern detection, and pattern library
 * 
 * Simplified version based on M4LProg implementation
 */

import type { 
  Pattern, 
  DetectedPattern, 
  ApplyPatternOptions,
  Section,
  ProgressionSnapshot,
  SongFormTemplate,
  SectionType,
} from "../../types/progression";
import type {
  ArrangementBlock,
  ModeId
} from "../../types/arrangement";
import type { Chord, ChordQuality } from "../../types/chord";
import type { 
  DegreeWithFree, 
  ModeName, 
  VoicingOptions 
} from "../../types/chord";
import * as MusicTheory from "../musicTheory/MusicTheoryEngine";

// ============================================================================

/**
 * Built-in pattern library
 * Common chord progressions used across musical genres
 */
const DEFAULT_PATTERNS: Pattern[] = [
  {
    id: "pop_1-5-6-4",
    name: "I-V-vi-IV (Pop Cadence)",
    description: "Classic pop progression with a hopeful resolution",
    degrees: ["1", "5", "6", "4"],
    qualities: ["Maj", "Maj", "min", "Maj"],
    semitones: [0, 7, 9, 5],
    duration: 4,
  },
  {
    id: "sensitive_vi-iv-i-v",
    name: "vi-IV-I-V (Sensitive Loop)",
    description: "Emotionally charged loop used in ballads",
    degrees: ["6", "4", "1", "5"],
    qualities: ["min", "Maj", "Maj", "Maj"],
    semitones: [9, 5, 0, 7],
    duration: 4,
  },
  {
    id: "50s_i-vi-ii-v",
    name: "I-vi-ii-V (50s Turnaround)",
    description: "Jazz/blues turnaround popular in classic progressions",
    degrees: ["1", "6", "2", "5"],
    qualities: ["Maj", "min", "min", "Maj"],
    semitones: [0, 9, 2, 7],
    duration: 4,
  },
  {
    id: "jazz_ii-v-i",
    name: "ii-V-I (Jazz Cadence)",
    description: "The most common progression in jazz",
    degrees: ["2", "5", "1"],
    qualities: ["min7", "dom7", "Maj7"],
    semitones: [2, 7, 0],
    duration: 4,
  },
  {
    id: "blues_12bar",
    name: "I-IV-I-V (12-Bar Blues)",
    description: "Foundation of blues music",
    degrees: ["1", "4", "1", "5"],
    qualities: ["dom7", "dom7", "dom7", "dom7"],
    semitones: [0, 5, 0, 7],
    duration: 4,
  },
  {
    id: "andalusian_cadence",
    name: "vi-V-IV-III (Andalusian)",
    description: "Descending progression common in flamenco",
    degrees: ["6", "5", "4", "3"],
    qualities: ["min", "Maj", "Maj", "Maj"],
    semitones: [9, 7, 5, 4],
    duration: 4,
  },
  {
    id: "circle_of_fifths",
    name: "vi-ii-V-I (Circle Progression)",
    description: "Follows the circle of fifths",
    degrees: ["6", "2", "5", "1"],
    qualities: ["min7", "min7", "dom7", "Maj7"],
    semitones: [9, 2, 7, 0],
    duration: 4,
  },
];

// ============================================================================

/**
 * Create an empty section with default values
 * @param name - Section name (e.g., "Verse 1", "Chorus")
 * @returns New empty section
 */
export function createEmptySection(name: string = "New Section"): Section {
  return {
    id: crypto.randomUUID(),
    name,
    sectionType: "verse",
    progression: [],
    modeProgressions: {
      harmony: [],
    },
    repeats: 1,
    beatsPerBar: 4,
    rootHeld: null,
    currentNotes: [],
    transitions: { type: "none", length: 2 },
  };
}

/**
 * Deep clone a section (for immutable updates)
 * @param section - Section to clone
 * @returns Cloned section
 */
export function cloneSection(section: Section): Section {
  const harmonyProgression = cloneProgression(section.progression);
  const modeProgressions = section.modeProgressions || { harmony: [], drum: [], other: [] };
  return {
    id: section.id,
    name: section.name,
    sectionType: section.sectionType,
    progression: harmonyProgression,
    modeProgressions: {
      harmony: cloneProgression(modeProgressions.harmony || harmonyProgression),
      drum: cloneProgression(modeProgressions.drum || []),
      other: cloneProgression(modeProgressions.other || []),
    },
    rootHeld: section.rootHeld,
    repeats: section.repeats || 1,
    beatsPerBar: section.beatsPerBar || 4,
    currentNotes: Array.isArray(section.currentNotes)
      ? [...section.currentNotes]
      : [],
    transitions: { ...section.transitions },
  };
}

/**
 * Deep clone a progression (for immutable updates)
 * @param progression - Progression to clone
 * @returns Cloned progression
 */
export function cloneProgression(progression: Chord[] = []): Chord[] {
  return progression.map((chord) => ({
    notes: Array.isArray(chord.notes) ? [...chord.notes] : [],
    duration: chord.duration,
    metadata: chord.metadata ? { ...chord.metadata } : undefined,
  }));
}

/**
 * Flatten sections with repeats into a single progression
 * Expands each section's progression according to its repeat count
 * @param sections - Array of sections to flatten
 * @returns Flattened progression with all repeats expanded
 */
export function flattenSectionsWithRepeats(sections: Section[]): Chord[] {
  return sections.flatMap((section) => {
    const repeatCount = section.repeats || 1;
    return Array(repeatCount).fill(section.progression).flat();
  });
}

// ============================================================================

/**
 * Detect known patterns in an existing progression
 * Analyzes the root note intervals to find matching pattern signatures
 *
 * @param progression - Chord progression to analyze
 * @param keyRoot - Root note of the key (MIDI number)
 * @returns Array of detected patterns with their positions
 */
export function detectPatterns(
  progression: Chord[],
  keyRoot?: number,
): DetectedPattern[] {
  const minNote = options.minNote ?? 28 // E1
  const maxNote = options.maxNote ?? 52 // E3
  const octaveBase = options.octaveBase ?? 36 // C2 as target octave
  const modeName = (options as any).mode ?? 'Ionian'

  const out: { timeBeat: number; note: number }[] = []
  let cursor = 0

  const prog = section.progression || []
  if (prog.length === 0) return out

  // helper: build scale notes across octave range for a given keyRoot
  const buildScaleRange = (keyRoot: number) => {
    const baseScale = MusicTheory.getScaleNotes(keyRoot, modeName)
    const list: number[] = []
    // cover several octaves around octaveBase
    for (let o = -3; o <= 3; o++) {
      for (const n of baseScale) {
        list.push(n + o * 12)
      }
    }
    // filter into desired range
    return list.filter(n => n >= minNote && n <= maxNote).sort((a,b)=>a-b)
  }

  for (let idx = 0; idx < prog.length; idx++) {
    const chord = prog[idx]
    const dur = Math.max(1, Math.round(chord.duration || 1))
    const root = (chord.notes && chord.notes[0]) || (chord.metadata && chord.metadata.root) || 60

    // target bass root in desired octave
    let rootBass = root
    while (rootBass > octaveBase + 12) rootBass -= 12
    while (rootBass < octaveBase) rootBass += 12
    rootBass = Math.max(minNote, Math.min(maxNote, rootBass))

    // determine next chord root target
    let nextRootBass: number | null = null
    if (idx < prog.length - 1) {
      const next = prog[idx+1]
      const nr = (next.notes && next.notes[0]) || (next.metadata && next.metadata.root) || null
      if (nr !== null) {
        let nrBass = nr
        while (nrBass > octaveBase + 12) nrBass -= 12
        while (nrBass < octaveBase) nrBass += 12
        nrBass = Math.max(minNote, Math.min(maxNote, nrBass))
        nextRootBass = nrBass
      }
    }

    // build a scale list for this chord's key
    const scaleList = buildScaleRange(root)
    if (scaleList.length === 0) {
      // fallback to simple pattern
      for (let i = 0; i < dur; i++) {
        const note = i % 2 === 0 ? rootBass : Math.min(maxNote, rootBass + 7)
        out.push({ timeBeat: cursor + i, note })
      }
      cursor += dur
      continue
    }

    // find nearest scale index to rootBass
    const nearestIndex = (arr: number[], val: number) => {
      let best = 0; let bestDiff = Infinity
      arr.forEach((v,i)=>{ const d = Math.abs(v-val); if (d < bestDiff){ bestDiff = d; best = i } })
      return best
    }

    const startIdx = nearestIndex(scaleList, rootBass)
    const targetIdx = nextRootBass !== null ? nearestIndex(scaleList, nextRootBass) : null

    for (let i = 0; i < dur; i++) {
      let note: number
      if (i === 0) {
        note = scaleList[startIdx]
      } else if (targetIdx !== null) {
        const steps = dur - 1
        const stepDir = targetIdx > startIdx ? 1 : -1
        const step = Math.round((i) * Math.abs(targetIdx - startIdx) / Math.max(1, steps))
        const idxPick = Math.max(0, Math.min(scaleList.length - 1, startIdx + stepDir * step))
        note = scaleList[idxPick]
      } else {
        // no target: alternate root and nearby passing tones
        if (i % 2 === 0) note = scaleList[startIdx]
        else note = Math.min(maxNote, scaleList[startIdx] + 7)
      }
      out.push({ timeBeat: cursor + i, note })
    }

    cursor += dur
  }

  return out
  definitions.forEach((pattern) => {
    if (!Array.isArray(pattern.semitones) || pattern.semitones.length === 0) {
      return;
    }

    const signature = pattern.semitones;

    // Pattern can't be longer than progression
    if (signature.length > offsets.length) {
      return;
    }

    // Sliding window to find pattern matches
    for (let start = 0; start <= offsets.length - signature.length; start++) {
      let match = true;

      // Check if pattern matches at this position
      for (let i = 0; i < signature.length; i++) {
        if (signature[i] !== offsets[start + i]) {
          match = false;
          break;
        }
      }

      if (match) {
        matches.push({
          id: pattern.id,
          name: pattern.name,
          description: pattern.description,
          startIndex: start,
          length: signature.length,
          root: baseRoot,
        });
      }
    }
  });

  return matches;
}

// ============================================================================

/**
 * Get all available pattern definitions (built-in + custom)
 * @param customPatterns - Optional array of user-created patterns
 * @returns Combined array of all patterns
 */
export function getPatternDefinitions(
  customPatterns: Pattern[] = [],
): Pattern[] {
  return [...DEFAULT_PATTERNS, ...customPatterns];
}

/**
 * Find a pattern by ID or name
 * @param idOrName - Pattern ID or name (case-insensitive)
 * @param customPatterns - Optional custom patterns to search
 * @returns Pattern if found, undefined otherwise
 */
export function findPattern(
  idOrName: string,
  customPatterns: Pattern[] = [],
): Pattern | undefined {
  const normalized = idOrName?.toLowerCase();
  if (!normalized) return undefined;

  return getPatternDefinitions(customPatterns).find(
    (pattern) =>
      pattern.id.toLowerCase() === normalized ||
      pattern.name.toLowerCase() === normalized,
  );
}

/**
 * Apply a pattern to generate a chord progression
 * Converts scale degrees to actual MIDI notes based on root
 *
 * @param patternId - Pattern ID or name
 * @param options - Root note, duration, and voicing options
 * @param customPatterns - Optional custom patterns
 * @returns Generated progression, or null if pattern not found
 */
export function applyPattern(
  patternId: string,
  options: ApplyPatternOptions = {},
  customPatterns: Pattern[] = [],
): Chord[] | null {
  const pattern = findPattern(patternId, customPatterns);
  if (!pattern) return null;

  const root = options.root ?? 60; // Default to middle C
  const duration = options.duration ?? pattern.duration ?? 4;
  const inversion = options.inversion ?? 0;
  const drop = options.drop ?? 0;

  return pattern.degrees.map((degree, index) => {
    // Get chord quality for this degree
    const quality = (pattern.qualities?.[index] ||
      pattern.defaultQuality ||
      "Maj") as ChordQuality;

    // Calculate chord root from pattern root + scale degree offset
    const chordRoot = root + MusicTheory.parseDegree(degree);

    // Generate chord notes
    let notes = MusicTheory.getChordNotes(chordRoot, quality);

    // Apply voicing if specified
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
 * Create a custom pattern from a sequence of scale degrees
 * @param name - Pattern name
 * @param degreeSequence - Space-separated scale degrees (e.g., "1 5 6 4")
 * @param description - Optional description
 * @returns Created pattern, or null if invalid
 */
export function saveCustomPattern(
  name: string,
  degreeSequence: string,
  description: string = "",
): Pattern | null {
  if (!name || !degreeSequence) return null;

  // Parse degree sequence
  const degrees = degreeSequence
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0);

  // Need at least 2 chords for a pattern
  if (degrees.length < 2) return null;

  // Convert degrees to semitones
  const semitones = degrees.map((degree) => MusicTheory.parseDegree(degree));

  // Generate unique ID
  const id = `custom_${name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;

  const pattern: Pattern = {
    id,
    name,
    description,
    degrees,
    semitones,
    custom: true,
    duration: 4,
  };

  return pattern;
}

// ============================================================================

/**
 * Create a snapshot of a progression for saving
 * @param name - Snapshot name
 * @param progression - Progression to save
 * @param metadata - Optional metadata (tags, tempo, key)
 * @returns Progression snapshot
 */
export function createProgressionSnapshot(
  name: string,
  progression: Chord[],
  metadata: Partial<ProgressionSnapshot["metadata"]> = {},
): ProgressionSnapshot {
  return {
    name,
    progression: cloneProgression(progression),
    metadata: {
      savedAt: Date.now(),
      ...metadata,
    },
  };
}

/**
 * Load a progression from a snapshot
 * @param snapshot - Snapshot to load from
 * @returns Cloned progression from snapshot
 */
export function loadProgressionFromSnapshot(
  snapshot: ProgressionSnapshot,
): Chord[] {
  return cloneProgression(snapshot.progression);
}

// ============================================================================

/**
 * Get progression duration in beats
 * @param progression - Progression to calculate
 * @returns Total duration in beats
 */
export function getProgressionDuration(progression: Chord[]): number {
  return progression.reduce((total, chord) => total + chord.duration, 0);
}

/**
 * Transpose a progression to a new root
 * @param progression - Progression to transpose
 * @param semitones - Semitones to transpose (positive = up, negative = down)
 * @returns Transposed progression
 */
export function transposeProgression(
  progression: Chord[],
  semitones: number,
): Chord[] {
  return progression.map((chord) => ({
    ...chord,
    notes: chord.notes.map((note) => note + semitones),
    metadata: chord.metadata
      ? {
          ...chord.metadata,
          root: chord.metadata.root
            ? chord.metadata.root + semitones
            : undefined,
        }
      : undefined,
  }));
}

/**
 * Get a human-readable analysis of a chord
 * @param chord - Chord to analyze
 * @returns Analysis string (e.g., "CMaj7 - Root Position")
 */
export function analyzeChord(chord: Chord): string {
  if (!chord.metadata) {
    return `${chord.notes.length} notes`;
  }

  const { root, quality, inversion, drop } = chord.metadata;

  if (!root || !quality) {
    return `${chord.notes.length} notes`;
  }

  const chordName = MusicTheory.getChordName(root, quality);
  const voicingDesc = MusicTheory.getVoicingDescription(
    inversion || 0,
    drop || 0,
  );

  return `${chordName} - ${voicingDesc}`;
}

/**
 * Validate a progression for common issues
 * @param progression - Progression to validate
 * @returns Array of warning messages (empty if valid)
 */
export function validateProgression(progression: Chord[]): string[] {
  const warnings: string[] = [];

  if (progression.length === 0) {
    warnings.push("Progression is empty");
    return warnings;
  }

  // Check for chords with no notes
  progression.forEach((chord, index) => {
    if (!chord.notes || chord.notes.length === 0) {
      warnings.push(`Chord ${index + 1} has no notes`);
    }
    if (chord.duration <= 0) {
      warnings.push(`Chord ${index + 1} has invalid duration`);
    }
  });

  // Check for extreme note ranges
  const allNotes = progression.flatMap((chord) => chord.notes);
  const minNote = Math.min(...allNotes);
  const maxNote = Math.max(...allNotes);

  if (minNote < 21) {
    // Below A0
    warnings.push("Contains notes below piano range (A0)");
  }
  if (maxNote > 108) {
    // Above C8
    warnings.push("Contains notes above piano range (C8)");
  }

  return warnings;
}

// ============================================================================

/**
 * Get all available song form templates
 * @returns Array of song form templates
 */
export function getSongFormTemplates(): SongFormTemplate[] {
  return [
    {
      id: "abab",
      name: "Verse-Chorus Form",
      description: "Classic pop/rock structure",
      structure: ["A", "B", "A", "B"],
      sections: {
        A: { name: "Verse", type: "verse" },
        B: { name: "Chorus", type: "chorus" },
      },
    },
    {
      id: "verse-chorus-bridge",
      name: "Standard Pop",
      description: "Verse-Chorus-Bridge structure",
      structure: ["A", "B", "A", "B", "C", "B"],
      sections: {
        A: { name: "Verse", type: "verse" },
        B: { name: "Chorus", type: "chorus" },
        C: { name: "Bridge", type: "bridge" },
      },
    },
    {
      id: "12bar-blues",
      name: "12-Bar Blues",
      description: "Classic blues progression structure",
      structure: ["A", "A", "B", "A"],
      sections: {
        A: { name: "Blues A", type: "verse", defaultRepeats: 2 },
        B: { name: "Blues B", type: "verse", defaultRepeats: 1 },
      },
    },
  ];
}

/**
 * Create a section from a template definition
 * @param templateSection - Template section definition
 * @param key - Musical key root (MIDI note)
 * @param patternId - Optional pattern ID to apply
 * @returns New section with progression
 */
export function createSectionFromTemplate(
  templateSection: { name: string; type: SectionType; defaultRepeats?: number },
  key: number = 60,
  patternId?: string,
): Section {
  let progression: Chord[] = [];

  // If a pattern is specified, apply it
  if (patternId) {
    const patternProgression = applyPattern(patternId, { root: key });
    if (patternProgression) {
      progression = patternProgression;
    }
  }

  return {
    id: crypto.randomUUID(),
    name: templateSection.name,
    sectionType: templateSection.type,
    progression,
    modeProgressions: {
      harmony: progression,
      drum: [],
      other: [],
    },
    repeats: templateSection.defaultRepeats || 1,
    beatsPerBar: 4,
    rootHeld: null,
    currentNotes: [],
    transitions: { type: "none", length: 2 },
  };
}

/**
 * Create sections and arrangement blocks from a song form template
 * @param templateId - Template ID (e.g., "abab", "12bar-blues")
 * @param options - Options for creation
 * @returns Object with created sections and arrangement blocks
 */
export function createArrangementFromTemplate(
  templateId: string,
  options: {
    key?: number;
    patternId?: string;
    startBeat?: number;
  } = {},
): {
  sections: Section[];
  blocks: ArrangementBlock[];
} {
  const templates = getSongFormTemplates();
  const template = templates.find((t) => t.id === templateId);

  if (!template) {
    console.warn(`Song form template "${templateId}" not found`);
    return { sections: [], blocks: [] };
  }

  const key = options.key ?? 60;
  const startBeat = options.startBeat ?? 0;
  const sections: Section[] = [];
  const blocks: ArrangementBlock[] = [];

  // Track which sections we've created (to reuse for repeated letters)
  const sectionCache = new Map<string, Section>();
  let currentBeat = startBeat;

  for (const sectionKey of template.structure) {
    const templateSection = template.sections[sectionKey];

    if (!templateSection) {
      console.warn(`Section "${sectionKey}" not found in template`);
      continue;
    }

    let section: Section;

    // Reuse section if we've already created one with this key (e.g., AABA form)
    if (sectionCache.has(sectionKey)) {
      section = cloneSection(sectionCache.get(sectionKey)!);
      section.id = crypto.randomUUID(); // New ID for the new instance
    } else {
      section = createSectionFromTemplate(
        templateSection,
        key,
        options.patternId,
      );
      sectionCache.set(sectionKey, cloneSection(section));
    }

    // Calculate section duration
    const sectionDuration = section.progression.reduce(
      (sum, chord) => sum + (chord.duration || 4),
      0,
    );
    const blockDuration = sectionDuration * (section.repeats || 1);

    // Create arrangement block
    const block: ArrangementBlock = {
      id: crypto.randomUUID(),
      sourceId: section.id,
      mode: "harmony" as ModeId,
      startBeat: currentBeat,
      lengthBeats: blockDuration,
      label: section.name,
      repeats: section.repeats,
    };

    sections.push(section);
    blocks.push(block);

    currentBeat += blockDuration;
  }

  return { sections, blocks };
}

/**
 * Get a template by ID
 * @param templateId - Template ID to find
 * @returns Template if found
 */
export function getSongFormTemplate(
  templateId: string,
): SongFormTemplate | undefined {
  const templates = getSongFormTemplates();
  return templates.find((t) => t.id === templateId);
}

/**
 * Generate a simple bass line for a section.
 * Strategy (prototype): for each chord, emit one bass note per beat.
 * - Beat 0 of chord = chord root (constrained to bass range)
 * - Beat 1 = perfect fifth above root (if available)
 * - Subsequent beats: simple passing tones (2 or 4 semitones above root)
 * Returns array of { timeBeat, note }
 */
export function generateBassLine(
  section: Section,
  options: { minNote?: number; maxNote?: number; octaveBase?: number } = {},
): { timeBeat: number; note: number }[] {
  const minNote = options.minNote ?? 28 // E1
  const maxNote = options.maxNote ?? 52 // E3
  const octaveBase = options.octaveBase ?? 36 // C2 as target octave

  const out: { timeBeat: number; note: number }[] = []
  let cursor = 0

  for (const chord of section.progression || []) {
    const dur = Math.max(1, Math.round(chord.duration || 1))
    const root = (chord.notes && chord.notes[0]) || (chord.metadata && chord.metadata.root) || 60

    // bring root into bass octave
    let rootBass = root
    while (rootBass > octaveBase + 12) rootBass -= 12
    while (rootBass < octaveBase) rootBass += 12
    rootBass = Math.max(minNote, Math.min(maxNote, rootBass))

    for (let i = 0; i < dur; i++) {
      let note: number
      if (i === 0) {
        note = rootBass
      } else if (i === 1) {
        note = Math.min(maxNote, rootBass + 7)
      } else {
        const pass = i % 2 === 0 ? 2 : 4
        note = Math.min(maxNote, rootBass + pass)
      }
      out.push({ timeBeat: cursor + i, note })
    }

    cursor += dur
  }

  return out
}
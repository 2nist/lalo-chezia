/**
 * Convert EGMD Pattern Library to Card Format
 * 
 * Reads the pre-parsed pattern_library_CORE.json and generates Card objects
 * for the lalo-chordgen card system.
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Type Definitions (matching lalo-chordgen/src/types/card.ts)
// ============================================================================

interface MIDINoteData {
  pitch: number;      // MIDI note number (0-127)
  velocity: number;   // Note velocity (0-127)
  startTime: number;  // Start time in beats
  duration: number;   // Duration in beats
}

interface MIDIClipData {
  notes: MIDINoteData[];
  tempo?: number;
  timeSignature?: [number, number];
  lengthInBeats: number;
}

interface Card {
  id: string;
  name: string;
  category: 'time';
  scope: 'local';
  timeType: 'drum_groove';
  durationType: 'instance';
  lengthBeats: number;
  repeatCount: number;
  timeMusicData: {
    pattern?: number[];
    meter?: string;
    tempoBPM?: number;
  };
  midiClip?: MIDIClipData;
  description: string;
  tags: string[];
  source: string;
  metadata?: {
    complexity: number;
    density: number;
    genre?: string;
    function?: string;
    feel?: string;
  };
}

// ============================================================================
// EGMD Pattern Library Types
// ============================================================================

interface EGMDNote {
  beat: number;
  velocity: number;
  note: number;  // MIDI note number
}

interface EGMDPattern {
  id: string;
  source_file: string;
  complexity_score: number;
  density_score: number;
  pattern: {
    beats: number;
    notes: EGMDNote[];
  };
  metadata: {
    original_tempo: number;
    time_signature: string;
    bar_count: number;
  };
  _analysis?: {
    genre_hint?: string;
    function?: string;
    feel?: string;
    usable?: boolean;
  };
}

interface PatternLibraryFile {
  metadata: {
    total_patterns: number;
    unique_patterns: number;
    exact_duplicates_removed: number;
    analysis_date: string;
  };
  layers: {
    kick: EGMDPattern[];
    snare: EGMDPattern[];
    hats_ride: EGMDPattern[];
    percussion: EGMDPattern[];
  };
}

// ============================================================================
// Drum Layer Configuration
// ============================================================================

const DRUM_LAYERS = ['kick', 'snare', 'hats_ride', 'percussion'] as const;
type DrumLayer = typeof DRUM_LAYERS[number];

const LAYER_CONFIG: Record<DrumLayer, { name: string; icon: string; color: string }> = {
  kick: { name: 'Kick', icon: '🥁', color: '#3b82f6' },
  snare: { name: 'Snare', icon: '🎯', color: '#ef4444' },
  hats_ride: { name: 'Hats/Ride', icon: '🔔', color: '#f59e0b' },
  percussion: { name: 'Percussion', icon: '🎵', color: '#8b5cf6' },
};

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Convert EGMD notes to MIDINoteData format
 * Assumes all notes have 0.1 beat duration (can be refined later)
 */
function convertNotes(egmdNotes: EGMDNote[], totalBeats: number): MIDINoteData[] {
  const maxBeat = egmdNotes.length > 0 ? Math.max(...egmdNotes.map(n => n.beat)) : 0;
  const isNormalized = maxBeat <= 1.01 && totalBeats > 1;

  // Stage 1: normalized [0..1] data -> scale to total beats
  let timeScale = isNormalized ? totalBeats : 1;

  // Stage 2: if the scaled span is still too short (e.g. ~2 beats for a 16-beat clip),
  // stretch to fill expected pattern length
  const scaledMaxBeat = maxBeat * timeScale;
  if (scaledMaxBeat > 0 && scaledMaxBeat < totalBeats * 0.75) {
    timeScale *= totalBeats / scaledMaxBeat;
  }

  return egmdNotes.map(note => ({
    pitch: note.note,
    velocity: note.velocity,
    startTime: note.beat * timeScale,
    duration: 0.1, // Default short percussion hit duration
  }));
}

/**
 * Parse time signature string (e.g., "4/4") to tuple
 */
function parseTimeSignature(ts: string): [number, number] {
  const [num, denom] = ts.split('/').map(Number);
  return [num, denom];
}

/**
 * Determine repeat count based on pattern length and function
 * - Grooves/beats: 4-8 repeats (typical loop length)
 * - Fills/transitions: 1-2 repeats (one-shot or brief)
 */
function determineRepeatCount(pattern: EGMDPattern): number {
  const func = pattern._analysis?.function || 'beat';
  const beats = pattern.pattern.beats;
  
  if (func === 'fill' || func === 'transition') {
    return beats <= 4 ? 1 : 2;
  }
  
  // For beats/grooves, aim for ~16-32 beat total length
  if (beats <= 4) return 8;
  if (beats <= 8) return 4;
  if (beats <= 16) return 2;
  return 1;
}

/**
 * Generate card name from pattern metadata
 */
function generateCardName(pattern: EGMDPattern, layer: DrumLayer): string {
  const { genre_hint, function: func, feel } = pattern._analysis || {};
  const layerName = LAYER_CONFIG[layer].name;
  
  const parts: string[] = [layerName];
  if (genre_hint) parts.push(genre_hint);
  if (func && func !== 'beat') parts.push(func);
  if (feel && feel !== 'straight') parts.push(feel);
  
  const name = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  return name;
}

/**
 * Convert EGMD pattern to Card format
 */
function convertPatternToCard(pattern: EGMDPattern, layer: DrumLayer): Card {
  const midiClip: MIDIClipData = {
    notes: convertNotes(pattern.pattern.notes, pattern.pattern.beats),
    tempo: pattern.metadata.original_tempo,
    timeSignature: parseTimeSignature(pattern.metadata.time_signature),
    lengthInBeats: pattern.pattern.beats,
  };

  const repeatCount = determineRepeatCount(pattern);
  const layerConfig = LAYER_CONFIG[layer];

  return {
    id: `egmd_${layer}_${pattern.id}`,
    name: generateCardName(pattern, layer),
    category: 'time',
    scope: 'local',
    timeType: 'drum_groove',
    durationType: 'instance',
    lengthBeats: pattern.pattern.beats,
    repeatCount,
    timeMusicData: {
      meter: pattern.metadata.time_signature,
      tempoBPM: pattern.metadata.original_tempo,
    },
    midiClip,
    description: `${layerConfig.name} pattern from ${pattern.source_file}`,
    tags: [
      'drum',
      layer,
      pattern._analysis?.genre_hint || 'generic',
      pattern._analysis?.function || 'beat',
      pattern._analysis?.feel || 'straight',
    ].filter(Boolean),
    source: `EGMD Dataset (${pattern.source_file})`,
    metadata: {
      complexity: pattern.complexity_score,
      density: pattern.density_score,
      genre: pattern._analysis?.genre_hint,
      function: pattern._analysis?.function,
      feel: pattern._analysis?.feel,
    },
  };
}

// ============================================================================
// Filtering & Selection
// ============================================================================

interface SelectionCriteria {
  minComplexity: number;
  maxComplexity: number;
  minDensity: number;
  maxDensity: number;
  requireUsable: boolean;
  patternsPerLayer: number;
}

const DEFAULT_CRITERIA: SelectionCriteria = {
  minComplexity: 0.2,
  maxComplexity: 0.8,
  minDensity: 0.3,
  maxDensity: 1.0,
  requireUsable: true,
  patternsPerLayer: 8,
};

/**
 * Filter and select best patterns from a layer
 */
function selectPatterns(
  patterns: EGMDPattern[],
  criteria: SelectionCriteria = DEFAULT_CRITERIA
): EGMDPattern[] {
  // Filter by criteria
  let filtered = patterns.filter(p => {
    if (p.complexity_score < criteria.minComplexity) return false;
    if (p.complexity_score > criteria.maxComplexity) return false;
    if (p.density_score < criteria.minDensity) return false;
    if (p.density_score > criteria.maxDensity) return false;
    if (criteria.requireUsable && p._analysis?.usable === false) return false;
    return true;
  });

  // Sort by complexity (prefer mid-range)
  const targetComplexity = (criteria.minComplexity + criteria.maxComplexity) / 2;
  filtered.sort((a, b) => {
    const diffA = Math.abs(a.complexity_score - targetComplexity);
    const diffB = Math.abs(b.complexity_score - targetComplexity);
    return diffA - diffB;
  });

  // Select diverse subset
  const selected: EGMDPattern[] = [];
  const functionCounts: Record<string, number> = {};
  
  for (const pattern of filtered) {
    if (selected.length >= criteria.patternsPerLayer) break;
    
    const func = pattern._analysis?.function || 'beat';
    const count = functionCounts[func] || 0;
    
    // Prefer diversity: max 5 of same function type
    if (count < 5) {
      selected.push(pattern);
      functionCounts[func] = count + 1;
    }
  }

  return selected;
}

// ============================================================================
// Main Conversion Logic
// ============================================================================

async function main() {
  const inputPath = path.join(
    __dirname,
    '..',
    'docs',
    'Reference',
    'e-gmd (analysis)',
    'outputs',
    'pattern_library_CORE.json'
  );

  const outputPath = path.join(
    __dirname,
    '..',
    'lalo-chordgen',
    'src',
    'data',
    'egmdDrumCards.ts'
  );

  console.log('🎵 EGMD to Card Converter');
  console.log('========================\n');
  console.log(`Reading: ${inputPath}`);

  // Read and parse pattern library
  const rawData = fs.readFileSync(inputPath, 'utf-8');
  const libraryFile: PatternLibraryFile = JSON.parse(rawData);
  const library = libraryFile.layers;

  console.log(`\nLibrary metadata:`);
  console.log(`  Total patterns analyzed: ${libraryFile.metadata.total_patterns}`);
  console.log(`  Unique patterns: ${libraryFile.metadata.unique_patterns}`);
  console.log(`  Analysis date: ${libraryFile.metadata.analysis_date}`);

  console.log(`\nPattern counts by layer:`);
  for (const layer of DRUM_LAYERS) {
    const count = library[layer]?.length || 0;
    console.log(`  ${LAYER_CONFIG[layer].icon} ${LAYER_CONFIG[layer].name}: ${count} patterns`);
  }

  // Convert patterns to cards
  const allCards: Card[] = [];
  
  console.log(`\nSelecting and converting patterns...`);
  for (const layer of DRUM_LAYERS) {
    const patterns = library[layer];
    if (!patterns || patterns.length === 0) {
      console.log(`  ⚠️  No patterns found for layer: ${layer}`);
      continue;
    }

    const selected = selectPatterns(patterns);
    console.log(`  ${LAYER_CONFIG[layer].icon} ${layer}: selected ${selected.length} patterns`);

    const cards = selected.map(p => convertPatternToCard(p, layer));
    allCards.push(...cards);
  }

  console.log(`\n✅ Total cards generated: ${allCards.length}`);

  // Generate TypeScript output with proper enum references
  const cardsCode = allCards.map((card, idx) => {
    const midiClipJson = JSON.stringify(card.midiClip, null, 4).replace(/\n/g, '\n    ');
    const timeMusicDataJson = JSON.stringify(card.timeMusicData, null, 4).replace(/\n/g, '\n    ');
    const metadataJson = JSON.stringify(card.metadata, null, 4).replace(/\n/g, '\n    ');
    const tagsJson = JSON.stringify(card.tags);
    
    return `  {
    id: '${card.id}',
    name: '${card.name}',
    category: CardCategory.TIME,
    scope: CardScope.LOCAL,
    timeType: TimeCardType.DRUM_GROOVE,
    durationType: CardDurationType.INSTANCE,
    lengthBeats: ${card.lengthBeats},
    repeatCount: ${card.repeatCount},
    timeMusicData: ${timeMusicDataJson},
    midiClip: ${midiClipJson},
    description: \`${card.description}\`,
    tags: ${tagsJson},
    source: '${card.source}',
    metadata: ${metadataJson},
  }`;
  }).join(',\n');

  const output = `/**
 * EGMD Drum Cards
 * Auto-generated from pattern_library_CORE.json
 * Generated: ${new Date().toISOString()}
 */

import {
  Card,
  CardCategory,
  CardScope,
  CardDurationType,
  TimeCardType,
} from '../types/card';

export const egmdDrumCards: Card[] = [
${cardsCode}
];
`;

  fs.writeFileSync(outputPath, output, 'utf-8');
  console.log(`\n✅ Wrote cards to: ${outputPath}`);
  
  // Print summary statistics
  console.log('\n📊 Statistics:');
  const byLayer = DRUM_LAYERS.reduce((acc, layer) => {
    acc[layer] = allCards.filter(c => c.tags.includes(layer)).length;
    return acc;
  }, {} as Record<DrumLayer, number>);
  
  for (const [layer, count] of Object.entries(byLayer)) {
    const config = LAYER_CONFIG[layer as DrumLayer];
    console.log(`  ${config.icon} ${config.name}: ${count} cards`);
  }

  const avgComplexity = allCards.reduce((sum, c) => sum + (c.metadata?.complexity || 0), 0) / allCards.length;
  const avgDensity = allCards.reduce((sum, c) => sum + (c.metadata?.density || 0), 0) / allCards.length;
  console.log(`  Average complexity: ${avgComplexity.toFixed(2)}`);
  console.log(`  Average density: ${avgDensity.toFixed(2)}`);
}

// Run
main().catch(console.error);

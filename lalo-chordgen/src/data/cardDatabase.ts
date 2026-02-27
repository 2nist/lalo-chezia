/**
 * Card Database
 * Comprehensive collection of music theory cards
 */

import {
  Card,
  CardCategory,
  CardScope,
  CardDurationType,
  ToneCardType,
  TimeCardType,
  CardDatabase,
} from '../types/card';
import { egmdDrumCards } from './egmdDrumCards';

// ============================================================================
// GLOBAL TONE CARDS - MODES
// ============================================================================

const modeCards: Card[] = [
  {
    id: 'mode-ionian',
    name: 'Ionian (Major)',
    category: CardCategory.TONE,
    scope: CardScope.GLOBAL,
    toneType: ToneCardType.MODE,
    durationType: CardDurationType.CONTINUOUS, // Mode stays active until replaced
    toneMusicData: {
      mode: 'Ionian',
      intervals: [0, 2, 4, 5, 7, 9, 11],
      scale: ['1', '2', '3', '4', '5', '6', '7'],
      quality: 'major',
    },
    description: 'Bright, happy, stable. The major scale.',
    tags: ['mode', 'major', 'diatonic', 'stable'],
    source: 'Open Music Theory',
    difficulty: 'beginner',
  },
  {
    id: 'mode-dorian',
    name: 'Dorian',
    category: CardCategory.TONE,
    scope: CardScope.GLOBAL,
    toneType: ToneCardType.MODE,
    durationType: CardDurationType.CONTINUOUS,
    toneMusicData: {
      mode: 'Dorian',
      intervals: [0, 2, 3, 5, 7, 9, 10],
      scale: ['1', '2', '♭3', '4', '5', '6', '♭7'],
      quality: 'minor',
    },
    description: 'Minor with a bright 6th. Jazz, funk, rock.',
    tags: ['mode', 'minor', 'jazz', 'funk'],
    source: 'Open Music Theory',
    difficulty: 'intermediate',
  },
  {
    id: 'mode-phrygian',
    name: 'Phrygian',
    category: CardCategory.TONE,
    scope: CardScope.GLOBAL,
    toneType: ToneCardType.MODE,
    durationType: CardDurationType.CONTINUOUS,
    toneMusicData: {
      mode: 'Phrygian',
      intervals: [0, 1, 3, 5, 7, 8, 10],
      scale: ['1', '♭2', '♭3', '4', '5', '♭6', '♭7'],
      quality: 'minor',
    },
    description: 'Dark, exotic, Spanish/Middle Eastern flavor.',
    tags: ['mode', 'minor', 'dark', 'exotic', 'spanish'],
    source: 'Open Music Theory',
    difficulty: 'intermediate',
  },
  {
    id: 'mode-lydian',
    name: 'Lydian',
    category: CardCategory.TONE,
    scope: CardScope.GLOBAL,
    toneType: ToneCardType.MODE,
    durationType: CardDurationType.CONTINUOUS,
    toneMusicData: {
      mode: 'Lydian',
      intervals: [0, 2, 4, 6, 7, 9, 11],
      scale: ['1', '2', '3', '#4', '5', '6', '7'],
      quality: 'major',
    },
    description: 'Dreamy, bright, elevated. Raised 4th degree.',
    tags: ['mode', 'major', 'bright', 'dreamy'],
    source: 'Open Music Theory',
    difficulty: 'intermediate',
  },
  {
    id: 'mode-mixolydian',
    name: 'Mixolydian',
    category: CardCategory.TONE,
    scope: CardScope.GLOBAL,
    toneType: ToneCardType.MODE,
    durationType: CardDurationType.CONTINUOUS,
    toneMusicData: {
      mode: 'Mixolydian',
      intervals: [0, 2, 4, 5, 7, 9, 10],
      scale: ['1', '2', '3', '4', '5', '6', '♭7'],
      quality: 'major',
    },
    description: 'Rock, blues, dominant. Major with ♭7.',
    tags: ['mode', 'major', 'rock', 'blues', 'dominant'],
    source: 'Open Music Theory',
    difficulty: 'intermediate',
  },
  {
    id: 'mode-aeolian',
    name: 'Aeolian (Natural Minor)',
    category: CardCategory.TONE,
    scope: CardScope.GLOBAL,
    toneType: ToneCardType.MODE,
    durationType: CardDurationType.CONTINUOUS,
    toneMusicData: {
      mode: 'Aeolian',
      intervals: [0, 2, 3, 5, 7, 8, 10],
      scale: ['1', '2', '♭3', '4', '5', '♭6', '♭7'],
      quality: 'minor',
    },
    description: 'Natural minor scale. Melancholic, somber.',
    tags: ['mode', 'minor', 'natural', 'melancholic'],
    source: 'Open Music Theory',
    difficulty: 'beginner',
  },
  {
    id: 'mode-locrian',
    name: 'Locrian',
    category: CardCategory.TONE,
    scope: CardScope.GLOBAL,
    toneType: ToneCardType.MODE,
    durationType: CardDurationType.CONTINUOUS,
    toneMusicData: {
      mode: 'Locrian',
      intervals: [0, 1, 3, 5, 6, 8, 10],
      scale: ['1', '♭2', '♭3', '4', '♭5', '♭6', '♭7'],
      quality: 'diminished',
    },
    description: 'Unstable, dissonant. Diminished 5th.',
    tags: ['mode', 'diminished', 'unstable', 'dissonant'],
    source: 'Open Music Theory',
    difficulty: 'advanced',
  },
];

// ============================================================================
// GLOBAL TONE CARDS - CHORD PROGRESSIONS
// ============================================================================

const progressionCards: Card[] = [
  {
    id: 'prog-pop-axis',
    name: 'Pop Axis (I-V-vi-IV)',
    category: CardCategory.TONE,
    scope: CardScope.GLOBAL,
    toneType: ToneCardType.CHORD_PROGRESSION,
    durationType: CardDurationType.INSTANCE,
    lengthBeats: 16, // 4 chords × 4 beats each = one loop
    repeatCount: 4,  // Typically repeats 4 times (= 64 beat section)
    toneMusicData: {
      chordSequence: ['I', 'V', 'vi', 'IV'],
      quality: 'major',
    },
    description: 'The most popular progression in pop music.',
    tags: ['progression', 'pop', 'I-V-vi-IV', 'four-chord'],
    source: '2nist Progressions',
    difficulty: 'beginner',
  },
  {
    id: 'prog-ii-V-I',
    name: 'Jazz ii-V-I',
    category: CardCategory.TONE,
    scope: CardScope.GLOBAL,
    toneType: ToneCardType.CHORD_PROGRESSION,
    durationType: CardDurationType.INSTANCE,
    lengthBeats: 12, // 3 chords × 4 beats = one turnaround
    repeatCount: 8,  // Often repeated multiple times in jazz
    toneMusicData: {
      chordSequence: ['ii', 'V', 'I'],
      quality: 'major',
    },
    description: 'The fundamental jazz turnaround.',
    tags: ['progression', 'jazz', 'ii-V-I', 'turnaround'],
    source: '2nist Progressions',
    difficulty: 'intermediate',
  },
  {
    id: 'prog-12bar-blues',
    name: '12-Bar Blues',
    category: CardCategory.TONE,
    scope: CardScope.GLOBAL,
    toneType: ToneCardType.CHORD_PROGRESSION,
    durationType: CardDurationType.INSTANCE,
    lengthBeats: 16,
    repeatCount: 4,
    toneMusicData: {
      chordSequence: ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'V'],
      quality: 'dominant',
    },
    description: 'Classic blues form. 12 measures.',
    tags: ['progression', 'blues', '12-bar', 'form'],
    source: '2nist Progressions',
    difficulty: 'beginner',
  },
  {
    id: 'prog-rhythm-changes',
    name: 'Rhythm Changes',
    category: CardCategory.TONE,
    scope: CardScope.GLOBAL,
    toneType: ToneCardType.CHORD_PROGRESSION,
    durationType: CardDurationType.INSTANCE,
    lengthBeats: 16,
    repeatCount: 4,
    toneMusicData: {
      chordSequence: ['I', 'VI', 'ii', 'V'],
      quality: 'major',
    },
    description: 'Based on "I Got Rhythm". Jazz standard.',
    tags: ['progression', 'jazz', 'rhythm-changes', 'gershwin'],
    source: '2nist Progressions',
    difficulty: 'intermediate',
  },
  {
    id: 'prog-pachelbel',
    name: 'Pachelbel Canon',
    category: CardCategory.TONE,
    scope: CardScope.GLOBAL,
    toneType: ToneCardType.CHORD_PROGRESSION,
    durationType: CardDurationType.INSTANCE,
    lengthBeats: 16,
    repeatCount: 4,
    toneMusicData: {
      chordSequence: ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'V'],
      quality: 'major',
    },
    description: 'Baroque progression. Descending bass line.',
    tags: ['progression', 'classical', 'pachelbel', 'baroque'],
    source: '2nist Progressions',
    difficulty: 'intermediate',
  },
  {
    id: 'prog-circle-of-fifths',
    name: 'Circle of Fifths',
    category: CardCategory.TONE,
    scope: CardScope.GLOBAL,
    toneType: ToneCardType.CHORD_PROGRESSION,
    durationType: CardDurationType.INSTANCE,
    lengthBeats: 16,
    repeatCount: 4,
    toneMusicData: {
      chordSequence: ['vi', 'ii', 'V', 'I'],
      quality: 'major',
    },
    description: 'Strong harmonic motion. Descends by fifths.',
    tags: ['progression', 'circle-of-fifths', 'jazz', 'strong'],
    source: '2nist Progressions',
    difficulty: 'intermediate',
  },
  {
    id: 'prog-I-IV-V',
    name: 'Basic I-IV-V',
    category: CardCategory.TONE,
    scope: CardScope.GLOBAL,
    toneType: ToneCardType.CHORD_PROGRESSION,
    durationType: CardDurationType.INSTANCE,
    lengthBeats: 16,
    repeatCount: 4,
    toneMusicData: {
      chordSequence: ['I', 'IV', 'V'],
      quality: 'major',
    },
    description: 'The three primary chords. Rock foundation.',
    tags: ['progression', 'basic', 'rock', 'primary'],
    source: '2nist Progressions',
    difficulty: 'beginner',
  },
];

// ============================================================================
// GLOBAL TONE CARDS - VOICINGS
// ============================================================================

const voicingCards: Card[] = [
  {
    id: 'voicing-closed',
    name: 'Closed Voicing',
    category: CardCategory.TONE,
    scope: CardScope.GLOBAL,
    toneType: ToneCardType.VOICING,
    durationType: CardDurationType.CONTINUOUS,
    toneMusicData: {
      voicing: 'closed',
    },
    description: 'Notes within an octave. Dense, full sound.',
    tags: ['voicing', 'closed', 'dense', 'full'],
    difficulty: 'beginner',
  },
  {
    id: 'voicing-open',
    name: 'Open Voicing',
    category: CardCategory.TONE,
    scope: CardScope.GLOBAL,
    toneType: ToneCardType.VOICING,
    durationType: CardDurationType.CONTINUOUS,
    toneMusicData: {
      voicing: 'open',
    },
    description: 'Notes spread beyond an octave. Spacious.',
    tags: ['voicing', 'open', 'spacious', 'spread'],
    difficulty: 'intermediate',
  },
  {
    id: 'voicing-drop2',
    name: 'Drop 2',
    category: CardCategory.TONE,
    scope: CardScope.GLOBAL,
    toneType: ToneCardType.VOICING,
    durationType: CardDurationType.CONTINUOUS,
    toneMusicData: {
      voicing: 'drop2',
    },
    description: 'Second note from top dropped an octave.',
    tags: ['voicing', 'drop2', 'jazz', 'guitar'],
    difficulty: 'intermediate',
  },
  {
    id: 'voicing-shell',
    name: 'Shell Voicing',
    category: CardCategory.TONE,
    scope: CardScope.GLOBAL,
    toneType: ToneCardType.VOICING,
    durationType: CardDurationType.CONTINUOUS,
    toneMusicData: {
      voicing: 'shell',
    },
    description: 'Root, 3rd, 7th only. Jazz piano.',
    tags: ['voicing', 'shell', 'jazz', 'minimal'],
    difficulty: 'intermediate',
  },
  {
    id: 'voicing-rootless',
    name: 'Rootless Voicing',
    category: CardCategory.TONE,
    scope: CardScope.GLOBAL,
    toneType: ToneCardType.VOICING,
    durationType: CardDurationType.CONTINUOUS,
    toneMusicData: {
      voicing: 'rootless',
    },
    description: 'No root. 3rd, 5th, 7th, extensions.',
    tags: ['voicing', 'rootless', 'jazz', 'advanced'],
    difficulty: 'advanced',
  },
];

// ============================================================================
// LOCAL TONE CARDS - CADENCES
// ============================================================================

const cadenceCards: Card[] = [
  {
    id: 'cadence-perfect-authentic',
    name: 'Perfect Authentic',
    category: CardCategory.TONE,
    scope: CardScope.LOCAL,
    toneType: ToneCardType.CADENCE,
    durationType: CardDurationType.INSTANCE, // Cadence is a one-shot ending
    lengthBeats: 8, // 2 chords × 4 beats
    repeatCount: 1,  // Cadences typically play once (ending)
    toneMusicData: {
      chordSequence: ['V', 'I'],
      quality: 'major',
    },
    description: 'V to I. Strongest resolution.',
    tags: ['cadence', 'V-I', 'resolution', 'strong'],
    source: '2nist Progressions',
    difficulty: 'beginner',
  },
  {
    id: 'cadence-plagal',
    name: 'Plagal (Amen)',
    category: CardCategory.TONE,
    scope: CardScope.LOCAL,
    toneType: ToneCardType.CADENCE,
    durationType: CardDurationType.INSTANCE,
    lengthBeats: 8,
    repeatCount: 1,  // Single ending gesture
    toneMusicData: {
      chordSequence: ['IV', 'I'],
      quality: 'major',
    },
    description: 'IV to I. "Amen" cadence.',
    tags: ['cadence', 'IV-I', 'amen', 'church'],
    source: '2nist Progressions',
    difficulty: 'beginner',
  },
  {
    id: 'cadence-half',
    name: 'Half Cadence',
    category: CardCategory.TONE,
    scope: CardScope.LOCAL,
    toneType: ToneCardType.CADENCE,
    durationType: CardDurationType.INSTANCE,
    lengthBeats: 4,
    repeatCount: 1,
    toneMusicData: {
      chordSequence: ['I', 'V'],
      quality: 'major',
    },
    description: 'Ends on V. Creates expectation.',
    tags: ['cadence', 'half', 'V', 'unresolved'],
    source: '2nist Progressions',
    difficulty: 'beginner',
  },
  {
    id: 'cadence-deceptive',
    name: 'Deceptive',
    category: CardCategory.TONE,
    scope: CardScope.LOCAL,
    toneType: ToneCardType.CADENCE,
    durationType: CardDurationType.INSTANCE,
    lengthBeats: 4,
    repeatCount: 1,
    toneMusicData: {
      chordSequence: ['V', 'vi'],
      quality: 'major',
    },
    description: 'V to vi instead of I. Surprise!',
    tags: ['cadence', 'V-vi', 'deceptive', 'surprise'],
    source: '2nist Progressions',
    difficulty: 'intermediate',
  },
  {
    id: 'cadence-phrygian',
    name: 'Phrygian Half',
    category: CardCategory.TONE,
    scope: CardScope.LOCAL,
    toneType: ToneCardType.CADENCE,
    durationType: CardDurationType.INSTANCE,
    lengthBeats: 4,
    repeatCount: 1,
    toneMusicData: {
      chordSequence: ['iv', 'V'],
      quality: 'minor',
    },
    description: 'iv to V in minor. Exotic, dark.',
    tags: ['cadence', 'phrygian', 'minor', 'exotic'],
    source: '2nist Progressions',
    difficulty: 'advanced',
  },
];

// ============================================================================
// LOCAL TONE CARDS - BASS PATTERNS & SCALES
// ============================================================================

const bassPatternCards: Card[] = [
  {
    id: 'bass-major-pentatonic',
    name: 'Major Pentatonic',
    category: CardCategory.TONE,
    scope: CardScope.LOCAL,
    toneType: ToneCardType.BASS_PATTERN,
    durationType: CardDurationType.INSTANCE,
    lengthBeats: 16,
    repeatCount: 4,
    toneMusicData: {
      intervals: [0, 2, 4, 7, 9],
      scale: ['1', '2', '3', '5', '6'],
      quality: 'major',
    },
    description: '5-note scale. Bright, safe, no avoid notes.',
    tags: ['bass', 'pentatonic', 'major', 'scale'],
    source: 'Bass Theory Reference',
    difficulty: 'beginner',
  },
  {
    id: 'bass-minor-pentatonic',
    name: 'Minor Pentatonic',
    category: CardCategory.TONE,
    scope: CardScope.LOCAL,
    toneType: ToneCardType.BASS_PATTERN,
    durationType: CardDurationType.INSTANCE,
    lengthBeats: 16,
    repeatCount: 4,
    toneMusicData: {
      intervals: [0, 3, 5, 7, 10],
      scale: ['1', '♭3', '4', '5', '♭7'],
      quality: 'minor',
    },
    description: 'Rock, blues foundation. Universal pattern.',
    tags: ['bass', 'pentatonic', 'minor', 'rock', 'blues'],
    source: 'Bass Theory Reference',
    difficulty: 'beginner',
  },
  {
    id: 'bass-blues-scale',
    name: 'Blues Scale',
    category: CardCategory.TONE,
    scope: CardScope.LOCAL,
    toneType: ToneCardType.BASS_PATTERN,
    durationType: CardDurationType.INSTANCE,
    lengthBeats: 16,
    repeatCount: 4,
    toneMusicData: {
      intervals: [0, 3, 5, 6, 7, 10],
      scale: ['1', '♭3', '4', '♭5', '5', '♭7'],
      quality: 'minor',
    },
    description: 'Minor pentatonic + ♭5. Blues essence.',
    tags: ['bass', 'blues', 'scale', 'chromaticism'],
    source: 'Bass Theory Reference',
    difficulty: 'intermediate',
  },
  {
    id: 'bass-walking',
    name: 'Walking Bass',
    category: CardCategory.TONE,
    scope: CardScope.LOCAL,
    toneType: ToneCardType.BASS_PATTERN,
    durationType: CardDurationType.INSTANCE,
    lengthBeats: 16,
    repeatCount: 4,
    toneMusicData: {
      bassMovement: 'stepwise',
    },
    description: 'Stepwise motion. Quarter note pulse.',
    tags: ['bass', 'walking', 'jazz', 'stepwise'],
    difficulty: 'intermediate',
  },
];

// ============================================================================
// GLOBAL TIME CARDS - TIME SIGNATURES
// ============================================================================

const timeSignatureCards: Card[] = [
  {
    id: 'meter-4-4',
    name: '4/4 Common Time',
    category: CardCategory.TIME,
    scope: CardScope.GLOBAL,
    timeType: TimeCardType.TIME_SIGNATURE,
    durationType: CardDurationType.CONTINUOUS, // Time signature stays active
    timeMusicData: {
      meter: '4/4',
      beatsPerMeasure: 4,
      beatDivision: 2,
      subdivision: 16,
    },
    description: 'The most common meter. Rock, pop standard.',
    tags: ['meter', '4/4', 'common', 'simple'],
    source: 'Open Music Theory',
    difficulty: 'beginner',
  },
  {
    id: 'meter-3-4',
    name: '3/4 Waltz Time',
    category: CardCategory.TIME,
    scope: CardScope.GLOBAL,
    timeType: TimeCardType.TIME_SIGNATURE,
    durationType: CardDurationType.CONTINUOUS,
    timeMusicData: {
      meter: '3/4',
      beatsPerMeasure: 3,
      beatDivision: 2,
      subdivision: 16,
    },
    description: 'Three quarter notes per measure. Waltz.',
    tags: ['meter', '3/4', 'waltz', 'simple'],
    source: 'Open Music Theory',
    difficulty: 'beginner',
  },
  {
    id: 'meter-6-8',
    name: '6/8 Compound',
    category: CardCategory.TIME,
    scope: CardScope.GLOBAL,
    timeType: TimeCardType.TIME_SIGNATURE,
    durationType: CardDurationType.CONTINUOUS,
    timeMusicData: {
      meter: '6/8',
      beatsPerMeasure: 2,
      beatDivision: 3,
      subdivision: 8,
    },
    description: 'Two dotted quarter beats. Compound feel.',
    tags: ['meter', '6/8', 'compound', 'lilting'],
    source: 'Open Music Theory',
    difficulty: 'intermediate',
  },
  {
    id: 'meter-5-4',
    name: '5/4 Asymmetric',
    category: CardCategory.TIME,
    scope: CardScope.GLOBAL,
    timeType: TimeCardType.TIME_SIGNATURE,
    durationType: CardDurationType.CONTINUOUS,
    timeMusicData: {
      meter: '5/4',
      beatsPerMeasure: 5,
      beatDivision: 2,
      noteGrouping: [3, 2],
    },
    description: '3+2 or 2+3. Famous from "Take Five".',
    tags: ['meter', '5/4', 'odd', 'asymmetric', 'jazz'],
    source: 'Odd Time Signatures',
    difficulty: 'intermediate',
  },
  {
    id: 'meter-7-8',
    name: '7/8 Balkan',
    category: CardCategory.TIME,
    scope: CardScope.GLOBAL,
    timeType: TimeCardType.TIME_SIGNATURE,
    durationType: CardDurationType.CONTINUOUS,
    timeMusicData: {
      meter: '7/8',
      beatsPerMeasure: 7,
      beatDivision: 2,
      noteGrouping: [2, 2, 3],
    },
    description: '2+2+3 or 3+2+2. Eastern European feel.',
    tags: ['meter', '7/8', 'odd', 'balkan', 'world'],
    source: 'Odd Time Signatures',
    difficulty: 'advanced',
  },
  {
    id: 'meter-9-8',
    name: '9/8 Compound Triple',
    category: CardCategory.TIME,
    scope: CardScope.GLOBAL,
    timeType: TimeCardType.TIME_SIGNATURE,
    durationType: CardDurationType.CONTINUOUS,
    timeMusicData: {
      meter: '9/8',
      beatsPerMeasure: 3,
      beatDivision: 3,
      subdivision: 8,
    },
    description: 'Three dotted quarter beats. Flowing.',
    tags: ['meter', '9/8', 'compound', 'triple'],
    source: 'Open Music Theory',
    difficulty: 'intermediate',
  },
  {
    id: 'meter-12-8',
    name: '12/8 Shuffle',
    category: CardCategory.TIME,
    scope: CardScope.GLOBAL,
    timeType: TimeCardType.TIME_SIGNATURE,
    durationType: CardDurationType.CONTINUOUS,
    timeMusicData: {
      meter: '12/8',
      beatsPerMeasure: 4,
      beatDivision: 3,
      subdivision: 8,
    },
    description: 'Four dotted quarter beats. Blues shuffle.',
    tags: ['meter', '12/8', 'compound', 'shuffle', 'blues'],
    source: 'Open Music Theory',
    difficulty: 'intermediate',
  },
];

// ============================================================================
// GLOBAL TIME CARDS - POLYRHYTHMS
// ============================================================================

const polyrhythmCards: Card[] = [
  {
    id: 'poly-3-4',
    name: '3 Against 4',
    category: CardCategory.TIME,
    scope: CardScope.GLOBAL,
    timeType: TimeCardType.POLYRHYTHM,
    durationType: CardDurationType.CONTINUOUS,
    timeMusicData: {
      polyrhythm: [3, 4],
      lcm: 12,
      subdivision: 16,
    },
    description: 'Triplets vs. 16ths. Common in jazz/fusion.',
    tags: ['polyrhythm', '3:4', 'jazz', 'fusion'],
    source: 'Polyrhythm Odyssey',
    difficulty: 'intermediate',
  },
  {
    id: 'poly-2-3',
    name: '2 Against 3 (Hemiola)',
    category: CardCategory.TIME,
    scope: CardScope.GLOBAL,
    timeType: TimeCardType.POLYRHYTHM,
    durationType: CardDurationType.CONTINUOUS,
    timeMusicData: {
      polyrhythm: [2, 3],
      lcm: 6,
      subdivision: 8,
    },
    description: 'Foundation of most hemiola patterns.',
    tags: ['polyrhythm', '2:3', 'hemiola', 'basic'],
    source: 'Polyrhythm Odyssey',
    difficulty: 'beginner',
  },
  {
    id: 'poly-3-5',
    name: '3 Against 5',
    category: CardCategory.TIME,
    scope: CardScope.GLOBAL,
    timeType: TimeCardType.POLYRHYTHM,
    durationType: CardDurationType.CONTINUOUS,
    timeMusicData: {
      polyrhythm: [3, 5],
      lcm: 15,
      subdivision: 16,
    },
    description: 'Exotic, shifting. Prog rock/metal.',
    tags: ['polyrhythm', '3:5', 'exotic', 'progressive'],
    source: 'Polyrhythm Odyssey',
    difficulty: 'advanced',
  },
  {
    id: 'poly-4-5',
    name: '4 Against 5',
    category: CardCategory.TIME,
    scope: CardScope.GLOBAL,
    timeType: TimeCardType.POLYRHYTHM,
    durationType: CardDurationType.CONTINUOUS,
    timeMusicData: {
      polyrhythm: [4, 5],
      lcm: 20,
      subdivision: 16,
    },
    description: 'Complex, progressive. Dense texture.',
    tags: ['polyrhythm', '4:5', 'complex', 'progressive'],
    source: 'Polyrhythm Odyssey',
    difficulty: 'advanced',
  },
];

// ============================================================================
// GLOBAL TIME CARDS - TEMPO MODIFIERS
// ============================================================================

const tempoModifierCards: Card[] = [
  {
    id: 'tempo-double',
    name: 'Double Time',
    category: CardCategory.TIME,
    scope: CardScope.GLOBAL,
    timeType: TimeCardType.TEMPO_MODIFIER,
    durationType: CardDurationType.CONTINUOUS,
    timeMusicData: {
      tempoModifier: 2.0,
    },
    description: 'Twice as fast. High energy.',
    tags: ['tempo', 'double', 'fast', 'energy'],
    difficulty: 'beginner',
  },
  {
    id: 'tempo-half',
    name: 'Half Time',
    category: CardCategory.TIME,
    scope: CardScope.GLOBAL,
    timeType: TimeCardType.TEMPO_MODIFIER,
    durationType: CardDurationType.CONTINUOUS,
    timeMusicData: {
      tempoModifier: 0.5,
    },
    description: 'Half speed. Heavy, groove-oriented.',
    tags: ['tempo', 'half', 'slow', 'groove'],
    difficulty: 'beginner',
  },
  {
    id: 'tempo-swing',
    name: 'Swing Feel',
    category: CardCategory.TIME,
    scope: CardScope.GLOBAL,
    timeType: TimeCardType.TEMPO_MODIFIER,
    durationType: CardDurationType.CONTINUOUS,
    timeMusicData: {
      swingRatio: 0.67,
    },
    description: 'Triplet-based swing. Jazz standard.',
    tags: ['tempo', 'swing', 'jazz', 'shuffle'],
    difficulty: 'intermediate',
  },
  {
    id: 'tempo-ritardando',
    name: 'Ritardando',
    category: CardCategory.TIME,
    scope: CardScope.GLOBAL,
    timeType: TimeCardType.TEMPO_MODIFIER,
    durationType: CardDurationType.CONTINUOUS,
    timeMusicData: {
      tempoModifier: 0.9,
    },
    description: 'Gradual slowdown. Expressive ending.',
    tags: ['tempo', 'ritardando', 'slow', 'expressive'],
    difficulty: 'beginner',
  },
];

// ============================================================================
// LOCAL TIME CARDS - RHYTHMIC PATTERNS & CLAVES
// ============================================================================

const rhythmicPatternCards: Card[] = [
  {
    id: 'clave-son',
    name: 'Son Clave (3-2)',
    category: CardCategory.TIME,
    scope: CardScope.LOCAL,
    timeType: TimeCardType.CLAVE_PATTERN,
    durationType: CardDurationType.INSTANCE,
    lengthBeats: 16,
    repeatCount: 4,
    timeMusicData: {
      pattern: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0],
      meter: '4/4',
      clavePattern: 'son',
    },
    description: 'Foundation of Afro-Cuban music. 3 then 2.',
    tags: ['clave', 'son', 'afro-cuban', 'latin'],
    difficulty: 'intermediate',
  },
  {
    id: 'clave-rumba',
    name: 'Rumba Clave (3-2)',
    category: CardCategory.TIME,
    scope: CardScope.LOCAL,
    timeType: TimeCardType.CLAVE_PATTERN,
    durationType: CardDurationType.INSTANCE,
    lengthBeats: 16,
    repeatCount: 4,
    timeMusicData: {
      pattern: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
      meter: '4/4',
      clavePattern: 'rumba',
    },
    description: 'Rumba variant. Delayed third stroke.',
    tags: ['clave', 'rumba', 'afro-cuban', 'latin'],
    difficulty: 'intermediate',
  },
  {
    id: 'rhythm-flamenco',
    name: 'Flamenco 12-Beat',
    category: CardCategory.TIME,
    scope: CardScope.LOCAL,
    timeType: TimeCardType.RHYTHMIC_PATTERN,
    durationType: CardDurationType.INSTANCE,
    lengthBeats: 16,
    repeatCount: 4,
    timeMusicData: {
      noteGrouping: [3, 3, 2, 2, 2],
      beatsPerMeasure: 12,
    },
    description: 'Spanish flamenco cycle. Bulerías pattern.',
    tags: ['flamenco', 'spanish', 'world', '12-beat'],
    source: 'Odd Time Signatures',
    difficulty: 'advanced',
  },
  {
    id: 'rhythm-syncopation',
    name: 'Off-Beat Syncopation',
    category: CardCategory.TIME,
    scope: CardScope.LOCAL,
    timeType: TimeCardType.RHYTHMIC_PATTERN,
    durationType: CardDurationType.INSTANCE,
    lengthBeats: 16,
    repeatCount: 4,
    timeMusicData: {
      pattern: [0, 1, 0, 1, 0, 1, 0, 1],
      meter: '4/4',
    },
    description: 'Emphasize the "and" beats. Funky.',
    tags: ['syncopation', 'funk', 'off-beat', 'groove'],
    difficulty: 'beginner',
  },
];

// ============================================================================
// COMBINE ALL CARDS
// ============================================================================

export const allCards: Card[] = [
  ...modeCards,
  ...progressionCards,
  ...voicingCards,
  ...cadenceCards,
  ...bassPatternCards,
  ...timeSignatureCards,
  ...polyrhythmCards,
  ...tempoModifierCards,
  ...rhythmicPatternCards,
  ...egmdDrumCards,
];

// ============================================================================
// CARD DATABASE
// ============================================================================

export const cardDatabase: CardDatabase = {
  version: '1.0.0',
  cards: allCards,
  collections: [
    {
      id: 'modes',
      name: 'Modal Collection',
      description: 'All seven modes of the major scale',
      cards: modeCards,
      tags: ['modes', 'scales', 'theory'],
    },
    {
      id: 'progressions',
      name: 'Common Progressions',
      description: 'Popular chord progressions from various genres',
      cards: progressionCards,
      tags: ['progressions', 'harmony', 'chords'],
    },
    {
      id: 'odd-meters',
      name: 'Odd Time Signatures',
      description: 'Asymmetric and complex meters',
      cards: timeSignatureCards.filter(c => c.id.includes('5-4') || c.id.includes('7-8')),
      tags: ['odd-meters', 'time-signatures', 'advanced'],
    },
  ],
};

export default cardDatabase;

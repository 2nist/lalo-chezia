/**
 * Fix cardDatabase.ts by adding durationType to all cards
 * Run this script with: npx tsx scripts/fix-card-duration-types.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(__dirname, '..', 'lalo-chordgen', 'src', 'data', 'cardDatabase.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Define patterns and their replacement durationType
const fixes: Array<{ pattern: RegExp; replacement: string }> = [
  // Modes: CONTINUOUS (stay active until replaced)
  {
    pattern: /(toneType: ToneCardType\.MODE,\s*)\n(\s*toneMusicData:)/g,
    replacement: '$1\n    durationType: CardDurationType.CONTINUOUS,\n$2',
  },
  // Chord Progressions with lengthBeats and repeatCount: INSTANCE
  {
    pattern: /(toneType: ToneCardType\.CHORD_PROGRESSION,\s*)\n(\s*lengthBeats:)/g,
    replacement: '$1\n    durationType: CardDurationType.INSTANCE,\n$2',
  },
  // Chord Progressions without lengthBeats: CONTINUOUS
  {
    pattern: /(toneType: ToneCardType\.CHORD_PROGRESSION,\s*)\n(\s*toneMusicData:)/g,
    replacement: '$1\n    durationType: CardDurationType.INSTANCE,\n    lengthBeats: 16,\n    repeatCount: 4,\n$2',
  },
  // Voicings: CONTINUOUS
  {
    pattern: /(toneType: ToneCardType\.VOICING,\s*)\n(\s*toneMusicData:)/g,
    replacement: '$1\n    durationType: CardDurationType.CONTINUOUS,\n$2',
  },
  // Cadences: INSTANCE (one-shot events)
  {
    pattern: /(toneType: ToneCardType\.CADENCE,\s*)\n(\s*lengthBeats:)/g,
    replacement: '$1\n    durationType: CardDurationType.INSTANCE,\n$2',
  },
  {
    pattern: /(toneType: ToneCardType\.CADENCE,\s*)\n(\s*toneMusicData:)/g,
    replacement: '$1\n    durationType: CardDurationType.INSTANCE,\n    lengthBeats: 4,\n    repeatCount: 1,\n$2',
  },
  // Bass Patterns: INSTANCE (looping patterns)
  {
    pattern: /(toneType: ToneCardType\.BASS_PATTERN,\s*)\n(\s*toneMusicData:)/g,
    replacement: '$1\n    durationType: CardDurationType.INSTANCE,\n    lengthBeats: 16,\n    repeatCount: 4,\n$2',
  },
  // Time Signatures: CONTINUOUS
  {
    pattern: /(timeType: TimeCardType\.TIME_SIGNATURE,\s*)\n(\s*timeMusicData:)/g,
    replacement: '$1\n    durationType: CardDurationType.CONTINUOUS,\n$2',
  },
  // Polyrhythms: CONTINUOUS
  {
    pattern: /(timeType: TimeCardType\.POLYRHYTHM,\s*)\n(\s*timeMusicData:)/g,
    replacement: '$1\n    durationType: CardDurationType.CONTINUOUS,\n$2',
  },
  // Tempo Modifiers: CONTINUOUS
  {
    pattern: /(timeType: TimeCardType\.TEMPO_MODIFIER,\s*)\n(\s*timeMusicData:)/g,
    replacement: '$1\n    durationType: CardDurationType.CONTINUOUS,\n$2',
  },
  // Clave Patterns: INSTANCE (looping)
  {
    pattern: /(timeType: TimeCardType\.CLAVE_PATTERN,\s*)\n(\s*timeMusicData:)/g,
    replacement: '$1\n    durationType: CardDurationType.INSTANCE,\n    lengthBeats: 16,\n    repeatCount: 4,\n$2',
  },
  // Rhythmic Patterns: INSTANCE (looping)
  {
    pattern: /(timeType: TimeCardType\.RHYTHMIC_PATTERN,\s*)\n(\s*timeMusicData:)/g,
    replacement: '$1\n    durationType: CardDurationType.INSTANCE,\n    lengthBeats: 16,\n    repeatCount: 4,\n$2',
  },
];

// Apply all fixes
for (const fix of fixes) {
  content = content.replace(fix.pattern, fix.replacement);
}

// Write back
fs.writeFileSync(filePath, content, 'utf-8');

console.log('✅ Fixed cardDatabase.ts - added durationType to all cards');
console.log('   - Modes, Voicings, Time Signatures, Polyrhythms, Tempo Modifiers: CONTINUOUS');
console.log('   - Progressions, Cadences, Bass Patterns, Claves, Rhythmic Patterns: INSTANCE');

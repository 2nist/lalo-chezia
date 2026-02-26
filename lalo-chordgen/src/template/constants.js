export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const KEY_TO_SEMITONE = {
  "C": 0,
  "C#/Db": 1,
  "D": 2,
  "D#/Eb": 3,
  "E": 4,
  "F": 5,
  "F#/Gb": 6,
  "G": 7,
  "G#/Ab": 8,
  "A": 9,
  "A#/Bb": 10,
  "B": 11,
};

export const KEYS_12 = Object.keys(KEY_TO_SEMITONE);

export const keyToMidi = (key, octave = 4) =>
  (KEY_TO_SEMITONE[key] ?? 0) + octave * 12;

export const ALL_MODES = [
  { name: "Ionian", brightness: "bright", emotionalQuality: "Happy, triumphant", typicalUse: "Pop, classical" },
  { name: "Dorian", brightness: "neutral", emotionalQuality: "Cool, introspective", typicalUse: "Jazz, folk, rock" },
  { name: "Phrygian", brightness: "dark", emotionalQuality: "Dark, Spanish, dramatic", typicalUse: "Flamenco, metal" },
  { name: "Lydian", brightness: "bright", emotionalQuality: "Ethereal, magical", typicalUse: "Film, jazz, prog" },
  { name: "Mixolydian", brightness: "neutral", emotionalQuality: "Laid-back, bluesy", typicalUse: "Rock, blues" },
  { name: "Aeolian", brightness: "dark", emotionalQuality: "Sad, contemplative", typicalUse: "Ballads, rock" },
  { name: "Locrian", brightness: "dark", emotionalQuality: "Unsettling, dissonant", typicalUse: "Experimental" },
];

export const SECTION_COLORS = {
  Verse: "#2d5a8e",
  Chorus: "#6b2d8e",
  Bridge: "#8e6b2d",
  "Pre-Chorus": "#2d8e6b",
  Intro: "#3d3d6b",
  Outro: "#6b3d3d",
  Hook: "#8e2d5a",
  Break: "#4a4a4a",
};

export const QUALITY_COLORS = {
  Maj: "#60c0f0",
  Maj7: "#40d0cc",
  dom7: "#f0c040",
  min: "#8080e0",
  min7: "#6060d0",
  minMaj7: "#7070b0",
  dim: "#c040c0",
  dim7: "#b030b0",
  hdim7: "#d050c0",
  aug: "#fb923c",
  aug7: "#f97316",
  sus2: "#94a3b8",
  sus4: "#78909c",
};

export const MODE_COLORS = {
  Ionian: "#60c0f0",
  Dorian: "#60d0a0",
  Phrygian: "#e06060",
  Lydian: "#f0c040",
  Mixolydian: "#80e060",
  Aeolian: "#8080e0",
  Locrian: "#c040c0",
};

export const SECTION_TYPE_OPTIONS = [
  "Intro",
  "Verse",
  "Pre-Chorus",
  "Chorus",
  "Bridge",
  "Break",
  "Hook",
  "Outro",
];

export const TEMPLATE_STORAGE_KEY = "lalo-template-canvas-v1";

const ROMAN_NUMS = ["", "I", "II", "III", "IV", "V", "VI", "VII"];

export const degreeRoman = (degree, quality) => {
  const upper = !quality || quality.startsWith("M") || quality === "dom7" || quality === "aug";
  const r = ROMAN_NUMS[degree] ?? String(degree);
  return upper ? r : r.toLowerCase();
};

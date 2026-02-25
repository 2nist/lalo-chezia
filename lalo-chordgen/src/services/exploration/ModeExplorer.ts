import { ModeName, ChordQuality } from '../../types/chord'
import { generateDiatonicChord } from '../musicTheory/MusicTheoryEngine'

export interface ModeCharacter {
  name: string
  description: string
  emotionalQuality: string
  typicalUse: string
  characteristicNote: number
  tensionLevel: 'low' | 'medium' | 'high'
  brightness: 'dark' | 'neutral' | 'bright'
}

export interface ModalProgression {
  id: string
  name: string
  description: string
  degrees: number[]
  qualities: ChordQuality[]
  mode: ModeName
  feel: string
}

export class ModeExplorer {
  private static readonly MODE_CHARACTERS: Record<ModeName, ModeCharacter> = {
    Ionian: {
      name: "Ionian (Major)",
      description: "The bright, stable foundation of Western music",
      emotionalQuality: "Happy, triumphant, resolved",
      typicalUse: "Pop, classical, film scores",
      characteristicNote: 4,
      tensionLevel: 'low',
      brightness: 'bright'
    },
    Dorian: {
      name: "Dorian",
      description: "Minor with a raised 6th - jazzy and soulful",
      emotionalQuality: "Cool, introspective, sophisticated",
      typicalUse: "Jazz, folk, rock",
      characteristicNote: 6,
      tensionLevel: 'medium',
      brightness: 'neutral'
    },
    Phrygian: {
      name: "Phrygian",
      description: "Exotic and mysterious with a flattened 2nd",
      emotionalQuality: "Dark, Spanish, dramatic",
      typicalUse: "Flamenco, metal, film scores",
      characteristicNote: 2,
      tensionLevel: 'high',
      brightness: 'dark'
    },
    Lydian: {
      name: "Lydian",
      description: "Dreamy and floating with a raised 4th",
      emotionalQuality: "Ethereal, magical, otherworldly",
      typicalUse: "Film scores, jazz, progressive rock",
      characteristicNote: 4,
      tensionLevel: 'medium',
      brightness: 'bright'
    },
    Mixolydian: {
      name: "Mixolydian",
      description: "Major with a flattened 7th - bluesy and groovy",
      emotionalQuality: "Laid-back, bluesy, rock-oriented",
      typicalUse: "Rock, blues, country",
      characteristicNote: 7,
      tensionLevel: 'medium',
      brightness: 'neutral'
    },
    Aeolian: {
      name: "Aeolian (Natural Minor)",
      description: "The standard minor mode - melancholic and introspective",
      emotionalQuality: "Sad, contemplative, emotional",
      typicalUse: "Classical, pop ballads, rock",
      characteristicNote: 6,
      tensionLevel: 'medium',
      brightness: 'dark'
    },
    Locrian: {
      name: "Locrian",
      description: "The most unstable mode with a diminished 5th",
      emotionalQuality: "Unsettling, dissonant, avant-garde",
      typicalUse: "Jazz, experimental, metal",
      characteristicNote: 5,
      tensionLevel: 'high',
      brightness: 'dark'
    }
  }

  private static readonly MODAL_PROGRESSIONS: ModalProgression[] = [
    {
      id: "dorian_i_iv_vii_iv",
      name: "Dorian Journey",
      description: "Classic Dorian progression with modal flavor",
      degrees: [1, 4, 7, 4],
      qualities: ["min", "min", "Maj", "min"],
      mode: "Dorian",
      feel: "Jazzy, soulful, sophisticated"
    },
    {
      id: "phrygian_i_ii_vii_i",
      name: "Spanish Flame",
      description: "Phrygian progression with exotic tension",
      degrees: [1, 2, 7, 1],
      qualities: ["min", "Maj", "Maj", "min"],
      mode: "Phrygian",
      feel: "Dark, Spanish, dramatic"
    },
    {
      id: "lydian_i_ii_v_i",
      name: "Dreamscape",
      description: "Lydian progression with floating quality",
      degrees: [1, 2, 5, 1],
      qualities: ["Maj", "Maj", "Maj", "Maj"],
      mode: "Lydian",
      feel: "Ethereal, magical, uplifting"
    },
    {
      id: "mixolydian_i_vii_iv_i",
      name: "Blues Highway",
      description: "Mixolydian progression with bluesy feel",
      degrees: [1, 7, 4, 1],
      qualities: ["Maj", "Maj", "Maj", "Maj"],
      mode: "Mixolydian",
      feel: "Groovy, bluesy, rock-oriented"
    },
    {
      id: "aeolian_i_vi_iv_v",
      name: "Melancholic Cycle",
      description: "Aeolian progression with emotional depth",
      degrees: [1, 6, 4, 5],
      qualities: ["min", "Maj", "Maj", "Maj"],
      mode: "Aeolian",
      feel: "Sad, contemplative, emotional"
    }
  ]

  static getModeCharacter(mode: ModeName): ModeCharacter {
    return this.MODE_CHARACTERS[mode]
  }

  static getAllModeCharacters(): ModeCharacter[] {
    return Object.values(this.MODE_CHARACTERS)
  }

  static getModalProgressions(mode?: ModeName): ModalProgression[] {
    if (mode) {
      return this.MODAL_PROGRESSIONS.filter(p => p.mode === mode)
    }
    return this.MODAL_PROGRESSIONS
  }

  static getCharacteristicChord(mode: ModeName, degree: number): string {
    const character = this.getModeCharacter(mode)
    const characteristicNote = character.characteristicNote
    
    if (degree === characteristicNote) {
      return "characteristic"
    } else if (degree === 1) {
      return "tonic"
    } else if (degree === 5) {
      return "dominant"
    }
    
    return "modal"
  }

  static getModeSuggestions(mode: ModeName): string[] {
    const character = this.getModeCharacter(mode)
    
    switch (mode) {
      case "Ionian":
        return [
          "Try adding secondary dominants for classical tension",
          "Use plagal cadences (IV-I) for a gospel feel",
          "Experiment with modal interchange for color"
        ]
      case "Dorian":
        return [
          "Use ii-V-i progressions for jazz flavor",
          "Try adding major IV chord for modal color",
          "Experiment with Dorian b2 for darker sound"
        ]
      case "Phrygian":
        return [
          "Use ♭II-I cadences for Spanish flavor",
          "Try Phrygian dominant (harmonic minor) for Middle Eastern sound",
          "Add augmented chords for exotic tension"
        ]
      case "Lydian":
        return [
          "Use major II chord for floating quality",
          "Try adding #11 to major chords",
          "Experiment with Lydian #5 for dreamy sound"
        ]
      case "Mixolydian":
        return [
          "Use ♭VII-I for rock feel",
          "Try adding dominant 7th chords",
          "Experiment with Mixolydian b6 for darker sound"
        ]
      case "Aeolian":
        return [
          "Use v-i for natural minor feel",
          "Try harmonic minor with raised 7th",
          "Add modal interchange for emotional depth"
        ]
      case "Locrian":
        return [
          "Use diminished chords for tension",
          "Try Locrian #2 for more usable sound",
          "Experiment with half-diminished chords"
        ]
      default:
        return []
    }
  }

  static getModeEnergyProfile(mode: ModeName): { tension: number; brightness: number; complexity: number } {
    const character = this.getModeCharacter(mode)
    
    const tensionMap = { low: 1, medium: 2, high: 3 }
    const brightnessMap = { dark: 1, neutral: 2, bright: 3 }
    
    return {
      tension: tensionMap[character.tensionLevel],
      brightness: brightnessMap[character.brightness],
      complexity: character.tensionLevel === 'high' ? 3 : character.tensionLevel === 'medium' ? 2 : 1
    }
  }
}
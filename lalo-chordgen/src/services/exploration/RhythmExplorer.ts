import { Section, SectionType } from '../../types/progression'

export interface TimeSignature {
  numerator: number
  denominator: number
  name: string
  grouping: string[]
  feel: string
  typicalUse: string
}

export interface RhythmPattern {
  id: string
  name: string
  description: string
  timeSignature: TimeSignature
  beats: number[]
  accents: number[]
  subdivision: 'simple' | 'compound' | 'complex'
  mnemonic: string
}

export interface GrooveTemplate {
  id: string
  name: string
  description: string
  timeSignature: TimeSignature
  bassPattern: string
  drumPattern: string
  chordPattern: string
  energyLevel: 'low' | 'medium' | 'high'
}

export class RhythmExplorer {
  private static readonly TIME_SIGNATURES: TimeSignature[] = [
    {
      numerator: 4,
      denominator: 4,
      name: "Common Time",
      grouping: ["2+2"],
      feel: "Steady, predictable",
      typicalUse: "Pop, rock, classical"
    },
    {
      numerator: 3,
      denominator: 4,
      name: "Waltz Time",
      grouping: ["3"],
      feel: "Flowing, dance-like",
      typicalUse: "Waltz, folk, ballads"
    },
    {
      numerator: 6,
      denominator: 8,
      name: "Compound Duple",
      grouping: ["3+3"],
      feel: "Swinging, lilting",
      typicalUse: "Irish, folk, classical"
    },
    {
      numerator: 5,
      denominator: 8,
      name: "5/8 Odd Time",
      grouping: ["2+3", "3+2"],
      feel: "Asymmetrical, driving",
      typicalUse: "Jazz, progressive rock"
    },
    {
      numerator: 7,
      denominator: 8,
      name: "7/8 Odd Time",
      grouping: ["2+2+3", "3+2+2", "2+3+2"],
      feel: "Complex, Balkan",
      typicalUse: "Balkan folk, progressive"
    },
    {
      numerator: 9,
      denominator: 8,
      name: "9/8 Compound Triple",
      grouping: ["3+3+3"],
      feel: "Flowing, extended",
      typicalUse: "Classical, jazz"
    },
    {
      numerator: 11,
      denominator: 8,
      name: "11/8 Complex",
      grouping: ["3+2+3+3", "2+2+3+2+2"],
      feel: "Very complex, challenging",
      typicalUse: "Progressive, experimental"
    }
  ]

  private static readonly RHYTHM_PATTERNS: RhythmPattern[] = [
    {
      id: "basic_4_4",
      name: "Basic Rock Beat",
      description: "Simple quarter note pulse",
      timeSignature: this.TIME_SIGNATURES[0],
      beats: [1, 2, 3, 4],
      accents: [1, 3],
      subdivision: 'simple',
      mnemonic: "1-and-2-and-3-and-4-and"
    },
    {
      id: "waltz_3_4",
      name: "Waltz Pattern",
      description: "Classic 3/4 waltz feel",
      timeSignature: this.TIME_SIGNATURES[1],
      beats: [1, 2, 3],
      accents: [1],
      subdivision: 'simple',
      mnemonic: "1-and-2-and-3-and"
    },
    {
      id: "compound_6_8",
      name: "Compound Swing",
      description: "6/8 compound feel",
      timeSignature: this.TIME_SIGNATURES[2],
      beats: [1, 2, 3, 4, 5, 6],
      accents: [1, 4],
      subdivision: 'compound',
      mnemonic: "1-2-3-4-5-6"
    },
    {
      id: "odd_5_8_2_3",
      name: "5/8 Short-Long",
      description: "2+3 grouping pattern",
      timeSignature: this.TIME_SIGNATURES[3],
      beats: [1, 2, 3, 4, 5],
      accents: [1, 3],
      subdivision: 'complex',
      mnemonic: "apple galloping"
    },
    {
      id: "odd_5_8_3_2",
      name: "5/8 Long-Short",
      description: "3+2 grouping pattern",
      timeSignature: this.TIME_SIGNATURES[3],
      beats: [1, 2, 3, 4, 5],
      accents: [1, 4],
      subdivision: 'complex',
      mnemonic: "galloping apple"
    },
    {
      id: "balkan_7_16",
      name: "Balkan Rachenitsa",
      description: "Fast 7/16 pattern",
      timeSignature: this.TIME_SIGNATURES[4],
      beats: [1, 2, 3, 4, 5, 6, 7],
      accents: [1, 3, 5],
      subdivision: 'complex',
      mnemonic: "apple apple galloping"
    }
  ]

  private static readonly GROOVE_TEMPLATES: GrooveTemplate[] = [
    {
      id: "rock_4_4",
      name: "Classic Rock",
      description: "Straight-ahead rock groove",
      timeSignature: this.TIME_SIGNATURES[0],
      bassPattern: "Root on 1, 5th on 3",
      drumPattern: "Kick on 1&3, snare on 2&4, hi-hat eighth notes",
      chordPattern: "Quarter notes or strumming",
      energyLevel: 'medium'
    },
    {
      id: "jazz_4_4",
      name: "Jazz Swing",
      description: "Swing feel with syncopation",
      timeSignature: this.TIME_SIGNATURES[0],
      bassPattern: "Walking bass, quarter notes",
      drumPattern: "Ride cymbal swing pattern, snare on 2&4",
      chordPattern: "Comping on off-beats",
      energyLevel: 'medium'
    },
    {
      id: "latin_4_4",
      name: "Latin Groove",
      description: "Clave-based Latin feel",
      timeSignature: this.TIME_SIGNATURES[0],
      bassPattern: "Tumbao pattern",
      drumPattern: "Conga, clave, shaker patterns",
      chordPattern: "Syncopated comping",
      energyLevel: 'high'
    },
    {
      id: "progressive_7_8",
      name: "Progressive Odd",
      description: "Complex 7/8 time signature",
      timeSignature: this.TIME_SIGNATURES[4],
      bassPattern: "Follows 2+2+3 grouping",
      drumPattern: "Accents on groupings",
      chordPattern: "Stabs on strong beats",
      energyLevel: 'high'
    }
  ]

  static getAllTimeSignatures(): TimeSignature[] {
    return this.TIME_SIGNATURES
  }

  static getTimeSignature(numerator: number, denominator: number): TimeSignature | undefined {
    return this.TIME_SIGNATURES.find(ts => 
      ts.numerator === numerator && ts.denominator === denominator
    )
  }

  static getRhythmPatterns(timeSignature?: TimeSignature): RhythmPattern[] {
    if (timeSignature) {
      return this.RHYTHM_PATTERNS.filter(rp => 
        rp.timeSignature.numerator === timeSignature.numerator &&
        rp.timeSignature.denominator === timeSignature.denominator
      )
    }
    return this.RHYTHM_PATTERNS
  }

  static getGrooveTemplates(timeSignature?: TimeSignature): GrooveTemplate[] {
    if (timeSignature) {
      return this.GROOVE_TEMPLATES.filter(gt => 
        gt.timeSignature.numerator === timeSignature.numerator &&
        gt.timeSignature.denominator === timeSignature.denominator
      )
    }
    return this.GROOVE_TEMPLATES
  }

  static getComplexTimeSignatures(): TimeSignature[] {
    return this.TIME_SIGNATURES.filter(ts => 
      ts.numerator > 4 || ts.grouping.length > 1
    )
  }

  static getOddTimeSuggestions(timeSignature: TimeSignature): string[] {
    const suggestions: string[] = []
    
    if (timeSignature.numerator === 5) {
      suggestions.push(
        "Try alternating between 2+3 and 3+2 groupings",
        "Use syncopation to emphasize the asymmetry",
        "Practice with a metronome on each beat first"
      )
    } else if (timeSignature.numerator === 7) {
      suggestions.push(
        "Experiment with 2+2+3, 3+2+2, or 2+3+2 groupings",
        "Use the 'apple galloping' mnemonic for 2+3 patterns",
        "Consider polyrhythms like 3 against 2"
      )
    } else if (timeSignature.numerator === 11) {
      suggestions.push(
        "Break it down into smaller groupings",
        "Use accent patterns to make it danceable",
        "Try combining multiple simple meters"
      )
    }
    
    return suggestions
  }

  static createSectionWithRhythm(
    sectionType: SectionType,
    timeSignature: TimeSignature,
    pattern: RhythmPattern,
    chordProgression: any[]
  ): Section {
    const section: Section = {
      id: `${sectionType}_${Date.now()}`,
      name: `${sectionType} (${timeSignature.numerator}/${timeSignature.denominator})`,
      sectionType: sectionType,
      progression: chordProgression,
      modeProgressions: {
        harmony: chordProgression,
        drum: [],
        other: []
      },
      repeats: 1,
      beatsPerBar: timeSignature.numerator,
      currentNotes: [],
      transitions: {
        type: "none",
        length: 0
      }
    }

    return section
  }

  static getRhythmComplexity(timeSignature: TimeSignature): 'simple' | 'moderate' | 'complex' {
    if (timeSignature.numerator <= 4) return 'simple'
    if (timeSignature.numerator <= 7) return 'moderate'
    return 'complex'
  }

  static getPracticeTips(timeSignature: TimeSignature): string[] {
    const tips: string[] = []
    
    tips.push(`Start by counting each beat: ${timeSignature.numerator}`)
    
    if (timeSignature.grouping.length > 1) {
      tips.push(`Practice the grouping: ${timeSignature.grouping.join(' or ')}`)
    }
    
    tips.push(`Use a metronome to internalize the pulse`)
    tips.push(`Try clapping or tapping the rhythm first`)
    
    return tips
  }
}
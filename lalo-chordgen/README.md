# Lalo ChordGen

A guided song composition and chord exploration tool built for the lalo-chezia project. This web application helps musicians and composers organize their thoughts for composing songs through interactive chord exploration and pattern-based song structure building.

## Features

### 🎵 Chord Exploration
- **Scale Degree Navigation**: Explore chords by scale degree (1-7) in any key and mode
- **Real-time Analysis**: View chord notes, quality, voicing, and inversions
- **Mode Support**: Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, and Locrian modes

### 🎶 Pattern Library
- **Built-in Patterns**: Common chord progressions like I-V-vi-IV, ii-V-I, 12-bar blues, and more
- **Pattern Exploration**: Apply patterns to any key and see the resulting chord progression
- **Custom Patterns**: Framework for adding custom chord patterns

### 🏗️ Song Structure Builder
- **Section Management**: Add verses, choruses, bridges, intros, and outros
- **Template System**: Pre-built song form templates (ABAB, verse-chorus-bridge, 12-bar blues)
- **Visual Organization**: Grid-based layout to visualize your song structure

### 🎯 Guided Composition
- **Interactive Interface**: Click-based chord and pattern exploration
- **Progressive Building**: Start with individual chords, build to patterns, then full song structures
- **Real-time Feedback**: Immediate visual and analytical feedback on your choices

### 🌟 Mode Exploration
- **Mode Gallery**: Explore all 7 musical modes with their unique characteristics
- **Emotional Mapping**: Understand the emotional qualities and typical uses of each mode
- **Modal Progressions**: Discover chord progressions specific to each mode
- **Mode Suggestions**: Get tailored suggestions for exploring each mode's potential

### 🥁 Rhythm Exploration
- **Time Signature Library**: Explore common and complex time signatures (4/4, 3/4, 5/8, 7/8, etc.)
- **Rhythm Patterns**: Learn different rhythmic patterns and their mnemonics
- **Practice Tips**: Get guidance on internalizing complex rhythms
- **Groove Templates**: Understand different rhythmic feels and their applications

### 🎨 Multi-Modal Exploration
- **Chord Mode**: Traditional chord-by-chord exploration
- **Mode Mode**: Deep dive into modal harmony and color
- **Rhythm Mode**: Focus on time signatures and rhythmic complexity
- **Song Mode**: Integrate all elements into complete song structures

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS with custom gradients and animations
- **Build Tool**: Vite 7 with React plugin
- **State Management**: Built-in React hooks (useState)
- **Music Theory Engine**: Custom implementation based on M4LProg concepts

## Installation

1. Navigate to the project directory:
   ```bash
   cd lalo-chordgen
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:3000`

## Project Structure

```
lalo-chordgen/
├── src/
│   ├── components/          # React components
│   ├── services/            # Business logic and music theory
│   │   ├── musicTheory/     # Core music theory calculations
│   │   └── progression/     # Song structure and pattern management
│   ├── types/               # TypeScript type definitions
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── public/                  # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Usage

### Chord Exploration
1. Use the numbered buttons (1-7) to explore chords by scale degree
2. Each click generates the corresponding chord in the current key and mode
3. View detailed analysis including notes, quality, and voicing information

### Pattern Exploration
1. Click pattern buttons to apply common chord progressions
2. Patterns are applied to the current key and displayed as a section
3. Explore different patterns to find inspiration for your song

### Song Structure Building
1. Use the "Add Section" buttons to build your song structure
2. Choose from verse, chorus, bridge, intro, and outro
3. View your complete song structure in the grid layout
4. Use "Build Song" to generate a complete song from templates

### Key and Mode Selection
- Currently set to C Major (Ionian mode) by default
- Framework in place for key and mode selection (can be extended)

## Music Theory Features

### Chord Generation
- **Diatonic Chords**: Generate chords based on scale degrees and modes
- **Voicing Options**: Inversion and drop voicing support
- **Quality Detection**: Automatic chord quality determination based on mode

### Pattern System
- **Scale Degree Patterns**: Define patterns using scale degrees (e.g., "1-5-6-4")
- **Quality Mapping**: Assign chord qualities to each degree in a pattern
- **Duration Control**: Set chord durations for each pattern

### Song Form Templates
- **ABAB Structure**: Classic verse-chorus form
- **Standard Pop**: Verse-chorus-bridge structure
- **12-Bar Blues**: Traditional blues progression structure

## Development

### Extending the Application

1. **Add New Patterns**: Extend the `DEFAULT_PATTERNS` array in `ProgressionManager.ts`
2. **Add New Templates**: Add to the `getSongFormTemplates()` function
3. **Add New Modes**: Extend the `MODAL_PROFILES` in `MusicTheoryEngine.ts`
4. **Custom Chords**: Add to the `CHORD_FORMULAS` for new chord types

### Music Theory Engine

The core music theory calculations are in `src/services/musicTheory/MusicTheoryEngine.ts`:

- Chord interval formulas for all supported chord types
- Modal scale profiles for all 7 modes
- Functions for chord generation, voicing, and analysis
- Scale degree to semitone conversion utilities

## Integration with lalo-chezia

This tool is designed to complement the lalo-chezia project by:

1. **Documentation Support**: Helping organize musical ideas for the 14-song album
2. **Arrangement Planning**: Visualizing song structures before REAPER implementation
3. **Pattern Discovery**: Finding chord progressions that could work for different songs
4. **Educational Tool**: Understanding the music theory behind the arrangements

## Future Enhancements

- [ ] Key signature selection interface
- [ ] Mode selection interface
- [ ] Custom pattern creation
- [ ] MIDI export functionality
- [ ] Audio playback of generated progressions
- [ ] Integration with REAPER project files
- [ ] Advanced voicing options (spread, close, etc.)
- [ ] Chord substitution suggestions
- [ ] Modal interchange exploration

## Contributing

Contributions are welcome! Please feel free to submit pull requests or issues.

## License

This project is part of the lalo-chezia repository and follows its licensing terms.
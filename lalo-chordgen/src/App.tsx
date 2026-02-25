import React, { useState } from 'react'
import { 
  generateDiatonicChord, 
  getChordName,
  getVoicingDescription,
  applyPattern,
  createEmptySection,
  getPatternDefinitions,
  getSongFormTemplates,
  createArrangementFromTemplate,
  ModeExplorer,
  RhythmExplorer,
  type ModalProgression,
  type TimeSignature,
  type RhythmPattern,
  getCadencesByType,
  detectCadences,
  applyCadence,
  getCadenceRecommendations,
  getCadenceTypes,
  type CadenceDefinition,
  type CadenceAnalysis,
  type CadenceType,
  type CadenceStrength
} from './services'
import { ModeName } from './types/chord'
import { Pattern, Section, SectionType } from './types/progression'

// Import the App-combined implementation
import AppCombined from './AppCombined'

function App() {
  // Check if we should use the combined app or the exploration app
  const useCombinedApp = window.location.hash === '#combined'
  
  if (useCombinedApp) {
    return <AppCombined />
  }

  const [currentChord, setCurrentChord] = useState<any>(null)
  const [currentSection, setCurrentSection] = useState<Section | null>(null)
  const [patterns, setPatterns] = useState<Pattern[]>(getPatternDefinitions())
  const [songForms, setSongForms] = useState(getSongFormTemplates())
  const [songStructure, setSongStructure] = useState<Section[]>([])
  const [currentKey, setCurrentKey] = useState(60) // C major
  const [currentMode, setCurrentMode] = useState<ModeName>("Ionian")
  
  // Exploration states
  const [selectedMode, setSelectedMode] = useState<ModeName>("Ionian")
  const [selectedTimeSignature, setSelectedTimeSignature] = useState<TimeSignature | null>(null)
  const [modalProgressions, setModalProgressions] = useState<ModalProgression[]>([])
  const [rhythmPatterns, setRhythmPatterns] = useState<RhythmPattern[]>([])
  const [selectedCadence, setSelectedCadence] = useState<CadenceDefinition | null>(null)
  const [cadenceAnalysis, setCadenceAnalysis] = useState<CadenceAnalysis[]>([])
  const [explorationMode, setExplorationMode] = useState<'chord' | 'mode' | 'rhythm' | 'cadence' | 'song'>('chord')

  // Guided chord exploration
  const handleExploreChord = (degree: number) => {
    const chord = generateDiatonicChord({
      keyRoot: currentKey,
      degree: degree as any,
      mode: currentMode,
      voicing: {
        inversion: 0,
        drop: 0
      }
    })
    
    setCurrentChord(chord)
  }

  // Mode exploration
  const handleExploreMode = (mode: ModeName) => {
    setSelectedMode(mode)
    const character = ModeExplorer.getModeCharacter(mode)
    const progressions = ModeExplorer.getModalProgressions(mode)
    setModalProgressions(progressions)
    
    // Generate example chord for the mode
    const exampleChord = generateDiatonicChord({
      keyRoot: currentKey,
      degree: 1,
      mode: mode,
      voicing: {
        inversion: 0,
        drop: 0
      }
    })
    
    setCurrentChord(exampleChord)
  }

  // Rhythm exploration
  const handleExploreRhythm = (timeSig: TimeSignature) => {
    setSelectedTimeSignature(timeSig)
    const patterns = RhythmExplorer.getRhythmPatterns(timeSig)
    setRhythmPatterns(patterns)
  }

  // Pattern exploration
  const handleExplorePattern = (patternId: string) => {
    const patternProgression = applyPattern(patternId, {
      root: currentKey,
      duration: 4,
      inversion: 0,
      drop: 0
    })
    
    if (patternProgression) {
      const section = createEmptySection(`${patternId} Pattern`)
      section.progression = patternProgression
      section.modeProgressions = {
        harmony: patternProgression,
        drum: [],
        other: []
      }
      setCurrentSection(section)
    }
  }

  // Build song structure
  const handleBuildSong = (templateId: string, patternId?: string) => {
    const result = createArrangementFromTemplate(templateId, {
      key: currentKey,
      patternId: patternId,
      startBeat: 0
    })
    
    setSongStructure(result.sections)
  }

  // Add section to song
  const handleAddSection = (sectionType: SectionType) => {
    const newSection = createEmptySection(`${sectionType} ${songStructure.length + 1}`)
    newSection.sectionType = sectionType
    setSongStructure([...songStructure, newSection])
  }

  // Create section with rhythm
  const handleCreateSectionWithRhythm = (sectionType: SectionType, timeSig: TimeSignature, pattern: RhythmPattern) => {
    const chordProgression = applyPattern("pop_1-5-6-4", {
      root: currentKey,
      duration: 4,
      inversion: 0,
      drop: 0
    }) || []
    
    const section = RhythmExplorer.createSectionWithRhythm(
      sectionType,
      timeSig,
      pattern,
      chordProgression
    )
    
    setSongStructure([...songStructure, section])
  }

  // Cadence exploration
  const handleExploreCadence = (cadence: CadenceDefinition) => {
    setSelectedCadence(cadence)
    const cadenceProgression = applyCadence(cadence.id, {
      root: currentKey,
      duration: 2,
      inversion: 0,
      drop: 0
    })
    
    if (cadenceProgression) {
      const analysis = detectCadences(cadenceProgression, currentKey)
      setCadenceAnalysis(analysis)
      
      // Create a section with the cadence
      const section = createEmptySection(`${cadence.name} Cadence`)
      section.progression = cadenceProgression
      section.modeProgressions = {
        harmony: cadenceProgression,
        drum: [],
        other: []
      }
      setCurrentSection(section)
    }
  }

  // Analyze existing progression for cadences
  const handleAnalyzeCadences = () => {
    if (currentSection && currentSection.progression.length > 1) {
      const analysis = detectCadences(currentSection.progression, currentKey)
      setCadenceAnalysis(analysis)
    }
  }

  // Get cadence recommendations
  const handleGetCadenceRecommendations = (strength?: CadenceStrength, emotion?: string) => {
    const recommendations = getCadenceRecommendations(
      currentSection?.progression || [],
      emotion,
      strength
    )
    return recommendations
  }

  const modeCharacters = ModeExplorer.getAllModeCharacters()
  const timeSignatures = RhythmExplorer.getAllTimeSignatures()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Lalo ChordGen
          </h1>
          <p className="text-slate-300">
            Guided song composition and chord exploration tool
          </p>
        </header>

        {/* Exploration Mode Selector */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Exploration Mode</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setExplorationMode('chord')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                explorationMode === 'chord' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white/20 text-slate-300 hover:bg-white/30'
              }`}
            >
              Chord Exploration
            </button>
            <button
              onClick={() => setExplorationMode('mode')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                explorationMode === 'mode' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/20 text-slate-300 hover:bg-white/30'
              }`}
            >
              Mode Exploration
            </button>
            <button
              onClick={() => setExplorationMode('rhythm')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                explorationMode === 'rhythm' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white/20 text-slate-300 hover:bg-white/30'
              }`}
            >
              Rhythm Exploration
            </button>
            <button
              onClick={() => setExplorationMode('cadence')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                explorationMode === 'cadence' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white/20 text-slate-300 hover:bg-white/30'
              }`}
            >
              Cadence Exploration
            </button>
            <button
              onClick={() => setExplorationMode('song')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                explorationMode === 'song' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-white/20 text-slate-300 hover:bg-white/30'
              }`}
            >
              Song Building
            </button>
          </div>
        </div>

        {/* Mode Exploration */}
        {explorationMode === 'mode' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Mode Gallery */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-4">Mode Gallery</h2>
              <div className="grid grid-cols-1 gap-4">
                {modeCharacters.map((character) => (
                  <div
                    key={character.name}
                    onClick={() => handleExploreMode(character.name.split(' ')[0] as ModeName)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedMode === character.name.split(' ')[0] 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-white/20 text-slate-300 hover:bg-white/30'
                    }`}
                  >
                    <h3 className="font-semibold text-lg">{character.name}</h3>
                    <p className="text-sm opacity-80 mt-1">{character.description}</p>
                    <div className="flex gap-2 mt-2 text-xs">
                      <span className="px-2 py-1 bg-black/30 rounded">{character.emotionalQuality}</span>
                      <span className="px-2 py-1 bg-black/30 rounded">{character.tensionLevel}</span>
                      <span className="px-2 py-1 bg-black/30 rounded">{character.brightness}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mode Details */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-4">Mode Details</h2>
              {selectedMode && (
                <div className="space-y-4">
                  <div className="bg-black/20 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">{ModeExplorer.getModeCharacter(selectedMode).name}</h3>
                    <p className="text-slate-300 text-sm mb-2">{ModeExplorer.getModeCharacter(selectedMode).description}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-200">
                      <div>Emotional Quality: {ModeExplorer.getModeCharacter(selectedMode).emotionalQuality}</div>
                      <div>Typical Use: {ModeExplorer.getModeCharacter(selectedMode).typicalUse}</div>
                      <div>Tension Level: {ModeExplorer.getModeCharacter(selectedMode).tensionLevel}</div>
                      <div>Brightness: {ModeExplorer.getModeCharacter(selectedMode).brightness}</div>
                    </div>
                  </div>

                  {/* Mode Suggestions */}
                  <div className="bg-black/20 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Exploration Suggestions</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      {ModeExplorer.getModeSuggestions(selectedMode).map((suggestion, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-purple-300 mr-2">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Modal Progressions */}
                  {modalProgressions.length > 0 && (
                    <div className="bg-black/20 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-2">Modal Progressions</h4>
                      <div className="space-y-2">
                        {modalProgressions.map((progression) => (
                          <div key={progression.id} className="bg-black/30 rounded p-2">
                            <span className="text-purple-300 font-medium">{progression.name}</span>
                            <p className="text-slate-300 text-sm mt-1">{progression.description}</p>
                            <div className="text-slate-400 text-xs mt-1">
                              Degrees: {progression.degrees.join(' → ')} | Feel: {progression.feel}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rhythm Exploration */}
        {explorationMode === 'rhythm' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Time Signature Gallery */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-4">Time Signatures</h2>
              <div className="grid grid-cols-1 gap-4">
                {timeSignatures.map((timeSig) => (
                  <div
                    key={`${timeSig.numerator}/${timeSig.denominator}`}
                    onClick={() => handleExploreRhythm(timeSig)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedTimeSignature?.numerator === timeSig.numerator && 
                      selectedTimeSignature?.denominator === timeSig.denominator
                        ? 'bg-green-600 text-white' 
                        : 'bg-white/20 text-slate-300 hover:bg-white/30'
                    }`}
                  >
                    <h3 className="font-semibold text-lg">{timeSig.numerator}/{timeSig.denominator}</h3>
                    <p className="text-sm opacity-80 mt-1">{timeSig.name}</p>
                    <p className="text-sm opacity-80">{timeSig.feel}</p>
                    <div className="flex gap-2 mt-2 text-xs">
                      <span className="px-2 py-1 bg-black/30 rounded">{timeSig.grouping.join(' | ')}</span>
                      <span className="px-2 py-1 bg-black/30 rounded">{timeSig.typicalUse}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rhythm Details */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-4">Rhythm Details</h2>
              {selectedTimeSignature && (
                <div className="space-y-4">
                  <div className="bg-black/20 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">{selectedTimeSignature.name}</h3>
                    <p className="text-slate-300 text-sm mb-2">{selectedTimeSignature.feel}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-200">
                      <div>Grouping: {selectedTimeSignature.grouping.join(' | ')}</div>
                      <div>Typical Use: {selectedTimeSignature.typicalUse}</div>
                    </div>
                  </div>

                  {/* Practice Tips */}
                  <div className="bg-black/20 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Practice Tips</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      {RhythmExplorer.getPracticeTips(selectedTimeSignature).map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-300 mr-2">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Rhythm Patterns */}
                  {rhythmPatterns.length > 0 && (
                    <div className="bg-black/20 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-2">Rhythm Patterns</h4>
                      <div className="space-y-2">
                        {rhythmPatterns.map((pattern) => (
                          <div key={pattern.id} className="bg-black/30 rounded p-2">
                            <span className="text-green-300 font-medium">{pattern.name}</span>
                            <p className="text-slate-300 text-sm mt-1">{pattern.description}</p>
                            <div className="text-slate-400 text-xs mt-1">
                              Mnemonic: {pattern.mnemonic} | Subdivision: {pattern.subdivision}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cadence Exploration */}
        {explorationMode === 'cadence' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Cadence Gallery */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-4">Cadence Library</h2>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(getCadenceTypes()).map(([type, description]) => (
                  <div key={type} className="bg-black/20 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2 capitalize">{type} Cadences</h3>
                    <p className="text-slate-300 text-sm mb-3">{description}</p>
                    <div className="space-y-2">
                      {getCadencesByType(type as CadenceType).map((cadence) => (
                        <div
                          key={cadence.id}
                          onClick={() => handleExploreCadence(cadence)}
                          className={`p-3 rounded cursor-pointer transition-all ${
                            selectedCadence?.id === cadence.id
                              ? 'bg-red-600 text-white'
                              : 'bg-white/20 text-slate-300 hover:bg-white/30'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-medium">{cadence.name}</span>
                              <p className="text-xs opacity-80 mt-1">{cadence.description}</p>
                            </div>
                            <div className="text-xs bg-black/30 px-2 py-1 rounded">
                              {cadence.strength}
                            </div>
                          </div>
                          <div className="text-xs text-slate-400 mt-2">
                            {cadence.degrees.join(' → ')} | {cadence.qualities.join('-')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cadence Details */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-4">Cadence Details</h2>
              {selectedCadence && (
                <div className="space-y-4">
                  <div className="bg-black/20 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">{selectedCadence.name}</h3>
                    <p className="text-slate-300 text-sm mb-2">{selectedCadence.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-200">
                      <div>Type: {selectedCadence.type}</div>
                      <div>Strength: {selectedCadence.strength}</div>
                      <div>Emotional Quality: {selectedCadence.emotionalQuality}</div>
                      <div>Typical Use: {selectedCadence.typicalUse}</div>
                    </div>
                  </div>

                  {/* Cadence Analysis */}
                  {cadenceAnalysis.length > 0 && (
                    <div className="bg-black/20 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-2">Analysis</h4>
                      <div className="space-y-2">
                        {cadenceAnalysis.map((analysis, index) => (
                          <div key={index} className="bg-black/30 rounded p-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-red-300 font-medium">{analysis.cadence.name}</span>
                                <p className="text-xs text-slate-300 mt-1">Confidence: {(analysis.confidence * 100).toFixed(0)}%</p>
                              </div>
                              <div className="text-xs bg-black/30 px-2 py-1 rounded">
                                {analysis.strength}
                              </div>
                            </div>
                            <div className="text-xs text-slate-400 mt-2">
                              {analysis.cadence.degrees.join(' → ')} | {analysis.cadence.qualities.join('-')}
                            </div>
                            {analysis.suggestions.length > 0 && (
                              <div className="mt-2">
                                <span className="text-xs text-slate-400">Suggestions:</span>
                                <ul className="text-xs text-slate-300 mt-1 space-y-1">
                                  {analysis.suggestions.map((suggestion, i) => (
                                    <li key={i} className="flex items-start">
                                      <span className="text-red-300 mr-2">•</span>
                                      {suggestion}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cadence Actions */}
                  <div className="bg-black/20 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleAnalyzeCadences()}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded transition-colors text-sm"
                      >
                        Analyze Current Progression
                      </button>
                      <button
                        onClick={() => {
                          const recommendations = handleGetCadenceRecommendations('strong', 'final');
                          console.log('Strong final cadence recommendations:', recommendations);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded transition-colors text-sm"
                      >
                        Get Strong Cadence Recommendations
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Song Structure Builder */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Song Structure</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => handleAddSection("verse")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Add Verse
            </button>
            <button
              onClick={() => handleAddSection("chorus")}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Add Chorus
            </button>
            <button
              onClick={() => handleAddSection("bridge")}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Add Bridge
            </button>
            <button
              onClick={() => handleAddSection("intro")}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Add Intro
            </button>
            <button
              onClick={() => handleAddSection("outro")}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Add Outro
            </button>
          </div>
          
                  {songStructure.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {songStructure.map((section, index) => (
                        <div key={index} className="bg-black/20 rounded-lg p-4">
                          <h3 className="text-white font-semibold mb-2">{section.name}</h3>
                          <p className="text-slate-300 text-sm mb-2">Type: {section.sectionType}</p>
                          <p className="text-slate-400 text-xs">Chords: {section.progression.length}</p>
                        </div>
                      ))}
                    </div>
                  )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chord Exploration */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4">Chord Exploration</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((degree) => (
                  <button
                    key={degree}
                    onClick={() => handleExploreChord(degree)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
                  >
                    {degree}
                  </button>
                ))}
              </div>

              {currentChord && (
                <div className="bg-black/20 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Current Chord</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-200">
                    <div>Notes: {currentChord.notes.join(', ')}</div>
                    <div>Duration: {currentChord.duration} beats</div>
                    <div>Root: {currentChord.metadata?.root}</div>
                    <div>Quality: {currentChord.metadata?.quality}</div>
                    <div>Inversion: {currentChord.metadata?.inversion}</div>
                    <div>Drop: {currentChord.metadata?.drop}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pattern Exploration */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4">Pattern Exploration</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {patterns.slice(0, 4).map((pattern) => (
                  <button
                    key={pattern.id}
                    onClick={() => handleExplorePattern(pattern.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
                  >
                    {pattern.name}
                  </button>
                ))}
              </div>

              {currentSection && (
                <div className="bg-black/20 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Current Pattern</h3>
                  <div className="text-sm text-slate-200">
                    <div className="mb-2">Name: {currentSection.name}</div>
                    <div className="mb-2">Type: {currentSection.sectionType}</div>
                    <div className="mb-2">Chords: {currentSection.progression.length}</div>
                    
                    <div className="mt-4 space-y-1">
                      {currentSection.progression.map((chord, index) => (
                        <div key={index} className="bg-black/30 rounded p-2">
                          <span className="text-purple-300">Chord {index + 1}:</span>
                          <span className="ml-2 text-slate-200">
                            {getChordName(chord.notes[0], chord.metadata?.quality || "Maj")} - 
                            {getVoicingDescription(chord.metadata?.inversion || 0, chord.metadata?.drop || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Song Form Templates */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 lg:col-span-2">
            <h2 className="text-2xl font-semibold text-white mb-4">Song Form Templates</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {songForms.map((template) => (
                <div key={template.id} className="bg-black/20 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">{template.name}</h3>
                  <p className="text-slate-300 text-sm mb-3">{template.description}</p>
                  <div className="text-purple-300 text-sm mb-3">
                    Structure: {template.structure.join(' → ')}
                  </div>
                  <button
                    onClick={() => handleBuildSong(template.id, "pop_1-5-6-4")}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded transition-colors"
                  >
                    Build Song
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pattern Library */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 lg:col-span-2">
            <h2 className="text-2xl font-semibold text-white mb-4">Pattern Library</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patterns.slice(0, 7).map((pattern) => (
                <div key={pattern.id} className="bg-black/20 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">{pattern.name}</h3>
                  <p className="text-slate-300 text-sm mb-3">{pattern.description}</p>
                  <div className="text-purple-300 text-sm">
                    Degrees: {pattern.degrees.join(' → ')}
                  </div>
                  <div className="text-slate-400 text-xs mt-1">
                    Qualities: {pattern.qualities?.join(', ') || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App;
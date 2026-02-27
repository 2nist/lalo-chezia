import { useState, useMemo } from 'react'
import ToneDrawer from './components/ToneDrawer'
import TimeDrawer from './components/TimeDrawer'
import SandboxCanvas from './components/SandboxCanvas'
import ModeToggle, { type Mode } from './components/ModeToggle'
import SongRail from './components/SongRail'
import CardBrowser from './components/CardBrowser'
import MidiRoutingDialog from './components/MidiRoutingDialog'
import TransportControls from './components/TransportControls'
import { Button } from './components/ui/button'
import type { IdeaCardData } from './components/IdeaCard'
import * as ProgressionManager from './services/progression/ProgressionManager'
import * as MusicTheory from './services/musicTheory/MusicTheoryEngine'
import { cardManager } from './services/cards/cardManager'
import { cardsToIdeaCardData } from './services/cards/cardAdapter'

export default function App() {
  const [mode, setMode] = useState<Mode>('Free')
  const [role, setRole] = useState('drums')
  const [committedSections, setCommittedSections] = useState<any[]>([])
  const [showBrowser, setShowBrowser] = useState(false)
  const [playingCardId, setPlayingCardId] = useState<string | null>(null)

  // Load cards from database
  const sampleCards: IdeaCardData[] = useMemo(() => {
    const allCards = cardManager.getAllCards()
    return cardsToIdeaCardData(allCards)
  }, [])

  // Get statistics
  const stats = useMemo(() => cardManager.getStatistics(), [])

  // Card playback handlers
  const handlePlayCard = (card: IdeaCardData) => {
    console.log('Playing card:', card.id, card.label)
    setPlayingCardId(card.id)
    // TODO: Wire to PreviewPlayer or MIDI output
  }

  const handleStopCard = () => {
    console.log('Stopping playback')
    setPlayingCardId(null)
    // TODO: Stop MIDI output
  }

  const handleDuplicateCard = (card: IdeaCardData) => {
    console.log('Duplicating card:', card.label)
    // TODO: Create a copy in cardManager
    // const newCard = cardManager.duplicateCard(card.id)
    // Update state to show new card
  }

  const handleEditCard = (card: IdeaCardData) => {
    console.log('Editing card:', card.label)
    // TODO: Open edit modal/form
  }

  const handleAddToTimeline = (card: IdeaCardData) => {
    console.log('Adding to timeline:', card.label)
    // TODO: Place card in timeline service
  }

  const handleViewDetails = (card: IdeaCardData) => {
    console.log('Viewing details:', card.label)
    // TODO: Open details modal with full card info
  }

  const handleDeleteCard = (card: IdeaCardData) => {
    if (confirm(`Delete "${card.label}"?`)) {
      console.log('Deleting card:', card.label)
      // TODO: Remove from cardManager
      // cardManager.deleteCard(card.id)
      // Update state to remove card
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lalo ChordGen — Sandbox</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Drag <strong>local cards</strong> to build patterns. Use <strong>global cards</strong> to transform the entire context.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Database: <strong>{stats.totalCards}</strong> cards ({stats.toneCards} tone, {stats.timeCards} time)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MidiRoutingDialog />
          <Button
            variant={showBrowser ? 'default' : 'outline'}
            onClick={() => setShowBrowser(!showBrowser)}
          >
            {showBrowser ? '🔙 Back to Sandbox' : '📚 Browse Library'}
          </Button>
        </div>
      </header>

      {showBrowser ? (
        <CardBrowser />
      ) : (
        <div className="grid grid-cols-[160px_1fr_160px] gap-4 h-[calc(100vh-180px)]">
          {/* Left Drawer - Tone Cards */}
          <ToneDrawer 
            cards={sampleCards}
            onPlayCard={handlePlayCard}
            onStopCard={handleStopCard}
            playingCardId={playingCardId}
            onDuplicate={handleDuplicateCard}
            onEdit={handleEditCard}
            onAddToTimeline={handleAddToTimeline}
            onViewDetails={handleViewDetails}
            onDelete={handleDeleteCard}
          />

          {/* Center - Canvas and Controls */}
          <div className="flex flex-col gap-4 overflow-y-auto">
            <TransportControls />

            {/* Controls */}
            <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-lg">
              <div>
                <div className="mb-2 text-sm font-medium">Mode</div>
                <ModeToggle mode={mode} onChange={m=>setMode(m)} />
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">Role</div>
                <select
                  value={role}
                  onChange={e=>setRole(e.target.value)}
                  className="bg-white/10 text-white p-2 rounded"
                  aria-label="Select role"
                >
                  <option value="drums">Drums</option>
                  <option value="bass">Bass</option>
                  <option value="pads">Pads</option>
                  <option value="lead">Lead</option>
                </select>
              </div>
            </div>

            {/* Sandbox Canvas */}
            <SandboxCanvas mode={mode} role={role} onCommitSection={(payload)=>{
              // Create a Section and synthesize a harmony progression from sandbox items
              const sec = ProgressionManager.createEmptySection(payload.id || 'Committed Section')
              sec.name = payload.items.map((i:any)=>i.label).join(' ')

              // Build progression: prefer explicit note arrays attached to cards, otherwise generate a default chord
              sec.progression = payload.items.map((it: any) => {
                const length = typeof it.lengthBeats === 'number' ? it.lengthBeats : 4
                if (Array.isArray(it.notes) && it.notes.length > 0) {
                  return {
                    notes: it.notes.slice(),
                    duration: length,
                    metadata: { root: it.notes[0], sourceLabel: it.label },
                  }
                }

                // Fallback: generate a simple triad at middle C
                const gen = MusicTheory.generateChord({ root: 60, quality: 'Maj', voicing: {} })
                return { notes: gen.notes, duration: length, metadata: { root: gen.metadata?.root ?? 60, sourceLabel: it.label } }
              })

              // Validate and warn if issues found
              const warnings = ProgressionManager.validateProgression(sec.progression)
              if (warnings.length) console.warn('Committed progression warnings:', warnings)

              // Add to committed list
              setCommittedSections(prev=>[...prev, sec])
            }} />

            {/* Song Rail */}
            <SongRail sections={committedSections} onRemove={idx=>setCommittedSections(prev=>prev.filter((_,i)=>i!==idx))} />
          </div>

          {/* Right Drawer - Time Cards */}
          <TimeDrawer 
            cards={sampleCards}
            onPlayCard={handlePlayCard}
            onStopCard={handleStopCard}
            playingCardId={playingCardId}
            onDuplicate={handleDuplicateCard}
            onEdit={handleEditCard}
            onAddToTimeline={handleAddToTimeline}
            onViewDetails={handleViewDetails}
            onDelete={handleDeleteCard}
          />
        </div>
      )}
    </div>
  )
}

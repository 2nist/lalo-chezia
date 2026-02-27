import { useState, useMemo } from 'react'
import IdeaDrawer from './components/IdeaDrawer'
import SandboxCanvas from './components/SandboxCanvas'
import ModeToggle, { type Mode } from './components/ModeToggle'
import SongRail from './components/SongRail'
import CardBrowser from './components/CardBrowser'
import MidiRoutingDialog from './components/MidiRoutingDialog'
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

  // Load cards from database
  const sampleCards: IdeaCardData[] = useMemo(() => {
    const allCards = cardManager.getAllCards()
    return cardsToIdeaCardData(allCards)
  }, [])

  // Get statistics
  const stats = useMemo(() => cardManager.getStatistics(), [])

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
        <>
          {/* Global Cards Section */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌍</span>
              <h2 className="text-lg font-semibold">Global Effects</h2>
              <span className="text-xs text-muted-foreground">(Apply to all cards)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <IdeaDrawer cards={sampleCards} title="Global Tone Cards" filterScope="global" />
            </div>
          </div>

          {/* Local Cards Section */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📍</span>
              <h2 className="text-lg font-semibold">Local Cards</h2>
              <span className="text-xs text-muted-foreground">(Individual patterns)</span>
            </div>
            <IdeaDrawer cards={sampleCards} title="Tone & Time Cards" filterScope="local" />
          </div>

          {/* Controls */}
          <div className="mb-6 flex items-start gap-4">
            <div>
              <div className="mb-2">Mode</div>
              <ModeToggle mode={mode} onChange={m=>setMode(m)} />
              <div className="mt-3 mb-2">Role</div>
              <select
                value={role}
                onChange={e=>setRole(e.target.value)}
                className="bg-white/10 text-white p-1 rounded"
                aria-label="Select role"
              >
                <option value="drums">Drums</option>
                <option value="bass">Bass</option>
                <option value="pads">Pads</option>
                <option value="lead">Lead</option>
              </select>
            </div>
          </div>

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

          <div className="mt-6">
            <SongRail sections={committedSections} onRemove={idx=>setCommittedSections(prev=>prev.filter((_,i)=>i!==idx))} />
          </div>
        </>
      )}
    </div>
  )
}

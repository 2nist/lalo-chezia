import React, { useState, useRef } from 'react'
import { Card } from './ui/card'
import PreviewPlayer from '../services/audio/PreviewPlayer'
import { cn } from '@/lib/utils'

export type IdeaCardData = {
  id: string
  type: 'time' | 'tone'
  scope: 'global' | 'local'
  label: string
  
  // Duration behavior
  durationType?: 'instance' | 'continuous' // instance = one-shot, continuous = stays until replaced
  lengthBeats?: number  // Beat length of one iteration (for instance cards)
  repeatCount?: number  // How many times the pattern repeats (default: 1)
  
  intensity?: number
  notes?: number[] // optional MIDI note numbers for audition
  
  // MIDI clip data
  midiClip?: {
    notes: Array<{
      pitch: number
      velocity: number
      startTime: number
      duration: number
    }>
    tempo?: number
    timeSignature?: [number, number]
    lengthInBeats?: number
  }
  
  // Global tone properties
  mode?: 'Ionian' | 'Dorian' | 'Phrygian' | 'Lydian' | 'Mixolydian' | 'Aeolian' | 'Locrian'
  voicing?: 'drop2' | 'drop3' | 'spread' | 'tight' | 'octave'
  
  // Global time properties
  tempoModifier?: 'half' | 'double' | 'dotted' | 'triplet'
  
  // Editable parameters (user can modify)
  editable?: {
    rootNote?: number    // MIDI note for mode root
    tempoMultiplier?: number // e.g., 0.5, 1.0, 2.0
    transpose?: number   // Semitones to transpose
  }
  
  // Metadata
  category?: 'rhythm' | 'harmony' | 'melodic' | 'textural' | 'dynamic'
  tags?: string[]
}

type Props = {
  card: IdeaCardData
}

export default function IdeaCard({card}: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(card))
    e.dataTransfer.effectAllowed = 'copy'
    dragRef.current?.classList.add('opacity-50')
  }

  const handleDragEnd = () => {
    dragRef.current?.classList.remove('opacity-50')
  }

  const togglePlayback = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (isPlaying) {
      try {
        PreviewPlayer.stopAll()
        setIsPlaying(false)
        setError(null)
      } catch (err) {
        setError('Failed to stop playback')
      }
    } else {
      setIsLoading(true)
      setError(null)
      try {
        await PreviewPlayer.playIdeaCard(card)
        setIsPlaying(true)
        // Simulate audio ending after a reasonable duration
        setTimeout(() => setIsPlaying(false), (card.lengthBeats / 4) * 1000 + 500)
      } catch (err) {
        setError('Failed to play audio')
        setIsPlaying(false)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault()
      buttonRef.current?.click()
    }
  }

  const intensityPercent = (card.intensity ?? 0.5) * 100
  
  // Type-specific icons and colors
  const typeConfig: Record<IdeaCardData['type'], { icon: string; colorClass: string; label: string }> = {
    time: {
      icon: '⏱️',
      colorClass: 'bg-blue-500/20 border-blue-500/30 hover:border-blue-500/50',
      label: 'Rhythm'
    },
    tone: {
      icon: '🎵',
      colorClass: 'bg-green-500/20 border-green-500/30 hover:border-green-500/50',
      label: 'Harmony'
    }
  }

  const config = typeConfig[card.type]
  const typeIcon = config.icon

  return (
    <Card
      ref={dragRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onKeyDown={handleKeyDown}
      className={cn(
        'w-44 transition-all duration-200 ease-out',
        'hover:shadow-lg hover:shadow-primary/20',
        'focus-within:ring-2 focus-within:ring-primary/60',
        'cursor-grab active:cursor-grabbing',
        'select-none border-2',
        config.colorClass,
        card.scope === 'global' && 'ring-2 ring-primary/40 ring-offset-2 ring-offset-background'
      )}
      tabIndex={0}
      role="region"
      aria-label={`${card.label} - ${config.label} ${card.scope} card`}
    >
      <div className="p-4 space-y-3">
        {/* Scope badge */}
        {card.scope === 'global' && (
          <div className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full w-fit">
            <span>🌍</span>
            <span>GLOBAL</span>
          </div>
        )}

        {/* Intensity indicator bar */}
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${intensityPercent}%` }}
            role="progressbar"
            aria-valuenow={Math.round(intensityPercent)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        {/* Card header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {typeIcon} {card.type}
            </div>
            <h4 className="text-sm font-semibold text-card-foreground truncate mt-1">
              {card.label}
            </h4>
          </div>
        </div>

        {/* Metadata */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Length: {card.lengthBeats} beats</div>
          {card.mode && <div>Mode: {card.mode}</div>}
          {card.tempoModifier && <div>Tempo: {card.tempoModifier}</div>}
          {card.voicing && <div>Voicing: {card.voicing}</div>}
          {card.editable?.rootNote && <div>Root: MIDI {card.editable.rootNote}</div>}
          {card.editable?.transpose && <div>Transpose: {card.editable.transpose > 0 ? '+' : ''}{card.editable.transpose} semitones</div>}
          {card.editable?.tempoMultiplier && <div>×{card.editable.tempoMultiplier} tempo</div>}
          {card.notes && card.notes.length > 0 && (
            <div>Notes: {card.notes.join(', ')}</div>
          )}
          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {card.tags.map(tag => (
                <span key={tag} className="text-xs bg-muted/50 px-1.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">
            {error}
          </div>
        )}

        {/* Play/Stop button */}
        <button
          ref={buttonRef}
          onClick={togglePlayback}
          disabled={isLoading}
          aria-pressed={isPlaying}
          aria-label={isPlaying ? `Stop ${card.label}` : `Play ${card.label}`}
          className={cn(
            'w-full py-2 px-3 rounded-md text-sm font-medium',
            'transition-all duration-200',
            'flex items-center justify-center gap-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            isPlaying
              ? 'bg-destructive/80 hover:bg-destructive text-destructive-foreground'
              : 'bg-primary/80 hover:bg-primary text-primary-foreground',
            'active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 focus:ring-offset-card'
          )}
        >
          {isLoading ? (
            <>
              <span className="animate-spin">⏳</span>
              Loading...
            </>
          ) : isPlaying ? (
            <>
              <span>⏹️</span>
              Stop
            </>
          ) : (
            <>
              <span>▶️</span>
              Play
            </>
          )}
        </button>
      </div>
    </Card>
  )
}

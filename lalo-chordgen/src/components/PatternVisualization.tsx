/**
 * PatternVisualization - Compact grid visualization for MIDI patterns
 * Shows drum hits as dots on a grid (beats x drum types)
 */

import { cn } from '@/lib/utils'

interface MIDINoteData {
  pitch: number
  velocity: number
  startTime: number
  duration: number
}

interface MIDIClipData {
  notes: MIDINoteData[]
  tempo?: number
  timeSignature?: [number, number]
  lengthInBeats?: number
}

interface PatternVisualizationProps {
  midiClip?: MIDIClipData
  className?: string
  compact?: boolean
}

// Standard MIDI note numbers for GM drum map
const DRUM_NOTES: Record<number, { name: string; color: string; row: number }> = {
  // Kick drums
  35: { name: 'Kick (Acoustic)', color: 'bg-red-500', row: 0 },
  36: { name: 'Kick (Bass)', color: 'bg-red-600', row: 0 },
  
  // Snares
  38: { name: 'Snare (Acoustic)', color: 'bg-yellow-500', row: 1 },
  40: { name: 'Snare (Electric)', color: 'bg-yellow-600', row: 1 },
  37: { name: 'Snare (Side Stick)', color: 'bg-yellow-400', row: 1 },
  
  // Hats
  42: { name: 'Hi-Hat (Closed)', color: 'bg-cyan-400', row: 2 },
  44: { name: 'Hi-Hat (Pedal)', color: 'bg-cyan-500', row: 2 },
  46: { name: 'Hi-Hat (Open)', color: 'bg-cyan-600', row: 2 },
  
  // Ride
  51: { name: 'Ride (Cymbal)', color: 'bg-blue-400', row: 3 },
  59: { name: 'Ride (Cymbal 2)', color: 'bg-blue-500', row: 3 },
  53: { name: 'Ride (Bell)', color: 'bg-blue-600', row: 3 },
  
  // Crashes
  49: { name: 'Crash (Cymbal 1)', color: 'bg-purple-500', row: 4 },
  57: { name: 'Crash (Cymbal 2)', color: 'bg-purple-600', row: 4 },
  55: { name: 'Splash', color: 'bg-purple-400', row: 4 },
  
  // Toms
  41: { name: 'Tom (Low Floor)', color: 'bg-orange-600', row: 5 },
  43: { name: 'Tom (High Floor)', color: 'bg-orange-500', row: 5 },
  45: { name: 'Tom (Low)', color: 'bg-orange-400', row: 5 },
  47: { name: 'Tom (Low-Mid)', color: 'bg-orange-300', row: 5 },
  48: { name: 'Tom (High-Mid)', color: 'bg-orange-200', row: 5 },
  50: { name: 'Tom (High)', color: 'bg-orange-100', row: 5 },
  
  // Percussion
  39: { name: 'Clap', color: 'bg-pink-500', row: 6 },
  54: { name: 'Tambourine', color: 'bg-pink-400', row: 6 },
  56: { name: 'Cowbell', color: 'bg-pink-600', row: 6 },
  52: { name: 'China Cymbal', color: 'bg-pink-300', row: 6 },
}

// Fallback for unknown notes - assign to percussion row
const getDefaultDrum = (pitch: number) => ({
  name: `Note ${pitch}`,
  color: 'bg-gray-500',
  row: 6,
})

export default function PatternVisualization({ 
  midiClip, 
  className,
  compact = false 
}: PatternVisualizationProps) {
  if (!midiClip || !midiClip.notes || midiClip.notes.length === 0) {
    return (
      <div className={cn('flex items-center justify-center text-muted-foreground text-xs', className)}>
        No pattern data
      </div>
    )
  }

  const { notes } = midiClip
  
  // Calculate length in beats if not provided
  const lengthInBeats = midiClip.lengthInBeats ?? 
    (notes.length > 0 
      ? Math.ceil(Math.max(...notes.map(n => n.startTime + n.duration)))
      : 16)
  
  const maxRawStart = notes.length > 0 ? Math.max(...notes.map(n => n.startTime)) : 0
  const maxRawEnd = notes.length > 0 ? Math.max(...notes.map(n => n.startTime + n.duration)) : 0

  // Handle compressed timing encodings from different pipelines:
  // 1) Fully normalized [0..1] -> scale by pattern length
  // 2) Short-span values (e.g., ~2 beats for a 16-beat clip) -> stretch to full length
  let timeScale = 1
  if (lengthInBeats > 1 && maxRawStart <= 1.01) {
    timeScale = lengthInBeats
  } else if (lengthInBeats > 1 && maxRawEnd > 0 && maxRawEnd < lengthInBeats * 0.75) {
    timeScale = lengthInBeats / maxRawEnd
  }

  const normalizedNotes = timeScale !== 1
    ? notes.map(note => ({
        ...note,
        startTime: note.startTime * timeScale,
      }))
    : notes

  // Group notes by pitch
  const notesByPitch = normalizedNotes.reduce((acc, note) => {
    if (!acc[note.pitch]) {
      acc[note.pitch] = []
    }
    acc[note.pitch].push(note)
    return acc
  }, {} as Record<number, MIDINoteData[]>)

  // Get unique drum rows present in the pattern
  const activePitches = Object.keys(notesByPitch)
    .map(Number)
    .sort((a, b) => {
      const drumA = DRUM_NOTES[a] || getDefaultDrum(a)
      const drumB = DRUM_NOTES[b] || getDefaultDrum(b)
      return drumA.row - drumB.row
    })

  // Group pitches by row for compact view
  const activeRows = new Set(activePitches.map(p => (DRUM_NOTES[p] || getDefaultDrum(p)).row))
  const rowLabels = [
    { row: 0, label: '🥁', name: 'Kick' },
    { row: 1, label: '🎯', name: 'Snare' },
    { row: 2, label: '🔔', name: 'HH' },
    { row: 3, label: '🎚️', name: 'Ride' },
    { row: 4, label: '💥', name: 'Crash' },
    { row: 5, label: '🪘', name: 'Toms' },
    { row: 6, label: '🎵', name: 'Perc' },
  ].filter(r => activeRows.has(r.row))

  // Calculate grid dimensions
  const beatsToShow = Math.ceil(lengthInBeats)
  const divisions = compact ? 16 : 32 // Grid resolution
  const cellWidth = compact ? 'w-1.5' : 'w-2'
  const cellHeight = compact ? 'h-3' : 'h-4'

  return (
    <div className={cn('space-y-1', className)}>
      {/* Pattern grid */}
      <div className="space-y-0.5">
        {rowLabels.map(({ row, label, name }) => {
          // Get all notes in this row
          const rowNotes = activePitches
            .filter(p => (DRUM_NOTES[p] || getDefaultDrum(p)).row === row)
            .flatMap(p => notesByPitch[p].map(n => ({ ...n, pitch: p })))

          return (
            <div key={row} className="flex items-center gap-1">
              {/* Row label */}
              <div 
                className="text-[10px] w-6 text-center" 
                title={name}
              >
                {label}
              </div>

              {/* Beat grid */}
              <div className="flex-1 flex gap-px bg-muted/20 p-px rounded">
                {Array.from({ length: divisions }).map((_, i) => {
                  const beatPosition = (i / divisions) * beatsToShow
                  
                  // Find notes that occur in this grid cell
                  const cellNotes = rowNotes.filter(note => {
                    const notePos = note.startTime
                    const cellStart = beatPosition
                    const cellEnd = ((i + 1) / divisions) * beatsToShow
                    return notePos >= cellStart && notePos < cellEnd
                  })

                  const hasNote = cellNotes.length > 0
                  const maxVelocity = hasNote 
                    ? Math.max(...cellNotes.map(n => n.velocity)) 
                    : 0
                  const opacity = maxVelocity / 127

                  // Get color from first note's drum mapping
                  const color = hasNote 
                    ? (DRUM_NOTES[cellNotes[0].pitch] || getDefaultDrum(cellNotes[0].pitch)).color
                    : 'bg-muted/10'

                  return (
                    <div
                      key={i}
                      className={cn(
                        cellWidth,
                        cellHeight,
                        'rounded-sm transition-all',
                        hasNote ? color : 'bg-muted/10'
                      )}
                      style={{
                        opacity: hasNote ? Math.max(0.3, opacity) : 0.3,
                      }}
                      title={hasNote ? `${cellNotes.length} hit(s) @ ${beatPosition.toFixed(2)}b` : undefined}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Beat markers */}
      {!compact && (
        <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
          <div className="w-6" /> {/* Spacer for label column */}
          <div className="flex-1 flex justify-between px-0.5">
            {Array.from({ length: Math.min(beatsToShow + 1, 9) }).map((_, i) => (
              <span key={i} className={cn(i % 4 === 0 && 'font-bold')}>
                {i}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      {!compact && midiClip.tempo && (
        <div className="text-[9px] text-muted-foreground text-center">
          {midiClip.tempo} BPM · {normalizedNotes.length} notes · {lengthInBeats}b
        </div>
      )}
    </div>
  )
}

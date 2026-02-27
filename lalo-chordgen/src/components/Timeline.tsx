import React from 'react'
import { useTransportStore } from '@/stores'
import type { IdeaCardData } from './IdeaCard'
import BeatRuler from './BeatRuler'
import CardRail, { CardRailItem } from './CardRail'

export type TimelineRail = {
  id: string
  label: string
  colorClass: string
}

type Props = {
  items: CardRailItem[]
  rails: TimelineRail[]
  totalBeats?: number
  pxPerBeat?: number
  selectedIds: Record<string, boolean>
  showPlaybackCursor?: boolean
  onToggleSelect: (id: string) => void
  onPlayCard: (card: IdeaCardData) => void
  onMoveCard: (id: string, deltaBeat: number) => void
  onAdjustLength: (id: string, deltaBeats: number) => void
  onDeleteCard: (id: string) => void
  onDropCard: (card: IdeaCardData, startBeat: number, railId: string) => void
}

export default function Timeline({
  items,
  rails,
  totalBeats = 64,
  pxPerBeat = 24,
  selectedIds,
  showPlaybackCursor = false,
  onToggleSelect,
  onPlayCard,
  onMoveCard,
  onAdjustLength,
  onDeleteCard,
  onDropCard,
}: Props) {
  // Get current beat for playback cursor
  const currentBeat = useTransportStore((state) => state.currentBeat)
  const isPlaying = useTransportStore((state) => state.isPlaying)

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const raw = e.dataTransfer.getData('application/json')
    if (!raw) return

    let card: IdeaCardData
    try {
      card = JSON.parse(raw)
    } catch {
      return
    }

    const container = e.currentTarget as HTMLDivElement
    const rect = container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const rulerHeight = 28
    const railHeight = 52
    const railIndex = Math.max(0, Math.min(rails.length - 1, Math.floor((y - rulerHeight) / railHeight)))
    const rail = rails[railIndex]
    if (!rail) return

    const startBeat = Math.max(0, Math.round(x / pxPerBeat))
    onDropCard(card, startBeat, rail.id)
  }

  return (
    <div
      className="rounded-lg overflow-auto bg-black/25 border border-white/10 relative"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <BeatRuler totalBeats={totalBeats} pxPerBeat={pxPerBeat} beatsPerBar={4} />
      {rails.map((rail) => (
        <CardRail
          key={rail.id}
          railId={rail.id}
          label={rail.label}
          colorClass={rail.colorClass}
          items={items.filter((it) => it.railId === rail.id)}
          totalBeats={totalBeats}
          pxPerBeat={pxPerBeat}
          selectedIds={selectedIds}
          onToggleSelect={onToggleSelect}
          onPlayCard={onPlayCard}
          onMoveCard={onMoveCard}
          onAdjustLength={onAdjustLength}
          onDeleteCard={onDeleteCard}
        />
      ))}
      
      {/* Playback cursor */}
      {showPlaybackCursor && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-rose-500 pointer-events-none z-50 transition-opacity duration-200"
          style={{
            left: `${currentBeat * pxPerBeat}px`,
            opacity: isPlaying ? 0.8 : 0.3,
          }}
        >
          {/* Cursor head (triangle) */}
          <div className="absolute -top-1 -left-1.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-rose-500" />
        </div>
      )}
    </div>
  )
}

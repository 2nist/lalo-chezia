import type { IdeaCardData } from './IdeaCard'
import TimelineCard from './TimelineCard'

export type CardRailItem = {
  id: string
  card: IdeaCardData
  startBeat: number
  railId: string
}

type Props = {
  railId: string
  label: string
  colorClass: string
  items: CardRailItem[]
  totalBeats: number
  pxPerBeat: number
  railHeight?: number
  selectedIds: Record<string, boolean>
  onToggleSelect: (id: string) => void
  onPlayCard: (card: IdeaCardData) => void
  onMoveCard: (id: string, deltaBeat: number) => void
  onAdjustLength: (id: string, deltaBeats: number) => void
  onDeleteCard: (id: string) => void
}

const WIDTH_CLASSES_24 = [
  'w-6',
  'w-12',
  'w-[4.5rem]',
  'w-24',
  'w-[7.5rem]',
  'w-36',
  'w-[10.5rem]',
  'w-48',
  'w-[13.5rem]',
  'w-60',
  'w-[16.5rem]',
  'w-72',
  'w-[19.5rem]',
  'w-[21rem]',
  'w-[22.5rem]',
  'w-96',
]

const WIDTH_CLASSES_16 = [
  'w-4',
  'w-8',
  'w-12',
  'w-16',
  'w-20',
  'w-24',
  'w-28',
  'w-32',
  'w-36',
  'w-40',
  'w-44',
  'w-48',
  'w-52',
  'w-56',
  'w-60',
  'w-64',
]

const WIDTH_CLASSES_48 = [
  'w-12',
  'w-24',
  'w-36',
  'w-48',
  'w-60',
  'w-72',
  'w-84',
  'w-96',
  'w-[27rem]',
  'w-[30rem]',
  'w-[33rem]',
  'w-[36rem]',
  'w-[39rem]',
  'w-[42rem]',
  'w-[45rem]',
  'w-[48rem]',
]

function getLengthWidthClass(lengthBeats: number, pxPerBeat: number): string {
  const idx = Math.max(1, Math.min(16, Math.floor(lengthBeats))) - 1
  if (pxPerBeat >= 48) return WIDTH_CLASSES_48[idx]
  if (pxPerBeat >= 24) return WIDTH_CLASSES_24[idx]
  return WIDTH_CLASSES_16[idx]
}

export default function CardRail({
  railId,
  label,
  colorClass,
  items,
  totalBeats,
  pxPerBeat,
  railHeight: _railHeight = 64,
  selectedIds,
  onToggleSelect,
  onPlayCard,
  onMoveCard,
  onAdjustLength,
  onDeleteCard,
}: Props) {
  const beatWidthClass =
    pxPerBeat >= 48 ? 'w-12' : pxPerBeat >= 24 ? 'w-6' : 'w-4'

  const itemsByBeat = items.reduce<Record<number, CardRailItem[]>>((acc, it) => {
    const beat = Math.max(0, Math.floor(it.startBeat))
    if (!acc[beat]) acc[beat] = []
    acc[beat].push(it)
    return acc
  }, {})

  const selectedInRail = items.find((it) => selectedIds[it.id])

  return (
    <div className="border-b border-white/10" data-rail-id={railId}>
      <div className="px-1 py-1 flex items-center justify-between">
        <div className="text-[10px] text-slate-300 uppercase tracking-wide">{label}</div>
        {selectedInRail && (
          <div className="flex items-center gap-1 text-[9px]">
            <button
              className="px-1 rounded border border-white/20 text-slate-200 hover:bg-white/10"
              onClick={() => onMoveCard(selectedInRail.id, -1)}
              title="Move left 1 beat"
            >
              ←
            </button>
            <button
              className="px-1 rounded border border-white/20 text-slate-200 hover:bg-white/10"
              onClick={() => onMoveCard(selectedInRail.id, 1)}
              title="Move right 1 beat"
            >
              →
            </button>
            <button
              className="px-1 rounded border border-white/20 text-slate-200 hover:bg-white/10"
              onClick={() => onAdjustLength(selectedInRail.id, -1)}
              title="Shorten"
            >
              -L
            </button>
            <button
              className="px-1 rounded border border-white/20 text-slate-200 hover:bg-white/10"
              onClick={() => onAdjustLength(selectedInRail.id, 1)}
              title="Lengthen"
            >
              +L
            </button>
            <button
              className="px-1 rounded border border-rose-400/40 text-rose-200 hover:bg-rose-500/20"
              onClick={() => onDeleteCard(selectedInRail.id)}
              title="Delete"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div className="flex h-9">
        {Array.from({ length: totalBeats }).map((_, beat) => {
          const beatItems = itemsByBeat[beat] ?? []
          return (
            <div
              key={`${railId}-${beat}`}
              className={`relative h-full shrink-0 border-r ${beat % 4 === 0 ? 'border-white/10' : 'border-white/5'} ${beatWidthClass}`}
              title={`Beat ${beat}`}
            >
              {beatItems.slice(0, 2).map((it, idx) => (
                <TimelineCard
                  key={it.id}
                  item={it}
                  pxPerBeat={pxPerBeat}
                  colorClass={colorClass}
                  selected={!!selectedIds[it.id]}
                  isTopCard={idx === 0}
                  totalBeats={totalBeats}
                  onToggleSelect={onToggleSelect}
                  onPlayCard={onPlayCard}
                  onMoveCard={onMoveCard}
                  onAdjustLength={onAdjustLength}
                  onDeleteCard={onDeleteCard}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

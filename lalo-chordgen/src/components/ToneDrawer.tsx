/**
 * ToneDrawer - Left-side vertical drawer for tone cards
 */

import { useState, useMemo } from 'react'
import CardChip from './CardChip'
import CardContextMenu from './CardContextMenu'
import type { IdeaCardData } from './IdeaCard'
import { Input } from './ui/input'

type Props = {
  cards: IdeaCardData[]
  title?: string
  onPlayCard?: (card: IdeaCardData) => void
  onStopCard?: () => void
  playingCardId?: string | null
  onDuplicate?: (card: IdeaCardData) => void
  onEdit?: (card: IdeaCardData) => void
  onAddToTimeline?: (card: IdeaCardData) => void
  onViewDetails?: (card: IdeaCardData) => void
  onDelete?: (card: IdeaCardData) => void
}

export default function ToneDrawer({ 
  cards, 
  title = 'Tone Cards', 
  onPlayCard,
  onStopCard,
  playingCardId,
  onDuplicate,
  onEdit,
  onAddToTimeline,
  onViewDetails,
  onDelete,
}: Props) {
  const toneFacetOptions = ['mode', 'cadence', 'progression', 'voicing', 'bass'] as const
  const [searchTerm, setSearchTerm] = useState('')
  const [showGlobal, setShowGlobal] = useState(true)
  const [showLocal, setShowLocal] = useState(true)
  const [activeFacets, setActiveFacets] = useState<string[]>([])
  const [globalExpanded, setGlobalExpanded] = useState(false)
  const [localExpanded, setLocalExpanded] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ card: IdeaCardData; x: number; y: number } | null>(null)

  const toggleFacet = (facet: string) => {
    setActiveFacets((current) =>
      current.includes(facet)
        ? current.filter((f) => f !== facet)
        : [...current, facet]
    )
  }

  const matchesFacet = (card: IdeaCardData, facet: string) => {
    const tagMatch = card.tags?.some((tag) => tag.toLowerCase().includes(facet))
    const labelMatch = card.label.toLowerCase().includes(facet)
    const modeMatch = facet === 'mode' && !!card.mode
    return Boolean(tagMatch || labelMatch || modeMatch)
  }

  const filteredCards = useMemo(() => {
    let filtered = cards.filter(c => c.type === 'tone')
    
    if (!showGlobal) {
      filtered = filtered.filter(c => c.scope !== 'global')
    }
    if (!showLocal) {
      filtered = filtered.filter(c => c.scope !== 'local')
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(c => 
        c.label.toLowerCase().includes(term) ||
        c.mode?.toLowerCase().includes(term) ||
        c.tags?.some(tag => tag.toLowerCase().includes(term))
      )
    }

    if (activeFacets.length > 0) {
      filtered = filtered.filter((c) =>
        activeFacets.some((facet) => matchesFacet(c, facet))
      )
    }
    
    return filtered
  }, [cards, showGlobal, showLocal, searchTerm, activeFacets])

  const globalCards = filteredCards.filter(c => c.scope === 'global')
  const localCards = filteredCards.filter(c => c.scope === 'local')

  const handleContextMenu = (card: IdeaCardData, x: number, y: number) => {
    setContextMenu({ card, x, y })
  }

  return (
    <>
      <div className="h-full flex flex-col bg-card border-r border-border w-40">
        {/* Header */}
        <div className="p-3 border-b border-border space-y-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎵</span>
            <h3 className="text-sm font-semibold">{title}</h3>
          </div>
          
          {/* Search */}
          <Input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 text-xs"
          />

          {/* Scope filters */}
          <div className="flex items-center gap-2 text-[10px]">
            <label className="inline-flex items-center gap-1 text-amber-200">
              <input
                type="checkbox"
                checked={showGlobal}
                onChange={(e) => setShowGlobal(e.target.checked)}
                className="h-3 w-3 rounded border-border bg-background"
                aria-label="Show global tone cards"
              />
              <span>Global</span>
            </label>
            <label className="inline-flex items-center gap-1 text-emerald-200">
              <input
                type="checkbox"
                checked={showLocal}
                onChange={(e) => setShowLocal(e.target.checked)}
                className="h-3 w-3 rounded border-border bg-background"
                aria-label="Show local tone cards"
              />
              <span>Local</span>
            </label>
          </div>

          <div className="flex items-center justify-between gap-1">
            <div className="flex flex-wrap gap-1">
            {toneFacetOptions.map((facet) => {
              const checked = activeFacets.includes(facet)
              return (
                <label
                  key={facet}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-border/70 text-[9px]"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleFacet(facet)}
                    className="h-2.5 w-2.5 rounded border-border bg-background"
                    aria-label={`Filter tone cards by ${facet}`}
                  />
                  <span className={checked ? 'text-foreground' : 'text-muted-foreground'}>
                    {facet}
                  </span>
                </label>
              )
            })}
            </div>
            {activeFacets.length > 0 && (
              <button
                onClick={() => setActiveFacets([])}
                className="text-[9px] px-1.5 py-0.5 rounded border border-border/70 text-muted-foreground hover:text-foreground"
                aria-label="Clear tone facet filters"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-[10px] text-muted-foreground text-center">
            {filteredCards.length} cards
          </div>
        </div>

        {/* Card list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {/* Global cards section */}
          {showGlobal && globalCards.length > 0 && (
            <div className="space-y-1">
              <button
                onClick={() => setGlobalExpanded((v) => !v)}
                className="w-full flex items-center justify-between text-[10px] font-semibold text-amber-200 px-2 py-1.5 rounded bg-amber-500/10 border border-amber-500/20 uppercase tracking-wide"
              >
                <span>Global ({globalCards.length})</span>
                <span>{globalExpanded ? '▾' : '▸'}</span>
              </button>
              {globalExpanded && (
                <div className="space-y-1">
                  {globalCards.map((card) => (
                    <CardChip
                      key={card.id}
                      card={card}
                      compact
                      onContextMenu={handleContextMenu}
                      onPlay={onPlayCard}
                      onStop={onStopCard}
                      isPlaying={playingCardId === card.id}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Local cards section */}
          {showLocal && localCards.length > 0 && (
            <div className="space-y-1">
              <button
                onClick={() => setLocalExpanded((v) => !v)}
                className="w-full flex items-center justify-between text-[10px] font-semibold text-emerald-200 px-2 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-wide"
              >
                <span>Local ({localCards.length})</span>
                <span>{localExpanded ? '▾' : '▸'}</span>
              </button>
              {localExpanded && (
                <div className="space-y-1">
                  {localCards.map((card) => (
                    <CardChip
                      key={card.id}
                      card={card}
                      compact
                      onContextMenu={handleContextMenu}
                      onPlay={onPlayCard}
                      onStop={onStopCard}
                      isPlaying={playingCardId === card.id}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {filteredCards.length === 0 && (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No tone cards found
            </div>
          )}
        </div>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <CardContextMenu
          card={contextMenu.card}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onPlay={onPlayCard}
          onDuplicate={onDuplicate}
          onEdit={onEdit}
          onAddToTimeline={onAddToTimeline}
          onViewDetails={onViewDetails}
          onDelete={onDelete}
        />
      )}
    </>
  )
}

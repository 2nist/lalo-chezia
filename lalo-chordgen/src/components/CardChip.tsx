/**
 * CardChip - Compact card component with visual variants
 * Smaller form factor with better color coding and shape differentiation
 */

import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { IdeaCardData } from './IdeaCard'
import PatternVisualization from './PatternVisualization'

type Props = {
  card: IdeaCardData
  onContextMenu?: (card: IdeaCardData, x: number, y: number) => void
  onPlay?: (card: IdeaCardData) => void
  onStop?: () => void
  isPlaying?: boolean
  compact?: boolean
}

export default function CardChip({
  card,
  onContextMenu,
  onPlay,
  onStop,
  isPlaying = false,
  compact = false,
}: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [showPattern, setShowPattern] = useState(false)
  const chipRef = useRef<HTMLDivElement>(null)

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(card))
    e.dataTransfer.effectAllowed = 'copy'
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    if (onContextMenu && chipRef.current) {
      onContextMenu(card, e.clientX, e.clientY)
    }
  }, [card, onContextMenu])

  const handleClick = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click
      if (isPlaying && onStop) {
        onStop()
      } else if (onPlay) {
        onPlay(card)
      }
    }
  }

  // Visual configuration by type and scope
  const getCardStyles = () => {
    const isTone = card.type === 'tone'
    const isGlobal = card.scope === 'global'

    // Base styles
    let bgClass = ''
    let borderClass = ''
    let shapeClass = ''
    let iconBg = ''
    let glowClass = ''

    if (isTone) {
      // Tone cards: Green, rounded
      bgClass = isGlobal 
        ? 'bg-gradient-to-br from-emerald-500/20 to-green-600/10' 
        : 'bg-gradient-to-br from-emerald-400/15 to-green-500/5'
      borderClass = isGlobal 
        ? 'border-2 border-emerald-500/50' 
        : 'border border-emerald-400/30'
      shapeClass = 'rounded-2xl'
      iconBg = 'bg-emerald-500/20'
      glowClass = isGlobal ? 'shadow-lg shadow-emerald-500/25' : ''
    } else {
      // Time cards: Blue, less rounded
      bgClass = isGlobal 
        ? 'bg-gradient-to-br from-blue-500/20 to-cyan-600/10' 
        : 'bg-gradient-to-br from-blue-400/15 to-cyan-500/5'
      borderClass = isGlobal 
        ? 'border-2 border-blue-500/50' 
        : 'border border-blue-400/30'
      shapeClass = 'rounded-lg'
      iconBg = 'bg-blue-500/20'
      glowClass = isGlobal ? 'shadow-lg shadow-blue-500/25' : ''
    }

    return { bgClass, borderClass, shapeClass, iconBg, glowClass }
  }

  const { bgClass, borderClass, shapeClass, iconBg, glowClass } = getCardStyles()
  const intensity = (card.intensity ?? 0.5) * 100
  const intensityWidthClass =
    intensity >= 95 ? 'w-full' :
    intensity >= 90 ? 'w-[90%]' :
    intensity >= 80 ? 'w-[80%]' :
    intensity >= 70 ? 'w-[70%]' :
    intensity >= 60 ? 'w-[60%]' :
    intensity >= 50 ? 'w-1/2' :
    intensity >= 40 ? 'w-[40%]' :
    intensity >= 30 ? 'w-[30%]' :
    intensity >= 20 ? 'w-[20%]' :
    'w-[10%]'

  return (
    <div
      ref={chipRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onContextMenu={handleContextMenu}
      onClick={handleClick}
      onMouseEnter={() => setShowPattern(true)}
      onMouseLeave={() => setShowPattern(false)}
      className={cn(
        'relative group select-none cursor-grab active:cursor-grabbing',
        'transition-all duration-200',
        'hover:scale-105 hover:-translate-y-0.5',
        shapeClass,
        bgClass,
        borderClass,
        glowClass,
        isDragging && 'opacity-50 cursor-grabbing',
        isPlaying && 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-background',
        compact ? 'w-full min-h-14' : 'w-32 min-h-22'
      )}
      role="button"
      tabIndex={0}
      aria-label={`${card.label} - ${card.type} ${card.scope} card`}
    >
      {/* Content */}
      <div className={cn(compact ? 'p-2 space-y-1.5' : 'p-2.5 space-y-2')}>
        {/* Header row */}
        <div className="flex items-center justify-between gap-1.5">
          {/* Type icon */}
          <div className={cn(
            'flex items-center justify-center rounded-full text-xs',
            compact ? 'w-5 h-5' : 'w-6 h-6',
            iconBg
          )}>
            {card.type === 'tone' ? '🎵' : '⏱️'}
          </div>

          {/* Scope indicator */}
          {card.scope === 'global' && (
            <div className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-200">
              ★
            </div>
          )}
        </div>

        {/* Card name */}
        <div className={cn(
          'font-semibold leading-tight text-foreground',
          compact ? 'text-[11px] line-clamp-1' : 'text-xs line-clamp-2'
        )}>
          {card.label}
        </div>

        {!compact && (
          <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                intensityWidthClass,
                card.type === 'tone' ? 'bg-emerald-400' : 'bg-blue-400'
              )}
              aria-label={`Intensity: ${Math.round(intensity)}%`}
            />
          </div>
        )}

        {/* Metadata pills */}
        <div className={cn('flex flex-wrap gap-1', compact && 'hidden')}>
          {/* Duration type indicator */}
          {card.durationType === 'continuous' && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200 font-medium border border-purple-400/30">
              ∞ Continuous
            </span>
          )}
          
          {card.mode && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground font-medium">
              {card.mode}
            </span>
          )}
          {card.tempoModifier && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground font-medium">
              {card.tempoModifier}
            </span>
          )}
          {/* Only show beat length for instance cards */}
          {card.durationType !== 'continuous' && card.lengthBeats && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground font-medium">
              {card.lengthBeats}b
              {card.repeatCount && card.repeatCount > 1 && (
                <span className="opacity-70"> × {card.repeatCount}</span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Pattern visualization overlay */}
      {showPattern && card.midiClip && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-inherit p-1.5 z-10">
          <PatternVisualization midiClip={card.midiClip} compact />
        </div>
      )}

      {/* Playing indicator */}
      {isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-inherit">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-yellow-400 animate-pulse [animation-delay:0ms]" />
            <div className="w-1 h-4 bg-yellow-400 animate-pulse [animation-delay:150ms]" />
            <div className="w-1 h-4 bg-yellow-400 animate-pulse [animation-delay:300ms]" />
          </div>
        </div>
      )}

      {/* Hover overlay for drag indicator */}
      <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-inherit" />
    </div>
  )
}

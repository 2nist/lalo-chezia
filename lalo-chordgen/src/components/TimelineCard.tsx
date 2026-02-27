/**
 * TimelineCard - Interactive card on timeline with drag, resize, and context menu
 */

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import CardContextMenu from './CardContextMenu'
import type { IdeaCardData } from './IdeaCard'
import type { CardRailItem } from './CardRail'

type Props = {
  item: CardRailItem
  pxPerBeat: number
  colorClass: string
  selected: boolean
  isTopCard: boolean
  totalBeats: number
  onToggleSelect: (id: string) => void
  onPlayCard: (card: IdeaCardData) => void
  onMoveCard: (id: string, deltaBeat: number) => void
  onAdjustLength: (id: string, deltaBeats: number) => void
  onDeleteCard: (id: string) => void
}

type DragState = {
  isDragging: boolean
  startX: number
  startBeat: number
  isResizing: 'left' | 'right' | null
  startLength: number
}

export default function TimelineCard({
  item,
  pxPerBeat,
  colorClass,
  selected,
  isTopCard,
  totalBeats,
  onToggleSelect,
  onPlayCard,
  onMoveCard,
  onAdjustLength,
  onDeleteCard,
}: Props) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startBeat: 0,
    isResizing: null,
    startLength: 0,
  })

  const cardRef = useRef<HTMLDivElement>(null)
  const length = Math.max(1, item.card.lengthBeats ?? 4)
  const widthPx = length * pxPerBeat

  // Handle right-click for context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  // Handle card click (select)
  const handleClick = () => {
    if (!dragState.isDragging) {
      onToggleSelect(item.id)
    }
  }

  // Handle double-click (play)
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onPlayCard(item.card)
  }

  // Start dragging card to move
  const handleMouseDownMove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDragState({
      isDragging: true,
      startX: e.clientX,
      startBeat: item.startBeat,
      isResizing: null,
      startLength: length,
    })
  }

  // Start resizing left edge
  const handleMouseDownResizeLeft = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDragState({
      isDragging: true,
      startX: e.clientX,
      startBeat: item.startBeat,
      isResizing: 'left',
      startLength: length,
    })
  }

  // Start resizing right edge
  const handleMouseDownResizeRight = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDragState({
      isDragging: true,
      startX: e.clientX,
      startBeat: item.startBeat,
      isResizing: 'right',
      startLength: length,
    })
  }

  // Handle mouse move during drag/resize
  useEffect(() => {
    if (!dragState.isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragState.startX
      const deltaBeats = Math.round(deltaX / pxPerBeat)

      if (dragState.isResizing === 'left') {
        // Resize from left: move start position and adjust length
        if (deltaBeats !== 0) {
          const newLength = dragState.startLength - deltaBeats
          if (newLength >= 1 && dragState.startBeat + deltaBeats >= 0) {
            onMoveCard(item.id, deltaBeats)
            onAdjustLength(item.id, -deltaBeats)
          }
        }
      } else if (dragState.isResizing === 'right') {
        // Resize from right: adjust length only
        if (deltaBeats !== 0) {
          const newLength = dragState.startLength + deltaBeats
          if (newLength >= 1) {
            onAdjustLength(item.id, deltaBeats - (length - dragState.startLength))
          }
        }
      } else {
        // Move card
        if (deltaBeats !== 0) {
          const newBeat = dragState.startBeat + deltaBeats
          if (newBeat >= 0 && newBeat + length <= totalBeats) {
            onMoveCard(item.id, deltaBeats)
          }
        }
      }
    }

    const handleMouseUp = () => {
      setDragState({
        isDragging: false,
        startX: 0,
        startBeat: 0,
        isResizing: null,
        startLength: 0,
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState, pxPerBeat, item.id, length, totalBeats, onMoveCard, onAdjustLength])

  return (
    <>
      <div
        ref={cardRef}
        className={cn(
          'absolute rounded px-1 text-[9px] text-left truncate border group',
          isTopCard ? 'top-0.5' : 'top-[1.15rem]',
          colorClass,
          selected ? 'ring-1 ring-purple-300 z-20' : 'z-10',
          dragState.isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab hover:shadow-lg'
        )}
        style={{
          left: `${item.startBeat * pxPerBeat + 2}px`,
          width: `${widthPx - 4}px`,
          minWidth: '24px',
        }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDownMove}
        title={`${item.card.label} (${length} beats) - Drag to move, drag edges to resize, right-click for options`}
      >
        {/* Left resize handle */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 bg-purple-400/60 opacity-0 group-hover:opacity-100 cursor-ew-resize hover:bg-purple-400"
          onMouseDown={handleMouseDownResizeLeft}
          title="Drag to resize"
        />

        {/* Card content */}
        <span className="pointer-events-none select-none">
          {item.card.label} · {length}b
        </span>

        {/* Right resize handle */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1 bg-purple-400/60 opacity-0 group-hover:opacity-100 cursor-ew-resize hover:bg-purple-400"
          onMouseDown={handleMouseDownResizeRight}
          title="Drag to resize"
        />

        {/* Delete button on hover */}
        {selected && (
          <button
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] leading-none opacity-0 group-hover:opacity-100 hover:bg-rose-600 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation()
              onDeleteCard(item.id)
            }}
            title="Delete card"
          >
            ×
          </button>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <CardContextMenu
          card={item.card}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onPlay={onPlayCard}
          onDelete={() => onDeleteCard(item.id)}
          items={[
            {
              label: 'Play',
              icon: '▶️',
              action: onPlayCard,
            },
            {
              label: 'Move Left (←)',
              icon: '⬅️',
              action: () => onMoveCard(item.id, -1),
            },
            {
              label: 'Move Right (→)',
              icon: '➡️',
              action: () => onMoveCard(item.id, 1),
            },
            {
              label: 'Shorten (-1 beat)',
              icon: '⬅️',
              action: () => onAdjustLength(item.id, -1),
              disabled: length <= 1,
            },
            {
              label: 'Lengthen (+1 beat)',
              icon: '➡️',
              action: () => onAdjustLength(item.id, 1),
            },
            {
              label: 'Delete',
              icon: '🗑️',
              action: () => onDeleteCard(item.id),
              destructive: true,
            },
          ]}
        />
      )}
    </>
  )
}

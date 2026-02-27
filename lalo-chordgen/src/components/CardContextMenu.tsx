/**
 * CardContextMenu - Right-click context menu for card actions
 */

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { IdeaCardData } from './IdeaCard'

type MenuItem = {
  label: string
  icon?: string
  action: (card: IdeaCardData) => void
  disabled?: boolean
  destructive?: boolean
}

type Props = {
  card: IdeaCardData
  x: number
  y: number
  onClose: () => void
  items?: MenuItem[]
  onPlay?: (card: IdeaCardData) => void
  onDuplicate?: (card: IdeaCardData) => void
  onEdit?: (card: IdeaCardData) => void
  onAddToTimeline?: (card: IdeaCardData) => void
  onViewDetails?: (card: IdeaCardData) => void
  onDelete?: (card: IdeaCardData) => void
}

export default function CardContextMenu({ 
  card, 
  x, 
  y, 
  onClose, 
  items,
  onPlay,
  onDuplicate,
  onEdit,
  onAddToTimeline,
  onViewDetails,
  onDelete,
}: Props) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Default menu items
  const defaultItems: MenuItem[] = [
    {
      label: 'Play',
      icon: '▶️',
      action: (card) => {
        onPlay?.(card)
        onClose()
      },
    },
    {
      label: 'Duplicate',
      icon: '📋',
      action: (card) => {
        onDuplicate?.(card)
        onClose()
      },
    },
    {
      label: 'Edit',
      icon: '✏️',
      action: (card) => {
        onEdit?.(card)
        onClose()
      },
    },
    {
      label: 'Add to Timeline',
      icon: '➕',
      action: (card) => {
        onAddToTimeline?.(card)
        onClose()
      },
    },
    {
      label: 'View Details',
      icon: 'ℹ️',
      action: (card) => {
        onViewDetails?.(card)
        onClose()
      },
    },
    {
      label: 'Delete',
      icon: '🗑️',
      action: (card) => {
        onDelete?.(card)
        onClose()
      },
      destructive: true,
    },
  ]

  const menuItems = items || defaultItems

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Delay adding listeners to avoid immediate close from the right-click event
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }, 10)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  // Adjust position to keep menu on screen
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let adjustedX = x
      let adjustedY = y

      if (x + rect.width > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 10
      }

      if (y + rect.height > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 10
      }

      menuRef.current.style.left = `${adjustedX}px`
      menuRef.current.style.top = `${adjustedY}px`
    }
  }, [x, y])

  const handleItemClick = (item: MenuItem) => {
    if (!item.disabled) {
      item.action(card)
      onClose()
    }
  }

  return (
    <div
      ref={menuRef}
      className={cn(
        'fixed z-50 min-w-[180px]',
        'bg-popover border border-border rounded-lg shadow-lg',
        'py-1 animate-in fade-in-0 zoom-in-95 duration-100'
      )}
      style={{ left: x, top: y }}
      role="menu"
      aria-label="Card context menu"
    >
      {/* Card info header */}
      <div className="px-3 py-2 border-b border-border">
        <div className="text-xs font-semibold text-foreground truncate">
          {card.label}
        </div>
        <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
          <span>{card.type === 'tone' ? '🎵' : '⏱️'}</span>
          <span>{card.type}</span>
          <span>•</span>
          <span>{card.scope}</span>
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm',
              'transition-colors',
              item.disabled
                ? 'text-muted-foreground cursor-not-allowed opacity-50'
                : item.destructive
                ? 'text-destructive hover:bg-destructive/10'
                : 'text-foreground hover:bg-accent',
              'focus:outline-none focus:bg-accent'
            )}
            role="menuitem"
          >
            {item.icon && <span className="text-base">{item.icon}</span>}
            <span className="flex-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

import React, { useRef, useState } from 'react'
import IdeaCard, { IdeaCardData } from './IdeaCard'
import { cn } from '@/lib/utils'

type Props = {
  cards: IdeaCardData[]
  title?: string
  filterScope?: 'global' | 'local' | 'all'
}

export default function IdeaDrawer({cards, title = 'Ideas', filterScope = 'all'}: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  
  // Filter cards based on scope
  const filteredCards = filterScope === 'all' 
    ? cards 
    : cards.filter(c => c.scope === filterScope)
  
  const [canScrollRight, setCanScrollRight] = useState(filteredCards.length > 2)

  const checkScroll = () => {
    if (!scrollContainerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    const amount = 300
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
        <div className="text-xs text-muted-foreground">{filteredCards.length} items</div>
      </div>

      {/* Scroll container with fade indicators */}
      <div className="relative group">
        {/* Left fade & button */}
        {canScrollLeft && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <button
              onClick={() => scroll('left')}
              aria-label="Scroll left"
              className={cn(
                'absolute left-1 top-1/2 -translate-y-1/2 z-20',
                'opacity-0 group-hover:opacity-100 transition-opacity',
                'p-2 rounded-full bg-primary/80 hover:bg-primary text-primary-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary/60'
              )}
            >
              ←
            </button>
          </>
        )}

        {/* Right fade & button */}
        {canScrollRight && (
          <>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            <button
              onClick={() => scroll('right')}
              aria-label="Scroll right"
              className={cn(
                'absolute right-1 top-1/2 -translate-y-1/2 z-20',
                'opacity-0 group-hover:opacity-100 transition-opacity',
                'p-2 rounded-full bg-primary/80 hover:bg-primary text-primary-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary/60'
              )}
            >
              →
            </button>
          </>
        )}

        {/* Cards container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          onLoad={checkScroll}
          className="flex gap-3 overflow-x-auto py-2 px-1 scrollbar-hide"
          role="region"
          aria-label={`${title} carousel`}
        >
          {filteredCards.length === 0 ? (
            <div className="w-full flex items-center justify-center py-8 text-muted-foreground">
              No ideas yet
            </div>
          ) : (
            filteredCards.map(c => (
              <div key={c.id} className="flex-shrink-0">
                <IdeaCard card={c} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

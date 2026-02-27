/**
 * Card Browser
 * Browse, search, and filter the card database
 */

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cardManager, type CardFilterOptions } from '@/services/cards/cardManager';
import { CardCategory, CardScope } from '@/types/card';
import IdeaCard from './IdeaCard';
import { cardsToIdeaCardData } from '@/services/cards/cardAdapter';

export default function CardBrowser() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CardCategory | undefined>();
  const [scopeFilter, setScopeFilter] = useState<CardScope | undefined>();
  const [showStats, setShowStats] = useState(false);

  // Get filtered cards
  const filteredResult = useMemo(() => {
    const options: CardFilterOptions = {
      searchTerm,
      category: categoryFilter,
      scope: scopeFilter,
    };
    return cardManager.filterCards(options);
  }, [searchTerm, categoryFilter, scopeFilter]);

  const stats = useMemo(() => cardManager.getStatistics(), []);

  // Convert to IdeaCardData for display
  const displayCards = useMemo(
    () => cardsToIdeaCardData(filteredResult.cards),
    [filteredResult.cards]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Card Library</h2>
          <p className="text-muted-foreground">
            {filteredResult.filteredCount} of {filteredResult.totalCount} cards
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowStats(!showStats)}
        >
          {showStats ? 'Hide' : 'Show'} Stats
        </Button>
      </div>

      {/* Statistics Panel */}
      {showStats && (
        <Card className="p-6 bg-muted/30">
          <h3 className="text-lg font-semibold mb-4">Database Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-primary">{stats.totalCards}</div>
              <div className="text-sm text-muted-foreground">Total Cards</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">{stats.toneCards}</div>
              <div className="text-sm text-muted-foreground">Tone Cards</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">{stats.timeCards}</div>
              <div className="text-sm text-muted-foreground">Time Cards</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-500">{stats.globalCards}</div>
              <div className="text-sm text-muted-foreground">Global Cards</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-500">{stats.localCards}</div>
              <div className="text-sm text-muted-foreground">Local Cards</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.uniqueTags}</div>
              <div className="text-sm text-muted-foreground">Unique Tags</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{stats.difficulties.beginner}</div>
              <div className="text-sm text-muted-foreground">Beginner</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">{stats.difficulties.advanced}</div>
              <div className="text-sm text-muted-foreground">Advanced</div>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Search */}
          <div>
            <label className="text-sm font-medium mb-2 block">Search</label>
            <Input
              type="text"
              placeholder="Search by name, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Category:</span>
              <Button
                variant={categoryFilter === undefined ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(undefined)}
              >
                All
              </Button>
              <Button
                variant={categoryFilter === CardCategory.TONE ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(CardCategory.TONE)}
              >
                🎵 Tone
              </Button>
              <Button
                variant={categoryFilter === CardCategory.TIME ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(CardCategory.TIME)}
              >
                ⏱️ Time
              </Button>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm font-medium">Scope:</span>
              <Button
                variant={scopeFilter === undefined ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScopeFilter(undefined)}
              >
                All
              </Button>
              <Button
                variant={scopeFilter === CardScope.GLOBAL ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScopeFilter(CardScope.GLOBAL)}
              >
                🌍 Global
              </Button>
              <Button
                variant={scopeFilter === CardScope.LOCAL ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScopeFilter(CardScope.LOCAL)}
              >
                📍 Local
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Card Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {displayCards.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No cards found matching your filters.
          </div>
        ) : (
          displayCards.map((card) => (
            <IdeaCard key={card.id} card={card} />
          ))
        )}
      </div>
    </div>
  );
}

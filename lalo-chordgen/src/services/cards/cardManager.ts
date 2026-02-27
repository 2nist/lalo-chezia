/**
 * Card Manager Service
 * Handles card database operations, search, filtering, and management
 */

import {
  Card,
  CardCategory,
  CardScope,
  ToneCardType,
  TimeCardType,
  CardDatabase,
  CardCollection,
  isToneCard,
  isTimeCard,
  isGlobalCard,
  isLocalCard,
} from '../../types/card';
import { cardDatabase } from '../../data/cardDatabase';

// ============================================================================
// FILTER & SEARCH OPTIONS
// ============================================================================

export interface CardFilterOptions {
  category?: CardCategory;
  scope?: CardScope;
  toneType?: ToneCardType;
  timeType?: TimeCardType;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  searchTerm?: string;
}

export interface CardSearchResult {
  cards: Card[];
  totalCount: number;
  filteredCount: number;
}

// ============================================================================
// CARD MANAGER CLASS
// ============================================================================

export class CardManager {
  private database: CardDatabase;
  private cards: Card[];

  constructor(database: CardDatabase = cardDatabase) {
    this.database = database;
    this.cards = [...database.cards];
  }

  // ==========================================================================
  // GETTERS
  // ==========================================================================

  /**
   * Get all cards
   */
  getAllCards(): Card[] {
    return [...this.cards];
  }

  /**
   * Get card by ID
   */
  getCardById(id: string): Card | undefined {
    return this.cards.find(card => card.id === id);
  }

  /**
   * Get multiple cards by IDs
   */
  getCardsByIds(ids: string[]): Card[] {
    return ids.map(id => this.getCardById(id)).filter(Boolean) as Card[];
  }

  /**
   * Get all collections
   */
  getCollections(): CardCollection[] {
    return [...this.database.collections];
  }

  /**
   * Get collection by ID
   */
  getCollectionById(id: string): CardCollection | undefined {
    return this.database.collections.find((col: CardCollection) => col.id === id);
  }

  // ==========================================================================
  // FILTERING & SEARCH
  // ==========================================================================

  /**
   * Filter cards based on options
   */
  filterCards(options: CardFilterOptions): CardSearchResult {
    let filtered = [...this.cards];

    // Filter by category
    if (options.category) {
      filtered = filtered.filter(card => card.category === options.category);
    }

    // Filter by scope
    if (options.scope) {
      filtered = filtered.filter(card => card.scope === options.scope);
    }

    // Filter by tone type
    if (options.toneType) {
      filtered = filtered.filter(card => card.toneType === options.toneType);
    }

    // Filter by time type
    if (options.timeType) {
      filtered = filtered.filter(card => card.timeType === options.timeType);
    }

    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      filtered = filtered.filter(card =>
        options.tags!.some(tag => card.tags.includes(tag))
      );
    }

    // Filter by difficulty
    if (options.difficulty) {
      filtered = filtered.filter(card => card.difficulty === options.difficulty);
    }

    // Search by term
    if (options.searchTerm) {
      const term = options.searchTerm.toLowerCase();
      filtered = filtered.filter(card =>
        card.name.toLowerCase().includes(term) ||
        card.description.toLowerCase().includes(term) ||
        card.tags.some((tag: string) => tag.toLowerCase().includes(term))
      );
    }

    return {
      cards: filtered,
      totalCount: this.cards.length,
      filteredCount: filtered.length,
    };
  }

  /**
   * Search cards by text
   */
  searchCards(searchTerm: string): Card[] {
    const result = this.filterCards({ searchTerm });
    return result.cards;
  }

  /**
   * Get cards by category
   */
  getCardsByCategory(category: CardCategory): Card[] {
    return this.cards.filter(card => card.category === category);
  }

  /**
   * Get cards by scope
   */
  getCardsByScope(scope: CardScope): Card[] {
    return this.cards.filter(card => card.scope === scope);
  }

  /**
   * Get global tone cards
   */
  getGlobalToneCards(): Card[] {
    return this.cards.filter(card =>
      card.category === CardCategory.TONE && card.scope === CardScope.GLOBAL
    );
  }

  /**
   * Get local tone cards
   */
  getLocalToneCards(): Card[] {
    return this.cards.filter(card =>
      card.category === CardCategory.TONE && card.scope === CardScope.LOCAL
    );
  }

  /**
   * Get global time cards
   */
  getGlobalTimeCards(): Card[] {
    return this.cards.filter(card =>
      card.category === CardCategory.TIME && card.scope === CardScope.GLOBAL
    );
  }

  /**
   * Get local time cards
   */
  getLocalTimeCards(): Card[] {
    return this.cards.filter(card =>
      card.category === CardCategory.TIME && card.scope === CardScope.LOCAL
    );
  }

  // ==========================================================================
  // TAGS & METADATA
  // ==========================================================================

  /**
   * Get all unique tags
   */
  getAllTags(): string[] {
    const tags = new Set<string>();
    this.cards.forEach(card => card.tags.forEach((tag: string) => tags.add(tag)));
    return Array.from(tags).sort();
  }

  /**
   * Get cards by tag
   */
  getCardsByTag(tag: string): Card[] {
    return this.cards.filter(card => card.tags.includes(tag));
  }

  /**
   * Get related cards (cards that share tags)
   */
  getRelatedCards(card: Card, limit: number = 5): Card[] {
    const scored = this.cards
      .filter(c => c.id !== card.id)
      .map(c => ({
        card: c,
        score: c.tags.filter((tag: string) => card.tags.includes(tag)).length,
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored.map(item => item.card);
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get database statistics
   */
  getStatistics() {
    const toneCards = this.cards.filter(isToneCard);
    const timeCards = this.cards.filter(isTimeCard);
    const globalCards = this.cards.filter(isGlobalCard);
    const localCards = this.cards.filter(isLocalCard);

    return {
      totalCards: this.cards.length,
      toneCards: toneCards.length,
      timeCards: timeCards.length,
      globalCards: globalCards.length,
      localCards: localCards.length,
      globalToneCards: this.getGlobalToneCards().length,
      localToneCards: this.getLocalToneCards().length,
      globalTimeCards: this.getGlobalTimeCards().length,
      localTimeCards: this.getLocalTimeCards().length,
      collections: this.database.collections.length,
      uniqueTags: this.getAllTags().length,
      difficulties: {
        beginner: this.cards.filter(c => c.difficulty === 'beginner').length,
        intermediate: this.cards.filter(c => c.difficulty === 'intermediate').length,
        advanced: this.cards.filter(c => c.difficulty === 'advanced').length,
      },
    };
  }

  // ==========================================================================
  // CARD MANAGEMENT (CRUD)
  // ==========================================================================

  /**
   * Add a new card
   */
  addCard(card: Card): void {
    if (this.getCardById(card.id)) {
      throw new Error(`Card with ID ${card.id} already exists`);
    }
    this.cards.push(card);
    this.database.cards.push(card);
  }

  /**
   * Update an existing card
   */
  updateCard(id: string, updates: Partial<Card>): void {
    const index = this.cards.findIndex(card => card.id === id);
    if (index === -1) {
      throw new Error(`Card with ID ${id} not found`);
    }
    this.cards[index] = { ...this.cards[index], ...updates };
    this.database.cards[index] = this.cards[index];
  }

  /**
   * Delete a card
   */
  deleteCard(id: string): void {
    const index = this.cards.findIndex(card => card.id === id);
    if (index === -1) {
      throw new Error(`Card with ID ${id} not found`);
    }
    this.cards.splice(index, 1);
    this.database.cards.splice(index, 1);
  }

  /**
   * Duplicate a card with a new ID
   */
  duplicateCard(id: string, newId: string): Card {
    const original = this.getCardById(id);
    if (!original) {
      throw new Error(`Card with ID ${id} not found`);
    }
    if (this.getCardById(newId)) {
      throw new Error(`Card with ID ${newId} already exists`);
    }

    const duplicate: Card = {
      ...original,
      id: newId,
      name: `${original.name} (Copy)`,
    };

    this.addCard(duplicate);
    return duplicate;
  }

  // ==========================================================================
  // IMPORT / EXPORT
  // ==========================================================================

  /**
   * Export cards as JSON
   */
  exportCards(cards?: Card[]): string {
    const toExport = cards || this.cards;
    return JSON.stringify(toExport, null, 2);
  }

  /**
   * Import cards from JSON
   */
  importCards(json: string): Card[] {
    try {
      const imported = JSON.parse(json) as Card[];
      const added: Card[] = [];

      for (const card of imported) {
        if (!this.getCardById(card.id)) {
          this.addCard(card);
          added.push(card);
        }
      }

      return added;
    } catch (error) {
      throw new Error(`Failed to import cards: ${error}`);
    }
  }

  /**
   * Export entire database
   */
  exportDatabase(): string {
    return JSON.stringify(this.database, null, 2);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const cardManager = new CardManager();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick search for cards
 */
export function searchCards(searchTerm: string): Card[] {
  return cardManager.searchCards(searchTerm);
}

/**
 * Get cards by category and scope
 */
export function getCards(category?: CardCategory, scope?: CardScope): Card[] {
  return cardManager.filterCards({ category, scope }).cards;
}

/**
 * Get card statistics
 */
export function getCardStats() {
  return cardManager.getStatistics();
}

export default cardManager;

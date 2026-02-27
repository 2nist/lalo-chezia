/**
 * Sandbox Store
 * Manages card placements in the Sandbox Canvas (experimental multi-rail timeline)
 * Tracks: card positions, rail assignments, stacking order
 */

import { create } from 'zustand';
import { Card } from '@/types/card';

// ============================================================================
// TYPES
// ============================================================================

export type RailId =
  | 'global'
  | 'drum'
  | 'bass'
  | 'harmony-1'
  | 'harmony-2'
  | 'harmony-3'
  | 'melody';

export type CardRail = RailId;

export interface TimelineCardPlacement {
  id: string; // Unique ID for this placement
  card: Card;
  startBeat: number;
  railId: RailId;
  stackIndex?: number; // For vertical stacking at same beat position
}

export type CardRailPlacement = TimelineCardPlacement;

export interface SandboxState {
  // Card placements on timeline
  placements: TimelineCardPlacement[];

  // Loop/arrangement configuration
  loopLengthBeats: number;

  // UI state
  selectedPlacementId: string | null;
  hoveredPlacementId: string | null;
}

export interface SandboxActions {
  // Placement CRUD
  addCard: (
    card: Card,
    startBeat: number,
    railId: CardRail,
    stackIndex?: number
  ) => string; // Returns placement ID
  removeCard: (placementId: string) => void;
  moveCard: (
    placementId: string,
    startBeat: number,
    railId?: CardRail
  ) => void;

  // Stacking
  updateStackIndex: (placementId: string, stackIndex: number) => void;

  // Bulk operations
  clearAll: () => void;

  // Configuration
  setLoopLength: (beats: number) => void;

  // UI interactions
  selectPlacement: (placementId: string | null) => void;
  hoverPlacement: (placementId: string | null) => void;

  // Advanced
  reorderPlacementsByBeat: (placements: TimelineCardPlacement[]) => void;
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Calculate stack index for a new card at given beat position on a card rail
 */
function calculateStackIndex(
  placements: TimelineCardPlacement[],
  beat: number,
  railId: CardRail,
  epsilon = 0.01
): number {
  const stackedAtBeat = placements.filter(
    (p) =>
      p.railId === railId &&
      Math.abs(p.startBeat - beat) < epsilon
  );
  return stackedAtBeat.length;
}

/**
 * Generate unique placement ID
 */
function generatePlacementId(): string {
  return `placement-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useSandboxStore = create<SandboxState & SandboxActions>(
  (set, get: any) => ({
    // Initial state
    placements: [],
    loopLengthBeats: 16,
    selectedPlacementId: null,
    hoveredPlacementId: null,

    // Actions: Placement CRUD
    addCard: (card, startBeat, railId, stackIndex) => {
      const id = generatePlacementId();
      const stack =
        stackIndex !== undefined
          ? stackIndex
          : calculateStackIndex(get().placements, startBeat, railId);

      const placement: TimelineCardPlacement = {
        id,
        card,
        startBeat,
        railId,
        stackIndex: stack,
      };

      set((state) => ({
        placements: [...state.placements, placement],
      }));

      return id;
    },

    removeCard: (placementId: string) => {
      set((state) => ({
        placements: state.placements.filter((p) => p.id !== placementId),
        selectedPlacementId:
          state.selectedPlacementId === placementId
            ? null
            : state.selectedPlacementId,
      }));
    },

    moveCard: (placementId, startBeat, railId) => {
      set((state) => {
        const updated = state.placements.map((p) => {
          if (p.id === placementId) {
            const newRailId = railId || p.railId;
            const newStackIndex = calculateStackIndex(
              state.placements.filter((other) => other.id !== placementId),
              startBeat,
              newRailId
            );
            return {
              ...p,
              startBeat,
              railId: newRailId,
              stackIndex: newStackIndex,
            };
          }
          return p;
        });
        return { placements: updated };
      });
    },

    // Actions: Stacking
    updateStackIndex: (placementId: string, stackIndex: number) => {
      set((state) => ({
        placements: state.placements.map((p) =>
          p.id === placementId ? { ...p, stackIndex } : p
        ),
      }));
    },

    // Actions: Bulk operations
    clearAll: () => {
      set({
        placements: [],
        selectedPlacementId: null,
        hoveredPlacementId: null,
      });
    },

    // Actions: Configuration
    setLoopLength: (beats: number) => {
      if (beats > 0) {
        set({ loopLengthBeats: beats });
      }
    },

    // Actions: UI interactions
    selectPlacement: (placementId: string | null) => {
      set({ selectedPlacementId: placementId });
    },

    hoverPlacement: (placementId: string | null) => {
      set({ hoveredPlacementId: placementId });
    },

    // Actions: Advanced
    reorderPlacementsByBeat: (placements: TimelineCardPlacement[]) => {
      // Sort by startBeat, then by railId for stable ordering
      const sorted = [...placements].sort((a, b) => {
        if (Math.abs(a.startBeat - b.startBeat) > 0.01) {
          return a.startBeat - b.startBeat;
        }
        return a.railId.localeCompare(b.railId);
      });
      set({ placements: sorted });
    },
    })
);

// ============================================================================
// SELECTORS (for efficient subscriptions)
// ============================================================================

export const selectPlacementsByRail = (railId: CardRail) => (
  state: SandboxState
) => state.placements.filter((p) => p.railId === railId);

export const selectPlacementByBeat = (beat: number) => (
  state: SandboxState
) =>
  state.placements.filter(
    (p) => Math.abs(p.startBeat - beat) < 0.01
  );

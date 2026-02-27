/**
 * Global Timeline Store
 * Manages song arrangement structure: sections with named blocks and card placements
 * Tracks: sections, section ordering, within-section placements, playback scope
 */

import { create } from 'zustand';
import { CardRail, CardRailPlacement } from './sandboxStore';

// ============================================================================
// TYPES
// ============================================================================

export interface ArrangementSection {
  id: string;
  name: string; // e.g., "Verse A", "Chorus"
  startBeat: number; // Global beat position
  lengthBeats: number; // Duration of section
  placements: CardRailPlacement[]; // Cards within this section (beat positions are relative to section start)
  muted?: boolean;
  locked?: boolean; // Prevent editing
}

export type SectionLane = ArrangementSection;

export interface GlobalTimelineState {
  // Section arrangement
  sections: ArrangementSection[];

  // Playback scope
  currentSectionId: string | null; // Currently playing or focused section
  playMode: 'section' | 'arrangement'; // Play single section loop or full arrangement

  // UI state
  selectedSectionId: string | null;
  expandedSectionIds: string[];
}

export type TimelineState = GlobalTimelineState;

export interface GlobalTimelineActions {
  // Section CRUD
  createSection: (
    name: string,
    lengthBeats?: number,
    insertAtIndex?: number
  ) => string; // Returns section ID
  deleteSection: (sectionId: string) => void;
  renameSection: (sectionId: string, newName: string) => void;

  // Section placement management (within a section)
  addCardToSection: (
    sectionId: string,
    placement: CardRailPlacement
  ) => void;
  removeCardFromSection: (sectionId: string, placementId: string) => void;
  moveCardInSection: (
    sectionId: string,
    placementId: string,
    startBeat: number,
    railId?: CardRail
  ) => void;

  // Section ordering
  reorderSections: (sectionIds: string[]) => void;
  moveSectionToIndex: (sectionId: string, toIndex: number) => void;

  // Section configuration
  setSectionLength: (sectionId: string, lengthBeats: number) => void;
  toggleSectionMute: (sectionId: string) => void;
  toggleSectionLock: (sectionId: string) => void;

  // Bulk operations
  commitFromSandbox: (
    placements: CardRailPlacement[],
    sectionName?: string
  ) => string; // Returns new section ID
  clearAll: () => void;

  // Playback scope
  setCurrentSection: (sectionId: string | null) => void;
  setPlayMode: (mode: 'section' | 'arrangement') => void;

  // UI state
  selectSection: (sectionId: string | null) => void;
  toggleSectionExpanded: (sectionId: string) => void;
}

export type TimelineActions = GlobalTimelineActions;

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Calculate global beat position for a new section
 */
function calculateGlobalBeatPosition(sections: SectionLane[]): number {
  if (sections.length === 0) return 0;
  const last = sections[sections.length - 1];
  return last.startBeat + last.lengthBeats;
}

/**
 * Generate unique section ID
 */
function generateSectionId(): string {
  return `section-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Generate default section name based on index
 */
function generateSectionName(sections: SectionLane[]): string {
  const sectionTypes = [
    'Intro',
    'Verse A',
    'Verse B',
    'Chorus',
    'Bridge',
    'Outro',
  ];
  return sectionTypes[sections.length % sectionTypes.length] || `Section ${sections.length + 1}`;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useGlobalTimelineStore = create<
  GlobalTimelineState & GlobalTimelineActions
>(
  (set, get: any) => ({
    // Initial state
    sections: [],
    currentSectionId: null,
    playMode: 'arrangement',
    selectedSectionId: null,
    expandedSectionIds: [],

    // Actions: Section CRUD
    createSection: (name, lengthBeats = 16, insertAtIndex) => {
      const id = generateSectionId();
      const beatPos = calculateGlobalBeatPosition(get().sections);

      const section: SectionLane = {
        id,
        name: name || generateSectionName(get().sections),
        startBeat: beatPos,
        lengthBeats,
        placements: [],
      };

      set((state) => {
        const newSections = [...state.sections];
        const index = insertAtIndex ?? newSections.length;
        newSections.splice(index, 0, section);

        // Recalculate beat positions for sections after insertion point
        let currentBeat = 0;
        for (let i = 0; i < newSections.length; i++) {
          newSections[i].startBeat = currentBeat;
          currentBeat += newSections[i].lengthBeats;
        }

        return { sections: newSections };
      });

      return id;
    },

    deleteSection: (sectionId: string) => {
      set((state) => {
        const filtered = state.sections.filter((s) => s.id !== sectionId);

        // Recalculate beat positions
        let currentBeat = 0;
        for (const section of filtered) {
          section.startBeat = currentBeat;
          currentBeat += section.lengthBeats;
        }

        return {
          sections: filtered,
          currentSectionId:
            state.currentSectionId === sectionId
              ? null
              : state.currentSectionId,
          selectedSectionId:
            state.selectedSectionId === sectionId
              ? null
              : state.selectedSectionId,
        };
      });
    },

    renameSection: (sectionId: string, newName: string) => {
      set((state) => ({
        sections: state.sections.map((s) =>
          s.id === sectionId ? { ...s, name: newName } : s
        ),
      }));
    },

    // Actions: Section placement management
    addCardToSection: (sectionId: string, placement: CardRailPlacement) => {
      set((state) => ({
        sections: state.sections.map((s) =>
          s.id === sectionId
            ? { ...s, placements: [...s.placements, placement] }
            : s
        ),
      }));
    },

    removeCardFromSection: (sectionId: string, placementId: string) => {
      set((state) => ({
        sections: state.sections.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                placements: s.placements.filter((p) => p.id !== placementId),
              }
            : s
        ),
      }));
    },

    moveCardInSection: (sectionId: string, placementId: string, startBeat: number, railId) => {
      set((state) => ({
        sections: state.sections.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                placements: s.placements.map((p) =>
                  p.id === placementId
                    ? {
                        ...p,
                        startBeat,
                        railId: railId || p.railId,
                      }
                    : p
                ),
              }
            : s
        ),
      }));
    },

    // Actions: Section ordering
    reorderSections: (sectionIds: string[]) => {
      set((state) => {
        const sectionMap = new Map(state.sections.map((s) => [s.id, s]));
        const reordered = sectionIds
          .map((id) => sectionMap.get(id))
          .filter((s) => s !== undefined) as SectionLane[];

        // Recalculate beat positions
        let currentBeat = 0;
        for (const section of reordered) {
          section.startBeat = currentBeat;
          currentBeat += section.lengthBeats;
        }

        return { sections: reordered };
      });
    },

    moveSectionToIndex: (sectionId: string, toIndex: number) => {
      set((state) => {
        const sections = [...state.sections];
        const fromIndex = sections.findIndex((s) => s.id === sectionId);
        if (fromIndex === -1 || toIndex < 0 || toIndex >= sections.length)
          return state;

        // Remove and reinsert
        const [section] = sections.splice(fromIndex, 1);
        sections.splice(toIndex, 0, section);

        // Recalculate beat positions
        let currentBeat = 0;
        for (const s of sections) {
          s.startBeat = currentBeat;
          currentBeat += s.lengthBeats;
        }

        return { sections };
      });
    },

    // Actions: Section configuration
    setSectionLength: (sectionId: string, lengthBeats: number) => {
      if (lengthBeats <= 0) return;
      set((state) => {
        const sections = state.sections.map((s) =>
          s.id === sectionId ? { ...s, lengthBeats } : s
        );

        // Recalculate beat positions
        let currentBeat = 0;
        for (const s of sections) {
          s.startBeat = currentBeat;
          currentBeat += s.lengthBeats;
        }

        return { sections };
      });
    },

    toggleSectionMute: (sectionId: string) => {
      set((state) => ({
        sections: state.sections.map((s) =>
          s.id === sectionId ? { ...s, muted: !s.muted } : s
        ),
      }));
    },

    toggleSectionLock: (sectionId: string) => {
      set((state) => ({
        sections: state.sections.map((s) =>
          s.id === sectionId ? { ...s, locked: !s.locked } : s
        ),
      }));
    },

    // Actions: Bulk operations
    commitFromSandbox: (placements, sectionName) => {
      const id = get().createSection(
        sectionName || generateSectionName(get().sections)
      );
      set((state) => ({
        sections: state.sections.map((s) =>
          s.id === id ? { ...s, placements: [...placements] } : s
        ),
      }));
      return id;
    },

    clearAll: () => {
      set({
        sections: [],
        currentSectionId: null,
        selectedSectionId: null,
        expandedSectionIds: [],
      });
    },

    // Actions: Playback scope
    setCurrentSection: (sectionId: string | null) => {
      set({ currentSectionId: sectionId });
    },

    setPlayMode: (mode: 'section' | 'arrangement') => {
      set({ playMode: mode });
    },

    // Actions: UI state
    selectSection: (sectionId: string | null) => {
      set({ selectedSectionId: sectionId });
    },

    toggleSectionExpanded: (sectionId: string) => {
      set((state) => {
        const expanded = state.expandedSectionIds.includes(sectionId)
          ? state.expandedSectionIds.filter((id) => id !== sectionId)
          : [...state.expandedSectionIds, sectionId];
        return { expandedSectionIds: expanded };
      });
    },
    })
);

// ============================================================================
// SELECTORS (for efficient subscriptions)
// ============================================================================

export const selectSectionById = (sectionId: string) => (
  state: GlobalTimelineState
) => state.sections.find((s) => s.id === sectionId);

export const selectTotalArrangementBeats = (state: GlobalTimelineState) => {
  if (state.sections.length === 0) return 0;
  const last = state.sections[state.sections.length - 1];
  return last.startBeat + last.lengthBeats;
};

export const selectSectionAtBeat = (beat: number) => (
  state: GlobalTimelineState
) =>
  state.sections.find(
    (s) => beat >= s.startBeat && beat < s.startBeat + s.lengthBeats
  );

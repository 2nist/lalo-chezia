/**
 * Transport Store
 * Global playback clock state (master transport)
 * Manages: play/pause/stop, tempo, beat position, loop settings
 */

import { create } from 'zustand';

// ============================================================================
// TYPES
// ============================================================================

export interface TransportState {
  // Playback state
  currentBeat: number;
  isPlaying: boolean;
  
  // Clock configuration
  tempo: number; // BPM
  timeSignature: [number, number]; // [numerator, denominator]
  
  // Loop configuration
  loopStart: number;
  loopEnd: number;
  loopEnabled: boolean;
}

export interface TransportActions {
  // Playback controls
  play: () => void;
  pause: () => void;
  stop: () => void;
  
  // Seek/position
  seek: (beat: number) => void;
  advanceBeat: (deltaBeat: number) => void;
  
  // Configuration
  setTempo: (bpm: number) => void;
  setTimeSignature: (numerator: number, denominator: number) => void;
  
  // Loop controls
  setLoop: (start: number, end: number) => void;
  toggleLoop: () => void;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useTransportStore = create<TransportState & TransportActions>(
  (set, get: any) => ({
    // Initial state
    currentBeat: 0,
    isPlaying: false,
    tempo: 120,
    timeSignature: [4, 4],
    loopStart: 0,
    loopEnd: 16,
    loopEnabled: true,

    // Actions: Playback controls
    play: () => {
      set({ isPlaying: true });
    },

    pause: () => {
      set({ isPlaying: false });
    },

    stop: () => {
      set({ isPlaying: false, currentBeat: 0 });
    },

    // Actions: Seek/position
    seek: (beat: number) => {
      const { loopStart, loopEnd } = get();
      // Clamp beat to loop bounds
      const clampedBeat = Math.max(loopStart, Math.min(beat, loopEnd));
      set({ currentBeat: clampedBeat });
    },

    advanceBeat: (deltaBeat: number) => {
      const { currentBeat, loopStart, loopEnd, loopEnabled } = get();
      let nextBeat = currentBeat + deltaBeat;

      // Apply looping if enabled
      if (loopEnabled && nextBeat >= loopEnd) {
        // Wrap to loop start
        nextBeat = loopStart + ((nextBeat - loopStart) % (loopEnd - loopStart));
      }

      set({ currentBeat: nextBeat });
    },

    // Actions: Configuration
    setTempo: (bpm: number) => {
      if (bpm > 0 && bpm < 500) {
        set({ tempo: bpm });
      }
    },

    setTimeSignature: (numerator: number, denominator: number) => {
      if (numerator > 0 && denominator > 0) {
        set({ timeSignature: [numerator, denominator] });
      }
    },

    // Actions: Loop controls
    setLoop: (start: number, end: number) => {
      if (start < end) {
        set({ loopStart: start, loopEnd: end });
        // Update currentBeat if it's now outside the new loop range
        const curBeat = get().currentBeat;
        if (curBeat < start || curBeat >= end) {
          set({ currentBeat: start });
        }
      }
    },

    toggleLoop: () => {
      set((state: TransportState) => ({ loopEnabled: !state.loopEnabled }));
    },
  })
);

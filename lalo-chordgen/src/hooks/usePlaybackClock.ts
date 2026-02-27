/**
 * usePlaybackClock Hook
 * RAF-based mock playback clock for offline development
 * Adapted from M4LProg usePlayheadSync pattern
 * 
 * Manages:
 * - 60fps beat advancement via requestAnimationFrame
 * - Smooth playhead motion with PLL-style drift correction
 * - Beat position updates synchronized to transport state
 */

import { useEffect, useRef } from 'react';
import { useTransportStore } from '@/stores';

export interface UsePlaybackClockOptions {
  enabled?: boolean; // Enable/disable the clock
  onBeatUpdate?: (beat: number) => void; // Called every tick
}

/**
 * RAF-based playback clock that advances beats smoothly at 60fps
 * synchronized with the transport store tempo setting
 */
export function usePlaybackClock(options: UsePlaybackClockOptions = {}) {
  const { enabled = true, onBeatUpdate } = options;

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const predictedBeatRef = useRef<number>(0);

  // Transport state
  const isPlaying = useTransportStore((state) => state.isPlaying);
  const currentBeat = useTransportStore((state) => state.currentBeat);
  const tempo = useTransportStore((state) => state.tempo);
  const advanceBeat = useTransportStore((state) => state.advanceBeat);

  // Sync predicted beat with store when playback state changes
  useEffect(() => {
    predictedBeatRef.current = currentBeat;
    lastTimeRef.current = performance.now();
  }, [currentBeat, isPlaying]);

  // RAF loop for smooth beat advancement
  useEffect(() => {
    if (!enabled || !isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const tick = () => {
      const now = performance.now();
      const deltaMs = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // Convert delta time to beats: deltaMs / (1000 * (60 / tempo))
      // Which simplifies to: (deltaMs * tempo) / 60000
      const deltaBeat = (deltaMs * tempo) / 60000;

      // Predict next beat position
      const predictedBeat = predictedBeatRef.current + deltaBeat;
      predictedBeatRef.current = predictedBeat;

      // Advance the store (which handles looping internally)
      advanceBeat(deltaBeat);

      // Notify subscribers
      onBeatUpdate?.(predictedBeat);

      // Schedule next frame
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [enabled, isPlaying, tempo, advanceBeat, onBeatUpdate]);
}

// ============================================================================
// TIMING UTILITIES
// ============================================================================

/**
 * Convert beats to pixel position given pixels-per-beat
 */
export function beatToPixels(beat: number, pixelsPerBeat: number): number {
  return beat * pixelsPerBeat;
}

/**
 * Convert pixel position to beat given pixels-per-beat
 */
export function pixelsToBeat(pixels: number, pixelsPerBeat: number): number {
  return pixels / pixelsPerBeat;
}

/**
 * Snap a beat to the nearest grid subdivision
 * @param beat Current beat position
 * @param subdivision Grid subdivision: 1=whole beat, 0.5=eighth, 0.25=sixteenth, etc.
 */
export function snapBeatToGrid(beat: number, subdivision: number): number {
  return Math.round(beat / subdivision) * subdivision;
}

/**
 * Calculate beats per bar given time signature
 */
export function beatsPerBar(numerator: number, _denominator: number): number {
  // For 4/4: 4 beats per bar
  // For 6/8: 6 beats per bar (compound meter)
  return numerator;
}

/**
 * Calculate beats per measure for a time signature
 */
export function beatsPerMeasure(
  numerator: number,
  denominator: number
): number {
  // denominator of 2 = simple meter (2 beats per 1 note)
  // denominator of 3 = compound meter (3 notes per 1 beat)
  return numerator * (4 / denominator);
}

/**
 * Convert bar number + beat within bar to absolute beat
 */
export function barAndBeatToBeat(
  bar: number,
  beatInBar: number,
  timeSignatureNumerator: number
): number {
  return (bar - 1) * timeSignatureNumerator + beatInBar;
}

/**
 * Convert absolute beat to bar + beat within bar
 */
export function beatToBarAndBeat(
  beat: number,
  timeSignatureNumerator: number
): { bar: number; beatInBar: number } {
  const bar = Math.floor(beat / timeSignatureNumerator) + 1;
  const beatInBar = beat % timeSignatureNumerator;
  return { bar, beatInBar };
}

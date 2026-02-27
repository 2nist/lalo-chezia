/**
 * useTimelinePlayback Hook
 * Orchestrates timeline playback by watching transport currentBeat
 * and triggering card audio when beat positions are crossed
 */

import { useEffect, useRef } from 'react';
import { useTransportStore } from '@/stores';
import PreviewPlayer from '@/services/audio/PreviewPlayer';
import type { IdeaCardData } from '@/components/IdeaCard';

export interface TimelineItem {
  id: string;
  card: IdeaCardData;
  startBeat: number;
  railId: string;
}

export interface UseTimelinePlaybackOptions {
  items: TimelineItem[];
  enabled?: boolean;
  onItemTriggered?: (item: TimelineItem) => void;
}

/**
 * Timeline playback engine that triggers card audio at correct beat positions
 */
export function useTimelinePlayback(options: UseTimelinePlaybackOptions) {
  const { items, enabled = true, onItemTriggered } = options;

  const isPlaying = useTransportStore((state) => state.isPlaying);
  const currentBeat = useTransportStore((state) => state.currentBeat);

  // Track which items have been triggered in current playback session
  const triggeredItemsRef = useRef<Set<string>>(new Set());
  const lastBeatRef = useRef<number>(0);

  // Reset triggered items when playback stops or when currentBeat jumps backwards (loop/seek)
  useEffect(() => {
    if (!isPlaying) {
      triggeredItemsRef.current.clear();
      lastBeatRef.current = 0;
    }
  }, [isPlaying]);

  // Detect loop/seek (backward jump) and reset triggered items
  useEffect(() => {
    if (currentBeat < lastBeatRef.current - 0.1) {
      // Beat jumped backwards - likely a loop or seek
      triggeredItemsRef.current.clear();
    }
    lastBeatRef.current = currentBeat;
  }, [currentBeat]);

  // Main playback loop: check if any items should trigger
  useEffect(() => {
    if (!enabled || !isPlaying) return;

    const prevBeat = lastBeatRef.current;
    const currentBeatValue = currentBeat;

    // Find items that crossed their startBeat threshold
    items.forEach((item) => {
      const itemKey = `${item.id}-${item.startBeat}`;
      
      // Check if item's startBeat is between prevBeat and currentBeat
      const crossedThreshold = 
        item.startBeat >= prevBeat && 
        item.startBeat <= currentBeatValue &&
        !triggeredItemsRef.current.has(itemKey);

      if (crossedThreshold) {
        // Trigger the card's audio
        try {
          PreviewPlayer.playIdeaCard(item.card);
          triggeredItemsRef.current.add(itemKey);
          onItemTriggered?.(item);
        } catch (error) {
          console.error('Failed to play timeline item:', item.id, error);
        }
      }
    });

    lastBeatRef.current = currentBeatValue;
  }, [enabled, isPlaying, currentBeat, items, onItemTriggered]);

  // Cleanup: stop all audio when component unmounts
  useEffect(() => {
    return () => {
      PreviewPlayer.stopAll();
    };
  }, []);
}

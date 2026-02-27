/**
 * TransportControls Component
 * Playback control panel with Play/Pause/Stop, tempo slider, and beat display
 */

import React, { useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTransportStore } from '@/stores';
import { usePlaybackClock, beatToBarAndBeat } from '@/hooks/usePlaybackClock';
import { Button } from '@/components/ui/button';

// ============================================================================
// TYPES
// ============================================================================

export interface TransportControlsProps {
  /**
   * Show/hide transport controls
   */
  visible?: boolean;

  /**
   * Compact mode (smaller buttons, no beat display)
   */
  compact?: boolean;

  /**
   * Show tempo number vs slider only
   */
  showTempo?: boolean;

  /**
   * Custom class name for root container
   */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const TransportControls: React.FC<TransportControlsProps> = ({
  visible = true,
  compact = false,
  showTempo = true,
  className = '',
}) => {
  // Store hooks
  const isPlaying = useTransportStore((state) => state.isPlaying);
  const currentBeat = useTransportStore((state) => state.currentBeat);
  const tempo = useTransportStore((state) => state.tempo);
  const timeSignature = useTransportStore((state) => state.timeSignature);
  
  // Store actions
  const play = useTransportStore((state) => state.play);
  const pause = useTransportStore((state) => state.pause);
  const stop = useTransportStore((state) => state.stop);
  const setTempo = useTransportStore((state) => state.setTempo);

  // Local state for tempo input (to avoid rapid updates while dragging)
  const [tempoDraft, setTempoDraft] = useState<number>(tempo);

  // Enable playback clock
  usePlaybackClock({ enabled: true });

  // Sync local tempo draft when store tempo changes
  React.useEffect(() => {
    setTempoDraft(tempo);
  }, [tempo]);

  // Calculate bar/beat display
  const { bar, beatInBar } = beatToBarAndBeat(currentBeat, timeSignature[0]);
  const beatDisplay = `${bar}:${(beatInBar.toFixed(2) as any).padStart(5, '0')}`;

  // Handlers
  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleStop = () => {
    stop();
  };

  const handleTempoChange = (value: number[]) => {
    const newTempo = Math.round(value[0]);
    setTempoDraft(newTempo);
    setTempo(newTempo);
  };

  if (!visible) return null;

  const buttonSize = compact ? 'sm' : 'default';
  const buttonClass = compact ? 'w-8 h-8' : 'w-10 h-10';

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 bg-slate-900 border-b border-slate-700 ${className}`}
    >
      {/* Playback Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size={buttonSize}
          className={`${buttonClass} hover:bg-slate-700`}
          onClick={handlePlayPause}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>

        <Button
          variant="ghost"
          size={buttonSize}
          className={`${buttonClass} hover:bg-slate-700`}
          onClick={handleStop}
          title="Stop"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-slate-700" />

      {/* Beat Display */}
      {!compact && (
        <div className="font-mono text-sm text-slate-400 w-16 text-right">
          {beatDisplay}
        </div>
      )}

      {/* Tempo Control */}
      <div className="flex items-center gap-2">
        {showTempo && (
          <div className="font-mono text-xs text-slate-400 w-10 text-right">
            {tempoDraft.toFixed(0)} BPM
          </div>
        )}

        <div className="w-24">
          <input
            title="Tempo (BPM)"
            type="range"
            min="30"
            max="300"
            step="1"
            value={tempoDraft}
            onChange={(e) => handleTempoChange([parseFloat(e.target.value)])}
            className="w-full"
          />
        </div>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-slate-700" />

      {/* Status Indicator */}
      <div className="flex items-center gap-2 ml-auto">
        <div
          className={`w-2 h-2 rounded-full ${
            isPlaying ? 'bg-green-500 animate-pulse' : 'bg-slate-600'
          }`}
        />
        <span className="text-xs text-slate-400">
          {isPlaying ? 'Playing' : 'Stopped'}
        </span>
      </div>
    </div>
  );
};

export default TransportControls;

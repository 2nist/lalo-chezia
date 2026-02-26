import * as React from "react";
import { StrictCard } from "./strict-card";
import { ChordButton } from "./chord-button";

interface ProgressionGridProps {
  progression: Array<{ chord: string; quality: string }>;
  onAddChord: (chord: string, quality: string) => void;
  onRemoveChord: (index: number) => void;
}

export function ProgressionGrid({ progression, onAddChord, onRemoveChord }: ProgressionGridProps) {
  return (
    <StrictCard>
      <div className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Chord Progression</h2>
        
        {/* Progression Display */}
        <div className="grid grid-cols-8 gap-2 mb-6">
          {progression.map((item, index) => (
            <div
              key={index}
              className="relative p-3 text-center rounded-lg bg-muted"
            >
              <ChordButton
                quality={item.quality}
                chord={item.chord}
                size="sm"
                variant="outline"
                onClick={() => onRemoveChord(index)}
              />
            </div>
          ))}
        </div>

        {/* Chord Palette */}
        <div className="grid grid-cols-4 gap-2">
          <ChordButton quality="maj" chord="C" onClick={() => onAddChord("C", "maj")} />
          <ChordButton quality="min" chord="Am" onClick={() => onAddChord("Am", "min")} />
          <ChordButton quality="maj" chord="F" onClick={() => onAddChord("F", "maj")} />
          <ChordButton quality="maj" chord="G" onClick={() => onAddChord("G", "maj")} />
        </div>
      </div>
    </StrictCard>
  );
}
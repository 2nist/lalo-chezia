import React from 'react'

type Props = {
  totalBeats: number
  pxPerBeat: number
  beatsPerBar?: number
}

export default function BeatRuler({ totalBeats, pxPerBeat, beatsPerBar = 4 }: Props) {
  const beatWidthClass =
    pxPerBeat >= 48 ? 'w-12' : pxPerBeat >= 24 ? 'w-6' : 'w-4'

  return (
    <div className="h-7 border-b border-white/10 bg-black/25 overflow-hidden">
      <div className="flex h-full">
      {Array.from({ length: totalBeats }).map((_, beat) => {
        const isBar = beat % beatsPerBar === 0
        return (
          <div
            key={beat}
            className={`relative h-full shrink-0 border-r ${isBar ? 'border-white/20' : 'border-white/10'} ${beatWidthClass}`}
          >
            {isBar && beat > 0 && (
              <span className="absolute top-0.5 left-1 text-[10px] text-slate-300 pointer-events-none">
                {Math.floor(beat / beatsPerBar) + 1}
              </span>
            )}
          </div>
        )
      })}
      </div>
    </div>
  )
}

import React from 'react'
import type { Section as AppSection } from '../types/progression'

type Props = {
  sections: AppSection[]
  onRemove?: (index:number)=>void
}

export default function SongRail({sections, onRemove}: Props){
  return (
    <div className="mt-6 bg-white/5 border border-white/10 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">Song Rail</h3>
        <div className="text-slate-300 text-sm">Committed sections appear here</div>
      </div>
      {sections.length===0 ? (
        <div className="text-slate-400">No sections yet — commit a section from the sandbox.</div>
      ) : (
        <div className="space-y-2">
          {sections.map((s, i) => (
            <div key={i} className="bg-black/20 rounded p-3 flex justify-between items-center">
              <div>
                <div className="text-white font-medium">{s.name || `Section ${i+1}`}</div>
                <div className="text-slate-300 text-xs">Chords: {s.progression?.length ?? 0}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onRemove && onRemove(i)} className="bg-rose-600 text-white px-3 py-1 rounded text-sm">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

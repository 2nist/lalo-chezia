import React from 'react'

export type Mode = 'Free' | 'Challenge' | 'Coop' | 'Draft'

type Props = {
  mode: Mode
  onChange: (m: Mode) => void
}

export default function ModeToggle({mode, onChange}: Props){
  const modes: Mode[] = ['Free','Challenge','Coop','Draft']
  return (
    <div className="flex items-center gap-3">
      {modes.map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-3 py-1 rounded ${mode===m? 'bg-indigo-600 text-white' : 'bg-white/10 text-slate-200'}`}
        >
          {m}
        </button>
      ))}
    </div>
  )
}

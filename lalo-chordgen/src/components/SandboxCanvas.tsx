import React, { useState } from 'react'
import { useTimelinePlayback } from '@/hooks/useTimelinePlayback'
import Timeline from './Timeline'
import type { TimelineRail } from './Timeline'
import type { CardRailItem } from './CardRail'
import type { IdeaCardData } from './IdeaCard'
import PreviewPlayer from '../services/audio/PreviewPlayer'
import TonePlayer from '../services/audio/TonePlayer'
import { canDrop } from '../services/rules/ModeRules'
import type { Mode } from './ModeToggle'

type SandboxItem = {
  id: string
  card: IdeaCardData
  startBeat: number
  railId: string
}

type Section = {
  id: string
  items: SandboxItem[]
  startBeat: number
}

type Props = { mode?: Mode, role?: string, onCommitSection?: (section:any)=>void }

export default function SandboxCanvas({mode='Free', role='drums', onCommitSection}: Props) {
  const [items, setItems] = useState<SandboxItem[]>([])
  const [selectedIds, setSelectedIds] = useState<Record<string,boolean>>({})
  const [sections, setSections] = useState<Section[]>([])
  const pxPerBeat = 24
  const totalBeats = 64
  const rails: TimelineRail[] = [
    { id: 'global', label: 'Global', colorClass: 'bg-amber-500/20 border-amber-500/40 text-amber-100' },
    { id: 'drum', label: 'Drum', colorClass: 'bg-blue-500/20 border-blue-500/40 text-blue-100' },
    { id: 'bass', label: 'Bass', colorClass: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-100' },
    { id: 'harmony', label: 'Harmony', colorClass: 'bg-purple-500/20 border-purple-500/40 text-purple-100' },
    { id: 'melody', label: 'Melody', colorClass: 'bg-pink-500/20 border-pink-500/40 text-pink-100' },
  ]

  const timelineItems: CardRailItem[] = items.map((it) => ({
    id: it.id,
    card: it.card,
    startBeat: it.startBeat,
    railId: it.railId,
  }))

  // Enable timeline playback integration
  useTimelinePlayback({
    items: timelineItems,
    enabled: true,
    onItemTriggered: (item) => {
      console.log('Timeline triggered:', item.card.label, 'at beat', item.startBeat)
    },
  })

  const handleDropCard = (card: IdeaCardData, startBeat: number, railId: string) => {
    if (!canDrop(mode, role, card)) {
      alert(`In ${mode} mode, role '${role}' cannot place ${card.type} cards.`)
      return
    }

    const newItem: SandboxItem = {
      id: `${card.id}-${Date.now()}`,
      card: {
        ...card,
        lengthBeats: Math.max(1, card.lengthBeats ?? 4),
      },
      startBeat,
      railId,
    }
    setItems((prev) => [...prev, newItem])
  }

  const handleMoveCard = (id: string, deltaBeat: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it
        const nextBeat = Math.max(0, Math.min(totalBeats - 1, it.startBeat + deltaBeat))
        return { ...it, startBeat: nextBeat }
      })
    )
  }

  const handleAdjustLength = (id: string, deltaBeats: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it
        const current = Math.max(1, it.card.lengthBeats ?? 4)
        const next = Math.max(1, Math.min(16, current + deltaBeats))
        return { ...it, card: { ...it.card, lengthBeats: next } }
      })
    )
  }

  const handleDeleteCard = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id))
    setSelectedIds((prev) => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
  }

  const toggleSelect = (id:string) => {
    setSelectedIds(s => ({...s, [id]: !s[id]}))
  }

  const groupSelected = () => {
    const ids = Object.keys(selectedIds).filter(k=>selectedIds[k])
    if (ids.length===0) return
    const groupItems = items.filter(it => ids.includes(it.id))
    const remaining = items.filter(it => !ids.includes(it.id))
    const startBeat = Math.min(...groupItems.map(it => it.startBeat))
    const section: Section = { id: `sec-${Date.now()}`, items: groupItems, startBeat }
    setSections(prev=>[...prev, section])
    setItems(remaining)
    setSelectedIds({})
  }

  const playSection = async (sec:Section) => {
    // convert items into sequence events by beat order
    const seq = sec.items.slice().sort((a,b)=>a.startBeat-b.startBeat).map((it) => ({
      notes: it.card.notes ?? [60,64,67],
      timeOffset: it.startBeat * 0.25,
      duration: Math.max(0.4, it.card.lengthBeats * 0.25)
    }))
    // try Tone first
    try{
      await TonePlayer.playSequence(seq)
    }catch(e){
      // fallback to simple player
      seq.forEach((ev, i)=> setTimeout(()=> PreviewPlayer.playChord(ev.notes, 0, ev.duration), i*500))
    }
  }

  const removeSection = (id:string) => {
    setSections(prev=>prev.filter(s=>s.id!==id))
  }

  const commitSectionToSong = (sec:Section) => {
    // convert section to a serializable payload for the app
    const payload = {
      id: sec.id,
      startBeat: sec.startBeat,
      items: sec.items.map(it=>({label: it.card.label, notes: it.card.notes, lengthBeats: it.card.lengthBeats}))
    }
    if (onCommitSection) onCommitSection(payload)
    // remove from sandbox
    setSections(prev=>prev.filter(s=>s.id!==sec.id))
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white font-semibold">Timeline Sandbox</h3>
        <div className="text-slate-300 text-sm">Drop cards to beat-aligned CardRails</div>
      </div>

      <Timeline
        items={timelineItems}
        rails={rails}
        totalBeats={totalBeats}
        pxPerBeat={pxPerBeat}
        selectedIds={selectedIds}
        showPlaybackCursor={true}
        onToggleSelect={toggleSelect}
        onPlayCard={(card) => PreviewPlayer.playIdeaCard(card)}
        onMoveCard={handleMoveCard}
        onAdjustLength={handleAdjustLength}
        onDeleteCard={handleDeleteCard}
        onDropCard={handleDropCard}
      />
      <div className="mt-3 flex gap-2">
        <button onClick={groupSelected} className="bg-indigo-600 px-3 py-2 rounded text-sm text-white">Group Selected</button>
        <button onClick={()=>{setItems([]); setSelectedIds({})}} className="bg-rose-600 px-3 py-2 rounded text-sm text-white">Clear Canvas</button>
      </div>

      {/* Sections list */}
      {sections.length>0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-white font-semibold">Sections</h4>
          {sections.map(s=> (
            <div key={s.id} className="bg-black/25 p-2 rounded flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Section {s.id}</div>
                <div className="text-slate-300 text-xs">Items: {s.items.length} • start beat: {s.startBeat}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>playSection(s)} className="bg-green-600 px-3 py-1 rounded text-sm text-white">Play</button>
                <button onClick={()=>commitSectionToSong(s)} className="bg-emerald-600 px-3 py-1 rounded text-sm text-white">Commit to SongRail</button>
                <button onClick={()=>removeSection(s.id)} className="bg-red-600 px-3 py-1 rounded text-sm text-white">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

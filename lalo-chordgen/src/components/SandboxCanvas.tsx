import React, { useState, useRef } from 'react'
import TimelineHeatmap, { HeatEvent } from './TimelineHeatmap'
import type { IdeaCardData } from './IdeaCard'
import PreviewPlayer from '../services/audio/PreviewPlayer'
import TonePlayer from '../services/audio/TonePlayer'
import { canDrop } from '../services/rules/ModeRules'
import type { Mode } from './ModeToggle'
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'

type SandboxItem = {
  id: string
  card: IdeaCardData
  x: number
  y: number
}

type Section = {
  id: string
  items: SandboxItem[]
  startBeat: number
}

type Props = { mode?: Mode, role?: string, onCommitSection?: (section:any)=>void }

export default function SandboxCanvas({mode='Free', role='drums', onCommitSection}: Props) {
  const [items, setItems] = useState<SandboxItem[]>([])
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [selectedIds, setSelectedIds] = useState<Record<string,boolean>>({})
  const [sections, setSections] = useState<Section[]>([])
  const pxPerBeat = 24
  const totalBeats = 64
  const sensors = useSensors(useSensor(PointerSensor))

  // Draggable item component to keep hook usage stable per rendered item
  function DraggableItem({it}:{it: SandboxItem}){
    const {listeners, attributes, setNodeRef, transform} = useDraggable({id: it.id})
    const style: React.CSSProperties = {
      position: 'absolute',
      left: it.x,
      top: it.y,
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      touchAction: 'none',
    }

    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        onClick={() => toggleSelect(it.id)}
        style={style}
        className={`p-2 border rounded-md w-36 text-sm ${selectedIds[it.id] ? 'bg-purple-600 border-purple-400' : 'bg-white/6 border-white/10'} text-white`}
      >
        <div className="flex items-center justify-between">
          <div className="font-semibold">{it.card.label}</div>
          <div className="flex gap-1">
            <button onClick={(e)=>{e.stopPropagation(); PreviewPlayer.playIdeaCard(it.card)}} className="bg-green-600 px-2 py-0.5 rounded text-xs">Play</button>
            <button onClick={(e)=>{e.stopPropagation(); PreviewPlayer.stopAll()}} className="bg-red-600 px-2 py-0.5 rounded text-xs">Stop</button>
          </div>
        </div>
        <div className="text-xs text-slate-300">{it.card.type} • {it.card.lengthBeats}b</div>
      </div>
    )
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const raw = e.dataTransfer.getData('application/json')
    if (!raw) return
    let card: IdeaCardData
    try { card = JSON.parse(raw) } catch { return }
    // enforce simple mode rules
    if (!canDrop(mode, role, card)){
      // brief visual feedback - alert for now
      alert(`In ${mode} mode, role '${role}' cannot place ${card.type} cards.`)
      return
    }
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = Math.round((e.clientX - rect.left) / pxPerBeat) * pxPerBeat
    const y = Math.max(0, Math.min(rect.height - 40, e.clientY - rect.top - 20))

    const newItem: SandboxItem = {
      id: `${card.id}-${Date.now()}`,
      card,
      x,
      y
    }
    setItems(prev => [...prev, newItem])
  }

  const toggleSelect = (id:string) => {
    setSelectedIds(s => ({...s, [id]: !s[id]}))
  }

  const groupSelected = () => {
    const ids = Object.keys(selectedIds).filter(k=>selectedIds[k])
    if (ids.length===0) return
    const groupItems = items.filter(it => ids.includes(it.id))
    const remaining = items.filter(it => !ids.includes(it.id))
    const startBeat = Math.min(...groupItems.map(it=>Math.round(it.x/pxPerBeat)))
    const section: Section = { id: `sec-${Date.now()}`, items: groupItems, startBeat }
    setSections(prev=>[...prev, section])
    setItems(remaining)
    setSelectedIds({})
  }

  const playSection = async (sec:Section) => {
    // convert items into sequence events by their x order
    const seq = sec.items.slice().sort((a,b)=>a.x-b.x).map((it, i) => ({
      notes: it.card.notes ?? [60,64,67],
      timeOffset: i * 0.5,
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

  const heatEvents: HeatEvent[] = items.map(it => ({
    startBeat: Math.round(it.x / pxPerBeat),
    duration: it.card.lengthBeats,
    intensity: it.card.intensity ?? 0.6,
    label: it.card.label
  }))

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white font-semibold">Sandbox Canvas</h3>
        <div className="text-slate-300 text-sm">Drag ideas onto the canvas to experiment</div>
      </div>

      <div
        ref={containerRef}
        onDragOver={onDragOver}
        onDrop={onDrop}
        style={{height: 240, position:'relative'}}
        className="bg-black/20 rounded-lg overflow-hidden"
      >
        <div style={{position:'absolute', left:8, top:8, right:8}}>
          <TimelineHeatmap events={heatEvents} totalBeats={totalBeats} pxPerBeat={pxPerBeat} height={120} />
        </div>

        <DndContext sensors={sensors} onDragEnd={(event: DragEndEvent) => {
          const {active, delta} = event
          if (!active) return
          const id = String(active.id)
          if (!delta) return
          const dx = Math.round(delta.x)
          const dy = Math.round(delta.y)
          setItems(prev => prev.map(it => {
            if (it.id !== id) return it
            const rect = containerRef.current?.getBoundingClientRect()
            // apply delta and snap to grid
            let nx = it.x + dx
            let ny = it.y + dy
            if (rect) {
              nx = Math.round(Math.max(0, Math.min(rect.width - 140, nx)) / pxPerBeat) * pxPerBeat
              ny = Math.round(Math.max(0, Math.min(rect.height - 40, ny)))
            }
            return {...it, x: nx, y: ny}
          }))
        }}>
          {items.map(it => (
            <DraggableItem key={it.id} it={it} />
          ))}
        </DndContext>
      </div>
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

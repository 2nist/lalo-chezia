import React, {useRef, useEffect, useState, useCallback} from 'react'

export type HeatEvent = {
  startBeat: number
  duration: number
  intensity?: number // 0..1
  label?: string
  chord?: string
}

type Props = {
  events: HeatEvent[]
  totalBeats?: number
  pxPerBeat?: number
  height?: number
  className?: string
}

function beatToColor(intensity = 0.5) {
  const hue = 220 - intensity * 120 // blue -> orange
  const sat = 70
  const light = 50 - intensity * 20
  return `hsl(${hue} ${sat}% ${light}%)`
}

const TimelineHeatmap: React.FC<Props> = ({
  events,
  totalBeats = 64,
  pxPerBeat = 16,
  height = 80,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [tooltip, setTooltip] = useState<{x:number;y:number;text:string}|null>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const devicePixelRatio = window.devicePixelRatio || 1
    const width = Math.max(1, Math.floor(totalBeats * pxPerBeat))
    const w = Math.floor(width * devicePixelRatio)
    const h = Math.floor(height * devicePixelRatio)
    canvas.width = w
    canvas.height = h
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(devicePixelRatio, devicePixelRatio)
    ctx.clearRect(0,0,width,height)

    // background grid
    ctx.fillStyle = '#0f172a22'
    ctx.fillRect(0,0,width,height)
    ctx.strokeStyle = '#ffffff11'
    ctx.lineWidth = 1
    // vertical beat grid
    for (let b=0;b<=totalBeats;b++){
      const x = b*pxPerBeat + 0.5
      ctx.beginPath()
      ctx.moveTo(x,0)
      ctx.lineTo(x,height)
      ctx.stroke()
    }

    // draw events as heat bars
    events.forEach(ev => {
      const x = ev.startBeat * pxPerBeat
      const w = Math.max(2, ev.duration * pxPerBeat)
      const intensity = Math.max(0, Math.min(1, ev.intensity ?? 0.6))
      ctx.fillStyle = beatToColor(intensity)
      ctx.globalAlpha = 0.9
      ctx.fillRect(x, 4, w, height - 8)
      // label
      if (ev.label) {
        ctx.fillStyle = '#fff'
        ctx.font = '12px Inter, sans-serif'
        ctx.fillText(ev.label, x+4, 18)
      }
    })
    ctx.globalAlpha = 1
  }, [events, totalBeats, pxPerBeat, height])

  useEffect(() => { draw() }, [draw])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const handleMove = (e:MouseEvent) => {
      const rect = wrapper.getBoundingClientRect()
      const x = e.clientX - rect.left
      const beat = x / pxPerBeat
      const found = events.find(ev => beat >= ev.startBeat && beat <= ev.startBeat + ev.duration)
      if (found) {
        setTooltip({x: e.clientX - rect.left + 8, y: e.clientY - rect.top + 8, text: `${found.label ?? found.chord ?? 'Event'} — beat ${found.startBeat}`})
      } else {
        setTooltip(null)
      }
    }
    const handleLeave = () => setTooltip(null)
    wrapper.addEventListener('mousemove', handleMove)
    wrapper.addEventListener('mouseleave', handleLeave)
    return () => {
      wrapper.removeEventListener('mousemove', handleMove)
      wrapper.removeEventListener('mouseleave', handleLeave)
    }
  }, [events, pxPerBeat])

  return (
    <div ref={wrapperRef} className={`relative ${className ?? ''}`} style={{width: totalBeats * pxPerBeat}}>
      <canvas ref={canvasRef} className="rounded-md shadow-sm block" />
      {tooltip && (
        <div style={{position:'absolute', left: tooltip.x, top: tooltip.y, pointerEvents:'none'}} className="bg-neutral-900 text-white text-sm rounded px-2 py-1 shadow">
          {tooltip.text}
        </div>
      )}
    </div>
  )
}

export default TimelineHeatmap

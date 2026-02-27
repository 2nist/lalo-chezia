/**
 * Simple Web Audio synth destination
 */

import { MIDIEvent, MIDIDestination } from '../midiTypes'

function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

export class BrowserSynthDestination implements MIDIDestination {
  id: string
  name: string
  type: MIDIDestination['type'] = 'synth'

  private audioCtx: AudioContext | null = null
  private active = new Map<string, { osc: OscillatorNode; gain: GainNode }>()

  constructor(id = 'browser-synth', name = 'Browser Synth') {
    this.id = id
    this.name = name
  }

  send(event: MIDIEvent): void {
    if (event.type !== 'noteOn' && event.type !== 'noteOff') return
    if (event.note === undefined || event.velocity === undefined) return

    const ctx = this.ensureContext()
    const key = `${event.channel}:${event.note}`

    if (event.type === 'noteOn' && event.velocity > 0) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(midiToFrequency(event.note), event.time)
      gain.gain.setValueAtTime(event.velocity / 127, event.time)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(event.time)
      this.active.set(key, { osc, gain })
      return
    }

    const active = this.active.get(key)
    if (active) {
      active.gain.gain.setValueAtTime(active.gain.gain.value, event.time)
      active.gain.gain.linearRampToValueAtTime(0.0001, event.time + 0.1)
      active.osc.stop(event.time + 0.12)
      this.active.delete(key)
    }
  }

  private ensureContext(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return this.audioCtx
  }
}

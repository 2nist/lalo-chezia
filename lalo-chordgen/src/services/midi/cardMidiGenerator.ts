/**
 * Generate MIDI events from cards
 */

import { Card, CardCategory } from '../../types/card'
import { MIDIEvent } from './midiTypes'

export class CardMidiGenerator {
  generateEvents(card: Card, startTime: number, tempo: number): MIDIEvent[] {
    if (card.category === CardCategory.TONE) {
      return this.generateToneEvents(card, startTime, tempo)
    }

    return this.generateTimeEvents(card, startTime, tempo)
  }

  private generateToneEvents(card: Card, startTime: number, tempo: number): MIDIEvent[] {
    const notes = card.toneMusicData?.notes
    const fallback = [60, 64, 67]
    const raw = Array.isArray(notes) && notes.length > 0 ? notes : fallback
    const chord = raw.map(n => typeof n === 'string' ? parseInt(n, 10) : n); // Normalize to numbers

    const beats = card.timeMusicData?.beatsPerMeasure ?? 4
    const duration = (60 / tempo) * beats
    const velocity = this.toVelocity(card)

    const events: MIDIEvent[] = []
    chord.forEach((note) => {
      events.push({ type: 'noteOn', time: startTime, channel: 1, note, velocity })
      events.push({ type: 'noteOff', time: startTime + duration, channel: 1, note, velocity: 0 })
    })

    return events
  }

  private generateTimeEvents(card: Card, startTime: number, tempo: number): MIDIEvent[] {
    const pattern = card.timeMusicData?.pattern
    const beats = card.timeMusicData?.beatsPerMeasure ?? 4
    const subdivision = card.timeMusicData?.subdivision ?? 16

    const steps = Array.isArray(pattern) && pattern.length > 0
      ? pattern
      : new Array(subdivision).fill(0).map((_, i) => (i % (subdivision / beats) === 0 ? 1 : 0))

    const secondsPerBeat = 60 / tempo
    const stepDuration = secondsPerBeat / (subdivision / beats)
    const velocity = this.toVelocity(card)

    const events: MIDIEvent[] = []
    steps.forEach((hit, index) => {
      if (hit !== 1) return
      const time = startTime + index * stepDuration
      events.push({ type: 'noteOn', time, channel: 10, note: 36, velocity })
      events.push({ type: 'noteOff', time: time + stepDuration * 0.5, channel: 10, note: 36, velocity: 0 })
    })

    return events
  }

  private toVelocity(card: Card): number {
    const intensity = typeof (card as any).intensity === 'number' ? (card as any).intensity : 0.6
    const clamped = Math.max(0.1, Math.min(1, intensity))
    return Math.round(clamped * 127)
  }
}

export const cardMidiGenerator = new CardMidiGenerator()

/**
 * Timeline for card placement and MIDI generation
 */

import { Card, CardScope } from '../../types/card'
import { MIDIEvent } from './midiTypes'
import { CardMidiGenerator } from './cardMidiGenerator'

export interface TimelineCardPlacement {
  card: Card
  positionBeats: number
  lane: number
  channel: number
}

export interface TimelineState {
  tempo: number
  timeSignature: [number, number]
  cards: TimelineCardPlacement[]
}

export class Timeline {
  private state: TimelineState
  private generator: CardMidiGenerator
  private cachedEvents: MIDIEvent[] = []

  constructor(tempo = 120, timeSignature: [number, number] = [4, 4]) {
    this.state = {
      tempo,
      timeSignature,
      cards: [],
    }
    this.generator = new CardMidiGenerator()
  }

  addCard(card: Card, positionBeats: number, lane: number): void {
    const channel = Math.max(1, Math.min(16, lane + 1))
    this.state.cards.push({ card, positionBeats, lane, channel })
    this.rebuildEvents()
  }

  removeCard(cardId: string): void {
    this.state.cards = this.state.cards.filter((item) => item.card.id !== cardId)
    this.rebuildEvents()
  }

  setTempo(tempo: number): void {
    this.state.tempo = tempo
    this.rebuildEvents()
  }

  getEvents(): MIDIEvent[] {
    return this.cachedEvents.slice()
  }

  private rebuildEvents(): void {
    const tempo = this.state.tempo
    const beatsPerBar = this.state.timeSignature[0]
    const events: MIDIEvent[] = []

    this.state.cards.forEach((placement) => {
      const startTime = (placement.positionBeats / beatsPerBar) * (60 / tempo) * beatsPerBar
      const cardEvents = this.generator.generateEvents(placement.card, startTime, tempo)
      cardEvents.forEach((event) => {
        events.push({ ...event, channel: placement.channel })
      })
    })

    this.cachedEvents = this.applyGlobalCards(events)
  }

  private applyGlobalCards(events: MIDIEvent[]): MIDIEvent[] {
    const globals = this.state.cards.filter((item) => item.card.scope === CardScope.GLOBAL)
    if (globals.length === 0) return events

    let transformed = events

    globals.forEach((placement) => {
      const tempoModifier = placement.card.timeMusicData?.tempoModifier
      if (tempoModifier && typeof tempoModifier === 'number') {
        transformed = transformed.map((event) => ({
          ...event,
          time: event.time * tempoModifier,
        }))
      }
    })

    return transformed
  }
}

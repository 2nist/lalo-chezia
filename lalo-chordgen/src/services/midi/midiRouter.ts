/**
 * Route MIDI events to destinations
 */

import { MIDIEvent, MIDIDestination } from './midiTypes'

export class MidiRouter {
  private destinations = new Map<string, MIDIDestination>()
  private routing = new Map<string, string>()

  registerDestination(destination: MIDIDestination): void {
    this.destinations.set(destination.id, destination)
  }

  unregisterDestination(id: string): void {
    this.destinations.delete(id)
  }

  routeCard(cardId: string, destinationId: string): void {
    this.routing.set(cardId, destinationId)
  }

  dispatch(event: MIDIEvent, sourceCardId: string): void {
    const destinationId = this.routing.get(sourceCardId)
    if (!destinationId) return
    const destination = this.destinations.get(destinationId)
    destination?.send(event)
  }

  dispatchToAll(event: MIDIEvent): void {
    this.destinations.forEach((destination) => destination.send(event))
  }
}

export const midiRouter = new MidiRouter()

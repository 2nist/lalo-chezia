/**
 * Web MIDI destination for hardware output
 */

import { MIDIEvent, MIDIDestination } from '../midiTypes'

export class WebMidiDestination implements MIDIDestination {
  id: string
  name: string
  type: MIDIDestination['type'] = 'hardware'

  private output: MIDIOutput | null = null

  constructor(id = 'web-midi', name = 'Web MIDI Output') {
    this.id = id
    this.name = name
  }

  async connect(outputId?: string): Promise<void> {
    if (!navigator.requestMIDIAccess) return
    const access = await navigator.requestMIDIAccess()
    const outputs = Array.from(access.outputs.values())
    if (outputs.length === 0) return

    this.output = outputId
      ? outputs.find((out) => out.id === outputId) || outputs[0]
      : outputs[0]
  }

  send(event: MIDIEvent): void {
    if (!this.output) return
    const message = this.toMessage(event)
    if (!message) return
    const timestamp = event.time * 1000
    this.output.send(message, timestamp)
  }

  private toMessage(event: MIDIEvent): number[] | null {
    const channel = Math.max(0, Math.min(15, (event.channel ?? 1) - 1))

    if (event.type === 'noteOn' && event.note !== undefined && event.velocity !== undefined) {
      return [0x90 | channel, event.note, event.velocity]
    }

    if (event.type === 'noteOff' && event.note !== undefined) {
      return [0x80 | channel, event.note, 0]
    }

    if (event.type === 'cc' && event.controller !== undefined && event.value !== undefined) {
      return [0xB0 | channel, event.controller, event.value]
    }

    if (event.type === 'programChange' && event.program !== undefined) {
      return [0xC0 | channel, event.program]
    }

    if (event.type === 'pitchBend' && event.value !== undefined) {
      const value = Math.max(0, Math.min(16383, event.value))
      const lsb = value & 0x7F
      const msb = (value >> 7) & 0x7F
      return [0xE0 | channel, lsb, msb]
    }

    return null
  }
}

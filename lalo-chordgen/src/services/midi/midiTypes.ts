/**
 * Core MIDI event types
 */

export type MIDIEventType = 'noteOn' | 'noteOff' | 'cc' | 'pitchBend' | 'programChange'

export interface MIDIEvent {
  type: MIDIEventType
  time: number
  channel: number
  note?: number
  velocity?: number
  controller?: number
  value?: number
  program?: number
}

export interface MIDINoteEvent extends MIDIEvent {
  type: 'noteOn' | 'noteOff'
  note: number
  velocity: number
}

export interface MIDICCEvent extends MIDIEvent {
  type: 'cc'
  controller: number
  value: number
}

export interface MIDIPitchBendEvent extends MIDIEvent {
  type: 'pitchBend'
  value: number
}

export interface MIDIProgramChangeEvent extends MIDIEvent {
  type: 'programChange'
  program: number
}

export type MIDIDestinationType = 'synth' | 'hardware' | 'recording'

export interface MIDIDestination {
  id: string
  name: string
  type: MIDIDestinationType
  send(event: MIDIEvent): void
}

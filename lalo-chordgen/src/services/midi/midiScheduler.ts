/**
 * Lookahead scheduler for MIDI events
 */

import { MIDIEvent } from './midiTypes'

export type ScheduleFn = (event: MIDIEvent) => void

export class MidiScheduler {
  private lookAheadSeconds: number
  private scheduleIntervalMs: number
  private timerId: number | null = null
  private isRunning = false

  constructor(lookAheadSeconds = 0.1, scheduleIntervalMs = 25) {
    this.lookAheadSeconds = lookAheadSeconds
    this.scheduleIntervalMs = scheduleIntervalMs
  }

  start(getEvents: () => MIDIEvent[], schedule: ScheduleFn, getNow: () => number): void {
    if (this.isRunning) return
    this.isRunning = true

    const tick = () => {
      if (!this.isRunning) return
      const now = getNow()
      const windowEnd = now + this.lookAheadSeconds
      const events = getEvents().filter((event) => event.time >= now && event.time <= windowEnd)
      events.forEach(schedule)
      this.timerId = window.setTimeout(tick, this.scheduleIntervalMs)
    }

    tick()
  }

  stop(): void {
    this.isRunning = false
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId)
      this.timerId = null
    }
  }
}

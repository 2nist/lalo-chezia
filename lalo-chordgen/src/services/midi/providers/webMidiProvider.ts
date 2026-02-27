/**
 * Browser-based MIDI Device Provider using webmidi library
 * Provides access to physical and virtual MIDI ports via Web MIDI API
 */

import { WebMidi } from 'webmidi';
import { BaseMidiDeviceProvider, MidiDevice } from '../midiDeviceProvider';

export class WebMidiDeviceProvider extends BaseMidiDeviceProvider {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await WebMidi.enable();
      this.isInitialized = true;

      // Subscribe to connection events
      WebMidi.addListener('connected', (event) => {
        const device = this.portToDevice(event.port);
        this.notifyDeviceConnected(device);
      });

      WebMidi.addListener('disconnected', (event) => {
        const device = this.portToDevice(event.port);
        this.notifyDeviceDisconnected(device);
      });
    } catch (error) {
      console.error('Failed to initialize Web MIDI:', error);
      throw error;
    }
  }

  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;
  }

  async getInputDevices(): Promise<MidiDevice[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return WebMidi.inputs.map((input) => this.portToDevice(input));
  }

  async getOutputDevices(): Promise<MidiDevice[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return WebMidi.outputs.map((output) => this.portToDevice(output));
  }

  private portToDevice(port: any): MidiDevice {
    const name = port.name || 'Unknown MIDI Device';
    const isVirtual =
      name.includes('Virtual') ||
      name.includes('Loopmidi') ||
      name.includes('IAC Drive') ||
      name.includes('Network');

    return {
      id: port.id,
      name,
      manufacturer: port.manufacturer,
      type: port.type === 'input' ? 'input' : 'output',
      state: port.state === 'connected' ? 'connected' : 'disconnected',
      isVirtual,
      isPhysical: !isVirtual,
    };
  }

  dispose(): void {
    if (this.isInitialized) {
      WebMidi.removeListener('connected');
      WebMidi.removeListener('disconnected');
    }
  }
}

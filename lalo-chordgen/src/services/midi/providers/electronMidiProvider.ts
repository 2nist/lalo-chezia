/**
 * Electron-based MIDI Device Provider using node-midi via IPC
 * Provides full system MIDI access through Electron main process
 */

import { BaseMidiDeviceProvider, MidiDevice } from '../midiDeviceProvider';

// Type for Electron IPC context
interface ElectronAPI {
  ipcRenderer: {
    invoke(channel: string, ...args: unknown[]): Promise<unknown>;
    on(
      channel: string,
      listener: (event: unknown, ...args: unknown[]) => void
    ): void;
    off(
      channel: string,
      listener: (event: unknown, ...args: unknown[]) => void
    ): void;
  };
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export class ElectronMidiDeviceProvider extends BaseMidiDeviceProvider {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (!this.isSupported()) {
      throw new Error('Electron IPC API not available');
    }

    try {
      // Listen for device connection events from main process
      window.electron!.ipcRenderer.on('midi:device-connected', (_event, device: unknown) => {
        if (device && typeof device === 'object') {
          this.notifyDeviceConnected(device as MidiDevice);
        }
      });

      window.electron!.ipcRenderer.on('midi:device-disconnected', (_event, device: unknown) => {
        if (device && typeof device === 'object') {
          this.notifyDeviceDisconnected(device as MidiDevice);
        }
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Electron MIDI provider:', error);
      throw error;
    }
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && !!window.electron?.ipcRenderer;
  }

  async getInputDevices(): Promise<MidiDevice[]> {
    if (!this.isSupported()) {
      throw new Error('Electron IPC API not available');
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    const devices = (await window.electron!.ipcRenderer.invoke(
      'midi:get-input-devices'
    )) as MidiDevice[];
    return devices;
  }

  async getOutputDevices(): Promise<MidiDevice[]> {
    if (!this.isSupported()) {
      throw new Error('Electron IPC API not available');
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    const devices = (await window.electron!.ipcRenderer.invoke(
      'midi:get-output-devices'
    )) as MidiDevice[];
    return devices;
  }

  dispose(): void {
    if (this.isInitialized && window.electron) {
      window.electron.ipcRenderer.off('midi:device-connected', () => {});
      window.electron.ipcRenderer.off('midi:device-disconnected', () => {});
    }
  }
}

/**
 * Abstract MIDI Device Provider
 * Unified interface for both browser (webmidi) and Electron (node-midi) implementations
 */

export interface MidiDevice {
  id: string;
  name: string;
  manufacturer?: string;
  type: 'input' | 'output';
  state: 'connected' | 'disconnected';
  isVirtual?: boolean;
  isPhysical?: boolean;
}

export interface MidiDeviceProvider {
  /**
   * Initialize MIDI access (may require user gesture in browser)
   */
  initialize(): Promise<void>;

  /**
   * Check if MIDI provider is supported in current environment
   */
  isSupported(): boolean;

  /**
   * Get all available MIDI input devices
   */
  getInputDevices(): Promise<MidiDevice[]>;

  /**
   * Get all available MIDI output devices
   */
  getOutputDevices(): Promise<MidiDevice[]>;

  /**
   * Listen for device connection/disconnection events
   */
  onDeviceConnected?(callback: (device: MidiDevice) => void): () => void;
  onDeviceDisconnected?(callback: (device: MidiDevice) => void): () => void;

  /**
   * Cleanup resources
   */
  dispose?(): void;
}

export abstract class BaseMidiDeviceProvider implements MidiDeviceProvider {
  abstract initialize(): Promise<void>;
  abstract isSupported(): boolean;
  abstract getInputDevices(): Promise<MidiDevice[]>;
  abstract getOutputDevices(): Promise<MidiDevice[]>;
  
  protected deviceConnectedCallbacks: Array<(device: MidiDevice) => void> = [];
  protected deviceDisconnectedCallbacks: Array<(device: MidiDevice) => void> = [];

  onDeviceConnected(callback: (device: MidiDevice) => void): () => void {
    this.deviceConnectedCallbacks.push(callback);
    return () => {
      this.deviceConnectedCallbacks = this.deviceConnectedCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  onDeviceDisconnected(callback: (device: MidiDevice) => void): () => void {
    this.deviceDisconnectedCallbacks.push(callback);
    return () => {
      this.deviceDisconnectedCallbacks = this.deviceDisconnectedCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  protected notifyDeviceConnected(device: MidiDevice): void {
    this.deviceConnectedCallbacks.forEach((cb) => cb(device));
  }

  protected notifyDeviceDisconnected(device: MidiDevice): void {
    this.deviceDisconnectedCallbacks.forEach((cb) => cb(device));
  }
}

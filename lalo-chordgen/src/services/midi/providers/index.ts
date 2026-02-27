/**
 * MIDI Device Provider Factory
 * Auto-selects appropriate provider (Electron > Browser > None)
 */

import { MidiDeviceProvider } from '../midiDeviceProvider';
import { ElectronMidiDeviceProvider } from './electronMidiProvider';
import { WebMidiDeviceProvider } from './webMidiProvider';

class ProviderFactory {
  private provider: MidiDeviceProvider | null = null;

  /**
   * Get or create the appropriate MIDI device provider for current environment
   */
  getProvider(): MidiDeviceProvider | null {
    if (this.provider) {
      return this.provider;
    }

    // Priority: Electron > Browser > None
    const electronProvider = new ElectronMidiDeviceProvider();
    if (electronProvider.isSupported()) {
      this.provider = electronProvider;
      return this.provider;
    }

    const webProvider = new WebMidiDeviceProvider();
    if (webProvider.isSupported()) {
      this.provider = webProvider;
      return this.provider;
    }

    console.warn('No MIDI provider available in this environment');
    return null;
  }

  /**
   * Check if any MIDI provider is available
   */
  isAvailable(): boolean {
    const provider = this.getProvider();
    return provider !== null;
  }

  /**
   * Cleanup
   */
  dispose(): void {
    if (this.provider && 'dispose' in this.provider) {
      this.provider.dispose?.();
    }
    this.provider = null;
  }
}

export const midiDeviceProviderFactory = new ProviderFactory();

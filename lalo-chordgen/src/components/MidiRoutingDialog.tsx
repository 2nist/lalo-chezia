/**
 * MIDI Routing Matrix Dialog
 */

import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { cardManager } from '@/services/cards/cardManager'
import { midiRouter } from '@/services/midi/midiRouter'
import { midiDeviceProviderFactory } from '@/services/midi/providers'
import { BrowserSynthDestination } from '@/services/midi/destinations/browserSynthDestination'
import { WebMidiDestination } from '@/services/midi/destinations/webMidiDestination'
import type { Card } from '@/types/card'
import type { MidiDevice } from '@/services/midi/midiDeviceProvider'


interface MidiOutputInfo extends MidiDevice {
  // Extended from MidiDevice
}

export default function MidiRoutingDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSupported, setIsSupported] = useState<boolean>(midiDeviceProviderFactory.isAvailable())
  const [isConnected, setIsConnected] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [outputs, setOutputs] = useState<MidiOutputInfo[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showGlobal, setShowGlobal] = useState(false)
  const [routes, setRoutes] = useState<Record<string, string>>({})

  const cards = useMemo(() => {
    const all = cardManager.getAllCards()
    return showGlobal ? all : all.filter((card) => card.scope === 'local')
  }, [showGlobal])

  const filteredCards = useMemo(() => {
    if (!searchTerm.trim()) return cards
    const term = searchTerm.toLowerCase()
    return cards.filter((card) => card.name.toLowerCase().includes(term))
  }, [cards, searchTerm])

  const destinations = useMemo(() => {
    const dests: { id: string; name: string }[] = [
      { id: 'browser-synth', name: 'Browser Synth' },
    ]
    outputs.forEach((output) => {
      dests.push({ id: `midi-${output.id}`, name: output.name })
    })
    return dests
  }, [outputs])

  useEffect(() => {
    if (!isSupported) return
    // Try to initialize early; browsers may block without user gesture.
    initializeMidi().catch(() => {
      // Leave to user gesture if blocked
    })
  }, [isSupported])

  useEffect(() => {
    if (destinations.length === 0) return
    setRoutes((prev) => {
      const updated = { ...prev }
      filteredCards.forEach((card) => {
        if (!updated[card.id]) updated[card.id] = 'browser-synth'
      })
      return updated
    })
  }, [destinations.length, filteredCards])

  async function initializeMidi(): Promise<void> {
    const provider = midiDeviceProviderFactory.getProvider()
    
    if (!provider) {
      setIsSupported(false)
      setError('MIDI is not supported on this platform.')
      return
    }

    setIsScanning(true)
    setError(null)

    try {
      await provider.initialize()
      const outputsList = await provider.getOutputDevices()
      setOutputs(outputsList as MidiOutputInfo[])
      setIsConnected(true)

      // Register destinations
      const synth = new BrowserSynthDestination()
      midiRouter.registerDestination(synth)

      for (const output of outputsList) {
        const dest = new WebMidiDestination(`midi-${output.id}`, output.name)
        try {
          await dest.connect(output.id)
          midiRouter.registerDestination(dest)
        } catch (err) {
          console.warn(`Failed to connect to ${output.name}:`, err)
        }
      }
    } catch (err) {
      setError('MIDI access was blocked or unavailable.')
      setIsConnected(false)
      console.error('MIDI initialization error:', err)
    } finally {
      setIsScanning(false)
    }
  }

  function updateRoute(card: Card, destinationId: string) {
    setRoutes((prev) => ({ ...prev, [card.id]: destinationId }))
    midiRouter.routeCard(card.id, destinationId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-muted'}`}
            aria-hidden
          />
          MIDI Routing
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>MIDI Routing Matrix</DialogTitle>
          <DialogDescription>
            Route each card to a MIDI destination. Browser Synth is always available.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => initializeMidi()} disabled={isScanning}>
            {isScanning ? 'Scanning...' : 'Enable MIDI'}
          </Button>
          {!isSupported && (
            <span className="text-sm text-muted-foreground">Web MIDI not supported</span>
          )}
          {error && <span className="text-sm text-destructive">{error}</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <Input
              placeholder="Filter cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showGlobal}
              onChange={(e) => setShowGlobal(e.target.checked)}
            />
            Show global cards
          </label>
        </div>

        <div className="max-h-105 overflow-auto border rounded-md">
          <div className="grid grid-cols-[1fr_220px] gap-2 text-xs uppercase tracking-wide text-muted-foreground px-3 py-2 border-b">
            <span>Card</span>
            <span>Destination</span>
          </div>
          {filteredCards.length === 0 ? (
            <div className="px-3 py-6 text-sm text-muted-foreground">No cards found.</div>
          ) : (
            filteredCards.map((card) => (
              <div key={card.id} className="grid grid-cols-[1fr_220px] gap-2 items-center px-3 py-2 border-b last:border-b-0">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{card.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{card.category} / {card.scope}</div>
                </div>
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={routes[card.id] || 'browser-synth'}
                  onChange={(e) => updateRoute(card, e.target.value)}
                  aria-label={`Route ${card.name}`}
                >
                  {destinations.map((dest) => (
                    <option key={dest.id} value={dest.id}>{dest.name}</option>
                  ))}
                </select>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

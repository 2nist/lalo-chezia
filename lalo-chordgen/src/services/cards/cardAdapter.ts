/**
 * Card Adapter
 * Converts between IdeaCardData (legacy) and Card (new database system)
 */

import { Card, CardCategory, CardScope, CardDurationType } from '../../types/card';
import type { IdeaCardData } from '../../components/IdeaCard';

/**
 * Convert new Card to legacy IdeaCardData format
 * Used for backward compatibility with existing components
 */
export function cardToIdeaCardData(card: Card): IdeaCardData {
  const ideaCard: IdeaCardData = {
    id: card.id,
    type: card.category === CardCategory.TONE ? 'tone' : 'time',
    scope: card.scope === CardScope.GLOBAL ? 'global' : 'local',
    label: card.name,
    durationType: card.durationType === CardDurationType.CONTINUOUS ? 'continuous' : 'instance',
    lengthBeats: card.lengthBeats || undefined, // Only set if defined
    repeatCount: card.repeatCount || undefined,
    intensity: 0.5,
    tags: card.tags,
  };

  // Add tone-specific properties
  if (card.toneMusicData) {
    const { toneMusicData } = card;
    
    if (toneMusicData.mode) {
      ideaCard.mode = toneMusicData.mode as IdeaCardData['mode'];
    }
    
    if (toneMusicData.voicing) {
      ideaCard.voicing = toneMusicData.voicing as IdeaCardData['voicing'];
    }
    
    if (toneMusicData.notes) {
      // Convert note names to MIDI numbers (simplified, assumes C major scale)
      const noteToMidi: Record<string, number> = {
        'C': 60, 'D': 62, 'E': 64, 'F': 65, 'G': 67, 'A': 69, 'B': 71,
      };
      ideaCard.notes = toneMusicData.notes
        .map((note: string) => noteToMidi[note.replace(/[♯♭#b0-9]/g, '')])
        .filter(Boolean);
    }
  }

  // Add time-specific properties
  if (card.timeMusicData) {
    const { timeMusicData } = card;
    
    if (timeMusicData.beatsPerMeasure) {
      ideaCard.lengthBeats = timeMusicData.beatsPerMeasure;
    }
    
    if (timeMusicData.tempoModifier) {
      if (timeMusicData.tempoModifier === 0.5) ideaCard.tempoModifier = 'half';
      else if (timeMusicData.tempoModifier === 2.0) ideaCard.tempoModifier = 'double';
      else if (timeMusicData.tempoModifier === 1.5) ideaCard.tempoModifier = 'dotted';
      else if (timeMusicData.tempoModifier === 0.67) ideaCard.tempoModifier = 'triplet';
    }
    
    // Add editable parameters
    if (timeMusicData.tempoModifier) {
      ideaCard.editable = {
        tempoMultiplier: timeMusicData.tempoModifier,
      };
    }
  }
  
  // Add MIDI clip data if present
  if (card.midiClip) {
    ideaCard.midiClip = {
      notes: card.midiClip.notes.map(note => ({
        pitch: note.pitch,
        velocity: note.velocity,
        startTime: note.startTime,
        duration: note.duration,
      })),
      tempo: card.midiClip.tempo,
      timeSignature: card.midiClip.timeSignature,
      lengthInBeats: card.midiClip.lengthInBeats,
    };
  }

  return ideaCard;
}

/**
 * Convert multiple Cards to IdeaCardData array
 */
export function cardsToIdeaCardData(cards: Card[]): IdeaCardData[] {
  return cards.map(cardToIdeaCardData);
}

/**
 * Convert legacy IdeaCardData to new Card format
 * Used when importing old data or creating new cards from UI
 */
export function ideaCardDataToCard(ideaCard: IdeaCardData): Card {
  const cardCategory = ideaCard.type === 'tone' ? CardCategory.TONE : CardCategory.TIME;
  const cardScope = ideaCard.scope === 'global' ? CardScope.GLOBAL : CardScope.LOCAL;

  const card: Card = {
    id: ideaCard.id,
    name: ideaCard.label,
    category: cardCategory,
    scope: cardScope,
    description: `${ideaCard.category || ''} card`.trim(),
    tags: ideaCard.tags || [],
  };

  // Add tone-specific data
  if (ideaCard.type === 'tone') {
    card.toneMusicData = {};
    
    if (ideaCard.mode) {
      card.toneMusicData.mode = ideaCard.mode;
    }
    
    if (ideaCard.voicing) {
      card.toneMusicData.voicing = ideaCard.voicing;
    }
    
    if (ideaCard.notes && ideaCard.notes.length > 0) {
      // Convert MIDI numbers to note names (simplified)
      const midiToNote: Record<number, string> = {
        60: 'C', 62: 'D', 64: 'E', 65: 'F', 67: 'G', 69: 'A', 71: 'B',
      };
      card.toneMusicData.notes = ideaCard.notes
        .map((midi: number) => midiToNote[midi % 12 + 60])
        .filter(Boolean);
    }
  }

  // Add time-specific data
  if (ideaCard.type === 'time') {
    card.timeMusicData = {};
    
    if (ideaCard.lengthBeats) {
      card.timeMusicData.beatsPerMeasure = ideaCard.lengthBeats;
    }
    
    if (ideaCard.tempoModifier || ideaCard.editable?.tempoMultiplier) {
      const multiplier = ideaCard.editable?.tempoMultiplier || 
        (ideaCard.tempoModifier === 'half' ? 0.5 :
         ideaCard.tempoModifier === 'double' ? 2.0 :
         ideaCard.tempoModifier === 'dotted' ? 1.5 :
         ideaCard.tempoModifier === 'triplet' ? 0.67 : 1.0);
      
      card.timeMusicData.tempoModifier = multiplier;
    }
  }

  return card;
}

/**
 * Convert multiple IdeaCardData to Cards
 */
export function ideaCardDataToCards(ideaCards: IdeaCardData[]): Card[] {
  return ideaCards.map(ideaCardDataToCard);
}

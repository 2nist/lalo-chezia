import type { Mode } from '../../components/ModeToggle'
import type { IdeaCardData } from '../../components/IdeaCard'

export function canDrop(mode: Mode, role: string, card: IdeaCardData){
  if (mode === 'Free' || mode === 'Coop' || mode === 'Draft') return true

  // Challenge mode: restrict by role
  const mapping: Record<string, Array<'time'|'tone'>> = {
    drums: ['time'],
    bass: ['time','tone'],
    pads: ['tone'],
    lead: ['tone']
  }
  const allowed = mapping[role.toLowerCase()] || ['time','tone']
  return allowed.includes(card.type)
}

export default { canDrop }

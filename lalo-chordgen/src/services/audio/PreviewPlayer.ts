let audioCtx: AudioContext | null = null
let activeNodes: AudioNode[] = []

function ensureCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  return audioCtx
}

function freqFromMidi(midi:number){
  return 440 * Math.pow(2, (midi - 69) / 12)
}

export function stopAll(){
  activeNodes.forEach(n => {
    try{ (n as any).stop && (n as any).stop() }catch(e){}
    try{ (n as any).disconnect && (n as any).disconnect() }catch(e){}
  })
  activeNodes = []
}

export function playChord(notes: number[], when = 0, duration = 1.5){
  const ctx = ensureCtx()
  const now = ctx.currentTime + when
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.15, now + 0.02)
  gain.gain.linearRampToValueAtTime(0.0001, now + duration)
  gain.connect(ctx.destination)
  activeNodes.push(gain)

  notes.forEach((midi, i) => {
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()
    osc.type = i===0?'sawtooth':'sine'
    osc.frequency.setValueAtTime(freqFromMidi(midi), now)
    oscGain.gain.setValueAtTime(0.15/(i+1), now)
    osc.connect(oscGain)
    oscGain.connect(gain)
    osc.start(now)
    osc.stop(now + duration + 0.05)
    activeNodes.push(osc)
  })
}

export function playPatternBeats(beats:number, tempo=120, patternCb:(beatIndex:number)=>void){
  const ctx = ensureCtx()
  const secondsPerBeat = 60/tempo
  for(let b=0;b<beats;b++){
    const when = b*secondsPerBeat
    setTimeout(()=>patternCb(b), Math.max(0, when*1000))
  }
}

// High-level helpers for IdeaCard-like objects
export function playIdeaCard(card:any){
  stopAll()
  if (!card) return
  if (card.type === 'tone'){
    // if card provides midi notes, use them, otherwise fallback to major triad at C4
    const notes = Array.isArray(card.notes) && card.notes.length>0 ? card.notes : [60,64,67]
    playChord(notes, 0, Math.max(1.2, card.lengthBeats * 0.25))
  } else if (card.type === 'time'){
    // click per beat using short noise burst
    const ctx = ensureCtx()
    const tempo = 100
    const secondsPerBeat = 60/tempo
    const total = card.lengthBeats
    for(let b=0;b<total;b++){
      const when = ctx.currentTime + b*secondsPerBeat
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(1000, when)
      g.gain.setValueAtTime(0.0001, when)
      g.gain.linearRampToValueAtTime(0.18, when + 0.001)
      g.gain.linearRampToValueAtTime(0.0001, when + 0.06)
      osc.connect(g)
      g.connect(ctx.destination)
      osc.start(when)
      osc.stop(when + 0.07)
      activeNodes.push(osc)
    }
  }
}

export default { playIdeaCard, playChord, stopAll }

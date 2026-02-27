let Tone: any = null
let synth: any = null

async function ensureTone(){
  if (!Tone) {
    Tone = await import('tone')
    await Tone.start()
    synth = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.005, decay: 0.2, sustain: 0.3, release: 1 }
    }).toDestination()
  }
}

export async function playNotes(notes:number[], durationSeconds = 1.5){
  await ensureTone()
  if (!synth) return
  notes.forEach((midi, i) => {
    const time = `+${i*0.02}`
    const freq = Tone.Frequency(midi, 'midi')
    synth.triggerAttackRelease(freq, durationSeconds, Tone.now())
  })
}

export async function playSequence(noteEvents:{notes:number[], timeOffset:number, duration?:number}[]){
  await ensureTone()
  for(const ev of noteEvents){
    const when = Tone.now() + (ev.timeOffset || 0)
    ev.notes.forEach(n => synth.triggerAttackRelease(Tone.Frequency(n, 'midi'), ev.duration || 0.5, when))
  }
}

export default { playNotes, playSequence }

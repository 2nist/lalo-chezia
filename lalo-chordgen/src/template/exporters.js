function encodeVLQ(n) {
  if (n === 0) return [0];
  const bytes = [];
  while (n > 0) {
    bytes.unshift(n & 0x7f);
    n >>>= 7;
  }
  for (let i = 0; i < bytes.length - 1; i++) bytes[i] |= 0x80;
  return bytes;
}

function buildMidiFile(sections, bpm = 120) {
  const ticks = 480;
  const usPerBeat = Math.round(60_000_000 / bpm);
  const track = [
    0x00, 0xff, 0x51, 0x03,
    (usPerBeat >> 16) & 0xff, (usPerBeat >> 8) & 0xff, usPerBeat & 0xff,
  ];

  for (const section of sections) {
    for (const chord of section.chords || []) {
      const notes = (chord.notes || []).map((note) => Math.max(0, Math.min(127, note)));
      const dt = encodeVLQ(Math.round((chord.duration || 4) * ticks));

      notes.forEach((note) => track.push(0x00, 0x90, note, 96));
      notes.forEach((note, index) => track.push(...(index === 0 ? dt : [0x00]), 0x80, note, 0x00));
    }
    track.push(...encodeVLQ(ticks), 0xff, 0x06, 0x00);
  }

  track.push(0x00, 0xff, 0x2f, 0x00);

  const len = track.length;
  return new Uint8Array([
    0x4d, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06,
    0x00, 0x00, 0x00, 0x01, (ticks >> 8) & 0xff, ticks & 0xff,
    0x4d, 0x54, 0x72, 0x6b,
    (len >> 24) & 0xff, (len >> 16) & 0xff, (len >> 8) & 0xff, len & 0xff,
    ...track,
  ]);
}

function triggerDownload(blob, filename) {
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

export function downloadMidi(sections, bpm = 120) {
  triggerDownload(
    new Blob([buildMidiFile(sections, bpm)], { type: "audio/midi" }),
    "lalo-export.mid"
  );
}

export function downloadJson(sections, meta = {}) {
  const payload = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    ...meta,
    sections: sections.map((section) => ({
      id: section.id,
      type: section.type,
      label: section.label,
      bars: section.bars,
      key: section.key,
      mode: section.mode,
      bpm: section.bpm,
      chords: (section.chords || []).map((chord) => ({
        degree: chord.degree,
        quality: chord.quality,
        notes: chord.notes,
        name: chord.name,
        duration: chord.duration,
      })),
    })),
  };

  triggerDownload(
    new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
    "lalo-export.json"
  );
}

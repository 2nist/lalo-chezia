/**
 * AppCombined — LALO Music Interface Template
 *
 * ─────────────────────────────────────────────────────────────────
 *  TECH STACK
 *  • React 18 + Vite  (fast HMR, ESM-native)
 *  • Tailwind CSS v4  (utility classes, @custom-variant dark)
 *  • CSS custom properties for theming (var(--background) etc.)
 *  • shadcn/ui component primitives available via ./components/ui/
 *  • ThemeSwitcher  handles dark / light toggle
 *
 *  MUSIC THEORY ENGINE  (./services → MusicTheoryEngine + ProgressionManager)
 *  • generateDiatonicChord({ keyRoot, degree, mode, voicing })  → Chord
 *  • getChordName(root, quality)            → "Cm7"
 *  • getDiatonicQuality(degree, mode)       → ChordQuality
 *  • getScaleNotes(keyRoot, mode)           → MIDI note[]
 *  • getRomanNumeral(degree, mode)          → "I" | "ii" | …
 *  • applyPattern(patternId, opts)          → Chord[]
 *  • getPatternDefinitions()                → Pattern[]
 *  • ModeExplorer.getModeCharacter(mode)
 *  • ModeExplorer.getModalProgressions(mode)
 *  • getCadencesByType(type)                → CadenceDefinition[]
 *
 *  DESIGN TOKENS  (never use raw hex — use these)
 *  CSS vars : --background  --foreground  --card  --border
 *             --muted  --muted-foreground  --accent  --input
 *  JS maps  : MODE_COLORS,  QUALITY_COLORS,  SECTION_COLORS
 *
 *  FONTS
 *  'DM Mono', monospace  — data / labels
 *  'Syne',   monospace   — brand / headings (loaded via style tag)
 *
 *  HOW TO USE THIS TEMPLATE
 *  1. Add your UI slots inside <Canvas> (replace the placeholder)
 *  2. Extend StoreProvider state as needed
 *  3. Import additional services at the top as you need them
 *  4. Run: cd lalo-chordgen && npm run dev
 * ─────────────────────────────────────────────────────────────────
 */

import React, {
  useState,
  useCallback,
  useMemo,
  createContext,
  useContext,
} from "react";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import {
  generateDiatonicChord,
  getChordName,
  getDiatonicQuality,
  getScaleNotes,
} from "./services";

// ─── 1. Design Tokens ────────────────────────────────────────────────────────

const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

/** Map key display name → chromatic semitone (0 = C) */
const KEY_TO_SEMITONE = {
  "C":0,"C#/Db":1,"D":2,"D#/Eb":3,"E":4,"F":5,
  "F#/Gb":6,"G":7,"G#/Ab":8,"A":9,"A#/Bb":10,"B":11,
};
const KEYS_12 = Object.keys(KEY_TO_SEMITONE);

/** Convert display key + octave to an absolute MIDI note number */
const keyToMidi = (key, octave = 4) =>
  (KEY_TO_SEMITONE[key] ?? 0) + octave * 12;

const ALL_MODES = [
  { name:"Ionian",     brightness:"bright", emotionalQuality:"Happy, triumphant",       typicalUse:"Pop, classical"   },
  { name:"Dorian",     brightness:"neutral",emotionalQuality:"Cool, introspective",     typicalUse:"Jazz, folk, rock" },
  { name:"Phrygian",   brightness:"dark",   emotionalQuality:"Dark, Spanish, dramatic", typicalUse:"Flamenco, metal"  },
  { name:"Lydian",     brightness:"bright", emotionalQuality:"Ethereal, magical",       typicalUse:"Film, jazz, prog" },
  { name:"Mixolydian", brightness:"neutral",emotionalQuality:"Laid-back, bluesy",       typicalUse:"Rock, blues"      },
  { name:"Aeolian",    brightness:"dark",   emotionalQuality:"Sad, contemplative",      typicalUse:"Ballads, rock"    },
  { name:"Locrian",    brightness:"dark",   emotionalQuality:"Unsettling, dissonant",   typicalUse:"Experimental"     },
];

const SECTION_COLORS = {
  Verse:"#2d5a8e", Chorus:"#6b2d8e", Bridge:"#8e6b2d",
  "Pre-Chorus":"#2d8e6b", Intro:"#3d3d6b", Outro:"#6b3d3d",
  Hook:"#8e2d5a", Break:"#4a4a4a",
};

/** Chord quality → accent colour for pills / buttons */
const QUALITY_COLORS = {
  Maj:"#60c0f0", Maj7:"#40d0cc",  dom7:"#f0c040",
  min:"#8080e0", min7:"#6060d0",  minMaj7:"#7070b0",
  dim:"#c040c0", dim7:"#b030b0",  hdim7:"#d050c0",
  aug:"#fb923c", aug7:"#f97316",
  sus2:"#94a3b8",sus4:"#78909c",
};

/** Mode name → accent colour for scale strips / mode pickers */
const MODE_COLORS = {
  Ionian:"#60c0f0", Dorian:"#60d0a0",  Phrygian:"#e06060",
  Lydian:"#f0c040", Mixolydian:"#80e060", Aeolian:"#8080e0",
  Locrian:"#c040c0",
};

// Roman numeral helper
const ROMAN_NUMS = ["","I","II","III","IV","V","VI","VII"];
const degreeRoman = (degree, quality) => {
  const upper = !quality || quality.startsWith("M") || quality === "dom7" || quality === "aug";
  const r = ROMAN_NUMS[degree] ?? String(degree);
  return upper ? r : r.toLowerCase();
};

// ─── 2. MIDI + JSON Export Helpers ──────────────────────────────────────────
//  Call downloadMidi(sections, bpm) or downloadJson(sections, meta) from
//  any button handler to trigger a browser download.

function encodeVLQ(n) {
  if (n === 0) return [0];
  const bytes = [];
  while (n > 0) { bytes.unshift(n & 0x7f); n >>>= 7; }
  for (let i = 0; i < bytes.length - 1; i++) bytes[i] |= 0x80;
  return bytes;
}

/**
 * Build a minimal Format-0 Standard MIDI File from an array of sections.
 * Each section must have: { chords: [{ notes: number[], duration: number }] }
 */
function buildMidiFile(sections, bpm = 120) {
  const TICKS = 480;
  const usPerBeat = Math.round(60_000_000 / bpm);
  const track = [
    0x00,0xff,0x51,0x03,
    (usPerBeat>>16)&0xff,(usPerBeat>>8)&0xff,usPerBeat&0xff,
  ];
  for (const sec of sections) {
    for (const chord of (sec.chords || [])) {
      const notes = (chord.notes || []).map(n => Math.max(0, Math.min(127, n)));
      const dt = encodeVLQ(Math.round((chord.duration || 4) * TICKS));
      notes.forEach(n => track.push(0x00, 0x90, n, 96));
      notes.forEach((n, i) => track.push(...(i===0 ? dt : [0x00]), 0x80, n, 0x00));
    }
    track.push(...encodeVLQ(TICKS), 0xff, 0x06, 0x00); // 1-beat gap
  }
  track.push(0x00, 0xff, 0x2f, 0x00);
  const len = track.length;
  return new Uint8Array([
    0x4d,0x54,0x68,0x64,0x00,0x00,0x00,0x06,
    0x00,0x00,0x00,0x01,(TICKS>>8)&0xff,TICKS&0xff,
    0x4d,0x54,0x72,0x6b,
    (len>>24)&0xff,(len>>16)&0xff,(len>>8)&0xff,len&0xff,
    ...track,
  ]);
}

function triggerDownload(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
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
    sections: sections.map(s => ({
      id: s.id, type: s.type, label: s.label,
      bars: s.bars, key: s.key, mode: s.mode, bpm: s.bpm,
      chords: (s.chords || []).map(c => ({
        degree: c.degree, quality: c.quality,
        notes: c.notes, name: c.name, duration: c.duration,
      })),
    })),
  };
  triggerDownload(
    new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
    "lalo-export.json"
  );
}

// ─── 3. Store (local Context — swap for Zustand if project grows) ────────────

let _uid = 1;
const mkId = () => `s${_uid++}`;

/** Factory for a blank section with sensible defaults */
export const mkSection = (type = "Verse", extra = {}) => ({
  id: mkId(), type, label: type,
  bars: 8, key: "", mode: "", bpm: "",
  chords: [],           // [{ id, degree, quality, notes, name, roman, duration }]
  transition: "v_i",    // cadence label to the NEXT section
  ...extra,
});

const StoreCtx = createContext(null);

function StoreProvider({ children }) {
  const [sections,     setSections]     = useState([]);
  const [focusedId,    setFocusedId]    = useState(null);
  const [expandedId,   setExpandedId]   = useState(null);
  const [globalKey,    setGlobalKey]    = useState("C");
  const [globalMode,   setGlobalMode]   = useState("Ionian");
  const [globalBpm,    setGlobalBpm]    = useState(120);

  // ── Section CRUD ──────────────────────────────────────────────
  const addSection = useCallback((type) =>
    setSections(ss => [...ss, mkSection(type)]), []);

  const updateSection = useCallback((id, patch) =>
    setSections(ss => ss.map(s => s.id === id ? { ...s, ...patch } : s)), []);

  const deleteSection = useCallback((id) =>
    setSections(ss => ss.filter(s => s.id !== id)), []);

  const reorderSections = useCallback((from, to) =>
    setSections(ss => {
      const next = [...ss];
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      return next;
    }), []);

  // ── Chord operations ─────────────────────────────────────────
  const addChord = useCallback((sectionId, chord) =>
    setSections(ss => ss.map(s =>
      s.id === sectionId
        ? { ...s, chords: [...s.chords, { ...chord, id: `c${_uid++}` }] }
        : s
    )), []);

  const removeChord = useCallback((sectionId, chordId) =>
    setSections(ss => ss.map(s =>
      s.id === sectionId
        ? { ...s, chords: s.chords.filter(c => c.id !== chordId) }
        : s
    )), []);

  // ── Focus / expand helpers ───────────────────────────────────
  const focusSection  = useCallback((id) => setFocusedId(id), []);
  const toggleExpand  = useCallback((id) =>
    setExpandedId(prev => prev === id ? null : id), []);

  return (
    <StoreCtx.Provider value={{
      // state
      sections, focusedId, expandedId,
      globalKey, globalMode, globalBpm,
      // setters
      setGlobalKey, setGlobalMode, setGlobalBpm,
      // section actions
      addSection, updateSection, deleteSection, reorderSections,
      // chord actions
      addChord, removeChord,
      // focus
      focusSection, toggleExpand,
    }}>
      {children}
    </StoreCtx.Provider>
  );
}

export const useStore = () => useContext(StoreCtx);

// ─── 4. Primitive UI Atoms ───────────────────────────────────────────────────
//  Copy-paste these anywhere in your layout.

/**
 * ScaleStrip
 * One-octave chromatic piano roll that lights scale notes and chord dots.
 * Props: keyRoot (MIDI int), mode (string), chordNotes (MIDI int[])
 */
export function ScaleStrip({ keyRoot, mode, chordNotes = [] }) {
  const BLACK = new Set([1,3,6,8,10]);
  const scaleSet = useMemo(
    () => new Set(mode && keyRoot != null
      ? getScaleNotes(keyRoot, mode).map(n => n % 12)
      : []),
    [keyRoot, mode]
  );
  const chordSet = useMemo(
    () => new Set(chordNotes.map(n => n % 12)),
    [chordNotes]
  );
  const mc = MODE_COLORS[mode] || "#888";

  return (
    <div style={{ display:"flex", gap:1.5, height:38, padding:"2px 0", alignItems:"flex-end" }}>
      {Array.from({length:12}, (_,i) => {
        const isBlack = BLACK.has(i);
        const lit     = scaleSet.has(i);
        const dot     = chordSet.has(i);
        return (
          <div key={i} title={NOTE_NAMES[i]} style={{
            width: isBlack ? 10 : 14,
            height: isBlack ? 26 : 34,
            alignSelf: isBlack ? "flex-start" : "flex-end",
            borderRadius:"0 0 3px 3px",
            background: dot ? mc : lit ? mc+(isBlack?"55":"33") : isBlack?"#1a1a2a":"#e8e8f0",
            border:`1px solid ${lit ? mc+"44" : "#00000011"}`,
            position:"relative", flexShrink:0,
          }}>
            {dot && <div style={{
              position:"absolute", bottom:3, left:"50%", transform:"translateX(-50%)",
              width:4, height:4, borderRadius:"50%",
              background: isBlack?"#fff":"#333",
            }}/>}
          </div>
        );
      })}
    </div>
  );
}

/**
 * ChordPill
 * Compact chip for one chord.  Pass onRemove to show an × button.
 */
export function ChordPill({ chord, onRemove }) {
  const color = QUALITY_COLORS[chord.quality] || "#888";
  return (
    <div style={{
      display:"inline-flex", alignItems:"center", gap:4,
      background:color+"18", border:`1px solid ${color}44`,
      borderRadius:4, padding:"3px 7px", fontSize:10,
      fontFamily:"'DM Mono',monospace", flexShrink:0, cursor:"default",
    }}>
      <span style={{color}}>{chord.roman || chord.name}</span>
      <span style={{color:color+"55",fontSize:8}}>{chord.quality}</span>
      {onRemove && (
        <button onClick={onRemove} style={{
          background:"none",border:"none",color:color+"55",
          cursor:"pointer",fontSize:12,lineHeight:1,padding:"0 0 0 2px",
        }}>×</button>
      )}
    </div>
  );
}

/**
 * Badge
 * Tiny labelled tag.  Pass color to tint it.
 */
export function Badge({ label, color = "#888" }) {
  return (
    <span style={{
      fontSize:8, fontFamily:"'DM Mono',monospace",
      color, background:color+"18",
      border:`1px solid ${color}22`,
      borderRadius:3, padding:"0 5px 1px",
    }}>{label}</span>
  );
}

// ─── 5. Slot Components ──────────────────────────────────────────────────────
//  These are intentionally minimal starting points.
//  Build your UI ideas here — wire state from useStore().

/**
 * Header
 * Global key / mode / BPM controls + ThemeSwitcher + export action slot.
 * Extend freely.
 */
function Header({ onExport }) {
  const { globalKey, globalMode, globalBpm, setGlobalKey, setGlobalMode, setGlobalBpm } = useStore();
  const mc = MODE_COLORS[globalMode] || "#888";

  return (
    <div style={{
      height:44, background:"var(--card)",
      borderBottom:"1px solid var(--border)",
      display:"flex", alignItems:"center",
      padding:"0 16px", gap:12, flexShrink:0,
    }}>
      <span style={{
        fontSize:15, fontWeight:700, letterSpacing:"0.1em",
        fontFamily:"'Syne','DM Mono',monospace",
        color:"var(--foreground)",
      }}>LALO</span>

      <span style={{width:1, height:20, background:"var(--border)"}}/>

      {/* Key picker */}
      <label style={{display:"flex",alignItems:"center",gap:5}}>
        <span style={{fontSize:8,color:"var(--muted-foreground)",letterSpacing:"0.08em"}}>KEY</span>
        <select value={globalKey} onChange={e=>setGlobalKey(e.target.value)}
          style={{background:"var(--input)",border:"1px solid var(--border)",borderRadius:4,
            color:"#14b8a6",padding:"3px 6px",fontSize:11,fontFamily:"'DM Mono',monospace",
            cursor:"pointer",outline:"none"}}>
          {KEYS_12.map(k=><option key={k} value={k}>{k}</option>)}
        </select>
      </label>

      {/* Mode picker */}
      <label style={{display:"flex",alignItems:"center",gap:5}}>
        <span style={{fontSize:8,color:"var(--muted-foreground)",letterSpacing:"0.08em"}}>MODE</span>
        <select value={globalMode} onChange={e=>setGlobalMode(e.target.value)}
          style={{background:"var(--input)",border:"1px solid var(--border)",borderRadius:4,
            color:mc,padding:"3px 6px",fontSize:11,fontFamily:"'DM Mono',monospace",
            cursor:"pointer",outline:"none"}}>
          {ALL_MODES.map(m=><option key={m.name} value={m.name}>{m.name}</option>)}
        </select>
      </label>

      {/* BPM */}
      <label style={{display:"flex",alignItems:"center",gap:5}}>
        <span style={{fontSize:8,color:"var(--muted-foreground)",letterSpacing:"0.08em"}}>BPM</span>
        <input type="number" value={globalBpm}
          onChange={e=>setGlobalBpm(Math.max(20,Math.min(300,parseInt(e.target.value)||120)))}
          style={{width:46,background:"var(--input)",border:"1px solid var(--border)",
            borderRadius:4,color:"var(--muted-foreground)",padding:"3px 6px",
            fontSize:11,fontFamily:"'DM Mono',monospace",outline:"none",textAlign:"center"}}/>
      </label>

      <div style={{flex:1}}/>
      <ThemeSwitcher />

      {/* Export slot */}
      {onExport && (
        <button onClick={onExport} style={{
          background:"var(--input)",border:"1px solid var(--border)",
          borderRadius:5,padding:"5px 11px",cursor:"pointer",
          color:"var(--foreground)",fontSize:10,fontFamily:"'DM Mono',monospace",
        }}>↓ Export</button>
      )}
    </div>
  );
}

/**
 * Canvas  ← BUILD YOUR MAIN UI HERE
 *
 * This is a blank workspace that fills all remaining screen height.
 * Replace the placeholder with your layout concept.
 *
 * Useful hooks:
 *   const { sections, focusedId, globalKey, globalMode, globalBpm,
 *           addSection, updateSection, focusSection, addChord } = useStore();
 *
 * Useful services (already imported at top):
 *   generateDiatonicChord({ keyRoot, degree, mode, voicing })
 *   getDiatonicQuality(degree, mode)
 *   getScaleNotes(keyRoot, mode)
 *   getChordName(root, quality)
 */
function Canvas() {
  const { globalKey, globalMode, globalBpm } = useStore();
  const midiRoot  = keyToMidi(globalKey);
  const modeColor = MODE_COLORS[globalMode] || "#888";

  return (
    <div style={{
      flex:1, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"var(--background)", overflow:"hidden",
      gap:24, padding:32,
    }}>
      {/* ── Blank canvas placeholder ── */}
      <div style={{
        border:`1px dashed ${modeColor}44`,
        borderRadius:12, padding:"48px 64px",
        display:"flex", flexDirection:"column", alignItems:"center", gap:16,
      }}>
        <span style={{
          fontSize:11, letterSpacing:"0.18em", color:"var(--muted-foreground)",
          fontFamily:"'DM Mono',monospace",
        }}>BLANK CANVAS — BUILD HERE</span>

        {/* Scale strip preview */}
        <ScaleStrip keyRoot={midiRoot} mode={globalMode} />

        {/* Current global context badge row */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
          <Badge label={globalKey} color="#14b8a6"/>
          <Badge label={globalMode} color={modeColor}/>
          <Badge label={`${globalBpm} BPM`} color="var(--muted-foreground)"/>
        </div>

        {/* Diatonic degree reference — clickable, wires to generateDiatonicChord */}
        <div style={{display:"flex",gap:6,marginTop:8}}>
          {[1,2,3,4,5,6,7].map(deg=>{
            const quality = getDiatonicQuality(deg, globalMode);
            const roman   = degreeRoman(deg, quality);
            const color   = QUALITY_COLORS[quality] || "#888";
            return (
              <button key={deg} style={{
                fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:500,
                color, background:color+"12",
                border:`1px solid ${color}44`,borderRadius:5,
                padding:"6px 10px",cursor:"pointer",transition:"all 0.1s",
                lineHeight:1,
              }}
                onMouseEnter={e=>e.currentTarget.style.background=color+"2a"}
                onMouseLeave={e=>e.currentTarget.style.background=color+"12"}
                title={`Degree ${deg} — ${quality}`}
              >{roman}</button>
            );
          })}
        </div>

        <span style={{
          fontSize:8,color:"var(--muted-foreground)",fontFamily:"'DM Mono',monospace",
          letterSpacing:"0.1em",marginTop:4,
        }}>
          TECH: React 18 · Vite · Tailwind v4 · CSS vars · DM Mono · Syne
        </span>
      </div>
    </div>
  );
}

// ─── 6. Root App Shell ───────────────────────────────────────────────────────

function AppShell() {
  const { sections, globalKey, globalMode, globalBpm } = useStore();

  const handleExport = useCallback(() => {
    downloadMidi(sections, globalBpm);
    downloadJson(sections, { globalKey, globalMode, globalBpm });
  }, [sections, globalKey, globalMode, globalBpm]);

  return (
    <div style={{
      width:"100vw", height:"100vh",
      display:"flex", flexDirection:"column",
      overflow:"hidden", fontFamily:"'DM Mono',monospace",
      background:"var(--background)",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        select option { background:var(--card); }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }
        input[type=number]::-webkit-inner-spin-button { opacity:.3; }
      `}</style>
      <Header onExport={handleExport}/>
      <Canvas />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}

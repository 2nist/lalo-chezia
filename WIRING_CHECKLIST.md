# 🔌 Wiring Checklist - Exact Functions to Connect

This document lists every event handler, function call, and connection that needs to be wired.

---

## M4LProg - ProgressionEditor.tsx

### 1. ADD Button (Line ~300)
```typescript
// CURRENT:
<button onClick={() => {}}> ADD </button>

// WIRE TO:
onClick={async () => {
  const section = useProgressionStore((s) => s.sections[0]);
  const chord = MusicTheory.generateDiatonicChord({
    keyRoot: section.key,
    degree: selectedDegree,
    mode: selectedMode,
    voicing: { inversion: 0, drop: 0 }
  });
  
  const progression = useProgressionStore((s) => s.getSection(section.id).progression);
  progression.push({ notes: chord, duration: 4 });
  
  useProgressionStore((s) => s.updateSection(section.id, { progression }));
  useLiveStore((s) => s.createProgression(progression));
  
  await sendArrangedEventsToWebMidi([...progression]);
}}
```

### 2. INSERT Button
```typescript
onClick={async () => {
  // Same as ADD but use insertChord instead of push
  const progression = [...current];
  progression.splice(selectedIndex, 0, newChord);
  
  useProgressionStore((s) => s.updateSection(sectionId, { progression }));
  await sendArrangedEventsToWebMidi(progression);
}}
```

### 3. REPLACE Button
```typescript
onClick={async () => {
  const progression = [...current];
  progression[selectedIndex] = newChord;
  
  useProgressionStore((s) => s.updateSection(sectionId, { progression }));
  await sendArrangedEventsToWebMidi(progression);
}}
```

### 4. DELETE Button
```typescript
onClick={async () => {
  const progression = current.filter((_, i) => i !== selectedIndex);
  
  useProgressionStore((s) => s.updateSection(sectionId, { progression }));
  await sendArrangedEventsToWebMidi(progression);
}}
```

### 5. CLEAR Button
```typescript
onClick={async () => {
  useProgressionStore((s) => s.updateSection(sectionId, { progression: [] }));
  await sendArrangedEventsToWebMidi([]);
}}
```

### 6. SEND Button (Critical!)
```typescript
onClick={async () => {
  const arrangementBlocks = useProgressionStore((s) => {
    const sections = s.sections;
    const uiMode = s.uiMode;
    return buildArrangedChordEvents(sections, uiMode);
  });
  
  const destination = useRoutingStore((s) => s.getMidiDestination());
  await sendArrangedEventsToWebMidi(arrangementBlocks);
  
  // Also send to Live if connected
  const isConnected = useLiveStore((s) => s.isConnected);
  if (isConnected) {
    useLiveStore((s) => s.createProgression(arrangementBlocks));
  }
}}
```

### 7. Mode Dropdown OnChange
```typescript
value={selectedMode}
onChange={(e) => {
  const mode = e.target.value as ModaleName;
  setSelectedMode(mode);
  
  // Update store
  useProgressionStore((s) => s.updateSection(sectionId, { mode }));
}}
```

---

## M4LProg - App.tsx (Main Component)

### Plugin: Initialize OSC on Mount
```typescript
useEffect(() => {
  const initLive = async () => {
    const success = await useLiveStore((s) => s.initializeOSC());
    if (!success) {
      console.error("Failed to connect to Live");
      // Show error toast
    }
  };
  
  initLive();
}, []);
```

### Mode Arc - Mode Change Handler
```typescript
onClick={() => {
  const newMode = mode.id as ModeId;
  useProgressionStore((s) => s.setUiMode(newMode));
  
  // Rebuild arrangement display for new mode
  const arrangement = useProgressionStore((s) => 
    buildArrangedChordEvents(s.sections, newMode)
  );
}}
```

---

## lalo-chordgen - AppCombined.jsx

### Pattern Buttons (Line ~500+)
```typescript
// CURRENT:
{PATTERNS.map(p=>(
  <button key={p.id} onClick={()=>{}}>{p.name}</button>
))}

// WIRE TO:
{PATTERNS.map(p=>(
  <button 
    key={p.id} 
    onClick={async () => {
      const progression = applyPattern({
        patternId: p.id,
        key: currentKey,
        mode: currentMode,
        root: currentKey
      });
      
      // Update current section
      if (currentSection) {
        setCurrentSection({ ...currentSection, pattern: p.id });
        setSongStructure(ss => 
          ss.map(s => s.id === currentSection.id 
            ? { ...s, progression, pattern: p.id }
            : s
          )
        );
      }
    }}
  >
    {p.name}
  </button>
))}
```

### Cadence Buttons
```typescript
{getCadenceTypes().map(cadence => (
  <button
    key={cadence.id}
    onClick={() => {
      const analysis = detectCadences({
        progression: currentChord ? [currentChord] : [],
        mode: currentMode,
        key: currentKey
      });
      
      setCadenceAnalysis(analysis);
      setSelectedCadence(cadence);
    }}
  >
    {cadence.name}
  </button>
))}
```

### Rhythm Pattern Buttons
```typescript
{rhythmPatterns.map(rhythm => (
  <button
    key={rhythm.id}
    onClick={() => {
      // Apply to current section
      if (currentSection) {
        setCurrentSection({
          ...currentSection,
          rhythmPattern: rhythm
        });
      }
    }}
  >
    {rhythm.name}
  </button>
))}
```

---

## M4LProg - ChordPalette.tsx

### Root Note Selector
```typescript
<select 
  value={selectedRoot}
  onChange={(e) => {
    setSelectedRoot(parseInt(e.target.value));
    
    // Generate new chord with new root
    const newChord = MusicTheory.generateDiatonicChord({
      keyRoot: parseInt(e.target.value),
      degree: selectedDegree,
      mode: selectedMode,
      voicing: { inversion: 0, drop: 0 }
    });
    setSelectedChord(newChord);
  }}
>
  {NOTE_NAMES.map((note, i) => (
    <option key={i} value={60 + i}>{note}</option>
  ))}
</select>
```

### Quality Selector
```typescript
<select
  value={selectedQuality}
  onChange={(e) => {
    setSelectedQuality(e.target.value as ChordQuality);
    
    // Update chord with new quality
    // (may require additional voicing adjustments)
  }}
>
  {QUALITIES.map(q => (
    <option key={q} value={q}>{q}</option>
  ))}
</select>
```

### + (Add Chord) Button
```typescript
<button
  onClick={async () => {
    if (!selectedChord) return;
    
    const section = useProgressionStore((s) => s.sections[0]);
    const progression = useProgressionStore((s) => 
      s.getSectionProgression(section, uiMode)
    );
    
    progression.push({
      notes: selectedChord,
      duration: selectedDuration || 4
    });
    
    useProgressionStore((s) => 
      s.setSectionProgression(section.id, uiMode, progression)
    );
    
    await sendArrangedEventsToWebMidi(progression);
  }}
>
  + Add
</button>
```

### Duration Input
```typescript
<input
  type="number"
  value={selectedDuration}
  onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
  placeholder="beats (1-16)"
  min="1"
  max="16"
/>
```

---

## M4LProg - LoopTimeline.tsx

### Timeline Drag End Handler
```typescript
// Implement drag-drop persistence
const handleDragEnd = useCallback((result) => {
  const { source, destination } = result;
  
  if (!destination || source.droppableId === destination.droppableId) {
    return;
  }
  
  // Reorder in store
  const oldPosition = Object.keys(section.modeProgressions).indexOf(source.index);
  const newPosition = Object.keys(section.modeProgressions).indexOf(destination.index);
  
  useProgressionStore((s) => 
    s.reorderSections(oldPosition, newPosition)
  );
}, []);
```

### Timeline Resize Handle
```typescript
const handleResizeComplete = (sectionId: string, newDuration: number) => {
  const section = useProgressionStore((s) => 
    s.sections.find(sec => sec.id === sectionId)
  );
  
  if (section) {
    useProgressionStore((s) => 
      s.updateSection(sectionId, {
        progression: section.progression?.map((c, i) => ({
          ...c,
          duration: newDuration
        }))
      })
    );
  }
};
```

---

## M4LProg - ActiveSectionEditor.tsx

### Mode Selection Dropdown
```typescript
<select
  value={activeSection?.mode || ''}
  onChange={(e) => {
    useProgressionStore((s) => 
      s.updateSection(activeSection.id, { mode: e.target.value as ModaleName })
    );
  }}
>
  {MODES.map(m => (
    <option key={m} value={m}>{m}</option>
  ))}
</select>
```

### BPM Input
```typescript
<input
  type="number"
  value={activeSection?.bpm || ''}
  onChange={(e) => {
    useProgressionStore((s) => 
      s.updateSection(activeSection.id, { bpm: parseInt(e.target.value) })
    );
    
    // Update Live tempo if connected
    const isConnected = useLiveStore((s) => s.isConnected);
    if (isConnected) {
      useLiveStore((s) => s.setTempo(parseInt(e.target.value)));
    }
  }}
  placeholder="BPM"
/>
```

### Chord Count Display (should be editable)
```typescript
<div>
  Chords: {activeSection?.progression?.length || 0}
  <input
    type="number"
    onChange={(e) => {
      // Generate that many chords
      const count = parseInt(e.target.value);
      const newProgression = Array(count).fill(0).map(() =>
        MusicTheory.generateDiatonicChord({
          keyRoot: activeSection.key,
          degree: Math.floor(Math.random() * 7) + 1,
          mode: activeSection.mode,
          voicing: { inversion: 0, drop: 0 }
        })
      );
      
      useProgressionStore((s) => 
        s.updateSection(activeSection.id, { progression: newProgression })
      );
    }}
  />
</div>
```

### Pattern Selector
```typescript
<select
  onChange={(e) => {
    const patternId = e.target.value;
    const progression = applyPattern({
      patternId,
      key: activeSection.key,
      mode: activeSection.mode
    });
    
    useProgressionStore((s) => 
      s.updateSection(activeSection.id, { 
        progression,
        pattern: patternId 
      })
    );
  }}
>
  {PATTERNS.map(p => (
    <option key={p.id} value={p.id}>{p.name}</option>
  ))}
</select>
```

---

## M4LProg - SongFormPicker.tsx

### Template Selection + Apply Button
```typescript
const [selectedFormId, setSelectedFormId] = useState<string>('');

<select 
  value={selectedFormId}
  onChange={(e) => setSelectedFormId(e.target.value)}
>
  {SONG_FORM_TEMPLATES.map(t => (
    <option key={t.id} value={t.id}>{t.name}</option>
  ))}
</select>

<button
  onClick={() => {
    const template = SONG_FORM_TEMPLATES.find(t => t.id === selectedFormId);
    if (!template) return;
    
    const newSections = template.sections.map((sec, i) => ({
      id: `section-${i}`,
      type: sec.type,
      label: sec.label,
      bars: sec.bars,
      progression: [],
      mode: 'Ionian' as ModaleName,
      modeProgressions: { harmony: [], drum: [], other: [] }
    }));
    
    useProgressionStore((s) => s.setSections(newSections));
  }}
>
  Apply Template
</button>
```

---

## Hardware Store - Listeners Setup

### In useEffect (M4LProg/App.tsx or HardwareStore init)
```typescript
useEffect(() => {
  const unsubscribe = useHardwareStore.subscribe(
    (state) => state.buttonStates,
    (buttonStates) => {
      // When hardware sends button press
      Object.entries(buttonStates).forEach(([padId, state]) => {
        if (state.isPressed) {
          handlePadPress(padId, state.velocity);
        }
      });
    }
  );
  
  return unsubscribe;
}, []);
```

---

## Live Store - Connection Handler

### In useEffect (M4LProg/App.tsx)
```typescript
// Listen for OSC messages
useEffect(() => {
  const unsubscribe = useLiveStore.subscribe(
    (state) => state.transport,
    (transport) => {
      // Update UI with current beat, tempo, etc.
      setCurrentBeat(transport.currentBeat);
      setCurrentTempo(transport.tempo);
    }
  );
  
  return unsubscribe;
}, []);

// Listen for connection changes
useEffect(() => {
  const unsubscribe = useLiveStore.subscribe(
    (state) => state.isConnected,
    (isConnected) => {
      if (isConnected) {
        console.log('✅ Connected to Live');
        // Request current state
        useLiveStore((s) => s.requestTransportState());
        useLiveStore((s) => s.requestTrackList());
      } else {
        console.log('❌ Disconnected from Live');
      }
    }
  );
  
  return unsubscribe;
}, []);
```

---

## Cross-App Bridge (NEW SERVICE TO CREATE)

### File: `lalo-chordgen/src/services/CrossAppBridge.ts`

```typescript
export interface ProgressionExport {
  progression: Chord[];
  mode: ModeName;
  key: number;
  bpm: number;
  timeSignature: TimeSignature;
  metadata: {
    exportedAt: number;
    appSource: 'chordgen' | 'm4lprog';
    version: '1.0';
  };
}

export function exportProgression(section: Section): ProgressionExport {
  return {
    progression: section.progression || [],
    mode: section.mode,
    key: section.key,
    bpm: section.bpm,
    timeSignature: section.timeSignature,
    metadata: {
      exportedAt: Date.now(),
      appSource: 'chordgen',
      version: '1.0'
    }
  };
}

export function importProgression(data: ProgressionExport): Section {
  return {
    id: uuid(),
    type: 'Verse',
    label: 'Imported',
    progression: data.progression,
    mode: data.mode,
    key: data.key,
    bpm: data.bpm,
    timeSignature: data.timeSignature
  };
}

export function shareToM4LProg(section: Section) {
  const exported = exportProgression(section);
  // Store in localStorage with magic key
  localStorage.setItem('m4lprog:import', JSON.stringify(exported));
  // Open M4LProg
  window.open('http://localhost:5174#import=true');
}

export function shareToChordGen(section: Section) {
  const exported = exportProgression(section);
  localStorage.setItem('chordgen:import', JSON.stringify(exported));
  window.open('http://localhost:5173#import=true');
}
```

---

## VelocityCurveDrawer.tsx (Partial Fix)

### Add Click Handler to Canvas
```typescript
const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
  const rect = canvasRef.current!.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // Check if near existing point
  const dragPoint = velocityCurve.findIndex(p => 
    Math.abs(p.x - x) < 5 && Math.abs(p.y - y) < 5
  );
  
  if (dragPoint >= 0) {
    setDraggingPoint(dragPoint);
  } else {
    // Add new point
    const newPoint = { x, y };
    setVelocityCurve([...velocityCurve, newPoint].sort((a, b) => a.x - b.x));
    
    // Persist
    useProgressionStore((s) => 
      s.updateSection(sectionId, { velocityCurve })
    );
  }
};
```

---

## Summary: Functions to Connect

| Component | Function | Priority |
|-----------|----------|----------|
| ProgressionEditor | 6 buttons | 🔴 CRITICAL |
| App (M4LProg) | OSC init | 🔴 CRITICAL |
| ChordPalette | 5 handlers | 🔴 CRITICAL |
| LoopTimeline | Drag/Resize | 🟡 HIGH |
| ActiveSectionEditor | 4 selectors | 🟡 HIGH |
| AppCombined | Pattern buttons | 🟡 HIGH |
| SongFormPicker | Template apply | 🟠 MEDIUM |
| VelocityCurveDrawer | Click handler | 🟠 MEDIUM |
| CrossAppBridge | Import/Export | 🟠 MEDIUM |

**Total: ~30-40 event handlers to wire**


import React, { useCallback, useMemo, useState } from "react";
import { ThemeSwitcher } from "../components/ThemeSwitcher";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  generateDiatonicChord,
  getChordName,
  getDiatonicQuality,
  getScaleNotes,
} from "../services";
import {
  ALL_MODES,
  KEYS_12,
  MODE_COLORS,
  NOTE_NAMES,
  QUALITY_COLORS,
  SECTION_COLORS,
  SECTION_TYPE_OPTIONS,
  degreeRoman,
  keyToMidi,
} from "./constants";
import { downloadJson, downloadMidi } from "./exporters";
import { ToolDrawer } from "./tool-drawer";
import { getToolDefinition, toolRegistry } from "./tool-registry";
import { useStore } from "./store";

export function ScaleStrip({ keyRoot, mode, chordNotes = [] }) {
  const blackNotes = new Set([1, 3, 6, 8, 10]);

  const scaleSet = useMemo(
    () =>
      new Set(
        mode && keyRoot != null
          ? getScaleNotes(keyRoot, mode).map((note) => note % 12)
          : []
      ),
    [keyRoot, mode]
  );

  const chordSet = useMemo(() => new Set(chordNotes.map((note) => note % 12)), [chordNotes]);
  const modeColor = MODE_COLORS[mode] || "#888";

  return (
    <div style={{ display: "flex", gap: 1.5, height: 38, padding: "2px 0", alignItems: "flex-end" }}>
      {Array.from({ length: 12 }, (_, index) => {
        const isBlack = blackNotes.has(index);
        const isScaleNote = scaleSet.has(index);
        const isChordNote = chordSet.has(index);

        return (
          <div
            key={index}
            title={NOTE_NAMES[index]}
            style={{
              width: isBlack ? 10 : 14,
              height: isBlack ? 26 : 34,
              alignSelf: isBlack ? "flex-start" : "flex-end",
              borderRadius: "0 0 3px 3px",
              background: isChordNote
                ? modeColor
                : isScaleNote
                  ? modeColor + (isBlack ? "55" : "33")
                  : isBlack
                    ? "#1a1a2a"
                    : "#e8e8f0",
              border: `1px solid ${isScaleNote ? modeColor + "44" : "#00000011"}`,
              position: "relative",
              flexShrink: 0,
            }}
          >
            {isChordNote && (
              <div
                style={{
                  position: "absolute",
                  bottom: 3,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: isBlack ? "#fff" : "#333",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ChordPill({ chord, onRemove }) {
  const color = QUALITY_COLORS[chord.quality] || "#888";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: color + "18",
        border: `1px solid ${color}44`,
        borderRadius: 4,
        padding: "3px 7px",
        fontSize: 10,
        fontFamily: "'DM Mono',monospace",
        flexShrink: 0,
        cursor: "default",
      }}
    >
      <span style={{ color }}>{chord.roman || chord.name}</span>
      <span style={{ color: color + "55", fontSize: 8 }}>{chord.quality}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          style={{
            background: "none",
            border: "none",
            color: color + "55",
            cursor: "pointer",
            fontSize: 12,
            lineHeight: 1,
            padding: "0 0 0 2px",
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

export function Badge({ label, color = "#888" }) {
  return (
    <span
      style={{
        fontSize: 8,
        fontFamily: "'DM Mono',monospace",
        color,
        background: color + "18",
        border: `1px solid ${color}22`,
        borderRadius: 3,
        padding: "0 5px 1px",
      }}
    >
      {label}
    </span>
  );
}

function SectionMenu({ section }) {
  const { focusSection, duplicateSection, deleteSection } = useStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" style={{ height: 24, padding: "0 8px", fontSize: 11 }}>
          •••
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Section Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => focusSection(section.id)}>Focus Section</DropdownMenuItem>
        <DropdownMenuItem onClick={() => duplicateSection(section.id)}>Duplicate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => deleteSection(section.id)} style={{ color: "#f87171" }}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NewSectionDialog() {
  const { addSection } = useStore();
  const [type, setType] = useState("Verse");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">+ New Section</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Section</DialogTitle>
          <DialogDescription>
            Create a song section placeholder and wire chords into it.
          </DialogDescription>
        </DialogHeader>

        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Section Type</label>
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            style={{
              background: "var(--input)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "var(--foreground)",
              padding: "8px 10px",
              fontSize: 13,
            }}
          >
            {SECTION_TYPE_OPTIONS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <DialogFooter>
          <Button onClick={() => addSection(type)}>Create Section</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LeftRail() {
  const { sections, focusedId, focusSection } = useStore();

  return (
    <div
      style={{
        width: 300,
        borderRight: "1px solid var(--border)",
        background: "var(--card)",
        display: "flex",
        flexDirection: "column",
        minWidth: 260,
      }}
    >
      <div
        style={{
          padding: 12,
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 11, letterSpacing: "0.08em", color: "var(--muted-foreground)" }}>SONG RAIL</span>
        <NewSectionDialog />
      </div>

      <div style={{ overflow: "auto", padding: 10, display: "grid", gap: 8 }}>
        {sections.length === 0 && (
          <div
            style={{
              border: "1px dashed var(--border)",
              borderRadius: 8,
              padding: 14,
              fontSize: 12,
              color: "var(--muted-foreground)",
            }}
          >
            No sections yet. Add an Intro/Verse/Chorus to start building arrangements.
          </div>
        )}

        {sections.map((section) => {
          const isFocused = section.id === focusedId;
          const color = SECTION_COLORS[section.type] || "var(--muted-foreground)";

          return (
            <div
              key={section.id}
              onClick={() => focusSection(section.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  focusSection(section.id);
                }
              }}
              style={{
                border: `1px solid ${isFocused ? color : "var(--border)"}`,
                borderRadius: 8,
                background: isFocused ? `${color}18` : "var(--background)",
                padding: 10,
                textAlign: "left",
                display: "grid",
                gap: 8,
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div style={{ display: "grid", gap: 2 }}>
                  <span style={{ fontSize: 12, color, fontWeight: 600 }}>{section.label}</span>
                  <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                    {section.bars} bars · {(section.chords || []).length} chords
                  </span>
                </div>
                <SectionMenu section={section} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Header({ onExport }) {
  const {
    sections,
    globalKey,
    globalMode,
    globalBpm,
    setGlobalKey,
    setGlobalMode,
    setGlobalBpm,
    clearSections,
  } = useStore();

  const modeColor = MODE_COLORS[globalMode] || "#888";

  return (
    <div
      style={{
        height: 44,
        background: "var(--card)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 12,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: "0.1em",
          fontFamily: "'Syne','DM Mono',monospace",
          color: "var(--foreground)",
        }}
      >
        LALO
      </span>

      <span style={{ width: 1, height: 20, background: "var(--border)" }} />

      <label style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ fontSize: 8, color: "var(--muted-foreground)", letterSpacing: "0.08em" }}>KEY</span>
        <select
          value={globalKey}
          onChange={(event) => setGlobalKey(event.target.value)}
          style={{
            background: "var(--input)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            color: "#14b8a6",
            padding: "3px 6px",
            fontSize: 11,
            fontFamily: "'DM Mono',monospace",
            cursor: "pointer",
            outline: "none",
          }}
        >
          {KEYS_12.map((key) => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ fontSize: 8, color: "var(--muted-foreground)", letterSpacing: "0.08em" }}>MODE</span>
        <select
          value={globalMode}
          onChange={(event) => setGlobalMode(event.target.value)}
          style={{
            background: "var(--input)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            color: modeColor,
            padding: "3px 6px",
            fontSize: 11,
            fontFamily: "'DM Mono',monospace",
            cursor: "pointer",
            outline: "none",
          }}
        >
          {ALL_MODES.map((mode) => (
            <option key={mode.name} value={mode.name}>{mode.name}</option>
          ))}
        </select>
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ fontSize: 8, color: "var(--muted-foreground)", letterSpacing: "0.08em" }}>BPM</span>
        <input
          type="number"
          value={globalBpm}
          onChange={(event) => setGlobalBpm(Math.max(20, Math.min(300, parseInt(event.target.value) || 120)))}
          style={{
            width: 46,
            background: "var(--input)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            color: "var(--muted-foreground)",
            padding: "3px 6px",
            fontSize: 11,
            fontFamily: "'DM Mono',monospace",
            outline: "none",
            textAlign: "center",
          }}
        />
      </label>

      <div style={{ flex: 1 }} />
      <ThemeSwitcher />

      <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{sections.length} sections</span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">Template</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Template Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onExport}>Export MIDI + JSON</DropdownMenuItem>
          <DropdownMenuItem onClick={clearSections}>Clear All Sections</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function CanvasWorkspace() {
  const { sections, focusedId, globalKey, globalMode, globalBpm, addChord, removeChord } = useStore();
  const midiRoot = keyToMidi(globalKey);
  const modeColor = MODE_COLORS[globalMode] || "#888";
  const focusedSection = sections.find((section) => section.id === focusedId) || null;

  const addDegreeChordToFocused = useCallback(
    (degree) => {
      if (!focusedSection) return;

      const quality = getDiatonicQuality(degree, globalMode);
      const generated = generateDiatonicChord({
        keyRoot: midiRoot,
        degree,
        mode: globalMode,
        voicing: { inversion: 0, drop: 0 },
      });
      const name = getChordName(generated.root, generated.quality);

      addChord(focusedSection.id, {
        degree,
        quality,
        notes: generated.notes,
        name,
        roman: degreeRoman(degree, quality),
        duration: 1,
      });
    },
    [focusedSection, globalMode, midiRoot, addChord]
  );

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--background)",
        overflow: "hidden",
        gap: 24,
        padding: 32,
      }}
    >
      <div
        style={{
          border: `1px dashed ${modeColor}44`,
          borderRadius: 12,
          padding: "48px 64px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          width: "min(900px, 95%)",
        }}
      >
        <span
          style={{
            fontSize: 11,
            letterSpacing: "0.18em",
            color: "var(--muted-foreground)",
            fontFamily: "'DM Mono',monospace",
          }}
        >
          BLANK CANVAS — BUILD HERE
        </span>

        <ScaleStrip keyRoot={midiRoot} mode={globalMode} />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <Badge label={globalKey} color="#14b8a6" />
          <Badge label={globalMode} color={modeColor} />
          <Badge label={`${globalBpm} BPM`} color="var(--muted-foreground)" />
        </div>

        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {[1, 2, 3, 4, 5, 6, 7].map((degree) => {
            const quality = getDiatonicQuality(degree, globalMode);
            const roman = degreeRoman(degree, quality);
            const color = QUALITY_COLORS[quality] || "#888";

            return (
              <button
                key={degree}
                style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 13,
                  fontWeight: 500,
                  color,
                  background: color + "12",
                  border: `1px solid ${color}44`,
                  borderRadius: 5,
                  padding: "6px 10px",
                  cursor: "pointer",
                  transition: "all 0.1s",
                  lineHeight: 1,
                }}
                onClick={() => addDegreeChordToFocused(degree)}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = color + "2a";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = color + "12";
                }}
                title={focusedSection ? `Add ${roman} to ${focusedSection.label}` : `Select a section first (${roman})`}
                disabled={!focusedSection}
              >
                {roman}
              </button>
            );
          })}
        </div>

        <div
          style={{
            width: "100%",
            borderTop: "1px solid var(--border)",
            paddingTop: 12,
            display: "grid",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 11, color: "var(--muted-foreground)", letterSpacing: "0.08em" }}>
            {focusedSection ? `FOCUSED SECTION: ${focusedSection.label}` : "FOCUSED SECTION: NONE"}
          </span>

          {focusedSection && (focusedSection.chords || []).length > 0 ? (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {focusedSection.chords.map((chord) => (
                <ChordPill
                  key={chord.id}
                  chord={chord}
                  onRemove={() => removeChord(focusedSection.id, chord.id)}
                />
              ))}
            </div>
          ) : (
            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              {focusedSection
                ? "No chords yet. Click a roman numeral to add one."
                : "Pick a section from Song Rail, then click roman numerals."}
            </span>
          )}
        </div>

        <span
          style={{
            fontSize: 8,
            color: "var(--muted-foreground)",
            fontFamily: "'DM Mono',monospace",
            letterSpacing: "0.1em",
            marginTop: 4,
          }}
        >
          TECH: React 18 · Vite · Tailwind v4 · CSS vars · DM Mono · Syne
        </span>
      </div>
    </div>
  );
}

function RightInspector() {
  const { sections, focusedId, globalKey, globalMode, globalBpm, addChord } = useStore();
  const [toolDrawerOpen, setToolDrawerOpen] = useState(false);
  const [activeToolId, setActiveToolId] = useState(toolRegistry[0]?.id ?? null);

  const focusedSection = sections.find((section) => section.id === focusedId) || null;
  const modeMeta = ALL_MODES.find((mode) => mode.name === globalMode);
  const activeTool = getToolDefinition(activeToolId);

  const openTool = useCallback((toolId) => {
    setActiveToolId(toolId);
    setToolDrawerOpen(true);
  }, []);

  return (
    <>
      <div
        style={{
          width: 320,
          borderLeft: "1px solid var(--border)",
          background: "var(--card)",
          display: "flex",
          flexDirection: "column",
          minWidth: 280,
        }}
      >
        <div
          style={{
            padding: 12,
            borderBottom: "1px solid var(--border)",
            fontSize: 11,
            letterSpacing: "0.08em",
            color: "var(--muted-foreground)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <span>THEORY INSPECTOR</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" style={{ height: 26, fontSize: 11 }}>Tools</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Open Tool Panel</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {toolRegistry.map((tool) => (
                <DropdownMenuItem key={tool.id} onClick={() => openTool(tool.id)}>
                  {tool.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div style={{ padding: 12, display: "grid", gap: 10 }}>
          <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 10, display: "grid", gap: 4 }}>
            <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>CURRENT MODE</span>
            <span style={{ fontSize: 14, color: MODE_COLORS[globalMode] || "var(--foreground)", fontWeight: 600 }}>
              {globalMode}
            </span>
            {modeMeta && (
              <>
                <span style={{ fontSize: 11, color: "var(--foreground)" }}>{modeMeta.emotionalQuality}</span>
                <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{modeMeta.typicalUse}</span>
              </>
            )}
          </div>

          <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 10, display: "grid", gap: 6 }}>
            <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>FOCUSED SECTION SUMMARY</span>
            {focusedSection ? (
              <>
                <span style={{ fontSize: 13, color: "var(--foreground)" }}>{focusedSection.label}</span>
                <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                  {focusedSection.bars} bars · {(focusedSection.chords || []).length} chords
                </span>
              </>
            ) : (
              <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Select a section to inspect.</span>
            )}
          </div>

          <div style={{ border: "1px dashed var(--border)", borderRadius: 8, padding: 10, display: "grid", gap: 8 }}>
            <span style={{ fontSize: 10, color: "var(--muted-foreground)", letterSpacing: "0.08em" }}>REGISTERED TOOLS</span>
            {toolRegistry.map((tool) => (
              <button
                key={tool.id}
                onClick={() => openTool(tool.id)}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  background: activeToolId === tool.id ? "var(--background)" : "transparent",
                  color: "var(--foreground)",
                  textAlign: "left",
                  padding: "7px 9px",
                  cursor: "pointer",
                  display: "grid",
                  gap: 2,
                }}
              >
                <span style={{ fontSize: 11 }}>{tool.label}</span>
                <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{tool.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <ToolDrawer
        open={toolDrawerOpen}
        onOpenChange={setToolDrawerOpen}
        title={activeTool?.label || "Tool"}
        subtitle={activeTool?.description || "Plugin panel"}
      >
        {activeTool?.render?.({
          sections,
          focusedSection,
          globalKey,
          globalMode,
          globalBpm,
          modeMeta,
          addChord,
        }) || (
          <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>No tool selected.</span>
        )}
      </ToolDrawer>
    </>
  );
}

export function AppShell() {
  const { sections, globalKey, globalMode, globalBpm } = useStore();

  const handleExport = useCallback(() => {
    downloadMidi(sections, globalBpm);
    downloadJson(sections, { globalKey, globalMode, globalBpm });
  }, [sections, globalKey, globalMode, globalBpm]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "'DM Mono',monospace",
        background: "var(--background)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        select option { background:var(--card); }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }
        input[type=number]::-webkit-inner-spin-button { opacity:.3; }
      `}</style>
      <Header onExport={handleExport} />
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <LeftRail />
        <CanvasWorkspace />
        <RightInspector />
      </div>
    </div>
  );
}

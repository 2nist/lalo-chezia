import React from "react";
import { generateDiatonicChord, getChordName, getDiatonicQuality } from "../services";
import { degreeRoman, keyToMidi } from "./constants";

function Card({ title, children }) {
  return (
    <section
      style={{
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: 10,
        display: "grid",
        gap: 8,
        background: "var(--background)",
      }}
    >
      <h4 style={{ margin: 0, fontSize: 12, color: "var(--foreground)" }}>{title}</h4>
      {children}
    </section>
  );
}

export const toolRegistry = [
  {
    id: "cadence-helper",
    label: "Cadence Helper",
    description: "Quick cadence guidance based on mode + focused section.",
    render: ({ focusedSection, modeMeta, globalMode, globalKey, addChord }) => {
      const canInsert = Boolean(focusedSection && addChord);

      const insertCadence = (degrees) => {
        if (!canInsert) return;

        const keyRoot = keyToMidi(globalKey);
        degrees.forEach((degree) => {
          const quality = getDiatonicQuality(degree, globalMode);
          const generated = generateDiatonicChord({
            keyRoot,
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
        });
      };

      const cadenceButtonStyle = {
        padding: "7px 10px",
        borderRadius: 6,
        border: "1px solid var(--border)",
        background: "var(--card)",
        color: "var(--foreground)",
        cursor: canInsert ? "pointer" : "not-allowed",
        textAlign: "left",
      };

      return (
        <div style={{ display: "grid", gap: 10 }}>
          <Card title="Context">
            <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
              Section: {focusedSection ? focusedSection.label : "None selected"}
            </span>
            <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
              Key / Mode: {globalKey} {globalMode}
            </span>
            <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
              Mode quality: {modeMeta ? modeMeta.emotionalQuality : "Unknown"}
            </span>
          </Card>

          <Card title="Insert Cadence">
            <button style={cadenceButtonStyle} onClick={() => insertCadence([5, 1])} disabled={!canInsert}>
              Authentic cadence (V → I)
            </button>
            <button style={cadenceButtonStyle} onClick={() => insertCadence([5, 6])} disabled={!canInsert}>
              Deceptive cadence (V → vi)
            </button>
            <button style={cadenceButtonStyle} onClick={() => insertCadence([4, 5, 1])} disabled={!canInsert}>
              Plagal-to-authentic (IV → V → I)
            </button>
            {!canInsert && (
              <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                Focus a section in Song Rail to enable insertion.
              </span>
            )}
          </Card>
        </div>
      );
    },
  },
  {
    id: "rhythm-lane",
    label: "Rhythm Lane",
    description: "Starter panel for groove and meter experiments.",
    render: ({ globalBpm }) => (
      <div style={{ display: "grid", gap: 10 }}>
        <Card title="Transport">
          <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Current BPM: {globalBpm}</span>
        </Card>
        <Card title="Lane Placeholder">
          <div style={{ border: "1px dashed var(--border)", borderRadius: 6, padding: 12, fontSize: 11, color: "var(--muted-foreground)" }}>
            Drop a step-sequencer or duration grid here.
          </div>
        </Card>
      </div>
    ),
  },
  {
    id: "routing-panel",
    label: "OSC/MIDI Routing",
    description: "Future output routing and device setup panel.",
    render: ({ sections }) => (
      <div style={{ display: "grid", gap: 10 }}>
        <Card title="Session Summary">
          <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Sections in song: {sections.length}</span>
        </Card>
        <Card title="Routing Placeholder">
          <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Map channels, OSC paths, and output devices here.</span>
        </Card>
      </div>
    ),
  },
];

export function getToolDefinition(id) {
  return toolRegistry.find((tool) => tool.id === id) || null;
}

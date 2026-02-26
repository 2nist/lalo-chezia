import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { TEMPLATE_STORAGE_KEY } from "./constants";

let uid = 1;
const mkId = () => `s${uid++}`;

const readPersistedTemplateState = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.version === 1 ? parsed : null;
  } catch {
    return null;
  }
};

export const mkSection = (type = "Verse", extra = {}) => ({
  id: mkId(),
  type,
  label: type,
  bars: 8,
  key: "",
  mode: "",
  bpm: "",
  chords: [],
  transition: "v_i",
  ...extra,
});

const StoreCtx = createContext(null);

export function StoreProvider({ children }) {
  const persisted = readPersistedTemplateState();
  const [sections, setSections] = useState(persisted?.sections || []);
  const [focusedId, setFocusedId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [globalKey, setGlobalKey] = useState(persisted?.globalKey || "C");
  const [globalMode, setGlobalMode] = useState(persisted?.globalMode || "Ionian");
  const [globalBpm, setGlobalBpm] = useState(persisted?.globalBpm || 120);

  const addSection = useCallback((type) => setSections((current) => [...current, mkSection(type)]), []);

  const updateSection = useCallback((id, patch) => {
    setSections((current) => current.map((section) => (section.id === id ? { ...section, ...patch } : section)));
  }, []);

  const deleteSection = useCallback((id) => {
    setSections((current) => current.filter((section) => section.id !== id));
  }, []);

  const clearSections = useCallback(() => setSections([]), []);

  const duplicateSection = useCallback((id) => {
    setSections((current) => {
      const sourceIndex = current.findIndex((section) => section.id === id);
      if (sourceIndex < 0) return current;

      const source = current[sourceIndex];
      const clone = {
        ...source,
        id: mkId(),
        label: `${source.label} Copy`,
        chords: (source.chords || []).map((chord) => ({ ...chord, id: `c${uid++}` })),
      };

      const next = [...current];
      next.splice(sourceIndex + 1, 0, clone);
      return next;
    });
  }, []);

  const reorderSections = useCallback((from, to) => {
    setSections((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  const addChord = useCallback((sectionId, chord) => {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? { ...section, chords: [...section.chords, { ...chord, id: `c${uid++}` }] }
          : section
      )
    );
  }, []);

  const removeChord = useCallback((sectionId, chordId) => {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? { ...section, chords: section.chords.filter((chord) => chord.id !== chordId) }
          : section
      )
    );
  }, []);

  const focusSection = useCallback((id) => setFocusedId(id), []);
  const toggleExpand = useCallback((id) => setExpandedId((prev) => (prev === id ? null : id)), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      TEMPLATE_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        sections,
        globalKey,
        globalMode,
        globalBpm,
      })
    );
  }, [sections, globalKey, globalMode, globalBpm]);

  return (
    <StoreCtx.Provider
      value={{
        sections,
        focusedId,
        expandedId,
        globalKey,
        globalMode,
        globalBpm,
        setGlobalKey,
        setGlobalMode,
        setGlobalBpm,
        addSection,
        updateSection,
        deleteSection,
        duplicateSection,
        clearSections,
        reorderSections,
        addChord,
        removeChord,
        focusSection,
        toggleExpand,
      }}
    >
      {children}
    </StoreCtx.Provider>
  );
}

export const useStore = () => useContext(StoreCtx);

/**
 * Mode ID
 * Different modes for arrangement visualization
 */
export type ModeId = "harmony" | "drum" | "other";

/**
 * Arrangement Block
 * Represents a section of the arrangement timeline
 */
export interface ArrangementBlock {
  id: string;
  sourceId: string;
  mode: ModeId;
  startBeat: number;
  lengthBeats: number;
  label: string;
  repeats: number;
}

/**
 * Timeline Event
 * Represents a musical event in the timeline
 */
export interface TimelineEvent {
  id: string;
  beat: number;
  duration: number;
  notes: number[];
  velocity: number;
  metadata?: {
    chordIndex?: number;
    sectionIndex?: number;
    blockId?: string;
  };
}

/**
 * Arrangement Timeline
 * Complete timeline of the song arrangement
 */
export interface ArrangementTimeline {
  blocks: ArrangementBlock[];
  events: TimelineEvent[];
  totalBeats: number;
  tempo: number;
  timeSignature: {
    beats: number;
    noteValue: number;
  };
}

/**
 * Arrangement View Options
 * Options for how to display the arrangement
 */
export interface ArrangementViewOptions {
  showGrid: boolean;
  showBeats: boolean;
  showSections: boolean;
  showChords: boolean;
  zoomLevel: number;
  scrollPosition: number;
}

/**
 * Arrangement Export Format
 * Format for exporting arrangements
 */
export type ArrangementExportFormat = "midi" | "json" | "csv" | "xml";

/**
 * Arrangement Export Options
 * Options for exporting arrangements
 */
export interface ArrangementExportOptions {
  format: ArrangementExportFormat;
  includeMetadata: boolean;
  includeChords: boolean;
  includeDrums: boolean;
  tempo: number;
  timeSignature: {
    beats: number;
    noteValue: number;
  };
}
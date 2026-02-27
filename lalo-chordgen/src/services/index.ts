/**
 * Services Index
 * Exports all services for easy importing
 */

// Music Theory
export * from "./musicTheory/MusicTheoryEngine";

// Progression Management
export * from "./progression/ProgressionManager";

// Types (re-export for convenience)
export * from "../types/chord";
export * from "../types/progression";
export * from "../types/arrangement";

// Exploration Services
export { ModeExplorer, type ModeCharacter, type ModalProgression } from "./exploration/ModeExplorer";
export { RhythmExplorer, type TimeSignature, type RhythmPattern, type GrooveTemplate } from "./exploration/RhythmExplorer";

// Cadence Services
export { 
  getCadencesByType, 
  getCadencesByStrength, 
  detectCadences, 
  applyCadence, 
  findCadence, 
  getCadenceRecommendations, 
  analyzeCadence, 
  getCadenceTypes, 
  getCadencesByStrengthWithExamples, 
  createCustomCadence, 
  getCadenceStatistics,
  type CadenceDefinition,
  type CadenceAnalysis,
  type CadenceType,
  type CadenceStrength
} from "./progression/CadenceManager";

// MIDI Services
export * from "./midi";

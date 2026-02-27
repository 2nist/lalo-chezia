"""
Groove Wanderer pattern analyzer.
Reads E-GMD MIDI from data/egmd, categorizes by drum layer,
computes complexity/density, writes JSON pattern library per ANALYSIS_REQUIREMENTS.
"""
from __future__ import annotations

from pathlib import Path
import json
import math
import yaml

# Layer keys matching output schema
LAYERS = ("kick", "snare", "hats_ride", "percussion")


def load_config(config_path: str = "config.yaml") -> dict:
    """Load analysis config from YAML. Paths in config are relative to repo root."""
    path = Path(__file__).parent / config_path
    with open(path, "r") as f:
        config = yaml.safe_load(f)
    repo_root = Path(__file__).parent.parent
    for key in ("egmd_collection", "output_library", "process_outdir"):
        if key in config.get("paths", {}):
            raw = config["paths"][key]
            config["paths"][key] = str(repo_root / raw.lstrip("./"))
    return config


def scan_midi_files(egmd_path: str) -> list[Path]:
    """Scan egmd_collection for MIDI files (including subfolders)."""
    root = Path(egmd_path)
    if not root.exists():
        return []
    return sorted(root.rglob("*.mid")) + sorted(root.rglob("*.midi"))


def parse_midi(midi_path: Path, ticks_per_beat: int) -> list[dict]:
    """
    Parse MIDI file into list of note events: {beat, velocity, note}.
    Merges all tracks, collects note_on (velocity > 0), converts ticks to beats.
    """
    try:
        import mido
    except ImportError:
        return []
    notes = []
    try:
        mid = mido.MidiFile(str(midi_path))
        tpb = mid.ticks_per_beat if mid.ticks_per_beat else ticks_per_beat
        abs_tick = 0
        for msg in mid:
            abs_tick += msg.time
            if msg.type == "note_on" and msg.velocity > 0:
                beat = abs_tick / tpb
                notes.append({"beat": round(beat, 4), "velocity": msg.velocity, "note": msg.note})
    except Exception:
        return []
    return notes


def categorize_note(note: int, drum_mapping: dict) -> str | None:
    """Return layer name for MIDI note, or None if not in mapping."""
    for layer, pitches in drum_mapping.items():
        if note in pitches:
            return layer
    return None


def _syncopation_score(notes: list[dict]) -> float:
    """Proportion of notes on off-beats. On-beat = within 0.05 of 0 or 0.5 (quarter or eighth)."""
    if not notes:
        return 0.0
    on_beat_count = 0
    for n in notes:
        beat_pos = float(n.get("beat", 0.0)) % 1.0
        if abs(beat_pos) < 0.05 or abs(beat_pos - 0.5) < 0.05:
            on_beat_count += 1
    return 1.0 - (on_beat_count / len(notes))


def _velocity_variance_score(notes: list[dict]) -> float:
    """Normalized velocity std 0-1 (std of velocities / 127)."""
    if len(notes) < 2:
        return 0.0
    try:
        vels = [int(n.get("velocity", 0)) for n in notes]
        mean = sum(vels) / len(vels)
        var = sum((v - mean) ** 2 for v in vels) / len(vels)
        std = math.sqrt(var) if var >= 0 else 0.0
        return min(1.0, std / 127.0)
    except Exception:
        return 0.0


def compute_complexity(notes: list[dict], weights: dict, beats: int = 16) -> float:
    """
    Complexity 0.0-1.0 from syncopation, velocity variance, note density.
    Weights from config: syncopation (0.4), velocity_variance (0.3), note_density (0.3).
    Used for knob mapping and CORE selection.
    """
    w_sync = float(weights.get("syncopation", 0.4))
    w_vel = float(weights.get("velocity_variance", 0.3))
    w_density = float(weights.get("note_density", 0.3))
    sync = _syncopation_score(notes)
    vel = _velocity_variance_score(notes)
    density = len(notes) / beats if beats else 0.0
    density_normalized = min(1.0, density / 4.0)  # 4 notes/beat = max
    return w_sync * sync + w_vel * vel + w_density * density_normalized


def recalculate_complexity(pattern: dict) -> float:
    """
    Calculate complexity from a pattern dict (id, pattern{notes, beats}, ...).
    Use when fixing existing libraries that had placeholder 0.5.
    """
    notes = pattern.get("pattern", {}).get("notes", [])
    beats = pattern.get("pattern", {}).get("beats", 16)
    if not notes:
        return 0.0
    # Syncopation: on-beat = within 0.05 of 0 or 0.5
    on_beat_count = 0
    for n in notes:
        beat_pos = float(n.get("beat", 0.0)) % 1.0
        if abs(beat_pos) < 0.05 or abs(beat_pos - 0.5) < 0.05:
            on_beat_count += 1
    syncopation = 1.0 - (on_beat_count / len(notes))
    # Velocity variation
    velocities = [int(n.get("velocity", 0)) for n in notes]
    if len(velocities) < 2:
        vel_std = 0.0
    else:
        mean = sum(velocities) / len(velocities)
        var = sum((v - mean) ** 2 for v in velocities) / len(velocities)
        vel_std = min(1.0, math.sqrt(max(0, var)) / 127.0)
    # Note density
    density = len(notes) / beats
    density_normalized = min(1.0, density / 4.0)
    complexity = syncopation * 0.4 + vel_std * 0.3 + density_normalized * 0.3
    return round(complexity, 2)


def compute_density(notes: list[dict], beats: int) -> float:
    """Notes per beat normalized to 0.0-1.0."""
    if beats <= 0:
        return 0.0
    n = len(notes)
    # Normalize: e.g. cap at 4 notes/beat -> 1.0
    notes_per_beat = n / beats
    return min(1.0, notes_per_beat / 4.0)


def extract_patterns_for_layer(
    midi_path: Path,
    layer: str,
    config: dict,
) -> list[dict]:
    """
    Extract patterns for one layer from one MIDI file.
    Returns list of pattern dicts (id, source_file, complexity_score, density_score, pattern, metadata).
    """
    ticks_per_beat = config["analysis"]["ticks_per_beat"]
    pattern_length_bars = config["analysis"]["pattern_length_bars"]
    drum_mapping = config["analysis"]["drum_mapping"]
    weights = config["analysis"].get("complexity_weights", {})
    min_notes = config["analysis"].get("min_notes_per_pattern", 4)

    raw_notes = parse_midi(midi_path, ticks_per_beat)
    layer_notes = [n for n in raw_notes if categorize_note(n["note"], drum_mapping) == layer]
    if len(layer_notes) < min_notes:
        return []

    beats = pattern_length_bars * 4  # 4 beats per bar
    complexity = compute_complexity(layer_notes, weights, beats=beats)
    density = compute_density(layer_notes, beats)

    pattern = {
        "beats": beats,
        "notes": [
            {"beat": n["beat"], "velocity": n["velocity"], "note": n["note"]}
            for n in layer_notes[:64]  # cap for placeholder
        ],
    }
    entry = {
        "id": f"{layer}_{midi_path.stem}",
        "source_file": midi_path.name,
        "complexity_score": round(complexity, 4),
        "density_score": round(density, 4),
        "pattern": pattern,
        "metadata": {
            "original_tempo": 120,
            "time_signature": "4/4",
            "bar_count": pattern_length_bars,
        },
    }
    return [entry]


def build_library(config: dict) -> dict:
    """
    Build full pattern library: { kick: [...], snare: [...], hats_ride: [...], percussion: [...] }.
    """
    egmd_path = Path(config["paths"]["egmd_collection"])
    midi_files = scan_midi_files(str(egmd_path))
    total = len(midi_files)
    print(f"Processing {total} MIDI files...", flush=True)

    library = {layer: [] for layer in LAYERS}
    for i, midi_path in enumerate(midi_files):
        for layer in LAYERS:
            patterns = extract_patterns_for_layer(midi_path, layer, config)
            library[layer].extend(patterns)
        if (i + 1) % 50 == 0 or (i + 1) == total:
            print(f"Processed {i + 1}/{total} files...", flush=True)

    return library


def write_library(library: dict, output_path: str, pretty: bool = True) -> None:
    """Write pattern library JSON to output_path."""
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        json.dump(library, f, indent=2 if pretty else None)


def main() -> None:
    config = load_config()
    library = build_library(config)
    out_path = config["paths"]["output_library"]
    pretty = config.get("output", {}).get("pretty_print", True)
    write_library(library, out_path, pretty=pretty)
    print(f"Wrote {len(sum(library.values(), []))} patterns to {out_path}")


if __name__ == "__main__":
    main()

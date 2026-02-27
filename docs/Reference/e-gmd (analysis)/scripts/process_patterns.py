#!/usr/bin/env python3
"""Process E-GMD pattern library: dedupe, stats, and core selection.

Usage:
    python scripts/process_patterns.py --input analysis.json --outdir outputs
    python scripts/process_patterns.py --input pattern_library.json --outdir outputs

Input format: (1) By-layer JSON from analyzer { kick: [...], snare: [...], ... };
(2) flat JSON array of pattern objects; (3) JSONL (one pattern per line).
Preserves full timing/velocity precision; removes only exact duplicates (MD5 fingerprint).
"""
import argparse
import hashlib
import json
import math
import os
from collections import defaultdict, Counter
from datetime import datetime
from decimal import Decimal


def _json_default(o):
    """Convert Decimal from ijson to float for JSON serialization."""
    if isinstance(o, Decimal):
        return float(o)
    raise TypeError(f"Object of type {o.__class__.__name__} is not JSON serializable")

try:
    import ijson
except Exception:
    ijson = None

try:
    from tqdm import tqdm
except Exception:
    tqdm = lambda x: x

# Layer note mappings
LAYERS = {
    "kick": {35, 36},
    "snare": {37, 38, 40},
    "hats_ride": {42, 44, 46, 51, 59},
    "percussion": {41, 43, 45, 47, 48, 49, 52, 55, 57},
}


def strict_fingerprint(pattern):
    """Compute strict fingerprint preserving 4-decimal beat precision.
    Notes are taken in stored order.
    """
    sig = []
    for note in pattern.get("pattern", {}).get("notes", []):
        beat = float(note.get("beat", 0.0))
        vel = int(note.get("velocity", 0))
        nn = int(note.get("note", 0))
        sig.append(f"{beat:.4f}:{vel}:{nn}")
    joined = "|".join(sig)
    return hashlib.md5(joined.encode("utf-8")).hexdigest()


def detect_layer(notes):
    """Decide which layer this pattern belongs to by majority of notes.
    Returns one of the keys in LAYERS or 'unknown'.
    Tie-breaking uses a priority order: kick, snare, hats_ride, percussion.
    """
    counts = {k: 0 for k in LAYERS}
    total = 0
    for n in notes:
        try:
            nn = int(n.get("note", -1))
        except Exception:
            nn = -1
        total += 1
        for layer, note_set in LAYERS.items():
            if nn in note_set:
                counts[layer] += 1
                break
    if total == 0:
        return "unknown"

    # Pick layer with max count
    layer, cnt = max(counts.items(), key=lambda kv: kv[1])
    if cnt == 0:
        return "unknown"

    # Priority order for tie-breaking
    priority = ["kick", "snare", "hats_ride", "percussion"]
    max_cnt = cnt
    tied_layers = [k for k, v in counts.items() if v == max_cnt]

    if len(tied_layers) > 1:
        for p in priority:
            if p in tied_layers:
                return p

    # If majority (>50%), use it
    if cnt / total >= 0.5:
        return layer

    # Fallback: percussion
    return "percussion"


def _stream_patterns_by_layer_ijson(path):
    """Yield patterns from by-layer JSON { kick: [...], snare: [...], ... } using ijson.
    One pass per layer to avoid loading full file.
    """
    if ijson is None:
        return
    for layer in LAYERS.keys():
        try:
            with open(path, "rb") as f:
                for obj in ijson.items(f, f"{layer}.item"):
                    yield obj
        except Exception:
            continue


def _is_by_layer_json(path):
    """Peek at file: if root is object with layer key 'kick', treat as by-layer format."""
    try:
        with open(path, "rb") as f:
            # Only need 'kick'; 'snare' may be beyond first 2KB in large files
            head = f.read(2048).decode("utf-8", errors="ignore")
            return head.lstrip().startswith("{") and '"kick"' in head
    except Exception:
        return False


def stream_patterns(path):
    """Yield patterns from input file.
    Supports: (1) by-layer JSON { kick: [...], snare: [...], ... },
    (2) flat JSON array [...], (3) JSONL (one pattern object per line).
    """
    # By-layer format (analyzer output): stream each layer's array via ijson
    if _is_by_layer_json(path) and ijson is not None:
        for obj in _stream_patterns_by_layer_ijson(path):
            yield obj
        return

    # Try streaming with ijson for large JSON arrays (flat [ {...}, ... ])
    if ijson is not None:
        try:
            with open(path, "rb") as f:
                for obj in ijson.items(f, "item"):
                    yield obj
            return
        except Exception:
            pass

    # Fallback: try line-delimited JSON or small in-memory JSON
    with open(path, "r", encoding="utf-8") as f:
        first = f.read(1)
        f.seek(0)
        if first == "[":
            # small file fallback: read entire JSON
            data = json.load(f)
            for obj in data:
                yield obj
        elif first == "{":
            # small by-layer object (fit in memory)
            data = json.load(f)
            if isinstance(data, dict):
                for layer in LAYERS.keys():
                    for obj in data.get(layer, []):
                        yield obj
                return
            # else fall through to JSONL
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                yield json.loads(line)
            except Exception:
                continue


def hist_bins(values, bins=10):
    counts = [0] * bins
    for v in values:
        try:
            v = float(v)
        except Exception:
            v = 0.0
        idx = int(min(bins - 1, math.floor(v * bins)))
        if idx < 0:
            idx = 0
        counts[idx] += 1
    # return mapping like '0.0-0.1': count
    out = {}
    for i in range(bins):
        a = i / bins
        b = (i + 1) / bins
        out[f"{a:.1f}-{b:.1f}"] = counts[i]
    return out


def notes_stats(patterns):
    notes_counts = [len(p.get("pattern", {}).get("notes", [])) for p in patterns]
    if not notes_counts:
        return {"min": 0, "max": 0, "avg": 0.0, "median": 0.0}
    s = sorted(notes_counts)
    n = len(s)
    avg = sum(s) / n
    median = s[n // 2] if n % 2 == 1 else (s[n // 2 - 1] + s[n // 2]) / 2
    return {"min": s[0], "max": s[-1], "avg": round(avg, 2), "median": median}


def build_core_list(patterns, core_count=500):
    n = len(patterns)
    if n <= core_count:
        return patterns.copy()
    # sort by complexity_score
    patterns_sorted = sorted(patterns, key=lambda p: float(p.get("complexity_score", 0.0)))
    core = []
    for i in range(core_count):
        idx = int(round(i * (n - 1) / (core_count - 1)))
        core.append(patterns_sorted[idx])
    # Verify complexity bins not empty: if any bin empty, fill with nearest neighbor
    # We'll compute bin occupancy and fill gaps if needed
    return core


def validate_pattern(pat):
    issues = []
    notes = pat.get("pattern", {}).get("notes", [])
    beats = pat.get("pattern", {}).get("beats", 16)

    if len(notes) == 0:
        issues.append("zero_notes")

    for note in notes:
        nn = note.get("note")
        if not isinstance(nn, (int, float)):
            issues.append("invalid_note_type")
        elif not (0 <= int(nn) <= 127):
            issues.append("invalid_midi_number")

        beat = note.get("beat")
        try:
            b = float(beat)
            if b < 0.0:
                issues.append("negative_beat")
            if b > beats + 0.01:
                issues.append("beat_out_of_range")
        except Exception:
            issues.append("invalid_beat")

    return list(set(issues))


def human_size(path):
    """Return human-readable file size."""
    if not path:
        return "N/A"
    size = os.path.getsize(path)
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size < 1024.0:
            return f"{size:.1f} {unit}"
        size /= 1024.0
    return f"{size:.1f} TB"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Path to analysis.json (or JSONL)")
    parser.add_argument("--outdir", default="outputs", help="Output directory")
    parser.add_argument("--core_count", type=int, default=500, help="Patterns per layer in CORE")
    parser.add_argument("--skip-full", action="store_true",
                       help="Skip FULL library output (CORE and STATS only)")
    args = parser.parse_args()

    os.makedirs(args.outdir, exist_ok=True)
    quality_issues = defaultdict(list)

    total_original = defaultdict(int)
    unique_by_layer = {k: {} for k in LAYERS.keys()}
    unique_list_by_layer = {k: [] for k in LAYERS.keys()}
    dup_count = 0
    total_patterns = 0

    print(f"Reading patterns from {args.input}...")
    for pat in tqdm(stream_patterns(args.input)):
        total_patterns += 1
        notes = pat.get("pattern", {}).get("notes", [])
        layer = detect_layer(notes)
        if layer not in unique_by_layer:
            # treat unknown as percussion
            layer = "percussion"
        total_original[layer] += 1
        fp = strict_fingerprint(pat)
        if fp in unique_by_layer[layer]:
            dup_count += 1
            continue
        unique_by_layer[layer][fp] = pat
        unique_list_by_layer[layer].append(pat)
        # validation
        issues = validate_pattern(pat)
        if issues:
            quality_issues[layer].append({"id": pat.get("id"), "issues": issues})

    # Build FULL library
    full_out = {}
    stats_layers = {}
    for layer in LAYERS.keys():
        uniq = unique_list_by_layer[layer]
        full_out[layer] = uniq
        complexities = [float(p.get("complexity_score", 0.0)) for p in uniq]
        densities = [float(p.get("density_score", 0.0)) for p in uniq]
        notes_stat = notes_stats(uniq)
        stats_layers[layer] = {
            "total_original": total_original.get(layer, 0),
            "unique_count": len(uniq),
            "core_count": min(args.core_count, len(uniq)),
            "complexity_distribution": hist_bins(complexities, bins=10),
            "density_range": [min(densities) if densities else 0.0, max(densities) if densities else 0.0],
            "notes_per_pattern": notes_stat,
        }

    metadata = {
        "total_patterns": total_patterns,
        "unique_patterns": sum(len(v) for v in unique_list_by_layer.values()),
        "exact_duplicates_removed": dup_count,
        "analysis_date": datetime.utcnow().strftime("%Y-%m-%d"),
    }

    # Write FULL file (optional)
    full_path = None
    if not args.skip_full:
        full_path = os.path.join(args.outdir, "pattern_library_FULL.json")
        print(f"Writing FULL library to {full_path} (this may take a moment)...")
        with open(full_path, "w", encoding="utf-8") as f:
            json.dump({"metadata": metadata, "layers": full_out}, f, default=_json_default)
    else:
        print("Skipping FULL library output (--skip-full enabled)")

    # Build CORE
    core_out = {}
    for layer in LAYERS.keys():
        uniq = unique_list_by_layer[layer]
        core = build_core_list(uniq, core_count=args.core_count)
        core_out[layer] = core

    core_path = os.path.join(args.outdir, "pattern_library_CORE.json")
    print(f"Writing CORE library to {core_path}...")
    with open(core_path, "w", encoding="utf-8") as f:
        json.dump({"metadata": metadata, "layers": core_out}, f, default=_json_default)

    # Write STATS
    stats = {"metadata": metadata, "layers": stats_layers}
    stats_path = os.path.join(args.outdir, "pattern_library_STATS.json")
    print(f"Writing STATS to {stats_path}...")
    with open(stats_path, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2)

    # quality issues
    qi_path = os.path.join(args.outdir, "quality_issues.json")
    with open(qi_path, "w", encoding="utf-8") as f:
        json.dump(quality_issues, f, indent=2)

    # Summary output with file sizes and per-layer breakdown
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Total original patterns: {metadata['total_patterns']:,}")
    print(f"Unique patterns: {metadata['unique_patterns']:,}")
    print(f"Exact duplicates removed: {metadata['exact_duplicates_removed']:,}")
    print(f"\nFile sizes:")
    print(f"  CORE:  {human_size(core_path)}")
    if full_path:
        print(f"  FULL:  {human_size(full_path)}")
    print(f"  STATS: {human_size(stats_path)}")
    print("\nPer-layer breakdown:")
    for layer in LAYERS.keys():
        stats = stats_layers[layer]
        print(f"  {layer:12} - Original: {stats['total_original']:6,} | "
              f"Unique: {stats['unique_count']:6,} | "
              f"Core: {stats['core_count']:3}")

    if quality_issues:
        print("\nQuality Issues Found:")
        for layer, issues_list in quality_issues.items():
            if issues_list:
                issue_types = Counter()
                for item in issues_list:
                    for iss in item["issues"]:
                        issue_types[iss] += 1
                print(f"  {layer}:")
                for iss, cnt in issue_types.most_common():
                    print(f"    {iss}: {cnt} patterns")
    else:
        print("\nNo quality issues detected!")

    print("="*60)
    print("Done.")


if __name__ == "__main__":
    main()

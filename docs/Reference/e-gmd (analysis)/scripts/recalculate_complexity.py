#!/usr/bin/env python3
"""Recalculate complexity_score on an existing pattern library (fixes placeholder 0.5).

Usage:
    python scripts/recalculate_complexity.py --input pattern_library.json --output pattern_library.json
    python scripts/recalculate_complexity.py --input pattern_library.json --output pattern_library_fixed.json

Reads by-layer JSON via ijson (one layer at a time), sets complexity_score via
recalculate_complexity() for each pattern, writes by-layer JSON. Then re-run
process_patterns on the output for CORE/STATS with proper complexity distribution.
"""
import json
import os
import sys
from decimal import Decimal
from pathlib import Path


def _make_json_serializable(obj):
    """Convert Decimal and other non-JSON types in nested dicts/lists."""
    if isinstance(obj, dict):
        return {k: _make_json_serializable(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_make_json_serializable(v) for v in obj]
    if isinstance(obj, Decimal):
        return float(obj)
    return obj

try:
    import ijson
except Exception:
    ijson = None

try:
    from tqdm import tqdm
except Exception:
    tqdm = lambda x: x

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))
from analyzer import recalculate_complexity

LAYERS = ("kick", "snare", "hats_ride", "percussion")


def stream_layer(path: str, layer: str):
    """Yield pattern dicts for one layer from by-layer JSON (ijson)."""
    if ijson is None:
        raise RuntimeError("ijson required; pip install ijson")
    with open(path, "rb") as f:
        for obj in ijson.items(f, f"{layer}.item"):
            yield obj


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Recalculate complexity on existing library")
    parser.add_argument("--input", required=True, help="By-layer pattern_library.json")
    parser.add_argument("--output", required=True, help="Output by-layer JSON path")
    args = parser.parse_args()

    os.makedirs(Path(args.output).parent or Path("."), exist_ok=True)
    library = {}
    for layer in LAYERS:
        patterns = []
        for pat in tqdm(stream_layer(args.input, layer), desc=layer):
            pat["complexity_score"] = recalculate_complexity(pat)
            patterns.append(_make_json_serializable(pat))
        library[layer] = patterns
        print(f"  {layer}: {len(patterns)} patterns, complexity recalculated")

    print(f"Writing {args.output}...")
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(library, f, indent=2)
    total = sum(len(v) for v in library.values())
    print(f"Done. Wrote {total} patterns. Re-run process_patterns on this file for CORE/STATS.")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Flatten by-layer pattern library to JSONL for single-pass processing elsewhere.

Usage:
    python scripts/flatten_library.py --input pattern_library.json --output analysis.jsonl

Reads { kick: [...], snare: [...], ... } via ijson (streaming per layer) and
writes one pattern object per line. process_patterns.py can then use --input analysis.jsonl
for a single pass instead of four passes over the by-layer file.
"""
import argparse
import json
import os

try:
    import ijson
except Exception:
    ijson = None

try:
    from tqdm import tqdm
except Exception:
    tqdm = lambda x: x

LAYERS = ("kick", "snare", "hats_ride", "percussion")


def stream_by_layer(path):
    """Yield pattern dicts from by-layer JSON, one layer at a time (ijson)."""
    if ijson is None:
        raise RuntimeError("ijson is required for streaming; pip install ijson")
    for layer in LAYERS:
        try:
            with open(path, "rb") as f:
                for obj in ijson.items(f, f"{layer}.item"):
                    yield obj
        except Exception:
            continue


def main():
    parser = argparse.ArgumentParser(description="Flatten by-layer JSON to JSONL")
    parser.add_argument("--input", required=True, help="By-layer pattern_library.json")
    parser.add_argument("--output", default="analysis.jsonl", help="Output JSONL path")
    args = parser.parse_args()

    os.makedirs(os.path.dirname(os.path.abspath(args.output)) or ".", exist_ok=True)
    count = 0
    print(f"Streaming {args.input} -> {args.output}...")
    with open(args.output, "w", encoding="utf-8") as out:
        for pat in tqdm(stream_by_layer(args.input)):
            out.write(json.dumps(pat, ensure_ascii=False) + "\n")
            count += 1
    print(f"Wrote {count:,} patterns to {args.output}")


if __name__ == "__main__":
    main()

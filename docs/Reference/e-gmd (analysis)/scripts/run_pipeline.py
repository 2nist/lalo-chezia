#!/usr/bin/env python3
"""Run full pipeline: analyzer (MIDI -> pattern library) then process_patterns (dedupe, CORE, STATS).

Uses config.yaml paths: output_library (analyzer output / process_patterns input),
process_outdir (process_patterns output directory). Run from repo root.
"""
import os
import subprocess
import sys
from pathlib import Path

# Run from repo root so analyzer and config resolve correctly
REPO_ROOT = Path(__file__).resolve().parent.parent
os.chdir(REPO_ROOT)
sys.path.insert(0, str(REPO_ROOT))

from analyzer import load_config, build_library, write_library


def main():
    config = load_config()
    out_path = config["paths"]["output_library"]
    out_dir = Path(out_path).parent
    out_dir.mkdir(parents=True, exist_ok=True)

    print("Step 1: Running analyzer (MIDI -> pattern library)...")
    library = build_library(config)
    pretty = config.get("output", {}).get("pretty_print", True)
    write_library(library, out_path, pretty=pretty)
    total = len(sum(library.values(), []))
    print(f"Wrote {total} patterns to {out_path}\n")

    process_outdir = config["paths"].get("process_outdir", "outputs")
    script_dir = Path(__file__).resolve().parent
    process_script = script_dir / "process_patterns.py"
    print("Step 2: Running process_patterns (dedupe, CORE, STATS)...")
    result = subprocess.run(
        [sys.executable, str(process_script), "--input", out_path, "--outdir", process_outdir],
        cwd=REPO_ROOT,
    )
    if result.returncode != 0:
        sys.exit(result.returncode)
    print("\nPipeline done.")


if __name__ == "__main__":
    main()

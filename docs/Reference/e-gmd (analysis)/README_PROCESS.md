# Pattern library processing

Quick start for organizing the E-GMD pattern library.

1. Create a Python environment and install dependencies:

```bash
python -m venv .venv
.
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Run the processor (adjust input path if needed):

```bash
python scripts/process_patterns.py --input analysis.json --outdir outputs
# Or use the analyzer's by-layer output directly:
python scripts/process_patterns.py --input pattern_library.json --outdir outputs
```

**Input format**: The script accepts (1) by-layer JSON from the analyzer
`{ "kick": [...], "snare": [...], "hats_ride": [...], "percussion": [...] }`,
(2) a flat JSON array of pattern objects, or (3) JSONL (one pattern per line).

Outputs (in `outputs/`):
- `pattern_library_FULL.json` — all unique patterns by layer
- `pattern_library_CORE.json` — compact core (~500 patterns per layer)
- `pattern_library_STATS.json` — analysis summary
- `quality_issues.json` — any patterns flagged for data-quality problems

**Full pipeline** (analyzer then process_patterns in one command, using `config.yaml` paths):

```bash
python scripts/run_pipeline.py
```

Uses `paths.output_library` as analyzer output and process_patterns input, and `paths.process_outdir` (default `./outputs`) for FULL/CORE/STATS.

**Deep analysis** (categorization, quality, coverage before building M4L device):

```bash
python scripts/analyze_patterns.py --input outputs/pattern_library_CORE.json --output pattern_analysis_report_v2.json
```

Report includes: usability (only hard issues block: too sparse, too dense, no velocity variation, repetitive 1-bar loop, invalid timing); **warnings** (clustered/extreme clustering — fills are tagged, not failed); genre hints (rock, metal, jazz, electronic, latin, funk, general); beat vs fill (enhanced heuristics); groove feel (straight/swung/shuffled); **rhythmic structure** (apple_galloping, four_on_floor, complex); **critical holes** (mid complexity×density); and refinement suggestions.

**Refine library** from analysis (remove unusable, filter by function/length/complexity):

```bash
python scripts/refine_patterns.py --input outputs/pattern_library_CORE.json --analysis pattern_analysis_report_v2.json --output outputs/pattern_library_REFINED.json --remove-unusable --min-complexity 0.05
# Options: --only-beats, --only-16beat, --min-complexity 0.1, --exclude-unknown-genre
```

**Recommended for M4L device:** Use `outputs/pattern_library_REFINED.json`. Each pattern includes `_analysis` (genre_hint, function, feel, rhythmic_structure, grouping_pattern).

**Recalculate complexity** (fix libraries that had placeholder 0.5; required for knob mapping):

```bash
python scripts/recalculate_complexity.py --input pattern_library.json --output pattern_library_fixed.json
python scripts/process_patterns.py --input pattern_library_fixed.json --outdir outputs
```

Optional: flatten by-layer JSON to JSONL (e.g. for single-pass processing):

```bash
python scripts/flatten_library.py --input pattern_library.json --output analysis.jsonl
```

**Duplication**: E-GMD MIDI files often have multiple tracks (e.g. same groove on several tracks).
process_patterns removes only *exact* duplicates (same notes, timing, velocities). Seeing ~96% duplicates (e.g. 113k → 4.4k unique) is normal; you end up with one representative per unique pattern for CORE/knob mapping.

Notes:
- The script uses strict MD5 fingerprinting (4-decimal beat precision) and
  removes only exact duplicates.
- Large files are streamed with `ijson` (by-layer or flat array); fallback to
  JSONL or in-memory load for smaller inputs.
- Complexity is computed from syncopation (off-beat notes), velocity variance, and note density; weights in `config.yaml` (0.4, 0.3, 0.3).

**Critical holes (v1):** The report lists 13–21 empty cells per layer in the 0.2–0.7 complexity×density range, so knob mapping may have gaps. For v1 this is acceptable. For production: fill gaps synthetically, re-analyze FULL for more patterns, or map knobs more coarsely.

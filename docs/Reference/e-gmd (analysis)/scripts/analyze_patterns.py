#!/usr/bin/env python3
"""Deep pattern analysis: categorization, quality check, and refinement.

Usage:
  python scripts/analyze_patterns.py --input outputs/pattern_library_CORE.json --output analysis_report.json
"""
import argparse
import json
import math
import numpy as np
from collections import defaultdict, Counter
from pathlib import Path

# Genre detection patterns (simplified heuristics)
GENRE_SIGNATURES = {
    "rock": {
        "kick_on_1_3": True,
        "snare_on_2_4": True,
        "density_range": (0.3, 0.7),
    },
    "jazz": {
        "swing_detected": True,
        "ride_prominent": True,
        "density_range": (0.4, 0.8),
    },
    "electronic": {
        "kick_four_floor": True,
        "straight_timing": True,
        "density_range": (0.5, 1.0),
    },
    "latin": {
        "syncopation_high": True,
        "percussion_prominent": True,
        "density_range": (0.6, 1.0),
    },
    "funk": {
        "syncopation_high": True,
        "ghost_notes": True,
        "density_range": (0.5, 0.9),
    },
}


def analyze_timing_grid(notes, beats=16):
    """Analyze note positions on a fine grid (16th-note resolution)."""
    grid_size = int(beats * 4)
    grid = [0] * grid_size

    for note in notes:
        beat_pos = float(note.get("beat", 0))
        grid_idx = int(beat_pos * 4) % grid_size
        if 0 <= grid_idx < grid_size:
            grid[grid_idx] += 1

    return grid


def detect_groove_feel(notes, beats=16):
    """Detect straight, swung, or shuffled feel."""
    if not notes:
        return "unknown"

    sixteenth = 0.25
    off_grid_count = 0
    swing_patterns = 0

    for note in notes:
        beat_pos = float(note.get("beat", 0))
        nearest_16th = round(beat_pos / sixteenth) * sixteenth
        deviation = abs(beat_pos - nearest_16th)

        if deviation > 0.02:
            off_grid_count += 1
            if 0.55 < (beat_pos % 1.0) < 0.7:
                swing_patterns += 1

    total_notes = len(notes)
    if off_grid_count / total_notes > 0.3:
        if swing_patterns / max(1, off_grid_count) > 0.5:
            return "swung"
        return "shuffled"

    return "straight"


def detect_pattern_function(notes, layer, beats=16):
    """Classify as 'beat' (foundation) or 'fill' (variation/transition). Rhythm-theory aware."""
    if not notes:
        return "unknown"

    bars = max(1, int(beats / 4))
    notes_per_bar = [0] * bars
    vel_per_bar = [[] for _ in range(bars)]

    for note in notes:
        beat_val = float(note.get("beat", 0))
        bar_idx = min(bars - 1, int(beat_val / 4) % bars)
        notes_per_bar[bar_idx] += 1
        vel_per_bar[bar_idx].append(int(note.get("velocity", 0)))

    # 1. Last bar density spike (classic fill)
    if bars >= 2:
        last_bar_density = notes_per_bar[-1]
        earlier_avg = float(np.mean(notes_per_bar[:-1])) if len(notes_per_bar) > 1 else 0
        if earlier_avg > 0 and last_bar_density > earlier_avg * 1.5:
            return "fill"

    # 2. Velocity crescendo into last bar (build-up fill)
    if bars >= 2 and any(vel_per_bar):
        last_bar_vel = np.mean(vel_per_bar[-1]) if vel_per_bar[-1] else 0
        earlier_vels = [v for bar in vel_per_bar[:-1] for v in bar]
        earlier_vel = float(np.mean(earlier_vels)) if earlier_vels else 0
        if earlier_vel > 0 and last_bar_vel > earlier_vel * 1.3:
            return "fill"

    # 3. Concentrated in <50% of pattern (roll/crash accent)
    beats_vals = [float(n.get("beat", 0)) for n in notes]
    time_span = max(beats_vals) - min(beats_vals)
    if time_span < beats * 0.5 and len(notes) > 5:
        return "fill"

    # 4. Percussion layer with sparse notes = likely accent/fill
    if layer == "percussion" and len(notes) < beats * 0.5:
        return "fill"

    # 5. High proportion of off-beat notes (syncopated fill)
    off_beat_count = 0
    for note in notes:
        beat_pos = float(note.get("beat", 0)) % 1.0
        if abs(beat_pos) > 0.1 and abs(beat_pos - 0.5) > 0.1:
            off_beat_count += 1
    if len(notes) > 0 and off_beat_count / len(notes) > 0.6:
        return "fill"

    return "beat"


def detect_genre_hints(pattern, layer):
    """Detect genre based on pattern characteristics. E-GMD / rock-aware."""
    notes = pattern.get("pattern", {}).get("notes", [])
    beats = int(pattern.get("pattern", {}).get("beats", 16))

    if not notes:
        return "general"

    hints = defaultdict(int)
    grid = analyze_timing_grid(notes, beats)
    grid_len = len(grid)
    feel = detect_groove_feel(notes, beats)

    if layer == "kick":
        # Four-on-floor: hit on every quarter (indices 0,4,8,12,...)
        quarter_indices = list(range(0, min(grid_len, beats * 4), 4))
        four_floor_count = sum(1 for i in quarter_indices if grid[i] > 0)
        if four_floor_count >= beats:
            hints["electronic"] += 3
        # Rock: kick on 1 and 3. Check positions 4,12,20,... (beat 1&3) with ±2 16th window
        beats_1_3 = [i for i in [4, 12, 20, 28, 36, 44, 52, 60] if i < grid_len]
        rock_hits = 0
        for b in beats_1_3:
            for j in range(max(0, b - 2), min(grid_len, b + 3)):
                if grid[j] > 0:
                    rock_hits += 1
                    break
        if rock_hits >= 5:
            hints["rock"] += 4
        elif rock_hits >= 3:
            hints["rock"] += 2
        else:
            # Fallback: beat 0 and 2 (indices 0,8,16,...)
            beats_0_2 = [i for i in [0, 8, 16, 24, 32, 40, 48, 56] if i < grid_len]
            alt_hits = sum(1 for b in beats_0_2 if grid[b] > 0)
            if alt_hits >= 3:
                hints["rock"] += 2
        # Very permissive: 3+ quarter positions with a hit (use ±2 16th window so off-grid kicks count)
        quarter_hits = 0
        for i in quarter_indices:
            for j in range(max(0, i - 2), min(grid_len, i + 3)):
                if grid[j] > 0:
                    quarter_hits += 1
                    break
        if quarter_hits >= 3:
            hints["rock"] += 2
        # Double-kick metal/hard rock
        double_count = sum(1 for i in range(len(grid) - 1) if grid[i] > 0 and grid[i + 1] > 0)
        if double_count > 4:
            hints["metal"] += 2
        # E-GMD kick fallback: if nothing else triggered, treat as rock-like (drum grooves)
        if not hints and len(notes) >= 2:
            hints["rock"] += 1

    elif layer == "snare":
        beats_2_4 = [i for i in [4, 12, 20, 28, 36, 44, 52, 60] if i < grid_len]
        backbeat_hits = sum(1 for b in beats_2_4 if grid[b] > 0)
        if backbeat_hits >= 6:
            hints["rock"] += 5
        elif backbeat_hits >= 4:
            hints["rock"] += 2
        ghost_notes = sum(1 for n in notes if int(n.get("velocity", 0)) < 60)
        if ghost_notes > len(notes) * 0.3:
            hints["funk"] += 3
            hints["jazz"] += 1

    elif layer == "hats_ride":
        density = len(notes) / max(1, beats)
        if feel == "straight":
            if 1.5 < density < 3:
                hints["rock"] += 2
            elif density > 3:
                hints["jazz"] += 2
            else:
                hints["electronic"] += 1
        elif feel == "swung":
            hints["jazz"] += 3

    elif layer == "percussion":
        on_beat = sum(1 for n in notes if float(n.get("beat", 0)) % 1.0 < 0.1)
        off_beat = len(notes) - on_beat
        if off_beat > on_beat:
            hints["latin"] += 2

    if hints:
        return max(hints.items(), key=lambda x: x[1])[0]
    return "general"


def check_usability(pattern, layer):
    """Determine if pattern is usable or should be filtered out. Fills are tagged, not failed."""
    notes = pattern.get("pattern", {}).get("notes", [])
    beats = int(pattern.get("pattern", {}).get("beats", 16))

    issues = []
    warnings = []

    if len(notes) < 3:
        issues.append("too_sparse")

    if len(notes) > beats * 8:
        issues.append("too_dense")

    velocities = [int(n.get("velocity", 0)) for n in notes]
    if len(set(velocities)) == 1 and len(notes) > 5:
        issues.append("no_velocity_variation")

    if beats == 16 and notes:
        bar_grids = []
        for bar in range(4):
            bar_notes = [n for n in notes if bar * 4 <= float(n.get("beat", 0)) < (bar + 1) * 4]
            bar_grid = analyze_timing_grid(bar_notes, 4)
            bar_grids.append(tuple(bar_grid))
        if len(set(bar_grids)) == 1:
            issues.append("repetitive_1bar_loop")

    if notes:
        beats_vals = [float(n.get("beat", 0)) for n in notes]
        time_span = max(beats_vals) - min(beats_vals)
        # Clustered timing = WARNING only (fills/rolls are supposed to be clustered; don't fail usability)
        if time_span < beats * 0.1 and len(notes) > 5:
            warnings.append("clustered_timing")
        if time_span < beats * 0.05 and len(notes) > 10:
            warnings.append("extreme_clustering")

    for note in notes:
        b = float(note.get("beat", 0))
        if b < 0 or b > beats + 1:
            issues.append("invalid_timing")
            break

    return {"usable": len(issues) == 0, "issues": issues, "warnings": warnings}


def analyze_complexity_density_coverage(patterns):
    """Find holes in complexity x density grid."""
    grid = [[[] for _ in range(10)] for _ in range(10)]

    for p in patterns:
        complexity = float(p.get("complexity_score", 0.5))
        density = float(p.get("density_score", 0.5))
        c_bin = min(9, int(complexity * 10))
        d_bin = min(9, int(density * 10))
        grid[c_bin][d_bin].append(p.get("id", ""))

    holes = []
    for c in range(10):
        for d in range(10):
            if len(grid[c][d]) == 0:
                holes.append({
                    "complexity_range": f"{c/10:.1f}-{(c+1)/10:.1f}",
                    "density_range": f"{d/10:.1f}-{(d+1)/10:.1f}",
                })

    overcrowded = []
    for c in range(10):
        for d in range(10):
            if len(grid[c][d]) > 50:
                overcrowded.append({
                    "complexity_range": f"{c/10:.1f}-{(c+1)/10:.1f}",
                    "density_range": f"{d/10:.1f}-{(d+1)/10:.1f}",
                    "count": len(grid[c][d]),
                })

    return {"grid": grid, "holes": holes, "overcrowded": overcrowded}


def analyze_critical_holes(holes):
    """Identify holes that matter for knob mapping (mid-range complexity and density)."""
    critical = []
    for hole in holes:
        c_str = hole["complexity_range"].split("-")[0]
        d_str = hole["density_range"].split("-")[0]
        try:
            c_low = float(c_str)
            d_low = float(d_str)
        except ValueError:
            continue
        if 0.2 <= c_low <= 0.7 and 0.2 <= d_low <= 0.7:
            critical.append(hole)
    return critical


def analyze_apple_galloping_structure(notes, beats=16):
    """Detect if pattern follows 2's and 3's grouping (apple/galloping method from rhythm theory)."""
    if not notes:
        return {"structure": "unknown", "groupings": [], "pattern_description": "none"}

    # Use sorted unique beat positions quantized to 16ths for inter-onset intervals
    sixteenth = 0.25
    positions_beats = sorted(set(round(float(n.get("beat", 0)) / sixteenth) * sixteenth for n in notes))
    if len(positions_beats) < 2:
        # Single beat or no spread: tag as complex so we don't leave "unknown"
        return {"structure": "complex", "groupings": [], "pattern_description": "1" if positions_beats else "none"}

    # Gaps in 16th-note units (can be fractional)
    gaps = []
    for i in range(1, len(positions_beats)):
        g = (positions_beats[i] - positions_beats[i - 1]) / sixteenth
        # Wrap for circular patterns; cap single gap at half grid
        grid_size = int(beats * 4)
        if g > grid_size // 2:
            g = min(g, grid_size - g)
        gaps.append(g)
    if not gaps:
        return {"structure": "complex", "groupings": [], "pattern_description": "none"}

    # Round to 1–4 for grouping (1 = two adjacent 16ths, treat as "2" for 2+3 feel)
    rounded = []
    for g in gaps:
        r = max(1, min(4, int(round(g))))
        rounded.append(2 if r == 1 else r)  # 1 -> 2 for apple/galloping
    n = len(rounded)
    pct_23 = sum(1 for g in rounded if g in (2, 3)) / n if n else 0
    pct_4 = sum(1 for g in rounded if g == 4) / n if n else 0

    if pct_23 >= 0.7:
        structure = "apple_galloping"
    elif pct_4 >= 0.7:
        structure = "four_on_floor"
    elif n >= 1:
        # Single gap or mixed: classify from dominant value
        if pct_23 >= 0.5:
            structure = "apple_galloping"
        elif pct_4 >= 0.5:
            structure = "four_on_floor"
        else:
            structure = "complex"
    else:
        structure = "unknown"
    pattern_desc = "+".join(map(str, rounded[:8])) + ("..." if len(rounded) > 8 else "") if rounded else "none"
    return {"structure": structure, "groupings": rounded, "pattern_description": pattern_desc}


def analyze_layer(patterns, layer_name):
    """Comprehensive analysis of a single layer."""
    total = len(patterns)
    genres = Counter()
    functions = Counter()
    feels = Counter()
    lengths = Counter()
    usability = {"usable": 0, "unusable": 0}
    issue_types = Counter()
    warning_types = Counter()
    detailed_patterns = []

    for p in patterns:
        notes = p.get("pattern", {}).get("notes", [])
        beats = int(p.get("pattern", {}).get("beats", 16))

        genre = detect_genre_hints(p, layer_name)
        function = detect_pattern_function(notes, layer_name, beats)
        feel = detect_groove_feel(notes, beats)
        usable_check = check_usability(p, layer_name)
        apple = analyze_apple_galloping_structure(notes, beats)

        genres[genre] += 1
        functions[function] += 1
        feels[feel] += 1
        lengths[beats] += 1

        if usable_check["usable"]:
            usability["usable"] += 1
        else:
            usability["unusable"] += 1
            for issue in usable_check["issues"]:
                issue_types[issue] += 1
        for w in usable_check.get("warnings", []):
            warning_types[w] += 1

        detailed_patterns.append({
            "id": p.get("id", ""),
            "complexity": float(p.get("complexity_score", 0)),
            "density": float(p.get("density_score", 0)),
            "genre_hint": genre,
            "function": function,
            "feel": feel,
            "beats": beats,
            "note_count": len(notes),
            "usable": usable_check["usable"],
            "issues": usable_check["issues"],
            "warnings": usable_check.get("warnings", []),
            "rhythmic_structure": apple["structure"],
            "grouping_pattern": apple["pattern_description"],
        })

    coverage = analyze_complexity_density_coverage(patterns)
    critical_holes = analyze_critical_holes(coverage["holes"])

    return {
        "total_patterns": total,
        "genres": dict(genres),
        "functions": dict(functions),
        "feels": dict(feels),
        "lengths": dict(lengths),
        "usability": usability,
        "issue_types": dict(issue_types),
        "warning_types": dict(warning_types),
        "coverage_holes": coverage["holes"],
        "coverage_critical_holes": critical_holes,
        "coverage_overcrowded": coverage["overcrowded"],
        "detailed_patterns": detailed_patterns,
    }


def generate_refinement_suggestions(analysis):
    """Generate actionable suggestions for library refinement."""
    suggestions = []

    for layer, data in analysis["layers"].items():
        total = data["total_patterns"]
        if total == 0:
            continue
        unusable_pct = data["usability"]["unusable"] / total * 100
        if unusable_pct > 10:
            suggestions.append({
                "layer": layer,
                "severity": "high",
                "issue": f"{unusable_pct:.1f}% unusable patterns",
                "action": f"Remove {data['usability']['unusable']} patterns with issues: {list(data['issue_types'].keys())}",
            })

        if len(data["coverage_holes"]) > 20:
            suggestions.append({
                "layer": layer,
                "severity": "medium",
                "issue": f"{len(data['coverage_holes'])} empty cells in complexity×density grid",
                "action": "Consider filling gaps by generating synthetic patterns or re-analyzing source data",
            })

        if data["coverage_overcrowded"]:
            suggestions.append({
                "layer": layer,
                "severity": "low",
                "issue": f"{len(data['coverage_overcrowded'])} overcrowded cells",
                "action": "Consider further filtering to balance distribution",
            })

        if "general" in data["genres"] and data["genres"]["general"] > total * 0.5:
            suggestions.append({
                "layer": layer,
                "severity": "low",
                "issue": f"{data['genres']['general']} patterns with general genre",
                "action": "Optional: improve genre heuristics or keep as general",
            })
        if data.get("coverage_critical_holes"):
            suggestions.append({
                "layer": layer,
                "severity": "medium",
                "issue": f"{len(data['coverage_critical_holes'])} critical holes (mid complexity×density)",
                "action": "Consider filling for knob mapping coverage",
            })

    return suggestions


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Path to pattern library JSON")
    parser.add_argument("--output", default="pattern_analysis_report.json", help="Output report path")
    parser.add_argument("--layer", help="Analyze specific layer only (kick, snare, hats_ride, percussion)")
    args = parser.parse_args()

    print(f"Loading pattern library from {args.input}...")
    with open(args.input, "r", encoding="utf-8") as f:
        library = json.load(f)

    layers_data = library.get("layers", library)
    analysis = {"metadata": library.get("metadata", {}), "layers": {}}

    layers_to_analyze = [args.layer] if args.layer else list(layers_data.keys())

    for layer in layers_to_analyze:
        if layer not in layers_data:
            print(f"Warning: Layer '{layer}' not found in library")
            continue
        print(f"\nAnalyzing {layer}...")
        patterns = layers_data[layer]
        analysis["layers"][layer] = analyze_layer(patterns, layer)

    analysis["refinement_suggestions"] = generate_refinement_suggestions(analysis)

    print(f"\nSaving analysis report to {args.output}...")
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(analysis, f, indent=2)

    print("\n" + "=" * 60)
    print("ANALYSIS SUMMARY")
    print("=" * 60)

    for layer, data in analysis["layers"].items():
        total = data["total_patterns"]
        if total == 0:
            print(f"\n{layer.upper()}: (no patterns)")
            continue
        pct_u = data["usability"]["usable"] / total * 100
        pct_bad = data["usability"]["unusable"] / total * 100
        print(f"\n{layer.upper()}:")
        print(f"  Total patterns: {total}")
        print(f"  Usable: {data['usability']['usable']} ({pct_u:.1f}%)")
        print(f"  Unusable: {data['usability']['unusable']} ({pct_bad:.1f}%)")
        if data["issue_types"]:
            top = sorted(data["issue_types"].items(), key=lambda x: x[1], reverse=True)[:3]
            print(f"  Common issues: {dict(top)}")
        print(f"  Genres detected: {dict(sorted(data['genres'].items(), key=lambda x: x[1], reverse=True)[:3])}")
        print(f"  Functions: {data['functions']}")
        print(f"  Feels: {data['feels']}")
        print(f"  Lengths (beats): {data['lengths']}")
        print(f"  Coverage holes: {len(data['coverage_holes'])} (critical: {len(data.get('coverage_critical_holes', []))})")
        print(f"  Overcrowded cells: {len(data['coverage_overcrowded'])}")
        if data.get("warning_types"):
            print(f"  Warnings (non-fatal): {dict(sorted(data['warning_types'].items(), key=lambda x: x[1], reverse=True)[:3])}")

    print(f"\n{len(analysis['refinement_suggestions'])} refinement suggestions generated")
    print("=" * 60)
    print(f"\nFull report saved to: {args.output}")


if __name__ == "__main__":
    main()

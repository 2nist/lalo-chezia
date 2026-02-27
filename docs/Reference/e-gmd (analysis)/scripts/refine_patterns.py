#!/usr/bin/env python3
"""Filter and refine pattern library based on analysis report.

Usage:
  python scripts/refine_patterns.py \\
    --input outputs/pattern_library_CORE.json \\
    --analysis pattern_analysis_report.json \\
    --output outputs/pattern_library_REFINED.json
"""
import argparse
import json


def should_keep_pattern(pattern_analysis, filters):
    """Determine if pattern should be kept based on filters."""
    if not pattern_analysis["usable"]:
        return False

    if filters.get("min_complexity") is not None and pattern_analysis["complexity"] < filters["min_complexity"]:
        return False

    if filters.get("max_complexity") is not None and pattern_analysis["complexity"] > filters["max_complexity"]:
        return False

    if filters.get("exclude_genres") and pattern_analysis["genre_hint"] in filters["exclude_genres"]:
        return False

    if filters.get("only_functions") and pattern_analysis["function"] not in filters["only_functions"]:
        return False

    if filters.get("only_lengths") and pattern_analysis["beats"] not in filters["only_lengths"]:
        return False

    return True


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Original pattern library")
    parser.add_argument("--analysis", required=True, help="Analysis report JSON")
    parser.add_argument("--output", required=True, help="Refined output library")
    parser.add_argument("--remove-unusable", action="store_true", help="Remove unusable patterns")
    parser.add_argument("--only-beats", action="store_true", help="Keep only 'beat' patterns (remove fills)")
    parser.add_argument("--only-16beat", action="store_true", help="Keep only 16-beat (4-bar) patterns")
    parser.add_argument("--min-complexity", type=float, help="Minimum complexity score")
    parser.add_argument("--exclude-unknown-genre", action="store_true", help="Remove patterns with unknown genre")
    args = parser.parse_args()

    with open(args.input, "r", encoding="utf-8") as f:
        library = json.load(f)

    with open(args.analysis, "r", encoding="utf-8") as f:
        analysis = json.load(f)

    filters = {}
    if args.min_complexity is not None:
        filters["min_complexity"] = args.min_complexity
    if args.only_beats:
        filters["only_functions"] = ["beat"]
    if args.only_16beat:
        filters["only_lengths"] = [16]
    if args.exclude_unknown_genre:
        filters["exclude_genres"] = ["unknown", "general"]

    pattern_analysis_lookup = {}
    for layer, layer_data in analysis.get("layers", {}).items():
        for p in layer_data.get("detailed_patterns", []):
            pattern_analysis_lookup[p["id"]] = p

    refined = {
        "metadata": dict(library.get("metadata", {})),
        "layers": {},
    }
    stats = {"removed": 0, "kept": 0}

    layers_data = library.get("layers", library)
    for layer, patterns in layers_data.items():
        refined["layers"][layer] = []

        for p in patterns:
            p_id = p.get("id", "")
            if p_id not in pattern_analysis_lookup:
                continue

            p_analysis = pattern_analysis_lookup[p_id]

            if args.remove_unusable and not p_analysis["usable"]:
                stats["removed"] += 1
                continue

            if should_keep_pattern(p_analysis, filters):
                p_out = dict(p)
                p_out["_analysis"] = {
                    "genre_hint": p_analysis["genre_hint"],
                    "function": p_analysis["function"],
                    "feel": p_analysis["feel"],
                    "rhythmic_structure": p_analysis.get("rhythmic_structure", "unknown"),
                    "grouping_pattern": p_analysis.get("grouping_pattern", ""),
                }
                refined["layers"][layer].append(p_out)
                stats["kept"] += 1
            else:
                stats["removed"] += 1

    refined["metadata"]["refined"] = True
    refined["metadata"]["filters_applied"] = filters
    refined["metadata"]["patterns_removed"] = stats["removed"]
    refined["metadata"]["patterns_kept"] = stats["kept"]

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(refined, f, indent=2)

    print(f"\nRefinement complete:")
    print(f"  Kept: {stats['kept']}")
    print(f"  Removed: {stats['removed']}")
    print(f"  Output: {args.output}")


if __name__ == "__main__":
    main()

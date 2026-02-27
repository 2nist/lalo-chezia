import json
import hashlib
from collections import defaultdict

def strict_fingerprint(pattern):
    """Only match EXACT duplicates - same notes, same timing, same velocities"""
    sig = []
    for note in pattern['pattern']['notes']:
        # Keep full precision for fingerprinting
        sig.append(f"{note['beat']:.4f}:{note['velocity']}:{note['note']}")
    return hashlib.md5('|'.join(sig).encode()).hexdigest()

def similarity_score(p1, p2):
    """Calculate how similar two patterns are (0-1)"""
    notes1 = set((round(n['beat'], 2), n['note']) for n in p1['pattern']['notes'])
    notes2 = set((round(n['beat'], 2), n['note']) for n in p2['pattern']['notes'])
    
    if not notes1 or not notes2:
        return 0
    
    intersection = len(notes1 & notes2)
    union = len(notes1 | notes2)
    
    return intersection / union if union > 0 else 0

def analyze_and_organize(library_path):
    """Organize library without losing groove nuance"""
    
    print("Loading library...")
    with open(library_path, 'r') as f:
        full_library = json.load(f)
    
    organized = {
        'metadata': {
            'total_patterns': 0,
            'unique_patterns': 0,
            'exact_duplicates_removed': 0
        },
        'layers': {}
    }
    
    for layer in ['kick', 'snare', 'hats_ride', 'percussion']:
        if layer not in full_library:
            continue
        
        patterns = full_library[layer]
        print(f"\n{'='*60}")
        print(f"Analyzing {layer.upper()}: {len(patterns)} patterns")
        
        # Step 1: Remove EXACT duplicates only
        fingerprint_map = {}
        unique_patterns = []
        exact_dupes = 0
        
        for p in patterns:
            fp = strict_fingerprint(p)
            if fp not in fingerprint_map:
                fingerprint_map[fp] = p
                unique_patterns.append(p)
            else:
                exact_dupes += 1
        
        print(f"  Exact duplicates removed: {exact_dupes}")
        print(f"  Unique patterns: {len(unique_patterns)}")
        
        # Step 2: Analyze complexity distribution
        complexity_bins = defaultdict(list)
        for p in unique_patterns:
            # Bin by complexity (0.0-0.1, 0.1-0.2, etc.)
            bin_idx = int(p.get('complexity_score', 0) * 10) / 10
            complexity_bins[bin_idx].append(p)
        
        print(f"  Complexity distribution:")
        for bin_val in sorted(complexity_bins.keys()):
            print(f"    {bin_val:.1f}-{bin_val+0.1:.1f}: {len(complexity_bins[bin_val])} patterns")
        
        # Step 3: Create core library (diverse subset for performance)
        # Pick patterns spread across complexity range
        core_size = min(500, len(unique_patterns))
        sorted_by_complexity = sorted(unique_patterns, key=lambda p: p.get('complexity_score', 0))
        
        step = len(sorted_by_complexity) / core_size
        core_library = [sorted_by_complexity[int(i * step)] for i in range(core_size)]
        
        print(f"  Core library size: {len(core_library)} patterns")
        
        # Store organized data
        organized['layers'][layer] = {
            'core': core_library,
            'extended': unique_patterns,
            'stats': {
                'total_original': len(patterns),
                'exact_duplicates_removed': exact_dupes,
                'unique_count': len(unique_patterns),
                'core_count': len(core_library),
                'complexity_distribution': {
                    str(k): len(v) for k, v in complexity_bins.items()
                }
            }
        }
        
        organized['metadata']['total_patterns'] += len(patterns)
        organized['metadata']['unique_patterns'] += len(unique_patterns)
        organized['metadata']['exact_duplicates_removed'] += exact_dupes
    
    return organized

def save_organized_library(organized, output_path):
    """Save in format optimized for M4L loading"""
    
    # Create two files: core (for performance) and full (for exploration)
    
    # File 1: Core library (fast loading)
    core_only = {
        'metadata': organized['metadata'],
        'layers': {
            layer: data['core']
            for layer, data in organized['layers'].items()
        }
    }
    
    core_path = output_path.replace('.json', '_CORE.json')
    with open(core_path, 'w', indent=2) as f:
        json.dump(core_only, f)
    
    import os
    core_size = os.path.getsize(core_path) / (1024 * 1024)
    print(f"\nCore library saved: {core_path} ({core_size:.1f} MB)")
    
    # File 2: Full library with stats
    full_path = output_path.replace('.json', '_FULL.json')
    with open(full_path, 'w', indent=2) as f:
        json.dump(organized, f)
    
    full_size = os.path.getsize(full_path) / (1024 * 1024)
    print(f"Full library saved: {full_path} ({full_size:.1f} MB)")
    
    # File 3: Stats only (for documentation)
    stats_only = {
        'metadata': organized['metadata'],
        'layers': {
            layer: data['stats']
            for layer, data in organized['layers'].items()
        }
    }
    
    stats_path = output_path.replace('.json', '_STATS.json')
    with open(stats_path, 'w', indent=2) as f:
        json.dump(stats_only, f, indent=2)
    
    print(f"Statistics saved: {stats_path}")

# Run analysis
organized = analyze_and_organize(r'C:\Users\CraftAuto-Sales\Downloads\pattern_library.json')
save_organized_library(organized, r'C:\Users\CraftAuto-Sales\Downloads\pattern_library_organized.json')

print("\n" + "="*60)
print("SUMMARY")
print("="*60)
print(f"Total original patterns: {organized['metadata']['total_patterns']:,}")
print(f"Unique patterns: {organized['metadata']['unique_patterns']:,}")
print(f"Exact duplicates removed: {organized['metadata']['exact_duplicates_removed']:,}")
print(f"\nYou now have:")
print(f"  - CORE library: Fast, ~500 patterns/layer for real-time use")
print(f"  - FULL library: All unique patterns preserved")
print(f"  - STATS file: Analysis summary for documentation")
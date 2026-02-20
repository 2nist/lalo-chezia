# REAPER Session Standard

Standard template for song sessions after arrangement freeze.

## Track Architecture

Recommended top-level order:

1. `00_REF` (folder): reference imports and rough bounces.
2. `10_DRUMS` (folder)
3. `20_BASS` (folder)
4. `30_HARMONY` (folder: guitars/keys/synths)
5. `40_LEADS` (folder: lead instruments)
6. `50_VOX` (folder: lead + doubles + BGV)
7. `60_FX_PRINTS` (folder: risers, impacts, transitions)
8. `70_EDIT_BUILDER` (folder: temporary edit material)
9. `80_BUSES` (folder: subgroup buses)
10. `90_MIX_PRINT` (track for print routing checks)

## Bus Layout

Minimum buses:

1. `BUS_DRUM`
2. `BUS_BASS`
3. `BUS_MUSIC`
4. `BUS_VOX`
5. `BUS_FX`
6. `BUS_PARALLEL`
7. `BUS_PREMASTER`

Routing rule:

1. All instrument/audio tracks feed subgroup buses.
2. Subgroup buses feed `BUS_PREMASTER`.
3. `BUS_PREMASTER` feeds master.

## Baseline FX Order (By Category)

Track-level default order:

1. Corrective EQ
2. Dynamics control
3. Tone/saturation
4. Creative shaping
5. Utility (gain/stereo/phase)

Bus-level default order:

1. Glue compression (if needed)
2. Broad EQ tilt
3. Saturation (light)
4. Metering

Master chain (working, non-final):

1. Metering
2. Light bus compression (optional)
3. Broad tonal EQ (optional)
4. Limiter for safety only (not final mastering target)

## Track Naming Standard

`<group>_<role>_<detail>`

Examples:

1. `drm_kick_in`
2. `drm_snare_top`
3. `vox_lead_main`
4. `gtr_rhythm_l`
5. `syn_pad_main`

## Color + Folder Convention

1. Drums: red family.
2. Bass: orange family.
3. Harmony/music: blue/teal family.
4. Vocals: green family.
5. FX/transitions: purple/grey family.
6. Buses/master prep: neutral/dark family.

## Script Hooks (Future/Optional)

Place album-specific scripts in `scripts/reaper/`:

1. `create_track_template.lua`:
   - creates standard folder/track structure.
2. `apply_color_map.lua`:
   - applies group color conventions.
3. `export_stems.lua`:
   - renders stage-specific stems to configured folder.
4. `session_qc.lua`:
   - validates naming/routing/bus presence.

## Initial Setup Checklist (Per Song)

1. Confirm BPM/time signature/sections.
2. Apply standard track architecture.
3. Confirm bus routing to `BUS_PREMASTER`.
4. Save baseline as:
   - `reaper/NN_song_slug.v01_template.rpp`
5. Continue production in:
   - `reaper/NN_song_slug.rpp`

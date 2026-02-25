# lalo-chezia

> **Working title:** Lunar Static  
> **Format:** LP — 14 songs  
> **Status:** Pre-production / Arrangement

---

## Song Status

| # | Song | BPM | Key | Arrange | Tracking | Mix | Master |
|---|------|-----|-----|:-------:|:--------:|:---:|:------:|
| 01 | Static Bloom | 120 | Am | ✅ | ⬜ | ⬜ | ⬜ |
| 02 | Skywritting | 70 | Dm | ✅ | ⬜ | ⬜ | ⬜ |
| 03 | Twin Fish | 60 | Em | ✅ | ⬜ | ⬜ | ⬜ |
| 04 | Binary Heart | 100 | Fm | ✅ | ⬜ | ⬜ | ⬜ |
| 05 | Electric Pickle | 128 | Am | ✅ | ⬜ | ⬜ | ⬜ |
| 06 | Kaleidoscope Mind | 130 | C#m | ✅ | ⬜ | ⬜ | ⬜ |
| 07 | Rise of Neon Dawn | 140 | E | ✅ | ⬜ | ⬜ | ⬜ |
| 08 | Whispers at a Void | 90 | Dm | ✅ | ⬜ | ⬜ | ⬜ |
| 09 | Oddysea | 95 | modal | ✅ | ⬜ | ⬜ | ⬜ |
| 10 | Echoes in the Static | 100 | Gm | ✅ | ⬜ | ⬜ | ⬜ |
| 11 | Foul Beast (Suite Pt.1) | 140 | G#m | ✅ | ⬜ | ⬜ | ⬜ |
| 12 | The Somnium Shift (Suite Pt.2) | 120 | C#m | ✅ | ⬜ | ⬜ | ⬜ |
| 13 | Benson and Hedges (Suite Pt.3) | 80 | D | ✅ | ⬜ | ⬜ | ⬜ |
| 14 | Politician (Cream cover) | 170 | Am | ✅ | ⬜ | ⬜ | ⬜ |

**Legend:** ✅ Done · 🔄 In Progress · ⬜ Not Started

---

## Structure

```
lalo-chezia/
├── docs/
│   ├── arrangements/        # per-song arrangement docs (markdown format)
│   ├── lyrics/             # lyric documents and analysis
│   ├── source_material/    # imported legacy notes/lyrics/docs
│   ├── session_logs/       # production session documentation
│   ├── drive/             # audio asset tracking
│   ├── DOCUMENTATION_STYLE_GUIDE.md  # documentation standards
│   └── SOP.md             # production workflow
├── midi/                  # .mid files — chords + drums per song
├── reaper/                # .rpp project files per song
├── samples/               # small original samples only
└── scripts/
    ├── generators/        # Python scripts (make_rpp.py, template builders, QC)
    └── reaper/            # album-specific JSFX / Lua only
```

> General-purpose REAPER tools live in [reaper-toolkit](https://github.com/2nist/reaper-toolkit)

---

## Audio Files

Rendered audio is **not tracked in git** — lives in Google Drive mirroring this structure.

Operational references:

- `docs/SOP.md`
- `docs/DRIVE_AUDIO_STRATEGY.md`
- `docs/PROJECT_STRATEGY.md`
- `docs/REGENERATION_POLICY.md`
- `docs/REAPER_STANDARD.md`

---

## Quick Start

```bash
git clone https://github.com/2nist/lalo-chezia.git
cd lalo-chezia
python scripts/generators/make_rpp.py                    # optional: regenerate only when arrangement spec changes
python scripts/generators/validate_catalog.py            # verify required .rpp/.mid inventory
python scripts/generators/build_v01_static_bloom_template.py  # build/apply v01 template to song 01
python scripts/generators/qc_v01_template.py             # validate v01 template naming/routing/markers
```

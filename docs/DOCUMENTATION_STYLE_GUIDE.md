# Documentation Style Guide

This guide establishes consistent formatting and structure for all documentation in the lalo-chezia project.

## File Organization

### Directory Structure
```
docs/
├── arrangements/          # Per-song arrangement documents
├── lyrics/               # Lyric documents and analysis
├── source_material/      # Legacy documents and references
├── session_logs/         # Production session documentation
├── drive/               # Audio asset tracking
└── [other documentation categories]
```

### File Naming Conventions
- **Arrangement files:** `NN_song_slug.md` (e.g., `01_static_bloom.md`)
- **Session logs:** `YYYY-MM-DD.md` (e.g., `2026-02-24.md`)
- **Documentation files:** `CATEGORY_NAME.md` (e.g., `SOP.md`, `STYLE_GUIDE.md`)
- **Use lowercase with underscores for multi-word names**
- **Always include leading zeros for song numbers (01, 02, 03, etc.)**

## Markdown Formatting Standards

### Document Headers
Every arrangement document must start with:
```markdown
# [SONG TITLE] - Arrangement

**Tempo:** [BPM]  
**Key:** [Key signature]  
**Time Signature:** [Time signature]  
**Mood/Theme:** [Brief description of the song's emotional theme and concept]
```

### Section Headers
- Use `##` for main sections (Structure, Transitions and Dynamics, Production Notes, Arrangement Philosophy)
- Use `###` for subsections (Intro, Verse 1, Chorus, etc.)
- Use `####` for sub-subsections when needed
- Always include a blank line before and after headers

### Chord Progression Formatting
- **Chord Progression:** [Chord names] (beats per chord)
- Example: `**Chord Progression:** Am - G - F - E (4 beats per chord)`
- For complex progressions: `**Chord Progression:** Cm - Fm - Bbm - Eb (4 beats per chord, adjusted for 6/8 feel)`

### List Formatting
- Use hyphens (`-`) for all lists
- Use consistent indentation (2 spaces per level)
- Always include a blank line before lists
- For nested lists, indent with 2 spaces

### Bold and Emphasis
- Use **bold** for section headers within lists
- Use *italics* for emphasis on specific terms
- Use `code formatting` for technical terms and file paths

### Code Blocks
- Use triple backticks (```) for multi-line code blocks
- Specify language for syntax highlighting when applicable
- Use single backticks (`) for inline code

## Content Standards

### Arrangement Document Structure
Every song arrangement must include these sections:

1. **Header** with tempo, key, time signature, and mood
2. **Structure** with all song sections
3. **Transitions and Dynamics** describing flow between sections
4. **Production Notes** with instrumentation, vocals, and technical details
5. **Arrangement Philosophy** with 2-3 sentences about the song's concept

### Writing Style
- Use clear, descriptive language
- Be specific about instrumentation and techniques
- Use active voice
- Avoid overly technical jargon unless necessary
- Maintain consistent tone across all documents

### Chord Notation
- Use standard chord symbols (Am, Cmaj7, F#m7b5)
- Include Roman numeral analysis in parentheses when helpful
- Be consistent with enharmonic spellings (use C# not Db unless context requires it)
- Specify chord voicings when they're important to the arrangement

### Tempo and Time Signature
- Always specify BPM for tempo
- Use standard time signature notation (4/4, 6/8, 7/8)
- Note any tempo changes or rubato sections
- Specify when time signatures change within a song

## Documentation Workflow

### Creating New Documents
1. Use the template in `docs/arrangements/TEMPLATE.md` as a starting point
2. Follow the file naming conventions
3. Ensure all required sections are included
4. Review against this style guide before finalizing

### Updating Existing Documents
1. Maintain existing formatting and structure
2. Update content to reflect current arrangements
3. Ensure changes align with the overall project vision
4. Note significant changes in session logs

### Review Process
- All documentation should be reviewed for:
  - Consistency with style guide
  - Accuracy of musical information
  - Clarity of descriptions
  - Completeness of required sections

## Cross-Reference Standards

### Internal Links
- Use relative paths for internal links
- Example: `[Static Bloom arrangement](arrangements/01_static_bloom.md)`
- Link to related documents when concepts are connected

### External References
- Include links to external resources when helpful
- Use descriptive link text
- Note when external references are critical to understanding

## Version Control Best Practices

### Commit Messages
- Use clear, descriptive commit messages
- Follow the pattern: `docs: [brief description of change]`
- Examples:
  - `docs: convert Static Bloom arrangement to markdown`
  - `docs: update session log for February 24`
  - `docs: add documentation style guide`

### File Changes
- Make one logical change per commit
- Update related files together when possible
- Use `git mv` for renaming files to preserve history

## Quality Assurance

### Before Committing Documentation
- [ ] Follows file naming conventions
- [ ] Uses correct markdown formatting
- [ ] Includes all required sections
- [ ] Has consistent chord notation
- [ ] Contains accurate musical information
- [ ] Is free of spelling and grammar errors
- [ ] Links to related documents where appropriate

### Regular Maintenance
- Review and update arrangement documents as songs evolve
- Ensure session logs are current
- Update this style guide as needed
- Archive outdated documents appropriately

## Examples

### Good Header Example
```markdown
# Electric Pickle - Arrangement

**Tempo:** 128 BPM  
**Key:** A minor  
**Time Signature:** 4/4  
**Mood/Theme:** High-energy groove-based track with driving rhythms
```

### Good Chord Progression Example
```markdown
**Chord Progression:** Am - G - F - E (4 beats per chord)
```

### Good Section Description Example
```markdown
### Chorus (16 bars)
- Shift to more upbeat tempo and brighter chord progression
- Add layered vocals and synths to create sense of euphoria
- Introduce catchy hook or riff
- **Chord Progression:** C - G - Am - F (4 beats per chord)
```

This style guide ensures all documentation maintains a professional, consistent quality that supports the creative and technical goals of the lalo-chezia project.
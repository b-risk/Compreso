# Compreso

A modern, responsive Unicode text compressor that reduces character count by replacing multi-character sequences with single Unicode characters (ligatures, fractions, symbols, and more).

**[Live Demo](https://b-risk.github.io/Compreso/)**

## Features

- **Real-time compression** — see results as you type
- **9 toggleable categories** — choose which replacements to apply:
  1. **Ligatures** — Standard Unicode ligatures. Combines common letter pairs into single characters like 'ae' → 'æ', 'ffi' → 'ﬃ'.
  2. **Compounds** — Experimental combined characters that may have minor rendering defects in some fonts. Example: 'th' → 'ᵺ'.
  3. **Fractions & Symbols** — Replaces fractions, punctuation combos, and common symbols. Example: '1/2' → '½', '!!' → '‼'.
  4. **Case Sensitivity** — When enabled, only exact case matches are compressed. When disabled, tries both cases for uppercase entries.
  5. **CJK Comp** — CJK compatibility characters that visually resemble Latin letters (e.g., 'mg' → '㎎', 'ltd' → '㋏'). Enable Case Sensitivity for strict matching.
  6. **Add Fix Chr** — [EXPERIMENTAL] Prepends an invisible zero-width character that fixes CJK character rendering in some fonts. Shows a blue indicator when active.
  7. **Emojify** — Replaces emoji shortcodes with actual Unicode emoji characters. Example: ':cat:' → '🐱', ':fire:' → '🔥'.
  8. **Words to Symbols** — Replaces common words with their symbolic equivalents. Example: 'equals' → '=', 'percent' → '%'.
  9. **Words to Numbers** — [EXPERIMENTAL] Converts written-out numbers to digits. Example: 'one' → '1', 'twenty' → '20'.
- **Progressive compression** — Set a character limit and Compreso will apply replacements until the target length is reached
- **Light/Dark theme** — toggle or auto-detect system preference
- **Copy button** — one-click copy of compressed text
- **Compression stats** — progress bar + text showing % saved
- **Responsive design** — works on mobile and desktop

## Usage

1. Open the [live demo](https://b-risk.github.io/Compreso/)
2. Type or paste text in the input area
3. Watch the compressed output update in real-time
4. Toggle categories on/off to control which replacements apply
5. Set an optional character limit to enable progressive compression
6. Click "Copy" to copy the compressed text

## How It Works

### Ligatures
Standard Unicode ligatures combine two or more letters into a single character:
- `ae` → `æ`, `AE` → `Æ`, `oe` → `œ`, `OE` → `Œ`
- `ff` → `ﬀ`, `fi` → `ﬁ`, `fl` → `ﬂ`, `ffi` → `ﬃ`, `ffl` → `ﬄ`
- `ij` → `ĳ`, `IJ` → `Ĳ`

### Compounds
Experimental combined characters that may have minor rendering defects:
- `th` → `ᵺ`, `st` → `ﬆ`, `uu` → `ﬓ`

### Fractions & Symbols
Fractions, punctuation combos, and symbols:
- `1/2` → `½`, `1/3` → `⅓`, `2/3` → `⅔`, `3/4` → `¾`
- `!!` → `‼`, `!?` → `⁉`, `?!` → `⁈`

### CJK Compatibility Characters
These are Unicode characters from the CJK Compatibility block that visually resemble Latin letters:
- `mg` → `㎎` (milligram), `kg` → `㎏` (kilogram), `km` → `㎡` (kilometer)
- `cm` → `㎝`, `mm` → `㎟`, `ltd` → `㋏` (limited company)
- `wc` → `㍿` (water closet), `ha` → `㏊` (hectare)

### Words to Symbols
Common word replacements:
- `equals` → `=`, `plus` → `+`, `minus` → `-`, `times` → `×`
- `divided by` → `÷`, `percent` → `%`, `dollar` → `$`

### Words to Numbers
Converts written-out numbers to digits:
- `one` → `1`, `two` → `2`, `twenty` → `20`
- `hundred` → `100`, `thousand` → `1000`

### Case Sensitivity
When **disabled** (default), Compreso adds both uppercase and lowercase variants for matching:
- If `ltd` is in the dictionary and Case Sensitivity is OFF, `LTD` will also match
- If `LTD` is in the dictionary and Case Sensitivity is OFF, `ltd` will also match

When **enabled**, only exact case matches are compressed.

### Add Fix Chr (Experimental)
Prepends a zero-width non-joiner character (U+200C) to the text. This can fix CJK character rendering issues in some fonts that don't properly handle CJK compatibility characters. When active, a blue indicator appears on the output box.

### Progressive Compression
When a character limit is set, Compreso applies replacements in priority order until the text fits within the limit:
1. Space compression (5 spaces → em space, etc.)
2. Ligatures
3. Fractions & Symbols
4. Compounds
5. CJK Comp
6. Emojify
7. Words to Symbols
8. Words to Numbers
9. Add Fix Chr (if any replacements were applied)

## Tech Stack

- Pure HTML5, CSS3, JavaScript (no framework, no build step)
- Noto Sans webfont for Unicode rendering
- GitHub Pages hosting

## License

MIT
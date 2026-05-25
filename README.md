# Compreso

A modern, responsive Unicode text compressor that reduces character count by replacing multi-character sequences with single Unicode characters (ligatures, fractions, symbols, and more).

**[Live Demo](https://b-risk.github.io/Compreso/)**

## Features

- **Real-time compression** — see results as you type
- **9 toggleable categories** — choose which replacements to apply:
  - Ligatures (ae → æ, ffi → ﬃ, etc.)
  - Compounds (th → ᵺ)
  - Non-alphabetic (1/2 → ½, 2/3 → ⅔)
  - Capitals (case-insensitive matching)
  - CJK Comp (か, き, く)
  - Add Fix Chr (experimental prefix)
  - Emojify (:cat2: → 🐱)
  - Wrds2Sym (equals → =)
  - Wrds2Num (one → 1, [EXPERIMENTAL])
- **Light/Dark theme** — toggle or auto-detect system preference
- **Copy button** — one-click copy of compressed text
- **Character limit** — optional input length restriction
- **Compression stats** — progress bar + text showing % saved
- **Responsive design** — works on mobile and desktop

## Usage

1. Open the [live demo](https://b-risk.github.io/Compreso/)
2. Type or paste text in the input area
3. Watch the compressed output update in real-time
4. Toggle categories on/off to control which replacements apply
5. Click "Copy" to copy the compressed text

## Tech Stack

- Pure HTML5, CSS3, JavaScript (no framework, no build step)
- Noto Sans webfont for Unicode rendering
- GitHub Pages hosting

## License

MIT
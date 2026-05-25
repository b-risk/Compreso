/**
 * Compreso Core Compression Engine
 * Pure JavaScript text compression using Unicode ligatures and symbols.
 */

// Category definitions
const categoryDefinitions = [
  { id: 'ligatures', name: 'Ligatures', description: 'Combined characters, example: ae >> æ (Recommended).', default: true },
  { id: 'compounds', name: 'Compounds', description: 'Combined characters with minor defect(s), example: th >> ᵺ (Recommended with larger text).', default: false },
  { id: 'nonalph', name: 'Non-alphabetic', description: 'Non-alphabetical combined characters. example 1. 2/3 >> ⅔ (Recommended).', default: true },
  { id: 'capitals', name: 'Capitals', description: 'Ignore capitals when replacing characters with no alternatives.', default: false },
  { id: 'cjkcomp', name: 'CJK Comp', description: 'Combined characters that may not render correctly like ligatures.', default: false },
  { id: 'addfixchr', name: 'Add Fix Chr', description: '[EXPERIMENTAL] Adds a special character at the start of the text.', default: false },
  { id: 'emojify', name: 'Emojify', description: 'Replaces formatted words with emojis, example: \':cat2:\' >> 🐱', default: true },
  { id: 'wrds2sym', name: 'Wrds2Sym', description: 'Converts words into symbols, example: \'equals\' >> =', default: true },
  { id: 'wrds2num', name: 'Wrds2Num', description: '[EXPERIMENTAL] Converts given text input into numbers.', default: false }
];

// Ligature dictionary (from WinForms source, deduplicated)
const ligatureDict = {
  'ae': 'æ', 'ao': 'ꜵ', 'AO': '\uA734', 'AE': 'Æ', 'au': 'ꜷ', 'av': 'ꜹ', 'AV': 'Ꜹ',
  'ay': 'ꜽ', 'AY': 'Ꜽ', 'aa': 'ꜳ', 'AA': 'Ꜳ', 'AJ': 'Ꜷ', 'AU': 'Ꜷ',
  'DZ': 'Ǆ', 'Dz': 'ǅ', 'dz': 'ʣ', 'hu': 'ƕ',
  'ls': 'ʪ', 'IL': 'Ỻ', 'lj': 'ǉ', 'Lj': 'ǈ', 'LJ': 'Ǉ',
  'nj': 'ǌ', 'no': '№', 'No': '№', 'Nj': 'ǋ', 'NJ': 'Ǌ',
  'oe': 'œ', 'oy': 'ѹ', 'Oy': 'Ѹ', 'OE': 'Œ', 'oo': 'ꝏ', 'OO': 'Ꝏ',
  'th': 'ᵺ', 'ff': 'ﬀ', 'ij': 'ĳ', 'fl': 'ﬂ', 'fi': 'ﬁ',
  'ft': 'ﬅ', 'fn': 'ʩ', 'ffi': 'ﬃ', 'ffl': 'ﬄ',
  'SP': '␠', 'NUL': '␀', 'DLE': '␐', 'SOH': '␁', 'DC1': '␑', 'DEL': '␡',
  'll': '𐤚', 'lll': '𐤛', 'uu': 'ﬓ', 'uo': 'ꭣ', 'un': 'տ', 'ue': 'ᵫ',
  'uh': 'ﬕ', 'IJ': 'Ĳ',   'qp': 'ȹ', 'db': 'ȸ', 'nn': 'm',
  'Hb': 'Њ'
};

// Space compression dictionary
const spaceDict = {
'     ': '\u2003',  // 5 spaces → em space (U+2003)
  '   ': ' ',    // 3 spaces → figure space (U+2007)
  '  ': ' '      // 2 spaces → en space (U+2002)
};

// Non-alphabetic dictionary (fractions + math symbols + combined punctuation)
const nonalphDict = {
  '1/2': '½', '1/3': '⅓', '2/3': '⅔', '1/4': '¼', '3/4': '¾',
  '1/5': '⅕', '2/5': '⅖', '3/5': '⅗', '4/5': '⅘',
  '1/6': '⅙', '5/6': '⅚', '1/8': '⅛', '3/8': '⅜', '5/8': '⅝', '7/8': '⅞',
  '1/7': '⅐', '1/9': '⅑', '1/10': '⅒', '0/3': '↉',
  '!!': '‼',   // double exclamation
  '!?': '⁉',   // interrobang
  '?!': '⁈'    // question exclamation
};

// Compounds dictionary
const compoundsDict = {
  'th': 'ᵺ',
  'st': 'ﬆ',
  'du': 'ԃ',
  'Hu': 'Ƕ',
  'IC': 'Ѥ',
  'TI': 'Ҵ',
  'IO': 'Ю',
  'io': 'ю',
  'IA': 'Ѩ'
};

// Capitals dictionary
// Capitals feature dynamically generates case variants of active dictionary keys
// No static mappings needed
const capitalsDict = {
};

// CJK Comp dictionary (CJK compatibility characters - uppercase keys for case-insensitive matching)
const cjkcompDict = {
  'MG': '㎎',  // milligram
  'KG': '㎏',  // kilogram
  'KM': '喽',  // kilometer
  'ML': '㎖',  // milliliter
  'CD': '㏄',  // cubic centimeter
  'LTD': '㋏', // limited (the "fix character")
  'HV': '㋦',  // hectovolt
  'PA': '㍶',  // pascal
  'AU': '㍳',  // astronomical unit
  'MM': '㎟',  // square millimeter
  'CM': '㎠',  // square centimeter
  'DM': '㎗',  // deciliter
  'KL': '㎅',  // kilobyte
  'MB': '㏔',  // megabyte
  'GB': '㏊',  // gigabyte
  'TB': '㏙',  // tablespoon
  'MS': '㎳',  // millisecond
  'NS': '㎱',  // nanosecond
  'PS': '㎰',  // picosecond
  'FS': '㎙',  // femtosecond
  'AS': '㍱',  // atmosphere
  'AM': '㉜',  // ante meridiem
  'PM': '㉟',  // post meridiem
  'WC': '㏜',  // water closet
  'DB': '㍴',  // decade
  'PR': '㍷'   // percent
};

// Add Fix Chr dictionary (experimental prefix)
const addfixchrDict = {
  '\u200C': '\u200C'
};

// Emojify dictionary (GitHub-style shortcodes)
const emojifyDict = {
  ':smile:': '😄', ':grin:': '😁', ':joy:': '😂', ':heart:': '❤️',
  ':cat:': '🐱', ':cat2:': '🐱', ':dog:': '🐶', ':fox:': '🦊',
  ':fire:': '🔥', ':100:': '💯', ':rocket:': '🚀', ':star:': '⭐',
  ':+1:': '👍', ':clap:': '👏', ':wave:': '👋', ':ok:': '👌',
  ':thinking:': '🤔', ':sunglasses:': '😎', ':party:': '🎉', ':gift:': '🎁',
  ':bell:': '🔔', ':lock:': '🔒', ':key:': '🔑', ':pin:': '📌',
  ':warning:': '⚠️', ':check:': '✅', ':x:': '❌', ':question:': '❓',
  ':exclamation:': '❗', ':arrow_right:': '➡️', ':arrow_left:': '⬅️', ':arrow_up:': '⬆️',
  ':arrow_down:': '⬇️', ':home:': '🏠', ':office:': '🏢', ':school:': '🏫',
  ':computer:': '💻', ':phone:': '📱', ':email:': '📧', ':mail:': '✉️',
  ':pencil:': '✏️', ':book:': '📖', ':page:': '📄', ':calendar:': '📅',
  ':clock:': '🕐', ':money:': '💰', ':credit_card:': '💳', ':shopping:': '🛒',
  ':coffee:': '☕', ':pizza:': '🍕', ':burger:': '🍔', ':ice_cream:': '🍨'
};

// Wrds2Sym dictionary (words → symbols)
const wrds2symDict = {
  'equals': '=', 'equals to': '=', 'plus': '+', 'minus': '-', 'dash': '-',
  'times': '×', 'divided by': '÷', 'percent': '%',
  'and': '&', 'dollar': '$', 'pound': '£',
  'number': '#', 'hash': '#', 'star': '*', 'asterisk': '*',
  'question': '?', 'exclamation mark': '!'
};

// Wrds2Num parsing function [EXPERIMENTAL]
function parseWordsToNumbers(text) {
  const ones = {
    'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
    'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9'
  };
  const teens = {
    'ten': '10', 'eleven': '11', 'twelve': '12', 'thirteen': '13', 'fourteen': '14',
    'fifteen': '15', 'sixteen': '16', 'seventeen': '17', 'eighteen': '18', 'nineteen': '19'
  };
  const tens = {
    'twenty': '20', 'thirty': '30', 'forty': '40', 'fifty': '50',
    'sixty': '60', 'seventy': '70', 'eighty': '80', 'ninety': '90'
  };
  const scales = {
    'hundred': '100', 'thousand': '1000', 'million': '1000000'
  };
  
  const allWords = { ...ones, ...teens, ...tens, ...scales };
  
  let result = text;
  for (const [word, num] of Object.entries(allWords)) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, num);
  }
  
  return result;
}

function compressText(input, enabledCategories) {
  if (!input || input.length === 0) {
    return { compressed: '', originalLength: 0, compressedLength: 0, changes: [] };
  }

  const originalLength = input.length;
  const changes = [];
  const activeDict = {};

  if (enabledCategories['ligatures']) {
    Object.assign(activeDict, ligatureDict);
  }

  if (enabledCategories['compounds']) {
    Object.assign(activeDict, compoundsDict);
  }

  if (enabledCategories['nonalph']) {
    Object.assign(activeDict, nonalphDict);
  }

  if (enabledCategories['capitals']) {
    const caseInsensitiveDict = {};
    for (const [key, value] of Object.entries(activeDict)) {
      if (key === key.toLowerCase() && !activeDict[key.toUpperCase()]) {
        caseInsensitiveDict[key.toUpperCase()] = value;
      }
    }
    Object.assign(activeDict, caseInsensitiveDict);
  }

  if (enabledCategories['cjkcomp']) {
    Object.assign(activeDict, cjkcompDict);
  }

  // Wrds2Num - apply before dictionary replacement
  let text = input;
  if (enabledCategories['wrds2num']) {
    text = parseWordsToNumbers(text);
  }

  // Wrds2Sym
  if (enabledCategories['wrds2sym']) {
    Object.assign(activeDict, wrds2symDict);
  }

  // Add Fix Chr
  if (enabledCategories['addfixchr']) {
    text = Object.values(addfixchrDict)[0] + text;
  }

  // Emojify
  if (enabledCategories['emojify']) {
    Object.assign(activeDict, emojifyDict);
  }

  const sortedEntries = Object.entries(activeDict)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [key, value] of sortedEntries) {
    if (text.includes(key)) {
      let index = text.indexOf(key);
      text = text.replaceAll(key, value);
      changes.push({ from: key, to: value, position: index });
    }
  }

  if (enabledCategories['ligatures']) {
    const spaceEntries = Object.entries(spaceDict)
      .sort((a, b) => b[0].length - a[0].length);

    for (const [key, value] of spaceEntries) {
      if (text.includes(key)) {
        let index = text.indexOf(key);
        text = text.replaceAll(key, value);
        changes.push({ from: key, to: value, position: index });
      }
    }
  }

  return {
    compressed: text,
    originalLength,
    compressedLength: text.length,
    changes
  };
}

// Export for testing
if (typeof window !== 'undefined') {
  window.compressText = compressText;
  window.categoryDefinitions = categoryDefinitions;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { compressText, categoryDefinitions };
}

document.addEventListener('DOMContentLoaded', () => {
  const inputText = document.getElementById('input-text');
  const outputText = document.getElementById('output-text');
  const compressionProgress = document.getElementById('compression-progress');
  const statsText = document.getElementById('stats-text');
  const copyBtn = document.getElementById('copy-btn');
  const themeToggle = document.getElementById('theme-toggle');
  const charLimit = document.getElementById('char-limit');
  const charLimitEnabled = document.getElementById('char-limit-enabled');
  const categoryToggles = document.querySelectorAll('.category-toggle');

  const enabledCategories = {};
  categoryDefinitions.forEach(cat => {
    enabledCategories[cat.id] = cat.default;
  });

  function getPreferredTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    if (sunIcon && moonIcon) {
      sunIcon.style.display = theme === 'dark' ? 'block' : 'none';
      moonIcon.style.display = theme === 'dark' ? 'none' : 'block';
    }
  }

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  setTheme(getPreferredTheme());

  function updateCompression() {
    const text = inputText.value;
    const limit = parseInt(charLimit.value, 10) || 0;

    let activeCategories = {};
    let appliedCategories = [];
    let result;

    if (limit === 0) {
      // Compress everything — apply all enabled categories
      for (const catId of Object.keys(enabledCategories)) {
        if (enabledCategories[catId]) {
          activeCategories[catId] = true;
        }
      }
      result = compressText(text, activeCategories);
    } else {
      // Progressive compression to stay under limit
      result = compressText(text, activeCategories); // Start uncompressed

      if (result.compressedLength > limit) {
        // Need compression — progressively add categories
        const priorityOrder = [
          'space', 'ligatures', 'nonalph', 'compounds', 'capitals', 'cjkcomp',
          'emojify', 'wrds2sym', 'wrds2num', 'addfixchr'
        ];

        for (const catId of priorityOrder) {
          if (!enabledCategories[catId]) continue;

          activeCategories[catId] = true;
          result = compressText(text, activeCategories);
          appliedCategories.push(catId);

          if (result.compressedLength <= limit) {
            break;
          }
        }
      }
    }

    // Build highlighted output
    let highlighted = '';
    const compressed = result.compressed;
    const changes = result.changes;
    const replacementValues = new Set(changes.map(c => c.to));

    for (let i = 0; i < compressed.length; i++) {
      const char = compressed[i];
      const code = char.charCodeAt(0);
      if (code > 127 && replacementValues.has(char)) {
        highlighted += '<mark>' + char + '</mark>';
      } else {
        highlighted += char;
      }
    }

    outputText.innerHTML = highlighted;

    // Update stats
    if (result.originalLength > 0) {
      const saved = result.originalLength - result.compressedLength;
      const percentSaved = (saved / result.originalLength) * 100;

      let statusText = `${result.originalLength} → ${result.compressedLength} chars | ${percentSaved.toFixed(1)}%`;

      if (limit === 0) {
        statusText += ' | Compress everything';
      } else {
        statusText += ` | Limit: ${limit}`;
        if (result.compressedLength > limit) {
          statusText += ' (exceeded)';
        }
      }

      statsText.textContent = statusText;
      compressionProgress.style.width = `${Math.max(0, 100 - percentSaved)}%`;
    } else {
      statsText.textContent = limit === 0 ? 'Compress everything' : `Limit: ${limit}`;
      compressionProgress.style.width = '100%';
    }
  }

  inputText.addEventListener('input', updateCompression);

  const copyIcon = document.getElementById('copy-icon');
  if (copyIcon) {
    copyIcon.addEventListener('click', () => {
      const text = outputText.textContent;
      if (text && navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          copyIcon.textContent = '✓';
          setTimeout(() => { copyIcon.textContent = '📋'; }, 2000);
        });
      }
    });
  }

  categoryToggles.forEach(toggle => {
    toggle.addEventListener('change', () => {
      enabledCategories[toggle.id] = toggle.checked;
      updateCompression();
    });
  });

  charLimitEnabled.addEventListener('change', updateCompression);
  charLimit.addEventListener('change', () => { if (charLimitEnabled.checked) updateCompression(); });

  updateCompression();
});


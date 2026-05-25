/**
 * Compreso Core Compression Engine
 * Pure JavaScript text compression using Unicode ligatures and symbols.
 */

// Category definitions
const categoryDefinitions = [
  { id: 'ligatures', name: 'Ligatures', description: 'Combined characters, example: ae >> æ (Recommended).', default: true },
  { id: 'compounds', name: 'Compounds', description: 'Combined characters with minor defect(s), example: th >> ᵺ (Recommended with larger text).', default: false },
  { id: 'nonalph', name: 'Non-alphabetic', description: 'Non-alphabetical combined characters. example 1. 2/3 >> ⅔ (Recommended).', default: true },
  { id: 'capitals', name: 'Case Sensitivity', description: 'When enabled, only matches exact case. When disabled, tries lowercase variants for uppercase text.', default: true },
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
  'dz': 'ʣ',
  'ls': 'ʪ', 'IL': 'Ỻ', 'lj': 'ǉ', 'Lj': 'ǈ', 'LJ': 'Ǉ',
  'nj': 'ǌ', 'Nj': 'ǋ', 'NJ': 'Ǌ',
  'oe': 'œ', 'oy': 'ѹ', 'Oy': 'Ѹ', 'OE': 'Œ', 'oo': 'ꝏ', 'OO': 'Ꝏ',
  'th': 'ᵺ', 'ff': 'ﬀ', 'ij': 'ĳ', 'fl': 'ﬂ', 'fi': 'ﬁ',
  'ft': 'ﬅ', 'fn': 'ʩ', 'ffi': 'ﬃ', 'ffl': 'ﬄ',
  'SP': '␠', 'NUL': '␀', 'DLE': '␐', 'SOH': '␁', 'DC1': '␑', 'DEL': '␡',
  'll': '𐤚', 'lll': '𐤛', 'uu': 'ﬓ', 'uo': 'ꭣ', 'un': 'տ', 'ue': 'ᵫ',
  'IJ': 'Ĳ',   'qp': 'ȹ', 'db': 'ȸ', 'nn': 'm'
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
  'io': 'ю',
  'Hu': 'Ƕ',
  'IC': 'Ѥ',
  'TI': 'Ҵ',
  'IO': 'Ю',
  'IA': 'Ѩ',
  'No': '№',
  'DZ': 'Ǆ', 'Dz': 'ǅ', 'hu': 'ƕ', 'uh': 'ﬕ', 'Hb': 'Њ'
};



// CJK Comp dictionary (CJK compatibility characters - uppercase keys for case-insensitive matching)
const cjkcompDict = {
  'mg': '㎎',  // milligram
  'kg': '㎏',  // kilogram
  'km': '㎞',  // kilometer
  'cd': '㏅',
  'cc': '㏄',  // cubic centimeter
  'dm': '㍷',   // 
  'pc': '㍶',  //
  'mm': '㎜',  // 
  'cm': '㎝',  //
  'dm': '㍷',  // 
  'mb': '㏔',  // megabyte
  'ha': '㏊',
  'ms': '㎳',  // millisecond
  'ns': '㎱',  // nanosecond
  'ps': '㎰',  // picosecond
  'fm': '㎙',  // femtosecond
  'ke': '㎘',
  'me': '㎖',  // 
  'de': '㎗',
  'Pa': '㎩',
  'WC': '㏜',  // water closet
  'AS': '',  // 
  'AM': '',  // 
  'PM': '',  // 
  'Sv': '㏜',  // water closet
  'WC': '',  // water closet
  'DB': '',
  'GB': '㎇',  // 
  'KB': '㎅',  // kilobyte
  'AU': '㍳',  // astronomical unit
  'PR': '㏚',
  'bar': '㍴',  // 
  'hPa': '㍱',  // 
  'PPM': '㏙',  //
  'LTD': '㋏' // limited
};

// Add Fix Chr (experimental prefix)
const addfixchrPrefix = '\u200C';  // Zero-width non-joiner prepended to text

// Emojify dictionary (GitHub-style shortcodes - 100+ entries)
const emojifyDict = {
  // Faces & emotions
  ':smile:': '😄', ':grin:': '😁', ':joy:': '😂', ':rofl:': '🤣', ':smile_cat:': '😸',
  ':smile:': '😊', ':slight_smile:': '🙂', ':neutral:': '😐', ':confused:': '😕',
  ':angry:': '😠', ':rage:': '😡', ':cry:': '😢', ':sob:': '😭', ':tired:': '😫',
  ':thinking:': '🤔', ':hmm:': '🤨', ':upsidedown:': '🙃', ':relieved:': '😌',
  ':sleepy:': '😪', ':sleeping:': '😴', ':zzz:': '💤', ':dizzy:': '😵',
  ':sunglasses:': '😎', ':smirk:': '😏', ':nerd:': '🤓', ':facepalm:': '🤦',
  ':pray:': '🙏', ':clap:': '👏', ':wave:': '👋', ':thumbsup:': '👍', ':thumbsdown:': '👎',
  ':ok:': '👌', ':punch:': '👊', ':fist:': '✊', ':v:': '✌️', ':metal:': '🤘',
  ':point_right:': '👉', ':point_left:': '👈', ':point_up:': '👆', ':point_down:': '👇',
  ':raised_hands:': '🙌', ':folded_hands:': '🤲',

  // Hearts & love
  ':heart:': '❤️', ':heart_decoration:': '💟', ':hearts:': '💕', ':brown_heart:': '🤎',
  ':yellow_heart:': '💛', ':green_heart:': '💚', ':blue_heart:': '💙', ':purple_heart:': '💜',
  ':pink_heart:': '💗', ':sparkling_heart:': '💖', ':heart_exclamation:': '❣️',

  // Animals
  ':cat:': '🐱', ':cat2:': '🐱', ':dog:': '🐶', ':fox:': '🦊', ':bear:': '🐻',
  ':panda:': '🐼', ':koala:': '🐨', ':lion:': '🦁', ':tiger:': '🐯', ':tiger2:': '🐅',
  ':leopard:': '🐆', ':horse:': '🐴', ':racehorse:': '🐎', ':unicorn:': '🦄',
  ':cow:': '🐮', ':pig:': '🐷', ':boar:': '🐗', ':elephant:': '🐘', ':camel:': '🐪',
  ':snake:': '🐍', ':lizard:': '🦎', ':frog:': '🐸', ':monkey:': '🐵', ':see_no_evil:': '🙈',
  ':hear_no_evil:': '🙉', ':speak_no_evil:': '🙊', ':bird:': '🐦', ':chicken:': '🐔',
  ':penguin:': '🐧', ':fish:': '🐟', ':dolphin:': '🐬', ':whale:': '🐳', ':shell:': '🐚',
  ':bug:': '🐛', ':ant:': '🐜', ':bee:': '🐝', ':beetle:': '🪲', ':snail:': '🐌',
  ':spider:': '🕷️', ':turtle:': '🐢', ':rabbit:': '🐰', ':rabbit2:': '🐇',

  // Food & drinks
  ':apple:': '🍎', ':green_apple:': '🍏', ':pear:': '🍐', ':peach:': '🍑', ':cherries:': '🍒',
  ':strawberry:': '🍓', ':melon:': '🍈', ':watermelon:': '🍉', ':grapes:': '🍇',
  ':banana:': '🍌', ':pineapple:': '🍍', ':tomato:': '🍅', ':eggplant:': '🍆',
  ':corn:': '🌽', ':hot_pepper:': '🌶️', ':cucumber:': '🥒', ':carrot:': '🥕',
  ':potato:': '🥔', ':sweet_potato:': '🍠', ':bread:': '🍞', ':croissant:': '🥐',
  ':pizza:': '🍕', ':hamburger:': '🍔', ':fries:': '🍟', ':meat_on_bone:': '🍖',
  ':poultry_leg:': '🍗', ':sushi:': '🍣', ':shrimp:': '🦐', ':rice:': '🍚',
  ':ramen:': '🍜', ':spaghetti:': '🍝', ':bread:': '🍞', ':doughnut:': '🍩',
  ':cookie:': '🍪', ':cake:': '🍰', ':pie:': '🥧', ':chocolate:': '🍫',
  ':candy:': '🍬', ':lollipop:': '🍭', ':ice_cream:': '🍨', ':dango:': '🍡',
  ':tea:': '🍵', ':coffee:': '☕', ':sake:': '🍶', ':beer:': '🍺', ':beers:': '🍻',
  ':wine_glass:': '🍷', ':cocktail:': '🍸', ':tropical_drink:': '🍹', ':champagne:': '🥂',

  // Objects
  ':fire:': '🔥', ':sparkles:': '✨', ':star:': '⭐', ':star2:': '🌟', ':dizzy:': '💫',
  ':boom:': '💥', ':collision:': '💥', ':implode:': '💣', ':bomb:': '💣',
  ':100:': '💯', ':a:': '🅰️', ':b:': '🅱️', ':ab:': '🆎', ':cl:': '🆑',
  ':ok:': '🆗', ':off:': '🔛', ':on:': '🔝', ':new:': '🆕', ':free:': '🆓',
  ':key:': '🔑', ':lock:': '🔒', ':unlock:': '🔓', ':gun:': '🔫', ':knife:': '🔪',
  ':coffee:': '☕', ':闹钟:': '⏰', ':clock:': '🕐', ':hourglass:': '⏳',
  ':watch:': '⌚', ':timer:': '⏱️', ':compass:': '🧭', ':anchor:': '⚓',
  ':satellite:': '🛰️', ':rocket:': '🚀', ':airplane:': '✈️', ':car:': '🚗',
  ':taxi:': '🚕', ':bus:': '🚌', ':trolleybus:': '🚎', ':train:': '🚃',
  ':ship:': '🚢', ':motorboat:': '🛥️', ':bike:': '🚲', ':motorcycle:': '🏍️',
  ':ambulance:': '🚑', ':fire_engine:': '🚒', ':police_car:': '🚓', ':tractor:': '🚜',

  // Symbols & misc
  ':check:': '✅', ':x:': '❌', ':negative_squared_cross_mark:': '❎',
  ':question:': '❓', ':exclamation:': '❗', ':grey_exclamation:': '❕',
  ':information_source:': 'ℹ️', ':arrow_forward:': '▶️', ':arrow_backward:': '◀️',
  ':arrow_up:': '⬆️', ':arrow_down:': '⬇️', ':arrow_right:': '➡️', ':arrow_left:': '⬅️',
  ':arrow_upper_right:': '↗️', ':arrow_upper_left:': '↖️', ':arrow_lower_right:': '↘️',
  ':arrow_lower_left:': '↙️', ':arrows_counterclockwise:': '🔄', ':arrows_clockwise:': '🔃',
  ':hash:': '#️⃣', ':keycap_star:': '*️⃣', ':zero:': '0️⃣', ':one:': '1️⃣',
  ':two:': '2️⃣', ':three:': '3️⃣', ':four:': '4️⃣', ':five:': '5️⃣',
  ':six:': '6️⃣', ':seven:': '7️⃣', ':eight:': '8️⃣', ':nine:': '9️⃣',
  ':copyright:': '©️', ':registered:': '®️', ':tm:': '™️', ':wavy_dash:': '〰️',
  ':wave:': '〰️', ':umbrella:': '☂️', ':snowflake:': '❄️', ':cloud:': '☁️',
  ':sunny:': '☀️', ':partly_sunny:': '⛅', ':cloudy:': '☁️', ':thunder_cloud_rain:': '⛈️',
  ':rain:': '🌧️', ':snow:': '🌨️', ':fog:': '🌫️', ':wind_face:': '🌬️',
  ':cyclone:': '🌀', ':foggy:': '🌁', ':rainbow:': '🌈', ':earth_americas:': '🌎',
  ':globe_with_meridians:': '🌐', ':mount_fuji:': '🗻', ':volcano:': '🌋',
  ':milky_way:': '🌌', ':space_invader:': '👾', ':video_game:': '🎮',
  ':game_die:': '🎲', ':dart:': '🎯', ':8ball:': '🎱', ':bowling:': '🎳',

  // Places
  ':house:': '🏠', ':house_with_garden:': '🏡', ':school:': '🏫', ':office:': '🏢',
  ':hospital:': '🏥', ':bank:': '🏦', ':hotel:': '🏨', ':love_hotel:': '🏩',
  ':convenience_store:': '🏪', ':school:': '🏫', ':department_store:': '🏬',
  ':wedding:': '💒', ':classical_building:': '🏛️', ':church:': '⛪',
  ':mosque:': '🕌', ':synagogue:': '🕍', ':shinto_shrine:': '⛩️',
  ':castle:': '🏰', ':rainbow:': '🌈',

  // Tech & tools
  ':computer:': '💻', ':laptop:': '💻', ':keyboard:': '⌨️', ':mouse:': '🖱️',
  ':trackball:': '🖲️', ':desktop:': '🖥️', ':printer:': '🖨️', ':phone:': '📱',
  ':telephone:': '📞', ':fax:': '📠', ':pager:': '📟', ':tv:': '📺',
  ':radio:': '📻', ':camera:': '📷', ':video_camera:': '📹', ':movie_camera:': '🎥',
  ':projector:': '📽️', ':film_frames:': '🎞️', ':telephone_receiver:': '📞',
  ':punch_card:': '🃏', ':calendar:': '📅', ':calendar_page:': '📆',
  ':spiral_calendar:': '🗓️', ':book:': '📖', ':open_book:': '📖', ':notebook:': '📓',
  ':page_facing_up:': '📄', ':newspaper:': '📰', ':bookmark:': '🔖',
  ':pencil:': '✏️', ':pen:': '🖊️', ':paintbrush:': '🖌️', ':crayon:': '🖍️',

  // Money
  ':moneybag:': '💰', ':dollar:': '💵', ':yen:': '💴', ':pound:': '💷',
  ':euro:': '💶', ':credit_card:': '💳', ':money_with_wings:': '💸',
  ':chart_increasing:': '📈', ':chart_decreasing:': '📉', ':shopping_cart:': '🛒'
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

  if (!enabledCategories['capitals']) {
    // Case sensitivity OFF - add lowercase variants for uppercase-only keys
    const lowercaseDict = {};
    for (const [key, value] of Object.entries(activeDict)) {
      if (key === key.toUpperCase() && key !== key.toLowerCase() && !activeDict[key.toLowerCase()]) {
        lowercaseDict[key.toLowerCase()] = value;
      }
    }
    Object.assign(activeDict, lowercaseDict);
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
    text = addfixchrPrefix + text;
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

function displayResult(result, limit) {
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

    if (result.originalLength > 0) {
      const saved = result.originalLength - result.compressedLength;
      const percentSaved = (saved / result.originalLength) * 100;

      let statusText = `${result.originalLength} → ${result.compressedLength} chars | ${percentSaved.toFixed(1)}%`;

      if (!limit || limit === 0) {
        statusText += ' | Compress everything';
      } else {
        statusText += ` | Limit: ${limit}`;
        if (result.compressedLength > limit) {
          statusText += ' (exceeded)';
        }
      }

      statsText.textContent = statusText;
      compressionProgress.style.width = `${Math.min(Math.max(percentSaved, 0), 100)}%`;
    } else {
      statsText.textContent = !limit || limit === 0 ? 'Compress everything' : `Limit: ${limit}`;
      compressionProgress.style.width = '100%';
    }
  }

  function updateCompression() {
    const text = inputText.value;
    const limit = parseInt(charLimit.value, 10) || 0;
    const limitEnabled = limit > 0;

    if (!limitEnabled || !text) {
      const activeCategories = {};
      for (const catId of Object.keys(enabledCategories)) {
        if (enabledCategories[catId]) activeCategories[catId] = true;
      }
      const result = compressText(text, activeCategories);
      displayResult(result, limitEnabled ? limit : null);
      return;
    }

    if (text.length <= limit) {
      displayResult({compressed: text, originalLength: text.length, compressedLength: text.length, changes: []}, limit);
      return;
    }

    const allReplacements = [];
    const categoryPriority = ['space', 'ligatures', 'nonalph', 'compounds', 'cjkcomp', 'emojify', 'wrds2sym', 'wrds2num', 'addfixchr'];

    for (const catId of categoryPriority) {
      if (!enabledCategories[catId]) continue;

      let dict = {};
      switch(catId) {
        case 'ligatures': Object.assign(dict, ligatureDict); break;
        case 'compounds': Object.assign(dict, compoundsDict); break;
        case 'nonalph': Object.assign(dict, nonalphDict); break;
        case 'cjkcomp': Object.assign(dict, cjkcompDict); break;
        case 'emojify': Object.assign(dict, emojifyDict); break;
        case 'wrds2sym': Object.assign(dict, wrds2symDict); break;
        case 'space': Object.assign(dict, spaceDict); break;
      }

      for (const [key, value] of Object.entries(dict)) {
        if (text.includes(key)) {
          allReplacements.push({key, value, category: catId, length: key.length});
        }
      }
    }

    allReplacements.sort((a, b) => b.length - a.length);

    let currentText = text;
    const applied = [];

    for (const repl of allReplacements) {
      if (currentText.length <= limit) break;
      if (!currentText.includes(repl.key)) continue;

      currentText = currentText.replaceAll(repl.key, repl.value);
      applied.push(repl);

      if (currentText.length <= limit) break;
    }

    if (enabledCategories['addfixchr'] && applied.length > 0) {
      currentText = addfixchrPrefix + currentText;
    }

    const result = {
      compressed: currentText,
      originalLength: text.length,
      compressedLength: currentText.length,
      changes: applied.map(r => ({from: r.key, to: r.value}))
    };

    displayResult(result, limit);
  }

  inputText.addEventListener('input', updateCompression);

  const copyIcon = document.getElementById('copy-icon');
  if (copyIcon) {
    copyIcon.addEventListener('click', () => {
      const text = outputText.textContent;
      if (text && navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          copyIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline point="20 6 9 17 4 12"></polyline></svg>';
          setTimeout(() => {
            copyIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
          }, 2000);
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


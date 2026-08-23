export interface SentimentColorSet {
  color: string;
  border: string;
  bg: string;
  barColor: string;
}

export interface SentimentColorTheme {
  positive: SentimentColorSet;
  mixed: SentimentColorSet;
  negative: SentimentColorSet;
}

function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return [56, 211, 159];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (n: number) => {
    const val = Math.round((n + m) * 255);
    return Math.max(0, Math.min(255, val)).toString(16).padStart(2, '0');
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export const DEFAULT_SENTIMENT_PALETTE: SentimentColorTheme = {
  positive: {
    color: '#38d39f',
    border: '#38d39f',
    bg: 'rgba(56, 211, 159, 0.15)',
    barColor: '#38d39f',
  },
  mixed: {
    color: '#f59e0b',
    border: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
    barColor: '#f59e0b',
  },
  negative: {
    color: '#ef4444',
    border: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    barColor: '#ef4444',
  },
};

/**
 * Derives harmonized positive, mixed, and negative colors from a single base accent color.
 * Defaults to Classic Gaming Palette: Emerald Green (#38d39f), Warm Amber (#f59e0b), Crimson Red (#ef4444).
 */
export function getHarmonizedSentimentPalette(baseHex?: string): SentimentColorTheme {
  if (!baseHex || !baseHex.startsWith('#') || baseHex.toLowerCase() === '#38d39f') {
    return DEFAULT_SENTIMENT_PALETTE;
  }

  const [r, g, b] = hexToRgb(baseHex);
  const [h, s, l] = rgbToHsl(r, g, b);

  const targetSat = Math.max(65, Math.min(95, s || 80));
  const targetLight = Math.max(50, Math.min(65, l || 55));

  // Positive: adheres to the selected custom base accent hue
  const posHex = hslToHex(h, targetSat, targetLight);

  // Mixed: warm amber tone (#f59e0b)
  const mixedHex = '#f59e0b';
  const [mr, mg, mb] = hexToRgb(mixedHex);

  // Negative: crimson danger tone (#ef4444)
  const negHex = '#ef4444';
  const [nr, ng, nb] = hexToRgb(negHex);

  return {
    positive: {
      color: posHex,
      border: posHex,
      bg: `rgba(${r}, ${g}, ${b}, 0.15)`,
      barColor: posHex,
    },
    mixed: {
      color: mixedHex,
      border: mixedHex,
      bg: `rgba(${mr}, ${mg}, ${mb}, 0.15)`,
      barColor: mixedHex,
    },
    negative: {
      color: negHex,
      border: negHex,
      bg: `rgba(${nr}, ${ng}, ${nb}, 0.15)`,
      barColor: negHex,
    },
  };
}

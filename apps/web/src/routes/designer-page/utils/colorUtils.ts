// ── HSV Color Conversion Helpers for Classic 2D Rectangular Picker ───────────
export function sanitizeHexInput(val: string): string {
  if (!val) return '';
  const trimmed = val.trim();
  if (trimmed === 'transparent') return 'transparent';
  if (
    trimmed.startsWith('linear-gradient') ||
    trimmed.startsWith('radial-gradient') ||
    trimmed.startsWith('rgba')
  )
    return trimmed;
  let clean = trimmed;
  if (!clean.startsWith('#')) {
    clean = '#' + clean;
  }
  const hexDigits = clean
    .slice(1)
    .replace(/[^0-9a-fA-F]/g, '')
    .slice(0, 8);
  return '#' + hexDigits;
}

export function hsvToHex(h: number, s: number, v: number, alpha = 100): string {
  s /= 100;
  v /= 100;
  const i = Math.floor((h / 60) % 6);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r = 0,
    g = 0,
    b = 0;
  switch (i) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }
  const toHex = (n: number) =>
    Math.round(n * 255)
      .toString(16)
      .padStart(2, '0');
  const baseHex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  if (alpha < 100) {
    const alphaHex = Math.round((alpha / 100) * 255)
      .toString(16)
      .padStart(2, '0');
    return `${baseHex}${alphaHex}`;
  }
  return baseHex;
}

export function hexToHsv(hex: string): { h: number; s: number; v: number; alpha: number } {
  if (!hex || hex === 'transparent') return { h: 18, s: 86, v: 95, alpha: 0 };
  let c = hex.replace('#', '');
  if (c.length === 3)
    c = c
      .split('')
      .map((x) => x + x)
      .join('');
  let alpha = 100;
  if (c.length === 8) {
    alpha = Math.round((parseInt(c.substring(6, 8), 16) / 255) * 100);
    c = c.substring(0, 6);
  }
  if (c.length !== 6) return { h: 18, s: 86, v: 95, alpha: 100 };
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
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
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100), alpha };
}

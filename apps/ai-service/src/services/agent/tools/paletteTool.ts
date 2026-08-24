export interface PaletteDefinition {
  accent: string;
  bg: string;
  text: string;
  headerBg: string;
}

export const PRESET_PALETTES: Record<string, PaletteDefinition> = {
  cyberpunk: { accent: '#00f3ff', bg: '#070a13', text: '#ffffff', headerBg: '#0e1424' },
  'neon-cyan': { accent: '#00f3ff', bg: '#08090d', text: '#eeeeee', headerBg: '#121620' },
  'dark-gothic': { accent: '#c5a059', bg: '#0a0a0d', text: '#f0e2b6', headerBg: '#14141a' },
  'egyptian-gold': { accent: '#f26b21', bg: '#0e1116', text: '#ffffff', headerBg: '#161a22' },
  'desert-dynasty': { accent: '#b85328', bg: '#f4e8d3', text: '#1c140c', headerBg: '#e6d5bd' },
  'retro-synthwave': { accent: '#ff007f', bg: '#0f051d', text: '#ffffff', headerBg: '#1a0933' },
  'deep-ocean': { accent: '#00b4d8', bg: '#03045e', text: '#caf0f8', headerBg: '#023e8a' },
  'emerald-forest': { accent: '#10b981', bg: '#061a14', text: '#ecfdf5', headerBg: '#064e3b' },
};

export function suggestColorPalette(themeStyle: string): PaletteDefinition {
  const normalized = (themeStyle || '').toLowerCase().trim();
  return (
    PRESET_PALETTES[normalized] ||
    Object.entries(PRESET_PALETTES).find(([k]) => normalized.includes(k))?.[1] ||
    PRESET_PALETTES['egyptian-gold']
  );
}

// 4 themes copied from Q Spot 4D (Light, Black, Charcoal, Teal).
// Light = default; its yellow primary is swapped for light sky blue.
const DARK_BASE = { gold: '#E8B94A', gold2: '#E8B94A', red: '#B8862B', red2: '#8F6618', live: '#FF5A5F' };
export const THEMES = {
  light:    { name: 'Light',    dark: false, sw: ['#F3F5FA', '#4AA8F0'], v: { bg: '#F3F5FA', card: '#FFFFFF', ink: '#121A2E', mute: '#55627F', line: '#D9DFEC', soft: '#EDF0F7', red: '#4AA8F0', red2: '#2B8AD8', dark: '#2479C8', dark2: '#4AA8F0', gold: '#CDEBFF', gold2: '#1F6FC0', live: '#E53935' } },
  black:    { name: 'Black',    dark: true,  sw: ['#000000', '#E8B94A'], v: { ...DARK_BASE, bg: '#000000', card: '#0E0E11', ink: '#F5F5F7', mute: '#9A9AA5', line: '#25252B', soft: '#17171B', dark: '#17171B', dark2: '#25252B' } },
  charcoal: { name: 'Charcoal', dark: true,  sw: ['#12100E', '#E8B94A'], v: { ...DARK_BASE, bg: '#12100E', card: '#1D1A16', ink: '#F6F1E8', mute: '#A89F90', line: '#332E27', soft: '#272320', dark: '#272320', dark2: '#332E27' } },
  teal:     { name: 'Teal',     dark: true,  sw: ['#0B1519', '#E8B94A'], v: { ...DARK_BASE, bg: '#0B1519', card: '#12232A', ink: '#EEF6F8', mute: '#8FB0BB', line: '#22404B', soft: '#1A303A', dark: '#1A303A', dark2: '#22404B' } },
  neon:     { name: 'Neon',     dark: true,  sw: ['#0A0820', '#C13BFF'], v: { bg: '#07061A', card: '#121035', ink: '#F1EEFF', mute: '#A29CD6', line: '#2F2A6E', soft: '#1A1745', red: '#00D4FF', red2: '#A833FF', dark: '#181545', dark2: '#25206A', gold: '#00F0FF', gold2: '#36E8FF', live: '#FF3DA8' } },
};
export const DEFAULT_THEME = 'light';
export function applyTheme(id) {
  const key = THEMES[id] ? id : DEFAULT_THEME;
  const t = THEMES[key];
  const r = document.documentElement.style;
  Object.entries(t.v).forEach(([k, val]) => r.setProperty('--' + k, val));
  // same card shadow as Q Spot 4D (darker on dark themes)
  r.setProperty('--shadow', t.dark ? '0 6px 16px rgba(0,0,0,.35)' : '0 6px 16px rgba(0,0,0,.16)');
  r.setProperty('--shadow2', t.dark ? '0 6px 16px rgba(0,0,0,.35)' : '0 6px 16px rgba(0,0,0,.16)');
  document.documentElement.dataset.theme = key;
  document.documentElement.dataset.mode = t.dark ? 'dark' : 'light';
  const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', t.v.bg);
  return t;
}

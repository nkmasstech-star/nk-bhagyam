// 6 colour themes (from Nehru's reference picture). Default = Sky (light pastel blue).
export const THEMES = {
  sky:    { name: 'Sky',      sw: ['#67AEEE', '#FFD8CC'], v: { bg: '#F4F9FF', card: '#FFFFFF', ink: '#14233A', mute: '#5E708A', line: '#E2ECF7', soft: '#E6F3FF', red: '#4A9BE8', red2: '#2C74C9', dark: '#2A64A8', dark2: '#4A8FD8', gold: '#FFD8CC', gold2: '#C2603F', live: '#F0526B' } },
  forest: { name: 'Forest',   sw: ['#0C3B2E', '#FFBA00'], v: { bg: '#F3F2EC', card: '#FFFFFF', ink: '#11251D', mute: '#5D6F66', line: '#E4E6DD', soft: '#EDF2EC', red: '#1E5A47', red2: '#0C3B2E', dark: '#0C3B2E', dark2: '#1E5A47', gold: '#FFBA00', gold2: '#9A6A2E', live: '#E5484D' } },
  royal:  { name: 'Royal',    sw: ['#752FFF', '#FFB831'], v: { bg: '#F6F4FF', card: '#FFFFFF', ink: '#15102A', mute: '#625C7A', line: '#E8E4F6', soft: '#EFEBFF', red: '#8A4DFF', red2: '#5A1FE0', dark: '#111111', dark2: '#2A2440', gold: '#FFB831', gold2: '#8C5A00', live: '#FE3A3A' } },
  coral:  { name: 'Coral',    sw: ['#FF5344', '#A6D3F2'], v: { bg: '#F7FAFC', card: '#FFFFFF', ink: '#1C2633', mute: '#5F6B78', line: '#E5EBF0', soft: '#EAF4FB', red: '#FF6B5D', red2: '#E8402F', dark: '#1F2B38', dark2: '#33465A', gold: '#F7D78C', gold2: '#B4531F', live: '#E5484D' } },
  sand:   { name: 'Sand',     sw: ['#E38C40', '#977B60'], v: { bg: '#FCF6EA', card: '#FFFFFF', ink: '#2B2116', mute: '#7A6A58', line: '#F0E6D2', soft: '#FCF1DA', red: '#E9994F', red2: '#D07A2E', dark: '#6E5640', dark2: '#977B60', gold: '#F6C561', gold2: '#A85D1C', live: '#E5484D' } },
  plum:   { name: 'Plum (dark)', sw: ['#312C51', '#F0C38E'], v: { bg: '#1E1A35', card: '#2B2649', ink: '#F4F1FF', mute: '#B6B0D3', line: '#3E3866', soft: '#363059', red: '#48426D', red2: '#312C51', dark: '#14112A', dark2: '#2B2649', gold: '#F0C38E', gold2: '#F1AA9B', live: '#FF6B7A' } },
};
export const DEFAULT_THEME = 'sky';
export function applyTheme(id) {
  const t = THEMES[id] || THEMES[DEFAULT_THEME];
  const r = document.documentElement.style;
  Object.entries(t.v).forEach(([k, val]) => r.setProperty('--' + k, val));
  r.setProperty('--shadow2', `0 14px 30px -12px ${t.v.red2}77`);
  document.documentElement.dataset.theme = id;
  const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', t.v.bg);
  return t;
}

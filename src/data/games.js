// Kerala weekly draws by weekday (0 = Sunday)
export const GAMES = [
  { code: 'SM', name: 'Samrudhi' },
  { code: 'BT', name: 'Bhagyathara' },
  { code: 'SS', name: 'Sthree Sakthi' },
  { code: 'DL', name: 'Dhanalekshmi' },
  { code: 'KN', name: 'Karunya Plus' },
  { code: 'SK', name: 'Suvarna Keralam' },
  { code: 'KR', name: 'Karunya' },
];
export const NAME_BY_CODE = Object.fromEntries(GAMES.map((g) => [g.code, g.name]));

// IST helpers (app logic always runs on Kerala time)
export function istNow() { const d = new Date(); return new Date(d.getTime() + (d.getTimezoneOffset() + 330) * 60000); }
export const pad = (n) => String(n).padStart(2, '0');
export const dmy = (d) => `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export function parseDmy(s) { const [d, m, y] = s.split('-').map(Number); return new Date(y, m - 1, d); }
export const fmtLong = (s) => { const d = parseDmy(s); return `${DAY[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`; };
export const fmtShort = (s) => { const d = parseDmy(s); return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`; };
export const dayNum = (s) => parseDmy(s).getDate();
export const monShort = (s) => MON[parseDmy(s).getMonth()];

export const inr = (n) => { const s = String(n); if (s.length <= 3) return '₹' + s; const last3 = s.slice(-3); const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ','); return '₹' + rest + ',' + last3; };

// today's minutes since midnight IST
export const istMinutes = () => { const n = istNow(); return n.getHours() * 60 + n.getMinutes(); };
export const LIVE_START = 14 * 60 + 55;   // 2:55 PM
export const LIVE_END = 17 * 60 + 30;     // 5:30 PM
export const RESULT_AT = '3:07 PM';

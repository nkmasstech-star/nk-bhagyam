// 4 Digit Analytics — uses all draws we have.
import { history, resOf, lowerNums } from './hist.js';
import { parseDmy } from './games.js';

const all = (maxAmt, minAmt, draws = history()) => draws.flatMap((d) => lowerNums(resOf(d), maxAmt, minAmt));

// High Frequency Numbers: top 5 digits for each place A B C D (₹5,000 to ₹500)
export function highFreq() {
  const nums = all(5000, 500);
  const pos = [0, 1, 2, 3].map((i) => { const c = Array(10).fill(0); nums.forEach((n) => { c[+n[i]] += 1; }); return c; });
  return { total: nums.length, draws: history().length, cols: pos.map((c) => c.map((v, d) => ({ d, v })).sort((a, b) => b.v - a.v || a.d - b.d).slice(0, 5)) };
}

// Repeated Numbers: straight numbers that came most often (₹5,000 to ₹500)
export function repeated(n = 10) {
  const m = new Map(); all(5000, 500).forEach((x) => m.set(x, (m.get(x) || 0) + 1));
  return [...m].filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, n).map(([num, c]) => ({ num, c }));
}

// Repeated Formats (₹5,000 to ₹500)
const canon = (n) => { const map = {}; let k = 0; return n.split('').map((c) => { if (!(c in map)) { map[c] = 'ABCD'[k]; k += 1; } return map[c]; }).join(''); };
const KIND = (p) => { const c = {}; p.split('').forEach((x) => { c[x] = (c[x] || 0) + 1; }); const v = Object.values(c).sort().join(''); return { 1111: 'All different', 112: 'One double', 22: 'Two doubles', 13: 'Triple', 4: 'Four same' }[v] || ''; };
const EX = { ABCD: '1234', AABC: '5561', ABBC: '1556', ABCC: '1255', ABAC: '5156', ABCA: '5615', ABCB: '1525', AABB: '5511', ABAB: '5151', ABBA: '5115', AAAB: '5551', ABBB: '1555', AABA: '5515', ABAA: '5155', AAAA: '5555' };
export function formats() {
  const nums = all(5000, 500); const m = new Map();
  nums.forEach((n) => { const p = canon(n); m.set(p, (m.get(p) || 0) + 1); });
  return { total: nums.length, list: [...m].sort((a, b) => b[1] - a[1]).map(([p, c]) => ({ p, c, pct: nums.length ? (c / nums.length) * 100 : 0, kind: KIND(p), ex: EX[p] || '' })) };
}

// All Time Power Numbers: top 30 straight numbers (₹5,000 to ₹100) using every draw before the month starts; fresh each month
const mkey = (date) => date.slice(6, 10) + '-' + date.slice(3, 5);
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const monthName = (k) => `${MON[+k.slice(5) - 1]} ${k.slice(0, 4)}`;
export function powerFor(k) {
  const start = new Date(+k.slice(0, 4), +k.slice(5) - 1, 1).getTime();
  const draws = history();
  const prev = draws.filter((d) => parseDmy(d.date).getTime() < start);
  const m = new Map(); all(5000, 100, prev).forEach((x) => m.set(x, (m.get(x) || 0) + 1));
  const nums = [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 30).map(([num, c]) => ({ num, c }));
  const inMonth = draws.filter((d) => mkey(d.date) === k);
  const hitSet = new Map();
  inMonth.forEach((d) => { const r = resOf(d); (r && r.lower ? r.lower : []).filter((p) => p.amt <= 5000 && p.amt >= 100).forEach((p) => p.list.forEach((x) => { if (!hitSet.has(x)) hitSet.set(x, { date: d.date, prize: p.label }); })); });
  return { k, nums: nums.map((x) => ({ ...x, hit: hitSet.get(x.num) || null })), draws: inMonth.length, base: prev.length };
}
export function powerMonths() {
  const ks = [...new Set(history().map((d) => mkey(d.date)))].sort().reverse();
  return ks;
}

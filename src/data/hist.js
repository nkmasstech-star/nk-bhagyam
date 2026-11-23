// Shared draw history for formulas (set by App when the draw list loads)
import { parseDmy } from './games.js';
import { resultOrSample } from './predictions.js';
let DRAWS = [];
export const setHistory = (d) => { DRAWS = d || []; };
export const history = () => DRAWS;
const t = (s) => parseDmy(s).getTime();
// draws strictly before a date, newest first
export const before = (date) => DRAWS.filter((d) => t(d.date) < t(date));
export const resOf = (d) => resultOrSample(d);
// all 4 digit numbers of the lower prizes between two amounts (inclusive)
export function lowerNums(res, maxAmt, minAmt) {
  return (res && res.lower ? res.lower : []).filter((p) => p.amt <= maxAmt && p.amt >= minAmt).flatMap((p) => p.list);
}
// Nehru's 4D source: last 30 draws, ₹5,000 and ₹2,000 prize numbers (₹1,000 when a draw has no ₹2,000 prize)
export function top6For(date) {
  const cnt = Array(10).fill(0);
  before(date).slice(0, 30).forEach((d) => {
    const r = resOf(d); if (!r || !r.lower) return;
    const p5 = r.lower.find((p) => p.amt === 5000);
    const p2 = r.lower.find((p) => p.amt === 2000) || r.lower.find((p) => p.amt === 1000);
    [p5, p2].filter(Boolean).forEach((p) => p.list.forEach((n) => n.split('').forEach((c) => { cnt[+c] += 1; })));
  });
  if (cnt.every((c) => c === 0)) return [1, 3, 5, 6, 8, 9];
  return cnt.map((c, d) => [d, c]).sort((a, b) => b[1] - a[1] || a[0] - b[0]).slice(0, 6).map(([d]) => d);
}

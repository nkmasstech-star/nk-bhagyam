// Predictions (sample for now). 3 Digit card values will come from the admin page,
// 4 Digit (₹5,000 and below) values from the history formula (to be added).
import { dummyResult } from './dummy.js';

let seed = 1;
const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
const d1 = () => String(Math.floor(rnd() * 10));
const pick = (n, len) => Array.from({ length: n }, () => Array.from({ length: len }, d1).join(''));
const seedOf = (date) => { seed = parseInt(date.replace(/-/g, ''), 10) % 233280 + 11; };

export function predFor(date) {
  seedOf(date);
  const cols = [0, 1, 2].map(() => { const s = new Set(); while (s.size < 3) s.add(d1()); return [...s].join(''); });
  const board = []; while (board.length < 2) { const x = d1(); if (!board.includes(x)) board.push(x); }
  const box = []; while (box.length < 3) { const x = d1(); if (!box.includes(x)) box.push(x); }
  return { cols, board, box: box.join(''), p3: pick(3, 3), p4: pick(3, 4), list4: [...new Set(pick(14, 4))].slice(0, 12).sort() };
}

// make some sample history days win so the marks can be seen
export function predForHistory(draw, res) {
  const p = predFor(draw.date);
  if (!res || !res.first) return p;
  const last3 = res.first.ticket.slice(-3); const last4 = res.first.ticket.slice(-4);
  const k = parseInt(draw.date.slice(0, 2), 10) % 5;
  if (k === 1) p.cols = p.cols.map((c, i) => (c.includes(last3[i]) ? c : last3[i] + c.slice(1)));
  if (k === 2) { p.p3[1] = last3; p.box = last3[0] + last3[1] + p.box[2]; }
  if (k === 3) { p.p4[0] = last4; p.board[0] = last3[2]; }
  const low = (res.lower || []).flatMap((x) => x.list);
  if (k !== 0 && low.length) { p.list4[2] = low[3]; p.list4[7] = low[low.length - 5]; if (k === 4) p.list4[10] = low[1]; p.list4 = [...new Set(p.list4)].sort(); }
  return p;
}

const L = 'ABC';
// 3 digit card wins (position-free inside each column, as Nehru described)
export function check3(p, ticket) {
  const res = ticket.slice(-3); const tail4 = ticket.slice(-4);
  const chartHits = [0, 1, 2].filter((i) => p.cols[i].includes(res[i]));
  const chart = chartHits.length >= 2 ? chartHits : [];
  const boardPos = p.board.map((d) => ({ d, pos: [0, 1, 2].filter((j) => res[j] === d).map((j) => L[j]) }));
  const boardWin = boardPos.some((b) => b.pos.length);
  const boxPos = [0, 1, 2].filter((j) => p.box.includes(res[j]));
  const boxWin = boxPos.length >= 2;
  const p3 = p.p3.map((x) => { if (x === res) return { x, circ: [0, 1, 2], tag: '3 DIGIT' }; if (x.slice(-2) === res.slice(-2)) return { x, circ: [1, 2], tag: 'LAST 2' }; return { x, circ: [], tag: '' }; });
  const p4 = p.p4.map((x) => (x === tail4 ? { x, circ: [0, 1, 2, 3], tag: '4 DIGIT' } : { x, circ: [], tag: '' })); // 4 digit: straight only
  const tags = [];
  if (chart.length) tags.push('Chart ' + chart.map((i) => L[i]).join(''));
  if (boxWin) tags.push('Box ' + boxPos.map((j) => L[j]).join(''));
  if (boardWin) tags.push('Board');
  if (p3.some((x) => x.tag)) tags.push('3 Digit');
  if (p4.some((x) => x.tag)) tags.push('4 Digit');
  return { res, chart, boardPos, boardWin, boxPos, boxWin, p3, p4, tags, win: tags.length > 0 };
}
// 4 digit card (₹5,000 and below): straight exact match only
export function check4(list, result) {
  const hits = [];
  (result && result.lower ? result.lower : []).forEach((pr) => list.forEach((n) => { if (pr.list.includes(n)) hits.push({ n, label: pr.label, amt: pr.amt }); }));
  return hits;
}
export function resultOrSample(draw) {
  try { const r = JSON.parse(localStorage.getItem('nk_res_' + draw.date)); if (r && r.first) return r; } catch (e) { /* ignore */ }
  return dummyResult(draw);
}

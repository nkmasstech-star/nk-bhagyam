// Sample data used when the live sources can't be reached (web preview, offline)
import { GAMES, istNow, dmy } from './games.js';

let seed = 7;
const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
const n4 = () => String(Math.floor(rnd() * 10000)).padStart(4, '0');
const uniq = (k) => { const s = new Set(); while (s.size < k) s.add(n4()); return [...s].sort(); };
const SER = ['A', 'B', 'C', 'D', 'E', 'G', 'H', 'J', 'K', 'L', 'M', 'N'];

export function dummyResult(draw) {
  seed = parseInt(draw.date.replace(/-/g, ''), 10) % 233280;
  const L = draw.code.split('-')[0][0];
  const num = String(100000 + Math.floor(rnd() * 899999));
  const s1 = L + SER[Math.floor(rnd() * 12)];
  return {
    source: 'sample',
    complete: true,
    first: { amt: 10000000, ticket: `${s1} ${num}`, place: 'KOLLAM', agent: 'SAMPLE AGENT', agency: 'Q 1234' },
    cons: { amt: 5000, list: SER.map((x) => `${L}${x} ${num}`).filter((x) => x !== `${s1} ${num}`).slice(0, 11) },
    second: { amt: 2500000, ticket: `${L}${SER[Math.floor(rnd() * 12)]} ${100000 + Math.floor(rnd() * 899999)}`, place: 'THRISSUR' },
    third: { amt: 500000, ticket: `${L}${SER[Math.floor(rnd() * 12)]} ${100000 + Math.floor(rnd() * 899999)}`, place: 'KANNUR' },
    lower: [
      { label: '4th', amt: 5000, want: 19, list: uniq(19) },
      { label: '5th', amt: 2000, want: 6, list: uniq(6) },
      { label: '6th', amt: 1000, want: 25, list: uniq(25) },
      { label: '7th', amt: 500, want: 76, list: uniq(76) },
      { label: '8th', amt: 200, want: 92, list: uniq(92) },
      { label: '9th', amt: 100, want: 150, list: uniq(150) },
    ],
  };
}

export function dummyDraws(n = 31) {
  const out = []; const today = istNow();
  const base = { SM: 82, KR: 777, SK: 78, KN: 650, DL: 78, SS: 546, BT: 80 }; // latest code of each game
  for (let k = 0; k < n; k += 1) {
    const d = new Date(today); d.setDate(d.getDate() - k);
    const g = GAMES[d.getDay()];
    out.push({ date: dmy(d), name: g.name, code: `${g.code}-${base[g.code] - Math.floor(k / 7)}`, link: null });
  }
  return out;
}

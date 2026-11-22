// Live Kerala results.
// Main source: keralalotteriesresults.in (live Blogger post, typed in during the draw).
// Backup: keralalotteryresultstoday.in (used only when the main source fails).
// If both fail we show nothing extra – users simply refresh later.
import { NAME_BY_CODE, istNow, dmy } from './games.js';
import { dummyResult, dummyDraws } from './dummy.js';

const MAIN = 'https://www.keralalotteriesresults.in/';
const BACKUP = 'https://www.keralalotteryresultstoday.in/';
const LOWER = [['4th', 5000], ['5th', 2000], ['6th', 1000], ['7th', 500], ['8th', 200], ['9th', 100], ['10th', 50]];

const isNative = () => !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* full */ } },
};

async function getHtml(url) {
  const r = await fetch(url + (url.includes('?') ? '&' : '?') + 't=' + Date.now(), { cache: 'no-store' });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.text();
}
const docOf = (html) => new DOMParser().parseFromString(html, 'text/html');
const clean = (s) => s.replace(/ /g, ' ').replace(/\s+/g, ' ');

// ---------- draw list (home page table of the main source) ----------
function parseDrawList(html) {
  const doc = docOf(html); const seen = new Map();
  doc.querySelectorAll('a[href]').forEach((a) => {
    const m = a.getAttribute('href').match(/\/(\d{4})\/(\d{2})\/([a-z]{2})-?(\d+)[^/]*?(\d{2}-\d{2}-\d{4})\.html/i);
    if (!m) return;
    const date = m[5]; if (seen.has(date)) return;
    const code = `${m[3].toUpperCase()}-${m[4]}`;
    const row = a.closest('tr');
    let name = NAME_BY_CODE[m[3].toUpperCase()];
    if (!name && row) name = clean(row.textContent).replace(/\d{2}-\d{2}-\d{4}|[A-Z]{2}-\d+|Lottery/gi, '').trim();
    seen.set(date, { date, name: name || code, code, link: new URL(a.getAttribute('href'), MAIN).href });
  });
  return [...seen.values()].sort((x, y) => (x.date.split('-').reverse().join('') < y.date.split('-').reverse().join('') ? 1 : -1));
}

export async function loadDraws() {
  const cached = store.get('nk_draws');
  if (!isNative()) return { draws: mergeToday(dummyDraws()), sample: true };
  try {
    const list = parseDrawList(await getHtml(MAIN));
    if (list.length) { store.set('nk_draws', list); return { draws: mergeToday(list.slice(0, 31)), sample: false }; }
  } catch (e) { /* fall through */ }
  if (cached) return { draws: mergeToday(cached.slice(0, 31)), sample: false };
  return { draws: mergeToday(dummyDraws()), sample: true };
}

// make sure today's draw card exists from 12 AM even before the site posts it
function mergeToday(list) {
  const today = dmy(istNow());
  if (list.length && list[0].date === today) return list;
  const d = dummyDraws(1)[0];
  return [d, ...list];
}

// ---------- result page parsing (main source) ----------
const amtAfter = (txt) => { const m = txt.match(/(?:Rs\.?|₹)\s*([\d,]+)/); return m ? parseInt(m[1].replace(/,/g, ''), 10) : null; };
const TICKET = /[A-Z]{2}\s?\d{6}/g;

export function parseMain(html) {
  const t = clean(docOf(html).body.textContent);
  const cut = (from, toList) => {
    const i = t.search(from); if (i < 0) return '';
    let end = t.length; const rest = t.slice(i + 1);
    toList.forEach((re) => { const j = rest.search(re); if (j >= 0 && i + 1 + j < end) end = i + 1 + j; });
    return t.slice(i, end);
  };
  const stops = [/Consolation Prize/, /2nd Prize/, /3rd Prize/, /4th Prize/, /Results Loading/, /The prize winners/, /Repeated Draw/];
  const s1 = cut(/1st Prize/, stops.slice(0));
  const sc = cut(/Consolation Prize/, stops.slice(1));
  const s2 = cut(/2nd Prize/, stops.slice(2));
  const s3 = cut(/3rd Prize/, stops.slice(3));
  const tk = (s) => { const m = s.match(TICKET); return m ? m[0].replace(/^([A-Z]{2})\s?/, '$1 ') : null; };
  const place = (s) => { const m = s.match(/[A-Z]{2}\s?\d{6}\s*\(([A-Z .]+)\)/); return m ? m[1].trim() : ''; };
  const agent = (s) => { const m = s.match(/Agent Name:\s*(.+?)\s*Agency No\.?:\s*([A-Z]\s?\d+)/); return m ? { agent: m[1].trim(), agency: m[2] } : {}; };
  const out = { source: 'main', complete: false };
  if (tk(s1)) out.first = { amt: amtAfter(s1) || 10000000, ticket: tk(s1), place: place(s1), ...agent(s1) };
  const cons = (sc.match(TICKET) || []).map((x) => x.replace(/^([A-Z]{2})\s?/, '$1 '));
  if (cons.length) out.cons = { amt: amtAfter(sc) || 5000, list: cons };
  if (tk(s2)) out.second = { amt: amtAfter(s2), ticket: tk(s2), place: place(s2) };
  if (tk(s3)) out.third = { amt: amtAfter(s3), ticket: tk(s3), place: place(s3) };
  out.lower = [];
  LOWER.forEach(([lab], k) => {
    const next = LOWER.slice(k + 1).map(([l]) => new RegExp(l + ' Prize'));
    const sec = cut(new RegExp(lab + ' Prize'), [...next, /Results Loading/, /The prize winners/, /Repeated Draw/, /Kerala Lottery Result Yesterday/]);
    if (!sec) return;
    const want = (sec.match(/drawn\s+(\d+)\s+times/i) || [])[1];
    const body = sec.replace(/^.*?times\)/i, '');
    const list = [...new Set(body.match(/(?<!\d)\d{4}(?!\d)/g) || [])].sort(); // only real 4-digit numbers (typos like 334 or 60333 are dropped)
    out.lower.push({ label: lab, amt: amtAfter(sec), want: want ? +want : null, list });
  });
  // the site sometimes drops a typo'd number, so allow 2 missing; final only when 'Results Loading' is gone
  out.complete = !!out.first && out.lower.length >= 6 && out.lower.every((p) => !p.want || p.list.length >= p.want - 2) && !/Results Loading/.test(t);
  return out;
}

// ---------- backup source parsing ----------
export function parseBackup(html, code) {
  const u = html.replace(/\\"/g, '"');
  const i = u.indexOf(`"draw_code":"${code}"`); if (i < 0) return null;
  const seg = u.slice(i, i + 30000);
  const arr = (k) => { const m = seg.match(new RegExp('"' + k + '":\\[(.*?)\\]')); return m ? (m[1].match(/"([^"]*)"/g) || []).map((x) => x.slice(1, -1)) : []; };
  const f = seg.match(/"first":\{"agent":"([^"]*)","ticket":"([^"]*)","location":"([^"]*)","agency_no":"([^"]*)"/);
  const out = { source: 'backup', complete: false, lower: [] };
  if (f) out.first = { amt: 10000000, ticket: f[2], place: f[3], agent: f[1], agency: f[4] };
  const two = arr('2nd'); if (two[0]) out.second = { amt: null, ticket: two[0] };
  const three = arr('3rd'); if (three[0]) out.third = { amt: null, ticket: three[0] };
  LOWER.forEach(([lab, amt]) => { const l = arr(lab).filter((x) => /^\d{4}$/.test(x)); if (l.length) out.lower.push({ label: lab, amt, want: null, list: [...new Set(l)].sort() }); });
  out.complete = false; // backup only fills gaps; never treated as final
  return out.first ? out : null;
}

// ---------- public: get one draw's result ----------
export async function loadResult(draw) {
  const key = 'nk_res_' + draw.date;
  const cached = store.get(key);
  const today = draw.date === dmy(istNow());
  const late = today && istNow().getHours() < 19;
  if (cached && cached.complete && !late) return cached;
  if (!isNative()) return today ? null : dummyResult(draw);
  try {
    let link = draw.link;
    if (!link) { const list = parseDrawList(await getHtml(MAIN)); const hit = list.find((x) => x.date === draw.date); link = hit && hit.link; }
    if (link) {
      const r = parseMain(await getHtml(link));
      if (r.first || r.lower.some((p) => p.list.length)) { store.set(key, r); return r; }
    }
  } catch (e) { /* main failed – try backup */ }
  try {
    const r = parseBackup(await getHtml(BACKUP), draw.code);
    if (r) { store.set(key, r); return r; }
  } catch (e) { /* both failed */ }
  return cached || null; // nothing new: show what we had (or the empty template)
}

// compare two results → set of numbers that are new in `next`
export function newNumbers(prev, next) {
  const had = new Set(); const add = new Set();
  const all = (r) => (r ? [...(r.lower || []).flatMap((p) => p.list), r.first && r.first.ticket, r.second && r.second.ticket, r.third && r.third.ticket].filter(Boolean) : []);
  all(prev).forEach((x) => had.add(x));
  all(next).forEach((x) => { if (!had.has(x)) add.add(x); });
  return prev ? add : new Set();
}

// last N draws' 1st-prize last 4 digits (for charts / Lucky boxes); sample data when not available
export function firstPrizeTail(draws, n = 30) {
  return draws.slice(0, n).map((d) => {
    const r = store.get('nk_res_' + d.date) || dummyResult(d);
    return r.first ? { date: d.date, code: d.code, name: d.name, ticket: r.first.ticket, tail: r.first.ticket.slice(-4) } : null;
  }).filter(Boolean);
}

import { useState } from 'preact/hooks';
import { TopBar, go, IconSearch } from '../ui.jsx';
import { fmtLong, istNow, dmy, RESULT_AT, istMinutes, LIVE_START, LIVE_END, parseDmy } from '../data/games.js';
import { Sheet } from '../social/Sheet.jsx';
import { QuickFab, QuickScan } from './Quick.jsx';

const IconList = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></svg>;
const MON = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
// accepts 21, 21-11, 21/11/2026, 21 nov, nov 21, 2026-11-21, game name or code (SM-82)
function matches(d, q) {
  const s = q.trim().toLowerCase(); if (!s) return false;
  if (d.name.toLowerCase().includes(s) || d.code.toLowerCase().replace('-', '').includes(s.replace(/[\s-]/g, ''))) return true;
  const dt = parseDmy(d.date); const dd = dt.getDate(); const mm = dt.getMonth() + 1; const yy = dt.getFullYear();
  const mon = MON.findIndex((m) => s.includes(m));
  const nums = (s.match(/\d+/g) || []).map(Number);
  if (s.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) return nums[0] === yy && nums[1] === mm && nums[2] === dd;
  if (mon >= 0) return mon + 1 === mm && (nums.length === 0 || nums.includes(dd)) && (!nums.some((n) => n > 31) || nums.includes(yy));
  if (nums.length === 1) return nums[0] === dd;
  if (nums.length === 2) return nums[0] === dd && nums[1] === mm;
  if (nums.length >= 3) return nums[0] === dd && nums[1] === mm && (nums[2] === yy || nums[2] === yy % 100);
  return false;
}

function Card({ d, k, today }) {
  const isToday = d.date === today; const m = istMinutes();
  let tag = null;
  if (isToday) tag = m < LIVE_START ? <span class="tag td">TODAY</span> : m <= LIVE_END ? <span class="tag lv">LIVE</span> : <span class="tag nw">NEW</span>;
  else if (k === 1 && m < LIVE_START) tag = <span class="tag nw">NEW</span>;
  return (
    <button class="rcard" onClick={() => go('/result/' + d.date)}>
      <div class="top"><span class="dchip">{fmtLong(d.date).replace(/^(\w{3})\w*,/, '$1,')}</span>{tag}</div>
      <div class="nm">{d.name}</div>
      <div class="meta"><span class="code">{d.code}</span>{isToday && m < LIVE_START && <span>Live {RESULT_AT}</span>}</div>
    </button>
  );
}

function Search({ draws, onClose }) {
  const [q, setQ] = useState(''); const [pick, setPick] = useState('');
  const list = pick ? draws.filter((d) => d.date === pick) : q ? draws.filter((d) => matches(d, q)) : [];
  const onDate = (v) => { if (!v) { setPick(''); return; } const [y, m, dd] = v.split('-'); setPick(`${dd}-${m}-${y}`); setQ(''); };
  return (
    <Sheet title="Find a result" onClose={onClose}>
      <input class="qinput" autofocus placeholder="Type a date, e.g. 21-11-2026 or 21 Nov" value={q} onInput={(e) => { setQ(e.currentTarget.value); setPick(''); }} />
      <div class="meta" style="margin:10px 2px 6px">or pick from the calendar</div>
      <input class="qinput" type="date" onInput={(e) => onDate(e.currentTarget.value)} />
      <div class="rc" style="margin:16px 0 4px;padding:0">
        {list.slice(0, 20).map((d) => <Card key={d.date} d={d} k={-1} today="" />)}
      </div>
      {(q || pick) && list.length === 0 && <div class="meta ctr" style="padding:14px">No result found for that date.</div>}
    </Sheet>
  );
}

export function Home({ draws, ready }) {
  const today = dmy(istNow());
  const [find, setFind] = useState(false);
  const [quick, setQuick] = useState(false);
  return (
    <div>
      <TopBar />
      <div class="hcards"><button class="hcard" onClick={() => document.querySelector('.screen') && document.querySelector('.screen').scrollTo({ top: 0, behavior: 'smooth' })}><IconList /><span>Latest Results</span></button><button class="hcard" aria-label="Search results by date" onClick={() => setFind(true)}><IconSearch /><span>Search date</span></button></div>
      {!ready && <div class="empty">Loading…</div>}
      <div class="rc">{draws.map((d, k) => <Card key={d.date} d={d} k={k} today={today} />)}</div>
      {find && <Search draws={draws} onClose={() => setFind(false)} />}
      {ready && <QuickFab onClick={() => setQuick(true)} />}
      {quick && <QuickScan draws={draws} onClose={() => setQuick(false)} />}
    </div>
  );
}

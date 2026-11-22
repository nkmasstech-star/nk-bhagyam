import { useState, useEffect, useRef } from 'preact/hooks';
import { BackBar, Hero, Disclaimer, IconClock } from '../ui.jsx';
import { loadResult, newNumbers } from '../data/results.js';
import { QuickFab, QuickCheck } from './Quick.jsx';
import { fmtLong, inr, istNow, dmy, istMinutes, LIVE_START, LIVE_END, RESULT_AT } from '../data/games.js';

const pad4 = (l) => { const r = l.slice(); while (r.length % 4) r.push(''); return r; };
const Ad = () => <div class="ad">Native ad space</div>;

function Wait() { return <div class="res"><IconClock />Result live at {RESULT_AT}</div>; }

function Top({ title, p, wait }) {
  return (
    <div class="card"><div class="band">{title}</div>
      {p ? <><div class="amt">{inr(p.amt || 0)}</div><div class="big">{p.ticket}</div><div class="place">{[p.place, p.agent && `Agent: ${p.agent}`, p.agency].filter(Boolean).join(' · ')}</div></> : wait}
    </div>
  );
}
function Lower({ p, fresh, wait }) {
  return (
    <div class="card"><div class="band">{p.label} Prize</div>
      <div class="amt">{p.amt ? inr(p.amt) : ''}</div>
      {p.list.length ? <div class="grid">{pad4(p.list).map((n, i) => <span key={i} class={fresh.has(n) ? 'new' : ''}>{n || ' '}</span>)}</div> : wait}
      {p.want && p.list.length < p.want && <div class="cnt">Updating… <b>{p.list.length}/{p.want}</b></div>}
    </div>
  );
}
const TEMPLATE = [['4th', 5000], ['5th', 2000], ['6th', 1000], ['7th', 500], ['8th', 200], ['9th', 100]].map(([label, amt]) => ({ label, amt, list: [] }));

export function Result({ draws, date }) {
  const draw = draws.find((d) => d.date === date) || draws[0];
  const [res, setRes] = useState(undefined);
  const [fresh, setFresh] = useState(new Set());
  const [quick, setQuick] = useState(false);
  const prev = useRef(null);
  const today = draw && draw.date === dmy(istNow());

  useEffect(() => {
    if (!draw) return undefined;
    let alive = true;
    const tick = () => loadResult(draw).then((r) => {
      if (!alive) return;
      setFresh(newNumbers(prev.current, r)); prev.current = r; setRes(r);
    });
    tick();
    // live: refresh every 30 s during the draw window; each refresh replaces the whole list,
    // so numbers the site corrected are fixed and new ones are added
    const id = setInterval(() => { const m = istMinutes(); if (today && m >= LIVE_START && m <= LIVE_END && !(prev.current && prev.current.complete)) tick(); }, 30000);
    return () => { alive = false; clearInterval(id); };
  }, [draw && draw.date]);

  if (!draw) return <div><BackBar title="Result" /></div>;
  const live = today && res && !res.complete && istMinutes() >= LIVE_START;
  const lower = res && res.lower && res.lower.length ? res.lower : TEMPLATE;
  const wait = <Wait />;
  return (
    <div>
      <BackBar title={`${draw.name} ${draw.code}`} right={live ? <span class="live">LIVE</span> : <span style="width:42px" />} />
      <Hero draw={draw} fmt={fmtLong} />
      {res === undefined && <div class="empty">Loading…</div>}
      <Top title="1st Prize" p={res && res.first} wait={wait} />
      <div class="card"><div class="band">Consolation Prize</div>
        {res && res.cons ? <><div class="amt">{inr(res.cons.amt)}</div><div class="grid g2">{res.cons.list.concat(res.cons.list.length % 2 ? [''] : []).map((t, i) => <span key={i}>{t || ' '}</span>)}</div></> : res && res.first ? <div class="place" style="padding-top:12px">Same number in all other series</div> : wait}
      </div>
      <Top title="2nd Prize" p={res && res.second} wait={wait} />
      <Top title="3rd Prize" p={res && res.third} wait={wait} />
      <Ad />
      {lower.map((p, k) => <div key={p.label}>{k === 4 && <Ad />}<Lower p={p} fresh={fresh} wait={wait} /></div>)}
      <Disclaimer />
      {res && res.complete && res.first && <QuickFab low onClick={() => setQuick(true)} />}
      {quick && <QuickCheck draw={draw} res={res} onClose={() => setQuick(false)} />}
    </div>
  );
}

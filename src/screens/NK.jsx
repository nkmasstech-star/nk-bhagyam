import { useState } from 'preact/hooks';
import { TopBar, BackBar, Disclaimer, go, ls } from '../ui.jsx';
import { Pop } from './Quick.jsx';
import { fmtShort, istNow, dmy, parseDmy, GAMES } from '../data/games.js';
import { firstPrizeTail } from '../data/results.js';
import { IcGrid3, IcBars, IcCal, IcBox, IcVote, IcGift, IcFilter } from './icons2.jsx';

const CARDS = [
  ['/p3', IcGrid3, '3 Digit Guessing'],
  ['/freq', IcBars, 'Result Frequency'],
  ['/monthly', IcCal, 'Monthly Chart'],
  ['/box', IcBox, 'Box Creator'],
  ['/poll', IcVote, 'Voting Numbers'],
  ['/lucky', IcGift, 'Lucky Number Generator'],
];
export const NkBanner = () => <div class="nkban"><img src="./nk-logo.png" alt="NK Guessing" /><div><b>NK Guessing</b><span>Analysis &amp; Predictions</span></div></div>;
export const HubTile = ({ to, Ic, h }) => <button class="htile" onClick={() => go(to)}><span class="hti"><Ic /></span><h3>{h}</h3></button>;

// NK tab: hub of cards
export function NKHome({ draws }) {
  void draws;
  return (
    <div>
      <TopBar />
      <NkBanner />
      <div class="tiles">
        {CARDS.map(([to, Ic, h]) => <HubTile key={to} to={to} Ic={Ic} h={h} />)}
      </div>
      <div class="ad" style="margin-top:16px">Native ad space</div>
    </div>
  );
}

// 1st prize of a draw (skips today's draw until its result is complete)
const firstOf = (d) => {
  const today = dmy(istNow());
  const cached = ls.get('nk_res_' + d.date, null);
  if (d.date === today && !(cached && cached.complete)) return null;
  const r = firstPrizeTail([d], 1)[0];
  return r || null;
};
const MS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Result Frequency: last 3 digits (A B C) of every 1st prize we have
function FilterPop({ order, setOrder, onClose }) {
  return (
    <Pop title="Sort numbers" onClose={onClose}>
      {[['num', '0 to 9'], ['high', 'High to low'], ['low', 'Low to high']].map(([k, l]) => <button key={k} class={order === k ? 'srow on' : 'srow'} onClick={() => { setOrder(k); onClose(); }}>{l}{order === k && <b>✓</b>}</button>)}
    </Pop>
  );
}
export function Frequency({ draws }) {
  const [order, setOrder] = useState(ls.get('nk_fq_order', 'num'));
  const [pop, setPop] = useState(false);
  const rows = draws.map(firstOf).filter(Boolean);
  const cols = [0, 1, 2].map((i) => { const c = Array(10).fill(0); rows.forEach((x) => { const t = x.ticket.replace(/\D/g, '').slice(-3); c[+t[i]] += 1; }); return c; });
  const sorted = (c) => { const l = c.map((v, d) => ({ d, v })); if (order === 'high') l.sort((a, b) => b.v - a.v || a.d - b.d); if (order === 'low') l.sort((a, b) => a.v - b.v || a.d - b.d); return l; };
  const setO = (k) => { setOrder(k); ls.set('nk_fq_order', k); };
  return (
    <div>
      <BackBar title="Result Frequency" />
      <div class="card fqcard">
        <div class="fqhead"><div><b>Result Frequency</b><small>1st prize analysis · last 3 digits · {rows.length} draws</small></div><button class="fbtn" onClick={() => setPop(true)}><IcFilter />{order === 'num' ? '0–9' : order === 'high' ? 'High' : 'Low'}</button></div>
        <div class="abc3">{cols.map((c, i) => { const mx = Math.max(...c); return (
          <div key={i} class="abcol"><div class="abh">{'ABC'[i]}</div>{sorted(c).map((x) => <div key={x.d} class={x.v === mx ? 'abr top' : 'abr'}><b>{x.d}</b><small>{x.v}</small></div>)}</div>
        ); })}</div>
      </div>
      <div class="sec"><b>1st Prize Results</b><span>Last 10</span></div>
      <div class="card"><div class="fplist">{rows.slice(0, 10).map((r) => <button key={r.date} onClick={() => go('/result/' + r.date)}><span>{fmtShort(r.date)}<small>{r.name} · {r.code}</small></span><b>{r.ticket.slice(0, -3)}<em>{r.ticket.slice(-3)}</em></b></button>)}</div></div>
      <Disclaimer>Counts from past results only. They do not predict the next draw.</Disclaimer>
      {pop && <FilterPop order={order} setOrder={setO} onClose={() => setPop(false)} />}
    </div>
  );
}

// Monthly Chart: this month from the 1st to the last day (future draws shown empty), past 12 months as cards
const mk = (dt) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
function monthRows(draws, key) {
  const [y, m] = key.split('-').map(Number);
  const days = new Date(y, m, 0).getDate();
  const out = [];
  for (let day = 1; day <= days; day += 1) {
    const dt = new Date(y, m - 1, day); const date = dmy(dt);
    const d = draws.find((x) => x.date === date);
    if (d) { out.push({ date, name: d.name, code: d.code, f: firstOf(d) }); continue; }
    // a draw that has not happened yet: game by weekday, number counted on from that game's last draw
    const g = GAMES[dt.getDay()]; const last = draws.find((x) => x.code.startsWith(g.code + '-') && parseDmy(x.date) < dt);
    const code = last ? `${g.code}-${+last.code.split('-')[1] + Math.round((dt - parseDmy(last.date)) / 6048e5)}` : g.code;
    out.push({ date, name: g.name, code, f: null, future: dt > istNow() });
  }
  return out;
}
export function Monthly({ draws, month }) {
  const now = istNow(); const cur = mk(now); const key = month || cur;
  const rows = monthRows(draws, key);
  const [y, m] = key.split('-').map(Number);
  const past = []; for (let i = 1; i <= 12; i += 1) { const dt = new Date(now.getFullYear(), now.getMonth() - i, 1); const k = mk(dt); if (draws.some((d) => d.date.endsWith(`-${k.slice(5)}-${k.slice(0, 4)}`))) past.push(k); }
  return (
    <div>
      <BackBar title={month ? `${MS[m - 1]} ${y}` : 'Monthly Chart'} />
      <div class="card"><div class="band up">{MS[m - 1]} {y} · 1st Prize</div>
        <table class="tbl mtbl"><thead><tr><th>Date</th><th>Draw</th><th>1st Prize</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.date} class={r.f ? '' : 'emp'} onClick={() => r.f && go('/result/' + r.date)}><td>{r.date.slice(0, 5).replace('-', '/')}</td><td>{r.name}<small>{r.code}</small></td><td>{r.f ? <b>{r.f.ticket.slice(0, -4)}<em>{r.f.tail}</em></b> : <span class="dash">—</span>}</td></tr>)}</tbody></table>
      </div>
      {!month && <>
        <div class="sec"><b>Previous Months</b></div>
        {past.length ? <div class="tiles">{past.map((k) => <button key={k} class="htile mcard" onClick={() => go('/monthly/' + k)}><span class="hti"><IcCal /></span><h3>{MS[+k.slice(5) - 1]}<br /><small>{k.slice(0, 4)}</small></h3></button>)}</div> : <div class="empty">Previous months appear here.</div>}
      </>}
      <Disclaimer />
    </div>
  );
}

function perms(digits, len) {
  const out = new Set();
  const go2 = (cur, used) => { if (cur.length === len) { out.add(cur); return; } digits.forEach((d, i) => { if (!used[i]) { used[i] = true; go2(cur + d, used); used[i] = false; } }); };
  go2('', []);
  return [...out].sort();
}
export function BoxCreator() {
  const [v, setV] = useState(''); const [len, setLen] = useState(3); const [out, setOut] = useState(null);
  const gen = () => { const d = v.split(''); setOut(d.length >= len ? perms(d, len) : []); };
  return (
    <div>
      <BackBar title="Box Creator" />
      <div class="qwrap" style="margin-top:6px">
        <div class="qpanel">
          <div class="meta" style="margin-bottom:8px;font-weight:700">Your digits (3 to 6)</div>
          <input class="qinput big" inputMode="numeric" maxLength={6} placeholder="Enter your digits" value={v} onInput={(e) => { const c = e.currentTarget.value.replace(/\D/g, '').slice(0, 6); e.currentTarget.value = c; setV(c); setOut(null); }} />
          <div class="qseg" style="margin-top:12px">{[3, 4].map((k) => <button key={k} class={len === k ? 'on' : ''} onClick={() => { setLen(k); setOut(null); }}>{k} Digit box</button>)}</div>
          <button class="qbtn" disabled={v.length < len} onClick={gen}>Generate</button>
        </div>
        {out && out.length > 0 && <div class="card" style="margin:0 0 14px"><div class="band up">{out.length} numbers</div><div class="grid">{out.map((n) => <span key={n}>{n}</span>)}</div></div>}
      </div>
      <Disclaimer>A box lists every order of your digits. For fun only.</Disclaimer>
    </div>
  );
}

import { useState } from 'preact/hooks';
import { BackBar, Hero, ls, toast, Disclaimer } from '../ui.jsx';
import { fmtLong, istNow, dmy, parseDmy } from '../data/games.js';

// Vote Poll — same rules as nk-vote-poll: A/B/C digits, 1 vote per day, open 7:00 AM to 3:00 PM IST,
// results after you vote or after voting closes. Layout follows the Q Spot 4D poll.
// Vote totals are sample numbers until the poll is connected online (Firebase); your own vote is added on top.
const L = ['A', 'B', 'C'];
const ORD = ['1st digit', '2nd digit', '3rd digit'];
function baseCounts(date) {
  let s = parseDmy(date).getTime() / 864e5 % 233280;
  const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  return [0, 1, 2].map(() => Array.from({ length: 10 }, () => 3 + Math.floor(r() * 40)));
}
function tally(date, mine) {
  const c = baseCounts(date);
  if (mine) mine.forEach((d, i) => { c[i][d] += 1; });
  const total = c[0].reduce((a, b) => a + b, 0);
  const pct = c.map((row) => { const t = row.reduce((a, b) => a + b, 0); return row.map((x) => Math.round((x / t) * 1000) / 10); });
  return { total, pct, top: c.map((row) => row.indexOf(Math.max(...row))) };
}

function Results({ date, mine }) {
  const r = tally(date, mine);
  return (
    <div>
      <div class="meta" style="margin:0 2px 10px">{r.total} players voted · sample votes until online voting is live</div>
      <div class="qpollwin"><div class="meta" style="font-weight:700">Most picked number</div><div class="qpollmine">{r.top.map((d, i) => <span key={i}>{d}</span>)}</div><div class="meta" style="font-size:12px">Each box shows the digit most players picked in that place.</div></div>
      {L.map((x, i) => {
        const order = r.pct[i].map((p, d) => ({ p, d })).sort((a, b) => b.p - a.p); const max = order[0].p;
        const my = mine ? mine[i] : -1; const rank = order.findIndex((o) => o.d === my) + 1;
        return (
          <div key={x} class="qpollcard">
            <div class="qpollhead"><b>{x}</b><span class="meta">{ORD[i]}</span></div>
            {order.slice(0, 5).map((o, k) => <div key={o.d} class={'qprow' + (k === 0 ? ' top' : '') + (o.d === my ? ' mine' : '')}><span class="d">{o.d}</span><span class="tr"><span style={`width:${Math.max(6, (o.p / max) * 100)}%`} /></span><span class="pc">{o.p.toFixed(1)}%</span>{o.d === my && <em>You</em>}</div>)}
            {rank > 5 && <div class="meta" style="margin-top:6px">Your digit {my} is number {rank} here</div>}
          </div>
        );
      })}
    </div>
  );
}

export function Poll({ draws }) {
  const now = istNow(); const today = dmy(now); const h = now.getHours();
  const d = draws.find((x) => x.date === today) || draws[0];
  const phase = h < 7 ? 'before' : h < 15 ? 'open' : 'closed';
  const [mine, setMine] = useState(ls.get('nk_vote_' + today, null));
  const [vals, setVals] = useState([null, null, null]); const [act, setAct] = useState(0);
  const full = vals.every((v) => v != null);
  const press = (n) => { const v = vals.slice(); v[act] = n; setVals(v); const nx = v.findIndex((x) => x == null); setAct(nx < 0 ? Math.min(act + 1, 2) : nx); };
  const vote = () => { if (!full || mine || phase !== 'open') return; ls.set('nk_vote_' + today, vals); setMine(vals); toast('Your vote is counted'); };
  const yest = (() => { const y = parseDmy(today); y.setDate(y.getDate() - 1); return dmy(y); })();
  return (
    <div>
      <BackBar title="Voting Numbers" />
      <Hero draw={d} fmt={fmtLong} />
      <div class="qwrap">
        <div class="qpollstate"><b>{phase === 'open' ? (mine ? 'Voted ✓' : 'Voting is open') : phase === 'before' ? 'Voting opens at 7:00 AM' : 'Voting closed at 3:00 PM'}</b><span class="meta">1 vote per day · 7:00 AM to 3:00 PM</span></div>

        {phase === 'open' && !mine && (
          <div class="qpanel">
            <div class="meta" style="margin-bottom:8px;font-weight:700">Pick your 3 digits</div>
            <div class="qpollboxes">{L.map((x, i) => <button key={x} class={'qpbox' + (act === i ? ' on' : '')} onClick={() => setAct(i)}><small>{x}</small><b>{vals[i] == null ? '?' : vals[i]}</b></button>)}</div>
            <div class="qkeypad">{[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => <button key={n} class="qkey" onClick={() => press(n)}>{n}</button>)}</div>
            <div style="display:flex;gap:10px;margin-top:12px"><button class="qbtn ghost" style="flex:0 0 36%" onClick={() => { setVals([null, null, null]); setAct(0); }}>Clear</button><button class="qbtn" style="flex:1" disabled={!full} onClick={vote}>Vote</button></div>
          </div>
        )}
        {mine && <div class="qpanel"><div class="meta ctr">Your vote for today</div><div class="qpollmine">{mine.map((x, i) => <span key={i}>{x}</span>)}</div></div>}

        {(mine || phase === 'closed') && <div class="qpanel"><div style="font-weight:700;margin-bottom:8px">{phase === 'closed' ? "Today's final votes" : 'What players picked'}</div><Results date={today} mine={mine} /></div>}
        {phase === 'before' && <div class="qpanel"><div style="font-weight:700;margin-bottom:8px">Yesterday's final votes</div><Results date={yest} mine={ls.get('nk_vote_' + yest, null)} /></div>}
      </div>
      <Disclaimer>Fun community poll only. It does not decide any result and no win is guaranteed. 18+</Disclaimer>
    </div>
  );
}

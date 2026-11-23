import { useState } from 'preact/hooks';
import { BackBar, Hero, ls, toast, Disclaimer } from '../ui.jsx';
import { fmtLong, istNow, dmy, parseDmy } from '../data/games.js';

// Voting Numbers (nk-vote-poll idea): pick one digit for A, B, C · 1 vote a day · open from 12:00 AM to 2:00 PM IST
// (closes one hour before the result). Others' full results are shown after watching an ad.
// Vote totals are sample numbers until the poll is connected online (Firebase); your own vote is added on top.
const L = ['A', 'B', 'C'];
const CLOSE = 14 * 60;
function baseCounts(date) {
  let s = parseDmy(date).getTime() / 864e5 % 233280;
  const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  return [0, 1, 2].map(() => Array.from({ length: 10 }, () => 3 + Math.floor(r() * 40)));
}
function tally(date, mine) {
  const c = baseCounts(date);
  if (mine) mine.forEach((d, i) => { c[i][d] += 1; });
  const total = c[0].reduce((a, b) => a + b, 0);
  return { total, cols: c.map((row) => { const t = row.reduce((a, b) => a + b, 0); return row.map((x, d) => ({ d, p: Math.round((x / t) * 1000) / 10 })).sort((a, b) => b.p - a.p); }) };
}

function Picker({ vals, setVals }) {
  return (
    <div class="vpick">{L.map((x, i) => (
      <div key={x} class="vcol"><div class="abh">{x}</div>
        {Array.from({ length: 10 }, (_, d) => <button key={d} class={vals[i] === d ? 'vd on' : 'vd'} onClick={() => { const v = vals.slice(); v[i] = d; setVals(v); }}>{d}</button>)}
      </div>
    ))}</div>
  );
}
function Full({ date, mine }) {
  const r = tally(date, mine);
  return (
    <div>
      <div class="meta" style="margin:0 2px 10px">{r.total} players voted · sample votes until online voting is live</div>
      <div class="abc3" style="padding:0">{r.cols.map((col, i) => (
        <div key={i} class="abcol"><div class="abh">{L[i]}</div>
          {col.slice(0, 5).map((x, k) => <div key={x.d} class={'abr' + (k === 0 ? ' top' : '') + (mine && mine[i] === x.d ? ' me' : '')}><b>{x.d}</b><small>{x.p.toFixed(0)}%</small></div>)}
        </div>
      ))}</div>
      <div class="meta" style="font-size:12px;margin-top:8px">Top 5 digits most players picked for each place.</div>
    </div>
  );
}

export function Poll({ draws }) {
  const now = istNow(); const today = dmy(now); const mins = now.getHours() * 60 + now.getMinutes();
  const d = draws.find((x) => x.date === today) || draws[0];
  const open = mins < CLOSE;
  const [mine, setMine] = useState(ls.get('nk_vote_' + today, null));
  const [vals, setVals] = useState([null, null, null]);
  const [showMine, setShowMine] = useState(!!mine);
  const [full, setFull] = useState(ls.get('nk_vote_ad_' + today, false));
  const ready = vals.every((v) => v != null);
  const vote = () => { if (!ready || mine || !open) return; ls.set('nk_vote_' + today, vals); setMine(vals); setShowMine(true); toast('Your vote is saved'); };
  const watchAd = () => { toast('Ad finished · full results unlocked'); ls.set('nk_vote_ad_' + today, true); setFull(true); };
  return (
    <div>
      <BackBar title="Voting Numbers" />
      <Hero draw={d} fmt={fmtLong} small />
      <div class="qwrap">
        <div class="qpollstate"><b>{open ? (mine ? 'Voted ✓' : 'Voting is open') : 'Voting closed at 2:00 PM'}</b><span class="meta">1 vote per day · open until 2:00 PM</span></div>

        {open && !mine && (
          <div class="qpanel">
            <div style="font-weight:700;margin-bottom:10px">Pick one number in each of A, B, C</div>
            <Picker vals={vals} setVals={setVals} />
            <div class="vsel">Your pick: {vals.map((v, i) => <b key={i}>{v == null ? '–' : v}</b>)}</div>
            <button class="qbtn" disabled={!ready} onClick={vote}>Submit my vote</button>
          </div>
        )}

        {mine && !showMine && <button class="qbtn ghost" style="margin-bottom:10px" onClick={() => setShowMine(true)}>Preview my numbers</button>}
        {mine && showMine && <div class="qpanel"><div class="meta ctr">Your chosen numbers</div><div class="qpollmine">{mine.map((x, i) => <span key={i}>{x}</span>)}</div></div>}

        {(mine || !open) && (
          <div class="qpanel">
            <div style="font-weight:700;margin-bottom:8px">{open ? 'What other players picked' : "Today's final votes"}</div>
            {full ? <Full date={today} mine={mine} /> : (
              <div class="vlock"><span>🔒</span><b>See everyone's top picks</b><small>Watch a short ad to see the full results for A, B and C.</small><button class="qbtn" onClick={watchAd}>▶ Watch ad to see full results</button></div>
            )}
          </div>
        )}
      </div>
      <Disclaimer>Fun community poll only. It does not decide any result and no win is guaranteed. 18+</Disclaimer>
    </div>
  );
}

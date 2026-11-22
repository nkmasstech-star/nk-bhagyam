import { useState } from 'preact/hooks';
import { BackBar, Hero, ls, toast, Disclaimer } from '../ui.jsx';
import { fmtLong, istNow, dmy } from '../data/games.js';

// Sample vote shares until the Firebase poll is connected (same rules as nk-vote-poll)
const BASE = [[8, 14, 6, 10, 9, 12, 11, 15, 7, 8], [7, 9, 16, 8, 6, 10, 13, 9, 12, 10], [10, 7, 9, 14, 8, 11, 6, 15, 9, 11]];
const pct = (col, mine) => { const c = col.slice(); if (mine != null) c[mine] += 1; const s = c.reduce((a, b) => a + b, 0); return c.map((x) => Math.round((x * 100) / s)); };

export function Poll({ draws }) {
  const today = dmy(istNow()); const d = draws.find((x) => x.date === today) || draws[0];
  const h = istNow().getHours();
  const open = h >= 7 && h < 15;
  const [vote, setVote] = useState(ls.get('nk_vote_' + today, null));
  const [sel, setSel] = useState([null, null, null]);
  const submit = () => { if (sel.includes(null)) { toast('Pick one digit from each board'); return; } ls.set('nk_vote_' + today, sel); setVote(sel); toast('Your vote is counted'); };
  const show = vote || !open;
  const boards = BASE.map((col, c) => pct(col, vote ? vote[c] : null));
  return (
    <div>
      <BackBar title="Vote Poll" />
      <Hero draw={d} fmt={fmtLong} />
      {!open && <div class="tp">{boards.map((b, c) => <div key={c}><i>BOARD {'ABC'[c]}</i><b>{b.indexOf(Math.max(...b))}</b></div>)}</div>}
      <div class="card">
        <div class="vh"><b>{show ? (open ? "Today's votes" : 'Final votes') : 'Vote for your lucky digits'}</b><span style={!open ? 'background:rgba(255,255,255,.18);color:#fff' : ''}>{!open ? 'Closed 3:00 PM' : vote ? 'Voted ✓' : 'Open till 3:00 PM'}</span></div>
        <div class="v3">{[0, 1, 2].map((c) => (
          <div key={c}><div class="ch">{'ABC'[c]}</div>
            {show ? boards[c].map((v, dg) => { const top = boards[c].indexOf(Math.max(...boards[c])); return <div key={dg} class={`rw ${dg === top ? 'hi' : ''} ${vote && vote[c] === dg ? 'me' : ''}`}><em>{dg}</em><div class="br"><u style={`width:${v * 5}%`} /></div><small>{v}%</small></div>; })
              : <div class="dv">{Array.from({ length: 10 }, (_, dg) => <button key={dg} class={sel[c] === dg ? 's' : ''} onClick={() => { const s = sel.slice(); s[c] = dg; setSel(s); }}>{dg}</button>)}</div>}
          </div>))}</div>
        <div class="cnt" style="padding-bottom:12px">{show ? <>● Most chosen &nbsp; ○ Your pick</> : <>Pick one digit from each board</>}</div>
      </div>
      {!show && <button class="btn" onClick={submit}>Submit vote</button>}
      <div class="meta ctr" style="margin-top:10px">1 vote per day · Voting opens 7:00 AM, closes 3:00 PM</div>
      <Disclaimer>Fun community poll. Sample numbers for now. Not a prediction, no win is guaranteed.</Disclaimer>
    </div>
  );
}

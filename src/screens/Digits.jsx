import { BackBar, TopBar, Hero, Note, go, IconClock } from '../ui.jsx';
import { fmtLong, istNow, dmy } from '../data/games.js';
import { predFor } from '../data/predictions.js';

const todayDraw = (draws) => draws.find((d) => d.date === dmy(istNow())) || draws[0];

const Extra = () => (
  <div class="tiles" style="margin-top:14px">
    <button class="tile" onClick={() => go('/lucky')}><span class="ti">🎁</span><div><h3>Lucky Game Number</h3><p>Open boxes for your number</p></div></button>
    <button class="tile" onClick={() => go('/poll')}><span class="ti">🗳</span><div><h3>Vote Poll</h3><p>Vote A, B, C digits</p></div></button>
  </div>
);
const Head = ({ tab, title }) => (tab ? <><TopBar /><div class="pghead">{title}</div></> : <BackBar title={title} />);

export function ThreeDigit({ draws, tab }) {
  const d = todayDraw(draws); const p = predFor(dmy(istNow()));
  return (
    <div>
      <Head tab={tab} title="3 Digit Prediction" />
      <Hero draw={d} fmt={fmtLong} />
      <div class="card"><div class="band up">3 Digit Chart</div><div class="in">
        <div class="sq"><div class="cols">{p.cols.map((c, i) => <div key={i}><div class="ch">{'ABC'[i]}</div>{c.split('').map((x, r) => <div key={r} class="cl">{x}</div>)}</div>)}</div></div>
        <div class="hint">Pick one digit from each column</div>
      </div></div>
      <div class="card"><div class="band">All Board &amp; Box</div><div class="in"><div class="ab">
        <div><small>All Board</small><div class="v">{p.board[0]}<em>•</em>{p.board[1]}</div></div>
        <div><small>Box</small><div class="v">{p.box}</div></div>
      </div></div></div>
      <div class="card"><div class="band">3 Digit Predictions</div><div class="sub">Today's picks for the last 3 digits</div><div class="in"><div class="picks">{p.p3.map((x) => <b key={x}>{x}</b>)}</div></div><div class="res"><IconClock />Result at 3:07 PM. A match will be marked here.</div></div>
      <div class="card"><div class="band">4 Digit Predictions</div><div class="sub">Today's picks for the last 4 digits</div><div class="in"><div class="picks">{p.p4.map((x) => <b key={x}>{x}</b>)}</div></div><div class="res"><IconClock />Result at 3:07 PM. A match will be marked here.</div></div>
      <button class="row-link" onClick={() => go('/h3')}><div><b>History Predictions</b><small>Checked against the 1st prize last 3 &amp; 4 digits</small></div><span>›</span></button>
      <Note><b>Disclaimer</b> · This is a history-based probability suggestion to help you pick the <b>last 3 or 4 digits of the 1st prize</b>. It is <b>not 100% sure</b> and is for <b>entertainment purposes only</b>. We do not promote any online 3 or 4 digit game, betting or gambling. Please do not misuse it.</Note>
      {tab && <Extra />}
    </div>
  );
}

export function FourDigit({ draws, tab }) {
  const d = todayDraw(draws); const p = predFor(dmy(istNow()));
  return (
    <div>
      <Head tab={tab} title="4 Digit Prediction" />
      <Hero draw={d} fmt={fmtLong} />
      <Note><b>Disclaimer</b> · History-based probability suggestions for the <b>4 digit prizes (₹5,000 to ₹100)</b>. <b>Not 100% sure</b>, for <b>entertainment purposes only</b>. We do not promote any online game, betting or gambling.</Note>
      <div class="card"><div class="band">4 Digit Predictions</div><div class="sub">Today's picks · 12 numbers</div>
        <div class="grid">{p.list4.map((n) => <span key={n}>{n}</span>)}</div>
        <div class="res"><IconClock />Result at 3:07 PM. Winning numbers will be circled here.</div></div>
      <button class="row-link" onClick={() => go('/h4')}><div><b>History Predictions</b><small>Winning numbers circled</small></div><span>›</span></button>
      {tab && <Extra />}
    </div>
  );
}

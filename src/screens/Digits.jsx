import { BackBar, TopBar, Hero, Note, go, IconClock } from '../ui.jsx';
import { fmtLong, istNow, dmy } from '../data/games.js';
import { predFor } from '../data/predictions.js';

const todayDraw = (draws) => draws.find((d) => d.date === dmy(istNow())) || draws[0];

const Extra = () => (
  <div class="tiles" style="margin-top:14px">
    <button class="tile" onClick={() => go('/lucky')}><span class="ti">🎁</span><div><h3>Lucky Number Generator</h3><p>Open boxes for your number</p></div></button>
    <button class="tile" onClick={() => go('/poll')}><span class="ti">🗳</span><div><h3>Voting Numbers</h3><p>Vote A, B, C digits</p></div></button>
  </div>
);
const Head = ({ tab, title }) => (tab ? <><TopBar /><div class="pghead">{title}</div></> : <BackBar title={title} />);

// 3 Digit Guessing: poster-style cards in the NK Guessing order (date + draw, title banner, numbers), app colours
function Poster({ d, children }) {
  const [dd, mm, yy] = d ? d.date.split('-') : ['', '', ''];
  return (
    <div class="nkp">
      <div class="nkd"><b>{dd}/{mm}/{yy}</b><span>{d ? `${d.name} ${d.code.replace('-', ' ')}` : ''}</span></div>
      {children}
    </div>
  );
}
const Ttl = ({ children }) => <div class="nkt">{children}</div>;
const Nums = ({ list, sep = '.' }) => <div class="nkn">{list.map((x, i) => <b key={i}>{x}{i < list.length - 1 ? sep : ''}</b>)}</div>;

export function ThreeDigit({ draws }) {
  const d = todayDraw(draws); const p = predFor(dmy(istNow()));
  return (
    <div>
      <BackBar title="3 Digit Guessing" />
      <Poster d={d}>
        <Ttl>ABC Board Guessing</Ttl>
        <div class="nkabc"><div class="hd">{['A', 'B', 'C'].map((x) => <b key={x}>{x}</b>)}</div>
          <div class="bd">{[0, 1, 2].map((r) => p.cols.map((c, i) => <b key={r + '-' + i}>{c[r]}</b>))}</div></div>
      </Poster>
      <Poster d={d}>
        <Ttl>All Board</Ttl>
        <div class="nkn sm"><b>{p.board[0]}</b><i>--</i><b>{p.board[1]}</b></div>
        <Ttl>Box Number</Ttl>
        <div class="nkn"><b>{p.box}</b></div>
      </Poster>
      <Poster d={d}><Ttl>3 Digit Guessing</Ttl><Nums list={p.p3} /></Poster>
      <Poster d={d}><Ttl>BC Board Guessing</Ttl><Nums list={p.bc} /></Poster>
      <Poster d={d}><Ttl>4 Digit Guessing</Ttl><div class="w4"><Nums list={p.p4} /></div></Poster>
      <button class="row-link" onClick={() => go('/h3')}><div><b>History Predictions</b><small>Checked against the 1st prize last 3 &amp; 4 digits</small></div><span>›</span></button>
      <Note><b>Disclaimer</b> · This is a history-based probability suggestion to help you pick the <b>last 3 or 4 digits of the 1st prize</b>. It is <b>not 100% sure</b> and is for <b>entertainment purposes only</b>. We do not promote any online 3 or 4 digit game, betting or gambling. Please do not misuse it.</Note>
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

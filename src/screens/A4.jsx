import { BackBar, Note, go, Pen } from '../ui.jsx';
import { fmtShort, istNow, dmy } from '../data/games.js';
import { highFreq, repeated, formats, powerFor, powerMonths, monthName } from '../data/a4.js';
import { HubTile } from './NK.jsx';
import { IcBars, IcGrid3, IcBox, IcGift } from './icons2.jsx';

const L = ['A', 'B', 'C', 'D'];
const curKey = () => { const d = dmy(istNow()); return d.slice(6, 10) + '-' + d.slice(3, 5); };

export function A4Home() {
  return (
    <div>
      <BackBar title="4 Digit Analytics" />
      <div class="tiles" style="margin-top:4px">
        <HubTile to="/a4/hf" Ic={IcBars} h="High Frequency Numbers" />
        <HubTile to="/a4/rep" Ic={IcGrid3} h="Repeated Numbers" />
        <HubTile to="/a4/fmt" Ic={IcBox} h="Repeated Formats" />
        <HubTile to="/a4/power" Ic={IcGift} h="All Time Power Numbers" />
      </div>
    </div>
  );
}

export function A4High() {
  const h = highFreq();
  return (
    <div>
      <BackBar title="High Frequency Numbers" />
      <Note>This analysis uses only the <b>₹5,000 to ₹500</b> prizes · {h.draws} draws · {h.total} numbers.</Note>
      <div class="card"><div class="band">Top 5 digits in each place</div>
        <div class="a4cols">{h.cols.map((col, i) => (
          <div key={i}><div class="a4h">{L[i]}</div>{col.map((x, k) => <div key={x.d} class={k === 0 ? 'a4d top' : 'a4d'}><b>{x.d}</b><small>{x.v}×</small></div>)}</div>
        ))}</div>
      </div>
    </div>
  );
}

export function A4Repeated() {
  const list = repeated(10);
  return (
    <div>
      <BackBar title="Repeated Numbers" />
      <Note>Straight numbers that came most often in the <b>₹5,000 to ₹500</b> prizes.</Note>
      <div class="card"><div class="band">Most repeated · top 10</div>
        {list.length ? <div class="a4rep">{list.map((x, i) => <div key={x.num}><span class="rk">{i + 1}</span><b>{x.num}</b><em>{x.c} times</em></div>)}</div> : <div class="empty">No number has repeated yet.</div>}
      </div>
    </div>
  );
}

export function A4Formats() {
  const f = formats();
  return (
    <div>
      <BackBar title="Repeated Formats" />
      <Note>How often each number shape came in the <b>₹5,000 to ₹500</b> prizes. Same letter = same digit. Example: <b>5561</b> is AABC (double at the start), <b>5551</b> is AAAB (triple).</Note>
      <div class="card"><div class="band">Formats · most to least</div>
        <div class="a4fmt">{f.list.map((x) => (
          <div key={x.p}><span class="pt">{x.p}</span><span class="nm"><b>{x.kind}</b><small>e.g. {x.ex}</small></span><span class="br"><i style={`width:${Math.max(4, x.pct)}%`} /></span><em>{x.pct.toFixed(1)}%</em></div>
        ))}</div>
      </div>
    </div>
  );
}

function PowerGrid({ p }) {
  return <div class="a4pw">{p.nums.map((x, i) => <span key={x.num} class={x.hit ? 'hit' : ''}>{x.num}{x.hit && <Pen k={i % 3} />}</span>)}</div>;
}
export function A4Power({ month }) {
  const k = month || curKey();
  const p = powerFor(k);
  const hits = p.nums.filter((x) => x.hit);
  const past = powerMonths().filter((m) => m < curKey());
  return (
    <div>
      <BackBar title={month ? `Power Numbers · ${monthName(k)}` : 'All Time Power Numbers'} />
      <Note>The 30 straight numbers that came most often in the <b>₹5,000 to ₹100</b> prizes in all our data. A fresh set is made at the start of every month. Numbers that come again this month are circled.</Note>
      <div class="card"><div class="band">{monthName(k)} · {hits.length} hit{hits.length === 1 ? '' : 's'}</div>
        {p.nums.length ? <PowerGrid p={p} /> : <div class="empty">Not enough data before this month.</div>}
        {hits.length > 0 && <div class="a4hits">{hits.map((x) => <span key={x.num}><b>{x.num}</b> {x.hit.prize} · {fmtShort(x.hit.date)}</span>)}</div>}
      </div>
      {!month && (
        <>
          <div class="sec"><b>History Power Numbers</b></div>
          {past.length ? past.map((m) => { const q = powerFor(m); const h = q.nums.filter((x) => x.hit).length; return <button key={m} class="row-link" onClick={() => go('/a4/power/' + m)}><div><b>{monthName(m)}</b><small>{q.nums.length ? `${h} of ${q.nums.length} numbers hit` : 'Not enough data'}</small></div><span>›</span></button>; }) : <div class="empty">History appears after the first month.</div>}
        </>
      )}
    </div>
  );
}

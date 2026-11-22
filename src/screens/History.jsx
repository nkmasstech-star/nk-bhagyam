import { BackBar, go, Pen, PenWide, Confetti, Disclaimer } from '../ui.jsx';
import { fmtLong, dayNum, monShort, inr, istNow, dmy } from '../data/games.js';
import { predForHistory, check3, check4, resultOrSample } from '../data/predictions.js';

const past = (draws) => draws.filter((d) => d.date !== dmy(istNow())).slice(0, 30);
const Dg = ({ ch, on, k }) => <span class="dg">{ch}{on && <Pen k={k} />}</span>;

function List({ draws, base, winOf, sub }) {
  return (
    <div>
      <BackBar title="History Predictions" />
      <div class="meta" style="padding:0 20px 12px">{sub}</div>
      {past(draws).map((d) => {
        const w = winOf(d);
        return (
          <button key={d.date} class="li" onClick={() => go(`${base}/${d.date}`)}>
            <div class="d">{dayNum(d.date)}<small>{monShort(d.date)}</small></div>
            <div class="n"><b>{d.name} {d.code}</b><span>{fmtLong(d.date)}</span></div>
            {w && <span class="wn">🎉 WIN<small>{w}</small></span>}
            <span style="color:var(--gold2);font-size:20px">›</span>
          </button>
        );
      })}
    </div>
  );
}
function DayHead({ d, res, tags }) {
  const t = res.first ? res.first.ticket : '';
  return (
    <div class="dh">
      <div class="t">{d.name} <span>{d.code}</span></div>
      <div class="dt">{fmtLong(d.date)}</div>
      {t && <div class="fp"><span>1st Prize</span><strong>{t.slice(0, -4)}<em>{t.slice(-4)}</em></strong></div>}
      {tags && <><div class="win"><em>🎉</em><div>{tags.title}<small>{tags.sub}</small></div><em style="margin-left:auto">🏆</em></div><Confetti /></>}
    </div>
  );
}

// ---------- 3 digit (1st prize) ----------
const c3 = (d) => { const r = resultOrSample(d); const p = predForHistory(d, r); return { r, p, c: r.first ? check3(p, r.first.ticket) : null }; };
export function History3({ draws }) {
  return <List draws={draws} base="/h3" sub="Last 30 days · tap a day to see matches" winOf={(d) => { const { c } = c3(d); return c && c.win ? c.tags.slice(0, 2).join(' · ') : null; }} />;
}
export function History3Day({ draws, date }) {
  const d = draws.find((x) => x.date === date); if (!d) return <BackBar title="History" />;
  const { r, p, c } = c3(d);
  if (!c) return <div><BackBar title={`${d.name} ${d.code}`} /><DayHead d={d} res={r} /><div class="empty">Result not available yet.</div></div>;
  return (
    <div>
      <BackBar title={`${d.name} ${d.code}`} />
      <DayHead d={d} res={r} tags={c.win ? { title: 'You got a match!', sub: c.tags.join(' · ') } : null} />
      {c.chart.length > 0 && (
        <div class="card"><div class="band up">3 Digit Chart</div><div class="in">
          <div class="sq"><div class="cols">{p.cols.map((col, i) => <div key={i}><div class="ch">{'ABC'[i]}</div>{col.split('').map((x, rr) => <div key={rr} class="cl">{x}{c.chart.includes(i) && x === c.res[i] && <Pen k={i + rr} />}</div>)}</div>)}</div></div>
          <div class="msg">Matched in {c.chart.map((i) => <span key={i} class="pill">{'ABC'[i]}</span>)}</div>
        </div></div>
      )}
      {(c.boardWin || c.boxWin) && (
        <div class="card"><div class="band">All Board &amp; Box</div><div class="in">
          <div class="meta ctr" style="margin-bottom:10px">Last 3 digits came: <b class="h" style="letter-spacing:2px;color:var(--ink)">{c.res}</b></div>
          <div class="ab">
            <div><small>All Board</small>{c.boardPos.map((b, i) => <span key={i}>{i > 0 && <span style="color:var(--gold);margin:0 3px">•</span>}<Dg ch={b.d} on={b.pos.length > 0} k={i} /></span>)}<div class="m">{c.boardWin ? c.boardPos.filter((b) => b.pos.length).map((b) => <span key={b.d}>{b.d} in <span class="pill">{b.pos.join('')}</span> </span>) : 'No match'}</div></div>
            <div><small>Box</small>{p.box.split('').map((x, i) => <Dg key={i} ch={x} on={c.boxWin && c.res.includes(x)} k={i + 3} />)}<div class="m">{c.boxWin ? <>Matched <span class="pill">{c.boxPos.map((j) => 'ABC'[j]).join('')}</span></> : 'No match'}</div></div>
          </div>
        </div></div>
      )}
      {c.p3.some((x) => x.tag) && <div class="card"><div class="band">3 Digit Predictions</div>{c.p3.map((x, i) => <div key={i} class="pr"><div>{x.x.split('').map((ch, j) => <Dg key={j} ch={ch} on={x.circ.includes(j)} k={j + i} />)}</div>{x.tag ? <span class="tg">{x.tag}</span> : <span class="nm">No match</span>}</div>)}</div>}
      {c.p4.some((x) => x.tag) && <div class="card"><div class="band">4 Digit Predictions</div>{c.p4.map((x, i) => <div key={i} class="pr"><div>{x.x.split('').map((ch, j) => <Dg key={j} ch={ch} on={x.circ.includes(j)} k={j + i} />)}</div>{x.tag ? <span class="tg">{x.tag}</span> : <span class="nm">No match</span>}</div>)}</div>}
      {!c.win && <div class="empty">No match on this day.</div>}
      <Disclaimer>Marked digits matched the 1st prize. For entertainment only.</Disclaimer>
    </div>
  );
}

// ---------- 4 digit (₹5,000 and below) ----------
const c4 = (d) => { const r = resultOrSample(d); const p = predForHistory(d, r); return { r, p, hits: check4(p.list4, r) }; };
export function History4({ draws }) {
  return <List draws={draws} base="/h4" sub="4 Digit · last 30 days · tap a day to see matches" winOf={(d) => { const { hits } = c4(d); return hits.length ? [...new Set(hits.map((h) => inr(h.amt)))].join(' · ') : null; }} />;
}
export function History4Day({ draws, date }) {
  const d = draws.find((x) => x.date === date); if (!d) return <BackBar title="History" />;
  const { r, p, hits } = c4(d);
  const set = new Set(hits.map((h) => h.n));
  return (
    <div>
      <BackBar title={`${d.name} ${d.code}`} />
      <DayHead d={d} res={{}} tags={hits.length ? { title: `${hits.length} number${hits.length > 1 ? 's' : ''} matched!`, sub: [...new Set(hits.map((h) => inr(h.amt)))].join(' · ') } : null} />
      <div class="card"><div class="band">4 Digit Predictions</div>
        <div class="grid">{p.list4.map((n, i) => <span key={n}>{n}{set.has(n) && <PenWide k={i} />}</span>)}</div>
        {hits.map((h) => <div key={h.n + h.label} class="wr"><b>{h.n}<i>came in</i></b><span class="tg">{h.label} Prize · {inr(h.amt || 0)}</span></div>)}
      </div>
      {!hits.length && <div class="empty">No match on this day.</div>}
      <Disclaimer>Circled numbers matched a 4 digit prize (straight match only). For entertainment only.</Disclaimer>
      {void r}
    </div>
  );
}

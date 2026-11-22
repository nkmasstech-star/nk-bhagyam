import { useState, useEffect } from 'preact/hooks';
import { TopBar, go } from '../ui.jsx';
import { dayNum, monShort, fmtShort, istNow, dmy, RESULT_AT } from '../data/games.js';
import { predFor } from '../data/predictions.js';

export function Home({ draws, ready, sample }) {
  const today = dmy(istNow());
  const t = draws[0];
  const p = predFor(today);
  const slides = [
    { cls: 'dk', k: "Today's draw", title: t ? `${t.name} ${t.code}` : 'Today', body: <div class="chips"><b>Result live at {RESULT_AT}</b></div>, to: t && `/result/${t.date}` },
    { cls: '', k: '3 Digit Predictions', title: 'Last 3 digits · today', body: <div class="chips">{p.p3.map((x) => <b key={x}>{x}</b>)}</div>, to: '/p3' },
    { cls: 'dk', k: '4 Digit Predictions', title: '₹5,000 to ₹100 prizes', body: <div class="chips">{p.list4.slice(0, 4).map((x) => <b key={x}>{x}</b>)}<b>+8</b></div>, to: '/p4' },
    { cls: '', k: 'Lucky Game', title: 'Open the mystery boxes', body: <div class="chips"><b>🎁 Play now</b></div>, to: '/lucky' },
  ];
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((x) => (x + 1) % slides.length), 4000); return () => clearInterval(id); }, []);
  return (
    <div>
      <TopBar />
      <div class="slider">
        {slides.map((s, k) => (
          <button key={k} class={`slide ${s.cls} ${k === i ? 'on' : ''}`} onClick={() => s.to && go(s.to)} style="text-align:left;width:100%">
            <small>{s.k}</small><div class="t">{s.title}</div>{s.body}
          </button>
        ))}
        <div class="dots">{slides.map((_, k) => <i key={k} class={k === i ? 'on' : ''} />)}</div>
      </div>
      <div class="sec"><b>Latest Results</b><span>{sample ? 'Sample data' : 'Last 30 days'}</span></div>
      {!ready && <div class="empty">Loading…</div>}
      <div class="rc">
        {draws.map((d, k) => {
          const isToday = d.date === today;
          return (
            <button key={d.date} class={isToday ? 'rcard today' : 'rcard'} onClick={() => go('/result/' + d.date)}>
              <div class="top"><span class="mono">{d.code.split('-')[0]}</span>{isToday ? <span class="tag">TODAY</span> : k === 1 ? <span class="tag">NEW</span> : null}</div>
              <div><div class="nm">{d.name}</div><div class="meta"><span>{isToday ? `Live ${RESULT_AT}` : fmtShort(d.date)}</span><span class="ser" style={isToday ? 'background:rgba(255,255,255,.15);color:#fff' : ''}>{d.code}</span></div></div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

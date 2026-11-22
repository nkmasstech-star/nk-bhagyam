import { useState, useEffect } from 'preact/hooks';
import { TopBar, go } from '../ui.jsx';
import { fmtLong, istNow, dmy, RESULT_AT, istMinutes, LIVE_START, LIVE_END } from '../data/games.js';
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
  return (
    <div>
      <TopBar />
      <div class="sec"><b>Latest Results</b><span>{sample ? 'Sample data' : `${draws.length} draws`}</span></div>
      {!ready && <div class="empty">Loading…</div>}
      <div class="rc">
        {draws.map((d, k) => {
          const isToday = d.date === today;
          const m = istMinutes();
          // small tag only: today → TODAY (before draw) / LIVE (draw time) / NEW (after); yesterday → NEW until today's draw starts
          let tag = null;
          if (isToday) tag = m < LIVE_START ? <span class="tag td">TODAY</span> : m <= LIVE_END ? <span class="tag lv">LIVE</span> : <span class="tag nw">NEW</span>;
          else if (k === 1 && m < LIVE_START) tag = <span class="tag nw">NEW</span>;
          return (
            <button key={d.date} class="rcard" onClick={() => go('/result/' + d.date)}>
              <div class="top"><span class="dchip">{fmtLong(d.date).replace(/^(\w{3})\w*,/, '$1,')}</span>{tag}</div>
              <div class="nm">{d.name}</div>
              <div class="meta"><span class="code">{d.code}</span>{isToday && m < LIVE_START && <span>Live {RESULT_AT}</span>}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

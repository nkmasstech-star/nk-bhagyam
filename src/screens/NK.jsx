import { useState } from 'preact/hooks';
import { TopBar, BackBar, Hero, Disclaimer, go } from '../ui.jsx';
import { fmtShort, fmtLong, istNow, dmy } from '../data/games.js';
import { firstPrizeTail } from '../data/results.js';

const CARDS = [
  ['/p3', '3D', '3 Digit Guessing', 'ABC board, all board, box & picks', 'r'],
  ['/freq', '📊', 'Result Frequency', 'Most common digits in the 1st prize', ''],
  ['/monthly', '🗓', 'Monthly Chart', '1st prize of the last 30 draws', ''],
  ['/box', '🎲', 'Box Creator', 'Make every order of your digits', ''],
  ['/poll', '🗳', 'Voting Numbers', 'Vote A, B, C digits', ''],
  ['/lucky', '🎁', 'Lucky Number Generator', 'Open boxes for your number', ''],
];

// NK tab: hub of cards
export function NKHome({ draws }) {
  const t = draws.find((d) => d.date === dmy(istNow())) || draws[0];
  return (
    <div>
      <TopBar />
      <div style="padding:0 20px 12px"><div class="h" style="font-size:22px;font-weight:700">NK</div><div class="meta">Today · {t ? `${t.name} ${t.code}` : ''} · Draw 3:00 PM</div></div>
      <div class="tiles">
        {CARDS.map(([to, ic, h, p, cls]) => <button key={to} class={'tile ' + cls} onClick={() => go(to)}><span class="ti">{ic}</span><div><h3>{h}</h3><p>{p}</p></div></button>)}
      </div>
      <div class="ad" style="margin-top:16px">Native ad space</div>
    </div>
  );
}

const freqOf = (draws) => {
  const rows = firstPrizeTail(draws.slice(1), 30);
  const cnt = Array(10).fill(0); rows.forEach((x) => x.tail.split('').forEach((c) => { cnt[+c] += 1; }));
  const pos = [0, 1, 2, 3].map((i) => { const c = Array(10).fill(0); rows.forEach((x) => { c[+x.tail[i]] += 1; }); return c; });
  return { rows, cnt, pos };
};

export function Frequency({ draws }) {
  const { rows, cnt, pos } = freqOf(draws);
  const order = cnt.map((c, d) => [d, c]).sort((a, b) => b[1] - a[1] || a[0] - b[0]);
  const rank = {}; order.forEach(([d], i) => { rank[d] = i; });
  const t = draws[0];
  return (
    <div>
      <BackBar title="Result Frequency" />
      <Hero draw={t} fmt={fmtLong} />
      <div class="card"><div class="band up">1st Prize Last 4 · Digit Count</div>
        <div class="fq">{Array.from({ length: 10 }, (_, d) => <div key={d} class={rank[d] < 4 ? 'g' : rank[d] < 7 ? 'y' : 'r'}>{d}<small>{cnt[d]}×</small></div>)}</div>
        <div class="cnt">🟩 Top 4 &nbsp; 🟨 Next 3 &nbsp; 🟥 Last 3 · last {rows.length} draws</div>
      </div>
      <div class="card"><div class="band up">Best Digit by Place</div>
        <table class="tbl"><thead><tr><th>Place</th><th>1st</th><th>2nd</th><th>3rd</th></tr></thead>
          <tbody>{['Thousands', 'A', 'B', 'C'].map((L, i) => { const o = pos[i].map((c, d) => [d, c]).sort((a, b) => b[1] - a[1]); return <tr key={L}><td>{L}</td>{o.slice(0, 3).map(([d, c]) => <td key={d}><b>{d}</b> <small>{c}×</small></td>)}</tr>; })}</tbody></table>
      </div>
      <Disclaimer>Counts from past results only. They do not predict the next draw.</Disclaimer>
    </div>
  );
}

export function Monthly({ draws }) {
  const rows = firstPrizeTail(draws.slice(1), 30);
  return (
    <div>
      <BackBar title="Monthly Chart" />
      <div class="card"><div class="band up">1st Prize · Last 30 Draws</div>
        <table class="tbl"><thead><tr><th>Date</th><th>Draw</th><th>1st Prize</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.date} onClick={() => go('/result/' + r.date)}><td>{fmtShort(r.date).slice(0, -5)}</td><td>{r.code}</td><td><b>{r.ticket.slice(0, -4)}<em>{r.tail}</em></b></td></tr>)}</tbody></table>
      </div>
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
  const [v, setV] = useState(''); const [len, setLen] = useState(3);
  const digits = v.split('');
  const list = digits.length >= len ? perms(digits, len) : [];
  return (
    <div>
      <BackBar title="Box Creator" />
      <div class="qwrap" style="margin-top:6px">
        <div class="qpanel">
          <div class="meta" style="margin-bottom:8px;font-weight:700">Your digits (3 to 6)</div>
          <input class="qinput big" inputMode="numeric" maxLength={6} placeholder="056" value={v} onInput={(e) => { const c = e.currentTarget.value.replace(/\D/g, '').slice(0, 6); e.currentTarget.value = c; setV(c); }} />
          <div class="qseg" style="margin-top:12px">{[3, 4].map((k) => <button key={k} class={len === k ? 'on' : ''} onClick={() => setLen(k)}>{k} Digit box</button>)}</div>
        </div>
        {list.length > 0 && <div class="card" style="margin:0 0 14px"><div class="band up">{list.length} numbers</div><div class="grid">{list.map((n) => <span key={n}>{n}</span>)}</div></div>}
        {v && list.length === 0 && <div class="meta ctr">Type at least {len} digits.</div>}
      </div>
      <Disclaimer>A box lists every order of your digits. For fun only.</Disclaimer>
    </div>
  );
}

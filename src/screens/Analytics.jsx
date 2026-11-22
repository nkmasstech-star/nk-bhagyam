import { useState } from 'preact/hooks';
import { TopBar, go, IconSearch } from '../ui.jsx';
import { fmtShort } from '../data/games.js';
import { firstPrizeTail } from '../data/results.js';
import { resultOrSample } from '../data/predictions.js';

export function Analytics({ draws }) {
  const rows = firstPrizeTail(draws.slice(1), 30);
  const cnt = Array(10).fill(0); rows.forEach((x) => x.tail.split('').forEach((c) => { cnt[+c] += 1; }));
  const order = cnt.map((c, d) => [d, c]).sort((a, b) => b[1] - a[1] || a[0] - b[0]);
  const rank = {}; order.forEach(([d], i) => { rank[d] = i; });
  const [q, setQ] = useState(''); const [hits, setHits] = useState(null);
  const search = () => {
    const s = q.replace(/\D/g, ''); if (s.length < 3) { setHits([]); return; }
    const out = [];
    draws.slice(1, 31).forEach((d) => { const r = resultOrSample(d); if (r.first && r.first.ticket.endsWith(s)) out.push({ d, where: '1st Prize' }); (r.lower || []).forEach((p) => { if (p.list.some((n) => n.endsWith(s.slice(-4)) && s.length >= 4 ? n === s.slice(-4) : n.endsWith(s))) out.push({ d, where: `${p.label} Prize` }); }); });
    setHits(out);
  };
  return (
    <div>
      <TopBar />
      <div style="padding:0 20px 12px"><div class="h" style="font-size:22px;font-weight:700">Analytics</div><div class="meta">Last 30 draws · sample data for now</div></div>
      <div class="search"><input inputMode="numeric" maxLength={6} placeholder="Search number e.g. 4365" value={q} onInput={(e) => setQ(e.currentTarget.value)} onKeyDown={(e) => e.key === 'Enter' && search()} /><button onClick={search} aria-label="Search"><IconSearch /></button></div>
      {hits && <div class="card"><div class="band dk">Search result · {q}</div>{hits.length ? hits.map((h, i) => <button key={i} class="lr" onClick={() => go('/result/' + h.d.date)}><b>{h.d.name} {h.d.code}</b><small>{h.where} · {fmtShort(h.d.date)}</small><span>›</span></button>) : <div class="empty">Not found in the last 30 draws</div>}</div>}
      <div class="card"><div class="band">1st Prize Last 4 · Digit Count</div>
        <div class="fq">{Array.from({ length: 10 }, (_, d) => <div key={d} class={rank[d] < 4 ? 'g' : rank[d] < 7 ? 'y' : 'r'}>{d}<small>{cnt[d]}×</small></div>)}</div>
        <div class="cnt">🟩 Top 4 &nbsp; 🟨 Next 3 &nbsp; 🟥 Last 3</div>
      </div>
      <div class="card"><div class="band dk">Monthly Result Chart</div>
        <table class="tbl"><thead><tr><th>Date</th><th>Draw</th><th>1st Prize</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.date}><td>{fmtShort(r.date).slice(0, -5)}</td><td>{r.code}</td><td><b>{r.ticket.slice(0, -4)}<em>{r.tail}</em></b></td></tr>)}</tbody></table>
      </div>
    </div>
  );
}

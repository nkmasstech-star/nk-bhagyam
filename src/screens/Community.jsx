import { TopBar, toast } from '../ui.jsx';
// Community: sample posts for now (real posting with login comes later, like Q Spot 4D)
const POSTS = [
  { n: 'Rajesh K', a: 'R', t: '2h', g: 'Samrudhi SM-82', p: ['365', '4217'], l: 24 },
  { n: 'Anitha', a: 'A', t: '3h', g: 'Samrudhi SM-82', p: ['908', '7425'], l: 17 },
  { n: 'Suresh', a: 'S', t: '5h', g: 'Karunya KR-777', p: ['121', '3650'], l: 41 },
];
export function Community() {
  return (
    <div>
      <TopBar />
      <div style="padding:0 20px 12px"><div class="h" style="font-size:22px;font-weight:700">Community</div><div class="meta">Share your numbers · sample posts for now</div></div>
      {POSTS.map((x) => (
        <div key={x.n} class="card"><div class="in">
          <div style="display:flex;align-items:center;gap:10px"><span class="av" style="width:38px;height:38px;border-radius:12px;font-size:15px">{x.a}</span><div style="flex:1"><b>{x.n}</b><div class="meta">{x.g} · {x.t}</div></div></div>
          <div class="picks" style="justify-content:flex-start;margin-top:12px">{x.p.map((n) => <b key={n}>{n}</b>)}</div>
          <div class="meta" style="margin-top:10px;display:flex;gap:16px"><button onClick={() => toast('Login coming soon')}>♡ {x.l}</button><button onClick={() => toast('Login coming soon')}>↗ Share</button></div>
        </div></div>
      ))}
      <div class="disc">Community posting with login will be added later. For entertainment only.</div>
    </div>
  );
}

import { BackBar, go } from '../ui.jsx';
import { istNow, dmy } from '../data/games.js';

export function Predictions({ draws }) {
  const t = draws.find((d) => d.date === dmy(istNow())) || draws[0];
  return (
    <div>
      <BackBar title="Predictions" />
      <div style="padding:0 20px 12px"><div class="h" style="font-size:22px;font-weight:700">Predictions</div><div class="meta">Today · {t ? `${t.name} ${t.code}` : ''} · Draw 3:00 PM</div></div>
      <div class="tiles">
        <button class="tile r" onClick={() => go('/p3')}><span class="chip">READY</span><span class="ti">3D</span><div><h3>3 Digit Prediction</h3><p>Chart, board, box and today's picks</p></div></button>
        <button class="tile d" onClick={() => go('/p4')}><span class="chip">READY</span><span class="ti" style="color:var(--gold)">4D</span><div><h3>4 Digit Prediction</h3><p>₹5,000 to ₹100 prizes</p></div></button>
        <button class="tile" onClick={() => go('/lucky')}><span class="ti">🎁</span><div><h3>Lucky Game Number</h3><p>Open boxes for your number</p></div></button>
        <button class="tile" onClick={() => go('/poll')}><span class="chip" style="background:var(--red);color:#fff">LIVE</span><span class="ti">🗳</span><div><h3>Vote Poll</h3><p>Vote A, B, C digits</p></div></button>
      </div>
      <div class="ad" style="margin-top:16px">Native ad space</div>
    </div>
  );
}

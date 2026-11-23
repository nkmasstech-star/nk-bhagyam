import { useState, useRef } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import { BackBar, Hero, ls, toast, Disclaimer, useBackClose } from '../ui.jsx';
import { fmtLong, istNow, dmy } from '../data/games.js';
import { firstPrizeTail } from '../data/results.js';
import { top6For } from '../data/hist.js';

// ---- small synthesized sounds ----
let AC = null;
const ac = () => { try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) { /* ignore */ } return AC; };
function tone(f, dur, g, type, when) { const a = ac(); if (!a) return; const t0 = a.currentTime + (when || 0); const o = a.createOscillator(); o.type = type || 'sine'; o.frequency.value = f; const gn = a.createGain(); gn.gain.setValueAtTime(g, t0); gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); o.connect(gn); gn.connect(a.destination); o.start(t0); o.stop(t0 + dur + 0.02); }
const SND = { shake: () => tone(180, 0.2, 0.12, 'square'), open: (k) => { tone(520 + k * 140, 0.35, 0.2, 'triangle'); tone(1040 + k * 280, 0.4, 0.1, 'sine', 0.05); }, done: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.35, 0.18, 'triangle', i * 0.11)) };
const COLORS = ['#E53935', '#FB8C00', '#F9A825', '#43A047', '#00ACC1', '#1E88E5', '#5E35B1', '#D81B60', '#6D4C41', '#546E7A', '#8E24AA', '#00897B'];
const shuffle = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

// Nehru's rule: top 7 digits (0-9) by frequency in the last 30 draws' 1st-prize last 4 digits
export function top7(draws) {
  const cnt = Array(10).fill(0);
  firstPrizeTail(draws, 30).forEach((x) => x.tail.split('').forEach((c) => { cnt[+c] += 1; }));
  return cnt.map((c, d) => [d, c]).sort((a, b) => b[1] - a[1] || a[0] - b[0]).slice(0, 7).map(([d]) => d);
}
// 7 boxes get the 7 digits, the other 5 boxes get random picks from those same 7, then all 12 are shuffled
const fillBoxes = (t) => shuffle([...t, ...Array.from({ length: 12 - t.length }, () => t[Math.floor(Math.random() * t.length)])]);

function Boxes({ n, t7, onDone, onClose }) {
  useBackClose(onClose);
  const [phase, setPhase] = useState('intro');
  const [digs, setDigs] = useState([]); const [opened, setOpened] = useState([]); const [shk, setShk] = useState(-1);
  const busy = useRef(false);
  const [sound, setSound] = useState(ls.get('nk_sound', true));
  const play = (k, a) => sound && SND[k](a);
  const start = () => { ac(); setDigs(fillBoxes(t7)); setOpened([]); setPhase('play'); };
  const pick = (i) => {
    if (busy.current || opened.includes(i) || opened.length >= n) return;
    busy.current = true; setShk(i); play('shake');
    setTimeout(() => { setShk(-1); const nx = [...opened, i]; setOpened(nx); play('open', nx.length);
      setTimeout(() => { busy.current = false; if (nx.length >= n) { play('done'); setTimeout(() => setPhase('over'), 700); } }, 450); }, 520);
  };
  const num = opened.map((i) => digs[i]).join('');
  return createPortal(
    <div class="game">
      <button class="x snd" style="position:absolute" onClick={() => { setSound(!sound); ls.set('nk_sound', !sound); }}>{sound ? '🔊' : '🔇'}</button>
      <button class="x" onClick={onClose}>×</button>
      <div class="mbt">Pick {n} boxes<small>Tap a box to open it</small></div>
      <div class="slots">{Array.from({ length: n }, (_, k) => <span key={k} class={k < opened.length ? 'on' : ''}>{k < opened.length ? digs[opened[k]] : '?'}</span>)}</div>
      <div class="boxes">{Array.from({ length: 12 }, (_, i) => (
        <button key={i} class={`bx ${opened.includes(i) ? 'op' : ''} ${shk === i ? 'shake' : ''}`} style={`--c:${COLORS[i]}`} onClick={() => phase === 'play' && pick(i)}>
          <div class="ld" /><div class="bd"><b>{opened.includes(i) ? digs[i] : '?'}</b></div>
        </button>))}</div>
      {phase === 'intro' && <div class="ov"><div class="ovc"><div class="em">🎁</div><h3>Mystery Boxes</h3><div class="hw"><div>🎁 12 mystery boxes hide the digits</div><div>👆 Tap {n} boxes to open them</div><div>✨ The digits you open become your lucky number</div></div><button class="btn" onClick={start}>Start</button></div></div>}
      {phase === 'over' && <div class="ov"><div class="ovc"><h3>Your lucky number</h3><div class="bigv">{num}</div><div class="meta">{n} Digit</div><button class="btn" onClick={() => onDone(num)}>Use this number</button></div></div>}
    </div>, document.body);
}

export function Lucky({ draws, n4 }) {
  const today = dmy(istNow()); const d = draws.find((x) => x.date === today) || draws[0];
  const [n, setN] = useState(n4 ? 4 : 3);
  const [num, setNum] = useState(null); const [saved, setSaved] = useState(false); const [playing, setPlaying] = useState(false);
  const [list, setList] = useState(ls.get('nk_lucky', []));
  const [, bump] = useState(0);
  // NK page: 3 free plays a day. 4D page (4 digit only): 1 free set, then watch an ad to unlock 2 more (3 sets a day max).
  const key = n4 ? 'nk_plays4_' : 'nk_plays_';
  const used = ls.get(key + today, 0); const unlocked = ls.get('nk_ad4_' + today, false);
  const limit = n4 ? (unlocked ? 3 : 1) : 3; const left = Math.max(0, limit - used);
  const needAd = n4 && !unlocked && used >= 1;
  const watchAd = () => { toast('Ad finished · 2 more sets unlocked'); ls.set('nk_ad4_' + today, true); bump((x) => x + 1); };
  const open = () => { if (needAd) { watchAd(); return; } if (left <= 0) { toast(n4 ? 'You have used all 3 sets today. Come back tomorrow.' : 'No free plays left today. Come back tomorrow.'); return; } setPlaying(true); };
  const done = (v) => { ls.set(key + today, used + 1); setPlaying(false); setNum(v); setSaved(false); };
  const save = () => { const l = [{ n: num, g: d ? `${d.name} ${d.code}` : '', at: Date.now() }, ...list].slice(0, 30); ls.set('nk_lucky', l); setList(l); setSaved(true); toast('Saved to your profile'); };
  const del = (at) => { const l = list.filter((x) => x.at !== at); ls.set('nk_lucky', l); setList(l); };
  const digits = n4 ? top6For(today) : top7(draws);
  return (
    <div>
      <BackBar title="Lucky Number Generator" />
      <Hero draw={d} fmt={fmtLong} small />
      {!n4 && <div class="lab">1. Choose your digits</div>}
      {!n4 && <div class="ch2">{[3, 4].map((k) => <button key={k} class={n === k ? 'on' : ''} onClick={() => { setN(k); setNum(null); }}>{k} Digit<small>last {k} of 1st prize</small></button>)}</div>}
      {n4 && <div class="l4note">🎯 4 digit lucky number · applies to the <b>₹5,000 to ₹100</b> prizes</div>}
      <div class="stage">
        <div class="reels">{Array.from({ length: n }, (_, i) => <div key={i + String(num)} class={num ? 'rl pop' : 'rl q'} style={`animation-delay:${i * 0.15}s`}>{num ? num[i] : '?'}</div>)}</div>
        <div class="meta" style="margin-top:12px">{num ? 'Your lucky number is ready ✨' : 'Open the mystery boxes to get your number'}</div>
        {num && <button class={saved ? 'btn ok' : 'btn dk'} disabled={saved} onClick={save}>{saved ? '✓ Saved to profile' : 'Save to profile'}</button>}
      </div>
      <button class="btn" onClick={open}>{needAd ? '▶ Watch an ad for 2 more sets' : num ? 'Play again' : 'Open mystery boxes'}</button>
      <div class="meta ctr" style="margin-top:8px">{n4 ? (needAd ? 'Your free set is used' : `${left} of ${limit} set${limit > 1 ? 's' : ''} left today`) : `${left} free plays left today`}</div>
      <div class="sec"><b>My lucky numbers</b><span>{list.length}</span></div>
      {list.length ? list.map((x) => <div key={x.at} class="sv"><b>{x.n}</b><span><i>{x.g}</i>{x.n.length} Digit · {new Date(x.at).toLocaleDateString()}</span><button onClick={() => del(x.at)}>×</button></div>) : <div class="empty">No lucky numbers yet. Play the game above!</div>}
      <Disclaimer>Lucky numbers are for fun only. Not a prediction. No win is guaranteed.</Disclaimer>
      {playing && <Boxes n={n} t7={digits} onDone={done} onClose={() => setPlaying(false)} />}
    </div>
  );
}

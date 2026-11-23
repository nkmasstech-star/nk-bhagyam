import { useState, useEffect, useRef } from 'preact/hooks';
import { createPortal } from 'preact/compat';
export const APP = { name: 'Malabar Results', full: 'Malabar Results', slogan: 'Results · Analysis · Predictions', version: '0.1.5 test' };
export const go = (p) => { location.hash = p; };
export const back = () => history.back();
// popups register here so the phone Back button closes the top popup instead of leaving the screen/app
const POPS = [];
export function useBackClose(fn) {
  const ref = useRef(fn); ref.current = fn;
  useEffect(() => { const e = () => ref.current && ref.current(); POPS.push(e); return () => { const i = POPS.indexOf(e); if (i >= 0) POPS.splice(i, 1); }; }, []);
}
export const closeTopPopup = () => { const e = POPS[POPS.length - 1]; if (e) { e(); return true; } return false; };
export const openMenu = () => window.dispatchEvent(new Event('nk-menu'));
export const toast = (m) => window.dispatchEvent(new CustomEvent('nk-toast', { detail: m }));
export const ls = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
};

const I = (d, extra) => () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" {...extra}>{d}</svg>;
export const IconMenu = I(<><path d="M4 7h16" /><path d="M4 12h11" /><path d="M4 17h16" /></>);
export const IconBell = I(<><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10 20a2 2 0 0 0 4 0" /></>);
export const IconBack = I(<path d="M15 5l-7 7 7 7" />);
export const IconHome = I(<><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></>);
export const IconStar = I(<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.3 6L12 16.5 6.6 19.4l1.3-6L3.4 9.3l6-.7z" />);
export const IconPredict = I(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /><path d="M16 8l4-4M17 4h3v3" /></>);
export const IconChart = I(<><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>);
export const IconUsers = I(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" /><circle cx="17" cy="9" r="2.8" /><path d="M16.5 14.6c2.6.2 4.5 2 5 4.9" /></>);
const T = (txt) => () => <svg viewBox="0 0 24 24"><text x="12" y="17.3" text-anchor="middle" font-family="Poppins,sans-serif" font-weight="800" font-size="15" fill="currentColor" letter-spacing="-.4">{txt}</text></svg>;
export const IconNK = T('NK');
export const Icon4D = T('4D');
export const IconSearch = I(<><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>);
export const IconUser = I(<><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>);
export const IconClock = I(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>);

export function Logo({ size = 32 }) { return <img class="mark logo-img" src="./logo.png" alt="" width={size} height={size} style={`width:${size}px;height:${size}px`} />; }

// red dot on the bell when a notification has arrived (push messages will raise nk_unread once Firebase is connected)
export const addUnread = () => { ls.set('nk_unread', ls.get('nk_unread', 0) + 1); window.dispatchEvent(new Event('nk-unread')); };
export function TopBar() {
  const [n, setN] = useState(ls.get('nk_unread', 0));
  useEffect(() => { const f = () => setN(ls.get('nk_unread', 0)); addEventListener('nk-unread', f); return () => removeEventListener('nk-unread', f); }, []);
  return (
    <div class="bar">
      <button class="ib" aria-label="Menu" onClick={openMenu}><IconMenu /></button>
      <div class="brand"><Logo size={36} /><div class="bt"><b class="bn">Malabar</b><small>{APP.slogan}</small></div></div>
      <button class="ib" aria-label="Notifications" onClick={() => go('/notifications')}><IconBell />{n > 0 && <i class="dot" />}</button>
    </div>
  );
}
export function BackBar({ title, right }) {
  return (
    <div class="bar">
      <button class="ib" aria-label="Back" onClick={back}><IconBack /></button>
      <div class="ttl">{title}</div>
      {right || <span style="width:42px" />}
    </div>
  );
}
export function Hero({ draw, fmt, small }) {
  return (
    <div class={small ? 'hero sm' : 'hero'}>
      <div class="brand"><Logo size={22} /><b class="bn">Malabar <span>Results</span></b></div>
      <div class="hdt">{draw ? fmt(draw.date) : ''}</div>
      <div class="hgm">{draw ? draw.name : ''} <span>{draw ? draw.code : ''}</span></div>
    </div>
  );
}
export function Note({ children }) { return <div class="note"><i>i</i><div>{children}</div></div>; }
export function Overlay({ children }) { return createPortal(<div class="ov">{children}</div>, document.body); }

// hand-drawn pencil circle (for winning marks)
const PEN = ['M23 4C33 3 43 11 42 21C41 33 28 39 17 36C6 33 3 19 11 10C17 3 28 3 35 6', 'M20 3C31 1 44 10 43 22C42 34 27 40 15 36C4 31 2 17 12 9C19 3 30 4 36 8', 'M25 5C36 5 44 14 41 25C38 35 24 40 14 35C5 30 3 16 12 9C20 3 31 3 38 9'];
export function Pen({ k = 0 }) {
  const p = PEN[k % 3]; const rot = (k * 37) % 12 - 6;
  return (
    <svg class="pen" viewBox="0 0 46 42" style={`transform:rotate(${rot}deg) scale(1.12)`}>
      <path class="dr" d={p} fill="none" stroke="#D7262F" stroke-width="3.2" stroke-linecap="round" pathLength="100" />
      <path d={p} fill="none" stroke="#9E1A14" stroke-width="1.3" stroke-linecap="round" opacity=".75" transform="translate(1.2,.9) rotate(2 23 21)" />
      <path d={p} fill="none" stroke="#D7262F" stroke-width="1" stroke-linecap="round" opacity=".55" transform="translate(-.9,-.8) rotate(-3 23 21)" />
    </svg>
  );
}
const W = 'M6 22C5 9 28 3 46 4C66 5 78 11 76 22C74 33 52 38 34 36C16 35 7 31 6 21C6 14 14 9 26 7';
export function PenWide({ k = 0 }) {
  const r = (k * 5) % 8 - 4;
  return (
    <svg class="pw" viewBox="0 0 82 40" style={`transform:rotate(${r}deg)`}>
      <path class="dr" d={W} fill="none" stroke="#D7262F" stroke-width="3" stroke-linecap="round" pathLength="100" />
      <path d={W} fill="none" stroke="#9E1A14" stroke-width="1.2" opacity=".7" transform="translate(1,1)" />
    </svg>
  );
}
export function Confetti() {
  return [[66, 46, 0, '🎊'], [77, 54, 0.4, '✨'], [88, 44, 0.8, '🎉'], [94, 58, 1.2, '⭐']].map(([x, y, d, e]) => <span key={e} class="cf" style={`left:${x}%;top:${y}px;animation-delay:${d}s`}>{e}</span>);
}
export const Disclaimer = ({ children }) => <div class="disc">{children || 'Results are collected from public sources and are not official. Please verify with the official Kerala Government Gazette before claiming any prize.'}</div>;

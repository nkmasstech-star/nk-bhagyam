import { useState } from 'preact/hooks';
import { TopBar, BackBar, go, ls, toast, APP } from '../ui.jsx';

export function Profile() {
  const lucky = ls.get('nk_lucky', []);
  return (
    <div>
      <TopBar />
      <div class="prof"><div class="av">G</div><div><b>Guest</b><span class="meta">Sign in coming soon</span></div></div>
      <div class="stats"><div><b>{lucky.length}</b><span>Lucky numbers</span></div><div><b>0</b><span>Votes</span></div><div><b>New</b><span>Win %</span></div></div>
      <div class="sec"><b>My lucky numbers</b><span>{lucky.length}</span></div>
      {lucky.length ? lucky.slice(0, 5).map((x) => <div key={x.at} class="sv"><b>{x.n}</b><span><i>{x.g}</i>{x.n.length} Digit</span></div>) : <div class="empty">Play the Lucky Game to save numbers here.</div>}
      <div class="sec"><b>Account</b><span /></div>
      <div class="list">
        <button class="lr" onClick={() => go('/settings')}><span class="li2">⚙️</span><b>Settings</b><span>›</span></button>
        <button class="lr" onClick={() => go('/notifications')}><span class="li2">🔔</span><b>Notifications</b><span>›</span></button>
        <button class="lr" onClick={() => go('/legal/disclaimer')}><span class="li2">ⓘ</span><b>Disclaimer</b><span>›</span></button>
      </div>
    </div>
  );
}

export function Settings() {
  const [push, setPush] = useState(ls.get('nk_push', true));
  const [sound, setSound] = useState(ls.get('nk_sound', true));
  const [lang, setLang] = useState(ls.get('nk_lang', 'en'));
  const tg = (k, v, set) => { set(v); ls.set(k, v); };
  return (
    <div>
      <BackBar title="Settings" />
      <div class="list">
        <div class="lr"><span class="li2">🔔</span><b>Notifications<br /><small>Results and predictions alerts</small></b><button class={push ? 'sw on' : 'sw'} onClick={() => tg('nk_push', !push, setPush)} /></div>
        <div class="lr"><span class="li2">🔊</span><b>Game sounds</b><button class={sound ? 'sw on' : 'sw'} onClick={() => tg('nk_sound', !sound, setSound)} /></div>
        <div class="lr"><span class="li2">அ</span><b>Language</b><div class="seg">{[['en', 'English'], ['ta', 'தமிழ்'], ['ml', 'മലയാളം']].map(([k, l]) => <button key={k} class={lang === k ? 'on' : ''} onClick={() => { tg('nk_lang', k, setLang); if (k !== 'en') toast('Tamil and Malayalam coming soon'); }}>{l}</button>)}</div></div>
      </div>
      <div class="list">
        <button class="lr" onClick={() => go('/legal/privacy')}><span class="li2">🔒</span><b>Privacy Policy</b><span>›</span></button>
        <button class="lr" onClick={() => go('/legal/terms')}><span class="li2">📄</span><b>Terms &amp; Conditions</b><span>›</span></button>
        <button class="lr" onClick={() => go('/legal/disclaimer')}><span class="li2">ⓘ</span><b>Disclaimer</b><span>›</span></button>
        <button class="lr" onClick={() => { Object.keys(localStorage).filter((k) => k.startsWith('nk_res_')).forEach((k) => localStorage.removeItem(k)); toast('Saved results cleared'); }}><span class="li2">🧹</span><b>Clear saved results</b><span>›</span></button>
      </div>
      <div class="disc">{APP.full} · version {APP.version}</div>
    </div>
  );
}

const NOTES = [['🎯', "Today's predictions are ready", 'Samrudhi · 3 Digit and 4 Digit'], ['🔴', 'Live draw starts at 3:00 PM', 'Results update live in the app'], ['🎉', 'Yesterday you had a match', 'See History Predictions']];
export function Notifications() {
  ls.set('nk_unread', 0);
  return (
    <div>
      <BackBar title="Notifications" />
      <div class="list">{NOTES.map(([i, t, s]) => <div key={t} class="lr"><span class="li2">{i}</span><b>{t}<br /><small>{s}</small></b></div>)}</div>
      <div class="disc">Sample notifications for testing.</div>
    </div>
  );
}

const TEXT = {
  disclaimer: ['Disclaimer', 'This app shows Kerala lottery results collected from public sources and history-based predictions for entertainment only. Results are not official: always verify with the official Kerala Government Gazette before claiming. Predictions are probabilities, not 100% sure. We do not sell lottery tickets and do not promote any online game, betting or gambling.'],
  privacy: ['Privacy Policy', 'Draft for testing. The app stores your lucky numbers and settings only on your phone. The full privacy policy will be added before release.'],
  terms: ['Terms & Conditions', 'Draft for testing. Use of this app is for information and entertainment only. Full terms will be added before release.'],
};
export function Legal({ kind }) {
  const [t, body] = TEXT[kind] || TEXT.disclaimer;
  return <div><BackBar title={t} /><div class="card"><div class="in" style="line-height:1.7;font-size:13.5px">{body}</div></div></div>;
}

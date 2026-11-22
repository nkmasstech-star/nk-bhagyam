import { useState, useEffect } from 'preact/hooks';
import { THEMES, DEFAULT_THEME, applyTheme } from '../data/themes.js';
import { Updater, APK_URL, currentBuild, latestBuild } from '../data/update.js';
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

function UpdateCard() {
  const [cur, setCur] = useState(0); const [info, setInfo] = useState(null); const [st, setSt] = useState('check'); const [pct, setPct] = useState(0); const [err, setErr] = useState('');
  const check = async () => {
    setSt('check'); setErr('');
    const c = await currentBuild(); setCur(c);
    try { const l = await latestBuild(); setInfo(l); setSt(l.build > c ? 'new' : 'ok'); } catch (e) { setSt('fail'); setErr('Could not check. Check internet.'); }
  };
  useEffect(() => { check(); }, []);
  const update = async () => {
    try {
      const p = await Updater.canInstall();
      if (!p.allowed) { toast('Allow "Install unknown apps" for Malabar, then tap Update again'); await Updater.openInstallSettings(); return; }
      setSt('dl'); setPct(0);
      const h = await Updater.addListener('progress', (e) => setPct(e.percent));
      await Updater.downloadAndInstall({ url: APK_URL });
      h.remove(); setSt('installing');
    } catch (e) { setSt('new'); setErr(String(e.message || e)); }
  };
  const title = { check: 'Checking for update…', new: 'New update ready', ok: 'App is up to date', fail: 'Update check failed', dl: 'Downloading update…', installing: 'Tap "Update" on the next screen' }[st];
  return (
    <div class="upd">
      <b>🔄 {title}</b>
      <small>Your build: {cur || '-'}{info ? ` · Latest: ${info.build}` : ''}</small>
      {info && st === 'new' && info.note && <small>What's new: {info.note}</small>}
      {err && <small style="color:#FFD0D0">{err}</small>}
      {st === 'dl' && <div class="bar2"><i style={`width:${pct}%`} /></div>}
      {st === 'new' && <button onClick={update}>Update app</button>}
      {(st === 'ok' || st === 'fail') && <button onClick={check}>Check again</button>}
    </div>
  );
}

export function Settings() {
  const [theme, setTheme] = useState(THEMES[ls.get('nk_theme', DEFAULT_THEME)] ? ls.get('nk_theme', DEFAULT_THEME) : DEFAULT_THEME);
  const pick = (id) => { setTheme(id); ls.set('nk_theme', id); applyTheme(id); window.dispatchEvent(new Event('nk-theme')); };
  const [push, setPush] = useState(ls.get('nk_push', true));
  const [sound, setSound] = useState(ls.get('nk_sound', true));
  const [lang, setLang] = useState(ls.get('nk_lang', 'en'));
  const tg = (k, v, set) => { set(v); ls.set(k, v); };
  return (
    <div>
      <BackBar title="Settings" />
      <UpdateCard />
      <div class="list">
        <div class="lr tcol"><b>Theme · {THEMES[theme] ? THEMES[theme].name : ''}</b><div class="themes">{Object.entries(THEMES).map(([id, t]) => <button key={id} class={theme === id ? 'on' : ''} aria-label={t.name} onClick={() => pick(id)}><i style={`background:${t.sw[0]}`} /><i style={`background:${t.sw[1]}`} /></button>)}</div></div>
      </div>
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

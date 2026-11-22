import { useState, useEffect } from 'preact/hooks';
import { THEMES, DEFAULT_THEME, applyTheme } from '../data/themes.js';
import { Updater, APK_URL, currentBuild, latestBuild } from '../data/update.js';
import { BackBar, go, ls, toast, APP } from '../ui.jsx';
import { fmtShort, dmy } from '../data/games.js';
import { Avatar, AVATAR_THEMES } from '../social/avatars.jsx';
import { Sheet } from '../social/Sheet.jsx';
import { PostCard, WinBadge, Composer, useSocial } from './Community.jsx';
import { me, userInfo, winStats, followingOf, followersOf, toggleFollow, userPosts, visible, savedPosts, myLucky, myPicks, matchSets, postedToday, renameMe, setAvatar, validName, NAME_EDITS, NAME_MAX, AVATAR_EDITS } from '../social/store.js';

function AvatarPicker({ current, onClose, left }) {
  const [th, setTh] = useState(Math.floor(current / 100) % 10);
  return (
    <Sheet title="Choose your sticker" onClose={onClose}>
      <div class="meta" style="margin-bottom:8px">Avatar changes left: {left}</div>
      <div class="qchips scroll">{AVATAR_THEMES.map((a, i) => <button key={a.name} class={th === i ? 'qchip on sm' : 'qchip sm'} onClick={() => setTh(i)}>{a.name}</button>)}</div>
      <div class="qav-grid">{Array.from({ length: 100 }, (_, k) => th * 100 + k).map((id) => (
        <button key={id} class={id === current ? 'qav-pick on' : 'qav-pick'} aria-label={`Avatar ${id + 1}`} onClick={() => { const r = setAvatar(id); if (r.error) { toast(r.error); return; } onClose(); }}><Avatar id={id} size={50} /></button>
      ))}</div>
    </Sheet>
  );
}
function NameSheet({ user, onClose }) {
  const [v, setV] = useState(user.name); const [err, setErr] = useState('');
  const left = NAME_EDITS - (user.nameEdits || 0);
  const save = () => { const r = renameMe(v); if (r.error) { setErr(r.error); return; } toast('Name updated'); onClose(); };
  return (
    <Sheet title="Edit name" onClose={onClose}>
      <div class="meta" style="margin-bottom:8px;line-height:1.5">Letters only, up to {NAME_MAX} characters. No numbers, emoji or symbols. Changes left: {left}</div>
      <input class="qinput" value={v} maxLength={NAME_MAX} autocomplete="off" onInput={(e) => { const c = e.currentTarget.value.replace(/[^\p{L}\p{M} ]/gu, '').slice(0, NAME_MAX); e.currentTarget.value = c; setV(c); }} />
      <div class="meta" style="text-align:right;font-size:12px;margin:4px 2px 10px">{v.length}/{NAME_MAX}</div>
      {err && <div class="qerr">{err}</div>}
      <button class="qbtn" disabled={left <= 0 || !validName(v.trim()) || v.trim() === user.name} onClick={save}>Save name</button>
    </Sheet>
  );
}
const Gear = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>;
function Entry({ n, sub, sets, day }) {
  const h = matchSets(sets || [n], day);
  return <div class="qhit"><span class="n">{n}</span><span style="flex:1;min-width:0"><b>{sub}</b><span class="meta" style="display:block">{h == null ? 'Waiting for the result' : h.length ? `🎉 Matched ${h.map((x) => x.prize).join(', ')}` : 'Did not match'}</span></span></div>;
}

// Own profile (/profile) or another player's page (/user/:id) — social-media style, same as Q Spot 4D
export function Profile({ uid }) {
  useSocial();
  const user = me();
  const id = uid || 'me'; const own = id === 'me';
  const u = userInfo(id); const st = winStats(id); const fl = followingOf().includes(id);
  const [picker, setPicker] = useState(false); const [nameOpen, setNameOpen] = useState(false); const [comp, setComp] = useState(null);
  const [tab, setTab] = useState('posts');
  const tabs = own ? [['posts', 'Posts'], ['saved', 'Saved'], ['lucky', 'Lucky'], ['picks', 'My picks']] : [['posts', 'Posts']];
  let body;
  if (tab === 'posts') { const l = visible(userPosts(id)); body = l.length ? l.slice(0, 30).map((p) => <PostCard key={p.id} p={p} hideFollow onEdit={(x) => setComp({ edit: x })} />) : <div class="qpanel"><div class="empty">No posts yet.</div></div>; }
  else if (tab === 'saved') { const l = savedPosts(); body = l.length ? l.map((p) => <PostCard key={p.id} p={p} hideOwn />) : <div class="qpanel"><div class="empty">Posts you save appear here. We check them when the result is out.</div></div>; }
  else if (tab === 'lucky') { const l = myLucky(); body = l.length ? l.map((x) => <Entry key={x.at} n={x.n} sub={`${x.g || 'Lucky Game'} · ${x.n.length} digit`} day={x.at ? dmy(new Date(x.at + (new Date().getTimezoneOffset() + 330) * 6e4)) : ''} />) : <div class="qpanel"><div class="empty">Lucky numbers you save from the Lucky Game appear here.</div></div>; }
  else { const l = myPicks(); body = l.length ? l.map((x) => <Entry key={x.id} n={x.sets[0]} sets={x.sets} day={x.day} sub={`Draw ${fmtShort(x.day)} · ${x.sets.join(' ')}`} />) : <div class="qpanel"><div class="empty">Predictions you save only for yourself appear here.</div></div>; }
  return (
    <div>
      {own
        ? <div class="bar"><div class="ttl" style="margin-left:8px;font-size:20px">Profile</div><button class="ib" aria-label="Settings" onClick={() => go('/settings')}><Gear /></button></div>
        : <BackBar title="Player" />}
      <div class="qwrap">
        <div class="qpf">
          <div class="qpf-cover" />
          <div class="qpf-main">
            <button class="plain qpf-av" disabled={!own} onClick={() => own && setPicker(true)} aria-label="Change avatar"><Avatar id={u.avatar} size={88} ring />{own && <i class="qpf-edit">✎</i>}</button>
            <div class="qpf-name">{u.name}</div>
            <div class="qpf-stats">
              <div><b>{st.posts}</b><span>Posts</span></div>
              <div><b>{followersOf(id)}</b><span>Followers</span></div>
              <div><b>{own ? followingOf().length : '—'}</b><span>Following</span></div>
              <div><b>{st.pct == null ? '—' : `${st.pct}%`}</b><span>Winning</span></div>
            </div>
            {st.pct == null && <div class="meta" style="font-size:12px;text-align:center">Winning % shows after 4 checked posts. Checked: {st.resolved}</div>}
            {own
              ? <div class="qpf-btns"><button class="qbtn ghost" onClick={() => setNameOpen(true)}>Edit profile</button><button class="qbtn" onClick={() => (postedToday() ? toast('You have already posted today. See your post below.') : setComp({}))}>Place your prediction</button></div>
              : <button class={fl ? 'qbtn ghost' : 'qbtn'} onClick={() => toggleFollow(id)}>{fl ? 'Following' : 'Follow'}</button>}
          </div>
        </div>
        <div class="qtabs" style="margin:14px 0 8px">{tabs.map(([k, l]) => <button key={k} class={tab === k ? 'qtab on' : 'qtab'} onClick={() => setTab(k)}>{l}</button>)}</div>
        {tab === 'posts' && <div class="qsec"><h3>Posts</h3><WinBadge stats={st} /></div>}
        {body}
        {own && <div class="meta ctr" style="font-size:12px;margin:8px 0">Saved on this phone for now. Google sign-in comes with the online community.</div>}
      </div>
      {picker && <AvatarPicker current={user.avatar} left={AVATAR_EDITS - (user.avatarEdits || 0)} onClose={() => setPicker(false)} />}
      {nameOpen && <NameSheet user={user} onClose={() => setNameOpen(false)} />}
      {comp && <Composer edit={comp.edit} onClose={() => setComp(null)} />}
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
  const [tabs, setTabs] = useState({ nk: true, '4d': true, community: true, ...ls.get('nk_tabs', {}) });
  const tgTab = (k) => { const n = { ...tabs, [k]: !tabs[k] }; setTabs(n); ls.set('nk_tabs', n); window.dispatchEvent(new Event('nk-tabs')); };
  return (
    <div>
      <BackBar title="Settings" />
      <UpdateCard />
      <div class="list">
        <div class="lr tcol"><b>Theme · {THEMES[theme] ? THEMES[theme].name : ''}</b><div class="themes">{Object.entries(THEMES).map(([id, t]) => <button key={id} class={theme === id ? 'on' : ''} aria-label={t.name} onClick={() => pick(id)}><i style={`background:${t.sw[0]}`} /><i style={`background:${t.sw[1]}`} /></button>)}</div></div>
      </div>
      <div class="list">
        <div class="lr tcol"><b>Customize app<br /><small>Show or hide tabs in the bottom menu</small></b></div>
        {[['4d', '4D', '4 digit predictions'], ['nk', 'NK', '3 digit guessing, charts and tools'], ['community', 'Community', 'Player posts']].map(([k, l, d]) => <div key={k} class="lr"><span class="li2 tx">{l === 'Community' ? '👥' : l}</span><b>{l}<br /><small>{d}</small></b><button class={tabs[k] ? 'sw on' : 'sw'} aria-label={`Show ${l} tab`} onClick={() => tgTab(k)} /></div>)}
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


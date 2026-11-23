import { useState, useEffect } from 'preact/hooks';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { loadDraws } from './data/results.js';
import { TopBar, closeTopPopup, go, APP, IconHome, IconNK, Icon4D, IconUsers, IconUser, Logo, ls } from './ui.jsx';
import { Community } from './screens/Community.jsx';
import { Home } from './screens/Home.jsx';
import { Result } from './screens/Result.jsx';
import { Predictions } from './screens/Predictions.jsx';
import { ThreeDigit, FourDigit } from './screens/Digits.jsx';
import { A4Home, A4High, A4Repeated, A4Formats, A4Power } from './screens/A4.jsx';
import { setHistory } from './data/hist.js';
import { Spend } from './screens/Spend.jsx';
import { loadResult } from './data/results.js';
import { hasNewFollowing } from './social/store.js';
import { dmy, istNow } from './data/games.js';
import { Splash, Login, NeedLogin, auth, isMember } from './screens/Login.jsx';
import { History3, History3Day, History4, History4Day } from './screens/History.jsx';
import { Lucky } from './screens/Lucky.jsx';
import { Poll } from './screens/Poll.jsx';
import { Analytics } from './screens/Analytics.jsx';
import { Profile, Settings, Notifications } from './screens/Profile.jsx';
import { HowTo, Faq, Feedback, Legal } from './screens/Info.jsx';
import { Menu } from './screens/Menu.jsx';
import { NKHome, Frequency, Monthly, BoxCreator } from './screens/NK.jsx';

function useRoute() {
  const read = () => location.hash.slice(1) || '/home';
  const [r, setR] = useState(read());
  useEffect(() => { const f = () => setR(read()); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  return r;
}
const ALL_TABS = [['/home', 'Home', IconHome], ['/4d', '4D', Icon4D, '4d'], ['/nk', 'NK', IconNK, 'nk'], ['/community', 'Community', IconUsers, 'community'], ['/profile', 'Profile', IconUser]];
export const tabOn = () => ({ nk: true, '4d': true, community: true, ...ls.get('nk_tabs', {}) });

export function App() {
  const route = useRoute();
  const [splash, setSplash] = useState(!location.search.includes('nosplash'));
  const [data, setData] = useState({ draws: [], sample: true, ready: false });
  const [menu, setMenu] = useState(false);
  const [msg, setMsg] = useState('');
  const [, setTabsV] = useState(0);
  useEffect(() => { const f = () => setTabsV((n) => n + 1); addEventListener('nk-tabs', f); return () => removeEventListener('nk-tabs', f); }, []);

  const refresh = () => loadDraws().then((r) => {
    setHistory(r.draws); setData({ ...r, ready: true });
    // warm up the newest results in the background so opening a card is instant
    setTimeout(() => r.draws.slice(0, 6).forEach((d, i) => setTimeout(() => loadResult(d).catch(() => {}), i * 250)), 400);
  });
  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    const sync = () => { try { const dark = document.documentElement.dataset.mode === 'dark'; const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(); StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light }).catch(() => {}); StatusBar.setBackgroundColor({ color: bg }).catch(() => {}); } catch (e) { /* web */ } };
    sync(); addEventListener('nk-theme', sync); return () => removeEventListener('nk-theme', sync);
  }, []);
  useEffect(() => {
    const m = () => setMenu(true); const t = (e) => { setMsg(e.detail); setTimeout(() => setMsg(''), 2400); };
    addEventListener('nk-menu', m); addEventListener('nk-toast', t);
    return () => { removeEventListener('nk-menu', m); removeEventListener('nk-toast', t); };
  }, []);
  useEffect(() => {
    let h;
    CapApp.addListener('backButton', () => {
      if (closeTopPopup()) return;
      if (menu) { setMenu(false); return; }
      const top = ['#/home', '#/nk', '#/4d', '#/community', '#/profile', ''];
      if (!top.includes(location.hash)) history.back();
      else if (location.hash && location.hash !== '#/home') go('/home');
      else CapApp.exitApp();
    }).then((x) => { h = x; }).catch(() => {});
    return () => h && h.remove();
  }, [menu]);
  // when the app comes back to the front, reload the draw list (new day card / new results)
  useEffect(() => { let h; CapApp.addListener('resume', refresh).then((x) => { h = x; }).catch(() => {}); return () => h && h.remove(); }, []);

  const [, setAuthV] = useState(0);
  useEffect(() => { const f = () => setAuthV((n) => n + 1); addEventListener('nk-auth', f); return () => removeEventListener('nk-auth', f); }, []);
  if (splash) return <Splash onDone={() => setSplash(false)} hide={() => { try { SplashScreen.hide({ fadeOutDuration: 0 }); } catch (e) { /* web */ } }} />;
  if (!auth() && !location.hash.startsWith('#/legal')) return <Login />;
  const member = isMember();

  const [path] = route.split('?');
  const seg = path.split('/').filter(Boolean);
  const draws = data.draws;
  let screen; let nav = false;
  switch (seg[0]) {
    case 'result': screen = <Result draws={draws} date={seg[1]} />; break;
    case 'predictions': screen = <Predictions draws={draws} />; nav = true; break;
    case 'nk': screen = <NKHome draws={draws} />; nav = true; break;
    case 'freq': screen = <Frequency draws={draws} />; break;
    case 'monthly': screen = <Monthly draws={draws} month={seg[1]} />; break;
    case 'box': screen = <BoxCreator />; break;
    case '4d': screen = <FourDigit draws={draws} tab />; nav = true; break;
    case 'p3': screen = <ThreeDigit draws={draws} />; break;
    case 'p4': screen = <FourDigit draws={draws} />; break;
    case 'h3': screen = seg[1] ? <History3Day draws={draws} date={seg[1]} /> : <History3 draws={draws} />; break;
    case 'h4': screen = seg[1] ? <History4Day draws={draws} date={seg[1]} /> : <History4 draws={draws} />; break;
    case 'lucky': screen = <Lucky draws={draws} n4={route.includes('n=4')} />; break;
    case 'a4': screen = seg[1] === 'hf' ? <A4High /> : seg[1] === 'rep' ? <A4Repeated /> : seg[1] === 'fmt' ? <A4Formats /> : seg[1] === 'power' ? <A4Power month={seg[2]} /> : <A4Home />; break;
    case 'poll': screen = <Poll draws={draws} />; break;
    case 'analytics': screen = <Analytics draws={draws} sample={data.sample} />; break;
    case 'profile': screen = member ? <Profile /> : <><div class="bar"><div class="ttl" style="margin-left:8px;font-size:20px">Profile</div><button class="ib" aria-label="Settings" onClick={() => go('/settings')}>⚙</button></div><NeedLogin what="your Profile" /></>; nav = true; break;
    case 'community': screen = member ? <Community /> : <><TopBar /><NeedLogin what="Community" /></>; nav = true; break;
    case 'settings': screen = <Settings />; break;
    case 'notifications': screen = <Notifications />; break;
    case 'legal': screen = <Legal kind={seg[1]} />; break;
    case 'user': screen = member ? <Profile uid={seg[1]} /> : <NeedLogin what="Community" />; break;
    case 'spend': screen = member ? <Spend /> : <NeedLogin what="your Profile" />; break;
    case 'howto': screen = <HowTo />; break;
    case 'faq': screen = <Faq />; break;
    case 'feedback': screen = <Feedback />; break;
    default: screen = <Home draws={draws} ready={data.ready} sample={data.sample} onRefresh={refresh} />; nav = true;
  }
  const active = '/' + (seg[0] || 'home');
  const on = tabOn();
  const TABS = ALL_TABS.filter((t) => !t[3] || on[t[3]]);
  // red dots: new prediction not opened yet (4D / NK), new post from someone you follow (Community)
  const today = dmy(istNow());
  if (active === '/4d') ls.set('nk_seen_4d', today);
  if (active === '/nk') ls.set('nk_seen_nk', today);
  const dot = { '/4d': ls.get('nk_seen_4d', '') !== today, '/nk': ls.get('nk_seen_nk', '') !== today, '/community': member && active !== '/community' && hasNewFollowing() };
  void ls;
  return (
    <div class="app">
      <div class="sbshield" />
      <main class={nav ? 'screen' : 'screen no-nav'}><div key={path} class={nav ? 'page' : 'page push'}>{screen}</div></main>
      {nav && (
        <nav class="nav"><div class="nav-in">
          {TABS.map(([p, l, Ic]) => <button key={p} class={active === p ? (l === 'NK' ? 'nv on nklogo' : 'nv on') : 'nv'} onClick={() => go(p)} aria-label={l}>{l === 'NK' && active === p ? <img class="nvlogo" src="./nk-logo.png" alt="NK" /> : <Ic />}{l !== 'NK' && l !== '4D' && <span>{l}</span>}{dot[p] && <i class="ndot" />}</button>)}
        </div></nav>
      )}
      {menu && <Menu onClose={() => setMenu(false)} />}
      {msg && <div class="toast">{msg}</div>}
    </div>
  );
}

import { useState, useEffect } from 'preact/hooks';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { loadDraws } from './data/results.js';
import { go, APP, IconHome, IconStar, IconSearch, IconUser, Logo, ls } from './ui.jsx';
import { Home } from './screens/Home.jsx';
import { Result } from './screens/Result.jsx';
import { Predictions } from './screens/Predictions.jsx';
import { ThreeDigit, FourDigit } from './screens/Digits.jsx';
import { History3, History3Day, History4, History4Day } from './screens/History.jsx';
import { Lucky } from './screens/Lucky.jsx';
import { Poll } from './screens/Poll.jsx';
import { Analytics } from './screens/Analytics.jsx';
import { Profile, Settings, Notifications, Legal } from './screens/Profile.jsx';
import { Menu } from './screens/Menu.jsx';

function useRoute() {
  const read = () => location.hash.slice(1) || '/home';
  const [r, setR] = useState(read());
  useEffect(() => { const f = () => setR(read()); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  return r;
}
const TABS = [['/home', 'Home', IconHome], ['/predictions', 'Predictions', IconStar], ['/analytics', 'Analytics', IconSearch], ['/profile', 'Profile', IconUser]];

function Splash({ onDone }) {
  useEffect(() => { requestAnimationFrame(() => requestAnimationFrame(() => { try { SplashScreen.hide({ fadeOutDuration: 0 }); } catch (e) { /* web */ } })); const id = setTimeout(onDone, 1900); return () => clearTimeout(id); }, []);
  return (
    <div class="splash">
      <div class="glow" />
      <div class="lg"><Logo size={130} /></div>
      <div class="nmx">Bhagyam</div>
      <div class="sl">{APP.slogan}</div>
    </div>
  );
}

export function App() {
  const route = useRoute();
  const [splash, setSplash] = useState(!location.search.includes('nosplash'));
  const [data, setData] = useState({ draws: [], sample: true, ready: false });
  const [menu, setMenu] = useState(false);
  const [msg, setMsg] = useState('');

  const refresh = () => loadDraws().then((r) => setData({ ...r, ready: true }));
  useEffect(() => { refresh(); }, []);
  useEffect(() => { try { StatusBar.setStyle({ style: Style.Light }).catch(() => {}); StatusBar.setBackgroundColor({ color: '#F3F5FA' }).catch(() => {}); } catch (e) { /* web */ } }, []);
  useEffect(() => {
    const m = () => setMenu(true); const t = (e) => { setMsg(e.detail); setTimeout(() => setMsg(''), 2400); };
    addEventListener('nk-menu', m); addEventListener('nk-toast', t);
    return () => { removeEventListener('nk-menu', m); removeEventListener('nk-toast', t); };
  }, []);
  useEffect(() => {
    let h;
    CapApp.addListener('backButton', () => {
      if (menu) { setMenu(false); return; }
      const top = ['#/home', '#/predictions', '#/analytics', '#/profile', ''];
      if (!top.includes(location.hash)) history.back();
      else if (location.hash && location.hash !== '#/home') go('/home');
      else CapApp.exitApp();
    }).then((x) => { h = x; }).catch(() => {});
    return () => h && h.remove();
  }, [menu]);
  // when the app comes back to the front, reload the draw list (new day card / new results)
  useEffect(() => { let h; CapApp.addListener('resume', refresh).then((x) => { h = x; }).catch(() => {}); return () => h && h.remove(); }, []);

  if (splash) return <Splash onDone={() => setSplash(false)} />;

  const [path] = route.split('?');
  const seg = path.split('/').filter(Boolean);
  const draws = data.draws;
  let screen; let nav = false;
  switch (seg[0]) {
    case 'result': screen = <Result draws={draws} date={seg[1]} />; break;
    case 'predictions': screen = <Predictions draws={draws} />; nav = true; break;
    case 'p3': screen = <ThreeDigit draws={draws} />; break;
    case 'p4': screen = <FourDigit draws={draws} />; break;
    case 'h3': screen = seg[1] ? <History3Day draws={draws} date={seg[1]} /> : <History3 draws={draws} />; break;
    case 'h4': screen = seg[1] ? <History4Day draws={draws} date={seg[1]} /> : <History4 draws={draws} />; break;
    case 'lucky': screen = <Lucky draws={draws} />; break;
    case 'poll': screen = <Poll draws={draws} />; break;
    case 'analytics': screen = <Analytics draws={draws} sample={data.sample} />; nav = true; break;
    case 'profile': screen = <Profile />; nav = true; break;
    case 'settings': screen = <Settings />; break;
    case 'notifications': screen = <Notifications />; break;
    case 'legal': screen = <Legal kind={seg[1]} />; break;
    default: screen = <Home draws={draws} ready={data.ready} sample={data.sample} onRefresh={refresh} />; nav = true;
  }
  const active = '/' + (seg[0] || 'home');
  void ls;
  return (
    <div class="app">
      <main class={nav ? 'screen' : 'screen no-nav'}><div key={path} class={nav ? 'page' : 'page push'}>{screen}</div></main>
      {nav && (
        <nav class="nav"><div class="nav-in">
          {TABS.map(([p, l, Ic]) => <button key={p} class={active === p ? 'nv on' : 'nv'} onClick={() => go(p)} aria-label={l}><Ic /><span>{l}</span></button>)}
        </div></nav>
      )}
      {menu && <Menu onClose={() => setMenu(false)} />}
      {msg && <div class="toast">{msg}</div>}
    </div>
  );
}

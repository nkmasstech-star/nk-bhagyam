import { useEffect } from 'preact/hooks';
import { APP, ls, go, toast } from '../ui.jsx';

// Logo built from parts so each part can animate: white box with M, yellow MALABAR strip
export function MLogo({ size = 150, anim }) {
  return (
    <div class={anim ? 'mlogo anim' : 'mlogo'} style={`--s:${size}px`}>
      <div class="ml-frame">
        <div class="ml-box"><span>M</span></div>
        <div class="ml-strip">MALABAR</div>
      </div>
    </div>
  );
}

export function Splash({ onDone, hide }) {
  useEffect(() => { requestAnimationFrame(() => requestAnimationFrame(hide)); const id = setTimeout(onDone, 2600); return () => clearTimeout(id); }, []);
  return (
    <div class="splash2">
      <MLogo size={168} anim />
      <div class="sp2-name">MALABAR</div>
      <div class="sp2-sl">{APP.slogan}</div>
    </div>
  );
}

// account: { mode: 'guest' | 'google', name, email }
export const auth = () => ls.get('nk_auth', null);
export const isMember = () => { const a = auth(); return !!(a && a.mode === 'google'); };
export const signOut = () => { ls.set('nk_auth', null); window.dispatchEvent(new Event('nk-auth')); };
export function signInGoogle() {
  // Google sign-in goes live once the app's Firebase project is connected; until then this is a test account on this phone
  ls.set('nk_auth', { mode: 'google', name: 'Malabar Player', email: '', test: true });
  window.dispatchEvent(new Event('nk-auth'));
  toast('Signed in (test account until Firebase is connected)');
}
export const asGuest = () => { ls.set('nk_auth', { mode: 'guest' }); window.dispatchEvent(new Event('nk-auth')); };

const G = () => <svg viewBox="0 0 48 48" width="22" height="22"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>;

export function Login() {
  return (
    <div class="login2">
      <div class="lg2-top"><MLogo size={120} /><div class="sp2-name dk">MALABAR</div><div class="sp2-sl dk">{APP.slogan}</div></div>
      <div class="lg2-card">
        <b>Welcome</b>
        <span>Sign in to post in the Community, keep a profile and save your numbers.</span>
        <button class="gbtn" onClick={signInGoogle}><G /> Continue with Google</button>
        <button class="guest" onClick={asGuest}>Continue as guest</button>
        <small>Guests can see results, 4D and NK. Community and Profile need sign-in.<br />By continuing you agree to the <a onClick={() => go('/legal/terms')}>Terms</a> and <a onClick={() => go('/legal/privacy')}>Privacy Policy</a>. 18+ only.</small>
      </div>
    </div>
  );
}

// shown on Community / Profile for guests
export function NeedLogin({ what }) {
  return (
    <div class="needlg">
      <div class="nl-ic">🔒</div>
      <b>Sign in to use {what}</b>
      <span>{what === 'Community' ? 'Post your numbers, like, follow players and see who is winning.' : 'Create your profile, save lucky numbers and track your winning %.'}</span>
      <button class="gbtn" onClick={signInGoogle}><G /> Continue with Google</button>
    </div>
  );
}

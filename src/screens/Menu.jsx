import { go, Logo, APP, toast } from '../ui.jsx';
const ITEMS = [['🏠', 'Home', '/home'], ['🎯', 'Predictions', '/predictions'], ['📊', 'Analytics', '/analytics'], ['❓', 'How to use', null], ['ⓘ', 'Disclaimer', '/legal/disclaimer'], ['🔒', 'Privacy Policy', '/legal/privacy'], ['⭐', 'Rate app', null], ['📤', 'Share app', null], ['✉️', 'Feedback', null]];
export function Menu({ onClose }) {
  return (
    <>
      <div class="scrim" onClick={onClose} />
      <div class="drawer">
        <div class="hd"><Logo size={48} /><div><b>{APP.full}</b><small>{APP.slogan}</small></div></div>
        {ITEMS.map(([i, l, to]) => <button key={l} class="it" onClick={() => { onClose(); if (to) go(to); else toast('Coming soon'); }}><i>{i}</i>{l}</button>)}
        <div class="ver">Menu items are placeholders · v{APP.version}</div>
      </div>
    </>
  );
}

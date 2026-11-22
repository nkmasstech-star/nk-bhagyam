import { go, Logo, toast } from '../ui.jsx';
const ITEMS = [['❓', 'How to use', '/howto'], ['💬', 'FAQ', '/faq'], ['✉️', 'Feedback', '/feedback'], null, ['🔒', 'Privacy Policy', '/legal/privacy'], ['📄', 'Terms of Use', '/legal/terms'], ['ⓘ', 'Disclaimer', '/legal/disclaimer'], ['📤', 'Share the app', 'share'], ['⭐', 'Rate the app', 'rate']];
export function Menu({ onClose }) {
  const act = (to) => {
    onClose();
    if (to === 'share') { const text = 'Kerala lottery results, analysis and predictions — Malabar Results'; try { if (navigator.share) navigator.share({ text }); else toast('Share opens after launch'); } catch (e) { /* cancelled */ } return; }
    if (to === 'rate') { toast('Rating opens after launch'); return; }
    go(to);
  };
  return (
    <>
      <div class="scrim" onClick={onClose} />
      <div class="drawer">
        <div class="hd"><Logo size={46} /><div><b class="bn" style="font-size:19px">Malabar</b><small>Results · Analysis · Predictions</small></div></div>
        {ITEMS.map((x, i) => (x ? <button key={x[1]} class="it" onClick={() => act(x[2])}><i>{x[0]}</i>{x[1]}</button> : <div key={'s' + i} class="dsep" />))}
      </div>
    </>
  );
}

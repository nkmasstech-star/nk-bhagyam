import { createPortal } from 'preact/compat';
import { useBackClose } from '../ui.jsx';
export function Sheet({ title, onClose, children }) {
  useBackClose(onClose);
  return createPortal(
    <div class="qsheet-wrap"><div class="qsheet-scrim" onClick={onClose} />
      <div class="qsheet" role="dialog" aria-label={title}>
        <div class="qsheet-head"><b>{title}</b><button class="ib" aria-label="Close" onClick={onClose}>×</button></div>
        <div class="qsheet-body">{children}</div>
      </div>
    </div>, document.body);
}

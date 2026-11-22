import { createPortal } from 'preact/compat';
export function Sheet({ title, onClose, children }) {
  return createPortal(
    <div class="qsheet-wrap"><div class="qsheet-scrim" onClick={onClose} />
      <div class="qsheet" role="dialog" aria-label={title}>
        <div class="qsheet-head"><b>{title}</b><button class="ib" aria-label="Close" onClick={onClose}>×</button></div>
        <div class="qsheet-body">{children}</div>
      </div>
    </div>, document.body);
}

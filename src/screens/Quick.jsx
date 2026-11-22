import { useState } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import { toast } from '../ui.jsx';
import { inr, fmtLong } from '../data/games.js';
import { loadResult } from '../data/results.js';
import { parseTicket, checkFull, checkLast4, readScan } from '../data/ticket.js';

export const IconScan = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" /><path d="M4 12h16" /></svg>;

export const QuickFab = ({ onClick, low }) => createPortal(<button class={low ? "quickfab low" : "quickfab"} onClick={onClick} aria-label="Quick ticket check"><IconScan /><span>Quick</span></button>, document.body);

function Pop({ title, onClose, children }) {
  return createPortal(
    <div class="qpop-wrap"><div class="qsheet-scrim" onClick={onClose} />
      <div class="qpop" role="dialog" aria-label={title}>
        <div class="qsheet-head"><b>{title}</b><button class="ib" aria-label="Close" onClick={onClose}>×</button></div>
        <div class="qpop-body">{children}</div>
      </div>
    </div>, document.body);
}

function Outcome({ o }) {
  if (!o) return null;
  if (o.wait) return <div class="qout"><b>Result not out yet</b><span>{o.wait}</span></div>;
  if (o.err) return <div class="qout"><b>{o.err}</b></div>;
  if (o.hits.length) {
    return (
      <div class="qout won">
        <div class="qconf">🎉</div>
        <b>Congratulations!</b>
        {o.hits.map((h) => <div key={h.label} class="qprize"><span>{h.label}</span><em>{inr(h.amt)}</em></div>)}
        <span>{o.title} · {fmtLong(o.draw.date)}</span>
        <small>Please verify with the official Kerala Government Gazette before claiming.</small>
      </div>
    );
  }
  return (
    <div class="qout">
      <b>No win this time</b>
      <span>{o.title} · {fmtLong(o.draw.date)}</span>
      {o.top && o.top.length > 0 && <small>Your last 4 digits also end the {o.top.map((t) => `${t.label} (${t.ticket})`).join(', ')}. Check the full ticket number.</small>}
    </div>
  );
}

async function resultFor(draw) {
  const r = await loadResult(draw);
  if (!r || !r.first) return null;
  return r;
}

// Result page: check a ticket of this draw — full number (all prizes) or Fast (last 4 digits)
export function QuickCheck({ draw, res, onClose }) {
  const [mode, setMode] = useState('full');
  const [v, setV] = useState(''); const [o, setO] = useState(null);
  const run = () => {
    if (mode === 'full') {
      const t = parseTicket(v); if (!t) { setO({ err: 'Type the full ticket number, e.g. SM 123456' }); return; }
      setO({ hits: checkFull(res, t.text), draw, title: `Ticket ${t.text}` });
    } else {
      if (!/^\d{4}$/.test(v)) { setO({ err: 'Type the last 4 digits of your ticket' }); return; }
      const r = checkLast4(res, v); setO({ hits: r.lower.slice(0, 1), top: r.top, draw, title: `Last 4 digits ${v}` });
    }
  };
  return (
    <Pop title="Quick check" onClose={onClose}>
      <div class="meta" style="margin-bottom:10px">{draw.name} {draw.code} · {fmtLong(draw.date)}</div>
      <div class="qseg">
        <button class={mode === 'full' ? 'on' : ''} onClick={() => { setMode('full'); setV(''); setO(null); }}>Full ticket</button>
        <button class={mode === 'fast' ? 'on' : ''} onClick={() => { setMode('fast'); setV(''); setO(null); }}>⚡ Fast · last 4</button>
      </div>
      {mode === 'full'
        ? <input class="qinput big tk" autofocus placeholder="SM 123456" maxLength={10} value={v} onInput={(e) => { const c = e.currentTarget.value.toUpperCase().replace(/[^A-Z0-9 ]/g, ''); e.currentTarget.value = c; setV(c); setO(null); }} />
        : <input class="qinput big" autofocus inputMode="numeric" placeholder="0000" maxLength={4} value={v} onInput={(e) => { const c = e.currentTarget.value.replace(/\D/g, '').slice(0, 4); e.currentTarget.value = c; setV(c); setO(null); }} />}
      <div class="meta" style="font-size:12px;margin:6px 2px 12px">{mode === 'full' ? 'Checks every prize, 1st prize to ₹100.' : 'Checks the ₹5,000 to ₹100 prizes by the last 4 digits.'}</div>
      <button class="qbtn" onClick={run}>Check</button>
      <Outcome o={o} />
    </Pop>
  );
}

// Home: scan the ticket barcode, or type the number
export function QuickScan({ draws, onClose }) {
  const [busy, setBusy] = useState(false);
  const [raw, setRaw] = useState('');
  const [v, setV] = useState(''); const [pick, setPick] = useState('');
  const [o, setO] = useState(null);
  const check = async (ticketText, draw) => {
    const t = parseTicket(ticketText);
    if (!t) { setO({ err: 'Could not read the ticket number. Type it below.' }); return; }
    if (!draw) { setO({ err: 'Choose the draw date below.' }); return; }
    setBusy(true);
    const res = await resultFor(draw).catch(() => null);
    setBusy(false);
    if (!res || !res.complete) { setO({ wait: `${draw.name} ${draw.code} · result comes at 3:00 PM. Check again after the draw.` }); return; }
    setO({ hits: checkFull(res, t.text), draw, title: `Ticket ${t.text}` });
  };
  const scan = async () => {
    setO(null);
    try {
      const { BarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning');
      const { supported } = await BarcodeScanner.isSupported();
      if (!supported) throw new Error('unsupported');
      const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
      if (!available) { await BarcodeScanner.installGoogleBarcodeScannerModule(); toast('Getting the scanner ready… try again in a few seconds'); return; }
      const { barcodes } = await BarcodeScanner.scan();
      const val = barcodes && barcodes[0] ? (barcodes[0].rawValue || barcodes[0].displayValue || '') : '';
      if (!val) return;
      setRaw(val);
      const r = readScan(val, draws);
      if (r.ticket) setV(r.ticket.text);
      if (r.draw) setPick(r.draw.date);
      if (r.ticket && r.draw) check(r.ticket.text, r.draw);
      else setO({ err: r.ticket ? 'Ticket read. Choose the draw date below.' : 'This code does not show the ticket number. Type it below.' });
    } catch (e) {
      setO({ err: 'Camera scan is not available here. Type the ticket number below.' });
    }
  };
  const draw = draws.find((d) => d.date === pick);
  return (
    <Pop title="Quick ticket check" onClose={onClose}>
      <button class="qscan" onClick={scan} disabled={busy}><IconScan /><b>Scan ticket</b><span>Point the camera at the barcode on your ticket</span></button>
      <div class="qor"><span>or type it</span></div>
      <input class="qinput big tk" placeholder="SM 123456" maxLength={10} value={v} onInput={(e) => { const c = e.currentTarget.value.toUpperCase().replace(/[^A-Z0-9 ]/g, ''); e.currentTarget.value = c; setV(c); setO(null); }} />
      <select class="qinput" style="margin-top:8px" value={pick} onChange={(e) => { setPick(e.currentTarget.value); setO(null); }}>
        <option value="">Choose draw date</option>
        {draws.slice(0, 60).map((d) => <option key={d.date} value={d.date}>{fmtLong(d.date)} · {d.name} {d.code}</option>)}
      </select>
      <button class="qbtn" style="margin-top:12px" disabled={busy} onClick={() => check(v, draw)}>{busy ? 'Checking…' : 'Check ticket'}</button>
      <Outcome o={o} />
      {raw && <div class="meta" style="font-size:11px;margin-top:10px;word-break:break-all">Scanned code: {raw}</div>}
    </Pop>
  );
}

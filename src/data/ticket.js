// Ticket checking for the Quick button: full ticket number (all prizes) or last 4 digits (₹5,000 to ₹100 prizes).
const norm = (t) => String(t || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
export const parseTicket = (s) => { const m = norm(s).match(/([A-Z]{2})(\d{6})/); return m ? { series: m[1], num: m[2], text: `${m[1]} ${m[2]}` } : null; };

export function checkFull(res, ticket) {
  const t = parseTicket(ticket); if (!t || !res) return [];
  const hits = [];
  const same = (x) => norm(x) === t.series + t.num;
  if (res.first && same(res.first.ticket)) hits.push({ label: '1st Prize', amt: res.first.amt });
  else if (res.first) {
    const f = parseTicket(res.first.ticket);
    const inCons = res.cons && res.cons.list && res.cons.list.length ? res.cons.list.some(same) : (f && f.num === t.num && f.series !== t.series);
    if (inCons) hits.push({ label: 'Consolation Prize', amt: (res.cons && res.cons.amt) || 5000 });
  }
  if (res.second && same(res.second.ticket)) hits.push({ label: '2nd Prize', amt: res.second.amt });
  if (res.third && same(res.third.ticket)) hits.push({ label: '3rd Prize', amt: res.third.amt });
  // 4th to 9th prizes go by the last 4 digits (any series); only the highest one is paid
  if (!hits.length) { const l4 = checkLast4(res, t.num.slice(-4)).lower; if (l4.length) hits.push(l4[0]); }
  return hits;
}
export function checkLast4(res, last4) {
  const lower = []; const top = [];
  if (!res || !/^\d{4}$/.test(last4)) return { lower, top };
  (res.lower || []).forEach((p) => { if (p.list.includes(last4)) lower.push({ label: `${p.label} Prize`, amt: p.amt }); });
  [['1st Prize', res.first], ['2nd Prize', res.second], ['3rd Prize', res.third]].forEach(([l, p]) => { if (p && p.ticket && norm(p.ticket).endsWith(last4)) top.push({ label: l, ticket: p.ticket }); });
  return { lower, top };
}

// What a scanned barcode / QR can tell us: ticket number, draw code (SM-82) and/or date
export function readScan(raw, draws) {
  const s = String(raw || '').toUpperCase();
  const ticket = parseTicket(s);
  let draw = null;
  const codes = draws.map((d) => ({ d, k: d.code.replace('-', '') }));
  const cm = s.replace(/[^A-Z0-9]/g, ' ');
  for (const c of codes) { const re = new RegExp(`\\b${c.d.code.split('-')[0]}\\s*-?\\s*${c.d.code.split('-')[1]}\\b`); if (re.test(s) || re.test(cm)) { draw = c.d; break; } }
  if (!draw) { const m = s.match(/(\d{2})[/.-](\d{2})[/.-](\d{4})/); if (m) draw = draws.find((d) => d.date === `${m[1]}-${m[2]}-${m[3]}`) || null; }
  return { ticket, draw };
}

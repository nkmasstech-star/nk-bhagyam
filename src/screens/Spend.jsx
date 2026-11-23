import { useState } from 'preact/hooks';
import { BackBar, ls, toast } from '../ui.jsx';
import { fmtShort, istNow, dmy, parseDmy, GAMES, inr } from '../data/games.js';
import { history } from '../data/hist.js';
import { Pop } from './Quick.jsx';

// Spend Tracker: the player's own record of money spent on tickets and money won — only what they type, kept on this phone.
const KEY = 'nk_spend';
const gameOf = (date) => { const d = history().find((x) => x.date === date); if (d) return `${d.name} ${d.code}`; return GAMES[parseDmy(date).getDay()].name; };
const toIso = (date) => date.split('-').reverse().join('-');
const fromIso = (iso) => iso.split('-').reverse().join('-');
const MS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function Entry({ edit, onClose, onSave }) {
  const [date, setDate] = useState(edit ? edit.date : dmy(istNow()));
  const [spent, setSpent] = useState(edit ? String(edit.spent || '') : '');
  const [won, setWon] = useState(edit ? String(edit.won || '') : '');
  const num = (v) => v.replace(/\D/g, '').slice(0, 8);
  const save = () => { const s = +spent || 0; const w = +won || 0; if (!s && !w) { toast('Enter the amount spent or won'); return; } onSave({ id: edit ? edit.id : Date.now().toString(36), date, game: gameOf(date), spent: s, won: w }); onClose(); };
  return (
    <Pop title={edit ? 'Edit entry' : 'Add entry'} onClose={onClose}>
      <div class="meta" style="font-weight:700;margin-bottom:6px">Date</div>
      <input class="qinput" type="date" value={toIso(date)} max={toIso(dmy(istNow()))} onInput={(e) => e.currentTarget.value && setDate(fromIso(e.currentTarget.value))} />
      <div class="meta" style="margin:6px 2px 12px">{gameOf(date)}</div>
      <div class="sp2col">
        <label><span>Spent on tickets</span><div class="rupee"><i>₹</i><input class="qinput" inputMode="numeric" placeholder="0" value={spent} onInput={(e) => { const c = num(e.currentTarget.value); e.currentTarget.value = c; setSpent(c); }} /></div></label>
        <label><span>Won</span><div class="rupee"><i>₹</i><input class="qinput" inputMode="numeric" placeholder="0" value={won} onInput={(e) => { const c = num(e.currentTarget.value); e.currentTarget.value = c; setWon(c); }} /></div></label>
      </div>
      <button class="qbtn" style="margin-top:14px" onClick={save}>Save</button>
    </Pop>
  );
}

function group(list, by) {
  const m = new Map();
  list.forEach((e) => {
    const d = parseDmy(e.date); let k; let label;
    if (by === 'week') { const st = new Date(d); st.setDate(d.getDate() - ((d.getDay() + 6) % 7)); k = st.toISOString().slice(0, 10); label = `${st.getDate()} ${MS[st.getMonth()]}`; }
    else if (by === 'month') { k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; label = `${MS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`; }
    else { k = String(d.getFullYear()); label = k; }
    const g = m.get(k) || { k, label, spent: 0, won: 0 }; g.spent += e.spent || 0; g.won += e.won || 0; m.set(k, g);
  });
  return [...m.values()].sort((a, b) => (a.k < b.k ? 1 : -1));
}

export function Spend() {
  const [list, setList] = useState(ls.get(KEY, []));
  const [add, setAdd] = useState(null);
  const [by, setBy] = useState('month');
  const [budget, setBudget] = useState(ls.get('nk_spend_budget', 0));
  const save = (l) => { const s = l.sort((a, b) => parseDmy(b.date) - parseDmy(a.date)); ls.set(KEY, s); setList([...s]); };
  const upsert = (e) => save([...list.filter((x) => x.id !== e.id), e]);
  const remove = (id) => { if (confirm('Delete this entry?')) save(list.filter((x) => x.id !== id)); };
  const spent = list.reduce((a, e) => a + (e.spent || 0), 0); const won = list.reduce((a, e) => a + (e.won || 0), 0); const net = won - spent;
  const groups = group(list, by).slice(0, by === 'week' ? 8 : by === 'month' ? 12 : 5);
  const max = Math.max(1, ...groups.map((g) => Math.max(g.spent, g.won)));
  const now = istNow(); const mKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonth = group(list, 'month').find((g) => g.k === mKey) || { spent: 0, won: 0 };
  const lossMonths = group(list, 'month').slice(0, 3).filter((g) => g.spent > g.won).length;
  const setB = () => { const v = prompt('Monthly limit in ₹ (0 for no limit)', budget || ''); if (v == null) return; const n = +String(v).replace(/\D/g, '') || 0; setBudget(n); ls.set('nk_spend_budget', n); };
  return (
    <div>
      <BackBar title="Spend Tracker" />
      <div class="qwrap">
        <div class="spsum">
          <div><small>Total spent</small><b>{inr(spent)}</b></div>
          <div><small>Total won</small><b class="g">{inr(won)}</b></div>
          <div class={net >= 0 ? 'net up' : 'net dn'}><small>{net >= 0 ? 'Profit' : 'Loss'}</small><b>{inr(Math.abs(net))}</b></div>
        </div>
        <div class="qpanel spmonth">
          <div><b>This month</b><small>Spent {inr(thisMonth.spent)} · Won {inr(thisMonth.won)}</small></div>
          <button class="fbtn" onClick={setB}>{budget ? `Limit ${inr(budget)}` : 'Set monthly limit'}</button>
          {budget > 0 && <div class="spbar"><i style={`width:${Math.min(100, (thisMonth.spent / budget) * 100)}%;background:${thisMonth.spent > budget ? '#E5484D' : 'var(--red2)'}`} /></div>}
          {budget > 0 && thisMonth.spent > budget && <div class="spwarn">You have gone over your limit this month. Please stop buying tickets until next month.</div>}
        </div>
        <button class="qbtn" onClick={() => setAdd({})}>+ Add today's spend</button>

        <div class="qtabs" style="margin:16px 0 10px">{[['week', 'Weekly'], ['month', 'Monthly'], ['year', 'Yearly']].map(([k, l]) => <button key={k} class={by === k ? 'qtab on' : 'qtab'} onClick={() => setBy(k)}>{l}</button>)}</div>
        <div class="qpanel">
          {groups.length ? groups.map((g) => (
            <div key={g.k} class="sprow"><span class="lb">{g.label}</span>
              <span class="bars"><i class="s" style={`width:${(g.spent / max) * 100}%`} /><i class="w" style={`width:${(g.won / max) * 100}%`} /></span>
              <span class={g.won - g.spent >= 0 ? 'nv2 up' : 'nv2 dn'}>{g.won - g.spent >= 0 ? '+' : '−'}{inr(Math.abs(g.won - g.spent))}</span></div>
          )) : <div class="empty">Add your first entry to see your weekly, monthly and yearly spend.</div>}
          {groups.length > 0 && <div class="splegend"><i class="s" /> Spent <i class="w" /> Won</div>}
        </div>

        <div class="spcare">
          <b>💙 A note for you</b>
          <p>This record is only for you. If you are losing money most months{lossMonths >= 2 ? ' (you are in loss in ' + lossMonths + ' of the last 3 months)' : ''}, or you are spending money meant for family, food, rent, school fees or loans, please stop or take a long break.</p>
          <p>A lottery is a game of chance. Nobody can win back losses by buying more tickets. Set a small monthly limit and never borrow to play. If it is hard to stop, talk to someone you trust.</p>
        </div>

        <div class="sec" style="padding-left:2px"><b>My entries</b><span>{list.length}</span></div>
        {list.map((e) => (
          <div key={e.id} class="spent">
            <div class="d"><b>{fmtShort(e.date)}</b><small>{e.game}</small></div>
            <div class="a"><span>−{inr(e.spent || 0)}</span>{e.won > 0 && <span class="g">+{inr(e.won)}</span>}</div>
            <button class="ib" aria-label="Edit" onClick={() => setAdd({ edit: e })}>✎</button><button class="ib" aria-label="Delete" onClick={() => remove(e.id)}>×</button>
          </div>
        ))}
        <div class="meta ctr" style="font-size:12px;margin:10px 0 16px">We do not sell tickets. Only the amounts you type are shown here, and they stay on this phone.</div>
      </div>
      {add && <Entry edit={add.edit} onClose={() => setAdd(null)} onSave={upsert} />}
    </div>
  );
}

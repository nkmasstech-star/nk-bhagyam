import { useState, useEffect } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import { TopBar, go, toast, useBackClose } from '../ui.jsx';
import { fmtShort, istNow, dmy, parseDmy, GAMES } from '../data/games.js';
import { history } from '../data/hist.js';
export const drawOf = (date) => history().find((d) => d.date === date) || { name: GAMES[parseDmy(date).getDay()].name, code: GAMES[parseDmy(date).getDay()].code };
import { Avatar } from '../social/avatars.jsx';
import { Sheet } from '../social/Sheet.jsx';
import { me, allPosts, visible, postedToday, canEdit, canDelete, createPost, editPost, deletePost, addPick, validSets, MAX_SETS, liked, toggleLike, likeCount, savedIds, toggleSave, followingOf, toggleFollow, blockedOf, toggleBlock, hidePost, reportPost, REPORT_REASONS, winStats, evalPost, userInfo, hasNewFollowing, markFollowingSeen } from '../social/store.js';

export const useSocial = () => { const [, s] = useState(0); useEffect(() => { const f = () => s((n) => n + 1); addEventListener('nk-social', f); return () => removeEventListener('nk-social', f); }, []); };

const Heart = ({ on }) => <svg viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20s-7-4.4-9.2-9A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5c-2.2 4.6-9.2 9-9.2 9z" /></svg>;
const Share = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" /></svg>;
const Mark = ({ on }) => <svg viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4z" /></svg>;

export function WinBadge({ stats }) { return stats.pct == null ? <span class="qwin new">New</span> : <span class="qwin">{stats.pct}% wins</span>; }

function ReportSheet({ p, onClose }) {
  return (
    <Sheet title="Report this post" onClose={onClose}>
      <div class="meta" style="margin-bottom:8px">Why are you reporting this post?</div>
      {REPORT_REASONS.map((r) => <button key={r} class="qrow" onClick={() => { reportPost(p.id, r); toast('Thanks. We will review this post.'); onClose(); }}>{r}</button>)}
    </Sheet>
  );
}
function PostMenu({ p, name, anchor, onClose, onReport }) {
  useBackClose(onClose);
  const blocked = blockedOf().includes(p.uid);
  const copy = async () => { try { await navigator.clipboard.writeText(p.sets.join(' ')); toast('Copied'); } catch (e) { /* ignore */ } onClose(); };
  return createPortal(
    <div><div class="qmenu-scrim" onClick={onClose} />
      <div class="qmenu" role="menu" style={`top:${Math.round(anchor.bottom + 6)}px;right:${Math.max(8, Math.round(window.innerWidth - anchor.right))}px`}>
        <button onClick={copy}>Copy numbers</button>
        <button onClick={() => { hidePost(p.id); toast('Post hidden'); onClose(); }}>Hide this post</button>
        <button onClick={() => { onClose(); onReport(); }}>Report post</button>
        <button class="danger" onClick={() => { const on = toggleBlock(p.uid); toast(on ? `${name} is blocked` : `${name} is unblocked`); onClose(); }}>{blocked ? `Unblock ${name}` : `Block ${name}`}</button>
      </div>
    </div>, document.body);
}

export function PostCard({ p, onEdit, hideOwn, hideFollow }) {
  const u = userInfo(p.uid);
  const own = p.uid === 'me';
  const lk = liked(p.id); const sv = savedIds().includes(p.id); const fl = followingOf().includes(p.uid);
  const ev = evalPost(p); const st = winStats(p.uid);
  const [menu, setMenu] = useState(null); const [rep, setRep] = useState(false);
  const share = async () => { const text = `${u.name}: ${p.sets.join(' ')} (${drawOf(p.day).name} ${drawOf(p.day).code} · ${fmtShort(p.day)})\nvia Malabar Results`; try { if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); toast('Copied'); } } catch (e) { /* cancelled */ } };
  const hitSet = new Set(ev.hits.map((h) => h.set));
  return (
    <div class="qpost">
      <div class="qpost-top">
        <button class="plain" onClick={() => go(own ? '/profile' : `/user/${p.uid}`)} aria-label={u.name}><Avatar id={u.avatar} size={44} /></button>
        <span style="flex:1;min-width:0">
          <button class="plain qname" onClick={() => go(own ? '/profile' : `/user/${p.uid}`)}>{u.name}</button>
          <span class="meta qsub">{fmtShort(p.day)}{p.edited ? ' · Edited' : ''}<WinBadge stats={st} /></span>
        </span>
        {!own && <button class="plain qmore" aria-label="More options" onClick={(e) => setMenu(e.currentTarget.getBoundingClientRect())}>⋯</button>}
        {!own && !hideFollow && <button class={fl ? 'qchip on sm' : 'qchip sm'} onClick={() => toggleFollow(p.uid)}>{fl ? 'Following' : 'Follow'}</button>}
      </div>
      <div class="qpick">
        <div class="qpick-head"><b>{fmtShort(p.day)}</b><span class="meta" style="margin-left:auto">{drawOf(p.day).name} · {drawOf(p.day).code}</span></div>
        <div class="qnums">{p.sets.map((s) => <div key={s} class={hitSet.has(s) ? 'qn hit' : 'qn'}>{s}<small>{s.length} digit</small></div>)}</div>
      </div>
      {ev.resolved && <div class={ev.won ? 'qres won' : 'qres'}>{ev.won ? `🎉 Matched · ${ev.hits.map((h) => `${h.set} (${h.prize})`).join(', ')}` : 'Did not match the result'}</div>}
      <div class="qfoot">
        <button class={lk ? 'qact on' : 'qact'} aria-pressed={lk} onClick={() => toggleLike(p.id)}><Heart on={lk} /><span>{likeCount(p)}</span></button>
        <button class="qact" onClick={share}><Share /><span>Share</span></button>
        <button class={sv ? 'qact on' : 'qact'} aria-pressed={sv} onClick={() => toggleSave(p.id)}><Mark on={sv} /><span>{sv ? 'Saved' : 'Save'}</span></button>
      </div>
      {!hideOwn && own && (canEdit(p) || canDelete(p)) && (
        <div class="qfoot own">
          <span class="meta" style="flex:1;font-size:12px">Edit or delete until 1:00 PM today</span>
          {canEdit(p) && <button class="qchip sm" onClick={() => onEdit(p)}>Edit</button>}
          {canDelete(p) && <button class="qchip sm danger" onClick={() => { if (confirm('Delete this post?')) { deletePost(p.id); toast('Post deleted'); } }}>Delete</button>}
        </div>
      )}
      {menu && <PostMenu p={p} name={u.name} anchor={menu} onClose={() => setMenu(null)} onReport={() => setRep(true)} />}
      {rep && <ReportSheet p={p} onClose={() => setRep(false)} />}
    </div>
  );
}

export function Composer({ edit, onClose }) {
  const [sets, setSets] = useState(edit ? [...edit.sets] : ['']);
  const [err, setErr] = useState('');
  const setNum = (i, v) => { const s = [...sets]; s[i] = v.replace(/\D/g, '').slice(0, 4); setSets(s); };
  const clean = () => sets.filter((s) => s !== '');
  const submit = () => { const c = clean(); const e = validSets(c); if (e) { setErr(e); return; } if (edit) { editPost(edit.id, c); toast('Post updated'); } else { createPost(c); toast('Prediction posted'); } onClose(); };
  const saveOnly = () => { const c = clean(); const e = validSets(c); if (e) { setErr(e); return; } addPick(c); toast('Saved to your profile'); onClose(); };
  return (
    <Sheet title={edit ? 'Edit your prediction' : 'Place your prediction'} onClose={onClose}>
      <div class="qpick-head" style="margin-bottom:10px"><b>{fmtShort(dmy(istNow()))}</b><span class="meta" style="margin-left:auto">{drawOf(dmy(istNow())).name} · {drawOf(dmy(istNow())).code}</span></div>
      <div class="meta" style="margin-bottom:6px">Your numbers (up to 4) · 3 digits = last 3 of 1st prize, 4 digits = any prize ₹5,000 to ₹100</div>
      <div class="qnumin">{sets.map((s, i) => (
        <div key={i} class="qnumin-row">
          <input class="qinput big" inputMode="numeric" maxLength={4} placeholder="000" aria-label={`Number ${i + 1}`} value={s} onInput={(e) => setNum(i, e.currentTarget.value)} />
          {sets.length > 1 && <button class="ib" aria-label="Remove" onClick={() => setSets(sets.filter((_, j) => j !== i))}>×</button>}
        </div>))}
      </div>
      {sets.length < MAX_SETS && <button class="qchip sm" style="margin-top:8px" onClick={() => setSets([...sets, ''])}>+ Add number</button>}
      <div class="meta" style="font-size:12px;line-height:1.5;margin:12px 0 10px">One post per day. You can edit once, and edit or delete until 1:00 PM (2 hours before the draw).</div>
      {err && <div class="qerr" role="alert">{err}</div>}
      <button class="qbtn" onClick={submit}>{edit ? 'Save changes' : 'Post prediction'}</button>
      {!edit && <button class="qbtn ghost" style="margin-top:8px" onClick={saveOnly}>Save only for me</button>}
    </Sheet>
  );
}

export const Fab = ({ onClick }) => createPortal(<button class="qfab" aria-label="Place your prediction" onClick={onClick}>＋</button>, document.body);

export function Community() {
  useSocial();
  const [tab, setTab] = useState('all');
  const [comp, setComp] = useState(null);
  const fl = followingOf();
  const [newF] = useState(hasNewFollowing());
  const list = visible(allPosts()).filter((p) => tab === 'all' || fl.includes(p.uid));
  void me();
  return (
    <div>
      <TopBar />
      <div class="qhead"><h2>Community</h2><span class="meta">Share your predictions</span></div>
      <div class="qtabs" role="tablist">
        <button class={tab === 'all' ? 'qtab on' : 'qtab'} onClick={() => setTab('all')}>All</button>
        <button class={tab === 'following' ? 'qtab on' : 'qtab'} onClick={() => { setTab('following'); markFollowingSeen(); }}>Following{tab !== 'following' && newF && <i class="tdot" />}</button>
      </div>
      <div class="qwrap">
        {list.length === 0 && <div class="qpanel"><div class="empty">{tab === 'following' ? 'Follow players to see their posts here.' : 'No posts yet.'}</div></div>}
        {list.slice(0, 40).map((p, i) => [<PostCard key={p.id} p={p} onEdit={(x) => setComp({ edit: x })} />, (i + 1) % 5 === 0 ? <div key={'ad' + i} class="ad" style="margin:0 0 10px">Native ad space</div> : null])}
        <div class="meta ctr" style="font-size:12px;margin:6px 0 10px">Sample players for testing. Posts are shared online once the community goes live.</div>
      </div>
      <Fab onClick={() => (postedToday() ? toast('You have already posted today. See your post in Profile.') : setComp({}))} />
      {comp && <Composer edit={comp.edit} onClose={() => setComp(null)} />}
    </div>
  );
}

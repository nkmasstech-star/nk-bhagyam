// Community + profile layer (same features as Q Spot 4D).
// For now everything is kept on this phone with sample players; it moves to Firebase (shared for all users) later.
import { istNow, dmy, parseDmy, GAMES } from '../data/games.js';
import { resultOrSample } from '../data/predictions.js';

const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } };
const bump = () => window.dispatchEvent(new Event('nk-social'));

export const NAME_EDITS = 3;
export const AVATAR_EDITS = 3;
export const NAME_MAX = 25;
export const MAX_SETS = 4;
export const FOLLOW_MIN = 4; // winning % shows after this many checked posts
export const CUTOFF_MIN = 13 * 60; // edit/delete until 1:00 PM IST (2 hours before the 3:00 PM draw)
export const REPORT_REASONS = ['Spam or advertising', 'Abuse or hate', 'Scam or false claim', 'Adult or inappropriate content', 'Other'];

const today = () => dmy(istNow());
const addDays = (s, n) => { const d = parseDmy(s); d.setDate(d.getDate() + n); return dmy(d); };
const gameOf = (date) => GAMES[parseDmy(date).getDay()];
const nowMin = () => { const n = istNow(); return n.getHours() * 60 + n.getMinutes(); };

// ---------- me ----------
export function me() {
  let u = read('nk_me', null);
  if (!u) { u = { uid: 'me', name: 'Malabar Player', avatar: 912, nameEdits: 0, avatarEdits: 0, joined: today() }; write('nk_me', u); }
  return u;
}
export const validName = (s) => s.length >= 2 && s.length <= NAME_MAX && /^[\p{L}\p{M} ]+$/u.test(s);
export function renameMe(name) {
  const u = me(); const n = name.trim().replace(/\s+/g, ' ');
  if ((u.nameEdits || 0) >= NAME_EDITS) return { error: 'No name changes left.' };
  if (!validName(n)) return { error: 'Use letters only (2 to 25).' };
  const nu = { ...u, name: n, nameEdits: (u.nameEdits || 0) + 1 }; write('nk_me', nu); bump(); return { user: nu };
}
export function setAvatar(a) {
  const u = me();
  if (a === u.avatar) return { user: u };
  if ((u.avatarEdits || 0) >= AVATAR_EDITS) return { error: 'No avatar changes left.' };
  const nu = { ...u, avatar: a, avatarEdits: (u.avatarEdits || 0) + 1 }; write('nk_me', nu); bump(); return { user: nu };
}

// ---------- sample players & posts (until the online community is connected) ----------
const PLAYERS = [
  { uid: 'u1', name: 'Rajesh Kumar', avatar: 101, followers: 128 },
  { uid: 'u2', name: 'Anitha', avatar: 25, followers: 86 },
  { uid: 'u3', name: 'Suresh Babu', avatar: 437, followers: 241 },
  { uid: 'u4', name: 'Lakshmi', avatar: 662, followers: 54 },
  { uid: 'u5', name: 'Muthu', avatar: 318, followers: 173 },
  { uid: 'u6', name: 'Faisal', avatar: 944, followers: 97 },
];
let seed = 11;
const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
const rn = (len) => String(Math.floor(rnd() * 10 ** len)).padStart(len, '0');
function samplePosts() {
  const out = []; const t = today();
  for (let k = 0; k < 12; k += 1) {
    const date = addDays(t, -k);
    PLAYERS.forEach((p, i) => {
      seed = (parseDmy(date).getTime() / 864e5 + i * 31) % 233280;
      if (rnd() < 0.3) return;
      const res = resultOrSample({ date, code: gameOf(date).code + '-1' });
      const sets = [];
      const n = 2 + Math.floor(rnd() * 3);
      for (let j = 0; j < n; j += 1) sets.push(rnd() < 0.5 ? rn(3) : rn(4));
      // some players hit now and then (taken from that day's sample result)
      if (k > 0 && rnd() < 0.12) { const pool = res.lower[3].list; sets[0] = pool[Math.floor(rnd() * pool.length)]; }
      if (k > 0 && rnd() < 0.04) sets[1] = res.first.ticket.slice(-3);
      out.push({ id: `s${i}_${date}`, uid: p.uid, day: date, at: parseDmy(date).getTime() + (8 + i) * 36e5, sets: [...new Set(sets)], edited: false, up: 3 + Math.floor(rnd() * 60), sample: true });
    });
  }
  return out;
}
let cache = null;
const sample = () => { const t = today(); if (!cache || cache.t !== t) cache = { t, list: samplePosts() }; return cache.list; };

export const userInfo = (uid) => (uid === 'me' ? me() : PLAYERS.find((p) => p.uid === uid) || { uid, name: 'Player', avatar: 0, followers: 0 });

// ---------- posts ----------
const mine = () => read('nk_posts', []);
export const allPosts = () => [...mine(), ...sample()].sort((a, b) => b.at - a.at);
export const userPosts = (uid) => allPosts().filter((p) => p.uid === uid);
export const postedToday = () => mine().some((p) => p.day === today());
export const cutoffPassed = (p) => p.day !== today() || nowMin() >= CUTOFF_MIN;
export const canEdit = (p) => p.uid === 'me' && !p.edited && !cutoffPassed(p);
export const canDelete = (p) => p.uid === 'me' && !cutoffPassed(p);
export function validSets(sets) {
  if (!sets.length || sets.length > MAX_SETS) return 'Add 1 to 4 numbers.';
  if (sets.some((s) => !/^\d{3,4}$/.test(s))) return 'Every number needs 3 or 4 digits.';
  if (new Set(sets).size !== sets.length) return 'Remove repeated numbers.';
  return '';
}
export function createPost(sets) { const l = mine(); l.unshift({ id: `p${Date.now().toString(36)}`, uid: 'me', day: today(), at: Date.now(), sets, edited: false, up: 0 }); write('nk_posts', l); bump(); }
export function editPost(id, sets) { write('nk_posts', mine().map((p) => (p.id === id ? { ...p, sets, edited: true } : p))); bump(); }
export function deletePost(id) { write('nk_posts', mine().filter((p) => p.id !== id)); bump(); }

// ---------- likes, saves, follows, blocks ----------
export const liked = (id) => !!read('nk_likes', {})[id];
export function toggleLike(id) { const l = read('nk_likes', {}); if (l[id]) delete l[id]; else l[id] = 1; write('nk_likes', l); bump(); }
export const likeCount = (p) => (p.up || 0) + (liked(p.id) ? 1 : 0);
export const savedIds = () => read('nk_saved', []);
export function toggleSave(id) { const l = savedIds(); const i = l.indexOf(id); if (i >= 0) l.splice(i, 1); else l.unshift(id); write('nk_saved', l); bump(); }
export const savedPosts = () => { const all = allPosts(); return savedIds().map((id) => all.find((p) => p.id === id)).filter(Boolean); };
export const followingOf = () => read('nk_follow', []);
export function toggleFollow(uid) { const l = followingOf(); const i = l.indexOf(uid); if (i >= 0) l.splice(i, 1); else l.push(uid); write('nk_follow', l); bump(); }
export const followersOf = (uid) => (uid === 'me' ? 0 : userInfo(uid).followers + (followingOf().includes(uid) ? 1 : 0));
export const blockedOf = () => read('nk_blocks', []);
export function toggleBlock(uid) { const l = blockedOf(); const i = l.indexOf(uid); if (i >= 0) l.splice(i, 1); else l.push(uid); write('nk_blocks', l); bump(); return i < 0; }
export function hidePost(id) { const l = read('nk_hide', []); if (!l.includes(id)) l.push(id); write('nk_hide', l); bump(); }
export function reportPost(id, reason) { const l = read('nk_reports', []); if (!l.some((r) => r.id === id)) l.push({ id, reason, at: Date.now() }); write('nk_reports', l); hidePost(id); }
export const visible = (list) => { const b = blockedOf(); const h = read('nk_hide', []); return list.filter((p) => p.uid === 'me' || (!b.includes(p.uid) && !h.includes(p.id))); };

// ---------- private saves ----------
export const myPicks = () => read('nk_picks', []);
export function addPick(sets) { const l = myPicks(); l.unshift({ id: `k${Date.now().toString(36)}`, day: today(), sets }); write('nk_picks', l.slice(0, 100)); bump(); }
export const myLucky = () => read('nk_lucky', []);

// ---------- win checks (3 digits = last 3 of 1st prize; 4 digits = straight in any prize ₹5,000 to ₹100 or last 4 of top prizes) ----------
const drawn = (date) => { if (date === today() && nowMin() < 15 * 60 + 30) return null; const r = resultOrSample({ date, code: gameOf(date).code + '-1' }); return r && r.complete ? r : null; };
export function matchSets(sets, date) {
  const r = drawn(date); if (!r) return null;
  const hits = [];
  const top = [['1st', r.first && r.first.ticket], ['2nd', r.second && r.second.ticket], ['3rd', r.third && r.third.ticket]].filter((x) => x[1]);
  sets.forEach((s) => {
    if (s.length === 3) { if (r.first && r.first.ticket.replace(/\D/g, '').endsWith(s)) hits.push({ set: s, prize: '1st prize last 3' }); return; }
    top.forEach(([l, tk]) => { if (tk.replace(/\D/g, '').endsWith(s)) hits.push({ set: s, prize: `${l} prize last 4` }); });
    (r.lower || []).forEach((pr) => { if (pr.list.includes(s)) hits.push({ set: s, prize: `${pr.label} prize` }); });
  });
  return hits;
}
export function evalPost(p) { const h = matchSets(p.sets, p.day); return h == null ? { resolved: false, won: false, hits: [] } : { resolved: true, won: h.length > 0, hits: h }; }
export function winStats(uid) {
  const posts = userPosts(uid); let resolved = 0; let won = 0;
  posts.forEach((p) => { const e = evalPost(p); if (e.resolved) { resolved += 1; if (e.won) won += 1; } });
  return { posts: posts.length, resolved, won, pct: resolved >= FOLLOW_MIN ? Math.round((won / resolved) * 100) : null };
}

// red dot: a player you follow posted after you last looked at the Following tab
export const hasNewFollowing = () => { const f = followingOf(); if (!f.length) return false; const seen = read('nk_seen_follow', 0); return allPosts().some((p) => f.includes(p.uid) && p.at > seen && p.at <= Date.now()); };
export const markFollowingSeen = () => { write('nk_seen_follow', Date.now()); };

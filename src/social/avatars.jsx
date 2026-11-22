// 10 sticker themes x 100 = 1000 avatars (20 pictures x 5 colours). Users can only pick from these (same idea as Q Spot 4D).
export const AVATAR_THEMES = [
  { name: 'Festive', icons: ['🪔', '🎆', '🧨', '🌸', '🎉', '🥳', '🎊', '🏮', '🎇', '🌼', '🍬', '🎁', '🌺', '🛕', '🐘', '🥥', '🍚', '🎶', '🪷', '✨'] },
  { name: 'Nature', icons: ['🌴', '🌿', '🍃', '🌾', '🌻', '🌳', '🌊', '🏝️', '⛰️', '🌅', '🌄', '🌈', '☀️', '🌙', '⭐', '🌧️', '🍀', '🌵', '🍁', '🌷'] },
  { name: 'Animals', icons: ['🐘', '🐅', '🦚', '🦜', '🐒', '🐟', '🐢', '🐂', '🐓', '🐍', '🦋', '🐝', '🐬', '🦌', '🐿️', '🦉', '🐕', '🐈', '🐄', '🦢'] },
  { name: 'Food', icons: ['🍛', '🍚', '🥥', '🍌', '🥭', '🍍', '🍵', '☕', '🥘', '🫓', '🍲', '🍢', '🍮', '🍉', '🍇', '🍊', '🥜', '🌶️', '🍯', '🥛'] },
  { name: 'Sports', icons: ['🏏', '⚽', '🏸', '🏐', '🏑', '🥋', '🏹', '🎯', '🏆', '🥇', '🏅', '🚴', '🏃', '🤸', '🎱', '🏓', '🛶', '🥅', '🎳', '🤼'] },
  { name: 'Travel', icons: ['🛺', '🚌', '🚂', '✈️', '🛶', '⛵', '🚲', '🏍️', '🚗', '🗺️', '🧭', '🏕️', '🏖️', '🌉', '🏙️', '🌆', '🎡', '🎢', '🚁', '🛳️'] },
  { name: 'Music', icons: ['🥁', '🪘', '🎻', '🎺', '🎷', '🎸', '🪕', '🎹', '🎤', '🎧', '🎼', '🎵', '🎶', '📻', '🔔', '🪈', '💃', '🕺', '🎭', '🎬'] },
  { name: 'Classic', icons: ['👑', '🎩', '☂️', '🕰️', '📜', '🪶', '🏺', '⚱️', '🗝️', '🔮', '💎', '📯', '🎐', '🏰', '🕯️', '🪞', '🧿', '📿', '🪕', '🎨'] },
  { name: 'Play', icons: ['🎲', '🃏', '🧩', '🪁', '🎮', '♟️', '🎰', '🪀', '🎈', '🛹', '🧸', '🎠', '🪅', '🎪', '🏹', '🎳', '🥏', '🛼', '🎾', '🎯'] },
  { name: 'Lucky', icons: ['🍀', '💰', '🧿', '⭐', '🌟', '🌈', '🔮', '🎁', '💎', '🔔', '🐞', '🦄', '🪙', '🏆', '🎖️', '🥇', '🌠', '🍊', '🐠', '🌞'] },
];
const COLOURS = ['#F6D365', '#F59F9F', '#9EC9F5', '#A8E0B8', '#D5B3F2'];
export const avatarIcon = (id) => { const n = ((id % 1000) + 1000) % 1000; return AVATAR_THEMES[Math.floor(n / 100)].icons[(n % 100) % 20]; };
export const avatarColour = (id) => { const n = ((id % 1000) + 1000) % 1000; return COLOURS[Math.floor((n % 100) / 20)]; };
export function Avatar({ id, size = 40, ring }) {
  return <span class="qav" style={`width:${size}px;height:${size}px;font-size:${Math.round(size * 0.52)}px;background:${avatarColour(id || 0)};${ring ? 'box-shadow:0 0 0 3px var(--card),0 0 0 5px var(--red2)' : ''}`} aria-hidden="true">{avatarIcon(id || 0)}</span>;
}

// Menu pages: How to use, FAQ, Feedback, Disclaimer, Privacy Policy, Terms of Use (adapted from Q Spot 4D for Kerala).
import { useState } from 'preact/hooks';
import { BackBar, toast, APP } from '../ui.jsx';

const NAME = 'Malabar Results';
const EMAIL = 'nkmasstech@gmail.com';
const PUBLISHER = 'Nehru Karupaiya';
const UPDATED = '22 November 2026';

const Panel = ({ children }) => <div class="qpanel">{children}</div>;

const STEPS = [
  ['Results', 'See every Kerala lottery draw on the Home page. Tap a card to open the full result. Use the search card to jump to any date.'],
  ['Live draw', 'On draw days the result fills in live from about 3:00 PM. New numbers flash as they arrive.'],
  ['Predictions', '3 Digit (1st prize chart, board, box and picks) and 4 Digit (₹5,000 to ₹100 prizes). History pages circle the numbers that matched.'],
  ['Lucky Game', 'Open the mystery boxes to get a 3 or 4 digit lucky number and save it to your profile.'],
  ['Vote Poll', 'Pick one digit for A, B and C between 7:00 AM and 3:00 PM. One vote per day. See what others picked after you vote.'],
  ['Community', 'Post your own numbers for today, like, share and save other posts, and follow players. One post per day.'],
  ['Profile', 'Your posts, saved posts, lucky numbers, private picks and winning %. Everything is checked automatically when the result arrives.'],
];
export function HowTo() {
  return (
    <div><BackBar title="How to use" /><div class="qwrap">
      {STEPS.map(([h, b], i) => <Panel key={h}><div style="display:flex;gap:12px;align-items:flex-start"><span class="qstep">{i + 1}</span><div><div style="font-weight:700;margin-bottom:2px">{h}</div><div class="meta" style="line-height:1.55;font-size:13px">{b}</div></div></div></Panel>)}
      <div class="meta" style="font-size:12px;line-height:1.5;margin:6px 4px">For information and entertainment only. {NAME} does not sell tickets or accept bets. 18+</div>
    </div></div>
  );
}

export const FAQ = [
  [`What is ${NAME}?`, 'An app that shows Kerala State Lottery results, number analysis and history-based predictions for information and entertainment.'],
  ['Is the app free?', 'Yes. It is free to use and supported by ads.'],
  ['Can I buy tickets or bet in this app?', 'No. We do not sell tickets, take bets or handle any money. We only show results, analysis and predictions.'],
  ['If I win, can I claim the prize here?', 'No. Claim your prize only through the Kerala State Lotteries Department rules, with your original ticket, after checking the official Government Gazette.'],
  ['Which draws are covered?', 'All seven weekly Kerala draws (Samrudhi, Bhagyathara, Sthree Sakthi, Dhanalekshmi, Karunya Plus, Suvarna Keralam, Karunya) and bumper draws.'],
  ['When are results updated?', 'Live during the draw from about 3:00 PM IST. A fresh result shows a NEW tag.'],
  ['Are the results 100% correct?', 'We collect results from public sources and they may be delayed or wrong. Always check the official Kerala Government Gazette before claiming.'],
  ['Are the predictions sure to win?', 'No. Predictions are made from past results and are only guesses. Nobody can predict a lottery draw.'],
  ['What is the 3 Digit prediction?', 'A chart, board, box and picks for the last 3 digits of the 1st prize, based on past draws.'],
  ['What is the 4 Digit prediction?', '12 numbers for the ₹5,000 to ₹100 prizes. A number wins only if it matches straight (same digits, same order).'],
  ['How does the Lucky Game work?', 'Open the boxes to get a lucky number made from the most common digits of recent 1st prizes. You can save it to your profile.'],
  ['How does the Vote Poll work?', 'Pick one digit for A, B and C. Voting is open 7:00 AM to 3:00 PM, one vote per day. Results show after you vote or after voting closes.'],
  ['How many posts can I make in Community?', 'One post per day, with up to 4 numbers. You can edit once and delete until 1:00 PM.'],
  ['How is the winning % worked out?', 'We check every post when the result arrives. 3 digit numbers match the last 3 of the 1st prize, 4 digit numbers match any prize from ₹5,000 to ₹100. The % shows after 4 checked posts.'],
  ['Can I change my name and avatar?', 'Yes, from Profile. Name up to 3 times (letters only, max 25), avatar up to 3 times.'],
  ['How do I report a bad post?', 'Tap ⋯ on the post and choose Report or Block.'],
  ['Why do I see ads?', 'Ads keep the app free. We try to keep them few and out of the way.'],
  ['How do I turn off notifications?', 'Settings → Notifications, or in your phone settings.'],
  ['Who can use this app?', 'Only adults aged 18 and over, where lotteries are legal.'],
  ['How do I contact you?', `Use Feedback in the menu, or email ${EMAIL}.`],
];
export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div><BackBar title="FAQ" /><div class="qwrap">
      {FAQ.map(([q, a], i) => <Panel key={q}><button class="qfaq" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}><span>{q}</span><span class="qfaq-c">{open === i ? '−' : '+'}</span></button>{open === i && <div class="meta" style="margin-top:8px;line-height:1.6;font-size:13.5px">{a}</div>}</Panel>)}
      <div class="meta" style="font-size:12px;margin:6px 4px">More questions? Use Feedback in the menu.</div>
    </div></div>
  );
}

const KINDS = ['Suggestion', 'Problem', 'Other'];
export function Feedback() {
  const [kind, setKind] = useState('Suggestion'); const [msg, setMsg] = useState('');
  const send = () => { const url = `mailto:${EMAIL}?subject=${encodeURIComponent(`${NAME} feedback: ${kind}`)}&body=${encodeURIComponent(`${msg.trim()}\n\n---\n${NAME} ${APP.version}`)}`; toast('Opening your email app…'); window.location.href = url; };
  return (
    <div><BackBar title="Feedback" /><div class="qwrap"><Panel>
      <div class="meta" style="line-height:1.55;margin-bottom:10px;font-size:13px">Tell us what to improve. Your message opens in your email app, ready to send to us.</div>
      <div class="qchips">{KINDS.map((k) => <button key={k} class={kind === k ? 'qchip on sm' : 'qchip sm'} onClick={() => setKind(k)}>{k}</button>)}</div>
      <textarea class="qinput" rows={6} maxLength={1000} value={msg} placeholder="Write your feedback here" onInput={(e) => setMsg(e.currentTarget.value)} style="height:auto;padding:12px;resize:vertical" />
      <div class="meta" style="text-align:right;font-size:12px;margin:4px 2px 10px">{msg.length}/1000</div>
      <button class="qbtn" disabled={msg.trim().length < 5} onClick={send}>Send feedback</button>
    </Panel></div></div>
  );
}

const DOCS = {
  disclaimer: ['Disclaimer', [
    ['For information and entertainment only', `${NAME} shows Kerala lottery results, statistics, analysis and number suggestions for information and entertainment. It does not sell tickets, accept bets, handle money, offer prizes or run any draw.`],
    ['No guarantee', 'Predictions, charts, lucky numbers, poll results and community posts are statistical guesses or personal opinions. They are not advice and are not guaranteed. Nobody can predict a lottery draw. Past results do not affect future draws.'],
    ['Not affiliated', `${NAME} is an independent app published by ${PUBLISHER}. It is not affiliated with, endorsed by or connected to the Kerala State Lotteries Department or the Government of Kerala.`],
    ['Results are not official', `Results are compiled from publicly available sources and may be delayed, incomplete or wrong. Always verify with the official Kerala Government Gazette before claiming any prize. If you want any data removed or changed, email ${EMAIL}.`],
    ['No online games', 'We do not promote online lottery, 3-digit games, betting or gambling of any kind. Please do not misuse the numbers shown here.'],
    ['Your local laws', 'Lottery laws are different in every state and country. Kerala lottery tickets are sold only in Kerala. You are responsible for following the laws where you live.'],
    ['Age and responsibility', 'You must be 18 or older. Never spend money you cannot afford to lose.'],
    ['Ads and links', 'The app may show ads. We do not control the ads, the cookies they use or the websites you reach from them.'],
  ]],
  privacy: ['Privacy Policy', [
    ['Who we are', `${NAME} is published by ${PUBLISHER}, India. Contact: ${EMAIL}`],
    ['What we collect', 'In the app: the name and sticker (avatar) you choose, the predictions you post, your likes, saves, follows, blocks and reports, your poll votes and your saved lucky numbers. Theme, language and sound choices stay on your phone. When sign-in is added, your Google name, email and account ID will be used to run your account.'],
    ['What we do not collect', 'We do not collect your precise location, contacts, photos, microphone or payment details.'],
    ['How we use it', 'To run the app, show your posts and profile to other players, work out winning percentages, check saved numbers when results arrive and keep the community safe. We never sell your personal data.'],
    ['Services we use', 'The online community will use Google Firebase. Ads may be shown through Google AdMob, which may use your advertising ID. You can reset or limit it in your Android settings.'],
    ['Ads', 'Ads may be personalized. If you turn personalization off, you will still see ads, but not based on your interests.'],
    ['Your choices', 'You can change your name and avatar within the limits shown, and ask us by email to access, correct or delete your data.'],
    ['Children', 'This app is only for adults aged 18 and over.'],
    ['Changes', 'We may update this policy. The date below shows the latest version.'],
  ]],
  terms: ['Terms of Use', [
    ['Using the app', `By using ${NAME} you agree to these terms. You must be 18 or older and use the app only for personal, lawful purposes.`],
    ['Not a gambling service', 'The app only shows information and entertainment. We do not sell tickets, take bets, hold money or pay prizes.'],
    ['Community rules', 'Post only your own number picks. No abuse, hate, threats, adult content, scams, false winning claims, spam, ads, links or other people\'s personal details. One post per day.'],
    ['Reports and moderation', 'You can report any post and block any player. We may hide or remove posts and suspend accounts that break the rules.'],
    ['No guarantees', 'The app is provided as is. We do not promise that results, predictions or numbers are accurate, winning or always available.'],
    ['Limit of responsibility', 'To the fullest extent the law allows, we are not responsible for any loss from using the app, including money spent on lottery tickets.'],
    ['Governing law', 'These terms are governed by the laws of India.'],
    ['Contact', `${PUBLISHER} · ${EMAIL}`],
  ]],
};
export function Legal({ kind }) {
  const [title, body] = DOCS[kind] || DOCS.disclaimer;
  return (
    <div><BackBar title={title} /><div class="qwrap"><Panel>
      {body.map(([h, p]) => <div key={h} style="margin-bottom:14px"><div style="font-weight:700;margin-bottom:3px">{h}</div><div class="meta" style="line-height:1.65;font-size:13.5px">{p}</div></div>)}
      <div class="meta" style="font-size:12px">Last updated: {UPDATED}</div>
    </Panel></div></div>
  );
}

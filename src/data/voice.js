// Reads numbers aloud in a female voice (native TTS on the phone, browser voice as fallback)
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

let voiceIdx = null; let picked = false;
async function pickVoice() {
  if (picked) return voiceIdx; picked = true;
  try {
    const { voices } = await TextToSpeech.getSupportedVoices();
    const score = (v) => { const n = `${v.name || ''} ${v.voiceURI || ''}`.toLowerCase(); const l = (v.lang || '').toLowerCase(); let s = 0; if (l.startsWith('en-in')) s += 4; else if (l.startsWith('en')) s += 2; if (/female|woman|-ena|-enc|-ene|-ahp|#female/.test(n)) s += 5; if (/male/.test(n) && !/female/.test(n)) s -= 6; if (/network|online/.test(n)) s -= 1; return s; };
    let best = -1; let bi = null; (voices || []).forEach((v, i) => { const s = score(v); if (s > best) { best = s; bi = i; } });
    voiceIdx = bi;
  } catch (e) { voiceIdx = null; }
  return voiceIdx;
}
const queue = []; let busy = false;
async function run() {
  if (busy) return; busy = true;
  while (queue.length) {
    const text = queue.shift();
    try {
      if (Capacitor.isNativePlatform()) { const v = await pickVoice(); await TextToSpeech.speak({ text, lang: 'en-IN', rate: 0.85, pitch: 1.1, volume: 1, category: 'ambient', ...(v != null ? { voice: v } : {}) }); }
      else if (window.speechSynthesis) {
        await new Promise((ok) => { const u = new SpeechSynthesisUtterance(text); u.rate = 0.85; u.pitch = 1.1; const vs = speechSynthesis.getVoices(); u.voice = vs.find((x) => /female|zira|heera|veena|samantha/i.test(x.name)) || vs.find((x) => /^en-IN/.test(x.lang)) || null; u.onend = ok; u.onerror = ok; speechSynthesis.speak(u); });
      }
    } catch (e) { /* ignore */ }
  }
  busy = false;
}
export const sayNumber = (prefix, num) => { queue.push(`${prefix ? prefix + '. ' : ''}${String(num).replace(/\s+/g, ' ').split('').join(' ')}`); run(); };
export const stopVoice = () => { queue.length = 0; try { if (Capacitor.isNativePlatform()) TextToSpeech.stop(); else window.speechSynthesis && speechSynthesis.cancel(); } catch (e) { /* ignore */ } };

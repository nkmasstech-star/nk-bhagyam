// In-app update for test builds: compare our build number with the latest GitHub "Test APK" build.
import { registerPlugin } from '@capacitor/core';
import { App } from '@capacitor/app';
export const Updater = registerPlugin('Updater');
const BASE = 'https://github.com/nkmasstech-star/nk-bhagyam/releases/download/test-apk/';
export const APK_URL = BASE + 'Malabar-test.apk';
export async function currentBuild() { try { const i = await App.getInfo(); return parseInt(i.build, 10) || 0; } catch (e) { return 0; } }
export async function latestBuild() {
  const r = await fetch(BASE + 'version.json?t=' + Date.now(), { cache: 'no-store' });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json(); // { build, note }
}

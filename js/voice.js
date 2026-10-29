// Skip reads the cards aloud: the question, each answer choice with its letter, and after he
// answers, the call plus the "why". Recorded clips (tools/make_voice.py → audio/), not the
// device's robot voice. Answer choices are separate clips because their order is shuffled
// every time, so the letters get stitched in to match the screen.
//
// On by default; the speaker button in a lesson mutes it (remembered on this device).

import { VOICE } from './voice-manifest.js';

/** Shared lines (keys line:<name>). Changing one means re-running tools/make_voice.py. */
export const VOICE_LINES = {
  A: 'A.', B: 'B.', C: 'C.', D: 'D.', E: 'E.', F: 'F.',
  true: 'True.', false: 'False.',
  'right-0': 'Correct!', 'right-1': 'Nice read!', 'right-2': 'Heads up!', 'right-3': 'You knew it!', 'right-4': 'Smart play!',
  out: 'That\'s an out.', inning: 'Inning\'s over.', notQuite: 'Not quite.',
  answerIs: 'The answer is:',
};

const PREF_KEY = 'next-pitch:voice';
let audio = null;
let queue = [];
let token = 0;
let lastKey = null;
let unlocked = false;

export function voiceOn() {
  try { return localStorage.getItem(PREF_KEY) !== 'off'; } catch { return true; }
}

export function setVoiceOn(on) {
  try { localStorage.setItem(PREF_KEY, on ? 'on' : 'off'); } catch { /* private mode */ }
  if (!on) stopVoice();
}

export function stopVoice() {
  token += 1;
  queue = [];
  if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); }
}

// iOS only plays audio that a tap started, until the element has played once. A tiny silent
// clip played right inside the tap unlocks it for everything after.
const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
const blobs = new Map(); // clip file → Promise<object URL>

/** Fetch a clip whole (so the service worker can cache it for offline) and keep it in memory. */
function load(file) {
  if (!blobs.has(file)) {
    blobs.set(file, fetch(`audio/${file}`)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(r.status))))
      .then((b) => URL.createObjectURL(b))
      .catch((err) => { blobs.delete(file); throw err; }));
  }
  return blobs.get(file);
}

/** Start downloading clips before they're needed (the answer while the question reads). */
export function preload(keys) {
  for (const k of keys) if (VOICE[k]) load(VOICE[k]).catch(() => {});
}

/** Play clip keys in order. Keys without a recording are skipped. */
export function speak(keys, delay = 0) {
  stopVoice();
  if (!voiceOn()) return;
  if (!audio) audio = new Audio();
  if (!unlocked) {
    audio.src = SILENT;
    audio.play().then(() => { unlocked = true; }).catch(() => {});
  }
  const my = token;
  queue = keys.map((k) => VOICE[k]).filter(Boolean);
  queue.forEach((f) => load(f).catch(() => {}));
  const next = async () => {
    if (my !== token || !queue.length) return;
    let url;
    try { url = await load(queue.shift()); } catch { next(); return; }
    if (my !== token) return;
    audio.src = url;
    audio.onended = () => setTimeout(next, 110);
    audio.play().catch(() => { /* blocked or offline: stay quiet */ });
  };
  setTimeout(next, delay);
}

/**
 * Call after every render with what's on screen. Reads a card once when it appears, and the
 * answer once it's checked; re-renders of the same moment don't repeat anything.
 *   ctx: { key, conceptId, variant, order, tf, answered, correct, rightIndex, resultLine }
 */
export function syncVoice(ctx) {
  if (!ctx || !ctx.key) { if (lastKey) { stopVoice(); lastKey = null; } return; }
  const moment = `${ctx.key}:${ctx.answered ? 'a' : 'q'}`;
  if (moment === lastKey) return;
  lastKey = moment;
  speak(ctx.answered ? answerKeys(ctx) : questionKeys(ctx), ctx.answered ? 450 : 250);
  if (!ctx.answered) preload([`line:${ctx.resultLine}`, 'line:out', 'line:answerIs', ...ctx.order.map((i) => choiceKey(ctx, i)), `${ctx.conceptId}:why`]);
}

/** Read the card on screen again (the speaker button). */
export function replayVoice(ctx) {
  if (!ctx || !ctx.key) return;
  lastKey = `${ctx.key}:${ctx.answered ? 'a' : 'q'}`;
  speak(ctx.answered ? answerKeys(ctx) : questionKeys(ctx));
}

function choiceKey(ctx, i) {
  if (ctx.tf) return i === 0 ? 'line:true' : 'line:false';
  return `${ctx.conceptId}:${ctx.variant}:c${i}`;
}

function questionKeys(ctx) {
  const keys = [`${ctx.conceptId}:${ctx.variant}:q`];
  if (!ctx.tf) ctx.order.forEach((i, pos) => keys.push(`line:${'ABCDEF'[pos]}`, choiceKey(ctx, i)));
  return keys;
}

function answerKeys(ctx) {
  const keys = [`line:${ctx.resultLine}`];
  if (!ctx.correct) keys.push('line:answerIs', choiceKey(ctx, ctx.rightIndex));
  keys.push(`${ctx.conceptId}:why`);
  return keys;
}

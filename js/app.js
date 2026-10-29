import { loadCredentials, saveCredentials, loadCachedState, saveCachedState, loadDraftDay, saveDraftDay, clearDraftDay, loadIqLesson, saveIqLesson, clearIqLesson } from './state.js';
import { fetchState, commitMutation, seedState, GistError } from './gist.js';
import { emptyState, getContentForDayIndex, PRACTICE_ENABLED, PLAYER_NAME, RESET_ACTION_OPTIONS, RESET_PHRASE_OPTIONS, RESET_TRIGGER_OPTIONS, HOME_PRACTICE_TYPE_OPTIONS, TEAM_PRACTICE_TYPE_OPTIONS } from './data.js';
import { IQ_REWARDS, IQ_UNITS } from './iq-content.js';
import { PLAYS } from './iq-plays.js';
import { fieldHtml, syncField } from './field.js';
import { syncVoice, replayVoice, stopVoice, voiceOn, setVoiceOn } from './voice.js';
import {
  OUTS_PER_INNING, MASTERED_BOX, RANKS, todayKey, normalizeIq, outsToday, rankFor, conceptById, resolveVariant,
  unitStatuses, freshConceptIds, masteryTotals, makeCard, buildLesson, buildReviewLesson, applyLesson, displayStreak, weekPlayed,
} from './iq.js';

const root = document.getElementById('root');

// ---------- icons ----------
// Inline SVGs on currentColor, so each one picks up the color of wherever it sits.

const ICONS = {
  flame: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 1.8c.7 3.6-1.6 5.6-2.6 7.8-.6 1.4-.3 3.2 1.3 3.6 1.4.3 2.5-.8 2.3-2.4 2.9 1.8 4.5 4.6 4.5 7.1A6 6 0 0 1 12 24a6.6 6.6 0 0 1-6.5-6.4c0-6.4 6.3-8.4 7-15.8z"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 1.5 4 13.6h6.6L9.6 22.5l9.4-12.3h-6.6z"/></svg>',
  ball: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9.5"/><path d="M7 4.2c2 2.3 2 13.3 0 15.6M17 4.2c-2 2.3-2 13.3 0 15.6"/></svg>',
  diamond: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M12 3.5 20.5 12 12 20.5 3.5 12z"/><rect x="10.3" y="1.8" width="3.4" height="3.4" transform="rotate(45 12 3.5)" fill="currentColor"/><rect x="18.8" y="10.3" width="3.4" height="3.4" transform="rotate(45 20.5 12)" fill="currentColor"/><rect x="1.8" y="10.3" width="3.4" height="3.4" transform="rotate(45 3.5 12)" fill="currentColor"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h10v5a5 5 0 0 1-10 0z"/><path d="M7 5H4v1.5A3.5 3.5 0 0 0 7.5 10M17 5h3v1.5A3.5 3.5 0 0 1 16.5 10M12 13v4M8 21h8M9.5 17h5"/></svg>',
  person: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  bat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round"><path d="M18.5 3.5 7 15" stroke-width="4.5"/><path d="M7 15l-2.5 2.5" stroke-width="2"/><circle cx="3.6" cy="18.4" r="1.6" fill="currentColor" stroke="none"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 10V7.5a5 5 0 0 1 10 0V10h.5A1.5 1.5 0 0 1 19 11.5v8a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5v-8A1.5 1.5 0 0 1 6.5 10zm2.5 0h5V7.5a2.5 2.5 0 0 0-5 0z"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2.5 2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6L2.5 9.3l6.6-.8z"/></svg>',
  speaker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.3 6.3a8 8 0 0 1 0 11.4"/></svg>',
  speakerOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.8 1.8 11.4h3V21h5.4v-6h3.6v6h5.4v-9.6h3z"/></svg>',
  gem: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.8 21 7v10l-9 5.2L3 17V7z" opacity=".55"/><path d="M12 1.8 21 7l-9 5.2L3 7z"/><path d="M12 12.2V22.2L3 17V7z" opacity=".8"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.5 20.5 5v6.5c0 5.3-3.6 9.3-8.5 11-4.9-1.7-8.5-5.7-8.5-11V5z"/><path d="m12 6.5 1.6 3.3 3.6.5-2.6 2.5.6 3.6L12 14.7l-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" fill="#0b1524"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M1.8 12S5.6 5 12 5s10.2 7 10.2 7-3.8 7-10.2 7S1.8 12 1.8 12z"/><circle cx="12" cy="12" r="3.4" fill="currentColor"/></svg>',
  mitt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.6 21.5c-3.8-2-5.1-6.6-3.9-12.2.6-2.8 3-3.1 3.6-.9l.6 3 .4-6.2c.1-2.5 3.1-2.5 3.3 0l.4 5.8.6-6.4c.3-2.5 3.2-2.2 3.2.2l-.1 6.4 1.2-4.3c.8-2.4 3.7-1.6 3.3.8l-1.2 6.6c1.6-1.1 3.5.2 2.5 2-1.9 3.4-5 6-9.3 6.2z"/></svg>',
  base: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5 21.5 12 12 21.5 2.5 12z"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="5.2"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/></svg>',
  runner: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="15" cy="4" r="2.4"/><path d="M13.2 7.2 8.8 8.6 6.6 12.3l1.8 1 1.7-2.8 2-.6-1.8 5.1-3.2 4.2 1.7 1.4 3.6-4.6 2.3 2.2V23h2.2v-6.3l-2.6-2.6 1.1-3.3 1.2 1.7 3.5.8.5-2-2.8-.7-2.1-3.3c-.6-.9-1.6-1.3-2.5-1.1z"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"><path d="M4 4.5A2 2 0 0 1 6 2.5h14v16H6a2 2 0 0 0-2 2z"/><path d="M4 20.5a2 2 0 0 0 2 2h14v-4"/><path d="M9 7.5h7M9 11h5" stroke-linecap="round"/></svg>',
  brain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 3.5a3 3 0 0 0-3 3 3 3 0 0 0-2.5 4.5A3.5 3.5 0 0 0 6 17.5a3 3 0 0 0 3.5 3V3.5zM14.5 3.5a3 3 0 0 1 3 3 3 3 0 0 1 2.5 4.5 3.5 3.5 0 0 1-2 6.5 3 3 0 0 1-3.5 3V3.5z"/></svg>',
  glove: '<svg viewBox="0 0 40 40"><path fill="#e07a3f" d="M13 35c-6-3.5-8-11-6-20 1-4.5 5-5 6-1.5l1 5 .6-10c.2-4 5-4 5.3 0l.6 9.4 1-10.4c.4-4 5.2-3.6 5.2.3l-.2 10.4 2-7c1.2-3.8 6-2.5 5.2 1.3L31 23c2.6-1.8 5.6.4 4 3.3-3 5.5-8 9.7-15 10z"/><path fill="none" stroke="#b85f2c" stroke-width="1.6" stroke-linecap="round" d="M14.5 19c3 2.5 9 2.5 13 .5M13 27c4 3 10 3 15 0"/></svg>',
};

function icon(name) {
  return ICONS[name] || '';
}

// ---------- Skip, the mascot ----------
// Jay's Heads Up brand art (retro rubber-hose cartoon). Heads for reactions, full-body
// poses for the bigger moments. Source art lives in _brand/art/ (local only);
// tools/process_art.py resizes it into img/.
// Old mood names still work: happy, cheer, oops, think.

const SKIP_MOODS = { cheer: 'excited', oops: 'surprised', think: 'thinking' };

function skipSvg(mood = 'happy', extraClass = '') {
  const name = SKIP_MOODS[mood] || mood;
  return `<img class="skip ${extraClass}" src="img/skip/head-${name}.webp" alt="" draggable="false">`;
}

function poseImg(pose, extraClass = '') {
  return `<img class="pose ${extraClass}" src="img/skip/pose-${pose}.webp" alt="" draggable="false">`;
}

// ---------- sound ----------
// Tiny synthesized cues (no audio files to download or cache): a two-note ding for a right
// answer, a low buzz for an out, a short arpeggio for finishing a lesson. Muted from Me.

const SOUND_KEY = 'heads-up:sound';
let soundOn = localStorage.getItem(SOUND_KEY) !== 'off';
let audioCtx = null;

function playSound(kind) {
  if (!soundOn) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = {
      right: [[880, 0, 0.09], [1318.5, 0.09, 0.16]],
      wrong: [[196, 0, 0.18], [155.6, 0.16, 0.24]],
      done: [[659.3, 0, 0.1], [784, 0.1, 0.1], [1046.5, 0.2, 0.22]],
    }[kind];
    const type = kind === 'wrong' ? 'triangle' : 'sine';
    for (const [freq, start, dur] of notes) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const t = audioCtx.currentTime + start;
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    }
  } catch {
    // no audio available — silently skip, sound is a bonus
  }
}

// ---------- brand ----------

function brandHtml() {
  return `
    <button type="button" class="brand" data-action="brand-tap" aria-label="Heads Up">
      <img class="brand-logo" src="img/logo.webp" alt="Heads Up Baseball IQ" draggable="false">
    </button>
  `;
}

// Kept for the (hidden) practice flow's markup.
function plateIcon() {
  return '<span class="plate-icon"></span>';
}
function stitchIcon() {
  return '<svg class="stitch-icon" width="10" height="10" viewBox="0 0 10 10"><line x1="1" y1="1" x2="9" y2="9" stroke-width="1.6" stroke-linecap="round"/><line x1="9" y1="1" x2="1" y2="9" stroke-width="1.6" stroke-linecap="round"/></svg>';
}

let brandTapCount = 0;
let brandTapTimer = null;

let toastMessage = null;
let toastTimer = null;

function showToast(message) {
  toastMessage = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastMessage = null;
    render();
  }, 2600);
}

function toastHtml() {
  return toastMessage ? `<div class="toast" role="status">${escapeHtml(toastMessage)}</div>` : '';
}

let creds = loadCredentials();
let gistState = loadCachedState();
let draftDay = loadDraftDay();
let iqLesson = loadIqLesson();
let iqResult = null; // summary shown on the end-of-lesson screen; not persisted

// 'connect' | 'confirmReset' | 'iqHome' | 'iqRewards' | 'iqMe' | 'iqLesson' | 'iqResult'
// plus the practice flow's 'onboarding' | 'home' | 'day' when PRACTICE_ENABLED
let view = 'loading';
let statusMessage = '';
let statusIsError = false;
let busy = false;
let connectShowGist = false;

// first-launch tour
let tourStep = 0;
let tourName = '';

let onboardingStep = 1;
let onboardingDraft = { action: null, phrase: null, triggers: [] };
let onboardingShowActionCustom = false;
let onboardingShowPhraseCustom = false;

let checkinDraft = { practiced: null, practiceType: [], practiceTypeOther: '', voiceFeedback: '' };

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function setStatus(message, isError = false) {
  statusMessage = message;
  statusIsError = isError;
}

function statusHtml() {
  return statusMessage ? `<p class="status ${statusIsError ? 'status-error' : ''}">${escapeHtml(statusMessage)}</p>` : '';
}

// ---------- boot ----------

function isLocal() {
  return creds?.mode === 'local';
}

/** Every write goes through here: local mode saves on this device, Gist mode runs the
 *  race-safe fetch → mutate → write → confirm cycle. Same mutate(fresh) => newState shape. */
async function saveState(mutate) {
  if (isLocal()) {
    const newState = mutate(structuredClone(gistState || emptyState()));
    saveCachedState(newState);
    return newState;
  }
  return commitMutation(creds.token, creds.gistId, mutate);
}

function playerName() {
  return gistState?.profile?.name || PLAYER_NAME;
}

async function boot() {
  if (!creds) {
    view = 'connect';
    render();
    return;
  }
  if (isLocal()) {
    gistState = loadCachedState() || emptyState();
    routeAfterLoad();
    render();
    return;
  }
  await refreshFromGist({ silent: true });
}

function startLocal() {
  creds = { mode: 'local' };
  saveCredentials(creds);
  gistState = loadCachedState() || emptyState();
  saveCachedState(gistState);
  setStatus('');
  routeAfterLoad();
  render();
}

async function refreshFromGist({ silent } = {}) {
  try {
    const { state } = await fetchState(creds.token, creds.gistId);
    gistState = state;
    saveCachedState(state);
    if (!silent) setStatus('');
    routeAfterLoad();
  } catch (err) {
    if (gistState) {
      setStatus('Offline — showing your last saved data.', false);
      routeAfterLoad();
    } else {
      view = 'connect';
      setStatus(err instanceof GistError ? err.message : String(err), true);
    }
  }
  render();
}

/** Where "home" is depends on the launch switch — Game IQ only, or the full practice app. */
function homeView() {
  return PRACTICE_ENABLED ? 'home' : 'iqHome';
}

function routeAfterLoad() {
  if (iqLesson) {
    view = 'iqLesson';
    return;
  }
  if (!PRACTICE_ENABLED) {
    if (!gistState.profile?.tourDone) {
      tourStep = 0;
      tourName = gistState.profile?.name || '';
      view = 'tour';
      return;
    }
    view = 'iqHome';
    return;
  }
  if (draftDay) {
    view = 'day';
    return;
  }
  view = gistState.resetRoutine ? 'home' : 'onboarding';
}

// ---------- connect screen ----------

function renderConnectScreen() {
  return `
    <div class="focus">
      <div class="focus-center">
        <div class="focus-center-inner">
          <img class="splash-logo" src="img/logo.webp" alt="Heads Up Baseball IQ">
          <div class="splash-art">${poseImg('primary', 'skip-hello')}<div class="splash-bubble">Smart players see more.</div></div>
          ${connectShowGist ? `
          <p class="body">Sync this device to a private GitHub Gist so progress is backed up.</p>
          <form id="connect-form" class="focus-center-inner" style="gap:14px">
            <label class="field-label">Gist ID
              <input type="text" id="input-gist-id" class="input" placeholder="e.g. 8f2c1a9b..." autocomplete="off" autocapitalize="off" spellcheck="false" required />
            </label>
            <label class="field-label">Access Token
              <input type="password" id="input-token" class="input" placeholder="github_pat_..." autocomplete="off" autocapitalize="off" spellcheck="false" required />
            </label>
            <button type="submit" class="btn btn-red btn-block" ${busy ? 'disabled' : ''}>${busy ? 'Connecting…' : 'Connect'}</button>
          </form>
          <button class="link-btn" style="align-self:center" data-action="connect-toggle">‹ Back</button>
          ` : `
          <p class="body">Baseball IQ, one play at a time. Read the situation, make the smart call, and get better every day.</p>
          <button class="btn btn-red btn-block" data-action="start-local">Get started</button>
          <button class="link-btn" style="align-self:center" data-action="connect-toggle">Sync with a Gist instead</button>
          `}
          ${statusHtml()}
        </div>
      </div>
    </div>
  `;
}

async function handleConnectSubmit(e) {
  e.preventDefault();
  const gistId = document.getElementById('input-gist-id').value.trim();
  const token = document.getElementById('input-token').value.trim();
  if (!gistId || !token) return;
  busy = true;
  setStatus('');
  render();
  try {
    let state;
    try {
      ({ state } = await fetchState(token, gistId));
    } catch (err) {
      const isMissingFile = err instanceof GistError && /has no .* file/i.test(err.message);
      if (!isMissingFile) throw err;
      state = await seedState(token, gistId, emptyState());
    }
    creds = { token, gistId };
    saveCredentials(creds);
    gistState = state;
    saveCachedState(state);
    busy = false;
    routeAfterLoad();
  } catch (err) {
    busy = false;
    setStatus(err instanceof GistError ? err.message : String(err), true);
  }
  render();
}

// ---------- onboarding ----------

function progressDots(total, current) {
  let dots = '';
  for (let i = 1; i <= total; i++) {
    dots += `<svg class="dot ${i <= current ? 'dot-active' : ''}" width="10" height="10" viewBox="0 0 10 10"><line x1="1" y1="1" x2="9" y2="9" stroke-width="1.6" stroke-linecap="round"/><line x1="9" y1="1" x2="1" y2="9" stroke-width="1.6" stroke-linecap="round"/></svg>`;
  }
  return `<div class="dots">${dots}</div>`;
}

function renderOnboarding() {
  let body;
  if (onboardingStep === 1) body = onboardingScreen1();
  else if (onboardingStep === 2) body = onboardingScreen2();
  else if (onboardingStep === 3) body = onboardingScreen3();
  else if (onboardingStep === 4) body = onboardingScreen4();
  else body = onboardingScreen5();

  return `
    <div class="screen screen-onboarding">
      <div class="screen-inner">
        ${progressDots(5, onboardingStep)}
        ${body}
      </div>
    </div>
  `;
}

function onboardingScreen1() {
  return `
    <h1 class="onb-title">Practice mode</h1>
    <p class="onb-body">Built around one idea: no matter what just happened —
      good or bad — the only thing that matters is the next pitch.</p>
    <p class="onb-body">Most days: a quick Reset Rep, two short videos (mental game, then
      mechanics), then go practice on your own. Had team practice instead? You can skip
      straight to logging how it went.</p>
    <p class="onb-body">First, let's build your <strong>Reset Play</strong> — your own
      routine for letting go of a strikeout, an error, or a bad call fast, so it doesn't
      wreck your next pitch.</p>
    <button class="btn btn-primary btn-plate btn-block" data-action="onboarding-next">Let's go</button>
  `;
}

function optionCard(label, action, value, selected) {
  return `<button class="option-card ${selected ? 'option-card-selected' : ''}" data-action="${action}" data-value="${escapeHtml(value)}">${escapeHtml(label)}</button>`;
}

function onboardingScreen2() {
  const customValue = onboardingShowActionCustom && onboardingDraft.action && !RESET_ACTION_OPTIONS.includes(onboardingDraft.action) ? onboardingDraft.action : '';
  return `
    <button class="back-link" data-action="onboarding-back">‹ Back</button>
    <h1 class="onb-title">When something goes wrong, what feels like it would help you "shake it off"?</h1>
    <div class="option-list">
      ${RESET_ACTION_OPTIONS.map((opt) => optionCard(opt, 'pick-action', opt, onboardingDraft.action === opt)).join('')}
      ${optionCard('Something else', 'show-action-custom', 'custom', onboardingShowActionCustom)}
    </div>
    ${onboardingShowActionCustom ? `
      <input type="text" id="input-action-custom" class="text-input" placeholder="Type your own…" value="${escapeHtml(customValue)}" />
      <button class="btn btn-primary btn-plate btn-block" data-action="confirm-action-custom">Continue</button>
    ` : ''}
  `;
}

function onboardingScreen3() {
  const customValue = onboardingShowPhraseCustom && onboardingDraft.phrase && !RESET_PHRASE_OPTIONS.some((p) => p.label === onboardingDraft.phrase) ? onboardingDraft.phrase : '';
  return `
    <button class="back-link" data-action="onboarding-back">‹ Back</button>
    <h1 class="onb-title">What's something you could say to yourself to move on?</h1>
    <div class="option-list">
      ${RESET_PHRASE_OPTIONS.map((opt) => `
        <button class="option-card ${onboardingDraft.phrase === opt.label ? 'option-card-selected' : ''}" data-action="pick-phrase" data-value="${escapeHtml(opt.label)}">
          "${escapeHtml(opt.label)}"
          ${opt.blurb ? `<span class="option-blurb">${escapeHtml(opt.blurb)}</span>` : ''}
        </button>
      `).join('')}
      ${optionCard('Write my own', 'show-phrase-custom', 'custom', onboardingShowPhraseCustom)}
    </div>
    ${onboardingShowPhraseCustom ? `
      <input type="text" id="input-phrase-custom" class="text-input" placeholder="Type your own…" value="${escapeHtml(customValue)}" />
      <button class="btn btn-primary btn-plate btn-block" data-action="confirm-phrase-custom">Continue</button>
    ` : ''}
  `;
}

function onboardingScreen4() {
  const allSelected = RESET_TRIGGER_OPTIONS.every((opt) => onboardingDraft.triggers.includes(opt.key));
  return `
    <button class="back-link" data-action="onboarding-back">‹ Back</button>
    <h1 class="onb-title">When do you want to use your reset?</h1>
    <div class="option-list">
      ${RESET_TRIGGER_OPTIONS.map((opt) => `
        <button class="option-card checkable ${onboardingDraft.triggers.includes(opt.key) ? 'option-card-selected' : ''}" data-action="toggle-trigger" data-value="${opt.key}">
          <span class="check-box">${onboardingDraft.triggers.includes(opt.key) ? '✓' : ''}</span>
          ${escapeHtml(opt.label)}
        </button>
      `).join('')}
      <button class="option-card ${allSelected ? 'option-card-selected' : ''}" data-action="select-all-triggers">All of the above</button>
    </div>
    <button class="btn btn-primary btn-plate btn-block" data-action="onboarding-next" ${onboardingDraft.triggers.length === 0 ? 'disabled' : ''}>Continue</button>
  `;
}

function resetCardHtml(routine) {
  const triggerLabels = routine.triggers.map((k) => RESET_TRIGGER_OPTIONS.find((o) => o.key === k)?.label || k);
  return `
    <div class="reset-card">
      <div class="reset-card-label">RESET PLAY</div>
      <div class="reset-card-row"><span class="reset-card-key">Do</span><span class="reset-card-value">${escapeHtml(routine.action)}</span></div>
      <div class="reset-card-row"><span class="reset-card-key">Say</span><span class="reset-card-value">"${escapeHtml(routine.phrase)}"</span></div>
      <div class="reset-card-anchor">Next Pitch</div>
      <div class="reset-card-triggers">Use it after: ${triggerLabels.map(escapeHtml).join(' · ')}</div>
    </div>
  `;
}

function onboardingScreen5() {
  return `
    <button class="back-link" data-action="onboarding-back">‹ Back</button>
    <h1 class="onb-title">This is your Reset Play</h1>
    ${resetCardHtml(onboardingDraft)}
    <p class="onb-body">You'll do a quick rep of this every day before you go practice.</p>
    <button class="btn btn-primary btn-plate btn-block" data-action="save-reset-routine" ${busy ? 'disabled' : ''}>${busy ? 'Saving…' : 'This is my Reset Play!'}</button>
    ${statusMessage ? `<p class="status ${statusIsError ? 'status-error' : ''}">${escapeHtml(statusMessage)}</p>` : ''}
  `;
}

async function saveResetRoutine() {
  busy = true;
  setStatus('');
  render();
  try {
    const routine = {
      action: onboardingDraft.action,
      phrase: onboardingDraft.phrase,
      triggers: onboardingDraft.triggers,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const newState = await saveState((fresh) => {
      fresh.resetRoutine = routine;
      return fresh;
    });
    gistState = newState;
    saveCachedState(newState);
    busy = false;
    view = 'home';
  } catch (err) {
    busy = false;
    setStatus(err instanceof GistError ? err.message : String(err), true);
  }
  render();
}

// ---------- home ----------

/** Total days, team-vs-solo split, and a frequency count of every "what did you work on?"
 *  answer ever given (home + team options + typed "Something else" text all mixed into one
 *  list — they're just strings, and a combined view is still meaningful without needing two
 *  separate breakdowns on an already-busy home screen). */
function computeStats(days) {
  const totalDays = days.length;
  const teamCount = days.filter((d) => d.teamPractice === true).length;
  const soloCount = totalDays - teamCount;
  const counts = {};
  for (const d of days) {
    for (const t of d.practiceType || []) {
      counts[t] = (counts[t] || 0) + 1;
    }
  }
  const breakdown = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return { totalDays, teamCount, soloCount, breakdown };
}

function practiceBreakdownHtml(stats) {
  if (stats.breakdown.length === 0) {
    return `
      <div class="section-title">${stitchIcon()}Practice Breakdown</div>
      <p class="onb-body">Log a few days and your most-worked-on drills will show up here.</p>
    `;
  }
  const maxCount = stats.breakdown[0][1];
  return `
    <div class="section-title">${stitchIcon()}Practice Breakdown</div>
    <div class="bar-list">
      ${stats.breakdown.map(([label, count]) => `
        <div class="bar-row">
          <span class="bar-label">${escapeHtml(label)}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${Math.round((count / maxCount) * 100)}%"></div></div>
          <span class="bar-count">${count}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderHome() {
  const streak = gistState.currentStreak || 0;
  const longest = gistState.longestStreak || 0;
  const dayNumber = gistState.days.length + 1;
  const stats = computeStats(gistState.days);
  return `
    <div class="screen screen-home">
      <div class="screen-inner">
        <div class="hero">
          <div class="hero-tag">Streak</div>
          <div>
            <div class="streak-number">${streak}</div>
            <div class="streak-label">day streak</div>
          </div>
          <div class="hero-best">
            <div class="hero-best-num">${longest}</div>
            <div class="hero-best-label">best</div>
          </div>
        </div>

        <div class="mini-stats-row">
          <div class="mini-stat"><span class="mini-stat-num">${stats.totalDays}</span><span class="mini-stat-label">days logged</span></div>
          <div class="mini-stat"><span class="mini-stat-num">${stats.teamCount}</span><span class="mini-stat-label">team</span></div>
          <div class="mini-stat"><span class="mini-stat-num">${stats.soloCount}</span><span class="mini-stat-label">solo</span></div>
        </div>

        <div class="day-card">
          <div class="day-num">NO. ${String(dayNumber).padStart(2, '0')}</div>
          <div class="day-card-label">${plateIcon()}Day ${dayNumber}</div>
          <p class="day-card-body">Team practice or on your own — let's check in.</p>
          <button class="btn btn-primary btn-plate btn-block btn-large" data-action="start-day">Start Today →</button>
        </div>

        <div class="day-card">
          <div class="day-card-label">${plateIcon()}Game IQ</div>
          <p class="day-card-body">Quick game situations. Know what to do before the ball's hit.</p>
          <button class="btn btn-outline btn-block" data-action="iq-open">Play Game IQ →</button>
        </div>

        <div class="section">
          <div class="section-title">${stitchIcon()}Your Reset Play</div>
          ${resetCardHtml(gistState.resetRoutine)}
        </div>

        <div class="section">
          ${practiceBreakdownHtml(stats)}
        </div>

        ${statusMessage ? `<p class="status ${statusIsError ? 'status-error' : ''}">${escapeHtml(statusMessage)}</p>` : ''}
      </div>
    </div>
  `;
}

function renderConfirmReset() {
  return `
    <div class="focus">
      <div class="focus-center">
        <div class="focus-center-inner">
          ${skipSvg('oops')}
          <h1 class="h1">Reset everything?</h1>
          <p class="body">This clears all Game IQ progress, XP, streaks, the saved Reset Play,
            and every check-in, so the app is a clean slate. Do this right before handing
            the iPad to Owen for the first time.</p>
          <p class="body"><strong>This can't be undone.</strong></p>
          <button class="btn btn-danger btn-block" data-action="confirm-reset" ${busy ? 'disabled' : ''}>${busy ? 'Resetting…' : 'Yes, reset everything'}</button>
          <button class="btn btn-ghost btn-block" data-action="cancel-reset">Cancel</button>
          ${statusHtml()}
        </div>
      </div>
    </div>
  `;
}

async function resetAllData() {
  busy = true;
  setStatus('');
  render();
  try {
    const fresh = emptyState();
    const newState = await saveState(() => fresh);
    gistState = newState;
    saveCachedState(newState);
    clearDraftDay();
    draftDay = null;
    checkinDraft = { practiced: null, practiceType: [], practiceTypeOther: '', voiceFeedback: '' };
    onboardingStep = 1;
    onboardingDraft = { action: null, phrase: null, triggers: [] };
    onboardingShowActionCustom = false;
    onboardingShowPhraseCustom = false;
    clearIqLesson();
    iqLesson = null;
    iqResult = null;
    busy = false;
    routeAfterLoad();
  } catch (err) {
    busy = false;
    setStatus(err instanceof GistError ? err.message : String(err), true);
  }
  render();
}

// ---------- daily day flow ----------

function startNewDay() {
  const dayIndex = gistState.days.length;
  const { mental, mechanics } = getContentForDayIndex(dayIndex);
  draftDay = {
    dayNumber: dayIndex + 1,
    mentalVideoId: mental.videoId,
    mentalTitle: mental.title,
    mechanicsVideoId: mechanics.videoId,
    mechanicsTitle: mechanics.title,
    teamPractice: null, // null = not yet answered; true skips straight to check-in
    resetRepCompleted: false,
    mentalWatched: false,
    mechanicsWatched: false,
    sentToPractice: false,
  };
  saveDraftDay(draftDay);
  checkinDraft = { practiced: null, practiceType: [], practiceTypeOther: '', voiceFeedback: '' };
  view = 'day';
  render();
}

function currentDayStep() {
  if (draftDay.teamPractice === null) return 'teamCheck';
  if (draftDay.teamPractice === true) return 'checkin'; // coach already ran the session — straight to reflection
  if (!draftDay.resetRepCompleted) return 'resetRep';
  if (!draftDay.mentalWatched) return 'mental';
  if (!draftDay.mechanicsWatched) return 'mechanics';
  if (!draftDay.sentToPractice) return 'goPractice';
  return 'checkin';
}

function renderDayStep() {
  const step = currentDayStep();
  let body;
  if (step === 'teamCheck') body = dayStepTeamCheck();
  else if (step === 'resetRep') body = dayStepResetRep();
  else if (step === 'mental') body = dayStepVideo('mental');
  else if (step === 'mechanics') body = dayStepVideo('mechanics');
  else if (step === 'goPractice') body = dayStepGoPractice();
  else body = dayStepCheckin();

  return `
    <div class="screen screen-day">
      <div class="screen-inner">
        <div class="day-step-label">${plateIcon()}Day ${draftDay.dayNumber}</div>
        ${body}
      </div>
    </div>
  `;
}

function dayStepTeamCheck() {
  return `
    <h1 class="onb-title">Team Practice Today?</h1>
    <p class="onb-body">This changes what happens next.</p>
    <div class="option-list">
      <button class="option-card" data-action="team-practice-yes">
        Yes — team practice
        <span class="option-blurb">Skip straight to logging how it went.</span>
      </button>
      <button class="option-card" data-action="team-practice-no">
        No — on my own today
        <span class="option-blurb">Reset Rep, videos, then go practice.</span>
      </button>
    </div>
  `;
}

function dayStepResetRep() {
  return `
    <h1 class="onb-title">Reset Rep</h1>
    <p class="onb-body">Run through your Reset Play once before you head out.</p>
    ${resetCardHtml(gistState.resetRoutine)}
    <button class="btn btn-primary btn-plate btn-block btn-large" data-action="complete-reset-rep">Done — I did my reset rep</button>
  `;
}

function dayStepVideo(kind) {
  const videoId = kind === 'mental' ? draftDay.mentalVideoId : draftDay.mechanicsVideoId;
  const title = kind === 'mental' ? draftDay.mentalTitle : draftDay.mechanicsTitle;
  const label = kind === 'mental' ? "Today's Mental Video" : "Today's Mechanics Video";
  const action = kind === 'mental' ? 'complete-mental' : 'complete-mechanics';
  return `
    <h1 class="onb-title">${label}</h1>
    <p class="video-caption">${escapeHtml(title)}</p>
    <div class="video-wrap">
      <iframe src="https://www.youtube.com/embed/${encodeURIComponent(videoId)}" title="${escapeHtml(title)}" frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
    </div>
    <button class="btn btn-primary btn-plate btn-block btn-large" data-action="${action}">I watched it</button>
  `;
}

function dayStepGoPractice() {
  return `
    <h1 class="onb-title">Time to Practice</h1>
    <p class="onb-body">Get your reps in. Come back here when you're done to check in.</p>
    <button class="btn btn-primary btn-plate btn-block btn-large" data-action="return-from-practice">I'm Back</button>
  `;
}

function dayStepCheckin() {
  const isTeam = draftDay.teamPractice === true;
  const practiceOptions = isTeam ? TEAM_PRACTICE_TYPE_OPTIONS : HOME_PRACTICE_TYPE_OPTIONS;
  return `
    <h1 class="onb-title">How'd it go?</h1>

    ${isTeam ? '' : `
      <p class="checkin-question">Did you practice today?</p>
      <div class="toggle-row">
        <button class="btn ${checkinDraft.practiced === true ? 'btn-primary' : 'btn-outline'}" data-action="set-practiced" data-value="yes">Yes</button>
        <button class="btn ${checkinDraft.practiced === false ? 'btn-primary' : 'btn-outline'}" data-action="set-practiced" data-value="no">No</button>
      </div>
    `}

    ${checkinDraft.practiced === true ? `
      <p class="checkin-question">What did you work on?</p>
      <div class="chip-row">
        ${practiceOptions.map((opt) => `
          <button class="chip ${checkinDraft.practiceType.includes(opt) ? 'chip-selected' : ''}" data-action="toggle-practice-type" data-value="${escapeHtml(opt)}">${escapeHtml(opt)}</button>
        `).join('')}
      </div>
      ${checkinDraft.practiceType.includes('Something else') ? `
        <input type="text" id="practice-other-input" class="text-input" placeholder="What did you work on?" value="${escapeHtml(checkinDraft.practiceTypeOther)}" />
      ` : ''}
    ` : ''}

    ${checkinDraft.practiced !== null ? `
      <p class="checkin-question">How did it feel?</p>
      <textarea id="voice-feedback-input" class="text-input voice-textarea" placeholder="Type here — or tap in and use your keyboard's dictation mic…" rows="4">${escapeHtml(checkinDraft.voiceFeedback)}</textarea>
      <button class="btn btn-primary btn-plate btn-block btn-large" data-action="submit-checkin" ${busy ? 'disabled' : ''}>${busy ? 'Saving…' : 'Finish Day'}</button>
    ` : ''}

    ${statusMessage ? `<p class="status ${statusIsError ? 'status-error' : ''}">${escapeHtml(statusMessage)}</p>` : ''}
  `;
}

async function submitCheckin() {
  const textarea = document.getElementById('voice-feedback-input');
  const voiceFeedback = textarea ? textarea.value.trim() : checkinDraft.voiceFeedback.trim();

  const otherInput = document.getElementById('practice-other-input');
  const otherText = (otherInput ? otherInput.value : checkinDraft.practiceTypeOther).trim();
  // Swap the literal "Something else" placeholder for what he actually typed, so the
  // saved record is self-explanatory without needing a second field to cross-reference.
  const practiceType = checkinDraft.practiceType.map((t) => (t === 'Something else' && otherText ? otherText : t));

  busy = true;
  setStatus('');
  render();

  const finishedDay = {
    dayNumber: draftDay.dayNumber,
    teamPractice: draftDay.teamPractice,
    // No video was actually shown on a team-practice day (skipped entirely) — record
    // that accurately rather than logging an assigned-but-unwatched video ID.
    mentalVideoId: draftDay.teamPractice ? null : draftDay.mentalVideoId,
    mechanicsVideoId: draftDay.teamPractice ? null : draftDay.mechanicsVideoId,
    resetRepCompleted: draftDay.resetRepCompleted,
    practiced: checkinDraft.practiced,
    practiceType,
    voiceFeedback,
    completedAt: new Date().toISOString(),
  };

  try {
    const newState = await saveState((fresh) => {
      const { streak, longest } = nextStreak(fresh, finishedDay.completedAt);
      fresh.days.push(finishedDay);
      fresh.currentStreak = streak;
      fresh.longestStreak = longest;
      return fresh;
    });
    gistState = newState;
    saveCachedState(newState);
    clearDraftDay();
    draftDay = null;
    busy = false;
    view = 'home';
    // No separate "saved!" screen — there's nothing left to do once check-in is submitted,
    // so land straight back on home. A brief toast keeps the "Next Pitch" payoff moment
    // without adding a tap Jay has to make just to get back to where he already wanted to be.
    showToast(`Day ${finishedDay.dayNumber} logged. Next pitch.`);
  } catch (err) {
    busy = false;
    setStatus(err instanceof GistError ? err.message : String(err), true);
  }
  render();
}

/** Streak counts consecutive real calendar days with a completed check-in — a gap of a
 *  calendar day or more resets it to 1. This is independent of the day *sequence* number
 *  (dayNumber / content index), which never resets and just picks up where it left off,
 *  per the spec's "not a calendar, it's a sequence" rule. */
function nextStreak(state, newCompletedAt) {
  const prevDays = state.days;
  if (prevDays.length === 0) return { streak: 1, longest: Math.max(1, state.longestStreak || 0) };
  const dayMs = 24 * 60 * 60 * 1000;
  const startOfDay = (iso) => {
    const d = new Date(iso);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  const prevDate = startOfDay(prevDays[prevDays.length - 1].completedAt);
  const newDate = startOfDay(newCompletedAt);
  const gapDays = Math.round((newDate - prevDate) / dayMs);
  const streak = gapDays <= 1 ? (state.currentStreak || 0) + 1 : 1;
  const longest = Math.max(streak, state.longestStreak || 0);
  return { streak, longest };
}

// ---------- first-launch tour ----------
// Skip walks a new player through the app: name, how a play works, outs, mastery, and
// streaks + rewards. Replayable from Profile. Only "done" (and the name) are saved.

const TOUR_STEPS = 5;

function tourDemoPlay() {
  return `
    <div class="tour-demo">
      <div class="bug"><div class="bug-cell bug-count"><span class="bug-label">Count</span>1-1</div><div class="bug-cell"><span class="bug-label">Outs</span>1</div><div class="bug-cell"><span class="bug-label">You</span>Right field</div></div>
      <div class="choices">
        <div class="choice"><span class="choice-key">A</span><span>Throw home</span></div>
        <div class="choice choice-picked"><span class="choice-key">B</span><span>Hit the cutoff man</span></div>
      </div>
    </div>`;
}

function renderTour() {
  const name = tourName.trim();
  const step = tourStep;
  const dots = Array.from({ length: TOUR_STEPS }, (_, i) => `<span class="tour-dot ${i === step ? 'tour-dot-on' : ''}"></span>`).join('');
  let art;
  let title;
  let body;
  let extra = '';
  if (step === 0) {
    art = `<div class="splash-art">${poseImg('coaching', 'skip-hello')}<div class="splash-bubble">Hey! I'm Skip.</div></div>`;
    title = 'I\'m your coach';
    body = 'Heads Up teaches you to think the game: where to throw, when to run, what to do before the pitch. First, what should I call you?';
    extra = `
      <form id="tour-form" class="tour-form">
        <label class="field-label">Your first name
          <input type="text" id="tour-name" class="input" maxlength="20" value="${escapeHtml(tourName)}" placeholder="First name" autocomplete="given-name" autocapitalize="words" spellcheck="false" />
        </label>
      </form>`;
  } else if (step === 1) {
    art = poseImg('fielding', 'tour-pose');
    title = 'Read the play';
    body = 'Every question is a game situation: the count, the outs, the runners, and where YOU are. Pick the smart call, then tap Check.';
    extra = tourDemoPlay();
  } else if (step === 2) {
    art = skipSvg('surprised', 'tour-head');
    title = 'Three outs';
    body = 'A wrong answer is an out. Three outs and the inning\'s over until you fix your mistakes. A new day always starts a new inning.';
    extra = `<div class="tour-demo tour-center">${outsHtml(2)}</div>`;
  } else if (step === 3) {
    art = skipSvg('thinking', 'tour-head');
    title = 'Master it';
    body = 'Get a situation right on different days to fill its 4 bars. No cramming. It has to stick. The same idea comes back worded differently, so know it, don\'t memorize it.';
    extra = `<div class="tour-demo"><div class="play play-progress" style="--unit:#2fa84f"><span class="play-icon">${icon('check')}</span><span class="play-title">Hit the cutoff man</span><span class="pips"><span class="pip pip-on"></span><span class="pip pip-on"></span><span class="pip"></span><span class="pip"></span></span></div></div>`;
  } else {
    art = poseImg('running', 'tour-pose');
    title = name ? `Let's go, ${escapeHtml(name)}!` : 'Let\'s go!';
    body = 'Play one lesson a day to build your streak. Earn XP to climb from Rookie to Field General, and unlock badges along the way.';
    extra = `<div class="tour-demo tour-center"><div class="tour-chips"><span class="chip-stat chip-streak">${icon('flame')}1</span><span class="chip-stat chip-xp">${icon('gem')}55</span><span class="chip-stat"><span style="color:var(--gold)">${icon('shield')}</span>Rookie</span></div></div>`;
  }
  const last = step === TOUR_STEPS - 1;
  return `
    <div class="focus tour"><div class="focus-center"><div class="focus-center-inner">
      ${step === 0 ? '<img class="splash-logo tour-logo" src="img/logo.webp" alt="Heads Up Baseball IQ">' : ''}
      <div class="tour-art">${art}</div>
      <h1 class="h1">${title}</h1>
      <p class="body">${body}</p>
      ${extra}
      <div class="tour-dots">${dots}</div>
      <button class="btn btn-red btn-block" data-action="tour-next" ${busy ? 'disabled' : ''}>${busy ? 'Saving…' : last ? 'Play ball' : 'Next'}</button>
      ${step > 0 ? '<button class="link-btn" style="align-self:center" data-action="tour-back">‹ Back</button>' : ''}
      ${statusHtml()}
    </div></div></div>
  `;
}

function tourNext() {
  if (tourStep === 0) {
    const input = document.getElementById('tour-name');
    tourName = (input ? input.value : tourName).trim().slice(0, 20);
    if (!tourName) {
      setStatus('Type your first name to keep going.', true);
      render();
      document.getElementById('tour-name')?.focus();
      return;
    }
  }
  setStatus('');
  if (tourStep < TOUR_STEPS - 1) {
    tourStep += 1;
    render();
    window.scrollTo(0, 0);
    return;
  }
  finishTour();
}

async function finishTour() {
  busy = true;
  render();
  try {
    const name = tourName;
    const newState = await saveState((fresh) => {
      fresh.profile = { ...(fresh.profile || {}), name, tourDone: true };
      return fresh;
    });
    gistState = newState;
    saveCachedState(newState);
    busy = false;
    view = 'iqHome';
  } catch (err) {
    busy = false;
    setStatus(`Couldn't save. Check the connection and try again. (${err instanceof GistError ? err.message : String(err)})`, true);
  }
  render();
  window.scrollTo(0, 0);
}

// ---------- game iq: shared pieces ----------

function iqState() {
  return normalizeIq(gistState.gameIq);
}

function lessonOuts(lesson) {
  if (lesson.mode !== 'play') return 0;
  return lesson.startOuts + lesson.answers.filter((a) => !a.correct).length;
}

function outsHtml(outs, label = true) {
  let lights = '';
  for (let i = 0; i < OUTS_PER_INNING; i++) lights += `<span class="out-light ${i < outs ? 'out-light-on' : ''}"></span>`;
  return `<span class="outs" aria-label="${outs} of ${OUTS_PER_INNING} outs">${label ? '<span class="outs-label">Outs</span>' : ''}${lights}</span>`;
}

function barHtml(pct, color = null) {
  const gold = color === true;
  const style = typeof color === 'string' ? `;background:${color}` : '';
  return `<div class="bar"><div class="bar-fill ${gold ? 'bar-fill-gold' : ''} ${pct === 0 ? 'bar-fill-zero' : ''}" style="width:${pct}%${style}"></div></div>`;
}

/** Streak / XP / mastered — top-bar chips on phone, cards in the right rail on wide screens. */
function iqNumbers() {
  const iq = iqState();
  const today = todayKey();
  return { iq, today, streak: displayStreak(iq, today), totals: masteryTotals(iq), ...rankFor(iq.xp) };
}

// Each unit gets its own color + icon, like the skill categories in the brand mockups.
const UNIT_STYLE = {
  u1: { color: '#e6392d', icon: 'eye' },
  u2: { color: '#f08a24', icon: 'bat' },
  u3: { color: '#2fa84f', icon: 'mitt' },
  u4: { color: '#12a594', icon: 'base' },
  u5: { color: '#0ea5e9', icon: 'diamond' },
  u6: { color: '#6366f1', icon: 'target' },
  u7: { color: '#2f6fe0', icon: 'runner' },
  u8: { color: '#e0a400', icon: 'bolt' },
  u9: { color: '#8b5cf6', icon: 'book' },
  u10: { color: '#64748b', icon: 'brain' },
};
function unitStyle(unit) {
  return UNIT_STYLE[unit.id] || { color: '#e6392d', icon: 'ball' };
}

// Pro Tips: one a day, original lines in Skip's voice.
const PRO_TIPS = [
  'Good players react. Smart players anticipate.',
  'Know the outs, the count and the runners before every pitch.',
  'Ask "what if it\'s hit to me?" before the pitcher comes set.',
  'Never make the first or third out at third base.',
  'Two outs? Run on contact. No waiting.',
  'Hit the cutoff man. Keep the double play in order.',
  'The ball is faster than any runner. Throw ahead of him.',
  'Loud calls win. If you call it, catch it.',
  'Back up every throw like it\'s getting by.',
  'A walk is as good as a single. Make him throw strikes.',
  'Watch the ball off the bat before you take off.',
  'Next pitch. Whatever just happened is over.',
];
function proTipHtml(today) {
  const [y, m, d] = today.split('-').map(Number);
  const dayIndex = Math.floor(new Date(y, m - 1, d).getTime() / 86400000);
  const tip = PRO_TIPS[((dayIndex % PRO_TIPS.length) + PRO_TIPS.length) % PRO_TIPS.length];
  return `
    <section class="tip-card">
      ${skipSvg('wink', 'tip-skip')}
      <div class="tip-label">Pro Tip</div>
      <p class="tip-text">“${escapeHtml(tip)}”</p>
      <div class="tip-sign">— Skip</div>
    </section>
  `;
}

function streakCardHtml(n) {
  const week = weekPlayed(n.iq, n.today);
  const days = week.map((d) => `
    <div class="wk-day ${d.played ? 'wk-played' : ''} ${d.isToday ? 'wk-today' : ''} ${d.future ? 'wk-future' : ''}">
      <span class="wk-label">${d.label}</span>
      <span class="wk-dot">${d.played ? icon('check') : ''}</span>
    </div>`).join('');
  const playedToday = n.iq.lastPlayed === n.today;
  return `
    <section class="card streak-card">
      <div class="streak-top">
        <div>
          <h2 class="h2">${n.streak ? 'Keep it going!' : 'Start a streak!'}</h2>
          <div class="small">${playedToday ? 'Today\'s done. See you tomorrow.' : 'One lesson a day keeps the streak alive.'}</div>
        </div>
        <div class="streak-big ${n.streak ? '' : 'streak-big-dim'}">${icon('flame')}<span>${n.streak}</span></div>
      </div>
      <div class="wk">${days}</div>
      <div class="streak-foot"><span>Day streak</span><span>Best: ${n.iq.longestStreak}</span></div>
    </section>
  `;
}

function rankCardHtml(n) {
  const toNext = n.next ? Math.round(((n.iq.xp - n.rank.xp) / (n.next.xp - n.rank.xp)) * 100) : 100;
  return `
    <section class="card">
      <div class="eyebrow">Rank</div>
      <div class="rank-big">${icon('shield')}<span>${escapeHtml(n.rank.title)}</span></div>
      ${barHtml(toNext, true)}
      <div class="small">${n.next ? `${n.next.xp - n.iq.xp} XP to ${escapeHtml(n.next.title)}` : 'Top rank: Field General.'}</div>
    </section>
  `;
}

function railHtml() {
  const n = iqNumbers();
  return `
    ${streakCardHtml(n)}
    ${rankCardHtml(n)}
    ${IQ_REWARDS.map((r) => rewardCardHtml(r, n.totals)).join('')}
    ${proTipHtml(n.today)}
  `;
}

// ---------- app shell ----------

const NAV = [
  { view: 'iqHome', label: 'Home', icon: 'home' },
  { view: 'iqRewards', label: 'Rewards', icon: 'trophy' },
  { view: 'iqMe', label: 'Profile', icon: 'person' },
  ...(PRACTICE_ENABLED ? [{ view: 'home', label: 'Practice', icon: 'bat' }] : []),
];

function navActive(item) {
  if (item.view === 'home') return ['home', 'day', 'onboarding'].includes(view);
  return item.view === view;
}

function chipsHtml(n) {
  return `
    <div class="chips">
      <span class="chip-stat ${n.streak ? 'chip-streak' : 'chip-dim'}" aria-label="${n.streak} day streak">${icon('flame')}${n.streak}</span>
      <span class="chip-stat chip-xp" aria-label="${n.iq.xp} XP">${icon('gem')}${n.iq.xp}</span>
    </div>
  `;
}

function shellHtml(mainHtml) {
  const n = gistState ? iqNumbers() : null;
  return `
    <div class="shell">
      <header class="topbar">
        ${brandHtml()}
        ${n ? chipsHtml(n) : ''}
      </header>
      <nav class="sidebar" aria-label="Main">
        ${brandHtml()}
        ${NAV.map((item) => `
          <button class="side-link ${navActive(item) ? 'side-link-active' : ''}" data-action="nav" data-value="${item.view}">${icon(item.icon)}<span>${escapeHtml(item.label)}</span></button>
        `).join('')}
        <div class="side-tag">Play. Learn.<br>Think. Improve.</div>
      </nav>
      <main class="main"><div class="main-inner">${mainHtml}</div></main>
      ${n ? `<aside class="rail">${railHtml()}</aside>` : ''}
      <nav class="tabbar" aria-label="Main">
        ${NAV.map((item) => `
          <button class="tab ${navActive(item) ? 'tab-active' : ''}" data-action="nav" data-value="${item.view}">${icon(item.icon)}<span>${escapeHtml(item.label)}</span></button>
        `).join('')}
      </nav>
    </div>
  `;
}

// ---------- game iq: home ----------

function currentConceptId(iq, statuses) {
  const fresh = freshConceptIds(iq, todayKey());
  if (fresh.length) return fresh[0];
  const open = statuses.filter((s) => s.status === 'open' || s.status === 'mastered');
  let best = null;
  for (const s of open) {
    for (const c of s.unit.concepts) {
      const box = iq.concepts[c.id]?.box ?? 0;
      if (box < MASTERED_BOX && (best === null || box < best.box)) best = { id: c.id, box };
    }
  }
  return best?.id ?? null;
}

function renderIqHome() {
  const iq = iqState();
  const today = todayKey();
  const outs = outsToday(iq, today);
  const statuses = unitStatuses(iq, today);
  const inningOver = outs >= OUTS_PER_INNING;
  const playedToday = iq.lastPlayed === today;
  const currentId = currentConceptId(iq, statuses);
  const n = iqNumbers();

  let pose = 'batting';
  let kicker;
  let title;
  let line;
  let buttons;
  if (iqLesson) {
    kicker = 'Mid-inning';
    title = 'Finish the at-bat';
    line = 'You left a lesson in the middle. Pick it back up.';
    buttons = '<button class="btn btn-red" data-action="iq-resume">Resume</button>';
  } else if (inningOver) {
    pose = 'coaching';
    kicker = 'Three outs';
    title = 'Fix your mistakes';
    line = 'Get the misses right and you\'re back in the game.';
    buttons = '<button class="btn btn-red" data-action="iq-start-review">Fix them</button>';
  } else {
    const lesson = buildLesson(iq, today);
    kicker = `${playedToday ? 'Another at-bat' : 'Today\'s at-bat'} · ${lesson.length} plays`;
    title = 'Read the play';
    line = playedToday
      ? `Nice work today, ${escapeHtml(playerName())}. Want another round?`
      : 'Situations from all over the field. Make the right call.';
    buttons = `<button class="btn btn-red" data-action="iq-start-play" ${lesson.length ? '' : 'disabled'}>${playedToday ? 'Play again' : 'Play ball'}</button>`;
  }

  return `
    <div class="welcome">
      <h1 class="h1">Welcome back, ${escapeHtml(playerName())}!</h1>
      <div class="welcome-tag">Play. Learn. Think. Improve.</div>
    </div>
    <section class="hero-card ${inningOver && !iqLesson ? 'hero-over' : ''}">
      <div class="hero-sun" aria-hidden="true"></div>
      ${poseImg(pose, 'hero-pose')}
      <div class="hero-copy">
        <div class="hero-kicker">${kicker}</div>
        <h2 class="hero-title">${escapeHtml(title)}</h2>
        <p class="hero-line">${line}</p>
        <div class="hero-outs">${outsHtml(outs)}</div>
        <div class="hero-row">${buttons}</div>
        ${!inningOver && !iqLesson && iq.missed.length ? `<button class="link-btn hero-sub-btn" data-action="iq-start-review">Fix mistakes (${iq.missed.length}) ›</button>` : ''}
      </div>
    </section>
    <div class="hide-wide">${streakCardHtml(n)}</div>
    <div class="section-head"><span>My progress</span><span>${n.totals.mastered} of ${n.totals.total} mastered</span></div>
    <div class="season">
      ${statuses.map((s, i) => unitHtml(s, i, iq, currentId, inningOver)).join('')}
    </div>
    <div class="hide-wide">${proTipHtml(today)}</div>
    ${statusHtml()}
  `;
}

// Which unit's situations are showing in the season list. null = the unit with UP NEXT.
let expandedUnit = null;

function unitHtml({ unit, status, total, mastered }, i, iq, currentId, inningOver) {
  const pct = total ? Math.round((mastered / total) * 100) : 0;
  const style = unitStyle(unit);
  const sub = {
    coming: 'Coming soon',
    mastered: `All ${total} mastered`,
    open: `${mastered}/${total} mastered · ${escapeHtml(unit.subtitle)}`,
  }[status];
  const hasCurrent = unit.concepts.some((c) => c.id === currentId);
  const expanded = (status === 'open' || status === 'mastered') && (expandedUnit ? expandedUnit === unit.id : hasCurrent);
  const tag = status === 'coming' ? 'div' : 'button';
  const head = `
    <${tag} class="lvl-head" ${tag === 'button' ? `data-action="toggle-unit" data-value="${unit.id}" aria-expanded="${expanded}"` : ''}>
      <div class="lvl-num" style="background:${style.color}">${icon(status === 'mastered' ? 'star' : style.icon)}</div>
      <div class="lvl-body">
        <div class="lvl-title">${escapeHtml(unit.title)}</div>
        <div class="lvl-sub">${sub}</div>
        ${status === 'open' || status === 'mastered' ? barHtml(pct, style.color) : ''}
      </div>
      ${tag === 'button' ? `<span class="lvl-chev ${expanded ? 'lvl-chev-open' : ''}">${icon('chevron')}</span>` : ''}
    </${tag}>
  `;
  const current = hasCurrent ? 'lvl-current' : '';
  if (!expanded) return `<section class="lvl lvl-${status} ${current}" style="--unit:${style.color}">${head}</section>`;

  // The open unit lists its situations ("plays"): pips show progress toward mastery.
  const plays = unit.concepts.map((c) => {
    const st = iq.concepts[c.id];
    const box = st?.box ?? 0;
    const kind = st && box >= MASTERED_BOX ? 'gold' : st ? 'progress' : 'todo';
    const isCurrent = c.id === currentId && !iqLesson;
    const glyph = kind === 'gold' ? icon('star') : kind === 'progress' ? icon('check') : '';
    let pips = '';
    for (let k = 0; k < MASTERED_BOX; k++) pips += `<span class="pip ${k < box ? 'pip-on' : ''}"></span>`;
    const flag = isCurrent
      ? `<span class="play-flag ${inningOver ? 'play-flag-red' : ''}">${inningOver ? 'Fix' : 'Up next'}</span>`
      : `<span class="pips">${pips}</span>`;
    return `
      <button class="play play-${kind} ${isCurrent ? 'play-current' : ''}" data-action="iq-node" data-value="${kind}" aria-label="${escapeHtml(c.title)}">
        <span class="play-icon">${glyph}</span>
        <span class="play-title">${escapeHtml(c.title)}</span>
        ${flag}
      </button>
    `;
  }).join('');
  return `<section class="lvl lvl-${status} ${current} lvl-expanded" style="--unit:${style.color}">${head}<div class="plays">${plays}</div></section>`;
}

// ---------- game iq: rewards + me ----------

function rewardCardHtml(reward, totals) {
  const pct = totals.total ? Math.round((totals.mastered / totals.total) * 100) : 0;
  const earned = reward.type === 'allMastered' && totals.allUnitsWritten && totals.mastered === totals.total;
  return `
    <div class="card reward ${earned ? 'reward-earned' : ''}">
      <img class="reward-art" src="img/reward-glove.webp" alt="First baseman's glove" draggable="false">
      <div class="reward-body">
        <div class="eyebrow">${earned ? 'Earned!' : 'The big prize'}</div>
        <div class="h2">${escapeHtml(reward.title)}</div>
        <div class="small">${escapeHtml(reward.requirement)}</div>
        ${barHtml(pct, true)}
        <div class="small">${earned ? 'Earned! Go claim it.' : `${totals.mastered} of ${totals.total} mastered${totals.allUnitsWritten ? '' : ' · more units drop this winter'}`}</div>
      </div>
    </div>
  `;
}

// Badges: milestones that unlock on their own as he plays.
function badgeList(n) {
  const statuses = unitStatuses(n.iq, n.today);
  const unitDone = (id) => statuses.find((s) => s.unit.id === id)?.status === 'mastered';
  return [
    { title: 'Rookie', art: 'rookie', blurb: 'Finish your first lesson', icon: 'ball', color: '#e6392d', earned: n.iq.lessonsCompleted >= 1 },
    { title: 'Streak Star', art: 'streak', blurb: '7 day streak', icon: 'flame', color: '#f08a24', earned: n.iq.longestStreak >= 7 },
    { title: 'Heads Up', art: 'headsup', blurb: 'Master 10 situations', icon: 'eye', color: '#2f6fe0', earned: n.totals.mastered >= 10 },
    { title: 'Base Stealer', art: 'stealer', blurb: 'Master Leads & Steals', icon: 'bolt', color: '#e0a400', earned: unitDone('u8') },
    { title: 'Gold Glove', art: 'goldglove', blurb: 'Master Outfield', icon: 'mitt', color: '#2fa84f', earned: unitDone('u3') },
    { title: 'Rule Book', art: 'rulebook', blurb: 'Master Know the Rules', icon: 'book', color: '#8b5cf6', earned: unitDone('u9') },
    { title: 'Big Thinker', art: 'thinker', blurb: 'Reach All-Star rank', icon: 'brain', color: '#0ea5e9', earned: n.iq.xp >= 800 },
    { title: 'IQ Master', art: 'iqmaster', blurb: 'Master every situation', icon: 'gem', color: '#12a594', earned: n.totals.total > 0 && n.totals.mastered === n.totals.total },
  ];
}

function renderIqRewards() {
  const n = iqNumbers();
  const badges = badgeList(n);
  return `
    <div class="page-head">
      <div>
        <h1 class="h1">Rewards</h1>
        <p class="body">Real gear for real baseball IQ. Mastering a situation takes right answers on different days, so there's no cramming.</p>
      </div>
      ${poseImg('throwing', 'page-pose')}
    </div>
    ${IQ_REWARDS.map((r) => rewardCardHtml(r, n.totals)).join('')}
    <div class="section-head"><span>Badges</span><span>${badges.filter((b) => b.earned).length} of ${badges.length}</span></div>
    <div class="badges">
      ${badges.map((b) => `
        <div class="badge ${b.earned ? 'badge-earned' : ''}" style="--badge:${b.color}">
          <img class="badge-art" src="img/badges/${b.art}.webp" alt="" draggable="false">
          <div class="badge-title">${escapeHtml(b.title)}</div>
          <div class="badge-blurb">${escapeHtml(b.blurb)}</div>
        </div>
      `).join('')}
    </div>
    <div class="section-head"><span>Ranks</span><span>${n.iq.xp} XP</span></div>
    <div class="rank-list">
      ${RANKS.map((r) => {
        const cls = r.title === n.rank.title ? 'rank-row-current' : n.iq.xp >= r.xp ? 'rank-row-done' : '';
        return `<div class="rank-row ${cls}"><span>${escapeHtml(r.title)}</span><span>${r.xp} XP</span></div>`;
      }).join('')}
    </div>
  `;
}

function renderIqMe() {
  const n = iqNumbers();
  const concepts = Object.values(n.iq.concepts);
  const answered = concepts.reduce((sum, c) => sum + c.seen, 0);
  const right = concepts.reduce((sum, c) => sum + c.correct, 0);
  const accuracy = answered ? Math.round((right / answered) * 100) : 0;
  const statuses = unitStatuses(n.iq, n.today);
  return `
    <div class="profile">
      <div class="profile-avatar">${skipSvg('cool')}</div>
      <div>
        <h1 class="h1">${escapeHtml(playerName())}</h1>
        <div class="small">${escapeHtml(n.rank.title)} · ${n.iq.lessonsCompleted} lessons played</div>
      </div>
    </div>
    <div class="stat-tiles">
      <div class="stat-tile"><span class="stat-ico" style="color:#f08a24">${icon('flame')}</span><div class="stat-num">${n.streak}</div><div class="stat-label">Day streak</div></div>
      <div class="stat-tile"><span class="stat-ico" style="color:#4f8cff">${icon('gem')}</span><div class="stat-num">${n.iq.xp}</div><div class="stat-label">XP</div></div>
      <div class="stat-tile"><span class="stat-ico" style="color:var(--gold)">${icon('shield')}</span><div class="stat-num stat-num-sm">${escapeHtml(n.rank.title)}</div><div class="stat-label">Rank</div></div>
    </div>
    <div class="section-head"><span>Skill progress</span><span>${n.totals.mastered}/${n.totals.total}</span></div>
    <div class="card">
      ${statuses.filter((s) => s.total > 0).map((s) => {
        const st = unitStyle(s.unit);
        return `
          <div class="skill-row">
            <span class="skill-ico" style="background:${st.color}">${icon(st.icon)}</span>
            <div class="skill-body">
              <div class="skill-top"><span>${escapeHtml(s.unit.title)}</span><strong>${s.mastered}/${s.total}</strong></div>
              ${barHtml(s.total ? Math.round((s.mastered / s.total) * 100) : 0, st.color)}
            </div>
          </div>`;
      }).join('')}
    </div>
    <div class="section-head"><span>Stats</span></div>
    <div class="card">
      <div class="list-row"><span>Answers right</span><strong>${right} of ${answered}${answered ? ` (${accuracy}%)` : ''}</strong></div>
      <div class="list-row"><span>Situations mastered</span><strong>${n.totals.mastered} of ${n.totals.total}</strong></div>
      <div class="list-row"><span>Best streak</span><strong>${n.iq.longestStreak}</strong></div>
    </div>
    <div class="section-head"><span>Settings</span></div>
    <div class="card">
      <div class="list-row"><span>How Heads Up works</span><button class="btn btn-ghost btn-sm" data-action="tour-replay">Replay tour</button></div>
      <div class="list-row"><span>Sound effects</span><button class="switch ${soundOn ? 'switch-on' : ''}" data-action="toggle-sound" role="switch" aria-checked="${soundOn}" aria-label="Sound effects"></button></div>
    </div>
  `;
}

// ---------- game iq: lessons ----------

function startIqLesson(mode) {
  const iq = iqState();
  const today = todayKey();
  if (mode === 'play' && outsToday(iq, today) >= OUTS_PER_INNING) return;
  const cards = mode === 'review' ? buildReviewLesson(iq) : buildLesson(iq, today);
  if (cards.length === 0) return;
  iqLesson = { mode, cards, index: 0, answers: [], pending: null, selected: null, startOuts: outsToday(iq, today), finished: null };
  saveIqLesson(iqLesson);
  setStatus('');
  view = 'iqLesson';
  render();
}

function pickIqChoice(choiceIndex) {
  if (iqLesson.selected !== null && iqLesson.selected !== undefined) return;
  iqLesson.pending = choiceIndex;
}

function checkIqAnswer() {
  const pending = iqLesson.pending;
  if (pending === null || pending === undefined) return;
  if (iqLesson.selected !== null && iqLesson.selected !== undefined) return;
  const card = iqLesson.cards[iqLesson.index];
  const resolved = resolveVariant(conceptById(card.conceptId), card.variant);
  const correct = pending === resolved.answer;
  iqLesson.selected = pending;
  iqLesson.answers.push({ conceptId: card.conceptId, variant: card.variant, correct });
  // In a fix-your-mistakes lesson a miss doesn't cost an out — the same idea just comes
  // back at the end, worded differently, until he gets it.
  if (!correct && iqLesson.mode === 'review') {
    iqLesson.cards.push(makeCard(iqState(), card.conceptId, card.variant));
  }
  saveIqLesson(iqLesson);
  playSound(correct ? 'right' : 'wrong');
}

function nextIqCard() {
  iqLesson.index += 1;
  iqLesson.selected = null;
  iqLesson.pending = null;
  const inningOver = lessonOuts(iqLesson) >= OUTS_PER_INNING;
  if (inningOver || iqLesson.index >= iqLesson.cards.length) {
    iqLesson.finished = { completed: !inningOver };
    saveIqLesson(iqLesson);
    finishIqLesson();
    return;
  }
  saveIqLesson(iqLesson);
  render();
  window.scrollTo(0, 0);
}

async function finishIqLesson() {
  const lesson = iqLesson;
  const today = todayKey();
  const payload = { mode: lesson.mode, answers: lesson.answers, completed: lesson.finished.completed };
  busy = true;
  setStatus('');
  render();
  try {
    let xpEarned = 0;
    const newState = await saveState((fresh) => {
      const result = applyLesson(fresh.gameIq, payload, today);
      fresh.gameIq = result.iq;
      xpEarned = result.xpEarned;
      return fresh;
    });
    gistState = newState;
    saveCachedState(newState);
    iqResult = {
      mode: lesson.mode,
      completed: lesson.finished.completed,
      correct: lesson.answers.filter((a) => a.correct).length,
      total: lesson.answers.length,
      xpEarned,
      streak: displayStreak(iqState(), today),
    };
    clearIqLesson();
    iqLesson = null;
    busy = false;
    view = 'iqResult';
    if (iqResult.completed) playSound('done');
  } catch (err) {
    busy = false;
    setStatus(`Couldn't save. Check the connection and try again. (${err instanceof GistError ? err.message : String(err)})`, true);
  }
  render();
}

// The situation: a broadcast count bug over the animated field (js/field.js).
const YOU_LABELS = {
  batter: 'Batter', onDeck: 'On deck', runner1: 'On 1st', runner2: 'On 2nd', runner3: 'On 3rd',
  P: 'Pitcher', C: 'Catcher', '1B': '1st base', '2B': '2nd base', SS: 'Shortstop', '3B': '3rd base',
  LF: 'Left field', CF: 'Center', RF: 'Right field',
};

function runnersLabel(runners) {
  const r = [...(runners || [])].sort();
  if (r.length === 0) return 'Empty';
  if (r.length === 3) return 'Loaded';
  const names = { 1: '1st', 2: '2nd', 3: '3rd' };
  return r.map((b) => names[b]).join(' & ');
}

/** The TV-style count bug: count, outs, runners, and where you are. */
function bugHtml(sit) {
  const cells = [];
  if (sit.balls !== undefined && sit.strikes !== undefined) {
    cells.push(`<div class="bug-cell bug-count"><span class="bug-label">Count</span>${sit.balls}-${sit.strikes}</div>`);
  }
  if (sit.outs !== undefined) {
    cells.push(`<div class="bug-cell"><span class="bug-label">Outs</span>${sit.outs >= 3 ? 'End' : sit.outs}</div>`);
  }
  if (sit.runners) cells.push(`<div class="bug-cell"><span class="bug-label">On</span>${runnersLabel(sit.runners)}</div>`);
  if (sit.you && YOU_LABELS[sit.you]) cells.push(`<div class="bug-cell"><span class="bug-label">You</span>${YOU_LABELS[sit.you]}</div>`);
  return cells.length ? `<div class="bug">${cells.join('')}</div>` : '';
}

const RIGHT_LINES = ['Correct!', 'Nice read!', 'Heads up!', 'You knew it!', 'Smart play!'];
const RIGHT_FACES = ['excited', 'laughing', 'wink', 'happy', 'cool'];

function renderIqLesson() {
  const lesson = iqLesson;
  if (lesson.finished) {
    return `
      <div class="focus"><div class="focus-center"><div class="focus-center-inner">
        ${skipSvg('think', 'skip-hello')}
        <h1 class="h1">${busy ? 'Saving…' : 'Lesson done'}</h1>
        ${busy ? '' : '<button class="btn btn-red btn-block" data-action="iq-retry-save">Save my results</button>'}
        ${statusHtml()}
      </div></div></div>
    `;
  }

  const card = lesson.cards[lesson.index];
  const concept = conceptById(card.conceptId);
  const resolved = resolveVariant(concept, card.variant);
  const selected = lesson.selected ?? null;
  const pending = lesson.pending ?? null;
  const answered = selected !== null;
  const correct = answered && selected === resolved.answer;
  const outs = lessonOuts(lesson);
  const done = lesson.index + (answered ? 1 : 0);
  const pct = Math.round((done / lesson.cards.length) * 100);
  const unit = IQ_UNITS.find((u) => u.concepts.some((c) => c.id === concept.id));
  const ustyle = unit ? unitStyle(unit) : null;

  const choices = card.order.map((i, pos) => {
    let cls = '';
    if (answered) {
      if (i === resolved.answer) cls = 'choice-right';
      else if (i === selected) cls = 'choice-wrong';
      else cls = 'choice-faded';
    } else if (i === pending) cls = 'choice-picked';
    return `<button class="choice ${cls}" data-action="iq-pick" data-value="${i}" ${answered ? 'disabled' : ''}><span class="choice-key">${'ABCDEF'[pos]}</span><span>${escapeHtml(resolved.choices[i])}</span></button>`;
  }).join('');

  let footer;
  if (!answered) {
    footer = `<footer class="footer"><div class="footer-inner">
      <span class="small only-wide-hint">${pending === null ? 'Pick an answer' : 'Locked in?'}</span>
      <button class="btn btn-red btn-block" data-action="iq-check" ${pending === null ? 'disabled' : ''}>Check</button>
    </div></footer>`;
  } else {
    const inningEnds = !correct && lesson.mode === 'play' && outs >= OUTS_PER_INNING;
    const title = correct ? RIGHT_LINES[lesson.index % RIGHT_LINES.length] : lesson.mode === 'play' ? (inningEnds ? 'Inning\'s over!' : 'That\'s an out!') : 'Not quite!';
    const face = correct ? RIGHT_FACES[lesson.index % RIGHT_FACES.length] : inningEnds ? 'gameface' : 'surprised';
    const nextLabel = inningEnds ? 'End inning' : lesson.index === lesson.cards.length - 1 ? 'Finish' : 'Continue';
    footer = `<footer class="footer ${correct ? 'footer-right' : 'footer-wrong'}"><div class="footer-inner">
      <div class="feedback">
        ${skipSvg(face, 'feedback-skip')}
        <div class="feedback-main">
          <p class="feedback-title">${title}</p>
          <div class="feedback-note">
            ${correct ? '' : `<p class="feedback-answer">${icon('close')}<span><strong>Answer:</strong> ${escapeHtml(resolved.choices[resolved.answer])}</span></p>`}
            <p class="feedback-why">${escapeHtml(concept.why)}</p>
          </div>
        </div>
      </div>
      <button class="btn ${correct ? 'btn-correct' : 'btn-red'} btn-block" data-action="iq-next">${nextLabel}</button>
    </div></footer>`;
  }

  const hasSit = !!resolved.sit;
  return `
    <div class="focus">
      <div class="focus-top"><div class="focus-top-inner">
        <button class="icon-btn" data-action="iq-quit" aria-label="Leave lesson">${icon('close')}</button>
        <div class="lesson-progress">${barHtml(pct)}</div>
        <button class="icon-btn ${voiceOn() ? '' : 'icon-btn-off'}" data-action="iq-voice" aria-label="${voiceOn() ? 'Mute Skip' : 'Have Skip read it'}">${icon(voiceOn() ? 'speaker' : 'speakerOff')}</button>
        ${lesson.mode === 'play' ? outsHtml(outs, false) : '<span class="tag">Review</span>'}
      </div></div>
      <div class="focus-body"><div class="focus-body-inner ${hasSit ? 'focus-body-inner-wide' : ''}">
        <div class="lesson-grid ${hasSit ? '' : 'lesson-grid-single'}">
          ${hasSit ? `<div class="lesson-col situation">${bugHtml(resolved.sit)}${fieldHtml(resolved.sit, `${lesson.index}:${card.conceptId}:${card.variant}`)}</div>` : ''}
          <div class="lesson-col">
            <div class="tags">
              <span class="tag" ${ustyle ? `style="--tag:${ustyle.color}"` : ''}>${unit ? `${icon(ustyle.icon)}${escapeHtml(unit.title)}` : escapeHtml(concept.title)}</span>
              ${concept.realPlay ? '<span class="tag tag-real">From your season</span>' : ''}
            </div>
            <h1 class="prompt">${escapeHtml(resolved.prompt)}</h1>
            <div class="choices">${choices}</div>
          </div>
        </div>
      </div></div>
      ${footer}
    </div>
  `;
}

function renderIqResult() {
  const r = iqResult;
  let title;
  let body;
  let art;
  if (!r.completed) {
    art = skipSvg('determined', 'result-skip');
    title = 'Three outs!';
    body = 'Every great hitter strikes out. Fix your mistakes to start a new inning, or come back tomorrow.';
  } else if (r.mode === 'review') {
    art = poseImg('running', 'result-pose');
    title = 'Mistakes fixed!';
    body = 'New inning. That\'s how you get better: go back to what you missed until it sticks.';
  } else {
    art = r.correct === r.total ? poseImg('celebrate', 'result-pose') : poseImg('thumbsup', 'result-pose');
    title = r.correct === r.total ? 'Perfect lesson!' : 'Lesson complete!';
    body = 'These come back later, worded differently. Know it, don\'t memorize it.';
  }
  return `
    <div class="focus result"><div class="focus-center"><div class="focus-center-inner">
      <div class="result-art"><div class="result-burst" aria-hidden="true"></div>${art}</div>
      <h1 class="h1 result-title ${r.completed ? '' : 'result-title-red'}">${title}</h1>
      <p class="body">${body}</p>
      <div class="tiles">
        <div class="tile tile-green">${icon('check')}<div class="tile-value">${r.correct}/${r.total}</div><div class="tile-label">Right</div></div>
        <div class="tile tile-blue">${icon('gem')}<div class="tile-value">+${r.xpEarned}</div><div class="tile-label">XP</div></div>
        <div class="tile tile-orange">${icon('flame')}<div class="tile-value">${r.streak}</div><div class="tile-label">Streak</div></div>
      </div>
      ${!r.completed ? '<button class="btn btn-red btn-block" data-action="iq-start-review">Fix my mistakes</button>' : ''}
      <button class="btn ${r.completed ? 'btn-red' : 'btn-ghost'} btn-block" data-action="nav" data-value="iqHome">${r.completed ? 'Continue' : 'Back home'}</button>
    </div></div></div>
  `;
}

// ---------- render dispatch ----------

function render() {
  let html;
  if (view === 'connect') html = renderConnectScreen();
  else if (view === 'confirmReset') html = renderConfirmReset();
  else if (view === 'tour') html = renderTour();
  else if (view === 'iqLesson') html = renderIqLesson();
  else if (view === 'iqResult') html = renderIqResult();
  else if (view === 'iqHome') html = shellHtml(renderIqHome());
  else if (view === 'iqRewards') html = shellHtml(renderIqRewards());
  else if (view === 'iqMe') html = shellHtml(renderIqMe());
  else if (view === 'onboarding') html = shellHtml(renderOnboarding());
  else if (view === 'home') html = shellHtml(renderHome());
  else if (view === 'day') html = shellHtml(renderDayStep());
  else html = `<div class="focus"><div class="focus-center"><div class="focus-center-inner"><img class="splash-logo" src="img/logo.webp" alt="Heads Up Baseball IQ">${poseImg('batting', 'skip-hello splash-pose')}<p class="body">Loading…</p></div></div></div>`;
  root.innerHTML = html + toastHtml();
  syncField(root, fieldContext());
  syncVoice(voiceContext());
}

/** What Skip should be reading for the card on screen (if any). */
function voiceContext() {
  if (view !== 'iqLesson' || !iqLesson || iqLesson.finished) return null;
  const lesson = iqLesson;
  const card = lesson.cards[lesson.index];
  const resolved = resolveVariant(conceptById(card.conceptId), card.variant);
  const answered = lesson.selected != null;
  const correct = answered && lesson.selected === resolved.answer;
  let resultLine = `right-${lesson.index % RIGHT_LINES.length}`;
  if (answered && !correct) {
    if (lesson.mode !== 'play') resultLine = 'notQuite';
    else resultLine = lessonOuts(lesson) >= OUTS_PER_INNING ? 'inning' : 'out';
  }
  return {
    key: `${lesson.index}:${card.conceptId}:${card.variant}`,
    conceptId: card.conceptId,
    variant: card.variant,
    order: card.order,
    tf: !!resolved.fixedOrder,
    answered,
    correct,
    rightIndex: resolved.answer,
    resultLine,
  };
}

/** What the animated field needs for the card on screen (if any). */
function fieldContext() {
  if (view !== 'iqLesson' || !iqLesson || iqLesson.finished) return {};
  const card = iqLesson.cards[iqLesson.index];
  const concept = conceptById(card.conceptId);
  const resolved = resolveVariant(concept, card.variant);
  return { sit: resolved.sit, play: PLAYS[`${card.conceptId}:${card.variant}`] || null, answered: iqLesson.selected != null };
}

// ---------- action dispatch ----------

function handleAction(action, value) {
  switch (action) {
    case 'onboarding-next':
      onboardingStep = Math.min(5, onboardingStep + 1);
      break;
    case 'onboarding-back':
      onboardingStep = Math.max(1, onboardingStep - 1);
      break;
    case 'pick-action':
      onboardingDraft.action = value;
      onboardingShowActionCustom = false;
      onboardingStep = 3;
      break;
    case 'show-action-custom':
      onboardingShowActionCustom = true;
      break;
    case 'confirm-action-custom': {
      const val = document.getElementById('input-action-custom').value.trim();
      if (!val) return;
      onboardingDraft.action = val;
      onboardingStep = 3;
      break;
    }
    case 'pick-phrase':
      onboardingDraft.phrase = value;
      onboardingShowPhraseCustom = false;
      onboardingStep = 4;
      break;
    case 'show-phrase-custom':
      onboardingShowPhraseCustom = true;
      break;
    case 'confirm-phrase-custom': {
      const val = document.getElementById('input-phrase-custom').value.trim();
      if (!val) return;
      onboardingDraft.phrase = val;
      onboardingStep = 4;
      break;
    }
    case 'toggle-trigger': {
      const i = onboardingDraft.triggers.indexOf(value);
      if (i >= 0) onboardingDraft.triggers.splice(i, 1);
      else onboardingDraft.triggers.push(value);
      break;
    }
    case 'select-all-triggers':
      onboardingDraft.triggers = RESET_TRIGGER_OPTIONS.map((o) => o.key);
      break;
    case 'save-reset-routine':
      saveResetRoutine();
      return;
    case 'start-local':
      startLocal();
      return;
    case 'connect-toggle':
      connectShowGist = !connectShowGist;
      setStatus('');
      break;
    case 'tour-next':
      tourNext();
      return;
    case 'tour-back':
      tourStep = Math.max(0, tourStep - 1);
      setStatus('');
      break;
    case 'tour-replay':
      tourStep = 0;
      tourName = gistState?.profile?.name || '';
      setStatus('');
      view = 'tour';
      window.scrollTo(0, 0);
      break;
    case 'brand-tap':
      // Hidden: triple-tap the logo to reach the reset-everything screen.
      if (!creds) return;
      brandTapCount += 1;
      clearTimeout(brandTapTimer);
      if (brandTapCount >= 3) {
        brandTapCount = 0;
        setStatus('');
        view = 'confirmReset';
      } else {
        brandTapTimer = setTimeout(() => { brandTapCount = 0; }, 1200);
        return;
      }
      break;
    case 'cancel-reset':
      setStatus('');
      view = homeView();
      break;
    case 'confirm-reset':
      resetAllData();
      return;
    case 'go-home':
      view = homeView();
      setStatus('');
      break;
    case 'nav':
      setStatus('');
      view = value;
      window.scrollTo(0, 0);
      break;
    case 'iq-open':
      setStatus('');
      view = 'iqHome';
      break;
    case 'iq-start-play':
      startIqLesson('play');
      return;
    case 'iq-start-review':
      startIqLesson('review');
      return;
    case 'iq-node': {
      if (value === 'locked') {
        showToast('Finish the unit before this one to unlock it.');
        break;
      }
      if (iqLesson) {
        view = 'iqLesson';
        break;
      }
      const outs = outsToday(iqState(), todayKey());
      startIqLesson(outs >= OUTS_PER_INNING ? 'review' : 'play');
      return;
    }
    case 'toggle-unit': {
      const statuses = unitStatuses(iqState(), todayKey());
      const currentId = currentConceptId(iqState(), statuses);
      const showing = expandedUnit || statuses.find((st) => st.unit.concepts.some((c) => c.id === currentId))?.unit.id;
      expandedUnit = showing === value ? '__none__' : value;
      break;
    }
    case 'iq-quit':
      view = 'iqHome';
      break;
    case 'iq-voice':
      if (voiceOn()) setVoiceOn(false);
      else { setVoiceOn(true); replayVoice(voiceContext()); }
      break;
    case 'iq-resume':
      view = 'iqLesson';
      break;
    case 'iq-pick':
      stopVoice();
      pickIqChoice(Number(value));
      break;
    case 'iq-check':
      checkIqAnswer();
      break;
    case 'iq-next':
      nextIqCard();
      return;
    case 'iq-retry-save':
      finishIqLesson();
      return;
    case 'toggle-sound':
      soundOn = !soundOn;
      localStorage.setItem(SOUND_KEY, soundOn ? 'on' : 'off');
      if (soundOn) playSound('right');
      break;
    case 'start-day':
      startNewDay();
      return;
    case 'team-practice-yes':
      draftDay.teamPractice = true;
      saveDraftDay(draftDay);
      checkinDraft.practiced = true; // implied by "yes, team practice" — no need to re-ask
      break;
    case 'team-practice-no':
      draftDay.teamPractice = false;
      saveDraftDay(draftDay);
      break;
    case 'complete-reset-rep':
      draftDay.resetRepCompleted = true;
      saveDraftDay(draftDay);
      break;
    case 'complete-mental':
      draftDay.mentalWatched = true;
      saveDraftDay(draftDay);
      break;
    case 'complete-mechanics':
      draftDay.mechanicsWatched = true;
      saveDraftDay(draftDay);
      break;
    case 'return-from-practice':
      draftDay.sentToPractice = true;
      saveDraftDay(draftDay);
      break;
    case 'set-practiced':
      checkinDraft.practiced = value === 'yes';
      break;
    case 'toggle-practice-type': {
      const i = checkinDraft.practiceType.indexOf(value);
      if (i >= 0) checkinDraft.practiceType.splice(i, 1);
      else checkinDraft.practiceType.push(value);
      break;
    }
    case 'submit-checkin':
      submitCheckin();
      return;
    default:
      return;
  }
  render();
}

root.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  handleAction(el.dataset.action, el.dataset.value);
});

root.addEventListener('submit', (e) => {
  if (e.target.id === 'connect-form') handleConnectSubmit(e);
  else if (e.target.id === 'tour-form') {
    e.preventDefault();
    tourNext();
  }
});

// Keep typed text in sync with draft state as it's typed, not just read once at submit —
// otherwise tapping a chip (which re-renders the whole screen) would wipe out anything
// already typed in these fields, since a fresh render only knows about state, not the DOM.
root.addEventListener('input', (e) => {
  if (e.target.id === 'voice-feedback-input') checkinDraft.voiceFeedback = e.target.value;
  else if (e.target.id === 'practice-other-input') checkinDraft.practiceTypeOther = e.target.value;
});

// Keyboard play on iPad keyboards and desktop: 1–4 pick an answer, Enter checks/continues.
document.addEventListener('keydown', (e) => {
  if (view !== 'iqLesson' || !iqLesson || iqLesson.finished || e.metaKey || e.ctrlKey || e.altKey) return;
  const card = iqLesson.cards[iqLesson.index];
  const answered = iqLesson.selected !== null && iqLesson.selected !== undefined;
  if (!answered && /^[1-9]$/.test(e.key)) {
    const choice = card.order[Number(e.key) - 1];
    if (choice !== undefined) handleAction('iq-pick', String(choice));
  } else if (e.key === 'Enter') {
    e.preventDefault();
    handleAction(answered ? 'iq-next' : 'iq-check');
  }
});

boot();

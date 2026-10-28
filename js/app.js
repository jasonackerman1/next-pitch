import { loadCredentials, saveCredentials, loadCachedState, saveCachedState, loadDraftDay, saveDraftDay, clearDraftDay, loadIqLesson, saveIqLesson, clearIqLesson } from './state.js';
import { fetchState, commitMutation, seedState, GistError } from './gist.js';
import { emptyState, getContentForDayIndex, PRACTICE_ENABLED, PLAYER_NAME, RESET_ACTION_OPTIONS, RESET_PHRASE_OPTIONS, RESET_TRIGGER_OPTIONS, HOME_PRACTICE_TYPE_OPTIONS, TEAM_PRACTICE_TYPE_OPTIONS } from './data.js';
import { IQ_REWARDS } from './iq-content.js';
import {
  OUTS_PER_INNING, MASTERED_BOX, RANKS, todayKey, normalizeIq, outsToday, rankFor, conceptById, resolveVariant,
  unitStatuses, freshConceptIds, masteryTotals, makeCard, buildLesson, buildReviewLesson, applyLesson, displayStreak,
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
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  glove: '<svg viewBox="0 0 40 40"><path fill="#e07a3f" d="M13 35c-6-3.5-8-11-6-20 1-4.5 5-5 6-1.5l1 5 .6-10c.2-4 5-4 5.3 0l.6 9.4 1-10.4c.4-4 5.2-3.6 5.2.3l-.2 10.4 2-7c1.2-3.8 6-2.5 5.2 1.3L31 23c2.6-1.8 5.6.4 4 3.3-3 5.5-8 9.7-15 10z"/><path fill="none" stroke="#b85f2c" stroke-width="1.6" stroke-linecap="round" d="M14.5 19c3 2.5 9 2.5 13 .5M13 27c4 3 10 3 15 0"/></svg>',
};

function icon(name) {
  return ICONS[name] || '';
}

// ---------- Skip, the mascot ----------
// A baseball-headed coach ("Skip" = what players call the manager), drawn like a 1930s
// rubber-hose cartoon: thick ink outlines, pie-cut eyes, heavy brows, a big grin. Inspired
// by the big-ball-head mascot the family loves, but his own guy: navy cap, orange "H".
// moods: happy (default), cheer (eyes squeezed, mouth wide open), oops (worried), think.

const INK = '#141414';

function pieEye(cx, cy, dx = 0, dy = 0) {
  // a black oval with the classic wedge cut out of it, pupils nudged by dx/dy
  const x = cx + dx;
  const y = cy + dy;
  return `<ellipse cx="${x}" cy="${y}" rx="6.8" ry="10" fill="${INK}"/>
    <path d="M${x + 0.5} ${y - 0.5} L${x + 1.8} ${y - 10.5} L${x + 7.5} ${y - 4.5} Z" fill="#fbf4e4"/>`;
}

function skipSvg(mood = 'happy', extraClass = '') {
  const face = {
    happy: `
      <path d="M38 59q8-6 16-1M66 58q8-5 16 1" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      ${pieEye(47, 73)}${pieEye(73, 73)}
      <path d="M37 88Q60 114 83 88Q60 96 37 88Z" fill="${INK}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M41 89.5Q60 96 79 89.5L77 93Q60 98 43 93Z" fill="#ffffff"/>
      <path d="M51 101Q60 95 69 101Q60 107 51 101Z" fill="#e5484d"/>
      <path d="M34 84q4 2 4 7M86 84q-4 2-4 7" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    cheer: `
      <path d="M36 57q9-8 18-2M66 55q9-6 18 2" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M39 75q8-11 16 0M65 75q8-11 16 0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M36 84Q60 118 84 84Q60 92 36 84Z" fill="${INK}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M40 86Q60 92 80 86L78 91Q60 96 42 91Z" fill="#ffffff"/>
      <path d="M49 101Q60 93 71 101Q60 108 49 101Z" fill="#e5484d"/>
      <path d="M32 80q4 3 4 8M88 80q-4 3-4 8" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    oops: `
      <path d="M39 61q7-7 15-6M66 55q8-1 15 6" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      ${pieEye(47, 74, 0, -2)}${pieEye(73, 74, 0, -2)}
      <path d="M46 96q5-6 10 0t10 0t9-1" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M93 54q6 9 1 13q-6 2-6-4q0-4 5-9z" fill="#8fd3ff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`,
    think: `
      <path d="M38 62q8-3 16-1M66 58q8-6 16 0" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      ${pieEye(47, 74, 3, -1)}${pieEye(73, 73, 3, -1)}
      <path d="M50 95q11 4 22-4" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M71 89q4 1 3 6" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  }[mood];
  const stitch = (d, ticks) => `<path d="${d}" stroke="#d6303a" stroke-width="2.6" fill="none" stroke-linecap="round"/>${ticks
    .map(([x, y, a]) => `<path d="M${x - 3} ${y - 2}l3 2l-3 2" transform="rotate(${a} ${x} ${y})" stroke="#d6303a" stroke-width="2" fill="none" stroke-linecap="round"/>`).join('')}`;
  return `<svg class="skip ${extraClass}" viewBox="0 0 120 120" aria-hidden="true">
    <circle cx="60" cy="69" r="41" fill="#fbf4e4" stroke="${INK}" stroke-width="4.5"/>
    <path d="M30 98q14 12 34 10" stroke="#e6dcc4" stroke-width="6" fill="none" stroke-linecap="round"/>
    ${stitch('M27 60q11 17 1 36', [[29, 66, 200], [31, 75, 180], [31, 84, 165]])}
    ${stitch('M93 60q-11 17-1 36', [[91, 66, -20], [89, 75, 0], [89, 84, 15]])}
    <g transform="translate(0 -6)">
    <path d="M21 54Q19 14 60 12Q101 14 99 54Z" fill="#1d3f8f" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M32 40Q36 22 54 18" stroke="#4d73c9" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M13 55Q60 41 107 55Q60 68 13 55Z" fill="#ff6b1a" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
    <circle cx="60" cy="12" r="5" fill="#ff6b1a" stroke="${INK}" stroke-width="3.5"/>
    <text x="61" y="45" text-anchor="middle" font-family="'Barlow Condensed', system-ui, sans-serif" font-style="italic" font-weight="900" font-size="25" fill="#ff6b1a" stroke="${INK}" stroke-width="3.5" paint-order="stroke" stroke-linejoin="round">H</text>
    </g>
    <g transform="translate(0 3)">${face}</g>
  </svg>`;
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
      <span class="brand-word">Heads <span>Up</span></span>
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

async function boot() {
  if (!creds) {
    view = 'connect';
    render();
    return;
  }
  await refreshFromGist({ silent: true });
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
          ${skipSvg('happy', 'skip-hello')}
          <h1 class="h1">Heads Up</h1>
          <p class="body">One-time setup: connect the app to its private data store.</p>
          <form id="connect-form" class="focus-center-inner" style="gap:14px">
            <label class="field-label">Gist ID
              <input type="text" id="input-gist-id" class="input" placeholder="e.g. 8f2c1a9b..." autocomplete="off" autocapitalize="off" spellcheck="false" required />
            </label>
            <label class="field-label">Access Token
              <input type="password" id="input-token" class="input" placeholder="github_pat_..." autocomplete="off" autocapitalize="off" spellcheck="false" required />
            </label>
            <button type="submit" class="btn btn-orange btn-block" ${busy ? 'disabled' : ''}>${busy ? 'Connecting…' : 'Connect'}</button>
          </form>
          ${statusHtml()}
          <p class="small">This only needs to be done once on Owen's iPad.</p>
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
    const newState = await commitMutation(creds.token, creds.gistId, (fresh) => {
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
    const newState = await commitMutation(creds.token, creds.gistId, () => fresh);
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
    view = PRACTICE_ENABLED ? 'onboarding' : 'iqHome';
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
    const newState = await commitMutation(creds.token, creds.gistId, (fresh) => {
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
  return `<span class="outs" aria-label="${outs} of ${OUTS_PER_INNING} outs">${label ? '<span class="outs-label">OUTS</span>' : ''}${lights}</span>`;
}

function barHtml(pct, gold = false) {
  return `<div class="bar"><div class="bar-fill ${gold ? 'bar-fill-gold' : ''} ${pct === 0 ? 'bar-fill-zero' : ''}" style="width:${pct}%"></div></div>`;
}

/** Streak / XP / mastered — shown as top-bar chips on phone, a stat row on iPad, and cards
 *  in the right rail on wide screens. */
function iqNumbers() {
  const iq = iqState();
  const today = todayKey();
  return { iq, today, streak: displayStreak(iq, today), totals: masteryTotals(iq), ...rankFor(iq.xp) };
}

function statRowHtml() {
  const n = iqNumbers();
  return `
    <div class="stat-row only-ipad">
      <div class="stat"><span style="color:var(--clay)">${icon('flame')}</span><div class="stat-text"><div class="stat-num">${n.streak}</div><div class="stat-label">day streak</div></div></div>
      <div class="stat"><span style="color:var(--gold)">${icon('bolt')}</span><div class="stat-text"><div class="stat-num">${n.iq.xp}</div><div class="stat-label">XP · ${escapeHtml(n.rank.title)}</div></div></div>
      <div class="stat"><span style="color:var(--green)">${icon('star')}</span><div class="stat-text"><div class="stat-num">${n.totals.mastered}<small>/${n.totals.total}</small></div><div class="stat-label">mastered</div></div></div>
    </div>
  `;
}

function railHtml() {
  const n = iqNumbers();
  const toNext = n.next ? Math.round(((n.iq.xp - n.rank.xp) / (n.next.xp - n.rank.xp)) * 100) : 100;
  return `
    <div class="card">
      <div class="reward">
        <div class="reward-icon" style="color:var(--clay)">${icon('flame')}</div>
        <div class="reward-body">
          <div class="stat-num">${n.streak} day streak</div>
          <div class="small">Best: ${n.iq.longestStreak}. Play one lesson a day to keep it going.</div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="eyebrow">Rank</div>
      <div class="h2">${escapeHtml(n.rank.title)}</div>
      ${barHtml(toNext, true)}
      <div class="small">${n.next ? `${n.next.xp - n.iq.xp} XP to ${escapeHtml(n.next.title)}` : 'Top rank — Field General.'}</div>
    </div>
    ${IQ_REWARDS.map((r) => rewardCardHtml(r, n.totals)).join('')}
  `;
}

// ---------- app shell ----------

const NAV = [
  { view: 'iqHome', label: 'Play', icon: 'diamond' },
  { view: 'iqRewards', label: 'Rewards', icon: 'trophy' },
  { view: 'iqMe', label: PLAYER_NAME, icon: 'person' },
  ...(PRACTICE_ENABLED ? [{ view: 'home', label: 'Practice', icon: 'bat' }] : []),
];

function navActive(item) {
  if (item.view === 'home') return ['home', 'day', 'onboarding'].includes(view);
  return item.view === view;
}

function shellHtml(mainHtml) {
  const n = gistState ? iqNumbers() : null;
  return `
    <div class="shell">
      <header class="topbar">
        ${brandHtml()}
        ${n ? `
          <div class="chips">
            <span class="chip-stat ${n.streak ? 'chip-streak' : 'chip-dim'}" aria-label="${n.streak} day streak">${icon('flame')}${n.streak}</span>
            <span class="chip-stat chip-xp" aria-label="${n.iq.xp} XP">${icon('bolt')}${n.iq.xp}</span>
          </div>
        ` : ''}
      </header>
      <nav class="sidebar" aria-label="Main">
        ${brandHtml()}
        ${NAV.map((item) => `
          <button class="side-link ${navActive(item) ? 'side-link-active' : ''}" data-action="nav" data-value="${item.view}">${icon(item.icon)}<span>${escapeHtml(item.label)}</span></button>
        `).join('')}
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

// ---------- game iq: play (home + the path) ----------

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

  let mood = 'happy';
  let kicker;
  let title;
  let line;
  let buttons;
  if (iqLesson) {
    kicker = 'Mid-inning';
    title = 'Finish the at-bat';
    line = 'You left a lesson in the middle. Pick it back up.';
    buttons = '<button class="btn btn-white" data-action="iq-resume">Resume</button>';
  } else if (inningOver) {
    mood = 'oops';
    kicker = 'Three outs';
    title = 'Fix your mistakes';
    line = 'Get the misses right and you\'re back in the game.';
    buttons = '<button class="btn btn-white" data-action="iq-start-review">Fix them</button>';
  } else {
    const lesson = buildLesson(iq, today);
    kicker = `${playedToday ? 'Another at-bat' : 'Today\'s at-bat'} · ${lesson.length} plays`;
    title = 'Read the play';
    line = playedToday
      ? `Nice work today, ${escapeHtml(PLAYER_NAME)}. Want another round?`
      : `Heads up, ${escapeHtml(PLAYER_NAME)}. Situations from all over the field. Make the right call.`;
    buttons = `<button class="btn btn-white" data-action="iq-start-play" ${lesson.length ? '' : 'disabled'}>${playedToday ? 'Play again' : 'Play ball'}</button>`;
  }

  return `
    ${statRowHtml()}
    <section class="hero-card ${inningOver && !iqLesson ? 'hero-over' : ''}">
      ${skipSvg(mood, 'skip-hello')}
      <div class="hero-kicker">${kicker}</div>
      <h2 class="hero-title">${escapeHtml(title)}</h2>
      <p class="hero-line">${line}</p>
      <div class="hero-row">${outsHtml(outs)}${buttons}</div>
      ${!inningOver && !iqLesson && iq.missed.length ? `<button class="link-btn hero-sub-btn" data-action="iq-start-review">Fix mistakes (${iq.missed.length}) →</button>` : ''}
    </section>
    <div class="section-head"><span>Your season</span><span>Rank: ${escapeHtml(n.rank.title)}</span></div>
    <div class="season">
      ${statuses.map((s, i) => unitHtml(s, i, iq, currentId, inningOver)).join('')}
    </div>
    ${statusHtml()}
  `;
}

// Which unit's situations are showing in the season list. null = the unit with UP NEXT.
let expandedUnit = null;

function unitHtml({ unit, status, total, mastered }, i, iq, currentId, inningOver) {
  const pct = total ? Math.round((mastered / total) * 100) : 0;
  const num = status === 'mastered' ? icon('star') : status === 'locked' ? icon('lock') : String(i + 1);
  const sub = {
    coming: 'Coming soon',
    locked: 'Unlocks after the unit before it',
    mastered: `All ${total} mastered`,
    open: `${mastered} of ${total} mastered · ${escapeHtml(unit.subtitle)}`,
  }[status];
  const hasCurrent = unit.concepts.some((c) => c.id === currentId);
  const expanded = (status === 'open' || status === 'mastered') && (expandedUnit ? expandedUnit === unit.id : hasCurrent);
  const tag = status === 'coming' ? 'div' : 'button';
  const head = `
    <${tag} class="lvl-head" ${tag === 'button' ? `data-action="toggle-unit" data-value="${unit.id}" aria-expanded="${expanded}"` : ''}>
      <div class="lvl-num">${num}</div>
      <div class="lvl-body">
        <div class="lvl-title">${escapeHtml(unit.title)}</div>
        <div class="lvl-sub">${sub}</div>
        ${status === 'open' || status === 'mastered' ? barHtml(pct, false) : ''}
      </div>
      ${tag === 'button' ? `<span class="lvl-chev ${expanded ? 'lvl-chev-open' : ''}">›</span>` : ''}
    </${tag}>
  `;
  if (!expanded) return `<section class="lvl lvl-${status} ${hasCurrent ? 'lvl-current' : ''}">${head}</section>`;

  // The open unit lists its situations ("plays"): pips show progress toward mastery.
  const plays = unit.concepts.map((c) => {
    const st = iq.concepts[c.id];
    const box = st?.box ?? 0;
    const kind = st && box >= MASTERED_BOX ? 'gold' : st ? 'progress' : 'todo';
    const isCurrent = c.id === currentId && !iqLesson;
    const glyph = kind === 'gold' ? icon('star') : icon('ball');
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
  return `<section class="lvl lvl-${status} lvl-current">${head}<div class="plays">${plays}</div></section>`;
}

// ---------- game iq: rewards + me ----------

function rewardCardHtml(reward, totals) {
  const pct = totals.total ? Math.round((totals.mastered / totals.total) * 100) : 0;
  const earned = reward.type === 'allMastered' && totals.allUnitsWritten && totals.mastered === totals.total;
  return `
    <div class="card reward ${earned ? 'reward-earned' : ''}">
      <div class="reward-icon">${icon('glove')}</div>
      <div class="reward-body">
        <div class="h2">${escapeHtml(reward.title)}</div>
        <div class="small">${escapeHtml(reward.requirement)}</div>
        ${barHtml(pct, true)}
        <div class="small">${earned ? 'Earned! Go tell Dad.' : `${totals.mastered} of ${totals.total} mastered${totals.allUnitsWritten ? '' : ' · more units drop this winter'}`}</div>
      </div>
    </div>
  `;
}

function renderIqRewards() {
  const n = iqNumbers();
  return `
    <h1 class="h1">Rewards</h1>
    <p class="body">Real gear for real baseball IQ. Mastering a situation takes right answers on different days, so there's no cramming. You have to actually know it.</p>
    ${IQ_REWARDS.map((r) => rewardCardHtml(r, n.totals)).join('')}
    <div class="card">
      <div class="coach">${skipSvg('think')}<div class="bubble">More rewards are on the way. Keep stacking days.</div></div>
    </div>
    <h2 class="h2">Ranks</h2>
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
    <div class="profile">${skipSvg('happy')}<div><h1 class="h1">${escapeHtml(PLAYER_NAME)}</h1><div class="small">${escapeHtml(n.rank.title)} · ${n.iq.xp} XP</div></div></div>
    <div class="card">
      <div class="list-row"><span>Lessons played</span><strong>${n.iq.lessonsCompleted}</strong></div>
      <div class="list-row"><span>Answers right</span><strong>${right} of ${answered}${answered ? ` (${accuracy}%)` : ''}</strong></div>
      <div class="list-row"><span>Situations mastered</span><strong>${n.totals.mastered} of ${n.totals.total}</strong></div>
      <div class="list-row"><span>Current streak</span><strong>${n.streak}</strong></div>
      <div class="list-row"><span>Best streak</span><strong>${n.iq.longestStreak}</strong></div>
    </div>
    <h2 class="h2">By unit</h2>
    <div class="card">
      ${statuses.filter((s) => s.total > 0).map((s) => `
        <div class="list-row" style="flex-direction:column;align-items:stretch;gap:6px">
          <div style="display:flex;justify-content:space-between"><span>${escapeHtml(s.unit.title)}</span><strong>${s.mastered}/${s.total}</strong></div>
          ${barHtml(s.total ? Math.round((s.mastered / s.total) * 100) : 0)}
        </div>
      `).join('')}
    </div>
    <h2 class="h2">Settings</h2>
    <div class="card">
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
    const newState = await commitMutation(creds.token, creds.gistId, (fresh) => {
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

// The situation: a broadcast count bug over a little ballpark under the lights — grass,
// infield dirt, white bases, orange runners, and a pulsing "YOU".
const FIELD_SPOTS = {
  batter: [88, 148], onDeck: [152, 160], runner1: [145, 105], runner2: [100, 60], runner3: [55, 105],
  P: [100, 105], C: [100, 162], '1B': [138, 94], '2B': [124, 72], SS: [76, 72], '3B': [62, 94],
  LF: [42, 50], CF: [100, 24], RF: [158, 50],
};
const BASES = { 1: [145, 105], 2: [100, 60], 3: [55, 105] };

function fieldSvg(sit) {
  const runners = sit.runners || [];
  const youIsRunner = /^runner(\d)$/.exec(sit.you || '');
  const base = ([x, y]) => `<rect x="${x - 5}" y="${y - 5}" width="10" height="10" transform="rotate(45 ${x} ${y})" class="field-base"/>`;
  const runner = (n) => {
    if (!runners.includes(n) || (youIsRunner && Number(youIsRunner[1]) === n)) return '';
    const [x, y] = BASES[n];
    return `<circle cx="${x}" cy="${y - 10}" r="6" class="field-runner"/>`;
  };
  const you = FIELD_SPOTS[sit.you];
  const youY = youIsRunner ? you[1] - 10 : you?.[1];
  // Home plate at (100,150); bases 45 units apart on the diagonals; foul lines run from home
  // through first and third out to the fence.
  return `
    <svg class="field-svg" viewBox="0 0 200 172" aria-hidden="true">
      <rect x="0" y="0" width="200" height="172" rx="16" class="field-foul"/>
      <path class="field-grass" d="M100 150 L10 60 Q100 -30 190 60 Z"/>
      <path class="field-dirt" d="M100 150 L37 87 Q100 18 163 87 Z"/>
      <path class="field-infield-grass" d="M100 137 L132 105 L100 73 L68 105 Z"/>
      <path class="field-chalk" d="M100 150 L10 60 M100 150 L190 60"/>
      <circle cx="100" cy="105" r="6" class="field-dirt"/>
      <path d="M95 147h10v4l-5 4l-5-4z" class="field-base"/>
      ${base(BASES[1])}${base(BASES[2])}${base(BASES[3])}
      ${runner(1)}${runner(2)}${runner(3)}
      ${you ? `
        <circle cx="${you[0]}" cy="${youY}" r="7" class="field-you-pulse"/>
        <circle cx="${you[0]}" cy="${youY}" r="7" class="field-you"/>
        <text x="${you[0]}" y="${youY - 12}" text-anchor="middle" class="field-you-label">YOU</text>
      ` : ''}
    </svg>
  `;
}

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

const RIGHT_LINES = ['Heads-up play!', 'Nice read!', 'That\'s baseball IQ.', 'You knew it.', 'Smart ballplayer!'];

function renderIqLesson() {
  const lesson = iqLesson;
  if (lesson.finished) {
    return `
      <div class="focus"><div class="focus-center"><div class="focus-center-inner">
        ${skipSvg('think', 'skip-hello')}
        <h1 class="h1">${busy ? 'Saving…' : 'Lesson done'}</h1>
        ${busy ? '' : '<button class="btn btn-orange btn-block" data-action="iq-retry-save">Save my results</button>'}
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

  const choices = card.order.map((i, pos) => {
    let cls = '';
    if (answered) {
      if (i === resolved.answer) cls = 'choice-right';
      else if (i === selected) cls = 'choice-wrong';
      else cls = 'choice-faded';
    } else if (i === pending) cls = 'choice-picked';
    return `<button class="choice ${cls}" data-action="iq-pick" data-value="${i}" ${answered ? 'disabled' : ''}><span class="choice-key">${pos + 1}</span><span>${escapeHtml(resolved.choices[i])}</span></button>`;
  }).join('');

  let footer;
  if (!answered) {
    footer = `<footer class="footer"><div class="footer-inner">
      <span class="small only-wide-hint">${pending === null ? 'Pick an answer' : 'Locked in?'}</span>
      <button class="btn btn-orange btn-block" data-action="iq-check" ${pending === null ? 'disabled' : ''}>Check</button>
    </div></footer>`;
  } else {
    const inningEnds = !correct && lesson.mode === 'play' && outs >= OUTS_PER_INNING;
    const title = correct ? RIGHT_LINES[lesson.index % RIGHT_LINES.length] : lesson.mode === 'play' ? (inningEnds ? 'Strike three. Inning\'s over.' : 'That\'s an out.') : 'Not quite.';
    const nextLabel = inningEnds ? 'End inning' : lesson.index === lesson.cards.length - 1 ? 'Finish' : 'Continue';
    footer = `<footer class="footer ${correct ? 'footer-right' : 'footer-wrong'}"><div class="footer-inner">
      <div class="feedback">
        ${skipSvg(correct ? 'cheer' : 'oops')}
        <div>
          <p class="feedback-title">${title}</p>
          ${correct ? '' : `<p class="feedback-why"><strong>Answer:</strong> ${escapeHtml(resolved.choices[resolved.answer])}</p>`}
          <p class="feedback-why">${escapeHtml(concept.why)}</p>
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
        ${lesson.mode === 'play' ? outsHtml(outs, false) : '<span class="tag">Review</span>'}
      </div></div>
      <div class="focus-body"><div class="focus-body-inner ${hasSit ? 'focus-body-inner-wide' : ''}">
        <div class="lesson-grid ${hasSit ? '' : 'lesson-grid-single'}">
          ${hasSit ? `<div class="lesson-col situation">${bugHtml(resolved.sit)}<div class="field-card">${fieldSvg(resolved.sit)}</div></div>` : ''}
          <div class="lesson-col">
            <div class="tags">
              <span class="tag">${escapeHtml(concept.title)}</span>
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
  let mood = 'cheer';
  if (!r.completed) {
    mood = 'oops';
    title = 'Three outs. Inning\'s over.';
    body = 'Every great hitter strikes out. Fix your mistakes to start a new inning, or come back tomorrow.';
  } else if (r.mode === 'review') {
    title = 'Mistakes fixed. New inning!';
    body = 'That\'s how you get better: go back to what you missed until it sticks.';
  } else {
    title = r.correct === r.total ? 'Perfect lesson!' : 'Lesson complete!';
    body = 'These come back later, worded differently. Know it, don\'t memorize it.';
  }
  return `
    <div class="focus"><div class="focus-center"><div class="focus-center-inner">
      ${skipSvg(mood, 'skip-hello')}
      <h1 class="h1">${title}</h1>
      <p class="body">${body}</p>
      <div class="tiles">
        <div class="tile tile-green"><div class="tile-label">Right</div><div class="tile-value">${r.correct}/${r.total}</div></div>
        <div class="tile tile-gold"><div class="tile-label">XP</div><div class="tile-value">+${r.xpEarned}</div></div>
        <div class="tile tile-clay"><div class="tile-label">Streak</div><div class="tile-value">${r.streak}</div></div>
      </div>
      ${!r.completed ? '<button class="btn btn-red btn-block" data-action="iq-start-review">Fix my mistakes</button>' : ''}
      <button class="btn ${r.completed ? 'btn-orange' : 'btn-ghost'} btn-block" data-action="nav" data-value="iqHome">${r.completed ? 'Continue' : 'Back to the season'}</button>
    </div></div></div>
  `;
}

// ---------- render dispatch ----------

function render() {
  let html;
  if (view === 'connect') html = renderConnectScreen();
  else if (view === 'confirmReset') html = renderConfirmReset();
  else if (view === 'iqLesson') html = renderIqLesson();
  else if (view === 'iqResult') html = renderIqResult();
  else if (view === 'iqHome') html = shellHtml(renderIqHome());
  else if (view === 'iqRewards') html = shellHtml(renderIqRewards());
  else if (view === 'iqMe') html = shellHtml(renderIqMe());
  else if (view === 'onboarding') html = shellHtml(renderOnboarding());
  else if (view === 'home') html = shellHtml(renderHome());
  else if (view === 'day') html = shellHtml(renderDayStep());
  else html = `<div class="focus"><div class="focus-center"><div class="focus-center-inner">${skipSvg('think', 'skip-hello')}<p class="body">Loading…</p></div></div></div>`;
  root.innerHTML = html + toastHtml();
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
    case 'iq-resume':
      view = 'iqLesson';
      break;
    case 'iq-pick':
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

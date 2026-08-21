import { loadCredentials, saveCredentials, loadCachedState, saveCachedState, loadDraftDay, saveDraftDay, clearDraftDay } from './state.js';
import { fetchState, commitMutation, seedState, GistError } from './gist.js';
import { emptyState, getContentForDayIndex, RESET_ACTION_OPTIONS, RESET_PHRASE_OPTIONS, RESET_TRIGGER_OPTIONS, HOME_PRACTICE_TYPE_OPTIONS, TEAM_PRACTICE_TYPE_OPTIONS } from './data.js';

const root = document.getElementById('root');

// The brand mark: two crossed baseball bats, tapered barrel-to-handle with a round knob —
// Jay's original idea. An earlier round added a ball at the center; that read as a blurry
// blob at small sizes and got dropped, back to just the bats. Colors are CSS custom
// properties, not hardcoded — this SVG is inserted inline into the document (not as an
// <img>), so var(--accent) resolves normally.
function crossedBatsIcon(size = 28) {
  const bat = 'M42,4 L58,4 L53.5,52 L53.5,84 L46.5,84 L46.5,52 Z';
  return `<svg class="brand-mark" width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g transform="rotate(45 50 50)">
      <path d="${bat}" fill="var(--accent)"/>
      <circle cx="50" cy="88" r="6" fill="var(--accent)"/>
    </g>
    <g transform="rotate(-45 50 50)">
      <path d="${bat}" fill="var(--accent)"/>
      <circle cx="50" cy="88" r="6" fill="var(--accent)"/>
    </g>
  </svg>`;
}

// Small recurring baseball-motif icons — a home-plate pentagon (used as a bullet before
// every "Day N" label) and a stitch mark (an X, used as a bullet before section titles).
function plateIcon() {
  return '<span class="plate-icon"></span>';
}
function stitchIcon() {
  return '<svg class="stitch-icon" width="10" height="10" viewBox="0 0 10 10"><line x1="1" y1="1" x2="9" y2="9" stroke-width="1.6" stroke-linecap="round"/><line x1="9" y1="1" x2="1" y2="9" stroke-width="1.6" stroke-linecap="round"/></svg>';
}

// Persistent header on every screen — not just home — so the brand reads consistently
// throughout instead of a small inline lockup that only showed up in a couple of places.
// Triple-tapping it is still the hidden entry point to the reset-all-data confirmation
// screen (see handleAction's 'brand-tap' case); it's disabled before a Gist is connected
// since there's nothing to reset yet.
function headerBar() {
  return `
    <header class="app-header">
      <button type="button" class="brand-mark-tap" data-action="brand-tap" aria-label="Next Pitch">
        ${crossedBatsIcon(28)}
        <span class="brand-word">NEXT <span>PITCH</span></span>
      </button>
    </header>
  `;
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
  return toastMessage ? `<div class="toast">${escapeHtml(toastMessage)}</div>` : '';
}

let creds = loadCredentials();
let gistState = loadCachedState();
let draftDay = loadDraftDay();

let view = 'loading'; // 'connect' | 'onboarding' | 'home' | 'day' | 'confirmReset'
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

function routeAfterLoad() {
  if (draftDay) {
    view = 'day';
    return;
  }
  view = gistState.resetRoutine ? 'home' : 'onboarding';
}

// ---------- connect screen ----------

function renderConnectScreen() {
  return `
    <div class="screen screen-connect">
      <div class="screen-inner">
        <p class="lede">One-time setup — connect the app to its private data store.</p>
        <form id="connect-form" class="connect-form">
          <label>Gist ID
            <input type="text" id="input-gist-id" placeholder="e.g. 8f2c1a9b..." autocomplete="off" autocapitalize="off" spellcheck="false" required />
          </label>
          <label>Access Token
            <input type="password" id="input-token" placeholder="github_pat_..." autocomplete="off" autocapitalize="off" spellcheck="false" required />
          </label>
          <button type="submit" class="btn btn-primary btn-plate btn-block" ${busy ? 'disabled' : ''}>${busy ? 'Connecting…' : 'Connect'}</button>
        </form>
        ${statusMessage ? `<p class="status ${statusIsError ? 'status-error' : ''}">${escapeHtml(statusMessage)}</p>` : ''}
        <p class="hint">This only needs to be done once on Owen's iPad.</p>
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
    <h1 class="onb-title">Welcome to Next Pitch</h1>
    <p class="onb-body">This app is built around one idea: no matter what just happened —
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
    <div class="screen screen-confirm-reset">
      <div class="screen-inner">
        <button class="back-link" data-action="cancel-reset">‹ Back</button>
        <h1 class="onb-title">Reset Everything?</h1>
        <p class="onb-body">This clears the saved Reset Play and every day's history —
          streak, check-ins, all of it — so the app is a clean slate. Do this right before
          handing the iPad to Owen for the first time, since he'll be walked straight back
          into onboarding to build his own Reset Play.</p>
        <p class="onb-body"><strong>This can't be undone.</strong></p>
        <button class="btn btn-danger btn-block btn-large" data-action="confirm-reset" ${busy ? 'disabled' : ''}>${busy ? 'Resetting…' : 'Yes, Reset Everything'}</button>
        <button class="btn btn-outline btn-block" data-action="cancel-reset">Cancel</button>
        ${statusMessage ? `<p class="status ${statusIsError ? 'status-error' : ''}">${escapeHtml(statusMessage)}</p>` : ''}
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
    busy = false;
    view = 'onboarding';
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
    showToast(`Day ${finishedDay.dayNumber} logged — Next Pitch.`);
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

// ---------- render dispatch ----------

function render() {
  let html;
  if (view === 'connect') html = renderConnectScreen();
  else if (view === 'onboarding') html = renderOnboarding();
  else if (view === 'home') html = renderHome();
  else if (view === 'day') html = renderDayStep();
  else if (view === 'confirmReset') html = renderConfirmReset();
  else html = '<div class="screen"><div class="screen-inner"><p>Loading…</p></div></div>';
  root.innerHTML = headerBar() + html + toastHtml();
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
      if (!creds) return; // nothing to reset before a Gist is even connected
      brandTapCount += 1;
      clearTimeout(brandTapTimer);
      if (brandTapCount >= 3) {
        brandTapCount = 0;
        setStatus('');
        view = 'confirmReset';
      } else {
        brandTapTimer = setTimeout(() => { brandTapCount = 0; }, 1200);
        return; // no visible change on tap 1/2 — nothing to re-render
      }
      break;
    case 'cancel-reset':
      setStatus('');
      view = 'home';
      break;
    case 'confirm-reset':
      resetAllData();
      return;
    case 'go-home':
      view = 'home';
      setStatus('');
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

boot();

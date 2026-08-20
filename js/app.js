import { loadCredentials, saveCredentials, loadCachedState, saveCachedState, loadDraftDay, saveDraftDay, clearDraftDay } from './state.js';
import { fetchState, commitMutation, seedState, GistError } from './gist.js';
import { emptyState, getContentForDayIndex, RESET_ACTION_OPTIONS, RESET_PHRASE_OPTIONS, RESET_TRIGGER_OPTIONS, PRACTICE_TYPE_OPTIONS } from './data.js';

const root = document.getElementById('root');

// The brand mark: a dashed pitch trajectory arcing down to a ball. Used in the header
// lockup wherever the app identifies itself. currentColor so it inherits text color.
function trajectoryIcon(size = 22) {
  return `<svg class="trajectory-icon" width="${size}" height="${size * 0.6}" viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 12 Q 68 8 112 46" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-dasharray="1 14"/>
    <circle cx="112" cy="46" r="9" fill="currentColor"/>
  </svg>`;
}

function brandLockup({ tappable } = {}) {
  const inner = `${trajectoryIcon(20)}<span class="brand-word">NEXT PITCH</span>`;
  // On home, triple-tapping the logo is a hidden entry point to the reset-all-data
  // confirmation screen — an admin action Owen shouldn't be able to stumble into with
  // a single accidental tap, but Jay needs a way to wipe his own test data before
  // handing the iPad over. See handleAction's 'brand-tap' case.
  return tappable
    ? `<button type="button" class="brand-lockup brand-lockup-tap" data-action="brand-tap">${inner}</button>`
    : `<span class="brand-lockup">${inner}</span>`;
}

let brandTapCount = 0;
let brandTapTimer = null;

let creds = loadCredentials();
let gistState = loadCachedState();
let draftDay = loadDraftDay();

let view = 'loading'; // 'connect' | 'onboarding' | 'home' | 'day' | 'resetCard' | 'daySummary'
let statusMessage = '';
let statusIsError = false;
let busy = false;

let onboardingStep = 1;
let onboardingDraft = { action: null, phrase: null, triggers: [] };
let onboardingShowActionCustom = false;
let onboardingShowPhraseCustom = false;

let checkinDraft = { practiced: null, practiceType: [], voiceFeedback: '' };

let lastCompletedDay = null; // for the daySummary screen

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
        <h1 class="app-title">${brandLockup()}</h1>
        <p class="lede">One-time setup — connect the app to its private data store.</p>
        <form id="connect-form" class="connect-form">
          <label>Gist ID
            <input type="text" id="input-gist-id" placeholder="e.g. 8f2c1a9b..." autocomplete="off" autocapitalize="off" spellcheck="false" required />
          </label>
          <label>Access Token
            <input type="password" id="input-token" placeholder="github_pat_..." autocomplete="off" autocapitalize="off" spellcheck="false" required />
          </label>
          <button type="submit" class="btn btn-primary btn-block" ${busy ? 'disabled' : ''}>${busy ? 'Connecting…' : 'Connect'}</button>
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
  for (let i = 1; i <= total; i++) dots += `<span class="dot ${i === current ? 'dot-active' : ''}"></span>`;
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
    <h1 class="onb-title">Let's build your reset</h1>
    <p class="onb-body">Every player messes up. The best ones have a way to let it go fast so it doesn't ruin the next pitch. Let's build yours.</p>
    <button class="btn btn-primary btn-block" data-action="onboarding-next">Let's go</button>
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
      <button class="btn btn-primary btn-block" data-action="confirm-action-custom">Continue</button>
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
      <button class="btn btn-primary btn-block" data-action="confirm-phrase-custom">Continue</button>
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
    <button class="btn btn-primary btn-block" data-action="onboarding-next" ${onboardingDraft.triggers.length === 0 ? 'disabled' : ''}>Continue</button>
  `;
}

function resetCardHtml(routine) {
  const triggerLabels = routine.triggers.map((k) => RESET_TRIGGER_OPTIONS.find((o) => o.key === k)?.label || k);
  return `
    <div class="reset-card">
      <div class="reset-card-label">YOUR ROUTINE</div>
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
    <h1 class="onb-title">This is your reset</h1>
    ${resetCardHtml(onboardingDraft)}
    <p class="onb-body">You'll do a quick rep of this every day before you go practice.</p>
    <button class="btn btn-primary btn-block" data-action="save-reset-routine" ${busy ? 'disabled' : ''}>${busy ? 'Saving…' : 'This is my reset!'}</button>
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

function renderHome() {
  const streak = gistState.currentStreak || 0;
  const longest = gistState.longestStreak || 0;
  const dayNumber = gistState.days.length + 1;
  return `
    <div class="screen screen-home">
      <div class="screen-inner">
        <div class="home-header">
          <h1 class="app-title">${brandLockup({ tappable: true })}</h1>
          <button class="icon-link" data-action="view-reset-card">My Reset ›</button>
        </div>
        <div class="streak-row">
          <div class="streak-block">
            <div class="streak-number">${streak}</div>
            <div class="streak-label">day streak</div>
          </div>
          <div class="streak-block streak-block-dim">
            <div class="streak-number">${longest}</div>
            <div class="streak-label">best streak</div>
          </div>
        </div>
        <div class="day-card">
          <div class="day-card-label">Day ${dayNumber}</div>
          <p class="day-card-body">Reset rep, two quick videos, then go practice.</p>
          <button class="btn btn-primary btn-block btn-large" data-action="start-day">Start Today</button>
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
        <p class="onb-body">This clears the saved reset routine and every day's history —
          streak, check-ins, all of it — so the app is a clean slate. Do this right before
          handing the iPad to Owen for the first time, since he'll be walked straight back
          into onboarding to build his own routine.</p>
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
    checkinDraft = { practiced: null, practiceType: [], voiceFeedback: '' };
    onboardingStep = 1;
    onboardingDraft = { action: null, phrase: null, triggers: [] };
    onboardingShowActionCustom = false;
    onboardingShowPhraseCustom = false;
    lastCompletedDay = null;
    busy = false;
    view = 'onboarding';
  } catch (err) {
    busy = false;
    setStatus(err instanceof GistError ? err.message : String(err), true);
  }
  render();
}

function renderResetCardScreen() {
  return `
    <div class="screen screen-reset-card">
      <div class="screen-inner">
        <button class="back-link" data-action="go-home">‹ Back</button>
        <h1 class="onb-title">Your Reset</h1>
        ${resetCardHtml(gistState.resetRoutine)}
      </div>
    </div>
  `;
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
    resetRepCompleted: false,
    mentalWatched: false,
    mechanicsWatched: false,
    sentToPractice: false,
  };
  saveDraftDay(draftDay);
  checkinDraft = { practiced: null, practiceType: [], voiceFeedback: '' };
  view = 'day';
  render();
}

function currentDayStep() {
  if (!draftDay.resetRepCompleted) return 'resetRep';
  if (!draftDay.mentalWatched) return 'mental';
  if (!draftDay.mechanicsWatched) return 'mechanics';
  if (!draftDay.sentToPractice) return 'goPractice';
  return 'checkin';
}

function renderDayStep() {
  const step = currentDayStep();
  let body;
  if (step === 'resetRep') body = dayStepResetRep();
  else if (step === 'mental') body = dayStepVideo('mental');
  else if (step === 'mechanics') body = dayStepVideo('mechanics');
  else if (step === 'goPractice') body = dayStepGoPractice();
  else body = dayStepCheckin();

  return `
    <div class="screen screen-day">
      <div class="screen-inner">
        <div class="day-step-label">Day ${draftDay.dayNumber}</div>
        ${body}
      </div>
    </div>
  `;
}

function dayStepResetRep() {
  return `
    <h1 class="onb-title">Reset Rep</h1>
    <p class="onb-body">Run through your routine once before you head out.</p>
    ${resetCardHtml(gistState.resetRoutine)}
    <button class="btn btn-primary btn-block btn-large" data-action="complete-reset-rep">Done — I did my reset rep</button>
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
    <button class="btn btn-primary btn-block btn-large" data-action="${action}">I watched it</button>
  `;
}

function dayStepGoPractice() {
  return `
    <h1 class="onb-title">Time to Practice</h1>
    <p class="onb-body">Get your reps in. Come back here when you're done to check in.</p>
    <button class="btn btn-primary btn-block btn-large" data-action="return-from-practice">I'm Back</button>
  `;
}

function dayStepCheckin() {
  return `
    <h1 class="onb-title">How'd it go?</h1>

    <p class="checkin-question">Did you practice today?</p>
    <div class="toggle-row">
      <button class="btn ${checkinDraft.practiced === true ? 'btn-primary' : 'btn-outline'}" data-action="set-practiced" data-value="yes">Yes</button>
      <button class="btn ${checkinDraft.practiced === false ? 'btn-primary' : 'btn-outline'}" data-action="set-practiced" data-value="no">No</button>
    </div>

    ${checkinDraft.practiced === true ? `
      <p class="checkin-question">What did you work on?</p>
      <div class="chip-row">
        ${PRACTICE_TYPE_OPTIONS.map((opt) => `
          <button class="chip ${checkinDraft.practiceType.includes(opt) ? 'chip-selected' : ''}" data-action="toggle-practice-type" data-value="${escapeHtml(opt)}">${escapeHtml(opt)}</button>
        `).join('')}
      </div>
    ` : ''}

    ${checkinDraft.practiced !== null ? `
      <p class="checkin-question">How did it feel?</p>
      <textarea id="voice-feedback-input" class="text-input voice-textarea" placeholder="Type here — or tap in and use your keyboard's dictation mic…" rows="4">${escapeHtml(checkinDraft.voiceFeedback)}</textarea>
      <button class="btn btn-primary btn-block btn-large" data-action="submit-checkin" ${busy ? 'disabled' : ''}>${busy ? 'Saving…' : 'Finish Day'}</button>
    ` : ''}

    ${statusMessage ? `<p class="status ${statusIsError ? 'status-error' : ''}">${escapeHtml(statusMessage)}</p>` : ''}
  `;
}

async function submitCheckin() {
  const textarea = document.getElementById('voice-feedback-input');
  const voiceFeedback = textarea ? textarea.value.trim() : checkinDraft.voiceFeedback.trim();

  busy = true;
  setStatus('');
  render();

  const finishedDay = {
    dayNumber: draftDay.dayNumber,
    mentalVideoId: draftDay.mentalVideoId,
    mechanicsVideoId: draftDay.mechanicsVideoId,
    resetRepCompleted: draftDay.resetRepCompleted,
    practiced: checkinDraft.practiced,
    practiceType: checkinDraft.practiceType,
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
    lastCompletedDay = { ...finishedDay, currentStreak: newState.currentStreak, longestStreak: newState.longestStreak };
    clearDraftDay();
    draftDay = null;
    busy = false;
    view = 'daySummary';
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

function renderDaySummary() {
  const d = lastCompletedDay;
  return `
    <div class="screen screen-summary">
      <div class="screen-inner">
        <h1 class="onb-title summary-anchor">${trajectoryIcon(28)}<span>Next Pitch.</span></h1>
        <p class="onb-body">Day ${d.dayNumber} complete. Whatever happened today, that's what matters now.</p>
        <div class="summary-card">
          <div class="streak-number">${d.currentStreak}</div>
          <div class="streak-label">day streak</div>
        </div>
        <button class="btn btn-primary btn-block btn-large" data-action="go-home">Back to Home</button>
      </div>
    </div>
  `;
}

// ---------- render dispatch ----------

function render() {
  let html;
  if (view === 'connect') html = renderConnectScreen();
  else if (view === 'onboarding') html = renderOnboarding();
  else if (view === 'home') html = renderHome();
  else if (view === 'day') html = renderDayStep();
  else if (view === 'resetCard') html = renderResetCardScreen();
  else if (view === 'daySummary') html = renderDaySummary();
  else if (view === 'confirmReset') html = renderConfirmReset();
  else html = '<div class="screen"><div class="screen-inner"><p>Loading…</p></div></div>';
  root.innerHTML = html;
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
    case 'view-reset-card':
      view = 'resetCard';
      break;
    case 'brand-tap':
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

boot();

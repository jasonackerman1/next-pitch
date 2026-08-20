// Local device storage. All localStorage reads/writes go through here.
// Single-user app (Owen) — no player identity, no commissioner gate.

const CREDENTIALS_KEY = 'next-pitch:credentials';
const CACHED_STATE_KEY = 'next-pitch:cachedState';
const DRAFT_DAY_KEY = 'next-pitch:draftDay';

export function loadCredentials() {
  const raw = localStorage.getItem(CREDENTIALS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCredentials({ token, gistId }) {
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify({ token, gistId }));
}

export function clearCredentials() {
  localStorage.removeItem(CREDENTIALS_KEY);
}

export function loadCachedState() {
  const raw = localStorage.getItem(CACHED_STATE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCachedState(state) {
  localStorage.setItem(CACHED_STATE_KEY, JSON.stringify(state));
}

/** In-progress "today" — the reset rep / videos / check-in steps aren't pushed to the
 *  Gist until check-in is submitted, so progress through the day lives here in the
 *  meantime. Surviving a reload matters (Owen closing the app mid-flow), surviving a
 *  new device doesn't (single iPad, no sync needed). */
export function loadDraftDay() {
  const raw = localStorage.getItem(DRAFT_DAY_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveDraftDay(draft) {
  localStorage.setItem(DRAFT_DAY_KEY, JSON.stringify(draft));
}

export function clearDraftDay() {
  localStorage.removeItem(DRAFT_DAY_KEY);
}

// Game IQ engine — pure functions over the `gameIq` slice of state. No DOM, no storage, so
// the same functions can replay a finished lesson onto a freshly-fetched Gist state inside
// commitMutation (race-safe, same as every other write in the app).
//
// How mastery works (spaced repetition, Leitner-style boxes):
//   box 0 = just introduced. A correct answer on a day the concept is DUE moves it up one box
//   and schedules the next review INTERVAL_DAYS[box] days out. Box 4 = mastered.
//   A miss drops it two boxes and makes it due again right away.
//   At most one box move per concept per day, so mastery can't be crammed in one sitting:
//   it takes four correct answers spread over at least 11 days.
//
// Outs: every wrong answer in a normal lesson is an out. Three outs and the inning's over —
// no new lessons until he fixes his mistakes (a review lesson) or a new day starts.

import { IQ_UNITS } from './iq-content.js';

export const LESSON_SIZE = 5;
export const OUTS_PER_INNING = 3;
export const MASTERED_BOX = 4;
const MAX_NEW_PER_LESSON = 3;
const MAX_REVIEW_CARDS = 8;
const INTERVAL_DAYS = [0, 1, 3, 7, 14];
const XP_CORRECT = 10;
const XP_REVIEW_CORRECT = 5;
const XP_LESSON_BONUS = 15;

export const RANKS = [
  { xp: 0, title: 'Rookie' },
  { xp: 150, title: 'Prospect' },
  { xp: 400, title: 'Starter' },
  { xp: 800, title: 'All-Star' },
  { xp: 1400, title: 'Captain' },
  { xp: 2200, title: 'Field General' },
];

// ---------- dates (local calendar days, as YYYY-MM-DD strings) ----------

export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(key, n) {
  const [y, m, d] = key.split('-').map(Number);
  return todayKey(new Date(y, m - 1, d + n));
}

// ---------- state ----------

export function emptyIqState() {
  return {
    xp: 0,
    streak: 0,
    longestStreak: 0,
    lastPlayed: null,
    outs: 0,
    outsDate: null,
    missed: [],
    lessonsCompleted: 0,
    concepts: {},
  };
}

/** Gists created before Game IQ existed have no gameIq key — fill in defaults. */
export function normalizeIq(iq) {
  return { ...emptyIqState(), ...(iq || {}) };
}

export function outsToday(iq, today) {
  return iq.outsDate === today ? iq.outs : 0;
}

export function rankFor(xp) {
  let rank = RANKS[0];
  let next = null;
  for (const r of RANKS) {
    if (xp >= r.xp) rank = r;
    else if (!next) next = r;
  }
  return { rank, next };
}

// ---------- content lookups ----------

const CONCEPTS_BY_ID = {};
for (const unit of IQ_UNITS) {
  for (const concept of unit.concepts) CONCEPTS_BY_ID[concept.id] = { unit, concept };
}

export function conceptById(id) {
  return CONCEPTS_BY_ID[id]?.concept || null;
}

/** A variant with its choices resolved: `choices` is the original order, `answer` is the
 *  index of the right one. True/False cards keep True before False. */
export function resolveVariant(concept, variantIndex) {
  const v = concept.variants[variantIndex];
  if (typeof v.tf === 'boolean') {
    return { ...v, choices: ['True', 'False'], answer: v.tf ? 0 : 1, fixedOrder: true };
  }
  return { ...v, answer: 0, fixedOrder: false };
}

function isMastered(iq, conceptId) {
  return (iq.concepts[conceptId]?.box || 0) >= MASTERED_BOX;
}

/** Status per unit. Every unit with cards (and a passed release date, if it has one) is
 *  open at once — lessons mix situations from all of them, so a day's five plays might be
 *  one in right field, one at first, one on the bases. No unit locks behind another. */
export function unitStatuses(iq, today) {
  return IQ_UNITS.map((unit) => {
    const total = unit.concepts.length;
    const introduced = unit.concepts.filter((c) => iq.concepts[c.id]).length;
    const mastered = unit.concepts.filter((c) => isMastered(iq, c.id)).length;
    const released = !unit.releaseDate || unit.releaseDate <= today;
    let status;
    if (total === 0 || !released) status = 'coming';
    else if (mastered === total) status = 'mastered';
    else status = 'open';
    return { unit, status, total, introduced, mastered };
  });
}

/** Concepts he hasn't seen yet, dealt round-robin across the open units (first new one
 *  from unit 1, then unit 2, then unit 3, …) so new material always comes from all over
 *  the field instead of one topic at a time. */
export function freshConceptIds(iq, today) {
  const queues = unitStatuses(iq, today)
    .filter((s) => s.status === 'open')
    .map((s) => s.unit.concepts.filter((c) => !iq.concepts[c.id]).map((c) => c.id));
  const out = [];
  for (let round = 0; queues.some((q) => round < q.length); round++) {
    for (const q of queues) if (round < q.length) out.push(q[round]);
  }
  return out;
}

/** Mastery across every concept written so far. Units still to come don't count yet, so
 *  `allUnitsWritten` tells the rewards panel whether full mastery is even reachable. */
export function masteryTotals(iq) {
  const all = Object.keys(CONCEPTS_BY_ID);
  return {
    mastered: all.filter((id) => isMastered(iq, id)).length,
    total: all.length,
    allUnitsWritten: IQ_UNITS.every((u) => u.concepts.length > 0),
  };
}

// ---------- building a lesson ----------

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** One lesson card: which concept, which variant, and the order the choices show in. The
 *  variant rotates every time the concept comes back, so he never sees the same wording
 *  twice in a row. */
export function makeCard(iq, conceptId, avoidVariant = null) {
  const concept = conceptById(conceptId);
  const n = concept.variants.length;
  let variant = ((iq.concepts[conceptId]?.lastVariant ?? -1) + 1) % n;
  if (variant === avoidVariant && n > 1) variant = (variant + 1) % n;
  const resolved = resolveVariant(concept, variant);
  const indices = resolved.choices.map((_, i) => i);
  return { conceptId, variant, order: resolved.fixedOrder ? indices : shuffle(indices) };
}

/** Normal lesson: concepts that are due for review come first, up to 3 brand-new concepts
 *  (dealt across units) fill in, and if that's still short of 5, the least-recently-seen
 *  concepts get extra practice (practice that isn't due doesn't move mastery, only XP). */
export function buildLesson(iq, today) {
  const openConceptIds = unitStatuses(iq, today)
    .filter((s) => s.status === 'open' || s.status === 'mastered')
    .flatMap((s) => s.unit.concepts.map((c) => c.id));

  const due = openConceptIds
    .filter((id) => iq.concepts[id] && iq.concepts[id].nextDue <= today)
    .sort((a, b) => iq.concepts[a].nextDue.localeCompare(iq.concepts[b].nextDue));
  const fresh = freshConceptIds(iq, today);

  const picks = [];
  const newCount = Math.min(MAX_NEW_PER_LESSON, fresh.length, LESSON_SIZE);
  picks.push(...due.slice(0, LESSON_SIZE - newCount));
  picks.push(...fresh.slice(0, LESSON_SIZE - picks.length));
  if (picks.length < LESSON_SIZE) {
    const extra = openConceptIds
      .filter((id) => iq.concepts[id] && !picks.includes(id))
      .sort((a, b) => (iq.concepts[a].lastSeen || '').localeCompare(iq.concepts[b].lastSeen || ''));
    picks.push(...extra.slice(0, LESSON_SIZE - picks.length));
  }
  return shuffle(picks).map((id) => makeCard(iq, id));
}

/** Fix-your-mistakes lesson: every concept he missed. A miss here doesn't cost an out — the
 *  card just comes back at the end (with different wording) until he gets it right. */
export function buildReviewLesson(iq) {
  return shuffle(iq.missed.filter((id) => conceptById(id)).slice(0, MAX_REVIEW_CARDS)).map((id) => makeCard(iq, id));
}

// ---------- recording results ----------

function recordAnswer(iq, conceptId, variant, correct, today) {
  const st = iq.concepts[conceptId] || (iq.concepts[conceptId] = {
    box: 0, nextDue: today, seen: 0, correct: 0, wrong: 0, lastSeen: null, lastVariant: -1, lastMove: null,
  });
  st.seen += 1;
  st.lastSeen = today;
  st.lastVariant = variant;
  if (correct) {
    st.correct += 1;
    if (st.nextDue <= today && st.lastMove !== today) {
      st.box = Math.min(MASTERED_BOX, st.box + 1);
      st.nextDue = addDays(today, INTERVAL_DAYS[st.box]);
      st.lastMove = today;
    }
  } else {
    st.wrong += 1;
    st.box = Math.max(0, st.box - 2);
    st.nextDue = today;
    st.lastMove = today; // a miss today means no box move today, even if he gets it right later
  }
}

/** Applies a finished (or cut-short) lesson to the gameIq state. Mutates and returns
 *  { iq, xpEarned }. `answers` = [{ conceptId, variant, correct }] in the order given;
 *  `completed` = false when the inning ended early on the third out. */
export function applyLesson(iqIn, { mode, answers, completed }, today) {
  const iq = normalizeIq(iqIn);
  if (iq.outsDate !== today) {
    iq.outs = 0;
    iq.outsDate = today;
  }
  let xpEarned = 0;
  for (const a of answers) {
    recordAnswer(iq, a.conceptId, a.variant, a.correct, today);
    if (a.correct) {
      xpEarned += mode === 'review' ? XP_REVIEW_CORRECT : XP_CORRECT;
    } else if (mode === 'play') {
      iq.outs += 1;
      if (!iq.missed.includes(a.conceptId)) iq.missed.push(a.conceptId);
    }
  }
  if (completed) {
    xpEarned += XP_LESSON_BONUS;
    iq.lessonsCompleted += 1;
    if (mode === 'review') {
      const fixed = new Set(answers.map((a) => a.conceptId));
      iq.missed = iq.missed.filter((id) => !fixed.has(id));
      iq.outs = 0; // mistakes fixed — new inning
    }
  }
  iq.xp += xpEarned;

  if (answers.length > 0 && iq.lastPlayed !== today) {
    iq.streak = iq.lastPlayed === addDays(today, -1) ? iq.streak + 1 : 1;
    iq.longestStreak = Math.max(iq.longestStreak, iq.streak);
    iq.lastPlayed = today;
  }
  return { iq, xpEarned };
}

/** Current streak as it should display today — a streak whose last play was before
 *  yesterday is already broken, even though the stored number hasn't been reset yet. */
export function displayStreak(iq, today) {
  if (!iq.lastPlayed) return 0;
  return iq.lastPlayed === today || iq.lastPlayed === addDays(today, -1) ? iq.streak : 0;
}

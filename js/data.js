// The 8-day content set from the build spec. Sequence-based, not calendar-based —
// day 9 reuses index 0, day 10 reuses index 1, etc. (see getContentForDayIndex in app.js).
//
// Trimmed to exactly 8 each already. A 9th mental video ("How to Conquer the Mental
// Game of Hitting", T_tWm_pJFGk) was in the original candidate list but is explicitly
// held back per the spec's open items — decide the real 8 with YouTube Data API
// engagement numbers later, not guesswork. Swap it in/out here if that trim changes.
//
// All videos still need a real watch-through by Jay before this goes live with Owen —
// only screened by title/description so far.

export const MENTAL_VIDEOS = [
  { title: 'Coaching A Strong Mental Approach — The Hitting Vault', tag: 'approach/reset', videoId: 'XQG8C7FiPoA' },
  { title: 'How To: Mental Approach To Hitting', tag: 'approach/reset', videoId: 'kc40P5v4x5o' },
  { title: 'Hitting Mentality and Approach — Hitting Done Right', tag: 'confidence/plan', videoId: 'jMQqChPa7Uw' },
  { title: 'Why The Mental Side of Hitting is So Important!', tag: 'why-it-matters', videoId: 'BaXWn7qPU4k' },
  { title: "Bobby Witt Jr.'s Mental Training Blueprint for Youth Hitters", tag: 'confidence + focus', videoId: 'lYyZc3YK20k' },
  { title: 'How to Bounce Back After a Bad Game (Without Losing Confidence)', tag: 'reset after error', videoId: '6AEmKnFYfVA' },
  { title: 'Sports Psychology for Kids: Build Confidence & Stop Playing Scared', tag: 'reset after error', videoId: 'jIbkN_aaIx0' },
  { title: 'Building Confidence and Overcoming The Fear of Getting Hit', tag: 'fear/HBP', videoId: 'DC_3uyk3XSE' },
];

export const MECHANICS_VIDEOS = [
  { title: '5 ESSENTIAL Baseball Hitting Drills for Youth Players', tag: 'general drills', videoId: 'fPRAqPcEPYA' },
  { title: 'THE 7 BEST YOUTH BASEBALL HITTING DRILLS!', tag: 'general drills', videoId: 'UeJpXF55kvs' },
  { title: 'Youth Hitting Drill To Stop Pulling Off the Ball', tag: 'specific flaw fix', videoId: 'mC5rRupCo1k' },
  { title: 'Baseball Hitting Routine for 10-12 Year Olds', tag: 'age-matched routine', videoId: 'qRvMxbQ803I' },
  { title: 'Improve Your Load With This Resistance Band Drill — Baseball Rebellion', tag: 'load mechanic', videoId: 'oRTLh1mUYG0' },
  { title: 'Front Arm Chain Drill — Baseball Rebellion', tag: 'front arm mechanic', videoId: 'FcncPLQvXTA' },
  { title: 'YOUTH BASEBALL HITTING MECHANICS', tag: 'general mechanics', videoId: 'IO3jMuWJa0Y' },
  { title: '3 BEST Baseball Hitting Drills For Youth Baseball Players', tag: 'general drills', videoId: 'jZeIG-gK2Ik' },
];

export const RESET_ACTION_OPTIONS = [
  'Take a deep breath',
  'Tap my bat/glove on the ground',
  'Clap my hands once',
  'Roll my shoulders',
];

export const RESET_PHRASE_OPTIONS = [
  { label: 'Next pitch' },
  { label: 'Reset' },
  { label: 'Flush it', blurb: 'This is a real technique NFL players use to let a mistake go.' },
  { label: 'Let it go' },
];

export const RESET_TRIGGER_OPTIONS = [
  { key: 'strikeout', label: 'After a strikeout' },
  { key: 'error', label: 'After an error' },
  { key: 'bad-call', label: 'After a bad pitch call' },
];

export const PRACTICE_TYPE_OPTIONS = [
  'Hitting off tee',
  'Soft toss',
  'Swings in mirror',
  'Something else',
];

export function emptyState() {
  return {
    resetRoutine: null,
    days: [],
    currentStreak: 0,
    longestStreak: 0,
  };
}

/** 0-indexed content-set position for the Nth day (0-indexed dayIndex, i.e. state.days.length
 *  before today's day is appended). Wraps every 8 days regardless of calendar gaps. */
export function getContentForDayIndex(dayIndex) {
  const i = dayIndex % MENTAL_VIDEOS.length;
  return { mental: MENTAL_VIDEOS[i], mechanics: MECHANICS_VIDEOS[i] };
}

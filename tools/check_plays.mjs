// Checks every play in js/iq-plays.js (or a draft file passed as an argument) against the
// cards: every situation card has a play, every play belongs to a real situation card, and
// every step only uses players who are actually on the field and spots that exist.
//   node tools/check_plays.mjs                 → checks js/iq-plays.js, all units
//   node tools/check_plays.mjs draft.mjs u7    → checks a draft file for one unit: its PLAYS
//     (on top of js/iq-plays.js) and, if it exports FIELD_CARDS { conceptId: [variants] },
//     those cards appended to the end of their concepts, as they'd be when merged in
import { IQ_UNITS } from '../js/iq-content.js';
import { SPOTS } from '../js/field.js';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

import { PLAYS as REPO_PLAYS } from '../js/iq-plays.js';

const draft = process.argv[2] ? await import(pathToFileURL(path.resolve(process.argv[2])).href) : {};
const units = process.argv.slice(3);
const PLAYS = { ...REPO_PLAYS, ...(draft.PLAYS || {}) };
const draftProblems = [];
for (const [cid, list] of Object.entries(draft.FIELD_CARDS || {})) {
  const concept = IQ_UNITS.flatMap((u) => u.concepts).find((c) => c.id === cid);
  if (!concept) { draftProblems.push(`FIELD_CARDS: no concept "${cid}"`); continue; }
  for (const v of list) {
    if (!v.ask) draftProblems.push(`FIELD_CARDS ${cid}: every card needs ask`);
    concept.variants.push(v);
    console.log(`draft card ${cid}:${concept.variants.length - 1}`);
  }
}

const DEFENSE = ['P', 'C', '1B', '2B', 'SS', '3B', 'LF', 'CF', 'RF'];
const KEYS = { run: ['run', 'to', 'ms'], field: ['field', 'to', 'ms'], ball: ['ball', 'to', 'fly', 'roll', 'ms'], say: ['say', 'who', 'ms'], out: ['out'], safe: ['safe'], wait: ['wait'] };
const problems = [...draftProblems];
const cards = {};
const askCards = {};
for (const u of IQ_UNITS) {
  if (units.length && !units.includes(u.id)) continue;
  for (const c of u.concepts) c.variants.forEach((v, i) => {
    if (v.sit) cards[`${c.id}:${i}`] = v.sit;
    if (v.ask) askCards[`${c.id}:${i}`] = v;
    if (v.ask && !v.sit) problems.push(`${c.id}:${i}: field question needs a sit`);
  });
}

for (const key of Object.keys(cards)) if (!PLAYS[key]) problems.push(`${key}: no play`);
for (const [key, play] of Object.entries(PLAYS)) {
  const sit = cards[key];
  if (!sit) { if (!units.length) problems.push(`${key}: not a situation card (check the concept id and variant index)`); continue; }
  if (!Array.isArray(play) || !play.length) { problems.push(`${key}: play must be a non-empty array`); continue; }
  checkSteps(key, play, sit, 'step');
}

// Field questions: a real thing to drag (or players to tap), targets far enough apart to tell
// apart, short labels, and setup steps that only use players on the field.
for (const [key, v] of Object.entries(askCards)) {
  const sit = v.sit;
  const actors = actorsFor(sit);
  const ask = v.ask;
  const where = `${key} (field question)`;
  if (!ask.tap && !ask.drag) problems.push(`${where}: ask needs drag or tap`);
  if (ask.drag && ask.drag !== 'ball' && !actors.has(ask.drag)) problems.push(`${where}: can't drag ${ask.drag}, not on the field`);
  if (ask.drag === 'ball' && !actors.has(ask.from)) problems.push(`${where}: ball needs a from: player who has it`);
  if (!Array.isArray(v.targets) || v.targets.length < 2 || v.targets.length > 5) { problems.push(`${where}: needs 2-5 targets`); continue; }
  const pos = v.targets.map((t) => {
    if (!t.label || t.label.length > 60) problems.push(`${where}: target label missing or over 60 chars: "${t.label}"`);
    if (ask.tap && !actors.has(t.at)) problems.push(`${where}: tap target ${JSON.stringify(t.at)} must be a player on the field`);
    if (!ask.tap && !isPlaceFor(actors, t.at)) problems.push(`${where}: bad target ${JSON.stringify(t.at)}`);
    return xyOf(t.at);
  });
  if (!ask.tap) pos.forEach((a, i) => pos.forEach((b, j) => {
    if (j > i && a && b && Math.hypot(a[0] - b[0], a[1] - b[1]) < 30) problems.push(`${where}: targets ${i + 1} and ${j + 1} are only ${Math.round(Math.hypot(a[0] - b[0], a[1] - b[1]))} apart (need 30)`);
  }));
  if (ask.setup) checkSteps(key, ask.setup, sit, 'setup step');
}

function actorsFor(sit) {
  const actors = new Set([...DEFENSE, 'B', 'YOU', ...(sit.runners || []).map((n) => `R${n}`)]);
  if (sit.you === 'onDeck') actors.add('OD');
  return actors;
}
function isPlaceFor(actors, p) {
  return p === undefined ? false : typeof p === 'number' ? [1, 2, 3, 4].includes(p)
    : Array.isArray(p) ? p.length === 2 && p.every(Number.isFinite)
    : typeof p === 'object' ? Number.isFinite(p.x) && Number.isFinite(p.y)
    : p === 'home' || p === 'back' || actors.has(p) || (p in SPOTS && !/^(OD|R[123])$/.test(p));
}
// Start-of-play position of a target (actors at their spots). Good enough for spacing checks.
function xyOf(p) {
  if (p && typeof p === 'object' && !Array.isArray(p)) return [p.x, p.y];
  if (Array.isArray(p)) return p;
  if (typeof p === 'number') return SPOTS[['home', 'b1', 'b2', 'b3', 'home'][p]];
  return SPOTS[p] || null;
}

function checkSteps(key, play, sit, label) {
  const actors = actorsFor(sit);
  const isPlace = (p) => isPlaceFor(actors, p);
  play.forEach((step, si) => {
    for (const a of Array.isArray(step) ? step : [step]) {
      const kind = Object.keys(KEYS).find((k) => k in a);
      const where = `${key} ${label} ${si + 1}`;
      if (!kind) { problems.push(`${where}: unknown action ${JSON.stringify(a)}`); continue; }
      for (const k of Object.keys(a)) if (!KEYS[kind].includes(k)) problems.push(`${where}: "${k}" isn't allowed on a ${kind} action`);
      const who = a.run ?? a.field ?? a.out ?? a.safe;
      if (who !== undefined && !actors.has(who)) problems.push(`${where}: ${who} isn't on the field in this situation`);
      if (a.run && DEFENSE.includes(a.run)) problems.push(`${where}: use field (not run) for fielder ${a.run}`);
      if (a.field && !DEFENSE.includes(a.field) && a.field !== 'YOU') problems.push(`${where}: use run (not field) for ${a.field}`);
      if ((a.run || a.field) && !isPlace(a.to)) problems.push(`${where}: bad destination ${JSON.stringify(a.to)}`);
      if (a.ball !== undefined) {
        if (!isPlace(a.ball)) problems.push(`${where}: bad ball start ${JSON.stringify(a.ball)}`);
        const tos = Array.isArray(a.to) && typeof a.to[0] !== 'number' ? a.to : [a.to];
        tos.forEach((t) => { if (!isPlace(t) || t === 'back') problems.push(`${where}: bad ball target ${JSON.stringify(t)}`); });
      }
      if (a.say !== undefined && (typeof a.say !== 'string' || a.say.length > 40)) problems.push(`${where}: say must be a short string (40 chars max): "${a.say}"`);
      if (a.who !== undefined && !actors.has(a.who)) problems.push(`${where}: ${a.who} isn't on the field`);
    }
  });
}
const total = Object.keys(cards).length;
const done = Object.keys(cards).filter((k) => PLAYS[k]).length;
console.log(`${done}/${total} situation cards have plays.`);
if (problems.length) { console.log(problems.join('\n')); process.exit(1); }
console.log('All plays valid.');

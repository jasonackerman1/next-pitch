// Checks every play in js/iq-plays.js (or a draft file passed as an argument) against the
// cards: every situation card has a play, every play belongs to a real situation card, and
// every step only uses players who are actually on the field and spots that exist.
//   node tools/check_plays.mjs                 → checks js/iq-plays.js, all units
//   node tools/check_plays.mjs draft.mjs u7    → checks a draft file's PLAYS for one unit
import { IQ_UNITS } from '../js/iq-content.js';
import { SPOTS } from '../js/field.js';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const file = process.argv[2] ? pathToFileURL(path.resolve(process.argv[2])).href : '../js/iq-plays.js';
const units = process.argv.slice(3);
const { PLAYS } = await import(file);

const DEFENSE = ['P', 'C', '1B', '2B', 'SS', '3B', 'LF', 'CF', 'RF'];
const KEYS = { run: ['run', 'to', 'ms'], field: ['field', 'to', 'ms'], ball: ['ball', 'to', 'fly', 'roll', 'ms'], say: ['say', 'who', 'ms'], out: ['out'], safe: ['safe'], wait: ['wait'] };
const problems = [];
const cards = {};
for (const u of IQ_UNITS) {
  if (units.length && !units.includes(u.id)) continue;
  for (const c of u.concepts) c.variants.forEach((v, i) => { if (v.sit) cards[`${c.id}:${i}`] = v.sit; });
}

for (const key of Object.keys(cards)) if (!PLAYS[key]) problems.push(`${key}: no play`);
for (const [key, play] of Object.entries(PLAYS)) {
  const sit = cards[key];
  if (!sit) { if (!units.length) problems.push(`${key}: not a situation card (check the concept id and variant index)`); continue; }
  const actors = new Set([...DEFENSE, 'B', 'YOU', ...(sit.runners || []).map((n) => `R${n}`)]);
  if (sit.you === 'onDeck') actors.add('OD');
  const isPlace = (p) => p === undefined ? false : typeof p === 'number' ? [1, 2, 3, 4].includes(p)
    : Array.isArray(p) ? p.length === 2 && p.every(Number.isFinite)
    : typeof p === 'object' ? Number.isFinite(p.x) && Number.isFinite(p.y)
    : p === 'home' || p === 'back' || actors.has(p) || (p in SPOTS && !/^(OD|R[123])$/.test(p));
  if (!Array.isArray(play) || !play.length) { problems.push(`${key}: play must be a non-empty array`); continue; }
  play.forEach((step, si) => {
    for (const a of Array.isArray(step) ? step : [step]) {
      const kind = Object.keys(KEYS).find((k) => k in a);
      const where = `${key} step ${si + 1}`;
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

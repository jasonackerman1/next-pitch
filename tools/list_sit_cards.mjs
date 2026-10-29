// Lists every situation card (variants with a `sit`) and whether it has a play yet.
//   node tools/list_sit_cards.mjs [unitId]
import { IQ_UNITS } from '../js/iq-content.js';
import { PLAYS } from '../js/iq-plays.js';
const only = process.argv[2];
for (const u of IQ_UNITS) {
  if (only && u.id !== only) continue;
  let n = 0, done = 0;
  for (const c of u.concepts) c.variants.forEach((v, i) => { if (v.sit) { n++; if (PLAYS[`${c.id}:${i}`]) done++; } });
  console.log(`${u.id} ${u.title}: ${n} situation cards, ${done} with plays (${u.concepts.length} concepts)`);
}

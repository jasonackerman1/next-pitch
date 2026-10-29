// Prints every line the app reads aloud, as JSON [{ key, text }], for tools/make_voice.py.
// Keys: <conceptId>:<variant>:q (the question), <conceptId>:<variant>:c<i> (choice i, original
// order), <conceptId>:why (the explanation), and line:<name> for the shared bits.
import { IQ_UNITS } from '../js/iq-content.js';
import { VOICE_LINES } from '../js/voice.js';

const out = [];
for (const [name, text] of Object.entries(VOICE_LINES)) out.push({ key: `line:${name}`, text });
for (const u of IQ_UNITS) {
  for (const c of u.concepts) {
    out.push({ key: `${c.id}:why`, text: c.why });
    c.variants.forEach((v, i) => {
      out.push({ key: `${c.id}:${i}:q`, text: v.prompt });
      if (typeof v.tf !== 'boolean') v.choices.forEach((ch, j) => out.push({ key: `${c.id}:${i}:c${j}`, text: ch }));
    });
  }
}
console.log(JSON.stringify(out));

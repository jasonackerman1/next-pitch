// Prints every card as JSON rows for tools/make_review_sheet.py (the coach review spreadsheet).
import { IQ_UNITS } from '../js/iq-content.js';

const ord = (n) => ({ 1: '1st', 2: '2nd', 3: '3rd' }[n]);
const YOU = { batter: 'batter', onDeck: 'on deck', runner1: 'runner on 1st', runner2: 'runner on 2nd', runner3: 'runner on 3rd' };
function sitText(s) {
  if (!s) return '';
  const parts = [];
  if (s.balls !== undefined) parts.push(`Count ${s.balls}-${s.strikes}`);
  if (s.outs !== undefined) parts.push(`${s.outs} out${s.outs === 1 ? '' : 's'}`);
  const r = s.runners || [];
  parts.push(r.length ? `Runner${r.length > 1 ? 's' : ''} on ${r.map(ord).join(' & ')}` : 'Bases empty');
  if (s.you) parts.push(`You: ${YOU[s.you] || s.you}`);
  return parts.join(' · ');
}

const rows = [];
for (const u of IQ_UNITS) {
  for (const c of u.concepts) {
    const tags = [c.source === 'ghvbl' ? 'GHVBL rule' : 'Fundamental', c.realPlay ? 'From a real game' : ''].filter(Boolean).join(', ');
    c.variants.forEach((v, i) => {
      let type = 'Multiple choice', right, wrong;
      if (typeof v.tf === 'boolean') { type = 'True / False'; right = v.tf ? 'True' : 'False'; wrong = [v.tf ? 'False' : 'True']; }
      else if (v.ask) { type = v.ask.tap ? 'Tap a player on the field' : 'Drag on the field'; right = v.targets[0].label; wrong = v.targets.slice(1).map((t) => t.label); }
      else { right = v.choices[0]; wrong = v.choices.slice(1); }
      rows.push({ id: `${c.id}:${i}`, unit: u.title, topic: c.title, tags, coachCheck: c.coachCheck || '', lesson: c.why, sit: sitText(v.sit), type, question: v.prompt, right, wrong: wrong.join('\n') });
    });
  }
}
console.log(JSON.stringify(rows));

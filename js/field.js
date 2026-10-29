// The animated field for situation cards.
//
// A card's `sit` is a still snapshot (count, outs, runners, where YOU are). The field draws it
// as a little ballpark with real players on it: Skip is YOU, red discs are your teammates,
// navy discs are the other team. When a card opens, the players jog into place. After he
// answers, the card's play (js/iq-plays.js) acts out the right call: runners run, fielders
// cover, the ball gets thrown, and Skip says what's happening.
//
// Coordinates are a 200 x 172 field: home (100,150), first (145,105), second (100,60),
// third (55,105). Actors are HTML elements over an SVG field, placed in percent, so the whole
// thing scales with the card.
//
// Play steps (each step is one action, or an array of actions that happen together):
//   { run: 'R1', to: 2 }            runner along the base path (1, 2, 3, 'home', or any spot)
//   { run: 'B', to: 1 }             the batter runs it out
//   { run: 'R1', to: 'back' }       back to the base he started on
//   { field: 'SS', to: 'b2' }       a fielder moves (to a base, spot or {x, y})
//   { ball: 'P', to: 'C' }          the ball goes from one place to another
//   { ball: 'B', to: 'deepLF', fly: true }   a fly ball (arcs up and comes down)
//   { ball: 'B', to: 'holeSS', roll: true }  a ground ball
//   { say: 'Tag up!', who: 'R3' }   a speech bubble
//   { out: 'R1' }  { safe: 'R1' }    the call
//   { wait: 400 }
// Actor ids: B (batter), OD (on deck), R1 R2 R3 (runners by starting base), P C 1B 2B SS 3B
// LF CF RF, or YOU (whoever the card says you are).

export const SPOTS = {
  home: [100, 150], b1: [145, 105], b2: [100, 60], b3: [55, 105], mound: [100, 105],
  P: [100, 103], C: [100, 162], '1B': [140, 92], '2B': [124, 72], SS: [76, 72], '3B': [60, 92],
  LF: [42, 46], CF: [100, 24], RF: [158, 46],
  B: [90, 148], OD: [148, 162],
  R1: [145, 105], R2: [100, 60], R3: [55, 105],
  lead1: [137, 97], lead2: [92, 66], lead3: [62, 113],
  half12: [122, 82], half23: [78, 82], half3H: [78, 128],
  deepLF: [28, 30], deepCF: [100, 8], deepRF: [172, 30], gapLC: [64, 22], gapRC: [136, 22],
  lineLF: [20, 60], lineRF: [180, 60], shallowLF: [55, 60], shallowCF: [100, 42], shallowRF: [145, 60],
  holeSS: [68, 84], hole12: [132, 84], upMiddle: [100, 80], cut: [100, 82],
  bunt3: [82, 132], bunt1: [118, 132], buntP: [100, 130], backstop: [100, 168],
  foul3: [40, 122], foul1: [160, 122], dugout3: [22, 152], dugout1: [178, 152],
};

const BASE_ORDER = { 0: 'home', 1: 'b1', 2: 'b2', 3: 'b3', 4: 'home' };
const DEFENSE = ['P', 'C', '1B', '2B', 'SS', '3B', 'LF', 'CF', 'RF'];
const OFFENSE_YOU = ['batter', 'onDeck', 'runner1', 'runner2', 'runner3'];
const YOU_TO_ID = { batter: 'B', onDeck: 'OD', runner1: 'R1', runner2: 'R2', runner3: 'R3' };

function youId(sit) {
  return YOU_TO_ID[sit.you] || sit.you || null;
}

function pct([x, y]) {
  return `left:${(x / 200) * 100}%;top:${(y / 172) * 100}%`;
}

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Who is on the field for this situation, and where they start. */
function castFor(sit) {
  const you = youId(sit);
  const offense = OFFENSE_YOU.includes(sit.you);
  const cast = [];
  for (const id of DEFENSE) cast.push({ id, side: offense ? 'them' : 'us', label: id });
  // Batter: in the box for offense cards, and for defense cards when someone's batting.
  cast.push({ id: 'B', side: offense ? 'us' : 'them', label: '' });
  if (sit.you === 'onDeck') cast.push({ id: 'OD', side: 'us', label: '' });
  const runners = new Set(sit.runners || []);
  // A card that says YOU are on a base always shows you there, even if `runners` forgot him.
  const youBase = /^runner(\d)$/.exec(sit.you || '');
  if (youBase) runners.add(Number(youBase[1]));
  for (const n of [...runners].sort()) cast.push({ id: `R${n}`, side: offense ? 'us' : 'them', label: '' });
  return cast.map((a) => ({ ...a, you: a.id === you }));
}

export function fieldHtml(sit, key) {
  const cast = castFor(sit);
  const runners = sit.runners || [];
  const base = (id, n) => {
    const [x, y] = SPOTS[id];
    return `<rect x="${x - 5}" y="${y - 5}" width="10" height="10" transform="rotate(45 ${x} ${y})" class="field-base ${runners.includes(n) ? 'field-base-on' : ''}"/>`;
  };
  const actors = cast.map((a) => {
    const cls = ['actor', `actor-${a.side}`, a.you ? 'actor-you' : '', a.id.startsWith('R') || a.id === 'B' || a.id === 'OD' ? 'actor-runner' : 'actor-fielder'].join(' ');
    const inner = a.you
      ? '<img src="img/skip/head-mini.webp" alt="" draggable="false"><span class="actor-you-tag">YOU</span>'
      : `<span class="actor-label">${a.label}</span>`;
    const [x, y] = SPOTS[a.id];
    return `<div class="${cls}" data-actor="${a.id}" data-x="${x}" data-y="${y}" style="${pct([x, y])}">${inner}</div>`;
  }).join('');
  return `
    <div class="field-card" data-field-key="${key}">
      <div class="field-stage">
        <svg class="field-svg" viewBox="0 0 200 172" aria-hidden="true">
          <defs>
            <pattern id="mow" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="10" height="20" class="field-mow"/>
            </pattern>
          </defs>
          <rect x="0" y="0" width="200" height="172" rx="16" class="field-foul"/>
          <path class="field-track" d="M100 150 L4 54 Q100 -40 196 54 Z"/>
          <path class="field-grass" d="M100 150 L10 60 Q100 -28 190 60 Z"/>
          <path d="M100 150 L10 60 Q100 -28 190 60 Z" fill="url(#mow)"/>
          <path class="field-dirt" d="M100 150 L37 87 Q100 18 163 87 Z"/>
          <path class="field-infield-grass" d="M100 137 L132 105 L100 73 L68 105 Z"/>
          <path class="field-chalk" d="M100 150 L10 60 M100 150 L190 60"/>
          <circle cx="100" cy="150" r="11" class="field-dirt"/>
          <circle cx="100" cy="105" r="6" class="field-dirt"/>
          <rect x="97" y="103.5" width="6" height="1.6" class="field-rubber"/>
          <path d="M95 147h10v4l-5 4l-5-4z" class="field-base"/>
          ${base('b1', 1)}${base('b2', 2)}${base('b3', 3)}
        </svg>
        ${actors}
        <div class="field-ball" data-ball hidden></div>
        <button class="field-replay" data-field-replay aria-label="Replay the play" hidden>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Replay
        </button>
      </div>
    </div>
  `;
}

// ---------- the animation driver ----------

let live = null; // { key, node, sit, play, started, played, runId }

function actorEl(node, id, sit) {
  const real = id === 'YOU' ? youId(sit) : id;
  return node.querySelector(`[data-actor="${real}"]`);
}

function posOf(node, ref, sit) {
  if (Array.isArray(ref)) return ref;
  if (ref && typeof ref === 'object') return [ref.x, ref.y];
  if (typeof ref === 'number') return SPOTS[BASE_ORDER[ref]];
  if (ref === 'home') return SPOTS.home;
  if (SPOTS[ref] && !/^(P|C|1B|2B|SS|3B|LF|CF|RF|B|OD|R[123])$/.test(ref)) return SPOTS[ref];
  const el = actorEl(node, ref, sit);
  if (el) return [Number(el.dataset.x), Number(el.dataset.y)];
  if (SPOTS[ref]) return SPOTS[ref];
  console.warn('field: unknown spot', ref);
  return SPOTS.home;
}

function place(el, xy) {
  el.dataset.x = xy[0];
  el.dataset.y = xy[1];
  el.style.left = `${(xy[0] / 200) * 100}%`;
  el.style.top = `${(xy[1] / 172) * 100}%`;
}

function frames(points) {
  return points.map(([x, y]) => ({ left: `${(x / 200) * 100}%`, top: `${(y / 172) * 100}%` }));
}

async function glide(el, points, ms, fast) {
  const end = points[points.length - 1];
  if (fast || points.length < 2) { place(el, end); return; }
  const anim = el.animate(frames(points), { duration: ms, easing: 'ease-in-out' });
  place(el, end);
  try { await anim.finished; } catch { /* cancelled */ }
}

/** The last base a runner touched (0 = home/the batter's box). Partway spots don't change it. */
function startBase(id) {
  return /^R[123]$/.test(id) ? Number(id[1]) : 0;
}
function baseIndexOf(el) {
  return el.dataset.base !== undefined ? Number(el.dataset.base) : startBase(el.dataset.actor);
}

function runPath(node, el, to, sit) {
  const from = [Number(el.dataset.x), Number(el.dataset.y)];
  if (to === 'back') {
    el.dataset.base = startBase(el.dataset.actor);
    return [from, SPOTS[el.dataset.actor] || from];
  }
  const target = to === 'home' ? 4 : to;
  if (typeof target === 'number') {
    const i = baseIndexOf(el);
    el.dataset.base = target;
    // Going back (or staying): straight there. Going forward: through every base on the way.
    if (target <= i) return [from, SPOTS[BASE_ORDER[target]]];
    const pts = [from];
    for (let b = i + 1; b <= target; b += 1) pts.push(SPOTS[BASE_ORDER[b]]);
    return pts;
  }
  return [from, posOf(node, to, sit)];
}

function bubble(node, el, text, ms, fast) {
  const stage = node.querySelector('.field-stage');
  stage.querySelectorAll('.field-say').forEach((b) => b.remove());
  const b = document.createElement('div');
  b.className = 'field-say';
  b.textContent = text;
  const [x, y] = el ? [Number(el.dataset.x), Number(el.dataset.y)] : [100, 86];
  b.style.left = `${Math.min(80, Math.max(20, (x / 200) * 100))}%`;
  b.style.top = `${(y / 172) * 100}%`;
  if (y < 40) b.classList.add('field-say-below');
  stage.appendChild(b);
  // Bubbles fade once the play has moved on; the last one stays as the takeaway.
  setTimeout(() => { if (!b.dataset.keep) b.classList.add('field-say-gone'); }, Math.max(ms, 1500) + 1100);
  if (fast) return Promise.resolve();
  return new Promise((r) => setTimeout(r, ms));
}

function mark(node, el, kind) {
  el.classList.remove('actor-out', 'actor-safe');
  el.classList.add(kind === 'out' ? 'actor-out' : 'actor-safe');
}

async function doAction(node, a, sit, fast) {
  if (a.wait) { if (!fast) await new Promise((r) => setTimeout(r, a.wait)); return; }
  if (a.run || a.field) {
    const el = actorEl(node, a.run || a.field, sit);
    if (!el) return;
    const pts = a.run ? runPath(node, el, a.to, sit) : [[Number(el.dataset.x), Number(el.dataset.y)], posOf(node, a.to, sit)];
    el.classList.add('actor-moving');
    await glide(el, pts, (a.ms || 650) * Math.max(1, pts.length - 1), fast);
    el.classList.remove('actor-moving');
    return;
  }
  if (a.ball !== undefined) {
    const ball = node.querySelector('[data-ball]');
    const from = posOf(node, a.ball, sit);
    const tos = (Array.isArray(a.to) && typeof a.to[0] !== 'number' ? a.to : [a.to]).map((t) => posOf(node, t, sit));
    ball.hidden = false;
    ball.classList.toggle('field-ball-fly', !!a.fly);
    let at = from;
    for (const to of tos) {
      const dist = Math.hypot(to[0] - at[0], to[1] - at[1]);
      const ms = a.ms || Math.max(300, dist * (a.fly ? 9 : a.roll ? 11 : 5));
      if (fast) { place(ball, to); at = to; continue; }
      place(ball, at);
      const mid = [(at[0] + to[0]) / 2, (at[1] + to[1]) / 2];
      const kf = frames([at, mid, to]);
      if (a.fly) { kf[0].transform = 'translate(-50%,-50%) scale(1)'; kf[1].transform = 'translate(-50%,-50%) scale(2.2)'; kf[2].transform = 'translate(-50%,-50%) scale(1)'; }
      const anim = ball.animate(kf, { duration: ms, easing: a.fly ? 'linear' : 'ease-out' });
      place(ball, to);
      try { await anim.finished; } catch { /* cancelled */ }
      at = to;
    }
    return;
  }
  if (a.say) return bubble(node, a.who ? actorEl(node, a.who, sit) : null, a.say, a.ms || 1500, fast);
  if (a.out) { const el = actorEl(node, a.out, sit); if (el) mark(node, el, 'out'); return; }
  if (a.safe) { const el = actorEl(node, a.safe, sit); if (el) mark(node, el, 'safe'); }
}

function resetActors(node, sit) {
  node.querySelectorAll('[data-actor]').forEach((el) => {
    el.getAnimations().forEach((an) => an.cancel());
    el.classList.remove('actor-out', 'actor-safe', 'actor-moving');
    delete el.dataset.base;
    place(el, SPOTS[el.dataset.actor]);
  });
  const ball = node.querySelector('[data-ball]');
  ball.getAnimations().forEach((an) => an.cancel());
  ball.hidden = true;
  node.querySelectorAll('.field-say').forEach((b) => b.remove());
}

async function runPlay(node, sit, play, fast) {
  const runId = (live.runId = (live.runId || 0) + 1);
  resetActors(node, sit);
  const replay = node.querySelector('[data-field-replay]');
  replay.hidden = true;
  for (const step of play) {
    if (live?.runId !== runId || live.node !== node) return;
    const actions = Array.isArray(step) ? step : [step];
    await Promise.all(actions.map((a) => doAction(node, a, sit, fast)));
    if (!fast) await new Promise((r) => setTimeout(r, 120));
  }
  if (live?.runId === runId) {
    const bubbles = node.querySelectorAll('.field-say');
    const last = bubbles[bubbles.length - 1];
    if (last) { last.dataset.keep = '1'; last.classList.remove('field-say-gone'); }
    replay.hidden = false;
  }
}

function intro(node, sit) {
  if (reducedMotion()) return;
  const you = youId(sit);
  let i = 0;
  node.querySelectorAll('[data-actor]').forEach((el) => {
    const id = el.dataset.actor;
    const [x, y] = SPOTS[id];
    let fromXY;
    if (/^R[123]$/.test(id)) fromXY = SPOTS[BASE_ORDER[Number(id[1]) - 1]];
    else if (DEFENSE.includes(id)) fromXY = [x + (x < 100 ? -6 : 6), y + 14];
    else fromXY = [x, y + 10];
    const delay = id === you ? 650 : 60 * i++;
    el.animate([
      { ...frames([fromXY])[0], opacity: 0, transform: 'translate(-50%,-50%) scale(0.4)' },
      { ...frames([[x, y]])[0], opacity: 1, transform: 'translate(-50%,-50%) scale(1)' },
    ], { duration: id === you ? 520 : 420, delay, easing: 'cubic-bezier(.2,1.4,.4,1)', fill: 'backwards' });
  });
}

/**
 * Call after every render. Keeps the same field node alive across re-renders of the same
 * card (so tapping an answer doesn't restart anything), plays the intro when a card first
 * shows, and acts out the play once it's answered.
 */
export function syncField(root, { sit, play, answered }) {
  const slot = root.querySelector('.field-card[data-field-key]');
  if (!slot) { live = null; return; }
  const key = slot.dataset.fieldKey;
  if (live && live.key === key) {
    slot.replaceWith(live.node);
  } else {
    live = { key, node: slot, sit, play, started: false, played: false, runId: 0 };
    live.node.querySelector('[data-field-replay]').addEventListener('click', (e) => {
      e.stopPropagation();
      if (live?.node === slot && live.play) runPlay(slot, live.sit, live.play, false);
    });
    intro(slot, sit);
  }
  live.play = play;
  if (answered && play && !live.played) {
    live.played = true;
    runPlay(live.node, sit, play, reducedMotion());
  }
}

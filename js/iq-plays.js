// Plays for the animated field (js/field.js). After a card is answered, its play acts out
// the RIGHT call on the field, so the answer gets shown, not just told.
//
// Keyed by `conceptId:variantIndex` (variant index = position in the concept's `variants`
// list in iq-content.js). Only cards with a `sit` get a play. See js/field.js for the step
// vocabulary. tools/check_plays.mjs checks every situation card has a valid play.
//
// Coach check: every play is written to match its card's right answer, but a few take small
// liberties to make the idea visible (an invented result, a centered bubble for an umpire or
// base coach). Fix any play by editing it here.

// Custom spots used below (x, y on the 200 x 172 field).
const OD_SPOT = { x: 114, y: 168 }; // behind home plate, off the catcher's shoulder
const PAST1 = { x: 157, y: 93 };   // just past first, along the line (ran through)
const FOUL1 = { x: 164, y: 102 };  // turned into foul territory past first
const BANANA = { x: 132, y: 134 }; // curve out before first
const TURN1 = { x: 132, y: 92 };   // aggressive turn toward second

export const PLAYS = {
  // u1-live-ball: Stepping out doesn't stop the play
  'u1-live-ball:0': [
    [{ run: 'B', to: { x: 82, y: 146 } }, { run: 'R3', to: 'lead3' }],
    { say: 'No time called. Still live!', who: 'B' },
    [{ field: '3B', to: 'b3' }, { ball: 'P', to: 'b3' }, { run: 'R3', to: 'back' }],
    { safe: 'R3' },
  ],
  'u1-live-ball:1': [
    { say: 'Time, please!', who: 'B' },
    { say: 'Ump: Time!' },
    { run: 'B', to: { x: 84, y: 150 } },
    { run: 'B', to: 'back' },
  ],
  'u1-live-ball:2': [
    [{ say: 'Stealing home!', who: 'R3' }],
    [{ run: 'R3', to: 'home', ms: 900 }, { run: 'B', to: 'dugout3', ms: 900 }, { ball: 'P', to: 'C' }],
    [{ safe: 'R3' }, { say: 'Stay out of his path!', who: 'B' }],
  ],

  // u1-traffic-cop: On deck, you're the traffic cop
  'u1-traffic-cop:0': [
    { ball: 'P', to: 'B' },
    [{ ball: 'B', to: 'shallowLF', roll: true }, { field: 'LF', to: 'shallowLF' }, { run: 'B', to: 1 }, { run: 'R2', to: 3 }, { run: 'OD', to: OD_SPOT }],
    [{ run: 'R2', to: 'home', ms: 900 }, { ball: 'LF', to: 'home' }, { say: 'Hands down! Slide!', who: 'OD' }],
  ],
  'u1-traffic-cop:1': [
    { ball: 'P', to: 'B' },
    [{ ball: 'B', to: 'holeSS', roll: true }, { field: 'SS', to: 'holeSS' }, { run: 'R3', to: 'half3H' }, { run: 'OD', to: OD_SPOT }],
    [{ ball: 'SS', to: 'home' }, { run: 'R3', to: 'home', ms: 800 }, { say: 'Close throw: hands down!', who: 'OD' }],
  ],
  'u1-traffic-cop:2': [
    { ball: 'P', to: ['home', 'backstop'] },
    [{ field: 'C', to: 'backstop' }, { run: 'R3', to: 'half3H' }, { run: 'OD', to: OD_SPOT }],
    [{ say: 'No throw! Hands up, stand up!', who: 'OD' }, { run: 'R3', to: 'home' }],
    { safe: 'R3' },
  ],

  // u1-situation: Know the situation
  'u1-situation:1': [
    { ball: 'P', to: 'B' },
    [{ ball: 'B', to: 'shallowRF', roll: true }, { field: 'YOU', to: 'shallowRF' }, { run: 'R2', to: 3 }, { run: 'B', to: 1 }],
    [{ say: 'Two outs: he ran on contact!', who: 'YOU' }, { field: 'C', to: 'home' }, { run: 'R2', to: 'half3H' }],
    [{ ball: 'YOU', to: 'home' }, { run: 'R2', to: 'home' }],
  ],

  // u1-signs: Get the sign every pitch
  'u1-signs:0': [
    { say: 'Missed the sign? Time, please!', who: 'B' },
    { run: 'B', to: { x: 82, y: 146 } },
    { say: 'Look again. Never guess!', who: 'B' },
    { run: 'B', to: 'back' },
  ],

  // u1-hustle: Hustle is free
  'u1-hustle:0': [
    { say: 'Third out! Run in hard!', who: 'YOU' },
    [{ field: 'YOU', to: 'dugout3', ms: 1100 }, { field: 'CF', to: 'dugout3', ms: 1300 }, { field: 'SS', to: 'dugout3', ms: 900 }, { field: '3B', to: 'dugout3', ms: 800 }],
  ],

  // u2-twostrike-bunt: Two strikes changes the bunt
  'u2-twostrike-bunt:0': [
    { ball: 'P', to: 'B' },
    { ball: 'B', to: 'foul3', roll: true },
    { say: 'Foul bunt with 2 strikes = strike 3!', who: 'B' },
    { out: 'B' },
  ],
  'u2-twostrike-bunt:1': [
    { ball: 'P', to: 'C' },
    { say: 'Up at your eyes? Pull it back!', who: 'B' },
    [{ ball: 'C', to: 'P' }, { say: 'Ball two. Still alive!' }],
  ],
  'u2-twostrike-bunt:2': [
    { ball: 'P', to: 'C' },
    { say: 'Missed bunt, 2 strikes: strike 3!', who: 'B' },
    { out: 'B' },
  ],

  // u2-high-bunt: Only bunt strikes
  'u2-high-bunt:1': [
    [{ ball: 'P', to: 'C' }, { run: 'R1', to: 'lead1' }],
    { say: 'Above the bat? Pull back!', who: 'B' },
    [{ ball: 'C', to: 'P' }, { run: 'R1', to: 'back' }],
  ],

  // u2-twostrike-approach: Two-strike approach
  'u2-twostrike-approach:0': [
    { ball: 'P', to: 'B' },
    [{ ball: 'B', to: 'foul1', fly: true }, { say: 'Too close to take. Protect!', who: 'B' }],
    { say: 'Fouled it off. Still alive!' },
  ],
  'u2-twostrike-approach:1': [
    { say: 'Two strikes: choke up!', who: 'B' },
    { ball: 'P', to: 'B' },
    [{ ball: 'B', to: 'shallowCF', roll: true }, { field: 'CF', to: 'shallowCF' }, { run: 'B', to: 1 }, { say: 'Just make contact!' }],
  ],

  // u2-hitters-count: Ahead in the count
  'u2-hitters-count:0': [
    { say: '2-0: look for YOUR pitch', who: 'B' },
    { ball: 'P', to: 'B' },
    [{ ball: 'B', to: 'gapLC', fly: true }, { field: 'LF', to: 'gapLC' }, { field: 'CF', to: 'gapLC' }, { run: 'B', to: 2 }],
    { say: 'Got your pitch? Swing hard!' },
  ],
  'u2-hitters-count:1': [
    { ball: 'P', to: 'C' },
    { say: 'Not my pitch. Take it!', who: 'B' },
    [{ say: 'Ball four!' }, { run: 'B', to: 1 }],
  ],

  // u2-three-oh: 3-0 means take
  'u2-three-oh:0': [
    { ball: 'P', to: 'C' },
    { say: '3-0, no green light: take!', who: 'B' },
    { say: 'Strike one. Now it\'s 3-1.' },
  ],
  'u2-three-oh:1': [
    { say: 'Green light: I MAY swing', who: 'B' },
    { ball: 'P', to: 'B' },
    [{ ball: 'B', to: 'shallowRF', roll: true }, { field: 'RF', to: 'shallowRF' }, { run: 'B', to: 1 }, { run: 'R2', to: 'home' }],
    { say: 'A pitch you can drive? Drive it!' },
  ],

  // u2-dropped-k: Dropped third strike
  'u2-dropped-k:0': [
    { ball: 'P', to: ['home', 'backstop'] },
    [{ field: 'C', to: 'backstop' }, { say: 'Dropped strike 3: run!', who: 'B' }],
    [{ run: 'B', to: 1, ms: 550 }, { field: '1B', to: 'b1' }],
  ],
  'u2-dropped-k:1': [
    { ball: 'P', to: ['home', 'backstop'] },
    [{ field: 'C', to: 'backstop' }, { say: 'First is taken, 1 out: you\'re out', who: 'B' }],
    { out: 'B' },
  ],
  'u2-dropped-k:2': [
    { ball: 'P', to: ['home', 'backstop'] },
    [{ field: 'C', to: 'backstop' }, { say: 'Two outs: run!', who: 'B' }],
    [{ run: 'B', to: 1, ms: 550 }, { run: 'R1', to: 2 }],
  ],

  // u2-dropped-k-third: Dropped third strike, runner on third
  'u2-dropped-k-third:0': [
    { ball: 'P', to: ['home', 'backstop'] },
    [{ field: 'C', to: 'backstop' }, { run: 'B', to: 1 }, { run: 'R3', to: 'half3H' }, { say: 'Run hard!', who: 'B' }],
    [{ say: 'Catcher has to watch the runner!' }, { run: 'R3', to: 'back' }],
    { safe: 'B' },
  ],
  'u2-dropped-k-third:1': [
    { ball: 'P', to: ['home', 'backstop'] },
    [{ field: 'C', to: 'backstop' }, { run: 'B', to: 1 }, { run: 'YOU', to: 'half3H' }],
    { say: 'He has to watch me first!', who: 'YOU' },
    [{ run: 'YOU', to: 'back' }, { safe: 'B' }],
  ],

  // u2-walk-live: Ball four is a live ball
  'u2-walk-live:0': [
    { ball: 'P', to: 'C' },
    { say: 'Ball four. Run hard!', who: 'B' },
    [{ run: 'B', to: 1, ms: 500 }, { ball: 'C', to: 'P' }],
    [{ run: 'B', to: 'lead1' }, { say: 'Round it and look!' }],
  ],
  'u2-walk-live:2': [
    { ball: 'P', to: 'C' },
    [{ run: 'B', to: 1, ms: 500 }, { ball: 'C', to: 'P', ms: 1300 }],
    [{ run: 'B', to: 'lead1' }, { say: 'Nobody watching? Be ready!', who: 'B' }],
    { say: 'Coach sends you: GO!' },
    { run: 'B', to: 2 },
    { safe: 'B' },
  ],

  // u2-sac-bunt: The sacrifice bunt
  'u2-sac-bunt:0': [
    { ball: 'P', to: 'B' },
    [{ ball: 'B', to: 'bunt1', roll: true }, { field: '1B', to: 'bunt1' }, { field: '2B', to: 'b1' }, { run: 'R1', to: 2 }, { run: 'B', to: { x: 124, y: 126 } }],
    [{ ball: '1B', to: 'b1' }, { run: 'B', to: 1 }],
    [{ out: 'B' }, { safe: 'R1' }, { say: 'Job done: runner on 2nd!', who: 'R1' }],
  ],

  // u2-slash-bunt: No slash bunts
  'u2-slash-bunt:0': [
    { ball: 'P', to: 'B' },
    [{ ball: 'B', to: 'hole12', roll: true }, { run: 'B', to: { x: 120, y: 128 } }, { run: 'R1', to: 'half12' }],
    { say: 'Slash bunt: batter is out!' },
    [{ out: 'B' }, { run: 'R1', to: 'back' }],
  ],
  'u2-slash-bunt:2': [
    { ball: 'P', to: 'C' },
    { say: 'Way outside. Pull back!', who: 'B' },
    [{ ball: 'C', to: 'P' }, { say: 'Ball three.' }],
  ],

  // u2-hit-and-run: The hit-and-run
  'u2-hit-and-run:0': [
    [{ run: 'R1', to: 'half12' }, { field: '2B', to: 'b2' }, { ball: 'P', to: 'B' }],
    [{ say: 'Low and away? Swing anyway!', who: 'B' }, { ball: 'B', to: 'shallowRF', roll: true }, { run: 'R1', to: 2 }],
    [{ field: 'RF', to: 'shallowRF' }, { run: 'R1', to: 3 }, { run: 'B', to: 1 }],
  ],
  'u2-hit-and-run:1': [
    [{ run: 'R1', to: 'half12' }, { field: 'SS', to: 'b2' }, { ball: 'P', to: 'B' }],
    [{ ball: 'B', to: 'shallowLF', roll: true }, { run: 'R1', to: 2 }, { say: 'On the ground, through the hole!' }],
    [{ field: 'LF', to: 'shallowLF' }, { run: 'R1', to: 3 }, { run: 'B', to: 1 }],
  ],
  'u2-hit-and-run:2': [
    { say: 'Wait till he throws home...', who: 'YOU' },
    [{ ball: 'P', to: 'B', ms: 700 }, { run: 'YOU', to: 'half12' }],
    [{ ball: 'B', to: 'shallowLF', roll: true }, { say: 'Peek in! Where is it?', who: 'YOU' }],
    [{ field: 'LF', to: 'shallowLF' }, { run: 'YOU', to: 2 }, { run: 'B', to: 1 }],
  ],

  // u9-two-on-a-base: Two runners, one base
  'u9-two-on-a-base:0': [
    [{ ball: 'P', to: 'C' }, { run: 'R3', to: 'half3H' }],
    [{ field: '3B', to: 'b3' }, { ball: 'C', to: 'b3' }, { run: 'R3', to: 'back' }, { run: 'YOU', to: 3 }],
    { say: 'Nobody forced him. It\'s HIS base!', who: 'YOU' },
    [{ out: 'YOU' }, { safe: 'R3' }],
  ],
  'u9-two-on-a-base:1': [
    { ball: 'P', to: 'B' },
    [{ ball: 'B', to: 'holeSS', roll: true }, { field: 'SS', to: 'holeSS' }, { run: 'YOU', to: 'half23' }, { run: 'R1', to: 2 }, { run: 'B', to: 1 }],
    [{ run: 'YOU', to: 'back' }, { field: '2B', to: 'b2' }, { ball: 'SS', to: 'b2' }],
    { say: 'You were forced. 2nd is HIS now!', who: 'YOU' },
    [{ out: 'YOU' }, { safe: 'R1' }],
  ],

  // u9-weird-awards: Weird-but-real base awards
  'u9-weird-awards:0': [
    { ball: 'P', to: 'B' },
    [{ ball: 'B', to: 'gapLC', fly: true }, { field: 'LF', to: 'gapLC' }, { run: 'B', to: 1 }],
    { say: 'He threw his glove at it!', who: 'LF' },
    [{ say: 'Thrown glove: 3 bases!' }, { run: 'B', to: 3 }],
    { safe: 'B' },
  ],
  'u9-weird-awards:1': [
    { ball: 'P', to: { x: 100, y: 167 } },
    { say: 'Stuck in the ump\'s mask!' },
    [{ say: 'One base for you!', who: 'YOU' }, { run: 'YOU', to: 3 }],
    { safe: 'YOU' },
  ],
  'u9-weird-awards:2': [
    { ball: 'P', to: 'B' },
    [{ ball: 'B', to: 'deepRF', fly: true }, { field: 'RF', to: 'deepRF' }, { run: 'B', to: 1 }],
    { say: 'Stuck in the fence!', who: 'RF' },
    [{ say: 'Usually two bases!' }, { run: 'B', to: 2 }],
    { safe: 'B' },
  ],

  // u9-reach-first: Ways to reach first
  'u9-reach-first:0': [
    [{ field: 'C', to: { x: 97, y: 154 } }, { ball: 'P', to: 'C' }],
    { say: 'Bat hit the glove: interference!' },
    { run: 'B', to: 1 },
    { safe: 'B' },
  ],
  'u9-reach-first:2': [
    { ball: 'P', to: 'B' },
    [{ ball: 'B', to: 'holeSS', roll: true }, { field: 'SS', to: 'holeSS' }, { run: 'R2', to: 'half23' }, { run: 'B', to: { x: 122, y: 128 } }],
    [{ field: '3B', to: 'b3' }, { ball: 'SS', to: 'b3' }, { run: 'R2', to: 3 }, { run: 'B', to: 1 }],
    [{ out: 'R2' }, { safe: 'B' }, { say: 'Fielder\'s choice!' }],
  ],

  // u9-appeal: Missed a base? Appeal it
  'u9-appeal:0': [
    { ball: 'P', to: 'B' },
    [{ ball: 'B', to: 'shallowLF', fly: true }, { field: 'LF', to: 'shallowLF' }, { run: 'R3', to: 'half3H', ms: 500 }],
    [{ run: 'R3', to: 'home' }, { ball: 'LF', to: 'YOU' }],
    [{ field: 'YOU', to: 'b3' }, { say: 'He left early! Appeal!', who: 'YOU' }],
    { out: 'R3' },
  ],
  'u9-appeal:1': [
    { ball: 'P', to: 'B' },
    [{ ball: 'B', to: 'gapRC', fly: true }, { field: 'RF', to: 'gapRC' }, { field: '2B', to: 'b2' }, { run: 'B', to: { x: 139, y: 112 } }],
    [{ run: 'B', to: 2 }, { ball: 'RF', to: 'b2' }],
    [{ field: 'YOU', to: 'b1' }, { ball: '2B', to: 'b1' }],
    { say: 'Missed first! Appeal!', who: 'YOU' },
    { out: 'B' },
  ],

  // u3-know-before: decide your throw before the pitch
  'u3-know-before:0': [
    [{ say: 'One out, runner on second...', who: 'YOU' }],
    [{ say: 'Base hit to me? I throw home!', who: 'YOU' }],
    [{ ball: 'P', to: 'C' }],
  ],
  'u3-know-before:1': [
    [{ say: 'No outs. Runners on 1st and 3rd.', who: 'YOU' }],
    [{ say: 'Single? Throw to third!', who: 'YOU' }],
    [{ say: 'Fly ball? Throw home!', who: 'YOU' }],
    [{ ball: 'P', to: 'C' }],
  ],

  // u3-cutoff: hit the cutoff man
  'u3-cutoff:0': [
    [{ ball: 'B', to: 'shallowRF', roll: true }, { field: 'YOU', to: 'shallowRF' }, { run: 'R2', to: 3 }, { run: 'B', to: 1 }, { field: '1B', to: { x: 122, y: 112 } }],
    [{ say: 'Low and hard to the cutoff!', who: 'YOU' }, { run: 'R2', to: 'half3H' }],
    [{ ball: 'YOU', to: ['1B', 'home'] }, { run: 'R2', to: 'home' }],
  ],
  'u3-cutoff:1': [
    [{ ball: 'B', to: 'shallowLF', roll: true }, { field: 'YOU', to: 'shallowLF' }, { run: 'R1', to: 2 }, { run: 'B', to: 1 }, { field: 'SS', to: { x: 56, y: 84 } }],
    [{ ball: 'YOU', to: 'foul3', fly: true }, { run: 'R1', to: 3 }, { say: 'Too high! Over my head!', who: 'SS' }],
    [{ run: 'B', to: 2 }, { say: 'Batter takes second!', who: 'B' }],
  ],

  // u3-throw-ahead: throw ahead of the lead runner
  'u3-throw-ahead:0': [
    [{ ball: 'B', to: 'shallowRF', roll: true }, { field: 'YOU', to: 'shallowRF' }, { run: 'R1', to: 2 }, { run: 'B', to: 1 }, { field: 'SS', to: 'cut' }, { field: '3B', to: 'b3' }],
    [{ say: 'Throw ahead of him, to third!', who: 'YOU' }, { run: 'R1', to: 'half23' }],
    [{ ball: 'YOU', to: ['SS', '3B'] }, { run: 'R1', to: 3 }],
  ],
  'u3-throw-ahead:1': [
    [{ ball: 'B', to: 'shallowCF', fly: true }, { field: 'YOU', to: 'shallowCF' }, { run: 'R1', to: 2 }, { run: 'B', to: 1 }, { field: 'SS', to: 'b2' }],
    [{ ball: 'YOU', to: 'SS' }, { say: 'Right to second!', who: 'YOU' }],
    [{ say: 'Batter stays at first.' }],
  ],
  'u3-throw-ahead:2': [
    [{ ball: 'B', to: 'shallowLF', roll: true }, { field: 'YOU', to: 'shallowLF' }, { run: 'R1', to: 2 }, { run: 'B', to: 1 }],
    [{ run: 'R1', to: 'half23' }, { field: '3B', to: 'b3' }, { say: 'Never throw behind him!', who: 'YOU' }],
    [{ ball: 'YOU', to: '3B' }, { run: 'R1', to: 'b2' }],
  ],

  // u3-nobody-on: nobody on, single goes to second
  'u3-nobody-on:0': [
    [{ ball: 'B', to: 'shallowLF', roll: true }, { field: 'YOU', to: 'shallowLF' }, { run: 'B', to: 1 }, { field: 'SS', to: 'b2' }],
    [{ ball: 'YOU', to: 'SS' }, { say: 'Into second base!', who: 'YOU' }],
    [{ say: 'Batter stays at first.' }],
  ],
  'u3-nobody-on:1': [
    [{ ball: 'B', to: 'shallowRF', roll: true }, { field: 'YOU', to: 'shallowRF' }, { run: 'B', to: 1 }, { field: '2B', to: 'b2' }],
    [{ run: 'B', to: 'half12' }, { ball: 'YOU', to: '2B' }, { say: 'Hard to second!', who: 'YOU' }],
    [{ run: 'B', to: 'b1' }, { say: "He can't take it!", who: '2B' }],
  ],
  'u3-nobody-on:2': [
    [{ ball: 'B', to: 'shallowCF', roll: true }, { field: 'YOU', to: 'shallowCF' }, { run: 'B', to: 1 }, { field: 'SS', to: 'b2' }],
    [{ ball: 'YOU', to: 'SS' }, { say: 'Into second, every time!', who: 'YOU' }],
  ],

  // u3-tag-throw: runner tagging on a fly ball
  'u3-tag-throw:0': [
    [{ ball: 'B', to: 'shallowRF', fly: true }, { field: 'YOU', to: 'shallowRF' }, { field: 'SS', to: 'cut' }, { field: '3B', to: 'b3' }],
    [{ out: 'B' }, { say: "He's tagging!", who: 'R2' }],
    [{ run: 'R2', to: 3 }, { ball: 'YOU', to: ['SS', '3B'] }, { say: 'To third, through the cutoff!', who: 'YOU' }],
  ],
  'u3-tag-throw:1': [
    [{ ball: 'B', to: 'shallowLF', fly: true }, { field: 'YOU', to: 'shallowLF' }, { field: 'C', to: 'home' }],
    [{ out: 'B' }, { say: 'Catch it moving in!', who: 'YOU' }],
    [{ run: 'R3', to: 'home' }, { ball: 'YOU', to: 'C' }, { say: 'Throw home!', who: 'YOU' }],
  ],
  'u3-tag-throw:2': [
    [{ ball: 'B', to: 'shallowCF', fly: true }, { field: 'YOU', to: 'shallowCF' }, { run: 'R2', to: 3 }, { run: 'R3', to: 'home' }],
    [{ out: 'B' }, { say: "Third out! Inning's over.", who: 'YOU' }],
    [{ field: 'YOU', to: 'upMiddle', ms: 1200 }],
  ],

  // u3-backup: back up every play
  'u3-backup:0': [
    [{ ball: 'B', to: 'holeSS', roll: true }, { field: 'SS', to: 'holeSS' }, { run: 'B', to: 1 }, { field: 'YOU', to: { x: 162, y: 112 } }, { field: '1B', to: 'b1' }],
    [{ ball: 'SS', to: '1B' }, { say: 'Back him up!', who: 'YOU' }],
    [{ out: 'B' }],
  ],
  'u3-backup:1': [
    [{ ball: 'P', to: 'C' }, { run: 'R1', to: 2 }, { field: 'SS', to: 'b2' }, { field: 'YOU', to: { x: 100, y: 44 } }],
    [{ ball: 'C', to: 'SS' }, { say: 'Back up second!', who: 'YOU' }],
  ],
  'u3-backup:2': [
    [{ ball: 'B', to: 'shallowRF', roll: true }, { field: 'RF', to: 'shallowRF' }, { run: 'R1', to: 2 }, { run: 'B', to: 1 }, { field: 'SS', to: 'cut' }, { field: '3B', to: 'b3' }],
    [{ field: 'YOU', to: { x: 40, y: 114 } }, { run: 'R1', to: 3 }, { say: 'Back up third!', who: 'YOU' }],
    [{ ball: 'RF', to: ['SS', '3B'] }],
  ],

  // u3-priority: call it loud, who has priority
  'u3-priority:0': [
    [{ ball: 'B', to: 'gapRC', fly: true, ms: 1600 }, { field: 'CF', to: 'gapRC', ms: 1500 }, { field: 'YOU', to: { x: 150, y: 30 }, ms: 1200 }, { say: 'I got it! I got it!', who: 'CF' }],
    [{ out: 'B' }, { say: 'Center has priority!', who: 'YOU' }],
  ],
  'u3-priority:1': [
    [{ ball: 'B', to: 'shallowLF', fly: true, ms: 1500 }, { field: 'YOU', to: 'shallowLF', ms: 1300 }, { field: 'SS', to: { x: 64, y: 70 }, ms: 1200 }, { say: 'I got it! I got it!', who: 'YOU' }],
    [{ out: 'B' }, { say: 'Coming in is easier!', who: 'YOU' }],
  ],

  // u3-over-head: drop-step, turn, and run
  'u3-over-head:0': [
    [{ say: 'Drop-step, turn, and run!', who: 'YOU' }],
    [{ ball: 'B', to: 'deepCF', fly: true, ms: 1500 }, { field: 'YOU', to: 'deepCF', ms: 1300 }, { run: 'B', to: 1 }],
  ],
  'u3-over-head:2': [
    [{ say: 'Right foot back, turn to the line!', who: 'YOU' }],
    [{ ball: 'B', to: 'deepRF', fly: true, ms: 1500 }, { field: 'YOU', to: 'deepRF', ms: 1300 }],
  ],

  // u3-ground-ball: block it or charge it
  'u3-ground-ball:0': [
    [{ ball: 'B', to: 'shallowLF', roll: true }, { field: 'YOU', to: 'shallowLF' }, { run: 'B', to: 1 }, { field: 'SS', to: 'b2' }],
    [{ say: 'Drop a knee and block it!', who: 'YOU' }],
    [{ ball: 'YOU', to: 'SS' }],
  ],
  'u3-ground-ball:1': [
    [{ ball: 'B', to: { x: 140, y: 66 }, roll: true }, { field: 'YOU', to: { x: 140, y: 66 } }, { run: 'R2', to: 3 }, { run: 'B', to: 1 }, { field: '1B', to: { x: 122, y: 112 } }],
    [{ say: 'Charge it! Come up throwing!', who: 'YOU' }, { run: 'R2', to: 'half3H' }],
    [{ ball: 'YOU', to: ['1B', 'home'] }, { run: 'R2', to: 'home' }],
  ],
  'u3-ground-ball:2': [
    [{ ball: 'B', to: 'shallowCF', roll: true }, { field: 'YOU', to: 'shallowCF' }, { run: 'B', to: 1 }, { field: 'SS', to: 'b2' }],
    [{ say: 'Block it, keep it in front!', who: 'YOU' }],
    [{ ball: 'YOU', to: 'SS' }, { say: 'Batter stays at first.' }],
  ],

  // u3-batter-side: read the hitter
  'u3-batter-side:0': [
    [{ run: 'B', to: { x: 110, y: 148 } }, { say: 'Lefty up. Ball comes my way!', who: 'YOU' }],
    [{ ball: 'P', to: 'C' }],
    [{ ball: 'B', to: 'shallowRF', fly: true }, { field: 'YOU', to: 'shallowRF' }],
    [{ out: 'B' }],
  ],
  'u3-batter-side:1': [
    [{ say: 'Righty up. Ball comes my way!', who: 'YOU' }],
    [{ ball: 'P', to: 'C' }],
    [{ ball: 'B', to: 'shallowLF', fly: true }, { field: 'YOU', to: 'shallowLF' }],
    [{ out: 'B' }],
  ],

  // u3-wall-then-ball: find the wall, then the ball
  'u3-wall-then-ball:0': [
    [{ field: 'YOU', to: { x: 24, y: 24 }, ms: 900 }, { say: 'Wall first!', who: 'YOU' }, { run: 'B', to: 1 }],
    [{ ball: 'B', to: 'deepLF', fly: true, ms: 1000 }, { field: 'YOU', to: 'deepLF', ms: 700 }, { say: 'Then find the ball!', who: 'YOU' }],
  ],

  // u3-drop-the-foul: when NOT to catch it
  'u3-drop-the-foul:0': [
    [{ ball: 'B', to: { x: 190, y: 74 }, fly: true, ms: 1500 }, { field: 'YOU', to: { x: 180, y: 70 }, ms: 1200 }, { say: "Let it drop! Don't catch it!", who: 'YOU' }],
    [{ say: 'Catch it and he tags and scores!', who: 'R3' }],
  ],
  'u3-drop-the-foul:1': [
    [{ ball: 'B', to: { x: 14, y: 76 }, fly: true, ms: 1500 }, { field: 'YOU', to: { x: 14, y: 76 }, ms: 1300 }],
    [{ out: 'B' }, { say: 'Two outs? Catch it! Third out!', who: 'YOU' }],
  ],
  'u3-drop-the-foul:2': [
    [{ ball: 'B', to: 'deepCF', fly: true, ms: 1400 }, { field: 'YOU', to: 'deepCF', ms: 1200 }],
    [{ out: 'B' }, { say: 'Tag up!', who: 'R3' }],
    [{ run: 'R3', to: 'home' }, { ball: 'YOU', to: 'C' }],
    [{ safe: 'R3' }, { say: 'The catch let him score!', who: 'YOU' }],
  ],

  // u3-meaningless-run: get it in, don't chase a run you can't stop
  'u3-meaningless-run:0': [
    [{ ball: 'B', to: 'shallowCF', roll: true }, { field: 'YOU', to: 'shallowCF' }, { run: 'R3', to: 'home' }, { run: 'R2', to: 3 }, { run: 'B', to: 1 }, { field: 'SS', to: 'b2' }],
    [{ safe: 'R3' }, { say: 'Up by 8. Get it in!', who: 'YOU' }],
    [{ ball: 'YOU', to: 'SS' }, { say: 'Batter stays at first.' }],
  ],
  'u3-meaningless-run:1': [
    [{ ball: 'B', to: 'shallowRF', roll: true }, { field: 'YOU', to: 'shallowRF' }, { run: 'R3', to: 'home' }, { run: 'B', to: 1 }, { field: '2B', to: 'b2' }],
    [{ safe: 'R3' }, { say: 'Too late for home!', who: 'YOU' }],
    [{ ball: 'YOU', to: '2B' }, { say: 'To second! Hold the batter.', who: 'YOU' }],
  ],

  // u4-get-to-bag — Get to the bag first
  'u4-get-to-bag:0': [
    [{ ball: 'home', to: 'SS', roll: true }, { field: 'YOU', to: 'b1', ms: 600 }, { run: 'B', to: { x: 112, y: 128 }, ms: 800 }],
    [{ say: 'Heels on the bag!', who: 'YOU' }],
    [{ ball: 'SS', to: 'YOU' }, { run: 'B', to: 1, ms: 700 }],
    [{ out: 'B' }],
  ],
  'u4-get-to-bag:1': [
    [{ ball: 'home', to: '3B', roll: true }, { field: 'YOU', to: 'b1', ms: 600 }, { run: 'B', to: { x: 112, y: 128 }, ms: 800 }],
    [{ say: 'Heels on the edge, face him!', who: 'YOU' }],
    [{ ball: '3B', to: 'YOU' }, { run: 'B', to: 1, ms: 700 }],
    [{ out: 'B' }],
  ],

  // u4-stretch — Stretch at the right time
  'u4-stretch:0': [
    [{ ball: 'home', to: '3B', roll: true }, { field: 'YOU', to: 'b1', ms: 600 }, { run: 'B', to: { x: 112, y: 128 }, ms: 800 }],
    [{ say: 'Wait... see the throw first!', who: 'YOU' }],
    [{ ball: '3B', to: { x: 138, y: 101 } }, { field: 'YOU', to: { x: 139, y: 101 }, ms: 350 }, { run: 'B', to: 1, ms: 700 }],
    [{ out: 'B' }],
  ],
  'u4-stretch:2': [
    [{ ball: 'home', to: 'SS', roll: true }, { field: 'YOU', to: 'b1', ms: 600 }, { run: 'B', to: { x: 112, y: 128 }, ms: 800 }],
    [{ ball: 'SS', to: { x: 138, y: 100 } }, { field: 'YOU', to: { x: 139, y: 101 }, ms: 350 }, { run: 'B', to: 1, ms: 700 }],
    [{ out: 'B' }, { say: 'Glove foot steps, other foot stays!', who: 'YOU' }],
  ],

  // u4-bad-throw — Bad throw? Leave the bag
  'u4-bad-throw:0': [
    [{ ball: 'home', to: 'SS', roll: true }, { field: 'YOU', to: 'b1', ms: 600 }, { run: 'B', to: { x: 112, y: 128 }, ms: 800 }],
    [{ ball: 'SS', to: { x: 138, y: 124 } }, { field: 'YOU', to: { x: 138, y: 122 }, ms: 400 }, { run: 'B', to: 1, ms: 700 }],
    [{ say: 'Off the bag — stop it!', who: 'YOU' }, { safe: 'B' }],
  ],
  'u4-bad-throw:1': [
    [{ ball: 'home', to: '3B', roll: true }, { field: 'YOU', to: 'b1', ms: 600 }, { run: 'B', to: { x: 112, y: 128 }, ms: 800 }],
    [{ ball: '3B', to: { x: 158, y: 112 } }, { field: 'YOU', to: { x: 156, y: 111 }, ms: 400 }, { run: 'B', to: 1, ms: 700 }],
    [{ say: 'Leave the bag — block it!', who: 'YOU' }, { safe: 'B' }],
  ],
  'u4-bad-throw:2': [
    [{ ball: 'home', to: '3B', roll: true }, { field: 'YOU', to: 'b1', ms: 600 }, { run: 'B', to: { x: 112, y: 128 }, ms: 800 }, { run: 'R3', to: 'lead3', ms: 600 }],
    [{ ball: '3B', to: { x: 152, y: 114 } }, { field: 'YOU', to: { x: 151, y: 112 }, ms: 400 }, { run: 'B', to: 1, ms: 700 }],
    [{ say: 'Keep it in front!', who: 'YOU' }, { run: 'R3', to: 'back', ms: 500 }],
  ],

  // u4-pitcher-cover — Pitcher covering first
  'u4-pitcher-cover:0': [
    [{ ball: 'home', to: 'hole12', roll: true }, { field: 'YOU', to: 'hole12', ms: 600 }, { field: 'P', to: { x: 128, y: 110 }, ms: 600 }, { run: 'B', to: { x: 112, y: 128 }, ms: 800 }],
    [{ ball: 'YOU', to: 'b1', ms: 600 }, { field: 'P', to: 'b1', ms: 600 }, { run: 'B', to: 1, ms: 800 }, { say: 'Toss it — lead him!', who: 'YOU' }],
    [{ out: 'B' }],
  ],
  'u4-pitcher-cover:2': [
    [{ ball: 'home', to: 'hole12', roll: true }, { field: 'YOU', to: 'hole12', ms: 600 }, { field: 'P', to: { x: 128, y: 110 }, ms: 600 }, { run: 'B', to: { x: 112, y: 128 }, ms: 800 }, { say: 'I got first!', who: 'P' }],
    [{ ball: 'YOU', to: 'b1', ms: 600 }, { field: 'P', to: 'b1', ms: 600 }, { run: 'B', to: 1, ms: 800 }],
    [{ out: 'B' }],
  ],

  // u4-hold-runner — Holding a runner on
  'u4-hold-runner:0': [
    [{ field: 'YOU', to: { x: 143, y: 100 }, ms: 500 }, { run: 'R1', to: 'lead1', ms: 600 }],
    [{ say: 'Hold him close!', who: 'YOU' }],
    [{ ball: 'P', to: 'C' }, { field: 'YOU', to: { x: 136, y: 91 }, ms: 500 }],
    [{ say: 'Pitch is gone — shuffle off!', who: 'YOU' }],
  ],
  'u4-hold-runner:1': [
    [{ field: 'YOU', to: { x: 143, y: 100 }, ms: 500 }, { run: 'R1', to: 'lead1', ms: 600 }],
    [{ say: 'Right foot on the front corner!', who: 'YOU' }],
    [{ ball: 'P', to: 'YOU' }, { run: 'R1', to: 'back', ms: 400 }],
    [{ safe: 'R1' }],
  ],
  'u4-hold-runner:2': [
    [{ field: 'YOU', to: { x: 143, y: 100 }, ms: 500 }, { run: 'R1', to: 'lead1', ms: 600 }],
    [{ ball: 'P', to: 'C' }, { field: 'YOU', to: { x: 136, y: 91 }, ms: 500 }],
    [{ say: 'Pitch is thrown — hop off!', who: 'YOU' }],
  ],

  // u4-play-behind — When NOT to hold the runner
  'u4-play-behind:0': [
    [{ run: 'R1', to: 'lead1', ms: 600 }, { run: 'R2', to: 'lead2', ms: 600 }, { field: 'YOU', to: { x: 142, y: 86 }, ms: 500 }],
    [{ say: "Play back — he can't steal!", who: 'YOU' }],
    [{ ball: 'P', to: 'C' }],
  ],
  'u4-play-behind:1': [
    [{ run: 'R1', to: 'lead1', ms: 600 }, { run: 'R2', to: 'lead2', ms: 600 }, { run: 'R3', to: 'lead3', ms: 600 }, { field: 'YOU', to: { x: 142, y: 86 }, ms: 500 }],
    [{ say: 'Base ahead is full — play back!', who: 'YOU' }],
    [{ ball: 'P', to: 'C' }],
  ],
  'u4-play-behind:2': [
    [{ run: 'R1', to: 'lead1', ms: 600 }, { run: 'R2', to: 'lead2', ms: 600 }, { field: 'YOU', to: { x: 142, y: 86 }, ms: 500 }],
    [{ say: "Second's taken — he can't steal!", who: 'YOU' }],
    [{ ball: 'P', to: 'C' }],
  ],

  // u4-cutoff — You're the cutoff on throws home
  'u4-cutoff:0': [
    [{ ball: 'home', to: 'shallowRF', fly: true }, { field: 'RF', to: 'shallowRF', ms: 700 }, { field: 'YOU', to: { x: 120, y: 110 }, ms: 800 }, { run: 'R2', to: 3, ms: 700 }, { run: 'B', to: 1, ms: 700 }, { say: 'Line up — RF to home!', who: 'YOU' }],
    [{ ball: 'RF', to: 'C' }, { run: 'R2', to: 'home', ms: 700 }],
  ],
  'u4-cutoff:1': [
    [{ ball: 'home', to: 'shallowRF', fly: true }, { field: 'RF', to: 'shallowRF', ms: 700 }, { field: 'YOU', to: { x: 120, y: 110 }, ms: 800 }, { run: 'R2', to: 3, ms: 700 }, { run: 'B', to: 1, ms: 700 }],
    [{ say: 'Let it go! I make the call.', who: 'C' }],
    [{ ball: 'RF', to: 'C' }, { run: 'R2', to: 'home', ms: 700 }],
  ],
  'u4-cutoff:2': [
    [{ ball: 'home', to: 'shallowRF', fly: true }, { field: 'RF', to: 'shallowRF', ms: 700 }, { field: 'YOU', to: { x: 120, y: 110 }, ms: 800 }, { field: 'SS', to: 'b2', ms: 700 }, { run: 'R2', to: 3, ms: 700 }, { run: 'B', to: 1, ms: 700 }],
    [{ ball: 'RF', to: 'YOU' }, { run: 'R2', to: 'home', ms: 700 }, { run: 'B', to: 'half12', ms: 700 }, { say: 'Cut two!', who: 'C' }],
    [{ ball: 'YOU', to: 'SS' }, { run: 'B', to: 2, ms: 600 }],
    [{ out: 'B' }],
  ],

  // u4-bunt — Bunt coverage
  'u4-bunt:0': [
    [{ ball: 'P', to: 'home' }, { field: 'YOU', to: { x: 132, y: 112 }, ms: 400 }, { say: 'Bunt! Charge!', who: 'YOU' }],
    [{ ball: 'home', to: 'bunt1', roll: true }, { field: 'YOU', to: 'bunt1', ms: 400 }, { field: '2B', to: 'b1', ms: 650 }, { run: 'R1', to: 'half12', ms: 650 }, { run: 'B', to: { x: 112, y: 128 }, ms: 650 }],
    [{ ball: 'YOU', to: '2B' }, { run: 'B', to: 1, ms: 600 }, { run: 'R1', to: 2, ms: 600 }],
    [{ out: 'B' }],
  ],
  'u4-bunt:1': [
    [{ ball: 'P', to: 'home' }, { field: 'YOU', to: { x: 132, y: 112 }, ms: 400 }],
    [{ ball: 'home', to: 'bunt1', roll: true }, { field: 'YOU', to: 'bunt1', ms: 400 }, { field: '2B', to: 'b1', ms: 650 }, { run: 'R1', to: 'half12', ms: 650 }, { run: 'B', to: { x: 112, y: 128 }, ms: 650 }, { say: 'I got first!', who: '2B' }],
    [{ ball: 'YOU', to: '2B' }, { run: 'B', to: 1, ms: 600 }, { run: 'R1', to: 2, ms: 600 }],
    [{ out: 'B' }],
  ],
  'u4-bunt:2': [
    [{ ball: 'P', to: 'home' }, { field: 'YOU', to: { x: 132, y: 112 }, ms: 400 }],
    [{ ball: 'home', to: 'bunt1', roll: true }, { field: 'YOU', to: 'bunt1', ms: 400 }, { field: '2B', to: 'b1', ms: 650 }, { run: 'R1', to: 'half12', ms: 650 }, { run: 'B', to: { x: 112, y: 128 }, ms: 650 }, { say: 'One! One!', who: 'C' }],
    [{ ball: 'YOU', to: '2B' }, { run: 'B', to: 1, ms: 600 }, { run: 'R1', to: 2, ms: 600 }],
    [{ out: 'B' }],
  ],

  // u4-obstruction — No ball, no blocking
  'u4-obstruction:0': [
    [{ field: 'YOU', to: { x: 143, y: 100 }, ms: 500 }, { run: 'R1', to: 'lead1', ms: 600 }],
    [{ say: 'Give him a path to the bag!', who: 'YOU' }],
    [{ ball: 'P', to: 'YOU' }, { run: 'R1', to: 'back', ms: 400 }],
    [{ safe: 'R1' }],
  ],
  'u4-obstruction:2': [
    [{ ball: 'home', to: 'SS', roll: true }, { field: 'YOU', to: { x: 141, y: 102 }, ms: 600 }, { run: 'B', to: { x: 112, y: 128 }, ms: 800 }],
    [{ say: 'Edge of the bag — leave his lane!', who: 'YOU' }],
    [{ ball: 'SS', to: 'YOU' }, { run: 'B', to: 1, ms: 700 }],
    [{ out: 'B' }],
  ],

  // u5-steal-cover — Who covers second on a steal
  'u5-steal-cover:0': [
    [{ run: 'R1', to: 'lead1', ms: 600 }, { say: "Righty up — I've got the bag!", who: 'YOU' }],
    [{ ball: 'P', to: 'C' }, { run: 'R1', to: 'half12', ms: 700 }, { field: 'YOU', to: 'b2', ms: 600 }],
    [{ ball: 'C', to: 'YOU' }, { run: 'R1', to: 2, ms: 600 }],
    [{ out: 'R1' }],
  ],
  'u5-steal-cover:1': [
    [{ run: 'R1', to: 'lead1', ms: 600 }, { say: 'Lefty up — shortstop covers!', who: 'YOU' }],
    [{ ball: 'P', to: 'C' }, { run: 'R1', to: 'half12', ms: 700 }, { field: 'SS', to: 'b2', ms: 600 }, { field: 'YOU', to: { x: 128, y: 76 }, ms: 500 }],
    [{ ball: 'C', to: 'SS' }, { run: 'R1', to: 2, ms: 600 }],
    [{ out: 'R1' }],
  ],
  'u5-steal-cover:2': [
    [{ say: 'Signal before the pitch: me!', who: 'YOU' }, { run: 'R1', to: 'lead1', ms: 600 }],
    [{ ball: 'P', to: 'C' }, { run: 'R1', to: 'half12', ms: 700 }, { field: 'YOU', to: 'b2', ms: 600 }],
    [{ ball: 'C', to: 'YOU' }, { run: 'R1', to: 2, ms: 600 }],
    [{ out: 'R1' }],
  ],

  // u5-double-play — Turning two
  'u5-double-play:0': [
    [{ ball: 'home', to: 'YOU', roll: true }, { field: '2B', to: 'b2', ms: 600 }, { field: '1B', to: 'b1', ms: 600 }, { run: 'R1', to: 'half12', ms: 800 }, { run: 'B', to: { x: 112, y: 128 }, ms: 800 }, { say: 'Lead runner first!', who: 'YOU' }],
    [{ ball: 'YOU', to: ['2B', '1B'] }, { run: 'R1', to: 2, ms: 500 }, { run: 'B', to: 1, ms: 900 }],
    [{ out: 'R1' }, { out: 'B' }],
  ],
  'u5-double-play:1': [
    [{ ball: 'home', to: 'SS', roll: true }, { field: 'YOU', to: 'b2', ms: 600 }, { field: '1B', to: 'b1', ms: 600 }, { run: 'R1', to: 'half12', ms: 800 }, { run: 'B', to: { x: 112, y: 128 }, ms: 800 }, { say: 'Get to the bag!', who: 'YOU' }],
    [{ ball: 'SS', to: ['YOU', '1B'] }, { run: 'R1', to: 2, ms: 500 }, { run: 'B', to: 1, ms: 900 }],
    [{ out: 'R1' }, { out: 'B' }],
  ],
  'u5-double-play:2': [
    [{ ball: 'home', to: { x: 90, y: 68 }, roll: true }, { field: 'YOU', to: { x: 90, y: 68 }, ms: 600 }, { run: 'R1', to: 'half12', ms: 800 }, { run: 'B', to: { x: 112, y: 128 }, ms: 800 }],
    [{ field: 'YOU', to: 'b2', ms: 300 }, { say: 'Step on it — sure out!', who: 'YOU' }],
    [{ out: 'R1' }],
  ],

  // u5-force-tag — Force out or tag?
  'u5-force-tag:0': [
    [{ ball: 'home', to: 'SS', roll: true }, { field: 'YOU', to: 'b2', ms: 600 }, { run: 'R1', to: 'half12', ms: 800 }, { run: 'B', to: { x: 112, y: 128 }, ms: 800 }],
    [{ ball: 'SS', to: 'YOU' }, { run: 'R1', to: 2, ms: 600 }, { say: "It's a force — touch the bag!", who: 'YOU' }],
    [{ out: 'R1' }],
  ],
  'u5-force-tag:1': [
    [{ ball: 'home', to: { x: 70, y: 118 }, roll: true }, { field: '3B', to: { x: 70, y: 118 }, ms: 600 }, { field: 'YOU', to: 'b3', ms: 700 }, { run: 'R2', to: 'half23', ms: 700 }, { run: 'B', to: { x: 112, y: 128 }, ms: 800 }],
    [{ ball: '3B', to: 'YOU' }, { run: 'R2', to: 3, ms: 600 }, { say: 'No force — tag him!', who: 'YOU' }],
    [{ out: 'R2' }],
  ],
  'u5-force-tag:2': [
    [{ ball: 'home', to: 'YOU', roll: true }, { field: '3B', to: 'b3', ms: 600 }, { run: 'R2', to: 'half23', ms: 800 }, { run: 'R1', to: 'half12', ms: 800 }, { run: 'B', to: { x: 112, y: 128 }, ms: 800 }],
    [{ ball: 'YOU', to: '3B' }, { run: 'R2', to: 3, ms: 500 }, { run: 'R1', to: 2, ms: 500 }, { run: 'B', to: 1, ms: 600 }, { say: 'Force at third — just touch!', who: '3B' }],
    [{ out: 'R2' }],
  ],

  // u5-relay — Going out for the relay
  'u5-relay:0': [
    [{ ball: 'home', to: 'gapLC', fly: true }, { field: 'CF', to: 'gapLC', ms: 900 }, { field: 'YOU', to: { x: 62, y: 58 }, ms: 900 }, { field: '3B', to: 'b3', ms: 600 }, { run: 'B', to: 1, ms: 800 }],
    [{ say: 'Here! Here! Hands up!', who: 'YOU' }, { run: 'B', to: 2, ms: 1200 }],
    [{ ball: 'CF', to: ['YOU', '3B'] }],
    [{ say: 'Relay holds him at second!', who: 'YOU' }],
  ],
  'u5-relay:1': [
    [{ ball: 'home', to: 'lineRF', fly: true }, { field: 'RF', to: 'lineRF', ms: 900 }, { field: 'YOU', to: { x: 150, y: 62 }, ms: 900 }, { field: 'SS', to: 'b2', ms: 600 }, { run: 'B', to: 1, ms: 800 }],
    [{ say: 'Arms up! Line it up!', who: 'YOU' }, { run: 'B', to: { x: 128, y: 88 }, ms: 900 }],
    [{ ball: 'RF', to: ['YOU', 'SS'] }, { run: 'B', to: 1, ms: 700 }],
  ],

  // u5-infield-in — Runner on third: infield in or back
  'u5-infield-in:0': [
    [{ field: 'YOU', to: { x: 118, y: 90 }, ms: 500 }, { field: 'SS', to: { x: 82, y: 90 }, ms: 500 }],
    [{ ball: 'home', to: 'YOU', roll: true }, { run: 'R3', to: { x: 68, y: 118 }, ms: 500 }, { run: 'B', to: { x: 112, y: 128 }, ms: 700 }],
    [{ ball: 'YOU', to: 'C' }, { run: 'R3', to: 'home', ms: 700 }, { run: 'B', to: 1, ms: 700 }],
    [{ out: 'R3' }, { say: "Throw home — that's why we're in!", who: 'YOU' }],
  ],
  'u5-infield-in:1': [
    [{ ball: 'home', to: 'YOU', roll: true }, { field: '1B', to: 'b1', ms: 600 }, { run: 'R3', to: { x: 68, y: 118 }, ms: 500 }, { run: 'B', to: { x: 112, y: 128 }, ms: 800 }],
    [{ ball: 'YOU', to: '1B' }, { run: 'R3', to: 'home', ms: 700 }, { run: 'B', to: 1, ms: 700 }, { say: 'Take the sure out!', who: 'YOU' }],
    [{ out: 'B' }],
  ],
  'u5-infield-in:2': [
    [{ field: 'YOU', to: { x: 82, y: 90 }, ms: 500 }, { field: '2B', to: { x: 118, y: 90 }, ms: 500 }],
    [{ ball: 'home', to: 'YOU', roll: true }, { field: '1B', to: 'b1', ms: 600 }, { run: 'R3', to: 'lead3', ms: 500 }, { run: 'B', to: { x: 112, y: 128 }, ms: 800 }],
    [{ say: 'Look him back!', who: 'YOU' }, { run: 'R3', to: 'back', ms: 500 }],
    [{ ball: 'YOU', to: '1B' }, { run: 'B', to: 1, ms: 700 }],
    [{ out: 'B' }],
  ],

  // u5-two-outs — Two outs: take the easy one
  'u5-two-outs:0': [
    [{ ball: 'home', to: { x: 110, y: 68 }, roll: true }, { field: 'YOU', to: { x: 110, y: 68 }, ms: 500 }, { run: 'R1', to: 'half12', ms: 800 }, { run: 'R2', to: 'half23', ms: 800 }, { run: 'B', to: { x: 112, y: 128 }, ms: 800 }],
    [{ field: 'YOU', to: 'b2', ms: 300 }, { say: 'Two outs — take the easy one!', who: 'YOU' }],
    [{ out: 'R1' }],
  ],
  'u5-two-outs:1': [
    [{ ball: 'home', to: { x: 64, y: 98 }, roll: true }, { field: 'YOU', to: { x: 64, y: 98 }, ms: 600 }, { field: '3B', to: { x: 66, y: 112 }, ms: 500 }, { run: 'R3', to: { x: 68, y: 118 }, ms: 800 }, { run: 'R2', to: 'half23', ms: 800 }, { run: 'R1', to: 'half12', ms: 800 }, { run: 'B', to: { x: 112, y: 128 }, ms: 800 }],
    [{ field: 'YOU', to: 'b3', ms: 300 }, { say: 'Closest base — step on it!', who: 'YOU' }],
    [{ out: 'R2' }],
  ],

  // u5-popup-priority — Pop-ups in the infield
  'u5-popup-priority:0': [
    [{ ball: 'home', to: { x: 132, y: 80 }, fly: true, ms: 1200 }, { field: 'YOU', to: { x: 132, y: 80 }, ms: 700 }, { field: '1B', to: { x: 138, y: 88 }, ms: 500 }, { run: 'B', to: { x: 112, y: 128 }, ms: 800 }, { say: "Mine! I've got it!", who: 'YOU' }],
    [{ out: 'B' }, { say: 'Middle guy has priority!', who: 'YOU' }],
  ],
  'u5-popup-priority:1': [
    [{ ball: 'home', to: 'shallowRF', fly: true, ms: 1400 }, { field: 'RF', to: 'shallowRF', ms: 1300 }, { field: 'YOU', to: { x: 136, y: 66 }, ms: 600 }, { run: 'B', to: { x: 112, y: 128 }, ms: 800 }, { run: 'R1', to: 'lead1', ms: 600 }, { say: 'I got it!', who: 'RF' }],
    [{ field: 'YOU', to: { x: 126, y: 76 }, ms: 400 }, { out: 'B' }, { say: 'Peel off — he has it!', who: 'YOU' }],
    [{ run: 'R1', to: 'back', ms: 500 }],
  ],

  // u6-pitcher-cover-first: Pitcher, break for first
  'u6-pitcher-cover-first:0': [
    [{ ball: 'P', to: 'C' }],
    [{ ball: 'B', to: 'hole12', roll: true }, { field: 'P', to: { x: 132, y: 112 } }, { field: '1B', to: 'hole12' }, { say: 'Break for first!', who: 'P' }],
    [{ field: 'P', to: 'b1', ms: 500 }, { run: 'B', to: 1, ms: 1200 }, { ball: '1B', to: { x: 140, y: 108 }, ms: 500 }],
    [{ out: 'B' }],
  ],
  'u6-pitcher-cover-first:1': [
    [{ ball: 'B', to: 'hole12', roll: true }, { field: '1B', to: 'hole12' }, { field: 'P', to: { x: 136, y: 116 } }, { say: 'Hit the line first...', who: 'P' }],
    [{ field: 'P', to: 'b1', ms: 500 }, { run: 'B', to: 1, ms: 1200 }, { ball: '1B', to: { x: 140, y: 108 }, ms: 500 }],
    [{ out: 'B' }, { say: '...then run up it to the bag!', who: 'P' }],
  ],

  // u6-pitcher-backup: Pitcher, back up the base
  'u6-pitcher-backup:0': [
    [{ ball: 'B', to: 'shallowCF', roll: true }, { field: 'CF', to: 'shallowCF' }, { run: 'R2', to: 3 }],
    [{ field: 'P', to: 'backstop' }, { run: 'R2', to: 'home' }, { ball: 'CF', to: 'C' }, { say: 'Back up home, way back!', who: 'P' }],
    [{ out: 'R2' }],
  ],
  'u6-pitcher-backup:1': [
    [{ ball: 'B', to: 'shallowRF', roll: true }, { field: 'RF', to: 'shallowRF' }, { run: 'R1', to: 2 }, { run: 'B', to: 1 }],
    [{ field: 'P', to: 'foul3' }, { run: 'R1', to: 3 }, { field: '3B', to: 'b3' }, { say: 'Back up third!', who: 'P' }],
    [{ ball: 'RF', to: '3B' }],
    [{ safe: 'R1' }],
  ],

  // u6-catcher-dropped-k: Catcher, dropped third strike
  'u6-catcher-dropped-k:0': [
    [{ ball: 'P', to: { x: 108, y: 166 } }],
    [{ field: 'C', to: { x: 108, y: 164 } }, { run: 'B', to: 'half12', ms: 900 }, { say: 'Grab it and throw to first!', who: 'C' }],
    [{ field: '1B', to: 'b1' }, { ball: 'C', to: '1B' }, { run: 'B', to: 1 }],
    [{ out: 'B' }],
  ],
  'u6-catcher-dropped-k:1': [
    [{ ball: 'P', to: { x: 108, y: 166 } }],
    [{ run: 'B', to: { x: 112, y: 138 } }, { say: "First's taken. He's already out!", who: 'C' }],
    [{ out: 'B' }],
  ],
  'u6-catcher-dropped-k:2': [
    [{ ball: 'P', to: { x: 106, y: 166 } }],
    [{ field: 'C', to: { x: 106, y: 164 } }, { run: 'B', to: { x: 112, y: 138 } }, { run: 'R3', to: 'half3H' }, { say: 'Step on home. Force!', who: 'C' }],
    [{ field: 'C', to: 'home', ms: 400 }],
    [{ out: 'R3' }],
  ],

  // u6-catcher-backup-first: Catcher, back up first
  'u6-catcher-backup-first:0': [
    [{ ball: 'B', to: 'holeSS', roll: true }, { field: 'SS', to: 'holeSS' }, { field: 'C', to: { x: 128, y: 140 } }, { run: 'B', to: 'half12' }],
    [{ field: 'C', to: 'foul1' }, { ball: 'SS', to: '1B' }, { run: 'B', to: 1 }, { say: 'Back up first!', who: 'C' }],
    [{ out: 'B' }],
  ],
  'u6-catcher-backup-first:1': [
    [{ ball: 'B', to: 'holeSS', roll: true }, { field: 'SS', to: 'holeSS' }, { run: 'B', to: 'half12' }],
    [{ ball: 'SS', to: '1B' }, { run: 'B', to: 1 }, { run: 'R2', to: 'half23' }, { say: 'Runner on 2nd. I stay home!', who: 'C' }],
    [{ out: 'B' }, { run: 'R2', to: 'back' }],
  ],

  // u6-third-bunt: Third base, bunts and slow rollers
  'u6-third-bunt:0': [
    [{ ball: 'B', to: 'bunt3', roll: true }, { field: '3B', to: 'bunt3' }, { run: 'B', to: 'half12', ms: 900 }],
    [{ say: 'Barehand it, throw on the run!', who: '3B' }, { ball: '3B', to: '1B' }, { run: 'B', to: 1 }],
    [{ out: 'B' }],
  ],
  'u6-third-bunt:1': [
    [{ ball: 'B', to: 'bunt3', roll: true }, { field: '3B', to: 'bunt3' }, { field: 'SS', to: 'b2' }, { run: 'R1', to: 'half12' }, { run: 'B', to: 'half12' }],
    [{ say: 'Two! Get the lead runner!', who: 'C' }, { ball: '3B', to: 'SS' }, { run: 'R1', to: 2 }],
    [{ out: 'R1' }],
  ],
  'u6-third-bunt:2': [
    [{ ball: 'B', to: { x: 70, y: 121 }, roll: true }, { field: '3B', to: { x: 66, y: 124 } }, { run: 'B', to: 'half12' }],
    [{ say: 'Let it roll foul!', who: '3B' }, { ball: { x: 70, y: 121 }, to: 'foul3', roll: true, ms: 1200 }],
    [{ say: 'Foul ball!' }, { run: 'B', to: 'back' }],
  ],

  // u6-infield-fly-defense: Infield fly on defense
  'u6-infield-fly-defense:0': [
    [{ ball: 'B', to: { x: 80, y: 76 }, fly: true }, { field: 'SS', to: { x: 80, y: 76 } }, { say: 'Infield fly! Batter is out.', who: 'SS' }],
    [{ out: 'B' }, { say: 'So just catch it!', who: 'SS' }],
  ],
  'u6-infield-fly-defense:1': [
    [{ ball: 'B', to: { x: 120, y: 78 }, fly: true }, { field: '2B', to: { x: 120, y: 78 } }, { run: 'R1', to: 'half12' }, { run: 'R2', to: 'half23' }, { say: 'Two outs: no infield fly!', who: '2B' }],
    [{ say: 'Catch it to end the inning!', who: '2B' }],
    [{ out: 'B' }],
  ],
  'u6-infield-fly-defense:2': [
    [{ ball: 'B', to: { x: 66, y: 98 }, fly: true }, { field: '3B', to: { x: 66, y: 98 } }, { say: 'One runner? No infield fly!', who: '3B' }],
    [{ out: 'B' }, { say: 'Need 1st AND 2nd for that.', who: '3B' }],
  ],

  // u8-free-outs: Don't hand them a free out
  'u8-free-outs:0': [
    [{ run: 'R1', to: { x: 140, y: 100 } }, { say: 'Small lead. Let him walk us!', who: 'R1' }],
    [{ ball: 'P', to: { x: 112, y: 146 } }],
    [{ say: 'Ball three!' }],
  ],
  'u8-free-outs:1': [
    [{ run: 'R1', to: 'lead1' }, { run: 'R2', to: 'lead2' }],
    [{ say: "Second's taken. No steal!", who: 'R1' }, { ball: 'P', to: 'C' }],
    [{ run: 'R1', to: 'back' }, { run: 'R2', to: 'back' }],
  ],

  // u8-what-if: Ask "what if?" on every pitch
  'u8-what-if:0': [
    [{ ball: 'P', to: 'C' }, { run: 'R2', to: 'lead2' }],
    [{ ball: 'C', to: { x: 100, y: 58 }, fly: true, ms: 900 }, { say: 'Over his head!', who: 'R2' }],
    [{ run: 'R2', to: 3 }, { field: 'CF', to: 'shallowCF' }, { ball: { x: 100, y: 58 }, to: 'shallowCF', roll: true }],
    [{ safe: 'R2' }, { say: 'I was ready for it!', who: 'R2' }],
  ],
  'u8-what-if:1': [
    [{ ball: 'B', to: 'shallowLF', roll: true }, { field: 'LF', to: 'shallowLF' }, { run: 'R1', to: 2 }, { run: 'B', to: 1 }],
    [{ field: 'LF', to: { x: 66, y: 72 }, ms: 1500 }, { run: 'R1', to: 'lead2' }, { say: "He's jogging it in...", who: 'R1' }],
    [{ run: 'R1', to: 3 }, { say: 'Take third!', who: 'R1' }],
    [{ safe: 'R1' }],
  ],

  // u8-lead-first: The lead from first
  'u8-lead-first:0': [
    [{ run: 'R1', to: 'lead1' }, { say: 'One step and a dive away.', who: 'R1' }],
    [{ ball: 'P', to: '1B' }, { run: 'R1', to: 'back', ms: 400 }],
    [{ safe: 'R1' }],
  ],
  'u8-lead-first:1': [
    [{ run: 'R1', to: 'lead1' }, { say: 'Same lead every time.', who: 'R1' }],
    [{ ball: 'P', to: 'C' }, { run: 'R1', to: 2 }, { field: 'SS', to: 'b2' }],
    [{ ball: 'C', to: 'SS' }],
    [{ safe: 'R1' }, { say: "He couldn't tell I was going!", who: 'R1' }],
  ],
  'u8-lead-first:2': [
    [{ run: 'R1', to: 'lead1', ms: 1200 }, { say: 'Eyes on the pitcher!', who: 'R1' }],
    [{ ball: 'P', to: '1B' }, { run: 'R1', to: 'back', ms: 400 }],
    [{ safe: 'R1' }],
  ],

  // u8-dive-back: Getting back on a pickoff
  'u8-dive-back:0': [
    [{ run: 'R1', to: 'lead1' }],
    [{ ball: 'P', to: '1B' }, { run: 'R1', to: { x: 150, y: 102 }, ms: 450 }, { say: 'Dive to the back corner!', who: 'R1' }],
    [{ safe: 'R1' }],
  ],
  'u8-dive-back:1': [
    [{ run: 'R1', to: 'lead1' }],
    [{ ball: 'P', to: '1B' }, { run: 'R1', to: 'back', ms: 450 }],
    [{ safe: 'R1' }, { say: 'Hand stays on the bag...', who: 'R1' }],
    [{ ball: '1B', to: 'P' }, { say: '...till the pitcher has it.', who: 'R1' }],
  ],
  'u8-dive-back:2': [
    [{ run: 'R1', to: 'lead1' }],
    [{ ball: 'P', to: '1B', ms: 1100 }, { run: 'R1', to: 'back', ms: 700 }, { say: 'That was his slow move.', who: 'R1' }],
    [{ run: 'R1', to: 'lead1' }],
    [{ ball: 'P', to: '1B', ms: 450 }, { run: 'R1', to: 'back', ms: 450 }, { say: 'Watch for the quick one!', who: 'R1' }],
    [{ safe: 'R1' }],
  ],

  // u8-lead-second: The lead from second
  'u8-lead-second:0': [
    [{ run: 'R2', to: { x: 92, y: 56 } }, { say: 'Back a couple steps.', who: 'R2' }],
    [{ ball: 'P', to: 'C' }, { ball: 'B', to: 'shallowLF', roll: true }],
    [{ run: 'R2', to: 'home', ms: 1600 }, { field: 'LF', to: 'shallowLF' }, { say: 'Round third tight!', who: 'R2' }],
    [{ safe: 'R2' }],
  ],
  'u8-lead-second:1': [
    [{ run: 'R2', to: 'lead2' }, { field: 'SS', to: { x: 88, y: 62 } }],
    [{ say: 'Coach: "Back!"' }, { run: 'R2', to: 'back', ms: 500 }],
    [{ say: 'Coach watches. I watch the P.', who: 'R2' }],
  ],
  'u8-lead-second:2': [
    [{ run: 'R2', to: 'lead2' }, { ball: 'P', to: 'C' }],
    [{ ball: 'B', to: 'shallowRF', roll: true }, { run: 'R2', to: 'home', ms: 1600 }, { run: 'B', to: 1 }, { say: 'Two outs: go on contact!', who: 'R2' }],
    [{ field: 'RF', to: 'shallowRF' }],
    [{ safe: 'R2' }],
  ],

  // u8-lead-third: The lead from third
  'u8-lead-third:0': [
    [{ run: 'R3', to: { x: 58, y: 117 } }, { say: 'Lead off in foul ground.', who: 'R3' }],
    [{ ball: 'P', to: 'C' }],
    [{ run: 'R3', to: 'back' }],
  ],
  'u8-lead-third:1': [
    [{ run: 'R3', to: { x: 58, y: 117 } }, { ball: 'P', to: 'C' }],
    [{ ball: 'B', to: 'R3' }, { say: 'Hit me in foul ground...', who: 'R3' }],
    [{ say: "Foul ball! I'm not out." }, { run: 'R3', to: 'back' }],
  ],
  'u8-lead-third:2': [
    [{ run: 'R3', to: { x: 58, y: 117 } }, { ball: 'B', to: 'CF', fly: true }],
    [{ run: 'R3', to: 'back', ms: 500 }, { say: 'Straight back and tag!', who: 'R3' }],
    [{ run: 'R3', to: 'home', ms: 1100 }, { ball: 'CF', to: 'C' }],
    [{ safe: 'R3' }],
  ],

  // u7-steal-timing: Steal on the pitch, not the leg lift
  'u7-steal-timing:0': [
    [{ run: 'R1', to: 'lead1' }, { say: 'Leg lift? Not yet...', who: 'R1' }],
    [{ wait: 500 }, { say: 'He threw home. GO!', who: 'R1' }],
    [{ ball: 'P', to: 'C' }, { run: 'R1', to: 2, ms: 1400 }, { field: 'SS', to: 'b2' }],
    [{ ball: 'C', to: 'SS' }],
    [{ safe: 'R1' }],
  ],
  'u7-steal-timing:1': [
    [{ run: 'R1', to: 'lead1' }, { say: 'Lefty is looking right at me.', who: 'R1' }],
    [{ ball: 'P', to: '1B' }, { run: 'R1', to: 'back', ms: 450 }],
    [{ safe: 'R1' }, { say: "Glad I didn't go on the leg!", who: 'R1' }],
  ],
  'u7-steal-timing:2': [
    [{ say: 'Study his move from the dugout!', who: 'R1' }],
    [{ run: 'R1', to: 'lead1' }],
    [{ ball: 'P', to: '1B' }, { run: 'R1', to: 'back', ms: 450 }, { say: 'I knew that move was coming.', who: 'R1' }],
    [{ safe: 'R1' }],
  ],

  // u7-secondary: Secondary lead
  'u7-secondary:0': [
    [{ run: 'R1', to: 'lead1' }],
    [{ ball: 'P', to: 'C' }, { run: 'R1', to: { x: 128, y: 89 } }, { say: 'Shuffle, shuffle!', who: 'R1' }],
    [{ run: 'R1', to: 'back' }],
  ],
  'u7-secondary:1': [
    [{ run: 'R2', to: 'lead2' }],
    [{ ball: 'P', to: 'C' }, { run: 'R2', to: { x: 84, y: 72 } }],
    [{ say: 'Caught clean. Get back!', who: 'R2' }, { run: 'R2', to: 'back' }],
  ],

  // u7-wild-pitch: Ball in the dirt
  'u7-wild-pitch:0': [
    [{ run: 'R1', to: 'lead1' }, { ball: 'P', to: 'backstop' }],
    [{ run: 'R1', to: 2, ms: 1200 }, { field: 'C', to: 'backstop' }, { say: 'Past him. GO!', who: 'R1' }],
    [{ safe: 'R1' }],
  ],
  'u7-wild-pitch:1': [
    [{ run: 'R3', to: { x: 58, y: 117 } }, { ball: 'P', to: { x: 100, y: 156 } }],
    [{ say: 'Blocked. Stay put!', who: 'R3' }, { field: 'C', to: { x: 100, y: 156 } }],
    [{ run: 'R3', to: 'back' }],
  ],

  // u7-pickoff-read: Watch for fake-to-third
  'u7-pickoff-read:0': [
    [{ run: 'R1', to: 'lead1' }, { run: 'R3', to: { x: 58, y: 117 } }],
    [{ field: 'P', to: { x: 94, y: 106 } }, { run: 'R3', to: 'back' }, { say: 'Fake to third...', who: 'P' }],
    [{ ball: 'P', to: '1B' }, { run: 'R1', to: 'back', ms: 450 }, { say: 'Dive back!', who: 'R1' }],
    [{ safe: 'R1' }],
  ],
  'u7-pickoff-read:2': [
    [{ run: 'R1', to: { x: 132, y: 92 } }, { run: 'R3', to: { x: 58, y: 117 } }],
    [{ field: 'P', to: { x: 94, y: 106 } }, { say: 'Fake third, catch him leaning!', who: 'P' }],
    [{ ball: 'P', to: '1B' }, { run: 'R1', to: 'back', ms: 700 }],
    [{ out: 'R1' }],
  ],

  // u7-run-through-first: run THROUGH first, then look right for an overthrow
  'u7-run-through-first:0': [
    [{ ball: 'B', to: 'SS', roll: true }, { say: 'Full speed!', who: 'B' }],
    [{ run: 'B', to: 1, ms: 900 }, { ball: 'SS', to: '1B', ms: 900 }],
    [{ run: 'B', to: PAST1 }, { safe: 'B' }, { say: 'Run THROUGH the bag!', who: 'B' }],
  ],
  'u7-run-through-first:1': [
    [{ ball: 'B', to: 'SS', roll: true }],
    [{ run: 'B', to: 1, ms: 900 }, { ball: 'SS', to: '1B', ms: 900 }],
    [{ run: 'B', to: PAST1 }, { say: 'Look right for an overthrow!', who: 'B' }],
  ],

  // u7-round-first: banana turn into first, aggressive turn toward second
  'u7-round-first:0': [
    [{ ball: 'B', to: 'shallowLF' }, { field: 'LF', to: 'shallowLF' }, { run: 'B', to: BANANA }],
    [{ run: 'B', to: 1 }],
    [{ run: 'B', to: TURN1 }, { say: 'Hard turn toward second!', who: 'B' }],
    [{ ball: 'LF', to: 'SS' }, { run: 'B', to: 1 }],
  ],
  'u7-round-first:1': [
    [{ run: 'R1', to: TURN1 }, { field: 'LF', to: 'shallowLF' }, { ball: 'B', to: 'shallowLF' }],
    [{ field: 'SS', to: 'b2' }, { ball: 'LF', to: 'b2' }, { run: 'R1', to: 'back' }, { say: 'Back to first, eyes on the ball!', who: 'R1' }],
    [{ safe: 'R1' }],
  ],

  // u7-two-outs: two outs, run on contact
  'u7-two-outs:0': [
    [{ ball: 'B', to: 'shallowRF', fly: true, ms: 1400 }, { field: 'RF', to: 'shallowRF', ms: 1400 }, { run: 'R2', to: 3, ms: 1400 }, { say: 'Two outs: run on contact!', who: 'R2' }],
    [{ run: 'R2', to: 'home' }, { say: 'If it drops, you score!', who: 'R2' }],
  ],
  'u7-two-outs:1': [
    [{ ball: 'B', to: 'gapRC' }, { run: 'R1', to: 2 }, { say: "It's hit: GO!", who: 'R1' }],
    [{ run: 'R1', to: 3 }],
  ],
  'u7-two-outs:2': [
    [{ ball: 'B', to: 'gapLC' }, { run: 'R3', to: 'home' }, { run: 'B', to: 1 }, { say: 'Two outs: run on anything!', who: 'R3' }],
    [{ safe: 'R3' }],
  ],

  // u7-fly-ball: deep fly = tag up; maybe-caught = halfway
  'u7-fly-ball:0': [
    [{ ball: 'B', to: 'shallowCF', fly: true, ms: 1400 }, { field: 'CF', to: 'shallowCF', ms: 1400 }, { run: 'R1', to: 'half12', ms: 1200 }, { say: 'Halfway!', who: 'R1' }],
    [{ run: 'R1', to: 'back' }, { say: 'Caught! Back to first.', who: 'R1' }],
    [{ safe: 'R1' }],
  ],
  'u7-fly-ball:1': [
    [{ ball: 'B', to: 'deepLF', fly: true, ms: 1500 }, { field: 'LF', to: 'deepLF', ms: 1500 }, { say: 'Tag up!', who: 'R3' }],
    [{ run: 'R3', to: 'home', ms: 1100 }, { ball: 'LF', to: ['SS', 'home'], ms: 1300 }],
    [{ safe: 'R3' }],
  ],
  'u7-fly-ball:2': [
    [{ ball: 'B', to: 'deepRF', fly: true, ms: 1500 }, { field: 'RF', to: 'deepRF', ms: 1500 }, { field: '3B', to: 'b3' }, { say: 'Tag up!', who: 'R2' }],
    [{ run: 'R2', to: 3, ms: 1000 }, { ball: 'RF', to: ['2B', 'b3'], ms: 1300 }],
    [{ safe: 'R2' }],
  ],

  // u7-tag-up: on the bag at the catch, leave at the first touch
  'u7-tag-up:0': [
    [{ ball: 'B', to: 'deepCF', fly: true, ms: 1500 }, { field: 'CF', to: 'deepCF', ms: 1500 }, { say: 'Foot on the bag...', who: 'R3' }],
    [{ run: 'R3', to: 'home', ms: 1100 }, { ball: 'CF', to: ['SS', 'home'], ms: 1400 }, { say: 'He touched it: GO!', who: 'R3' }],
    [{ safe: 'R3' }],
  ],
  'u7-tag-up:2': [
    [{ ball: 'B', to: 'deepRF', fly: true, ms: 1500 }, { field: 'RF', to: 'deepRF', ms: 1500 }, { field: '3B', to: 'b3' }, { say: 'Eyes on the catch!', who: 'R2' }],
    [{ say: 'Coach: GO!' }],
    [{ run: 'R2', to: 3, ms: 1000 }, { ball: 'RF', to: ['2B', 'b3'], ms: 1300 }],
    [{ safe: 'R2' }],
  ],

  // u7-line-drive: fewer than two outs, freeze on a liner
  'u7-line-drive:0': [
    [{ run: 'R1', to: 'lead1' }, { ball: 'P', to: 'C' }],
    [{ ball: 'B', to: '2B' }, { say: 'Freeze on a liner!', who: 'R1' }],
    [{ run: 'R1', to: 'back' }, { field: '1B', to: 'b1' }, { ball: '2B', to: 'b1' }],
    [{ safe: 'R1' }],
  ],
  'u7-line-drive:1': [
    [{ run: 'R2', to: 'lead2' }, { ball: 'P', to: 'C' }],
    [{ ball: 'B', to: 'SS' }, { say: 'Freeze!', who: 'R2' }],
    [{ run: 'R2', to: 'back' }, { field: '2B', to: 'b2' }, { ball: 'SS', to: 'b2' }, { say: 'Off the bag = double play!', who: 'R2' }],
    [{ safe: 'R2' }],
  ],
  'u7-line-drive:2': [
    [{ ball: 'B', to: 'gapLC' }, { run: 'R1', to: 2 }, { run: 'B', to: 1 }, { say: 'Two outs: run on contact!', who: 'R1' }],
    [{ run: 'R1', to: 3 }],
  ],

  // u7-ball-in-front: no force on second: hold in front, go on balls behind you
  'u7-ball-in-front:0': [
    [{ run: 'R2', to: 'lead2' }],
    [{ ball: 'B', to: 'SS', roll: true }, { say: 'In front of you: hold!', who: 'R2' }],
    [{ run: 'R2', to: 'back' }, { run: 'B', to: 1, ms: 1000 }, { ball: 'SS', to: '1B', ms: 900 }],
    [{ out: 'B' }, { safe: 'R2' }],
  ],
  'u7-ball-in-front:1': [
    [{ run: 'R2', to: 'lead2' }],
    [{ ball: 'B', to: '2B', roll: true }, { say: 'Behind you: go to third!', who: 'R2' }],
    [{ run: 'R2', to: 3 }, { run: 'B', to: 1, ms: 1000 }, { ball: '2B', to: '1B', ms: 900 }],
    [{ safe: 'R2' }, { out: 'B' }],
  ],
  'u7-ball-in-front:2': [
    [{ ball: 'B', to: 'SS', roll: true }, { say: 'Force: you HAVE to run!', who: 'R2' }],
    [{ run: 'R2', to: 3 }, { run: 'R1', to: 2 }, { run: 'B', to: 1, ms: 1000 }, { ball: 'SS', to: '1B', ms: 900 }],
    [{ safe: 'R2' }, { out: 'B' }],
  ],

  // u7-coach-eyes: in front = your eyes; behind = your base coach
  'u7-coach-eyes:0': [
    [{ ball: 'B', to: 'shallowRF' }, { field: 'RF', to: 'shallowRF' }, { run: 'R1', to: 2 }, { run: 'B', to: 1 }],
    [{ run: 'R1', to: 'half23' }, { say: 'Behind you: find the coach!', who: 'R1' }],
    [{ say: 'Coach: Go to third!' }],
    [{ run: 'R1', to: 3 }, { field: '3B', to: 'b3' }, { ball: 'RF', to: 'b3', ms: 1200 }],
    [{ safe: 'R1' }],
  ],
  'u7-coach-eyes:1': [
    [{ run: 'R2', to: 'lead2' }],
    [{ ball: 'B', to: 'SS', roll: true }, { say: 'In front: use your eyes!', who: 'R2' }],
    [{ run: 'R2', to: 'back' }, { run: 'B', to: 1, ms: 1000 }, { ball: 'SS', to: '1B', ms: 900 }],
    [{ out: 'B' }, { safe: 'R2' }],
  ],

  // u7-hit-by-ball: a batted ball that hits you is an out; go behind it
  'u7-hit-by-ball:0': [
    [{ ball: 'B', to: 'half23', roll: true, ms: 1000 }, { run: 'R2', to: 'half23', ms: 1000 }, { field: 'SS', to: 'holeSS' }],
    [{ out: 'R2' }, { say: "Ball hit you: you're out!", who: 'R2' }],
  ],
  'u7-hit-by-ball:1': [
    [{ run: 'R1', to: 'lead1' }, { ball: 'B', to: 'hole12', roll: true, ms: 1000 }, { field: '2B', to: 'hole12', ms: 1000 }, { say: 'Let it go by in front!', who: 'R1' }],
    [{ run: 'R1', to: { x: 126, y: 70 } }, { say: 'Go behind the fielder!', who: 'R1' }],
    [{ run: 'R1', to: 2 }, { run: 'B', to: 1 }, { ball: '2B', to: '1B' }],
    [{ safe: 'R1' }, { out: 'B' }],
  ],

  // u7-avoid-contact: slide or go around, never run the catcher over
  'u7-avoid-contact:0': [
    [{ run: 'R3', to: 'half3H' }, { field: 'C', to: { x: 96, y: 140 } }, { ball: 'SS', to: 'C' }],
    [{ say: 'Slide or go around!', who: 'R3' }],
    [{ run: 'R3', to: { x: 84, y: 150 } }],
    [{ run: 'R3', to: 'home' }],
  ],

  // u7-turn-back-foul: turn back on the foul side; overthrow = go
  'u7-turn-back-foul:0': [
    [{ ball: 'B', to: 'SS', roll: true }],
    [{ run: 'B', to: 1, ms: 900 }, { ball: 'SS', to: '1B', ms: 1000 }],
    [{ run: 'B', to: PAST1 }, { safe: 'B' }],
    [{ run: 'B', to: FOUL1 }, { say: 'Turn to the foul side!', who: 'B' }],
    [{ run: 'B', to: 1 }],
  ],
  'u7-turn-back-foul:1': [
    [{ ball: 'B', to: 'SS', roll: true }],
    [{ run: 'B', to: 1, ms: 900 }, { ball: 'SS', to: 'foul1', ms: 900 }],
    [{ run: 'B', to: PAST1 }, { say: 'Overthrow: go!', who: 'B' }],
    [{ run: 'B', to: 2 }, { field: '1B', to: 'foul1' }],
    [{ safe: 'B' }],
  ],
  'u7-turn-back-foul:2': [
    [{ ball: 'B', to: 'SS', roll: true }],
    [{ run: 'B', to: 1, ms: 900 }, { ball: 'SS', to: '1B', ms: 1000 }],
    [{ run: 'B', to: PAST1 }],
    [{ run: 'B', to: { x: 138, y: 94 } }, { say: 'Turned toward second...', who: 'B' }],
    [{ field: '1B', to: 'B' }, { out: 'B' }],
  ],

  // u7-hidden-ball: stay on the bag until you know where the ball is
  'u7-hidden-ball:0': [
    [{ field: 'SS', to: { x: 92, y: 64 } }, { say: 'Where is the ball?', who: 'R2' }],
    [{ say: 'Foot stays on the bag!', who: 'R2' }],
    [{ safe: 'R2' }],
  ],
  'u7-hidden-ball:1': [
    [{ run: 'R1', to: 'lead1' }],
    [{ field: '1B', to: 'b1' }, { ball: 'P', to: 'b1' }, { run: 'R1', to: 'back' }],
    [{ say: 'Time, please?', who: 'R1' }],
    [{ say: 'Wait till the ump says "Time!"', who: 'R1' }],
  ],
  'u7-hidden-ball:2': [
    [{ field: '3B', to: { x: 60, y: 100 } }, { say: 'Who has the ball?', who: 'R3' }],
    [{ say: 'Not sure? Stay on the bag!', who: 'R3' }],
    [{ safe: 'R3' }],
  ],

  // u7-tag-rules: tag-ups on any caught ball, go at the first touch; foul tip = strike
  'u7-tag-rules:0': [
    [{ ball: 'B', to: 'gapLC', fly: true, ms: 1500 }, { field: 'LF', to: 'gapLC', ms: 1500 }, { field: 'CF', to: { x: 74, y: 22 }, ms: 1500 }, { say: 'Tag up!', who: 'R3' }],
    [{ ball: 'LF', to: 'CF', fly: true, ms: 500 }, { run: 'R3', to: 'home', ms: 1100 }, { say: 'Go at the first touch!', who: 'R3' }],
    [{ safe: 'R3' }],
  ],
  'u7-tag-rules:1': [
    [{ ball: 'B', to: 'foul1', fly: true, ms: 1400 }, { field: '1B', to: 'foul1', ms: 1400 }, { say: 'Caught foul? Tag up!', who: 'R1' }],
    [{ run: 'R1', to: 2, ms: 1000 }, { field: 'SS', to: 'b2' }, { ball: '1B', to: 'b2', ms: 1200 }],
    [{ safe: 'R1' }],
  ],
  'u7-tag-rules:2': [
    [{ run: 'R1', to: 'half12', ms: 700 }, { ball: 'P', to: 'C', ms: 700 }],
    [{ run: 'R1', to: 2, ms: 900 }, { field: 'SS', to: 'b2' }, { ball: 'C', to: 'b2', ms: 1000 }, { say: 'Foul tip = strike. Keep going!', who: 'R1' }],
    [{ safe: 'R1' }],
  ],

  // u7-ifr-runner: infield fly = batter out, no force; only R1 = no infield fly
  'u7-ifr-runner:0': [
    [{ ball: 'B', to: 'SS', fly: true, ms: 1400 }, { run: 'R1', to: 'lead1' }, { run: 'R2', to: 'lead2' }],
    [{ say: 'Infield fly! Batter is out.' }, { out: 'B' }],
    [{ run: 'R1', to: 'back' }, { run: 'R2', to: 'back' }, { say: 'No force: stay put!', who: 'R2' }],
  ],
  'u7-ifr-runner:1': [
    [{ ball: 'B', to: '2B', fly: true, ms: 1400 }, { run: 'B', to: 1, ms: 1400 }, { run: 'R1', to: 'lead1' }, { say: 'Pop-up? Still RUN hard!', who: 'B' }],
    [{ say: 'Only runner on 1st: no infield fly!' }],
  ],
  'u7-ifr-runner:2': [
    [{ ball: 'B', to: '2B', fly: true, ms: 1400 }, { run: 'R1', to: 'lead1' }, { run: 'R2', to: 'lead2' }],
    [{ say: 'Infield fly! Batter is out.' }, { out: 'B' }],
    [{ ball: '2B', to: { x: 130, y: 80 }, roll: true, ms: 400 }, { say: 'Dropped! Go at your own risk.', who: 'R2' }],
    [{ run: 'R2', to: 3 }],
    [{ safe: 'R2' }],
  ],

  // u7-dp-slide: slide straight into the bag legally, or get out of the way
  'u7-dp-slide:0': [
    [{ ball: 'B', to: 'SS', roll: true }, { run: 'R1', to: { x: 108, y: 66 } }, { field: '2B', to: 'b2' }, { run: 'B', to: { x: 118, y: 132 } }],
    [{ ball: 'SS', to: '2B' }, { run: 'R1', to: 2, ms: 400 }, { say: 'Slide straight into the bag!', who: 'R1' }],
  ],
  'u7-dp-slide:1': [
    [{ ball: 'B', to: 'SS', roll: true }, { run: 'R1', to: 'half12' }, { field: '2B', to: 'b2' }, { run: 'B', to: { x: 118, y: 132 } }],
    [{ ball: 'SS', to: '2B' }, { out: 'R1' }],
    [{ run: 'R1', to: { x: 126, y: 62 } }, { ball: '2B', to: '1B' }, { run: 'B', to: 1 }, { say: 'Get out of the way!', who: 'R1' }],
  ],
  'u7-dp-slide:2': [
    [{ ball: 'B', to: 'SS', roll: true }, { run: 'R1', to: { x: 108, y: 66 } }, { field: '2B', to: 'b2' }, { run: 'B', to: { x: 118, y: 132 } }],
    [{ ball: 'SS', to: '2B' }, { run: 'R1', to: 2, ms: 400 }, { say: 'No crashing: slide to the bag!', who: 'R1' }],
  ],

  // u7-no-free-dp: stop and make him chase you, don't run back to first
  'u7-no-free-dp:0': [
    [{ ball: 'B', to: 'half12', roll: true }, { field: '2B', to: 'half12' }, { run: 'R1', to: { x: 134, y: 94 } }, { run: 'B', to: { x: 118, y: 132 } }],
    [{ say: 'Stop! Make him chase you!', who: 'R1' }],
    [{ field: '2B', to: 'R1', ms: 900 }, { run: 'B', to: 1, ms: 900 }],
    [{ out: 'R1' }, { safe: 'B' }],
  ],
  'u7-no-free-dp:1': [
    [{ ball: 'B', to: 'half12', roll: true }, { field: '2B', to: 'half12' }, { run: 'R1', to: { x: 134, y: 94 } }, { run: 'B', to: { x: 118, y: 132 } }],
    [{ say: "Don't run back: stop here!", who: 'R1' }],
    [{ field: '2B', to: 'R1', ms: 900 }, { run: 'B', to: 1, ms: 900 }],
    [{ out: 'R1' }, { safe: 'B' }],
  ],

  // u7-third-base-risk: only go to third if you're sure
  'u7-third-base-risk:0': [
    [{ ball: 'B', to: 'holeSS', roll: true }, { field: 'SS', to: 'holeSS' }, { run: 'R2', to: { x: 88, y: 70 } }, { run: 'B', to: 1, ms: 1200 }],
    [{ run: 'R2', to: 'back' }, { say: 'Two outs: stay at second!', who: 'R2' }],
    [{ safe: 'R2' }],
  ],
  'u7-third-base-risk:1': [
    [{ run: 'R2', to: 'lead2' }, { say: 'No risk. Next batter moves me up.', who: 'R2' }],
    [{ ball: 'B', to: '2B', roll: true }],
    [{ run: 'R2', to: 3 }, { run: 'B', to: 1, ms: 1000 }, { ball: '2B', to: '1B', ms: 900 }],
    [{ safe: 'R2' }, { out: 'B' }],
  ],
  'u7-third-base-risk:2': [
    [{ run: 'R2', to: 'lead2' }, { say: 'Plan it now: third or stay?', who: 'R2' }],
    [{ ball: 'B', to: '2B', roll: true }, { say: 'Behind me: go!', who: 'R2' }],
    [{ run: 'R2', to: 3 }, { run: 'B', to: 1, ms: 1000 }, { ball: '2B', to: '1B', ms: 900 }],
    [{ safe: 'R2' }],
  ],

  // u7-run-home-hard: with two outs, sprint until you touch home
  'u7-run-home-hard:0': [
    [{ ball: 'B', to: 'shallowCF' }, { field: 'CF', to: 'shallowCF' }, { run: 'R2', to: 3 }, { run: 'B', to: 1 }],
    [{ run: 'R2', to: { x: 74, y: 124 }, ms: 1200 }, { run: 'B', to: { x: 108, y: 66 }, ms: 1200 }, { field: 'SS', to: 'b2' }, { ball: 'CF', to: 'b2', ms: 1000 }],
    [{ field: 'SS', to: 'B' }, { out: 'B' }, { say: 'Third out!' }],
    [{ run: 'R2', to: 'home' }, { say: "Too late: run doesn't count!", who: 'R2' }],
  ],
  'u7-run-home-hard:1': [
    [{ ball: 'B', to: 'shallowLF' }, { field: 'LF', to: 'shallowLF' }, { run: 'R3', to: 'home', ms: 900 }, { run: 'B', to: 1 }, { say: 'Sprint all the way home!', who: 'R3' }],
    [{ safe: 'R3' }],
  ],
};

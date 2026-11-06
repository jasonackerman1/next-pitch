// Game IQ content — units → concepts → variants. Every concept is ONE idea Owen needs to
// know; its variants test that same idea with different wording, a different format, or a
// different situation, so he can't pass by memorizing a single card. The engine (iq.js)
// rotates variants and shuffles answer order every time a concept comes back.
//
// Card shape:
//   { sit, prompt, choices: [correct, wrong, wrong, ...] }   — choices[0] is always the right
//                                                               answer; the engine shuffles them
//   { sit, prompt, tf: true|false }                          — True/False card, fixed order
//   sit (optional): { balls, strikes, outs, runners: [1,2,3], you: 'batter'|'onDeck'|'runner1'|
//                     'runner2'|'runner3'|'P'|'C'|'1B'|'2B'|'SS'|'3B'|'LF'|'CF'|'RF' }
//   { sit, prompt, ask, targets: [right, wrong, ...] }       — answered ON the field (needs sit):
//       ask: { drag: 'YOU' }               drag Skip to his spot
//            { drag: 'R2' }                drag a runner (R1/R2/R3/B) to where he ends up
//            { drag: 'ball', from: 'RF' }  drag the ball from whoever has it to where it goes
//            { tap: true }                 tap the right player (targets are players)
//       targets: [{ at, label }]  at = a base (b1 b2 b3 home), a field spot (js/field.js SPOTS),
//       a player id, or { x, y }; label = how the answer is said ("Cover second base").
//   Add new variants at the END of a concept (plays and voice clips are keyed by position).
//
// Concept fields:
//   source: 'ghvbl' = checked against the GHVBL 11U/12U rulebook (NFHS-based);
//           'fundamental' = standard baseball fundamentals, still to be skimmed by his coach
//   realPlay: true = built from something that actually happened in one of Owen's games
//   coachCheck: a note for the coach — something to confirm before trusting the card
//
// Units with no concepts yet show on the path as "coming soon". releaseDate (YYYY-MM-DD,
// optional) holds a finished unit back until that day — the winter "content drop" lever.
//
// All card text is original. Ideas from the books Jay is collecting go in as new concepts
// written in our own words — never copied text.

export const IQ_UNITS = [
  {
    id: 'u1',
    title: 'Awareness',
    subtitle: 'On deck, in the box, in the dugout',
    concepts: [
      {
        id: 'u1-ondeck-rule',
        title: 'On deck only where it\'s allowed',
        source: 'ghvbl',
        why: 'In your league you can only be on deck in an ENCLOSED on-deck area. No fenced-in area? Wait in the dugout with your helmet on.',
        variants: [
          {
            prompt: 'You\'re up after this batter. This field has no fenced-in on-deck area. Where do you wait?',
            choices: ['In the dugout, helmet on, ready to go', 'Next to home plate so you can see the pitches', 'Along the fence by the third-base line', 'Anywhere, as long as you stay quiet'],
          },
          {
            prompt: 'True or false: In your league, you can always warm up in an on-deck circle, even if it isn\'t fenced in.',
            tf: false,
          },
          {
            prompt: 'This field has an on-deck area fenced in next to your dugout. You\'re next. Where should you be?',
            choices: ['In the fenced-in on-deck area, getting loose', 'In the dugout — on deck is never allowed', 'Standing by the umpire', 'Halfway down the baseline'],
          },
          {
            sit: { outs: 1, you: 'onDeck' },
            prompt: 'You\'re up after this batter, and this field has no fenced-in on-deck area. Drag Skip to where you go.',
            ask: { drag: 'YOU' },
            targets: [
              { at: 'dugout1', label: 'In the dugout, helmet on' },
              { at: { x: 148, y: 162 }, label: 'Stay out here in the on-deck spot' },
              { at: { x: 118, y: 156 }, label: 'Next to home plate to see the pitches' },
              { at: 'foul3', label: 'Along the fence by the third-base line' },
            ],
          },
        ],
      },
      {
        id: 'u1-live-ball',
        title: 'Stepping out doesn\'t stop the play',
        source: 'fundamental',
        realPlay: true,
        coachCheck: 'Which way does he want a batter to move when a runner is stealing home?',
        why: 'The ball stays live until the umpire calls time. A runner who runs into you can be called out — so ask for time before stepping out, and always know where the runners are.',
        variants: [
          {
            sit: { balls: 1, strikes: 0, outs: 1, runners: [3], you: 'batter' },
            prompt: 'Runner on third. You step out of the box between pitches. Is the ball still live?',
            choices: ['Yes — unless the umpire calls time, the play can keep going', 'No — stepping out pauses the game', 'Only while the pitcher is on the mound', 'Only with two outs'],
          },
          {
            sit: { balls: 1, strikes: 1, outs: 1, runners: [3], you: 'batter' },
            prompt: 'Runner on third. You want to step out and take a couple of practice swings. What\'s the smart move?',
            choices: ['Ask the umpire for time first, and stay right by the box', 'Walk off toward the third-base line for some room', 'Take your swings out in front of home plate', 'Just do it — nothing happens between pitches'],
          },
          {
            sit: { balls: 2, strikes: 1, outs: 0, runners: [3], you: 'batter' },
            prompt: 'You\'re out of the box and suddenly everybody\'s yelling — the runner on third is stealing home. What\'s your first job?',
            choices: ['Find the runner and get clear of his path — don\'t drift into it', 'Run toward him to help', 'Freeze right where you are, even if it\'s on the line', 'Pick up your bat and walk to the dugout'],
          },
        ],
      },
      {
        id: 'u1-traffic-cop',
        title: 'On deck, you\'re the traffic cop',
        source: 'fundamental',
        coachCheck: 'Who signals the runner at the plate when there\'s no on-deck area?',
        why: 'If you\'re on deck and a runner is coming home, get behind the plate and signal him: both hands down means slide, both hands up means stand up.',
        variants: [
          {
            sit: { outs: 1, runners: [2], you: 'onDeck' },
            prompt: 'You\'re on deck. Base hit — the runner from second is coming home and the throw\'s coming in. What do you do?',
            choices: ['Get behind home plate and signal him: down to slide, up to stand', 'Stay where you are and cheer', 'Run out and grab the batter\'s helmet', 'Yell for him to stop at third'],
          },
          {
            sit: { outs: 0, runners: [3], you: 'onDeck' },
            prompt: 'You\'re signaling a runner coming home. The throw is going to be close. What signal do you give?',
            choices: ['Both hands down — slide!', 'Both hands up — stand up', 'Point back to third base', 'No signal — he can see it himself'],
          },
          {
            sit: { outs: 2, runners: [3], you: 'onDeck' },
            prompt: 'The ball got past everybody and there\'s no throw coming home. What do you signal the runner?',
            choices: ['Hands up — stand up, no need to slide', 'Hands down — slide', 'Wave him back to third', 'Nothing — just watch'],
          },
          {
            sit: { outs: 1, runners: [2], you: 'onDeck' },
            prompt: 'You\'re on deck. Base hit to left, and the runner from second is rounding third with the throw coming home. Drag Skip to where you go.',
            ask: {
              drag: 'YOU',
              setup: [
                [
                  { ball: 'B', to: 'shallowLF', roll: true },
                  { field: 'LF', to: 'shallowLF' },
                  { run: 'B', to: 1 },
                  { run: 'R2', to: 3 },
                ],
              ],
            },
            targets: [
              { at: { x: 114, y: 168 }, label: 'Behind home plate, to signal the runner' },
              { at: { x: 148, y: 162 }, label: 'Stay in the on-deck spot' },
              { at: 'foul3', label: 'Out by third base to wave him in' },
            ],
          },
        ],
      },
      {
        id: 'u1-situation',
        title: 'Know the situation',
        source: 'fundamental',
        why: 'Before every pitch, know four things: outs, count, runners, and score. They decide what you do the second the ball moves.',
        variants: [
          {
            prompt: 'Before you step in to hit, what do you need to know?',
            choices: ['Outs, count, runners, and score', 'Just the count', 'Who\'s pitching next inning', 'How many hits you have today'],
          },
          {
            sit: { outs: 2, runners: [2], you: 'RF' },
            prompt: 'Two outs, runner on second, you\'re in right. Ground-ball single to you. Why does "two outs" matter?',
            choices: ['The runner took off on contact, so he\'s trying to score — your throw has to go home', 'It doesn\'t — every play is the same', 'With two outs you always throw to second', 'You can hold the ball — the inning\'s almost over'],
          },
          {
            prompt: 'True or false: You only need to check the outs when you\'re playing defense.',
            tf: false,
          },
          {
            sit: { outs: 2, runners: [2], you: 'RF' },
            prompt: 'Two outs, runner on second. Ground-ball single to you in right, and the runner never stopped. Drag the ball to where your throw goes.',
            ask: {
              drag: 'ball',
              from: 'YOU',
              setup: [
                [
                  { ball: 'B', to: 'shallowRF', roll: true },
                  { field: 'YOU', to: 'shallowRF' },
                  { run: 'R2', to: 3 },
                  { run: 'B', to: 1 },
                ],
              ],
            },
            targets: [
              { at: 'home', label: 'Home plate, to stop the run' },
              { at: 'b2', label: 'Second base' },
              { at: 'b3', label: 'Third base' },
            ],
          },
        ],
      },
      {
        id: 'u1-signs',
        title: 'Get the sign every pitch',
        source: 'fundamental',
        why: 'Look for the sign before every pitch. Missed it? Ask the umpire for time and look again. Never guess.',
        variants: [
          {
            sit: { balls: 0, strikes: 0, outs: 0, runners: [1], you: 'batter' },
            prompt: 'You stepped in and realize you didn\'t see the third-base coach\'s sign. What do you do?',
            choices: ['Ask the umpire for time and look again', 'Swing away — you\'ll figure it out', 'Guess what he probably called', 'Ask the catcher'],
          },
          {
            prompt: 'When should you look for the sign?',
            choices: ['Before every pitch', 'Only before the first pitch', 'Only when there are runners on', 'Only when the coach yells your name'],
          },
          {
            prompt: 'True or false: If you THINK the sign was bunt but you\'re not sure, it\'s better to guess than to ask for time.',
            tf: false,
          },
        ],
      },
      {
        id: 'u1-study-pitcher',
        title: 'Your at-bat starts in the dugout',
        source: 'fundamental',
        why: 'Watch the pitcher before it\'s your turn: how hard he throws, what he throws on the first pitch, and when his move starts. That helps you hit AND steal.',
        variants: [
          {
            prompt: 'You hit in two batters. Best use of that time?',
            choices: ['Watch the pitcher — his speed, his first pitches, his timing', 'Grab a snack — your turn\'s not up yet', 'Talk with a teammate about something else', 'Fix your batting gloves until it\'s your turn'],
          },
          {
            prompt: 'You notice this pitcher throws a fastball for strike one almost every time. What does that tell you?',
            choices: ['Be ready to swing at a good first-pitch fastball', 'Always take the first pitch', 'He\'ll throw a curveball next', 'Nothing — every pitch is random'],
          },
          {
            prompt: 'Why watch the pitcher\'s windup from the dugout?',
            choices: ['So you know his timing — for hitting AND for stealing', 'So you can copy his windup', 'So you can tell the umpire when he balks', 'There\'s no real reason to'],
          },
        ],
      },
      {
        id: 'u1-hustle',
        title: 'Hustle is free',
        source: 'fundamental',
        why: 'Run on and off the field every inning. It takes zero talent, it keeps the game moving, and coaches notice.',
        variants: [
          {
            sit: { outs: 3, you: 'LF' },
            prompt: 'Third out is made and you\'re in left field. What now?',
            choices: ['Run in hard — the next half inning starts fast', 'Walk in and talk with the center fielder', 'Wait for the coach to wave you in', 'Stay out there and play catch'],
          },
          {
            prompt: 'True or false: Hustling on and off the field takes no talent.',
            tf: true,
          },
          {
            prompt: 'You made the last out of the inning. What do you do?',
            choices: ['Grab your glove and hustle out to your position', 'Sit in the dugout for a minute', 'Argue the call with the umpire', 'Walk out slowly — you\'re upset'],
          },
        ],
      },
    ],
  },
  {
    id: 'u2',
    title: 'Count Smarts',
    subtitle: 'At the plate',
    concepts: [
      {
        id: 'u2-twostrike-bunt',
        title: 'Two strikes changes the bunt',
        source: 'ghvbl',
        realPlay: true,
        why: 'With two strikes, a bunt that goes foul is strike three — and so is a missed bunt. If you show bunt with two strikes, be ready to pull the bat back on a bad pitch.',
        variants: [
          {
            sit: { balls: 0, strikes: 2, outs: 1, you: 'batter' },
            prompt: 'Count is 0-2. You square to bunt to throw off the pitcher, then bunt the pitch foul. What happens?',
            choices: ['Strike three — you\'re out', 'Just a foul ball — still 0-2', 'It\'s called a ball', 'You get a do-over'],
          },
          {
            sit: { balls: 1, strikes: 2, outs: 0, you: 'batter' },
            prompt: '1-2 count. You show bunt and the pitch is up at your eyes. What do you do?',
            choices: ['Pull the bat back and take it', 'Bunt it — you\'re already squared', 'Pull back and swing away', 'Reach up and bunt it high'],
          },
          {
            sit: { balls: 2, strikes: 2, outs: 2, you: 'batter' },
            prompt: 'True or false: With two strikes, if you try to bunt and miss, it\'s strike three.',
            tf: true,
          },
        ],
      },
      {
        id: 'u2-high-bunt',
        title: 'Only bunt strikes',
        source: 'fundamental',
        why: 'High pitches pop up when you bunt them. Start the bat at the top of the strike zone — anything above the bat is a ball, so pull back.',
        variants: [
          {
            prompt: 'You\'re squaring to bunt. Where should the bat start?',
            choices: ['At the top of the strike zone, so anything above it is a ball', 'Down at your knees', 'Back behind your shoulder', 'It doesn\'t matter'],
          },
          {
            sit: { balls: 1, strikes: 0, outs: 0, runners: [1], you: 'batter' },
            prompt: 'Sacrifice bunt sign, runner on first. The pitch comes in above your bat. What do you do?',
            choices: ['Pull back and take it — high pitches pop up', 'Bunt it — the sign is the sign', 'Jump and bunt it', 'Swing away instead'],
          },
          {
            prompt: 'True or false: Bunting a high pitch usually makes a pop-up.',
            tf: true,
          },
        ],
      },
      {
        id: 'u2-twostrike-approach',
        title: 'Two-strike approach',
        source: 'fundamental',
        why: 'With two strikes, choke up a little, widen your zone, and fight off close pitches. Make the pitcher beat you — don\'t get caught looking.',
        variants: [
          {
            sit: { balls: 1, strikes: 2, outs: 1, you: 'batter' },
            prompt: '1-2 count. The pitch is just off the corner — close enough to be called a strike. What do you do?',
            choices: ['Protect — swing and foul it off if you have to', 'Take it — it might be a ball', 'Show bunt', 'Step out of the box'],
          },
          {
            sit: { balls: 0, strikes: 2, outs: 0, you: 'batter' },
            prompt: 'Which is a smart two-strike adjustment?',
            choices: ['Choke up a little and focus on contact', 'Swing harder for a home run', 'Only swing at a perfect pitch', 'Move way off the plate'],
          },
          {
            prompt: 'True or false: With two strikes, fouling off tough pitches is a win for the hitter.',
            tf: true,
          },
        ],
      },
      {
        id: 'u2-hitters-count',
        title: 'Ahead in the count',
        source: 'fundamental',
        why: 'Ahead in the count (2-0, 3-1), the pitcher needs a strike. Look for YOUR pitch — and if you get it, swing hard. If you don\'t, take it.',
        variants: [
          {
            sit: { balls: 2, strikes: 0, outs: 1, you: 'batter' },
            prompt: '2-0 count. The pitcher needs a strike. What are you looking for?',
            choices: ['Your pitch — a fastball in your zone — and swing hard if you get it', 'Anything close — just make contact', 'Nothing — take until you get a strike', 'A pitch to bunt'],
          },
          {
            sit: { balls: 3, strikes: 1, outs: 2, you: 'batter' },
            prompt: '3-1. Low curveball, off the plate. What do you do?',
            choices: ['Take it — it\'s not your pitch, and it\'s ball four', 'Swing — you\'re ahead in the count', 'Bunt it', 'Swing to protect the plate'],
          },
          {
            prompt: 'Who has the advantage in a 2-0 count?',
            choices: ['The hitter', 'The pitcher', 'The catcher', 'Nobody'],
          },
        ],
      },
      {
        id: 'u2-three-oh',
        title: '3-0 means take',
        source: 'fundamental',
        why: 'On 3-0 you take the pitch — unless your coach gives you the green light. The green light means you MAY swing at a pitch you can drive, not that you have to.',
        variants: [
          {
            sit: { balls: 3, strikes: 0, outs: 0, you: 'batter' },
            prompt: '3-0. Fastball right down the middle. No green light from your coach. What do you do?',
            choices: ['Take it', 'Swing hard — it\'s right there', 'Bunt it', 'Ask the catcher what\'s coming'],
          },
          {
            sit: { balls: 3, strikes: 0, outs: 1, runners: [2], you: 'batter' },
            prompt: '3-0, and your coach gives you the green light. What does that mean?',
            choices: ['You can swing if it\'s a pitch you can drive', 'You have to swing no matter what', 'You have to take', 'You should bunt'],
          },
          {
            prompt: 'True or false: On 3-0, you take the pitch unless your coach tells you otherwise.',
            tf: true,
          },
        ],
      },
      {
        id: 'u2-dropped-k',
        title: 'Dropped third strike',
        source: 'ghvbl',
        why: 'If the catcher doesn\'t catch strike three, you can run to first — but only if first base is empty OR there are two outs. Otherwise you\'re out.',
        variants: [
          {
            sit: { balls: 1, strikes: 2, outs: 0, runners: [], you: 'batter' },
            prompt: 'Nobody on, no outs. You swing at strike three in the dirt and the catcher can\'t catch it. What do you do?',
            choices: ['Run to first — hard', 'Walk back to the dugout', 'Wait for the umpire to tell you', 'Ask for another pitch'],
          },
          {
            sit: { balls: 2, strikes: 2, outs: 1, runners: [1], you: 'batter' },
            prompt: 'Runner on first, one out. Strike three gets past the catcher. Can you run to first?',
            choices: ['No — first base is taken and there aren\'t two outs, so you\'re out', 'Yes — always run on a dropped third strike', 'Only if it rolls all the way to the backstop', 'Yes, and the runner has to go back'],
          },
          {
            sit: { balls: 0, strikes: 2, outs: 2, runners: [1], you: 'batter' },
            prompt: 'Runner on first, TWO outs. Strike three bounces away from the catcher. Can you run?',
            choices: ['Yes — with two outs you can run even with first base taken', 'No — first base is taken', 'Only if the umpire points at you', 'Only if you swung'],
          },
          {
            sit: { balls: 1, strikes: 2, outs: 2, runners: [1, 2], you: 'batter' },
            prompt: 'Runners on first and second, two outs. You swing at strike three in the dirt and it gets past the catcher. Drag Skip to where you go.',
            ask: {
              drag: 'YOU',
              setup: [{ ball: 'P', to: ['home', 'backstop'] }, { field: 'C', to: 'backstop' }],
            },
            targets: [
              { at: 'b1', label: 'Run hard to first' },
              { at: 'B', label: 'Stay at the plate' },
              { at: 'dugout1', label: 'Walk back to the dugout' },
            ],
          },
          {
            sit: { balls: 2, strikes: 2, outs: 0, runners: [1], you: 'batter' },
            prompt: 'Runner on first, nobody out. Strike three bounces away from the catcher. Drag Skip to where you go.',
            ask: {
              drag: 'YOU',
              setup: [{ ball: 'P', to: ['home', 'backstop'] }, { field: 'C', to: 'backstop' }],
            },
            targets: [
              { at: 'dugout1', label: 'The dugout. First is taken, so you\'re out' },
              { at: 'b1', label: 'Run to first' },
              { at: 'B', label: 'Stay at the plate' },
            ],
          },
        ],
      },
      {
        id: 'u2-dropped-k-third',
        title: 'Dropped third strike, runner on third',
        source: 'fundamental',
        realPlay: true,
        why: 'Strike three gets away with a runner on third? Run hard anyway. The runner threatening home can freeze the defense long enough for you to reach first.',
        variants: [
          {
            sit: { balls: 2, strikes: 2, outs: 1, runners: [3], you: 'batter' },
            prompt: 'Runner on third, one out, first base empty. Strike three gets away from the catcher. What do you do?',
            choices: ['Run hard to first — the defense has to worry about the runner on third too', 'Stay put — only the runner on third can move', 'Walk to the dugout', 'Run toward third to help'],
          },
          {
            sit: { balls: 1, strikes: 2, outs: 0, runners: [3], you: 'runner3' },
            prompt: 'You\'re the runner on third. Strike three gets past the catcher and the batter takes off for first. What does your threat to score do?',
            choices: ['It can freeze the catcher — he has to watch you before he throws to first', 'Nothing — it\'s the batter\'s play', 'It makes you automatically out', 'It sends the batter back to the box'],
          },
          {
            prompt: 'True or false: On a dropped third strike, the batter should run hard even if he thinks he\'ll be thrown out.',
            tf: true,
          },
        ],
      },
      {
        id: 'u2-walk-live',
        title: 'Ball four is a live ball',
        source: 'fundamental',
        why: 'A walk doesn\'t stop the play. Run hard to first, round the bag, and if the defense is asleep, your base coach may send you.',
        variants: [
          {
            sit: { balls: 3, strikes: 1, outs: 1, you: 'batter' },
            prompt: 'Ball four. What do you do?',
            choices: ['Run hard to first and look for a chance to keep going', 'Walk to first — it\'s free', 'Wait for the umpire to wave you on', 'Toss your bat and stroll'],
          },
          {
            prompt: 'True or false: After ball four, the ball is dead and nobody can move up.',
            tf: false,
          },
          {
            sit: { balls: 3, strikes: 2, outs: 2, you: 'batter' },
            prompt: 'You hustle down on ball four and see the catcher lob it back while nobody\'s watching you. What\'s the move?',
            choices: ['Round first and be ready to go if your base coach sends you', 'Stop on the bag and fix your batting gloves', 'Run back toward home', 'Call time out'],
          },
        ],
      },
      {
        id: 'u2-sac-bunt',
        title: 'The sacrifice bunt',
        source: 'fundamental',
        why: 'On a sacrifice, your job is to get the ball on the ground so the runner moves up — even if you\'re out. Square early, bunt strikes only, then run.',
        variants: [
          {
            sit: { balls: 0, strikes: 0, outs: 0, runners: [1], you: 'batter' },
            prompt: 'Sacrifice bunt sign, runner on first, no outs. What\'s the goal?',
            choices: ['Get it down on the ground so the runner reaches second — even if you\'re out', 'Beat the throw to first for a hit', 'Pop it up over the pitcher', 'Bunt it foul on purpose'],
          },
          {
            prompt: 'Best place to put a sacrifice bunt?',
            choices: ['On the ground, away from the pitcher, toward a baseline', 'Right back to the pitcher', 'Up in the air', 'As hard as you can'],
          },
          {
            prompt: 'True or false: On a sacrifice bunt, you\'re out but you still did your job if the runner moves up.',
            tf: true,
          },
          {
            sit: { balls: 0, strikes: 0, outs: 0, runners: [1], you: 'batter' },
            prompt: 'Sacrifice bunt sign, runner on first, nobody out. Here comes a strike. Drag the ball to where your bunt goes.',
            ask: { drag: 'ball', from: 'B', setup: [{ ball: 'P', to: 'B' }] },
            targets: [
              { at: 'bunt1', label: 'On the ground, down the first-base line' },
              { at: 'P', label: 'Right back to the pitcher' },
              { at: 'shallowCF', label: 'Up in the air, over the pitcher' },
            ],
          },
        ],
      },
      {
        id: 'u2-slash-bunt',
        title: 'No slash bunts',
        source: 'ghvbl',
        why: 'In your league (12U and under), showing bunt and then pulling back to SWING is illegal — the batter is out and runners go back. Pulling back to TAKE the pitch is fine.',
        variants: [
          {
            sit: { balls: 1, strikes: 1, outs: 0, runners: [1], you: 'batter' },
            prompt: 'You show bunt, then pull back and swing away. The ball gets through the infield. In your league, what happens?',
            choices: ['You\'re out and the runner goes back — slash bunts aren\'t allowed', 'Base hit!', 'It\'s a foul ball', 'You get a do-over'],
          },
          {
            prompt: 'True or false: In your league, you can show bunt and then pull the bat back to take the pitch.',
            tf: true,
          },
          {
            sit: { balls: 2, strikes: 1, outs: 1, runners: [2], you: 'batter' },
            prompt: 'You\'ve got the bunt sign, but the pitch is way outside. What\'s the right move?',
            choices: ['Pull the bat back and don\'t swing', 'Pull back and swing hard', 'Reach out and bunt it anyway', 'Step across the plate to get it'],
          },
        ],
      },
      {
        id: 'u2-hit-and-run',
        title: 'The hit-and-run',
        source: 'fundamental',
        coachCheck: 'Confirm how his coach signals and teaches the hit-and-run.',
        why: 'On a hit-and-run, the runner takes off with the pitch and the batter MUST swing to protect him, even on a bad pitch. Try to hit it on the ground, ideally where the infielder just left to cover second.',
        variants: [
          {
            sit: { balls: 1, strikes: 1, outs: 0, runners: [1], you: 'batter' },
            prompt: 'Hit-and-run is on. The pitch is low and outside. What do you do?',
            choices: ['Swing and try to put it on the ground — protect the runner', 'Take it, it\'s a ball', 'Bunt it', 'Step out'],
          },
          {
            sit: { balls: 2, strikes: 1, outs: 1, runners: [1], you: 'batter' },
            prompt: 'On a hit-and-run, what kind of hit do you want?',
            choices: ['A ground ball, through the hole a fielder left open', 'A high fly ball', 'A pop-up', 'A foul ball'],
          },
          {
            sit: { balls: 0, strikes: 0, outs: 1, runners: [1], you: 'runner1' },
            prompt: 'You\'re the runner on a hit-and-run. When do you go?',
            choices: ['When the pitcher commits to home — and peek in to see where the ball went', 'After the batter hits it', 'Before the pitcher is set', 'Only if it\'s a strike'],
          },
          {
            sit: { balls: 1, strikes: 1, outs: 0, runners: [1], you: 'batter' },
            prompt: 'Hit-and-run is on. The runner breaks, and the second baseman runs over to cover second. Drag the ball to where you want your hit to go.',
            ask: {
              drag: 'ball',
              from: 'B',
              setup: [[{ run: 'R1', to: 'half12' }, { field: '2B', to: 'b2' }]],
            },
            targets: [
              { at: 'hole12', label: 'On the ground, through the hole he just left' },
              { at: 'holeSS', label: 'On the ground, right at the shortstop' },
              { at: 'shallowCF', label: 'A high fly ball to center' },
              { at: 'foul1', label: 'Foul down the first-base line' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'u11',
    title: 'Hitter\'s IQ',
    subtitle: 'Approach & situational hitting',
    concepts: [
      {
        id: 'u11-first-pitch',
        title: 'Be ready on the first pitch',
        source: 'fundamental',
        coachCheck: 'Does the coach want hitters swinging at a good first-pitch strike, or taking first pitches in some spots?',
        why: 'The first pitch is often a fastball for a strike. Be ready to hit it. If it\'s your pitch, swing. Taking it every time just hands the pitcher a free strike.',
        variants: [
          {
            sit: { balls: 0, strikes: 0, outs: 1, you: 'batter' },
            prompt: 'First pitch: a fastball right down the middle, right where you like it. What do you do?',
            choices: ['Swing. Be ready to hit a good first pitch', 'Take it. Always take the first pitch', 'Square to bunt', 'Step out and call time'],
          },
          {
            prompt: 'True or false: You should take the first pitch every time to see what the pitcher has.',
            tf: false,
          },
          {
            sit: { balls: 0, strikes: 0, outs: 0, you: 'batter' },
            prompt: 'First pitch is a curveball way down in the dirt. What do you do?',
            choices: ['Take it. Being ready doesn\'t mean swinging at a bad pitch', 'Swing. You said you\'d be ready', 'Bunt it', 'Swing to protect the plate'],
          },
        ],
      },
      {
        id: 'u11-your-zone',
        title: 'Hunt your pitch',
        source: 'fundamental',
        coachCheck: 'Some coaches teach 12U hitters to swing at any strike early in the count. Confirm this matches how he teaches it.',
        why: 'Every hitter has a zone where he hits the ball hardest. Early in the count, look for a pitch in YOUR zone. With two strikes, your zone gets bigger and you protect the plate.',
        variants: [
          {
            sit: { balls: 1, strikes: 0, outs: 1, you: 'batter' },
            prompt: '1-0. You hit pitches over the middle best. This pitch is low on the outside corner. It\'s a strike, but not your pitch. What\'s the smart move?',
            choices: ['Take it. Early in the count, wait for your pitch', 'Swing. It\'s a strike', 'Bunt it', 'Swing at anything from now on'],
          },
          {
            prompt: 'When does your hitting zone get bigger?',
            choices: ['With two strikes', 'On the first pitch', 'When you\'re ahead 2-0', 'Never'],
          },
          {
            sit: { balls: 2, strikes: 1, outs: 0, you: 'batter' },
            prompt: '2-1. The pitcher really needs a strike. What should you be thinking?',
            choices: ['Look for my pitch and be ready to drive it', 'Take no matter what', 'Swing at anything', 'Get ready to bunt'],
          },
        ],
      },
      {
        id: 'u11-oh-two',
        title: '0-2: don\'t chase',
        source: 'fundamental',
        why: 'At 0-2 the pitcher doesn\'t need to throw a strike, so he often throws one just off the plate to get you to chase. Foul off pitches that are close, and lay off pitches that are way off the plate.',
        variants: [
          {
            sit: { balls: 0, strikes: 2, outs: 1, you: 'batter' },
            prompt: '0-2. The pitch is a foot outside, in the dirt. What do you do?',
            choices: ['Lay off. It\'s way out of the zone', 'Swing. Two strikes means protect', 'Bunt it', 'Step out of the box'],
          },
          {
            prompt: 'True or false: At 0-2, the pitcher has to throw a strike.',
            tf: false,
          },
          {
            sit: { balls: 0, strikes: 2, outs: 0, you: 'batter' },
            prompt: '0-2. Why might the pitcher throw the next pitch just off the plate?',
            choices: ['To get you to chase a bad pitch', 'He\'s getting tired', 'The umpire told him to', 'He wants to walk you'],
          },
        ],
      },
      {
        id: 'u11-full-count',
        title: 'Full count, two outs',
        source: 'fundamental',
        why: 'With two outs and a full count, a runner who is forced (like a runner on first) runs as soon as the pitcher throws home. Make the pitcher throw a strike, but swing at anything close. A walk or contact keeps the inning alive.',
        variants: [
          {
            sit: { balls: 3, strikes: 2, outs: 2, runners: [1], you: 'batter' },
            prompt: 'Full count, two outs, runner on first. When does the runner take off?',
            choices: ['As soon as the pitcher throws home', 'Only if you hit the ball', 'After the catcher catches it', 'He stays on first'],
          },
          {
            sit: { balls: 3, strikes: 2, outs: 2, runners: [1, 2], you: 'batter' },
            prompt: 'Full count, two outs, runners on first and second. The pitch is just off the corner, close enough to be called a strike. What do you do?',
            choices: ['Protect. Swing at anything that close', 'Take it and hope for ball four', 'Bunt it', 'Step out'],
          },
          {
            prompt: 'True or false: With two outs, a full count and a runner on first, the runner goes on the pitch.',
            tf: true,
          },
        ],
      },
      {
        id: 'u11-runner-third',
        title: 'Runner on third, less than two outs',
        source: 'fundamental',
        coachCheck: 'Whether the runner on third breaks on a ground ball depends on the coach\'s call. Confirm the ground-ball card.',
        why: 'With a runner on third and less than two outs, your job is to get him home. A fly ball to the outfield lets him tag up and score. A ground ball to the middle, with the infield back, usually scores him too. The worst thing you can do is strike out or pop up in the infield.',
        variants: [
          {
            sit: { balls: 1, strikes: 1, outs: 1, runners: [3], you: 'batter' },
            prompt: 'Runner on third, one out. Which result is the WORST for your team?',
            choices: ['Striking out', 'A deep fly ball to center field', 'A ground ball to second with the infield back', 'A walk'],
          },
          {
            sit: { balls: 1, strikes: 0, outs: 0, runners: [3], you: 'batter' },
            prompt: 'Runner on third, no outs, infield playing back. Drag the ball to where you want to hit it to score him.',
            ask: { drag: 'ball', from: 'B', setup: [{ ball: 'P', to: 'B' }] },
            targets: [
              { at: 'deepCF', label: 'A deep fly ball to the outfield' },
              { at: 'upMiddle', label: 'A pop-up in the infield' },
              { at: 'foul3', label: 'A foul pop-up by third' },
            ],
          },
          {
            sit: { balls: 2, strikes: 1, outs: 0, runners: [3], you: 'batter' },
            prompt: 'Runner on third, no outs, infield playing back. You hit a ground ball to the shortstop. What usually happens?',
            choices: ['The runner scores while they throw you out at first', 'The runner is out at home', 'It\'s a double play', 'Nobody moves'],
          },
        ],
      },
      {
        id: 'u11-move-runner',
        title: 'Runner on second, no outs',
        source: 'fundamental',
        coachCheck: 'Does the coach want 12U hitters trying to hit to the right side here, or just hit the ball hard?',
        why: 'With a runner on second and nobody out, a ground ball to the right side moves him to third, where he can score on a fly ball or a ground ball. Even if you\'re out, you did your job. A ground ball to the left side lets the shortstop or third baseman hold him at second.',
        variants: [
          {
            sit: { balls: 1, strikes: 0, outs: 0, runners: [2], you: 'batter' },
            prompt: 'Runner on second, no outs. Drag the ball to where a ground ball moves him to third.',
            ask: { drag: 'ball', from: 'B', setup: [{ ball: 'P', to: 'B' }] },
            targets: [
              { at: 'hole12', label: 'On the ground to the right side' },
              { at: 'holeSS', label: 'On the ground to the shortstop' },
              { at: 'LF', label: 'A fly ball to left' },
            ],
          },
          {
            sit: { balls: 1, strikes: 0, outs: 0, runners: [2], you: 'batter' },
            prompt: 'Runner on second, no outs. You ground out to the second baseman, and the runner goes to third. Was that a good at-bat?',
            choices: ['Yes. You moved him to third with less than two outs', 'No. You made an out', 'Only if he scores', 'No. You should have bunted'],
          },
          {
            prompt: 'True or false: A ground ball to the shortstop is the best way to move a runner from second to third.',
            tf: false,
          },
        ],
      },
      {
        id: 'u11-infield-in',
        title: 'Infield in',
        source: 'fundamental',
        why: 'When the infield moves in to stop a run at home, they have less time to react. A hard ground ball or line drive gets through more often. Hit it hard. A fly ball to the outfield still scores the runner from third.',
        variants: [
          {
            sit: { balls: 1, strikes: 1, outs: 0, runners: [3], you: 'batter' },
            prompt: 'Runner on third, no outs. The infielders move in so they can throw home. What kind of hit beats them?',
            choices: ['A hard ground ball or line drive past them', 'A soft roller to the shortstop', 'A pop-up to second', 'A slow bunt to the pitcher'],
          },
          {
            prompt: 'True or false: A ground ball that would be an easy out with the infield back can get through when the infield plays in.',
            tf: true,
          },
          {
            sit: { balls: 0, strikes: 0, outs: 1, runners: [3], you: 'batter' },
            prompt: 'One out, runner on third, infield in. You hit a high fly ball to deep left field and it\'s caught. What happens?',
            choices: ['The runner tags up and can score after the catch', 'The runner is out too', 'He scores before the catch', 'Nothing. The inning is over'],
          },
        ],
      },
      {
        id: 'u11-make-him-work',
        title: 'Make the pitcher work',
        source: 'fundamental',
        why: 'Every pitch counts toward the pitcher\'s limit. Fouling off tough pitches and laying off balls makes him throw more, wears him down, and can get him out of the game sooner. But working the count never means taking a pitch you can drive.',
        variants: [
          {
            sit: { balls: 2, strikes: 2, outs: 1, you: 'batter' },
            prompt: '2-2. You\'ve fouled off four tough pitches in a row. Is that helping your team?',
            choices: ['Yes. He\'s throwing more pitches and you\'re still alive', 'No. Foul balls don\'t count', 'Only if you get a hit', 'No. It warms him up'],
          },
          {
            prompt: 'Your league has pitch limits. What can happen when a pitcher throws a lot of pitches early in the game?',
            choices: ['He may have to come out of the game sooner', 'Nothing. Limits are per season', 'He gets extra innings', 'Your team loses a strike'],
          },
          {
            sit: { balls: 2, strikes: 0, outs: 0, you: 'batter' },
            prompt: '2-0, and the pitcher has already thrown 60 pitches. Here comes a fastball right down the middle. What do you do?',
            choices: ['Swing. Working the count doesn\'t mean taking your pitch', 'Take it to raise his pitch count', 'Bunt it', 'Step out'],
          },
        ],
      },
      {
        id: 'u11-after-walks',
        title: 'He just walked two in a row',
        source: 'fundamental',
        coachCheck: 'Many coaches have hitters take a strike after back-to-back walks. Confirm the coach\'s rule, or whether he gives a take sign.',
        why: 'When a pitcher just walked a batter or two, he\'s struggling to throw strikes. Many coaches want you to make him throw a strike before you swing. Watch for the take sign, and don\'t help him by chasing.',
        variants: [
          {
            sit: { balls: 0, strikes: 0, outs: 1, runners: [1, 2], you: 'batter' },
            prompt: 'The pitcher just walked two batters in a row. You\'re up, first pitch. What\'s the usual smart move?',
            choices: ['Make him throw a strike. Take unless the coach says swing', 'Swing at the first pitch no matter what', 'Bunt', 'Swing at anything close'],
          },
          {
            prompt: 'True or false: A batter who chases bad pitches helps a pitcher who can\'t find the strike zone.',
            tf: true,
          },
          {
            prompt: 'Why does taking a pitch make sense after back-to-back walks?',
            choices: ['He\'s having trouble throwing strikes, so don\'t bail him out', 'The umpire is tired', 'It\'s against the rules to swing', 'So the runners can rest'],
          },
        ],
      },
      {
        id: 'u11-pitch-smart',
        title: 'Pitch limits',
        source: 'ghvbl',
        coachCheck: 'GHVBL follows Pitch Smart, but the rulebook\'s limit chart is a picture. 85 is Pitch Smart\'s daily max for ages 11 to 12. Confirm.',
        why: 'Your league follows Pitch Smart, a safety rule that protects young arms. For 11- and 12-year-olds the daily max is 85 pitches. If a pitcher reaches his limit in the middle of an at-bat, he may finish that batter, then he comes out.',
        variants: [
          {
            prompt: 'Your league follows Pitch Smart. What\'s the most pitches an 11- or 12-year-old can throw in a day?',
            choices: ['85', '50', '120', 'There\'s no limit'],
          },
          {
            sit: { balls: 1, strikes: 1, outs: 1, you: 'batter' },
            prompt: 'The pitcher reaches his pitch limit in the middle of your at-bat. What happens?',
            choices: ['He can finish pitching to you, then he comes out', 'He has to leave right now, in the middle of the count', 'Your count goes back to 0-0', 'You get a free walk'],
          },
          {
            prompt: 'True or false: Pitch limits are a safety rule to protect young pitchers\' arms.',
            tf: true,
          },
        ],
      },
      {
        id: 'u11-time-pitcher',
        title: 'Time the pitcher',
        source: 'fundamental',
        why: 'Your at-bat starts before you step in. From the dugout or the on-deck area, time his fastball by swinging along with his pitches, and watch what he throws when he\'s ahead. Then you\'re not seeing him for the first time.',
        variants: [
          {
            sit: { balls: 0, strikes: 0, outs: 1, you: 'onDeck' },
            prompt: 'You\'re on deck in the fenced-in on-deck area. What\'s the best use of this time?',
            choices: ['Time his fastball. Swing along with his pitches', 'Wave to your family', 'Practice your bunt grip only', 'Check the scoreboard'],
          },
          {
            prompt: 'The pitcher has thrown a change-up every time he gets ahead 0-1. You\'re up and it\'s 0-1. What should you be ready for?',
            choices: ['A change-up. Stay back and wait on it', 'A fastball for sure', 'A pitchout', 'Nothing. It\'s random'],
          },
          {
            prompt: 'True or false: Watching the pitcher from the dugout can help your at-bat before you ever step in.',
            tf: true,
          },
        ],
      },
      {
        id: 'u11-leadoff',
        title: 'Leading off the inning',
        source: 'fundamental',
        why: 'Leading off, your job is to get on base any way you can: a hit, a walk, a hit by pitch or an error. An inning that starts with a runner on base scores a lot more often than one that starts with an out.',
        variants: [
          {
            sit: { balls: 3, strikes: 1, outs: 0, you: 'batter' },
            prompt: 'You\'re leading off the inning. 3-1, and the pitch is a little outside. What do you do?',
            choices: ['Take it. A walk is a great way to start the inning', 'Swing. Leadoff hitters swing', 'Bunt it', 'Swing to protect the plate'],
          },
          {
            prompt: 'What\'s the leadoff hitter\'s main job?',
            choices: ['Get on base', 'Hit a home run', 'Bunt', 'Strike out swinging, not looking'],
          },
          {
            prompt: 'True or false: Leading off an inning, a walk is almost as good as a single.',
            tf: true,
          },
        ],
      },
    ],
  },
  {
    id: 'u3',
    title: 'Outfield',
    subtitle: 'Left, center & right',
    concepts: [
      {
        id: 'u3-know-before',
        title: 'Know your throw before the pitch',
        source: 'fundamental',
        why: 'Great outfielders decide where the ball is going BEFORE it\'s hit: check outs and runners every pitch. When the ball comes to you, there\'s no time to think — just execute.',
        variants: [
          {
            sit: { outs: 1, runners: [2], you: 'LF' },
            prompt: 'You\'re in left. Runner on second, one out. When should you decide where you\'ll throw a base hit?',
            choices: ['Before the pitch — while you\'re getting set', 'After you field the ball', 'When the coach yells', 'When the runner rounds third'],
          },
          {
            sit: { outs: 0, runners: [1, 3], you: 'RF' },
            prompt: 'Runners on first and third, nobody out. You\'re in right. What should be running through your head before the pitch?',
            choices: ['Outs, where the runners are, and where each kind of hit goes', 'Your next at-bat', 'Whether the pitcher is throwing hard', 'Nothing — just react'],
          },
          {
            prompt: 'True or false: Outfielders should check the outs and runners before EVERY pitch, not just every inning.',
            tf: true,
          },
        ],
      },
      {
        id: 'u3-cutoff',
        title: 'Hit the cutoff man',
        source: 'fundamental',
        why: 'A low, hard throw to the cutoff man\'s chest gets there fast and lets him redirect it. A big rainbow over his head lets every runner move up a base.',
        variants: [
          {
            sit: { outs: 1, runners: [2], you: 'RF' },
            prompt: 'Single to you in right. Runner from second is heading home. Where does your throw go?',
            choices: ['A low, hard throw to the cutoff man lined up toward home', 'A high rainbow all the way to the catcher', 'To first base', 'Hold the ball and run it in'],
          },
          {
            sit: { outs: 0, runners: [1], you: 'LF' },
            prompt: 'You overthrow the cutoff man trying to nail a runner at third. What usually happens?',
            choices: ['The batter takes second because nobody can cut the throw', 'Nothing — it doesn\'t matter', 'The runner has to go back', 'It\'s an automatic out'],
          },
          {
            prompt: 'Where should a throw to the cutoff man arrive?',
            choices: ['Chest high, on a line', 'Over his head so it carries farther', 'On one big bounce in front of him', 'At his feet'],
          },
          {
            sit: { outs: 1, runners: [2], you: 'RF' },
            prompt: 'Single to you in right. The runner from second is rounding third and heading home. Drag the ball to where your throw goes.',
            ask: {
              drag: 'ball',
              from: 'YOU',
              setup: [
                [
                  { ball: 'B', to: 'shallowRF', roll: true },
                  { field: 'YOU', to: 'shallowRF' },
                  { run: 'R2', to: 3 },
                  { run: 'B', to: 1 },
                  { field: '1B', to: { x: 120, y: 112 } },
                ],
              ],
            },
            targets: [
              {
                at: { x: 120, y: 112 },
                label: 'Low and hard to the cutoff man, lined up with home',
              },
              { at: 'home', label: 'A big rainbow all the way home' },
              { at: 'b3', label: 'Third base' },
              { at: 'b2', label: 'Second base' },
            ],
          },
        ],
      },
      {
        id: 'u3-throw-ahead',
        title: 'Throw ahead of the lead runner',
        source: 'fundamental',
        coachCheck: 'Confirm who his team uses as the cutoff to third (usually the shortstop).',
        why: 'Throw to the base in FRONT of the lead runner, never behind him. A throw behind the runner lets him (and everyone else) take an extra base.',
        variants: [
          {
            sit: { outs: 1, runners: [1], you: 'RF' },
            prompt: 'Runner on first. Base hit to right, and the runner is digging hard for third. Where do you throw?',
            choices: ['Toward third, through the cutoff', 'To first, behind the batter', 'To second, where the runner just was', 'To the pitcher'],
          },
          {
            sit: { outs: 0, runners: [1], you: 'CF' },
            prompt: 'Runner on first, line drive single to center. The runner stops at second. Where do you throw?',
            choices: ['Right to second base — keep the batter at first', 'Home', 'Third, even though nobody\'s going', 'To first, to catch the batter rounding'],
          },
          {
            sit: { outs: 1, runners: [1], you: 'LF' },
            prompt: 'True or false: If a runner has already rounded second, throwing behind him to second is a good idea.',
            tf: false,
          },
          {
            sit: { outs: 1, runners: [1], you: 'RF' },
            prompt: 'Runner on first. Base hit to you in right, and the runner is rounding second, digging for third. Drag the ball to where your throw goes.',
            ask: {
              drag: 'ball',
              from: 'YOU',
              setup: [
                [
                  { ball: 'B', to: 'shallowRF', roll: true },
                  { field: 'YOU', to: 'shallowRF' },
                  { run: 'R1', to: 2 },
                  { run: 'B', to: 1 },
                  { field: 'SS', to: { x: 88, y: 88 } },
                  { field: '3B', to: 'b3' },
                ],
              ],
            },
            targets: [
              { at: { x: 88, y: 88 }, label: 'The cutoff man, lined up with third' },
              { at: 'b2', label: 'Second base, where the runner just was' },
              { at: 'b1', label: 'First base, behind the batter' },
            ],
          },
        ],
      },
      {
        id: 'u3-nobody-on',
        title: 'Nobody on, single to you',
        source: 'fundamental',
        why: 'With the bases empty, a single to the outfield gets thrown to second base. That keeps the batter at first and stops him from stretching it into a double.',
        variants: [
          {
            sit: { outs: 1, runners: [], you: 'LF' },
            prompt: 'Bases empty. Ground ball single to you in left. Where does the ball go?',
            choices: ['Into second base', 'To first base', 'Home', 'Hold it and jog it in'],
          },
          {
            sit: { outs: 2, runners: [], you: 'RF' },
            prompt: 'Two outs, nobody on. Single to right. The batter takes a big turn at first. Your throw?',
            choices: ['Hard to second, so he can\'t take it', 'Behind him to first right away', 'Lob it to the pitcher', 'Home, just in case'],
          },
          {
            sit: { outs: 0, runners: [], you: 'CF' },
            prompt: 'True or false: With nobody on, an outfielder should throw a single into second base.',
            tf: true,
          },
          {
            sit: { outs: 1, runners: [], you: 'LF' },
            prompt: 'Bases empty. Ground ball single to you in left, and the batter is rounding first. Drag the ball to where your throw goes.',
            ask: {
              drag: 'ball',
              from: 'YOU',
              setup: [
                [
                  { ball: 'B', to: 'shallowLF', roll: true },
                  { field: 'YOU', to: 'shallowLF' },
                  { run: 'B', to: 1 },
                  { field: 'SS', to: 'b2' },
                ],
              ],
            },
            targets: [
              { at: 'b2', label: 'Into second base' },
              { at: 'b1', label: 'First base, behind the batter' },
              { at: 'home', label: 'Home plate' },
              { at: 'P', label: 'A lob to the pitcher' },
            ],
          },
        ],
      },
      {
        id: 'u3-tag-throw',
        title: 'Runner tagging on a fly ball',
        source: 'fundamental',
        why: 'On a caught fly ball with fewer than two outs, runners can tag and go. Catch it moving toward your target, then throw to the base the lead runner is heading to — through the cutoff. With two outs, the catch ends the inning.',
        variants: [
          {
            sit: { outs: 1, runners: [2], you: 'RF' },
            prompt: 'Runner on second, one out. Medium fly ball to you in right. The runner is tagging. After the catch, where do you throw?',
            choices: ['To third, through the cutoff', 'To second, where he started', 'To first', 'Nowhere — just hold it'],
          },
          {
            sit: { outs: 0, runners: [3], you: 'LF' },
            prompt: 'Runner on third, nobody out. Shallow fly to left and the runner is tagging. What\'s your plan?',
            choices: ['Catch it moving forward and throw home', 'Catch it standing still and throw to second', 'Let it drop so he can\'t tag', 'Throw to third'],
          },
          {
            sit: { outs: 2, runners: [2, 3], you: 'CF' },
            prompt: 'Two outs, runners on second and third. Fly ball to you. You catch it. Now what?',
            choices: ['Jog it in — that\'s the third out, inning over', 'Throw home to stop the tag', 'Throw to third', 'Throw to second'],
          },
          {
            sit: { outs: 0, runners: [3], you: 'LF' },
            prompt: 'Runner on third, nobody out. You catch a shallow fly ball in left, and the runner is tagging. Drag the ball to where your throw goes.',
            ask: {
              drag: 'ball',
              from: 'YOU',
              setup: [
                [
                  { ball: 'B', to: 'shallowLF', fly: true },
                  { field: 'YOU', to: 'shallowLF' },
                  { field: 'C', to: 'home' },
                ],
                [{ out: 'B' }, { say: 'He\'s tagging!', who: 'R3' }],
              ],
            },
            targets: [
              { at: 'home', label: 'Home, ahead of the runner who is tagging' },
              { at: 'b3', label: 'Third base, where he started' },
              { at: 'b2', label: 'Second base' },
            ],
          },
        ],
      },
      {
        id: 'u3-backup',
        title: 'Back up every play',
        source: 'fundamental',
        coachCheck: 'Confirm his team\'s backup assignments match these standard ones.',
        why: 'Every throw can get away. Right field backs up first on infield throws, left field backs up third on throws from the right side, and center backs up second. Running to back up is how outfielders save runs.',
        variants: [
          {
            sit: { outs: 0, runners: [], you: 'RF' },
            prompt: 'Ground ball to the shortstop. You\'re in right. Where do you go?',
            choices: ['Run toward first to back up the throw', 'Stay put — it\'s not your ball', 'Run to second', 'Jog toward the dugout'],
          },
          {
            sit: { outs: 1, runners: [1], you: 'CF' },
            prompt: 'Runner on first is stealing. You\'re in center. What\'s your job?',
            choices: ['Charge in behind second base to back up the catcher\'s throw', 'Watch from where you are', 'Run to third', 'Cover first base'],
          },
          {
            sit: { outs: 1, runners: [1], you: 'LF' },
            prompt: 'Runner on first, single to right field. The right fielder is throwing to third. Where should you be?',
            choices: ['Behind third base, backing up the throw', 'In center field', 'At second base', 'Still in your spot in left'],
          },
          {
            sit: { outs: 0, runners: [], you: 'RF' },
            prompt: 'Ground ball to the shortstop. You\'re in right. Drag Skip to where you go.',
            ask: { drag: 'YOU', setup: [[{ ball: 'B', to: 'SS', roll: true }]] },
            targets: [
              { at: { x: 168, y: 118 }, label: 'Behind first base, backing up the throw' },
              { at: 'RF', label: 'Stay where you are in right' },
              { at: 'b2', label: 'Cover second base' },
            ],
          },
          {
            sit: { outs: 1, runners: [1], you: 'LF' },
            prompt: 'Runner on first. Single to right field, and the right fielder is throwing to third. You\'re in left. Drag Skip to where you go.',
            ask: {
              drag: 'YOU',
              setup: [
                [
                  { ball: 'B', to: 'shallowRF', roll: true },
                  { field: 'RF', to: 'shallowRF' },
                  { run: 'R1', to: 2 },
                  { run: 'B', to: 1 },
                  { field: 'SS', to: 'cut' },
                  { field: '3B', to: 'b3' },
                ],
              ],
            },
            targets: [
              { at: { x: 38, y: 116 }, label: 'Behind third base, backing up the throw' },
              { at: 'LF', label: 'Stay in your spot in left' },
              { at: 'b2', label: 'Cover second base' },
            ],
          },
        ],
      },
      {
        id: 'u3-priority',
        title: 'Call it loud — who has priority',
        source: 'fundamental',
        why: 'Call "I got it!" loud and more than once. The center fielder has priority over the corner outfielders, and outfielders have priority over infielders going back — it\'s easier to catch a ball coming toward you.',
        variants: [
          {
            sit: { outs: 1, runners: [], you: 'RF' },
            prompt: 'Fly ball in the gap between you (right field) and the center fielder. You both call it. Who takes it?',
            choices: ['The center fielder', 'You — you called it first', 'Whoever is closer to the fence', 'The second baseman'],
          },
          {
            sit: { outs: 0, runners: [1], you: 'LF' },
            prompt: 'Pop-up into shallow left. The shortstop is running back, you\'re running in. You call it. Who should catch it?',
            choices: ['You — the outfielder coming in has the easier play', 'The shortstop, because he\'s an infielder', 'Let it drop and play it on a hop', 'Whoever yells last'],
          },
          {
            prompt: 'What\'s the right way to call a fly ball?',
            choices: ['"I got it! I got it!" — loud and early', 'A quick wave of the glove', 'Say nothing and just go get it', 'Yell your teammate\'s name'],
          },
          {
            sit: { outs: 1, runners: [], you: 'RF' },
            prompt: 'Fly ball into the gap between you in right and the center fielder. You both call it. Tap the player who takes it.',
            ask: {
              tap: true,
              setup: [
                [
                  { ball: 'B', to: 'gapRC', fly: true, ms: 1500 },
                  { field: 'CF', to: { x: 124, y: 22 }, ms: 1300 },
                  { field: 'YOU', to: { x: 150, y: 28 }, ms: 1300 },
                  { field: '2B', to: { x: 134, y: 50 }, ms: 1300 },
                ],
              ],
            },
            targets: [
              { at: 'CF', label: 'The center fielder, he has priority' },
              { at: 'YOU', label: 'You, the right fielder' },
              { at: '2B', label: 'The second baseman' },
            ],
          },
          {
            sit: { outs: 0, runners: [1], you: 'LF' },
            prompt: 'Pop-up into shallow left. The shortstop is running back and you\'re running in. Tap the player who should catch it.',
            ask: {
              tap: true,
              setup: [
                [
                  { ball: 'B', to: 'shallowLF', fly: true, ms: 1500 },
                  { field: 'YOU', to: { x: 46, y: 52 }, ms: 1300 },
                  { field: 'SS', to: { x: 64, y: 68 }, ms: 1300 },
                  { field: '3B', to: { x: 52, y: 80 }, ms: 1300 },
                ],
              ],
            },
            targets: [
              { at: 'YOU', label: 'You, the outfielder coming in' },
              { at: 'SS', label: 'The shortstop going back' },
              { at: '3B', label: 'The third baseman' },
            ],
          },
        ],
      },
      {
        id: 'u3-over-head',
        title: 'Ball over your head',
        source: 'fundamental',
        why: 'On a ball hit over you, drop-step (open your hips toward the side the ball is going), turn, and RUN to the spot. Backpedaling is slow and you\'ll fall.',
        variants: [
          {
            sit: { outs: 1, runners: [], you: 'CF' },
            prompt: 'Line drive hit way over your head. What\'s your first move?',
            choices: ['Drop-step, turn, and run to where it\'s coming down', 'Backpedal while watching it', 'Jump straight up', 'Charge in for the hop'],
          },
          {
            prompt: 'True or false: Backpedaling is the fastest way to go back on a fly ball.',
            tf: false,
          },
          {
            sit: { outs: 0, runners: [], you: 'RF' },
            prompt: 'Deep fly ball toward the right-field line, over your head and to your right. Which way do you open up?',
            choices: ['Drop-step with your right foot and turn toward the line', 'Drop-step with your left foot', 'Don\'t turn — shuffle sideways', 'Stay and wait for it to bounce'],
          },
        ],
      },
      {
        id: 'u3-ground-ball',
        title: 'Ground balls: block it or charge it',
        source: 'fundamental',
        why: 'Nobody on, nothing at stake? Get in front and block it so it can\'t get past you. A runner trying to score? Charge it and come up throwing — speed matters more than safety.',
        variants: [
          {
            sit: { outs: 1, runners: [], you: 'LF' },
            prompt: 'Nobody on. Routine ground ball single to left. How do you field it?',
            choices: ['Get in front and drop a knee to block it', 'Charge hard and field it on the run', 'Let it roll to the fence', 'Try to backhand it'],
          },
          {
            sit: { outs: 2, runners: [2], you: 'RF' },
            prompt: 'Two outs, runner on second running on contact. Ground ball single to you. How do you field it?',
            choices: ['Charge it and come up throwing home', 'Drop a knee and block it', 'Wait for it to come to you', 'Throw to first'],
          },
          {
            sit: { outs: 0, runners: [], you: 'CF' },
            prompt: 'True or false: If the ball gets past an outfielder, the runner can take extra bases — so with nobody on, blocking it is the priority.',
            tf: true,
          },
        ],
      },
      {
        id: 'u3-batter-side',
        title: 'Read the hitter',
        source: 'fundamental',
        why: 'Most hitters pull the ball. A left-handed batter pulls toward right field; a right-handed batter pulls toward left. Know who\'s up and expect the ball your way.',
        variants: [
          {
            sit: { outs: 1, runners: [], you: 'RF' },
            prompt: 'A strong left-handed hitter steps in. You\'re in right. What should you expect?',
            choices: ['A lefty usually pulls toward right — be ready for it', 'He\'ll hit it to left field', 'Nothing changes', 'He\'ll bunt'],
          },
          {
            sit: { outs: 0, runners: [], you: 'LF' },
            prompt: 'A big right-handed hitter is up. Which outfielder should be extra ready?',
            choices: ['Left field — righties usually pull that way', 'Right field', 'Nobody — it\'s random', 'Only the center fielder'],
          },
          {
            prompt: 'True or false: Outfielders should notice whether the batter is righty or lefty.',
            tf: true,
          },
          {
            sit: { outs: 0, runners: [], you: 'CF' },
            prompt: 'A big right-handed hitter steps in. Tap the outfielder who should be extra ready for the ball.',
            ask: { tap: true, setup: [{ say: 'Righty up.', who: 'B' }] },
            targets: [
              { at: 'LF', label: 'The left fielder, righties usually pull that way' },
              { at: 'RF', label: 'The right fielder' },
              { at: 'YOU', label: 'You, in center' },
            ],
          },
        ],
      },
      {
        id: 'u3-wall-then-ball',
        title: 'Find the wall, then the ball',
        source: 'fundamental',
        why: 'Know your surroundings before the inning starts: how deep the fence is, where the warning track starts. On a ball over your head, run to the fence FIRST, then find the ball. Searching for the wall while the ball is coming is how you get hurt.',
        variants: [
          {
            sit: { outs: 1, runners: [], you: 'LF' },
            prompt: 'Deep drive toward the left-field fence. What\'s your order?',
            choices: ['Get to the wall first, then find the ball', 'Watch the ball the whole way and hope', 'Stop short and play it off the wall every time', 'Jump early'],
          },
          {
            prompt: 'When should an outfielder check how far away the fence is?',
            choices: ['Before the inning — know your surroundings', 'When the ball is in the air', 'Never', 'After hitting the fence'],
          },
          {
            prompt: 'True or false: Feeling the warning track under your feet tells you the fence is close.',
            tf: true,
          },
        ],
      },
      {
        id: 'u3-drop-the-foul',
        title: 'When NOT to catch it',
        source: 'fundamental',
        why: 'A caught fly lets runners tag. Bottom of the last inning, tie game, runner on third, fewer than two outs: a deep FOUL fly ball should be allowed to drop. Catch it and the runner tags and scores the winning run.',
        variants: [
          {
            sit: { outs: 1, runners: [3], you: 'RF' },
            prompt: 'Bottom of the last inning, tie game, runner on third, one out. Deep foul fly ball near the fence. Catch it?',
            choices: ['No — let it drop foul, or the runner tags and wins it', 'Yes, an out is an out', 'Catch it and throw home', 'Only with a strong arm'],
          },
          {
            sit: { outs: 2, runners: [3], you: 'LF' },
            prompt: 'Same tie game, runner on third, but TWO outs. Foul fly ball. Catch it?',
            choices: ['Yes — that\'s the third out and the inning\'s over', 'No, let it drop', 'Only if it\'s fair', 'Throw your glove at it'],
          },
          {
            sit: { outs: 1, runners: [3], you: 'CF' },
            prompt: 'True or false: Catching a fly ball can sometimes help the other team.',
            tf: true,
          },
        ],
      },
      {
        id: 'u3-meaningless-run',
        title: 'Get it in — don\'t chase a run you can\'t stop',
        source: 'fundamental',
        why: 'If the runner scoring can\'t be stopped (or doesn\'t matter, like when you\'re way ahead), don\'t throw home. Get the ball to the infield fast so the batter and the other runners can\'t take extra bases.',
        variants: [
          {
            sit: { outs: 1, runners: [2, 3], you: 'CF' },
            prompt: 'You\'re up by 8. Single to center. The runner from third will score easily, and the runner from second is rounding third. Where do you throw?',
            choices: ['Into the infield (cutoff/second) to keep the batter at first', 'A rainbow all the way home', 'Hold it', 'To third'],
          },
          {
            sit: { outs: 0, runners: [3], you: 'RF' },
            prompt: 'The runner from third is already crossing home when you pick up the ball. What\'s your throw?',
            choices: ['To second, to keep the batter from advancing', 'Home anyway', 'Nowhere, jog it in', 'To first base'],
          },
          {
            prompt: 'True or false: An outfielder should get the ball back to the infield as fast as possible, every play.',
            tf: true,
          },
          {
            sit: { outs: 0, runners: [3], you: 'RF' },
            prompt: 'Single to right. By the time you pick it up, the runner from third is already crossing home. Drag the ball to where your throw goes.',
            ask: {
              drag: 'ball',
              from: 'YOU',
              setup: [
                [
                  { ball: 'B', to: 'shallowRF', roll: true },
                  { field: 'YOU', to: 'shallowRF' },
                  { run: 'R3', to: 'home' },
                  { run: 'B', to: 1 },
                  { field: '2B', to: 'b2' },
                ],
                [{ safe: 'R3' }],
              ],
            },
            targets: [
              { at: 'b2', label: 'Second base, to hold the batter at first' },
              { at: 'home', label: 'Home anyway' },
              { at: 'b1', label: 'First base' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'u4',
    title: 'First Base',
    subtitle: 'Owning the bag',
    concepts: [
      {
        id: 'u4-get-to-bag',
        title: 'Get to the bag first',
        source: 'fundamental',
        why: 'On any ground ball to another infielder, sprint to first, put your heels on the edge of the bag facing the thrower, and give a target. Then catch it and stretch.',
        variants: [
          {
            sit: { outs: 1, runners: [], you: '1B' },
            prompt: 'Ground ball to the shortstop. You\'re playing first. Your job?',
            choices: ['Sprint to the bag, heels on the edge, face the throw', 'Run toward the shortstop to help', 'Stay where you are', 'Back up the pitcher'],
          },
          {
            sit: { outs: 0, runners: [], you: '1B' },
            prompt: 'Where should your feet be when you set up at the bag for a throw?',
            choices: ['Heels touching the edge of the bag, facing the thrower', 'Standing on top of the bag', 'A step in front of the bag', 'Behind the bag in foul territory'],
          },
          {
            prompt: 'True or false: First basemen should give a target with the glove once they reach the bag.',
            tf: true,
          },
          {
            sit: { outs: 1, runners: [], you: '1B' },
            prompt: 'Ground ball to the shortstop, and the batter is running hard. Drag Skip to where you go.',
            ask: {
              drag: 'YOU',
              setup: [[{ ball: 'B', to: 'SS', roll: true }, { run: 'B', to: { x: 112, y: 128 } }]],
            },
            targets: [
              { at: 'b1', label: 'Sprint to first base and give a target' },
              { at: { x: 84, y: 90 }, label: 'Run toward the shortstop to help' },
              { at: 'b2', label: 'Cover second base' },
              { at: { x: 116, y: 124 }, label: 'Back up the pitcher' },
            ],
          },
        ],
      },
      {
        id: 'u4-stretch',
        title: 'Stretch at the right time',
        source: 'fundamental',
        why: 'Don\'t stretch early. Wait until you see where the throw is going, then step toward it with your glove-side foot while the other foot stays on the bag.',
        variants: [
          {
            sit: { outs: 1, runners: [], you: '1B' },
            prompt: 'Throw coming from third base. When do you stretch?',
            choices: ['When you see where the throw is going', 'Before the fielder even throws', 'Never — stay tall', 'After the ball hits your glove'],
          },
          {
            prompt: 'True or false: Stretching early is a good idea because it makes you longer.',
            tf: false,
          },
          {
            sit: { outs: 0, runners: [], you: '1B' },
            prompt: 'When you stretch for a throw, which foot stays on the bag?',
            choices: ['The foot on your throwing-hand side — you step toward the ball with your glove-side foot', 'Neither — jump to the ball', 'Both feet stay on the bag', 'Whichever is closer to the dugout'],
          },
        ],
      },
      {
        id: 'u4-bad-throw',
        title: 'Bad throw? Leave the bag',
        source: 'fundamental',
        why: 'If the throw is way off, come off the bag and stop it. Missing the out is one base; letting the ball get by you can be two or three.',
        variants: [
          {
            sit: { outs: 1, runners: [2], you: '1B' },
            prompt: 'Runner on second. The throw to you is wide, way up the line toward home. What do you do?',
            choices: ['Come off the bag and stop the ball', 'Keep your foot on the bag and reach', 'Let it go — not your fault', 'Jump for it'],
          },
          {
            sit: { outs: 0, runners: [], you: '1B' },
            prompt: 'True or false: A first baseman should never leave the bag on a throw.',
            tf: false,
          },
          {
            sit: { outs: 2, runners: [3], you: '1B' },
            prompt: 'Two outs, runner on third. The throw to you is in the dirt and wide. What matters most?',
            choices: ['Keep the ball in front of you so the run can\'t score', 'Keep your foot on the bag no matter what', 'Catch it in the air or nothing', 'Turn your head away'],
          },
          {
            sit: { outs: 1, runners: [2], you: '1B' },
            prompt: 'Grounder to third. You get to the bag, but his throw is sailing way up the line toward home. Drag Skip to where you go.',
            ask: {
              drag: 'YOU',
              setup: [
                [
                  { ball: 'B', to: '3B', roll: true },
                  { field: 'YOU', to: 'b1' },
                  { run: 'B', to: { x: 112, y: 128 } },
                ],
              ],
            },
            targets: [
              { at: { x: 130, y: 134 }, label: 'Off the bag and up the line to stop the ball' },
              { at: 'b1', label: 'Keep your foot on the bag and reach' },
              { at: { x: 170, y: 132 }, label: 'Let it go and chase it down behind first' },
            ],
          },
        ],
      },
      {
        id: 'u4-pitcher-cover',
        title: 'Pitcher covering first',
        source: 'fundamental',
        why: 'If a ground ball pulls you away from the bag, the pitcher covers. Field it, then give him a firm underhand toss chest high, a step BEFORE he gets to the bag, so he can catch it and touch.',
        variants: [
          {
            sit: { outs: 1, runners: [], you: '1B' },
            prompt: 'Ground ball to your right pulls you way off the bag. The pitcher is sprinting over. What\'s your throw?',
            choices: ['An underhand toss, chest high, leading him to the bag', 'A hard overhand throw at the bag', 'Run to the bag yourself no matter what', 'Throw to second'],
          },
          {
            prompt: 'When should the toss reach the pitcher covering first?',
            choices: ['A step before the bag, so he can catch it and then touch', 'Right as he lands on the bag', 'After he crosses the bag', 'Doesn\'t matter'],
          },
          {
            sit: { outs: 0, runners: [], you: '1B' },
            prompt: 'True or false: On a ground ball to the first baseman\'s right, the pitcher should run to cover first.',
            tf: true,
          },
          {
            sit: { outs: 1, runners: [], you: '1B' },
            prompt: 'A ground ball to your right pulls you way off the bag. Tap the player who covers first.',
            ask: {
              tap: true,
              setup: [
                [
                  { ball: 'B', to: 'hole12', roll: true },
                  { field: 'YOU', to: 'hole12' },
                  { run: 'B', to: { x: 112, y: 128 } },
                ],
              ],
            },
            targets: [
              { at: 'P', label: 'The pitcher' },
              { at: '2B', label: 'The second baseman' },
              { at: 'C', label: 'The catcher' },
              { at: 'RF', label: 'The right fielder' },
            ],
          },
        ],
      },
      {
        id: 'u4-hold-runner',
        title: 'Holding a runner on',
        source: 'ghvbl',
        coachCheck: 'Confirm his team holds runners at first in these situations.',
        why: 'Your league allows leadoffs and stealing, so with only first base occupied, hold the runner: right foot against the front corner of the bag, glove up as a target for the pitcher. Once the pitch is thrown, shuffle off into fielding position.',
        variants: [
          {
            sit: { balls: 0, strikes: 0, outs: 1, runners: [1], you: '1B' },
            prompt: 'Runner on first, one out. Left-handed batter up. Where do you play?',
            choices: ['Hold him on the bag, then shuffle off into fielding position as the pitch comes', 'Play deep behind the runner — the lefty might pull it at you', 'Stand in front of the bag', 'Play halfway to second'],
          },
          {
            sit: { balls: 1, strikes: 0, outs: 0, runners: [1], you: '1B' },
            prompt: 'You\'re holding the runner. Where are your feet?',
            choices: ['Right foot against the front corner of the bag, facing the pitcher', 'Both feet on top of the bag', 'Behind the runner', 'Straddling the base line'],
          },
          {
            sit: { balls: 0, strikes: 1, outs: 0, runners: [1], you: '1B' },
            prompt: 'True or false: Once the pitcher delivers to the plate, a first baseman holding the runner should hop off into a fielding stance.',
            tf: true,
          },
          {
            sit: { balls: 0, strikes: 0, outs: 1, runners: [1], you: '1B' },
            prompt: 'Runner on first, nobody else on, and he likes to steal. Drag Skip to where you play before the pitch.',
            ask: { drag: 'YOU', setup: [[{ run: 'R1', to: 'lead1' }]] },
            targets: [
              { at: 'b1', label: 'At the bag, holding him on' },
              { at: { x: 142, y: 74 }, label: 'Back, behind the runner' },
              { at: 'bunt1', label: 'Way in for a bunt' },
            ],
          },
        ],
      },
      {
        id: 'u4-play-behind',
        title: 'When NOT to hold the runner',
        source: 'fundamental',
        coachCheck: 'Some teams still hold with first and second. Confirm his team\'s rule.',
        why: 'With runners on first AND second (or bases loaded), the runner on first can\'t steal second because it\'s taken. Play behind him at normal depth and cover more ground.',
        variants: [
          {
            sit: { outs: 1, runners: [1, 2], you: '1B' },
            prompt: 'Runners on first and second. Where do you play?',
            choices: ['Behind the runner at normal depth — no need to hold him', 'Hold the runner on the bag', 'Way in for a bunt', 'Next to second base'],
          },
          {
            sit: { outs: 0, runners: [1, 2, 3], you: '1B' },
            prompt: 'Bases loaded. Do you hold the runner on first?',
            choices: ['No — the base ahead of him is full, play back', 'Yes, always', 'Only with a lefty batter', 'Only with two strikes'],
          },
          {
            sit: { outs: 1, runners: [1, 2], you: '1B' },
            prompt: 'True or false: With first and second occupied, the runner on first is the big stealing threat.',
            tf: false,
          },
          {
            sit: { outs: 1, runners: [1, 2], you: '1B' },
            prompt: 'Runners on first and second. Drag Skip to where you play before the pitch.',
            ask: { drag: 'YOU', setup: [[{ run: 'R1', to: 'lead1' }, { run: 'R2', to: 'lead2' }]] },
            targets: [
              { at: { x: 142, y: 74 }, label: 'Behind the runner at normal depth' },
              { at: 'b1', label: 'At the bag, holding the runner on' },
              { at: 'bunt1', label: 'Way in for a bunt' },
            ],
          },
        ],
      },
      {
        id: 'u4-cutoff',
        title: 'You\'re the cutoff on throws home',
        source: 'fundamental',
        coachCheck: 'Confirm his team\'s cutoff assignments — many teams use the first baseman on throws home from right and center.',
        why: 'On a hit to right or center with a runner trying to score, the first baseman runs to the infield grass and lines up between the outfielder and home plate. Listen to the catcher: "Cut!" or let it go.',
        variants: [
          {
            sit: { outs: 1, runners: [2], you: '1B' },
            prompt: 'Runner on second. Single to right field and the runner is heading home. Where do you go?',
            choices: ['To the infield grass, lined up between the right fielder and home', 'Stay on first base', 'Run to back up the catcher', 'Go out to right field'],
          },
          {
            sit: { outs: 0, runners: [2], you: '1B' },
            prompt: 'You\'re the cutoff. Who tells you whether to catch the throw or let it go?',
            choices: ['The catcher', 'The pitcher', 'The outfielder who threw it', 'Nobody — you guess'],
          },
          {
            sit: { outs: 1, runners: [2], you: '1B' },
            prompt: 'The catcher yells "Cut two!" What does that mean?',
            choices: ['Catch the throw and fire to second base', 'Let it go through to home', 'Catch it and hold it', 'Throw to first'],
          },
          {
            sit: { outs: 1, runners: [2], you: '1B' },
            prompt: 'Single to right and the runner from second is heading home. Drag Skip to where you go.',
            ask: {
              drag: 'YOU',
              setup: [[{ ball: 'B', to: 'shallowRF', roll: true }, { field: 'RF', to: 'shallowRF' }, { run: 'R2', to: 3 }]],
            },
            targets: [
              { at: { x: 114, y: 118 }, label: 'The infield grass, lined up between right field and home' },
              { at: 'b1', label: 'Stay on first base' },
              { at: 'home', label: 'Cover home plate' },
              { at: 'b2', label: 'Cover second base' },
            ],
          },
          {
            sit: { outs: 1, runners: [2], you: '1B' },
            prompt: 'This time the single goes to center field, and the runner from second is heading home. Drag Skip to where you go.',
            ask: {
              drag: 'YOU',
              setup: [
                [
                  { ball: 'B', to: 'shallowCF', roll: true },
                  { field: 'CF', to: 'shallowCF' },
                  { run: 'R2', to: 3 },
                ],
              ],
            },
            targets: [
              {
                at: { x: 100, y: 118 },
                label: 'The infield grass, lined up between center and home',
              },
              { at: 'b1', label: 'Stay on first base' },
              { at: 'home', label: 'Cover home plate' },
              { at: 'b2', label: 'Cover second base' },
            ],
          },
        ],
      },
      {
        id: 'u4-bunt',
        title: 'Bunt coverage',
        source: 'fundamental',
        coachCheck: 'Confirm his team\'s bunt coverage.',
        why: 'On an obvious bunt, the first baseman charges in to field it and the second baseman covers first. Listen for the catcher calling where to throw.',
        variants: [
          {
            sit: { balls: 0, strikes: 0, outs: 0, runners: [1], you: '1B' },
            prompt: 'Runner on first, nobody out. The batter squares to bunt. What do you do?',
            choices: ['Charge in to field the bunt', 'Stay on the bag', 'Run to second', 'Back up right field'],
          },
          {
            sit: { outs: 0, runners: [1], you: '1B' },
            prompt: 'You charged the bunt. Who covers first?',
            choices: ['The second baseman', 'The shortstop', 'The catcher', 'Nobody'],
          },
          {
            sit: { outs: 0, runners: [1], you: '1B' },
            prompt: 'You field the bunt. The catcher yells "One! One!" Where do you throw?',
            choices: ['To first base, to the second baseman covering', 'To second, for the lead runner', 'Home', 'Hold it'],
          },
          {
            sit: { balls: 0, strikes: 0, outs: 0, runners: [1], you: '1B' },
            prompt: 'Runner on first, nobody out, and the batter squares to bunt. Drag Skip to where you go.',
            ask: { drag: 'YOU', setup: [[{ run: 'R1', to: 'lead1' }, { ball: 'P', to: 'home' }]] },
            targets: [
              { at: 'bunt1', label: 'Charge in to field the bunt' },
              { at: 'b1', label: 'Stay on the bag' },
              { at: 'b2', label: 'Run to cover second' },
              { at: { x: 166, y: 70 }, label: 'Back up right field' },
            ],
          },
          {
            sit: { outs: 0, runners: [1], you: '1B' },
            prompt: 'You charged in and fielded the bunt. Tap the player who covers first base.',
            ask: {
              tap: true,
              setup: [
                [{ ball: 'P', to: 'home' }],
                [
                  { ball: 'home', to: 'bunt1', roll: true },
                  { field: 'YOU', to: 'bunt1' },
                  { run: 'R1', to: 'half12' },
                  { run: 'B', to: { x: 112, y: 128 } },
                ],
              ],
            },
            targets: [
              { at: '2B', label: 'The second baseman' },
              { at: 'SS', label: 'The shortstop' },
              { at: 'P', label: 'The pitcher' },
              { at: 'C', label: 'The catcher' },
            ],
          },
        ],
      },
      {
        id: 'u4-obstruction',
        title: 'No ball, no blocking',
        source: 'ghvbl',
        why: 'A fielder without the ball can\'t stand in the runner\'s path or block the base. That\'s obstruction, and the runner gets the base. Give him room until the ball is in your glove.',
        variants: [
          {
            sit: { outs: 1, runners: [1], you: '1B' },
            prompt: 'A pickoff throw is coming. You step into the base path and block the bag before the ball gets there. What can happen?',
            choices: ['Obstruction — the runner can be awarded the base', 'Nothing, it\'s your bag', 'The runner is automatically out', 'A balk on the pitcher'],
          },
          {
            prompt: 'True or false: A fielder can block the base as long as he\'s expecting a throw.',
            tf: false,
          },
          {
            sit: { outs: 0, runners: [], you: '1B' },
            prompt: 'Ground ball and the batter is running hard. You\'re setting up at first. Where do you stand?',
            choices: ['On the edge of the bag, leaving the runner a clear path', 'Right in the middle of the base path', 'On top of the bag', 'In front of the bag facing the runner'],
          },
        ],
      },
    ],
  },
  {
    id: 'u5',
    title: 'Up the Middle',
    subtitle: 'Second base & shortstop',
    concepts: [
      {
        id: 'u5-steal-cover',
        title: 'Who covers second on a steal',
        source: 'fundamental',
        coachCheck: 'Lots of teams decide this with a signal between 2B and SS. Confirm his team\'s system.',
        why: 'A common rule: righty batter at the plate, the second baseman covers (the shortstop stays home because righties pull to his side). Lefty batter, the shortstop covers. Decide it with your partner before the pitch.',
        variants: [
          {
            sit: { balls: 0, strikes: 0, outs: 1, runners: [1], you: '2B' },
            prompt: 'You\'re at second base. Runner on first, right-handed batter. The runner is a stealer. Who covers second?',
            choices: ['You, the second baseman', 'The shortstop', 'The center fielder', 'The pitcher'],
          },
          {
            sit: { balls: 1, strikes: 1, outs: 0, runners: [1], you: '2B' },
            prompt: 'Same runner on first, but now a left-handed batter steps in. Who covers second on a steal?',
            choices: ['The shortstop', 'You, the second baseman', 'Both of you', 'The first baseman'],
          },
          {
            sit: { outs: 0, runners: [1], you: '2B' },
            prompt: 'When should you and the shortstop decide who covers?',
            choices: ['Before the pitch — use a quick signal', 'After the runner takes off', 'Whoever gets there first', 'Between innings only'],
          },
          {
            sit: { balls: 0, strikes: 0, outs: 1, runners: [1], you: '2B' },
            prompt: 'Runner on first is stealing, and a left-handed batter is up. Tap the player who covers second.',
            ask: { tap: true, setup: [[{ run: 'R1', to: 'lead1' }]] },
            targets: [
              { at: 'SS', label: 'The shortstop' },
              { at: 'YOU', label: 'You, the second baseman' },
              { at: 'P', label: 'The pitcher' },
              { at: 'CF', label: 'The center fielder' },
            ],
          },
          {
            sit: { balls: 0, strikes: 0, outs: 1, runners: [1], you: '2B' },
            prompt: 'Runner on first takes off on the pitch, and a right-handed batter is up. Drag Skip to where you go.',
            ask: { drag: 'YOU', setup: [[{ ball: 'P', to: 'C' }, { run: 'R1', to: 'half12' }]] },
            targets: [
              { at: 'b2', label: 'Cover second base' },
              { at: { x: 130, y: 76 }, label: 'Stay at your spot and let the shortstop cover' },
              { at: { x: 112, y: 30 }, label: 'Back up behind second base' },
            ],
          },
        ],
      },
      {
        id: 'u5-double-play',
        title: 'Turning two',
        source: 'fundamental',
        why: 'Runner on first, fewer than two outs, ground ball in the infield: get the lead runner at second first, then throw to first. Make sure of the first out — one out is better than none.',
        variants: [
          {
            sit: { outs: 0, runners: [1], you: 'SS' },
            prompt: 'Runner on first, nobody out. Hard grounder right at you at shortstop. Where\'s your first throw?',
            choices: ['To second base to start the double play', 'To first base', 'To third', 'Run it to second yourself every time'],
          },
          {
            sit: { outs: 1, runners: [1], you: '2B' },
            prompt: 'Runner on first, one out. Ground ball to the shortstop. You\'re at second. Your job?',
            choices: ['Get to the bag, take the throw, touch second, and fire to first', 'Back up first base', 'Run toward the ball', 'Stand behind second'],
          },
          {
            sit: { outs: 2, runners: [1], you: 'SS' },
            prompt: 'Runner on first, TWO outs. Grounder to you near second base. What\'s the play?',
            choices: ['Get the easy out — step on second or throw to whichever base is surest', 'Try to turn two', 'Throw home', 'Hold it'],
          },
          {
            sit: { outs: 0, runners: [1], you: 'SS' },
            prompt: 'Runner on first, nobody out. Hard grounder right at you. Drag the ball to where your first throw goes.',
            ask: {
              drag: 'ball',
              from: 'YOU',
              setup: [
                [
                  { ball: 'B', to: 'YOU', roll: true },
                  { field: '2B', to: 'b2' },
                  { field: '1B', to: 'b1' },
                  { run: 'R1', to: 'half12' },
                  { run: 'B', to: { x: 112, y: 128 } },
                ],
              ],
            },
            targets: [
              { at: 'b2', label: 'To second base, to start the double play' },
              { at: 'b1', label: 'To first base' },
              { at: 'b3', label: 'To third base' },
            ],
          },
          {
            sit: { outs: 1, runners: [1], you: '2B' },
            prompt: 'Runner on first, one out. Ground ball to the shortstop. Drag Skip to where you go.',
            ask: {
              drag: 'YOU',
              setup: [
                [
                  { ball: 'B', to: 'SS', roll: true },
                  { field: '1B', to: 'b1' },
                  { run: 'R1', to: 'half12' },
                  { run: 'B', to: { x: 112, y: 128 } },
                ],
              ],
            },
            targets: [
              { at: 'b2', label: 'Second base, to take the throw and turn two' },
              { at: { x: 80, y: 86 }, label: 'Run toward the ball' },
              { at: { x: 165, y: 120 }, label: 'Back up first base' },
              { at: { x: 100, y: 28 }, label: 'Stand behind second base' },
            ],
          },
        ],
      },
      {
        id: 'u5-force-tag',
        title: 'Force out or tag?',
        source: 'fundamental',
        why: 'If a runner HAS to move because the batter became a runner behind him, it\'s a force — just touch the base with the ball. If he doesn\'t have to run, you must tag him.',
        variants: [
          {
            sit: { outs: 1, runners: [1], you: '2B' },
            prompt: 'Runner on first. Ground ball to the shortstop, he throws to you at second. Tag or touch the bag?',
            choices: ['Touch the bag — it\'s a force out', 'You have to tag the runner', 'Both', 'Neither — it\'s automatic'],
          },
          {
            sit: { outs: 1, runners: [2], you: 'SS' },
            prompt: 'Runner on second only. Ground ball to third and the runner breaks for third. Is it a force at third?',
            choices: ['No — first base was open, so he must be tagged', 'Yes — just touch third', 'Only with two outs', 'Only if he slides'],
          },
          {
            sit: { outs: 0, runners: [1, 2], you: 'SS' },
            prompt: 'True or false: With runners on first and second, a ground ball creates a force at third.',
            tf: true,
          },
        ],
      },
      {
        id: 'u5-relay',
        title: 'Going out for the relay',
        source: 'fundamental',
        why: 'On a ball in the gap or down the line, a middle infielder runs out to be the relay man: line up between the outfielder and the target base, hands up, yelling so he can find you. Catch it on your glove side and turn to throw.',
        variants: [
          {
            sit: { outs: 1, runners: [], you: 'SS' },
            prompt: 'Ball into the left-center gap — it\'s going to be extra bases. You\'re at short. What do you do?',
            choices: ['Run out toward the ball as the relay man, line up with the target, and yell', 'Cover second base and wait', 'Go to third', 'Chase the ball yourself'],
          },
          {
            sit: { outs: 0, runners: [], you: '2B' },
            prompt: 'Ball down the right-field line. You go out as the relay. How should you set up?',
            choices: ['Arms up, lined up with the base you\'re throwing to, yelling', 'Facing the infield with your back to the outfielder', 'Kneeling to block it', 'As far out as the outfielder'],
          },
          {
            prompt: 'True or false: A relay man should yell and wave his arms so the outfielder can find him fast.',
            tf: true,
          },
          {
            sit: { outs: 1, runners: [], you: 'SS' },
            prompt: 'Ball into the left-center gap, and the batter is trying for third. Drag Skip to where you go.',
            ask: {
              drag: 'YOU',
              setup: [
                [
                  { ball: 'B', to: 'gapLC', fly: true },
                  { field: 'CF', to: 'gapLC' },
                  { run: 'B', to: 1 },
                ],
              ],
            },
            targets: [
              { at: { x: 60, y: 56 }, label: 'Out toward the ball, lined up with third base' },
              { at: 'b2', label: 'Cover second base and wait' },
              { at: 'b3', label: 'Go to third base' },
              { at: 'gapLC', label: 'Chase the ball yourself' },
            ],
          },
        ],
      },
      {
        id: 'u5-infield-in',
        title: 'Runner on third: infield in or back',
        source: 'fundamental',
        coachCheck: 'The coach usually calls infield in or back — this card is about knowing why.',
        why: 'Infield IN means stopping the run matters most, so on a ground ball you check the runner and throw home if he goes. Infield BACK means you\'ll give up the run for a sure out at first.',
        variants: [
          {
            sit: { outs: 1, runners: [3], you: '2B' },
            prompt: 'Close game, runner on third, one out. The coach brings the infield in. Grounder to you and the runner breaks for home. Throw where?',
            choices: ['Home — that\'s why the infield is in', 'First, for the sure out', 'Third', 'Hold it'],
          },
          {
            sit: { outs: 0, runners: [3], you: 'SS' },
            prompt: 'You\'re up by 6, runner on third, nobody out. Infield back. Routine grounder to you. Where\'s the throw?',
            choices: ['First — take the sure out and give up the run', 'Home, always', 'Third', 'Second'],
          },
          {
            sit: { outs: 1, runners: [3], you: 'SS' },
            prompt: 'Infield in, runner on third. Grounder to you but the runner stays at third. What now?',
            choices: ['Look him back to third, then throw to first', 'Throw home anyway', 'Run at the runner', 'Throw to third'],
          },
          {
            sit: { outs: 1, runners: [3], you: '2B' },
            prompt: 'Close game, one out, infield in. Grounder to you, and the runner on third breaks for home. Drag the ball to where your throw goes.',
            ask: {
              drag: 'ball',
              from: 'YOU',
              setup: [
                [{ field: 'YOU', to: { x: 118, y: 90 } }, { field: 'SS', to: { x: 82, y: 90 } }],
                [
                  { ball: 'B', to: 'YOU', roll: true },
                  { run: 'R3', to: { x: 68, y: 118 } },
                  { run: 'B', to: { x: 112, y: 128 } },
                ],
              ],
            },
            targets: [
              { at: 'home', label: 'Home, to stop the run' },
              { at: 'b1', label: 'First, for the sure out' },
              { at: 'b3', label: 'Third base' },
            ],
          },
          {
            sit: { outs: 0, runners: [3], you: 'SS' },
            prompt: 'You\'re up by six, nobody out, infield back. Routine grounder to you, and the runner on third heads home. Drag the ball to where your throw goes.',
            ask: {
              drag: 'ball',
              from: 'YOU',
              setup: [
                [
                  { ball: 'B', to: 'YOU', roll: true },
                  { field: '1B', to: 'b1' },
                  { run: 'R3', to: { x: 68, y: 118 } },
                  { run: 'B', to: { x: 112, y: 128 } },
                ],
              ],
            },
            targets: [
              { at: 'b1', label: 'First, for the sure out' },
              { at: 'home', label: 'Home, to stop the run' },
              { at: 'b3', label: 'Third base' },
            ],
          },
        ],
      },
      {
        id: 'u5-two-outs',
        title: 'Two outs: take the easy one',
        source: 'fundamental',
        why: 'With two outs, any out ends the inning. Don\'t try for the hard play. Get the closest, surest out.',
        variants: [
          {
            sit: { outs: 2, runners: [1, 2], you: '2B' },
            prompt: 'Two outs, runners on first and second. Grounder to you, a couple of steps from second base. Best play?',
            choices: ['The surest out — a short flip or step on second, or a throw to first', 'Throw home', 'A long throw to third', 'Hold it to stop runners'],
          },
          {
            sit: { outs: 2, runners: [1, 2, 3], you: 'SS' },
            prompt: 'Bases loaded, two outs. Grounder to you right by third base. Easiest out?',
            choices: ['Step on or flip to the closest base with a force — every base has one', 'Throw home no matter what', 'Throw across to first', 'Tag the runner from third'],
          },
          {
            prompt: 'True or false: With two outs, a double play doesn\'t matter — one out ends the inning.',
            tf: true,
          },
          {
            sit: { outs: 2, runners: [1, 2, 3], you: 'SS' },
            prompt: 'Bases loaded, two outs. Grounder to you, right next to third base. Drag the ball to the base where you get the out.',
            ask: {
              drag: 'ball',
              from: 'YOU',
              setup: [
                [
                  { ball: 'B', to: { x: 64, y: 98 }, roll: true },
                  { field: 'YOU', to: { x: 64, y: 98 } },
                  { field: '3B', to: { x: 70, y: 118 } },
                  { run: 'R3', to: { x: 72, y: 122 } },
                  { run: 'R2', to: 'half23' },
                  { run: 'R1', to: 'half12' },
                  { run: 'B', to: { x: 112, y: 128 } },
                ],
              ],
            },
            targets: [
              { at: 'b3', label: 'Step on third, the closest force' },
              { at: 'home', label: 'Throw home' },
              { at: 'b1', label: 'Throw across to first' },
              { at: 'b2', label: 'Flip to second' },
            ],
          },
        ],
      },
      {
        id: 'u5-popup-priority',
        title: 'Pop-ups in the infield',
        source: 'fundamental',
        coachCheck: 'Confirm his team\'s pop-up priority order.',
        why: 'Middle infielders usually have priority over the corners on pop-ups, and the shortstop is usually captain of the infield. Call it loud — and back off fast when a teammate with priority calls you off.',
        variants: [
          {
            sit: { outs: 1, runners: [], you: '2B' },
            prompt: 'Pop-up between you (second base) and the first baseman. You both call it. Who usually takes it?',
            choices: ['You — the middle infielder usually has priority', 'The first baseman', 'The pitcher', 'The catcher'],
          },
          {
            sit: { outs: 0, runners: [1], you: '2B' },
            prompt: 'Pop-up behind you. You call it, then hear the right fielder yelling "I got it!" while running in. What do you do?',
            choices: ['Peel off — the outfielder coming in has priority', 'Keep going, you called it first', 'Both go for it', 'Stop and watch'],
          },
          {
            prompt: 'True or false: The pitcher should usually take pop-ups in the infield.',
            tf: false,
          },
          {
            sit: { outs: 1, runners: [], you: '2B' },
            prompt: 'Pop-up between you and the first baseman, and you\'re both calling it. Tap the player who should take it.',
            ask: {
              tap: true,
              setup: [
                [
                  { ball: 'B', to: { x: 132, y: 80 }, fly: true, ms: 1200 },
                  { field: 'YOU', to: { x: 128, y: 76 } },
                  { field: '1B', to: { x: 138, y: 88 } },
                  { run: 'B', to: { x: 112, y: 128 } },
                ],
              ],
            },
            targets: [
              { at: 'YOU', label: 'You, the second baseman' },
              { at: '1B', label: 'The first baseman' },
              { at: 'P', label: 'The pitcher' },
              { at: 'C', label: 'The catcher' },
            ],
          },
          {
            sit: { outs: 0, runners: [1], you: '2B' },
            prompt: 'Pop-up into shallow right. You\'re going back for it, and the right fielder is charging in. Tap the player who should catch it.',
            ask: {
              tap: true,
              setup: [
                [
                  { ball: 'B', to: 'shallowRF', fly: true, ms: 1400 },
                  { field: 'RF', to: { x: 152, y: 54 } },
                  { field: 'YOU', to: { x: 136, y: 66 } },
                  { run: 'R1', to: 'lead1' },
                  { run: 'B', to: { x: 112, y: 128 } },
                ],
              ],
            },
            targets: [
              { at: 'RF', label: 'The right fielder coming in' },
              { at: 'YOU', label: 'You, the second baseman' },
              { at: '1B', label: 'The first baseman' },
              { at: 'CF', label: 'The center fielder' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'u6',
    title: 'Around the Diamond',
    subtitle: 'Pitcher, catcher & third base',
    concepts: [
      {
        id: 'u6-pitcher-cover-first',
        title: 'Pitcher: break for first',
        source: 'fundamental',
        why: 'On any ground ball to the right side, the pitcher breaks toward first right away. If the first baseman fields it, you\'re covering. If not, you just jog back.',
        variants: [
          {
            sit: { outs: 1, runners: [], you: 'P' },
            prompt: 'You\'re pitching. Ground ball to the first baseman\'s right. What do you do?',
            choices: ['Sprint to cover first base', 'Watch the play', 'Back up home', 'Go to second'],
          },
          {
            sit: { outs: 0, runners: [], you: 'P' },
            prompt: 'You\'re covering first. How should you run to the bag?',
            choices: ['To a spot on the base line a few steps from the bag, then run up the line to it', 'Straight at the bag, then stop on it', 'Through the runner\'s lane', 'Slowly, in case they don\'t need you'],
          },
          {
            prompt: 'True or false: A pitcher should break toward first on EVERY ground ball to the right side.',
            tf: true,
          },
          {
            sit: { outs: 0, runners: [], you: 'P' },
            prompt: 'You\'re pitching. Ground ball to the first baseman\'s right, and he goes to get it. Drag Skip to where you go.',
            ask: {
              drag: 'YOU',
              setup: [[{ ball: 'B', to: 'hole12', roll: true }, { field: '1B', to: 'hole12' }]],
            },
            targets: [
              { at: 'b1', label: 'Cover first base' },
              { at: 'mound', label: 'Stay on the mound and watch' },
              { at: 'home', label: 'Back up home plate' },
              { at: 'b2', label: 'Cover second base' },
            ],
          },
        ],
      },
      {
        id: 'u6-pitcher-backup',
        title: 'Pitcher: back up the base',
        source: 'fundamental',
        why: 'When an outfielder throws home or to third, the pitcher runs behind that base — well back, near the fence — to stop a bad throw.',
        variants: [
          {
            sit: { outs: 1, runners: [2], you: 'P' },
            prompt: 'Runner on second, single to center. The throw is coming home. Where do you go?',
            choices: ['Behind home plate, well back, to back up the catcher', 'Stand on the mound', 'Cover first', 'Run to second'],
          },
          {
            sit: { outs: 0, runners: [1], you: 'P' },
            prompt: 'Runner on first, single to right. The runner is going to third. Where do you go?',
            choices: ['Behind third base, backing up the throw', 'Cover home', 'Stay on the mound', 'Back up first'],
          },
          {
            prompt: 'How far behind the base should a backup stand?',
            choices: ['Far back, so a bad throw bounces to you instead of past you', 'Right behind the fielder', 'In the base path', 'It doesn\'t matter'],
          },
          {
            sit: { outs: 1, runners: [2], you: 'P' },
            prompt: 'Runner on second, single to center. The runner is heading home and the throw is coming in. Drag Skip to where you go.',
            ask: {
              drag: 'YOU',
              setup: [
                [
                  { ball: 'B', to: 'shallowCF', roll: true },
                  { field: 'CF', to: 'shallowCF' },
                  { run: 'R2', to: 3 },
                ],
              ],
            },
            targets: [
              { at: 'backstop', label: 'Behind home plate, well back' },
              { at: 'mound', label: 'Stay on the mound' },
              { at: 'foul3', label: 'Behind third base' },
              { at: 'b1', label: 'Cover first base' },
            ],
          },
          {
            sit: { outs: 0, runners: [1], you: 'P' },
            prompt: 'Runner on first, single to right. The runner is going for third and the right fielder is throwing there. Drag Skip to where you go.',
            ask: {
              drag: 'YOU',
              setup: [
                [
                  { ball: 'B', to: 'shallowRF', roll: true },
                  { field: 'RF', to: 'shallowRF' },
                  { run: 'R1', to: 2 },
                  { run: 'B', to: 1 },
                ],
              ],
            },
            targets: [
              { at: 'foul3', label: 'Behind third base, backing up the throw' },
              { at: 'backstop', label: 'Behind home plate' },
              { at: 'mound', label: 'Stay on the mound' },
              { at: 'b1', label: 'Back up first base' },
            ],
          },
        ],
      },
      {
        id: 'u6-catcher-dropped-k',
        title: 'Catcher: dropped third strike',
        source: 'ghvbl',
        why: 'If you don\'t catch strike three cleanly and first base is empty (or there are two outs), the batter can run. Pick up the ball and tag him or throw to first. If first is occupied with fewer than two outs, he\'s out already.',
        variants: [
          {
            sit: { balls: 2, strikes: 2, outs: 1, runners: [], you: 'C' },
            prompt: 'Bases empty, one out. Strike three bounces off your glove and the batter takes off. What do you do?',
            choices: ['Grab it and tag him or throw to first', 'Nothing, strike three is an out', 'Throw to second', 'Call time'],
          },
          {
            sit: { balls: 1, strikes: 2, outs: 0, runners: [1], you: 'C' },
            prompt: 'Runner on first, nobody out. You drop strike three. The batter starts running. What\'s going on?',
            choices: ['He\'s already out — first base is occupied with fewer than two outs', 'You need to throw him out at first', 'It\'s a ball', 'He gets first base'],
          },
          {
            sit: { balls: 3, strikes: 2, outs: 2, runners: [1, 2, 3], you: 'C' },
            prompt: 'Bases loaded, two outs. You drop strike three. What\'s the quickest out?',
            choices: ['Step on home plate — it\'s a force', 'Throw to first only', 'Tag the batter only', 'There\'s no out to get'],
          },
          {
            sit: { balls: 2, strikes: 2, outs: 0, runners: [], you: 'C' },
            prompt: 'Bases empty. Strike three gets away from you and the batter takes off. You pick it up. Drag the ball to where your throw goes.',
            ask: {
              drag: 'ball',
              from: 'C',
              setup: [
                [{ ball: 'P', to: { x: 108, y: 166 } }],
                [
                  { field: 'C', to: { x: 108, y: 164 } },
                  { run: 'B', to: { x: 118, y: 132 } },
                  { field: '1B', to: 'b1' },
                ],
              ],
            },
            targets: [
              { at: 'b1', label: 'First base, to get the batter' },
              { at: 'home', label: 'Keep it, strike three is an out' },
              { at: 'b2', label: 'Second base' },
            ],
          },
        ],
      },
      {
        id: 'u6-catcher-backup-first',
        title: 'Catcher: back up first',
        source: 'fundamental',
        why: 'With nobody on base, the catcher hustles down the line behind first base on infield ground balls. If the throw gets away, he\'s there to stop it.',
        variants: [
          {
            sit: { outs: 1, runners: [], you: 'C' },
            prompt: 'Nobody on. Ground ball to the shortstop. You\'re catching. Where do you go?',
            choices: ['Run down the line in foul territory to back up first', 'Stay at home plate', 'Go to the mound', 'Head to the dugout'],
          },
          {
            sit: { outs: 0, runners: [2], you: 'C' },
            prompt: 'Runner on SECOND. Ground ball to short. Should you leave home to back up first?',
            choices: ['No — with a runner in scoring position, stay home', 'Yes, always', 'Only with two outs', 'Only if the throw looks bad'],
          },
          {
            prompt: 'True or false: Catchers only ever stay at home plate.',
            tf: false,
          },
          {
            sit: { outs: 0, runners: [], you: 'C' },
            prompt: 'Nobody on. Ground ball to the shortstop. You\'re catching. Drag Skip to where you go.',
            ask: {
              drag: 'YOU',
              setup: [
                [
                  { ball: 'B', to: 'holeSS', roll: true },
                  { field: 'SS', to: 'holeSS' },
                  { run: 'B', to: { x: 112, y: 138 } },
                ],
              ],
            },
            targets: [
              { at: { x: 168, y: 126 }, label: 'Down the line, behind first base in foul ground' },
              { at: 'home', label: 'Stay at home plate' },
              { at: 'mound', label: 'Go to the mound' },
              { at: 'b1', label: 'Cover first base' },
            ],
          },
          {
            sit: { outs: 1, runners: [2], you: 'C' },
            prompt: 'Runner on second. Ground ball to the shortstop. You\'re catching. Drag Skip to where you go.',
            ask: {
              drag: 'YOU',
              setup: [
                [
                  { ball: 'B', to: 'holeSS', roll: true },
                  { field: 'SS', to: 'holeSS' },
                  { run: 'B', to: { x: 112, y: 138 } },
                  { run: 'R2', to: 'lead2' },
                ],
              ],
            },
            targets: [
              { at: 'home', label: 'Stay home, a runner is in scoring position' },
              { at: { x: 168, y: 126 }, label: 'Down the line, behind first base' },
              { at: 'mound', label: 'Go to the mound' },
              { at: 'b1', label: 'Cover first base' },
            ],
          },
        ],
      },
      {
        id: 'u6-third-bunt',
        title: 'Third base: bunts and slow rollers',
        source: 'fundamental',
        why: 'On a bunt or slow roller toward third, charge hard. On a ball still rolling, field it barehanded in one motion and throw on the run. Speed beats a perfect glove scoop here.',
        variants: [
          {
            sit: { outs: 0, runners: [], you: '3B' },
            prompt: 'Slow roller down the third-base line, the batter is fast. How do you field it?',
            choices: ['Charge, barehand it if it\'s still rolling, and throw on the run', 'Wait for it to stop', 'Back up and field it with two hands', 'Let it roll foul no matter what'],
          },
          {
            sit: { outs: 1, runners: [1], you: '3B' },
            prompt: 'Runner on first. Bunt toward you. You charge and field it. The catcher yells "Two!" Where?',
            choices: ['To second for the lead runner', 'First base', 'Third base', 'Hold it'],
          },
          {
            sit: { outs: 0, runners: [], you: '3B' },
            prompt: 'A bunt is rolling right along the foul line and you can\'t make a play. What can you do?',
            choices: ['Let it roll — if it crosses into foul territory before you touch it, it\'s a foul ball', 'Pick it up and hope', 'Kick it foul', 'Throw it to first anyway'],
          },
          {
            sit: { outs: 0, runners: [1], you: '3B' },
            prompt: 'Runner on first, nobody out. Bunt toward you. You charge and field it, and the catcher yells "Two!" Drag the ball to where your throw goes.',
            ask: {
              drag: 'ball',
              from: 'YOU',
              setup: [
                [
                  { ball: 'B', to: 'bunt3', roll: true },
                  { field: 'YOU', to: 'bunt3' },
                  { field: 'SS', to: 'b2' },
                  { field: '2B', to: 'b1' },
                  { run: 'R1', to: 'half12' },
                  { run: 'B', to: { x: 112, y: 138 } },
                ],
              ],
            },
            targets: [
              { at: 'b2', label: 'Second base, for the lead runner' },
              { at: 'b1', label: 'First base' },
              { at: 'b3', label: 'Third base' },
            ],
          },
        ],
      },
      {
        id: 'u6-infield-fly-defense',
        title: 'Infield fly on defense',
        source: 'ghvbl',
        why: 'With runners on first and second (or bases loaded) and fewer than two outs, an easy infield pop-up is an automatic out once the umpire calls "infield fly." It stops the defense from dropping it on purpose to get a double play.',
        variants: [
          {
            sit: { outs: 1, runners: [1, 2], you: 'SS' },
            prompt: 'Runners on first and second, one out. Easy pop-up to you. Can you let it drop to turn a double play?',
            choices: ['No — the infield fly rule makes the batter out anyway', 'Yes, smart play', 'Only if the umpire isn\'t looking', 'Only with a lefty batter'],
          },
          {
            sit: { outs: 2, runners: [1, 2], you: '2B' },
            prompt: 'Runners on first and second, TWO outs. Pop-up to you. Is the infield fly rule on?',
            choices: ['No — it only applies with fewer than two outs', 'Yes', 'Only with the bases loaded', 'Only in the playoffs'],
          },
          {
            sit: { outs: 0, runners: [1], you: '3B' },
            prompt: 'True or false: With only a runner on first, the infield fly rule is in effect.',
            tf: false,
          },
        ],
      },
    ],
  },
  {
    id: 'u7',
    title: 'Baserunning',
    subtitle: 'Reads, leads & steals',
    concepts: [
      {
        id: 'u7-run-through-first',
        title: 'Run through first',
        source: 'fundamental',
        why: 'On a ground ball, run THROUGH first base at full speed — don\'t slide, don\'t slow down. Then look to your right for an overthrow.',
        variants: [
          {
            sit: { outs: 1, runners: [], you: 'batter' },
            prompt: 'You hit a ground ball to short. Close play at first. What\'s fastest?',
            choices: ['Run through the bag at full speed', 'Slide headfirst into first', 'Slow down and step on it', 'Jump at the bag'],
          },
          {
            sit: { outs: 0, runners: [], you: 'batter' },
            prompt: 'You ran through first on a ground ball. What do you do right after?',
            choices: ['Look to your right for an overthrow', 'Turn left toward second', 'Walk back to the dugout', 'Stop on the bag'],
          },
          {
            prompt: 'True or false: Sliding into first is faster than running through it.',
            tf: false,
          },
          {
            sit: { outs: 1, runners: [], you: 'batter' },
            prompt: 'You hit a ground ball to short, and it\'s going to be a close play at first. Drag Skip to where you go.',
            ask: {
              drag: 'YOU',
              setup: [[{ ball: 'B', to: 'SS', roll: true }, { run: 'B', to: { x: 128, y: 122 } }]],
            },
            targets: [
              { at: { x: 167, y: 83 }, label: 'Run through the bag, straight down the line' },
              { at: 'b1', label: 'Stop right on first base' },
              { at: 'half12', label: 'Turn toward second' },
            ],
          },
        ],
      },
      {
        id: 'u7-round-first',
        title: 'Round first on a hit',
        source: 'fundamental',
        why: 'On a ball that gets through to the outfield, make a banana-shaped turn into first and take an aggressive turn toward second. If the outfielder bobbles it, you\'re gone.',
        variants: [
          {
            sit: { outs: 1, runners: [], you: 'batter' },
            prompt: 'You line a single into left. How do you run to first?',
            choices: ['Curve out a bit before the bag and make a hard turn toward second', 'Run straight through like a ground ball', 'Jog to the bag', 'Slide into first'],
          },
          {
            sit: { outs: 0, runners: [1], you: 'runner1' },
            prompt: 'You took a big turn and the left fielder fields it cleanly and throws to second. What do you do?',
            choices: ['Get back to first, watching the ball', 'Keep going no matter what', 'Stop halfway', 'Walk back'],
          },
          {
            prompt: 'True or false: On a base hit, you should always stop right on first base.',
            tf: false,
          },
          {
            sit: { outs: 1, runners: [], you: 'batter' },
            prompt: 'You line a single into left field, and it gets through clean. Drag Skip to where you go as you hit first.',
            ask: {
              drag: 'YOU',
              setup: [
                [
                  { ball: 'B', to: 'shallowLF' },
                  { field: 'LF', to: 'shallowLF' },
                  { run: 'B', to: { x: 132, y: 134 } },
                ],
              ],
            },
            targets: [
              { at: { x: 124, y: 82 }, label: 'A hard turn, a few steps toward second' },
              { at: 'b1', label: 'Stop right on first base' },
              { at: { x: 167, y: 83 }, label: 'Run straight through, down the line' },
            ],
          },
        ],
      },
      {
        id: 'u7-two-outs',
        title: 'Two outs: run on contact',
        source: 'fundamental',
        why: 'With two outs, run the instant the ball is hit — on anything. If it\'s caught, the inning\'s over anyway; if it drops, you score.',
        variants: [
          {
            sit: { balls: 1, strikes: 1, outs: 2, runners: [2], you: 'runner2' },
            prompt: 'Two outs, you\'re on second. Fly ball to right. What do you do?',
            choices: ['Run hard on contact', 'Go back to tag', 'Go halfway and wait', 'Stay on the bag'],
          },
          {
            sit: { outs: 2, runners: [1], you: 'runner1' },
            prompt: 'Two outs, you\'re on first. The batter hits a line drive. When do you go?',
            choices: ['The moment it\'s hit', 'After it bounces', 'Only if the coach waves', 'After it\'s caught'],
          },
          {
            sit: { outs: 2, runners: [3], you: 'runner3' },
            prompt: 'True or false: With two outs, a runner on third should run on any batted ball.',
            tf: true,
          },
          {
            sit: { outs: 2, runners: [2], you: 'runner2' },
            prompt: 'Two outs, you\'re on second. Fly ball to shallow right that might drop. Drag your runner to where you go.',
            ask: {
              drag: 'YOU',
              setup: [
                [
                  { ball: 'B', to: 'shallowRF', fly: true, ms: 1400 },
                  { field: 'RF', to: { x: 154, y: 52 }, ms: 1400 },
                ],
              ],
            },
            targets: [
              { at: 'home', label: 'Run hard, all the way home' },
              { at: 'b2', label: 'Back on second to tag up' },
              { at: 'half23', label: 'Halfway to third and wait' },
            ],
          },
        ],
      },
      {
        id: 'u7-fly-ball',
        title: 'Fly ball, fewer than two outs',
        source: 'fundamental',
        why: 'With fewer than two outs: deep fly? Tag up and go after the catch. Might be caught? Go halfway so you can get back if it\'s caught or advance if it drops.',
        variants: [
          {
            sit: { outs: 1, runners: [1], you: 'runner1' },
            prompt: 'One out, you\'re on first. Medium fly ball to center that might be caught. Where do you go?',
            choices: ['Halfway to second', 'All the way to second', 'Stay on first', 'Tag up'],
          },
          {
            sit: { outs: 0, runners: [3], you: 'runner3' },
            prompt: 'Nobody out, you\'re on third. Deep fly ball to left. What do you do?',
            choices: ['Tag up — go back to the bag and run after the catch', 'Run home right away', 'Go halfway', 'Stay put no matter what'],
          },
          {
            sit: { outs: 1, runners: [2], you: 'runner2' },
            prompt: 'One out, you\'re on second. Deep fly to right. Tag up?',
            choices: ['Yes — tag and take third after the catch', 'No — run on contact', 'Go halfway', 'Run home'],
          },
          {
            sit: { outs: 1, runners: [1], you: 'runner1' },
            prompt: 'One out, you\'re on first. Fly ball to medium center that might be caught. Drag your runner to where you go while it\'s in the air.',
            ask: { drag: 'YOU', setup: [[{ ball: 'B', to: 'shallowCF', fly: true }, { field: 'CF', to: 'shallowCF' }]] },
            targets: [
              { at: 'half12', label: 'Halfway to second' },
              { at: 'b2', label: 'All the way to second' },
              { at: 'b1', label: 'Stay on first base' },
            ],
          },
          {
            sit: { outs: 0, runners: [3], you: 'runner3' },
            prompt: 'Nobody out, you\'re leading off third. Deep fly ball to left. Drag your runner to where you go while it\'s in the air.',
            ask: {
              drag: 'YOU',
              setup: [
                [{ run: 'YOU', to: 'lead3' }, { ball: 'P', to: 'C' }],
                [
                  { ball: 'B', to: 'deepLF', fly: true, ms: 1500 },
                  { field: 'LF', to: 'deepLF', ms: 1500 },
                ],
              ],
            },
            targets: [
              { at: 'b3', label: 'Back on third base to tag up' },
              { at: 'half3H', label: 'Halfway home' },
              { at: 'home', label: 'Run home right away' },
            ],
          },
        ],
      },
      {
        id: 'u7-tag-up',
        title: 'How to tag up',
        source: 'fundamental',
        why: 'Be ON the bag when the ball is caught and leave the instant it touches the glove. Leave early and you can be called out on an appeal.',
        variants: [
          {
            sit: { outs: 0, runners: [3], you: 'runner3' },
            prompt: 'You\'re tagging from third. When can you leave?',
            choices: ['The moment the fielder first touches the ball', 'When the fielder throws', 'When the ball is hit', 'When the coach says'],
          },
          {
            prompt: 'True or false: If you leave too early on a tag-up, the defense can appeal and you\'re out.',
            tf: true,
          },
          {
            sit: { outs: 1, runners: [2], you: 'runner2' },
            prompt: 'You\'re tagging at second on a fly to right. Where should you look?',
            choices: ['At the catch — or listen for your coach\'s "Go!"', 'At third base', 'At the pitcher', 'At home plate'],
          },
        ],
      },
      {
        id: 'u7-line-drive',
        title: 'Line drive: freeze',
        source: 'fundamental',
        why: 'With fewer than two outs, freeze on a line drive. If it\'s caught and you\'re off the base, they\'ll double you off.',
        variants: [
          {
            sit: { outs: 0, runners: [1], you: 'runner1' },
            prompt: 'Nobody out, you\'re on first. Line drive right at the second baseman. What do you do?',
            choices: ['Freeze and get back if it\'s caught', 'Take off for second', 'Go halfway', 'Run to third'],
          },
          {
            sit: { outs: 1, runners: [2], you: 'runner2' },
            prompt: 'One out, you\'re on second. Line drive toward short. Why freeze?',
            choices: ['If it\'s caught and you\'re off the bag, it\'s a double play', 'So the coach can see you', 'You\'re supposed to tag', 'No reason'],
          },
          {
            sit: { outs: 2, runners: [1], you: 'runner1' },
            prompt: 'TWO outs, you\'re on first. Line drive. Freeze?',
            choices: ['No — with two outs, run on contact', 'Yes, always freeze', 'Go halfway', 'Only on a liner to the outfield'],
          },
          {
            sit: { outs: 0, runners: [1], you: 'runner1' },
            prompt: 'Nobody out, you\'re leading off first. Line drive right at the second baseman. Drag your runner to where you go.',
            ask: {
              drag: 'YOU',
              setup: [[{ run: 'YOU', to: 'lead1' }, { ball: 'P', to: 'C' }], [{ ball: 'B', to: '2B' }]],
            },
            targets: [
              { at: 'b1', label: 'Freeze, then get right back to first' },
              { at: 'half12', label: 'Halfway to second' },
              { at: 'b2', label: 'Take off for second' },
            ],
          },
        ],
      },
      {
        id: 'u7-ball-in-front',
        title: 'Runner on second: read the ground ball',
        source: 'fundamental',
        why: 'On second with no force (first base empty): a ground ball hit in front of you (shortstop or third) — hold. Hit behind you to the right side — go to third.',
        variants: [
          {
            sit: { outs: 1, runners: [2], you: 'runner2' },
            prompt: 'You\'re on second, first base is empty. Ground ball to the shortstop. What do you do?',
            choices: ['Hold — it\'s in front of you', 'Run to third', 'Go back to first', 'Run home'],
          },
          {
            sit: { outs: 0, runners: [2], you: 'runner2' },
            prompt: 'You\'re on second, first base is empty. Ground ball to the second baseman. What do you do?',
            choices: ['Go to third — it\'s behind you', 'Hold at second', 'Run home', 'Go back toward first'],
          },
          {
            sit: { outs: 1, runners: [1, 2], you: 'runner2' },
            prompt: 'Runners on first and second, ground ball to short. Can you hold at second?',
            choices: ['No — it\'s a force, you have to run to third', 'Yes, it\'s in front of you', 'Only with two outs', 'Go back to first'],
          },
          {
            sit: { outs: 1, runners: [2], you: 'runner2' },
            prompt: 'One out, you\'re on second and first base is empty. Ground ball to the third baseman. Drag your runner to where you go.',
            ask: {
              drag: 'YOU',
              setup: [[{ run: 'YOU', to: 'lead2' }], [{ ball: 'B', to: '3B', roll: true }]],
            },
            targets: [
              { at: 'b2', label: 'Hold at second' },
              { at: 'half23', label: 'Halfway to third' },
              { at: 'b3', label: 'Run to third' },
            ],
          },
          {
            sit: { outs: 0, runners: [2], you: 'runner2' },
            prompt: 'Nobody out, you\'re on second and first base is empty. Ground ball into the hole toward the second baseman. Drag your runner to where you go.',
            ask: {
              drag: 'YOU',
              setup: [
                [{ run: 'YOU', to: 'lead2' }],
                [{ ball: 'B', to: 'hole12', roll: true }, { field: '2B', to: 'hole12' }],
              ],
            },
            targets: [
              { at: 'b3', label: 'Go to third' },
              { at: 'b2', label: 'Hold at second' },
              { at: 'home', label: 'Keep going and try to score' },
            ],
          },
        ],
      },
      {
        id: 'u7-coach-eyes',
        title: 'Your eyes or your coach',
        source: 'fundamental',
        why: 'If the play is in front of you, use your own eyes. If it\'s behind you, find your base coach and do what he says — right away, without breaking stride.',
        variants: [
          {
            sit: { outs: 1, runners: [1], you: 'runner1' },
            prompt: 'You\'re running from first to third on a single to right. Who decides if you go?',
            choices: ['The third-base coach — the play is behind you', 'You decide by turning to look', 'The batter', 'The first-base coach'],
          },
          {
            sit: { outs: 0, runners: [2], you: 'runner2' },
            prompt: 'Ground ball to short right in front of you. Do you need the coach to tell you what to do?',
            choices: ['No — it\'s in front of you, use your eyes', 'Yes, always wait for him', 'Look at the dugout', 'Ask the umpire'],
          },
          {
            prompt: 'True or false: Turning your head to watch a ball behind you while running slows you down.',
            tf: true,
          },
        ],
      },
      {
        id: 'u7-hit-by-ball',
        title: 'Don\'t get hit by a batted ball',
        source: 'ghvbl',
        why: 'If a batted ball hits you before a fielder touches it, you\'re out. Know where the ball is and go behind a fielder, never through the ball.',
        variants: [
          {
            sit: { outs: 0, runners: [2], you: 'runner2' },
            prompt: 'Ground ball comes right at you running from second, before the shortstop gets to it. It hits your leg. What happens?',
            choices: ['You\'re out', 'Dead ball, everyone stays', 'You get third base', 'Nothing'],
          },
          {
            sit: { outs: 1, runners: [1], you: 'runner1' },
            prompt: 'Grounder heading your way from first base. How do you avoid it?',
            choices: ['Go behind it, or let it go by in front of you', 'Jump over it', 'Run straight through it', 'Stop in the base path'],
          },
          {
            prompt: 'True or false: Getting hit by a batted ball is an automatic out (before a fielder touches it).',
            tf: true,
          },
        ],
      },
      {
        id: 'u7-avoid-contact',
        title: 'Slide or go around',
        source: 'ghvbl',
        why: 'Your league says avoid contact: slide or go around the fielder. A hard, intentional collision gets you ejected. Headfirst slides are allowed at 12U.',
        variants: [
          {
            sit: { outs: 1, runners: [3], you: 'runner3' },
            prompt: 'You\'re heading home. The catcher has the ball, waiting in front of the plate. What do you do?',
            choices: ['Slide or try to go around — never run him over', 'Lower your shoulder and run through him', 'Stop and give up', 'Jump over him'],
          },
          {
            prompt: 'True or false: Intentionally running into a fielder can get you ejected.',
            tf: true,
          },
          {
            prompt: 'In your 12U league, is a headfirst slide allowed?',
            choices: ['Yes', 'No, never', 'Only into home', 'Only with two outs'],
          },
          {
            sit: { outs: 1, runners: [3], you: 'runner3' },
            prompt: 'You\'re racing home, and the catcher already has the ball, waiting in front of the plate. Drag your runner to where you go.',
            ask: {
              drag: 'YOU',
              setup: [
                [
                  { run: 'YOU', to: 'half3H' },
                  { field: 'C', to: { x: 96, y: 140 } },
                  { ball: 'SS', to: 'C' },
                ],
              ],
            },
            targets: [
              { at: { x: 72, y: 158 }, label: 'Slide to the side of the plate, away from him' },
              { at: { x: 96, y: 138 }, label: 'Run straight into the catcher' },
              { at: 'b3', label: 'Stop and go back to third' },
            ],
          },
        ],
      },
      {
        id: 'u7-turn-back-foul',
        title: 'After running through first',
        source: 'fundamental',
        why: 'After you run through first, look into foul territory for an overthrow. No overthrow? Turn back toward first on the foul-territory side, not toward second, so nobody can say you tried to advance.',
        variants: [
          {
            sit: { outs: 1, runners: [], you: 'batter' },
            prompt: 'You beat the throw and ran through first. The first baseman caught it. Which way do you turn to come back?',
            choices: ['Toward foul territory, then walk back to the bag', 'Toward second base', 'Doesn\'t matter, you\'re safe', 'Spin all the way around'],
          },
          {
            sit: { outs: 0, runners: [], you: 'batter' },
            prompt: 'You run through first and the throw gets past the first baseman into the fence. What now?',
            choices: ['Head for second — that\'s why you looked for the overthrow', 'Stay on first', 'Go back to home', 'Wait for the coach to decide'],
          },
          {
            sit: { outs: 2, runners: [], you: 'batter' },
            prompt: 'True or false: Turning toward second after running through first can get you tagged out.',
            tf: true,
          },
          {
            sit: { outs: 1, runners: [], you: 'batter' },
            prompt: 'You beat the throw and ran through first. The first baseman caught it. Drag Skip to the way you turn to come back.',
            ask: {
              drag: 'YOU',
              setup: [
                [{ ball: 'B', to: 'SS', roll: true }],
                [{ run: 'B', to: 1, ms: 900 }, { ball: 'SS', to: '1B', ms: 1000 }],
                [{ run: 'B', to: { x: 157, y: 93 } }],
              ],
            },
            targets: [
              { at: { x: 176, y: 100 }, label: 'Turn into foul territory, then back to the bag' },
              { at: { x: 146, y: 82 }, label: 'Turn toward second, then back to the bag' },
              { at: 'b2', label: 'Head for second' },
            ],
          },
          {
            sit: { outs: 0, runners: [], you: 'batter' },
            prompt: 'You ran through first, and the throw got past the first baseman into the fence. Drag Skip to where you go.',
            ask: {
              drag: 'YOU',
              setup: [
                [{ ball: 'B', to: 'SS', roll: true }],
                [{ run: 'B', to: 1, ms: 900 }, { ball: 'SS', to: 'foul1', ms: 900 }],
                [{ run: 'B', to: { x: 157, y: 93 } }],
              ],
            },
            targets: [
              { at: 'b2', label: 'Head for second' },
              { at: 'b1', label: 'Back to first base' },
              { at: 'b3', label: 'Go all the way to third' },
            ],
          },
        ],
      },
      {
        id: 'u7-hidden-ball',
        title: 'Know who has the ball',
        source: 'fundamental',
        why: 'Never step off a base until you know exactly where the ball is. The hidden-ball trick usually comes right after a slide or a dive back. If you\'re not sure, ask for time, and stay on the bag until the umpire actually grants it.',
        variants: [
          {
            sit: { outs: 1, runners: [2], you: 'runner2' },
            prompt: 'You just slid into second with a double. You\'re not sure if the shortstop threw the ball back to the pitcher. What do you do?',
            choices: ['Keep a foot on the bag until you know where the ball is', 'Stand up and dust yourself off', 'Take your lead right away', 'Walk over to the coach'],
          },
          {
            sit: { outs: 0, runners: [1], you: 'runner1' },
            prompt: 'You dove back on a pickoff. You want to step off and brush your uniform. When is that safe?',
            choices: ['After you ask for time AND the umpire grants it', 'Right away — the play is over', 'When the first baseman walks away', 'When the crowd quiets down'],
          },
          {
            sit: { outs: 1, runners: [3], you: 'runner3' },
            prompt: 'True or false: If you\'re not sure who has the ball, stay on the base.',
            tf: true,
          },
        ],
      },
      {
        id: 'u7-tag-rules',
        title: 'Tag-up fine print',
        source: 'fundamental',
        why: 'Tagging up applies to ANY ball caught in the air: fly balls, line drives, popped-up bunts, even caught foul balls. You can leave the moment a fielder first touches the ball, even if he bobbles it and someone else catches it. A foul tip the catcher holds is just a strike, so no tag-up is needed.',
        variants: [
          {
            sit: { outs: 0, runners: [3], you: 'runner3' },
            prompt: 'You\'re tagging on third. The left fielder bobbles the fly ball and the center fielder catches it before it hits the ground. You left when it first touched the left fielder\'s glove. Safe?',
            choices: ['Safe — you can go at the first touch', 'Out — you have to wait for the final catch', 'You have to go back and try again', 'It\'s a do-over'],
          },
          {
            sit: { outs: 1, runners: [1], you: 'runner1' },
            prompt: 'Foul pop-up, and the first baseman catches it by the fence in foul territory. Can you tag and go to second?',
            choices: ['Yes — tag-ups work on caught foul balls too', 'No — foul balls are dead', 'Only if it\'s caught in fair territory', 'Only with two outs'],
          },
          {
            sit: { balls: 1, strikes: 1, outs: 1, runners: [1], you: 'runner1' },
            prompt: 'You\'re stealing. The batter foul-tips the pitch and the catcher holds on. Do you have to go back to first?',
            choices: ['No — a caught foul tip is just a strike, keep running', 'Yes — tag up first', 'Yes — it\'s a dead ball', 'Only if the umpire says so'],
          },
          {
            sit: { outs: 1, runners: [1], you: 'runner1' },
            prompt: 'One out, you\'re on first. Foul pop-up, and the first baseman catches it way over by the fence. Drag your runner to where you go.',
            ask: {
              drag: 'YOU',
              setup: [
                [
                  { ball: 'B', to: 'foul1', fly: true, ms: 1400 },
                  { field: '1B', to: 'foul1', ms: 1400 },
                ],
              ],
            },
            targets: [
              { at: 'b2', label: 'Tag up, then take second' },
              { at: 'b1', label: 'Stay on first, foul balls are dead' },
              { at: 'half12', label: 'Halfway to second' },
            ],
          },
        ],
      },
      {
        id: 'u7-ifr-runner',
        title: 'Infield fly as a runner',
        source: 'ghvbl',
        why: 'When the infield fly is called, the batter is out and runners are NOT forced to run. If it\'s caught, tag up to advance; if it drops, you may advance at your own risk. With only a runner on first, the rule is OFF, so the batter must run hard.',
        variants: [
          {
            sit: { outs: 1, runners: [1, 2], you: 'runner2' },
            prompt: 'You\'re on second, runner on first, one out. Pop-up to the shortstop and the umpire calls "Infield fly!" Are you forced to run to third?',
            choices: ['No — the batter is out, so there\'s no force', 'Yes, it\'s a force', 'Only if the ball drops', 'Only the runner on first is forced'],
          },
          {
            sit: { outs: 0, runners: [1], you: 'batter' },
            prompt: 'Runner on first, nobody out. You pop up to the second baseman. Do you jog?',
            choices: ['No — run hard. With only a runner on first, the infield fly rule doesn\'t apply', 'Yes, it\'s an automatic out', 'Yes, the umpire will call infield fly', 'Only if it\'s windy'],
          },
          {
            sit: { outs: 1, runners: [1, 2], you: 'runner2' },
            prompt: 'Infield fly is called and the second baseman drops it. Can you try for third?',
            choices: ['Yes, at your own risk — but you don\'t have to', 'No, never', 'You have to', 'Only if you tagged'],
          },
          {
            sit: { outs: 1, runners: [1, 2], you: 'runner2' },
            prompt: 'One out, you\'re on second with a runner on first. Pop-up to the shortstop, and the umpire calls infield fly. Drag your runner to where you go.',
            ask: {
              drag: 'YOU',
              setup: [
                [
                  { ball: 'B', to: 'SS', fly: true, ms: 1400 },
                  { run: 'R1', to: 'lead1' },
                  { run: 'YOU', to: 'lead2' },
                ],
                [{ say: 'Infield fly! Batter is out.' }, { out: 'B' }],
              ],
            },
            targets: [
              { at: 'b2', label: 'Stay at second, there\'s no force' },
              { at: 'half23', label: 'Halfway to third' },
              { at: 'b3', label: 'Run to third, it\'s a force' },
            ],
          },
        ],
      },
      {
        id: 'u7-dp-slide',
        title: 'Runner on first, ground ball',
        source: 'ghvbl',
        why: 'With fewer than two outs, a ground ball can be a double play. Never come into second standing up; you could take the throw in the face. If you\'re close to the bag, slide straight into it legally. If you\'re nowhere near it, get out of the way. Your league says avoid contact.',
        variants: [
          {
            sit: { outs: 0, runners: [1], you: 'runner1' },
            prompt: 'Ground ball to short, you\'re running to second and you\'re 4 feet from the bag as the throw arrives. What do you do?',
            choices: ['Slide straight into the bag — legally', 'Stay standing up and run through', 'Run into the second baseman', 'Stop and go back to first'],
          },
          {
            sit: { outs: 1, runners: [1], you: 'runner1' },
            prompt: 'Double play ball and you\'re still way short of second when the throw goes to first. What do you do?',
            choices: ['Get out of the way of the play', 'Slide anyway, way short of the bag', 'Run toward the shortstop', 'Jump up and down'],
          },
          {
            sit: { outs: 0, runners: [1], you: 'runner1' },
            prompt: 'True or false: In your league, sliding hard into the fielder to break up a double play is part of the game.',
            tf: false,
          },
          {
            sit: { outs: 1, runners: [1], you: 'runner1' },
            prompt: 'One out, double-play ball. You\'re forced out at second while you\'re still way short of the bag, and the throw is going to first. Drag your runner to where you go.',
            ask: {
              drag: 'YOU',
              setup: [
                [
                  { ball: 'B', to: 'SS', roll: true },
                  { run: 'YOU', to: 'half12' },
                  { field: '2B', to: 'b2' },
                  { run: 'B', to: { x: 118, y: 132 } },
                ],
                [{ ball: 'SS', to: '2B' }, { out: 'YOU' }],
              ],
            },
            targets: [
              { at: { x: 138, y: 56 }, label: 'Peel off, out of the throwing lane' },
              { at: 'b2', label: 'Slide into second anyway' },
              { at: 'half12', label: 'Stay right in the base path' },
            ],
          },
        ],
      },
      {
        id: 'u7-no-free-dp',
        title: 'Make him chase you',
        source: 'fundamental',
        why: 'Runner on first, ground ball to the second baseman right in front of you. Don\'t let him tag you and throw to first for an easy double play. Stop and make him come to you. Every second he spends chasing you is time for the batter to beat it out. Don\'t run back to first, or he just throws there.',
        variants: [
          {
            sit: { outs: 0, runners: [1], you: 'runner1' },
            prompt: 'Ground ball to the second baseman, and he\'s right in your path to second. What\'s smart?',
            choices: ['Stop and make him chase you to tag you', 'Run right past him to second', 'Sprint back to first', 'Walk off the field'],
          },
          {
            sit: { outs: 1, runners: [1], you: 'runner1' },
            prompt: 'Same play — second baseman in front of you. Why not run back to first?',
            choices: ['He\'ll throw to first for the force on the batter and you\'re stuck in a rundown', 'You\'d be out for running backward', 'It\'s too far', 'No reason, it\'s fine'],
          },
          {
            prompt: 'True or false: Stalling to make a fielder chase you can save your team a double play.',
            tf: true,
          },
          {
            sit: { outs: 0, runners: [1], you: 'runner1' },
            prompt: 'Nobody out, you\'re running from first. Ground ball to the second baseman, and he\'s right in your path to second. Drag your runner to where you go.',
            ask: {
              drag: 'YOU',
              setup: [
                [
                  { run: 'YOU', to: 'half12' },
                  { ball: 'B', to: { x: 112, y: 72 }, roll: true },
                  { field: '2B', to: { x: 112, y: 72 } },
                  { run: 'B', to: { x: 118, y: 132 } },
                ],
              ],
            },
            targets: [
              { at: 'half12', label: 'Stop right here and make him chase you' },
              { at: 'b1', label: 'Sprint back to first' },
              { at: 'b2', label: 'Run right past him to second' },
            ],
          },
        ],
      },
      {
        id: 'u7-third-base-risk',
        title: 'Third stinkin\' base',
        source: 'fundamental',
        why: 'Going to third is a gamble. Only go if you\'re sure. With two outs you\'re already in scoring position on second (a hit scores you either way), and with nobody out a grounder or fly ball will move you up anyway. Getting thrown out at third kills rallies.',
        variants: [
          {
            sit: { outs: 2, runners: [2], you: 'runner2' },
            prompt: 'Two outs, you\'re on second. Ball in the hole at short — it\'s close whether you\'d beat a throw to third. Go?',
            choices: ['Stay at second — with two outs, third barely helps', 'Go for it — always take the extra base', 'Go halfway', 'Run home'],
          },
          {
            sit: { outs: 0, runners: [2], you: 'runner2' },
            prompt: 'Nobody out, you\'re on second. Do you need to risk a close play at third?',
            choices: ['No — the next batter can move you up with a grounder or fly', 'Yes, always', 'Only on a full count', 'Only if you\'re fast'],
          },
          {
            sit: { outs: 1, runners: [2], you: 'runner2' },
            prompt: 'True or false: You should decide whether you\'re going to third BEFORE you get to second base.',
            tf: true,
          },
        ],
      },
      {
        id: 'u7-run-home-hard',
        title: 'Run all the way home',
        source: 'fundamental',
        why: 'With two outs, if the third out is made anywhere before you touch home (like the batter tagged out going for second), your run does NOT count. Never jog the last few steps. Full speed until you touch the plate.',
        variants: [
          {
            sit: { outs: 2, runners: [2], you: 'runner2' },
            prompt: 'Two outs, you\'re scoring from second on a single. The batter tries for second and gets tagged out. You touch home a split second later. Does your run count?',
            choices: ['No — the third out came before you scored', 'Yes, you crossed the plate', 'Yes, runs always count', 'Only in the last inning'],
          },
          {
            sit: { outs: 2, runners: [3], you: 'runner3' },
            prompt: 'Two outs, you\'re on third. Base hit. How do you run home?',
            choices: ['All-out sprint until you touch the plate', 'Jog — it\'s a sure run', 'Walk and high-five', 'Slow down near the plate'],
          },
          {
            prompt: 'True or false: With two outs, a run can be wiped out if the third out happens before the runner touches home.',
            tf: true,
          },
        ],
      },
    ],
  },
  {
    id: 'u8',
    title: 'Leads & Steals',
    subtitle: 'Leads, pickoffs & jumps',
    concepts: [
      {
        id: 'u8-free-outs',
        title: 'Don\'t hand them a free out',
        source: 'fundamental',
        why: 'When the pitcher is in trouble (walking batters, can\'t find the plate), the smartest thing is to let him keep struggling. A big lead that gets you picked off hands the defense a free out. If the base ahead of you is full, you can\'t steal anyway, so there\'s nothing to gain.',
        variants: [
          {
            sit: { balls: 2, strikes: 0, outs: 2, runners: [1, 2, 3], you: 'runner1' },
            prompt: 'Last inning, down a run, bases loaded, two outs. The pitcher just walked two in a row. You\'re on first. What kind of lead?',
            choices: ['A small, safe one — let him keep walking people', 'A huge one to rattle him', 'Try to steal second', 'No lead, sit on the bag and talk to the first baseman'],
          },
          {
            sit: { outs: 1, runners: [1, 2], you: 'runner1' },
            prompt: 'Runners on first and second. You\'re on first. Why is a giant lead pointless?',
            choices: ['Second is taken, so you can\'t steal — it only risks a pickoff', 'It isn\'t pointless', 'The umpire won\'t allow it', 'It makes the pitcher throw faster'],
          },
          {
            prompt: 'True or false: When the other pitcher is wild, the offense should try to make outs happen fast.',
            tf: false,
          },
        ],
      },
      {
        id: 'u8-what-if',
        title: 'Ask "what if?" on every pitch',
        source: 'fundamental',
        why: 'On base, keep asking "what if?" What if it\'s in the dirt? What if the catcher\'s throw back gets away? What if the outfielder jogs the ball in? Those chances last one second, and the runner who already planned for them is the one who takes the base.',
        variants: [
          {
            sit: { outs: 1, runners: [2], you: 'runner2' },
            prompt: 'The catcher lobs the ball back to the pitcher and it sails over his head into center. You\'re on second. What do you do?',
            choices: ['Take third right away — you were ready for it', 'Stay — it wasn\'t a hit', 'Wait for the coach to yell', 'Go back toward second'],
          },
          {
            sit: { outs: 0, runners: [1], you: 'runner1' },
            prompt: 'Single to left. You\'re on second now, and the left fielder is slowly jogging the ball back in. What\'s the heads-up play?',
            choices: ['Be ready to take third if nobody covers or he\'s lazy with it', 'Relax, the play is over', 'Walk back to first', 'Ask for time'],
          },
          {
            prompt: 'When should you think about what you\'ll do if the next pitch goes in the dirt?',
            choices: ['Before the pitch', 'After it hits the dirt', 'When the coach yells', 'Never — just react'],
          },
          {
            sit: { outs: 1, runners: [2], you: 'runner2' },
            prompt: 'You\'re on second. The catcher\'s throw back to the pitcher sails over his head into center field. Drag your runner to where you go.',
            ask: {
              drag: 'YOU',
              setup: [
                [{ ball: 'P', to: 'C' }, { run: 'YOU', to: 'lead2' }],
                [{ ball: 'C', to: 'shallowCF', fly: true }, { field: 'CF', to: { x: 100, y: 34 } }],
              ],
            },
            targets: [
              { at: 'b3', label: 'Take third' },
              { at: 'b2', label: 'Stay on second' },
              { at: 'half23', label: 'Go halfway and wait' },
            ],
          },
        ],
      },
      {
        id: 'u8-lead-first',
        title: 'The lead from first',
        source: 'ghvbl',
        why: 'Your league allows leadoffs. Keep a foot on the bag while you get the sign, then shuffle off without crossing your feet. Never take your eyes off the pitcher. Take only as much as you can get back from with one step and a dive, and take the SAME lead every time so you don\'t tip off a steal.',
        variants: [
          {
            sit: { outs: 0, runners: [1], you: 'runner1' },
            prompt: 'How big should your lead off first be?',
            choices: ['As far as you can get back from with one step and a dive', 'As far as possible, every time', 'Halfway to second', 'No lead at all'],
          },
          {
            sit: { outs: 1, runners: [1], you: 'runner1' },
            prompt: 'You have the steal sign this pitch. Should your lead look bigger than usual?',
            choices: ['No — same lead every time so the pitcher can\'t tell', 'Yes, bigger is better', 'Yes, by a step', 'Take no lead to trick him'],
          },
          {
            sit: { outs: 0, runners: [1], you: 'runner1' },
            prompt: 'While you\'re shuffling off first, where are your eyes?',
            choices: ['On the pitcher the whole time', 'On the third-base coach', 'On the batter', 'On the first baseman'],
          },
        ],
      },
      {
        id: 'u8-dive-back',
        title: 'Getting back on a pickoff',
        source: 'ghvbl',
        why: 'On a pickoff throw to first, dive back to the outfield-side corner of the bag. It\'s the farthest spot from the tag and you can see an overthrow. Keep your hand on the bag until you KNOW the pitcher has the ball again. (Headfirst is allowed at 12U in your league.)',
        variants: [
          {
            sit: { outs: 1, runners: [1], you: 'runner1' },
            prompt: 'Pickoff throw! Where do you dive back to?',
            choices: ['The back corner of the bag, on the outfield side', 'The front of the bag, toward home', 'Right into the first baseman', 'You don\'t dive — walk back'],
          },
          {
            sit: { outs: 0, runners: [1], you: 'runner1' },
            prompt: 'You dove back safely. When can you take your hand off the bag?',
            choices: ['When you\'re sure the pitcher has the ball', 'Right away', 'When the first baseman steps away', 'When you stand up'],
          },
          {
            sit: { outs: 1, runners: [1], you: 'runner1' },
            prompt: 'True or false: Many pitchers have a slower pickoff move to bait you, and a quicker one they save.',
            tf: true,
          },
        ],
      },
      {
        id: 'u8-lead-second',
        title: 'The lead from second',
        source: 'fundamental',
        why: 'On second, your big job is scoring on a single. If you\'re not stealing, take your lead a couple of steps behind the baseline (toward the outfield). That lets you round third tight and take the short way home. Keep your eyes on the pitcher, and the coach will warn you if the shortstop sneaks in.',
        variants: [
          {
            sit: { outs: 2, runners: [2], you: 'runner2' },
            prompt: 'Two outs, you\'re on second, no steal sign. Where do you take your lead?',
            choices: ['A couple of steps behind the baseline, so you can round third tight', 'Right on the baseline', 'In front of the baseline, toward the mound', 'Stay on the bag'],
          },
          {
            sit: { outs: 1, runners: [2], you: 'runner2' },
            prompt: 'You\'re leading off second. Who tells you if the shortstop is sneaking behind you?',
            choices: ['Your third-base coach — your eyes stay on the pitcher', 'Nobody, turn around and check', 'The batter', 'The umpire'],
          },
          {
            sit: { outs: 2, runners: [2], you: 'runner2' },
            prompt: 'True or false: With two outs, you run on contact from second and you have to score on a hit to the outfield.',
            tf: true,
          },
          {
            sit: { outs: 2, runners: [2], you: 'runner2' },
            prompt: 'Two outs, you\'re on second. Ground-ball single into right field. Drag your runner to where you go.',
            ask: {
              drag: 'YOU',
              setup: [
                [{ run: 'YOU', to: 'lead2' }, { ball: 'P', to: 'C' }],
                [
                  { ball: 'B', to: 'shallowRF', roll: true },
                  { field: 'RF', to: 'shallowRF' },
                  { run: 'YOU', to: 'half23' },
                  { run: 'B', to: { x: 118, y: 128 } },
                ],
              ],
            },
            targets: [
              { at: 'home', label: 'All the way home to score' },
              { at: 'b3', label: 'Stop at third' },
              { at: 'b2', label: 'Go back to second' },
            ],
          },
        ],
      },
      {
        id: 'u8-lead-third',
        title: 'The lead from third',
        source: 'fundamental',
        why: 'Lead off third in FOUL territory. If a batted ball hits you there, it\'s just a foul ball. Come back in FAIR territory so you\'re in the catcher\'s throwing lane. On a fly ball with fewer than two outs, go straight back to the bag to tag.',
        variants: [
          {
            sit: { outs: 1, runners: [3], you: 'runner3' },
            prompt: 'Where do you take your lead off third?',
            choices: ['In foul territory', 'In fair territory', 'Right on the chalk line', 'Behind the bag'],
          },
          {
            sit: { outs: 0, runners: [3], you: 'runner3' },
            prompt: 'You\'re leading off third in foul territory and a line drive hits you. What happens?',
            choices: ['Foul ball — you\'re not out', 'You\'re out', 'You get home', 'The batter is out'],
          },
          {
            sit: { outs: 1, runners: [3], you: 'runner3' },
            prompt: 'One out, fly ball to center. You\'re leading off third. What\'s your move?',
            choices: ['Get straight back to the bag and tag', 'Go halfway and wait', 'Run home right away', 'Freeze where you are'],
          },
          {
            sit: { outs: 1, runners: [3], you: 'runner3' },
            prompt: 'One out, you\'re leading off third. Fly ball to center field. Drag your runner to where you go while it\'s in the air.',
            ask: {
              drag: 'YOU',
              setup: [[{ run: 'YOU', to: { x: 58, y: 117 } }], [{ ball: 'B', to: 'CF', fly: true }]],
            },
            targets: [
              { at: 'b3', label: 'Straight back to third to tag up' },
              { at: 'half3H', label: 'Halfway home and wait' },
              { at: 'home', label: 'Run home right away' },
            ],
          },
        ],
      },
      {
        id: 'u7-steal-timing',
        title: 'Steal on the pitch, not the leg lift',
        source: 'fundamental',
        realPlay: true,
        why: 'Go when the pitcher has committed to throwing home. A leg lift isn\'t a commitment: a righty can still step off, and a lefty can throw to first. Learn his move from the dugout.',
        variants: [
          {
            sit: { balls: 1, strikes: 0, outs: 0, runners: [1], you: 'runner1' },
            prompt: 'You have the steal sign. The pitcher lifts his leg. Do you go?',
            choices: ['Not yet — wait until he commits to home', 'Yes, the leg lift means go', 'Only if he looks at you', 'Go before he gets set'],
          },
          {
            sit: { balls: 0, strikes: 0, outs: 1, runners: [1], you: 'runner1' },
            prompt: 'Left-handed pitcher. Why is leaving on the leg lift extra risky?',
            choices: ['A lefty faces first base, so his leg can still go either way', 'Lefties throw slower', 'Lefties can\'t throw to first', 'It isn\'t risky'],
          },
          {
            sit: { balls: 1, strikes: 1, outs: 1, runners: [1], you: 'runner1' },
            prompt: 'When\'s the best time to study the pitcher\'s move to first?',
            choices: ['From the dugout and on deck, before you\'re on base', 'Only after he picks you off', 'You can\'t learn it', 'Between innings, by asking him'],
          },
        ],
      },
      {
        id: 'u7-secondary',
        title: 'Secondary lead',
        source: 'fundamental',
        why: 'As the pitch is delivered, take two or three shuffle steps toward the next base. You\'re moving when the ball reaches the plate, so you get a better jump on a hit or a ball in the dirt.',
        variants: [
          {
            sit: { outs: 1, runners: [1], you: 'runner1' },
            prompt: 'The pitch is on its way home. What should you be doing on first?',
            choices: ['Shuffling a couple of steps toward second', 'Standing still on your lead', 'Walking back to the bag', 'Sprinting to second'],
          },
          {
            sit: { outs: 0, runners: [2], you: 'runner2' },
            prompt: 'After a secondary lead, the catcher catches the pitch cleanly. What now?',
            choices: ['Get back to the base, watching the catcher', 'Keep going', 'Stand there', 'Turn your back and walk'],
          },
          {
            prompt: 'True or false: A secondary lead helps you score on a ball in the dirt.',
            tf: true,
          },
        ],
      },
      {
        id: 'u7-wild-pitch',
        title: 'Ball in the dirt',
        source: 'fundamental',
        why: 'Watch every pitch as it reaches the catcher. If it gets past him, go. On a ball blocked right in front of him, read it — don\'t run into an out.',
        variants: [
          {
            sit: { balls: 2, strikes: 1, outs: 1, runners: [1], you: 'runner1' },
            prompt: 'You\'re on first. Pitch in the dirt bounces way past the catcher to the backstop. What do you do?',
            choices: ['Go to second', 'Stay on first', 'Wait for the coach', 'Run back to the bag'],
          },
          {
            sit: { balls: 1, strikes: 1, outs: 0, runners: [3], you: 'runner3' },
            prompt: 'You\'re on third. The catcher blocks a pitch and it stops right in front of him. Go home?',
            choices: ['No — he\'ll pick it up and tag you', 'Yes, always go', 'Go halfway', 'Only with two outs'],
          },
          {
            prompt: 'Where should a base runner\'s eyes be as the pitch reaches the plate?',
            choices: ['On the ball as it gets to the catcher', 'On the pitcher', 'On the dugout', 'On the next base'],
          },
          {
            sit: { balls: 1, strikes: 1, outs: 1, runners: [1], you: 'runner1' },
            prompt: 'You\'re on first. The pitch bounces in the dirt and gets way past the catcher to the backstop. Drag your runner to where you go.',
            ask: { drag: 'YOU', setup: [[{ run: 'YOU', to: 'lead1' }, { ball: 'P', to: 'backstop' }]] },
            targets: [
              { at: 'b2', label: 'Go to second' },
              { at: 'b1', label: 'Back to first' },
              { at: 'half12', label: 'Halfway to second and wait' },
            ],
          },
          {
            sit: { balls: 2, strikes: 1, outs: 0, runners: [3], you: 'runner3' },
            prompt: 'You\'re on third. The pitch is in the dirt, but the catcher blocks it and it stops right in front of him. Drag your runner to where you go.',
            ask: {
              drag: 'YOU',
              setup: [
                [
                  { run: 'YOU', to: { x: 58, y: 117 } },
                  { ball: 'P', to: { x: 100, y: 156 } },
                  { field: 'C', to: { x: 100, y: 157 } },
                ],
              ],
            },
            targets: [
              { at: 'b3', label: 'Back to third' },
              { at: 'home', label: 'Run home' },
              { at: 'half3H', label: 'Halfway home' },
            ],
          },
        ],
      },
      {
        id: 'u7-pickoff-read',
        title: 'Watch for fake-to-third',
        source: 'ghvbl',
        why: 'In your league, a pitcher can fake a throw to third and then throw to first. On first, don\'t take off when he spins to third — wait until the ball goes home or he throws.',
        variants: [
          {
            sit: { outs: 1, runners: [1, 3], you: 'runner1' },
            prompt: 'Runners on first and third. The pitcher spins and fakes a throw to third. What do you do on first?',
            choices: ['Stay alert and ready to dive back — he may throw to you next', 'Take off for second', 'Relax', 'Walk off the bag'],
          },
          {
            prompt: 'True or false: In GHVBL, fake to third then throw to first is a legal pickoff move.',
            tf: true,
          },
          {
            sit: { outs: 0, runners: [1, 3], you: 'runner1' },
            prompt: 'Why do pitchers use fake-to-third, throw-to-first?',
            choices: ['To catch the runner on first relaxing or leaning', 'To get a balk', 'To waste time', 'It doesn\'t work'],
          },
          {
            sit: { outs: 1, runners: [1, 3], you: 'runner1' },
            prompt: 'Runners on first and third. You\'re on first. The pitcher spins and fakes a throw to third. Drag your runner to where you go.',
            ask: {
              drag: 'YOU',
              setup: [
                [{ run: 'YOU', to: 'lead1' }, { run: 'R3', to: { x: 58, y: 117 } }],
                [{ field: 'P', to: { x: 94, y: 104 } }, { say: 'Fake to third!', who: 'P' }],
              ],
            },
            targets: [
              { at: 'b1', label: 'Back to first, ready to dive' },
              { at: 'b2', label: 'Take off for second' },
              { at: 'half12', label: 'Break halfway to second' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'u9',
    title: 'Know the Rules',
    subtitle: 'The rulebook edge',
    concepts: [
      {
        id: 'u9-two-on-a-base',
        title: 'Two runners, one base',
        source: 'fundamental',
        why: 'A base belongs to the runner who got there first, so if two runners are standing on it and both get tagged, the trailing runner is out. The exception is a force: if the lead runner HAD to move up, the base belongs to the trailing runner, and the lead runner is out.',
        variants: [
          {
            sit: { outs: 1, runners: [2, 3], you: 'runner2' },
            prompt: 'You\'re on second, teammate on third. He gets caught in a rundown and chased back to third — while you ran to third. Now you\'re both on the bag and both get tagged. Who\'s out?',
            choices: ['You — nobody forced him off third, so it\'s his base', 'Him', 'Both of you', 'Neither'],
          },
          {
            sit: { outs: 0, runners: [1, 2], you: 'runner2' },
            prompt: 'Runners on first and second. Ground ball forces you to run to third, but you go back to second. Now you and the runner from first are both on second, both tagged. Who\'s out?',
            choices: ['You — you were forced to leave, so the base belongs to him', 'Him', 'Both of you', 'Nobody'],
          },
          {
            prompt: 'True or false: Two runners can both be safe on the same base.',
            tf: false,
          },
        ],
      },
      {
        id: 'u9-weird-awards',
        title: 'Weird-but-real base awards',
        source: 'fundamental',
        coachCheck: 'Stuck-in-the-fence can be a ground rule. Confirm for his fields.',
        why: 'Rules nobody expects: if a fielder throws his glove (or uses his cap) to stop a fair batted ball, every runner gets 3 bases. A pitch that sticks in the umpire\'s or catcher\'s mask is 1 base for runners. A ball that gets stuck in the outfield fence is usually 2 bases.',
        variants: [
          {
            sit: { outs: 0, runners: [], you: 'batter' },
            prompt: 'You hit a ball into the gap and the outfielder throws his glove at it and knocks it down. What do you get?',
            choices: ['Three bases', 'Nothing — it\'s legal', 'One base', 'An automatic home run'],
          },
          {
            sit: { outs: 1, runners: [2], you: 'runner2' },
            prompt: 'The pitch bounces and gets stuck in the umpire\'s mask. You\'re on second. What happens?',
            choices: ['You move up one base', 'Nothing, re-pitch', 'You score', 'You\'re out'],
          },
          {
            sit: { outs: 1, runners: [], you: 'batter' },
            prompt: 'Your hit gets wedged in the outfield fence and the fielder can\'t pull it out. Usually what\'s the call?',
            choices: ['Two bases', 'Home run', 'Single', 'Do-over'],
          },
          {
            sit: { outs: 0, runners: [], you: 'batter' },
            prompt: 'You hit one into the gap, and the left fielder throws his glove at it and knocks it down. Drag Skip to the base you\'re awarded.',
            ask: {
              drag: 'YOU',
              setup: [
                [
                  { ball: 'B', to: 'gapLC', fly: true },
                  { field: 'LF', to: 'gapLC' },
                  { run: 'YOU', to: 1 },
                ],
                { say: 'He threw his glove at it!', who: 'LF' },
              ],
            },
            targets: [
              { at: 'b3', label: 'Third base. A thrown glove is three bases' },
              { at: 'b1', label: 'Stay at first' },
              { at: 'b2', label: 'Second base' },
              { at: 'home', label: 'All the way home' },
            ],
          },
          {
            sit: { outs: 1, runners: [2], you: 'runner2' },
            prompt: 'You\'re on second. The pitch bounces and gets stuck in the umpire\'s mask. Drag Skip to the base you\'re awarded.',
            ask: {
              drag: 'YOU',
              setup: [{ ball: 'P', to: { x: 100, y: 167 } }, { say: 'Stuck in the ump\'s mask!' }],
            },
            targets: [
              { at: 'b3', label: 'Third base. Runners get one base' },
              { at: 'b2', label: 'Stay on second' },
              { at: 'home', label: 'Score' },
            ],
          },
        ],
      },
      {
        id: 'u9-reach-first',
        title: 'Ways to reach first',
        source: 'fundamental',
        why: 'There are seven ways to reach first safely: a hit, a walk, hit by pitch, an error, a fielder\'s choice, a dropped third strike, and catcher\'s interference (the catcher\'s glove touches your bat on a swing). Know them all, and always run.',
        variants: [
          {
            sit: { balls: 1, strikes: 1, outs: 0, you: 'batter' },
            prompt: 'You swing and your bat hits the catcher\'s glove. What usually happens?',
            choices: ['Catcher\'s interference — you\'re awarded first', 'It\'s a strike', 'It\'s a foul ball', 'You\'re out'],
          },
          {
            prompt: 'Which one does NOT get you to first base?',
            choices: ['A strikeout the catcher catches cleanly', 'Hit by pitch', 'A fielder\'s choice', 'A dropped third strike with first open'],
          },
          {
            sit: { outs: 1, runners: [2], you: 'batter' },
            prompt: 'You ground to short and he throws to third to get the runner. You\'re safe at first. What\'s that called?',
            choices: ['A fielder\'s choice', 'A hit', 'An error', 'A sacrifice'],
          },
        ],
      },
      {
        id: 'u9-position-numbers',
        title: 'Speak scorebook',
        source: 'fundamental',
        why: 'Every position has a number: pitcher 1, catcher 2, first 3, second 4, third 5, shortstop 6, left 7, center 8, right 9. A "6-4-3" double play goes short to second to first. Knowing these lets you talk the game like a ballplayer.',
        variants: [
          {
            prompt: 'A "6-4-3 double play" goes from…',
            choices: ['Shortstop to second baseman to first baseman', 'Third to second to first', 'Second to short to first', 'Pitcher to catcher to first'],
          },
          {
            prompt: 'What number is the center fielder?',
            choices: ['8', '7', '9', '6'],
          },
          {
            prompt: 'A "4-3" groundout means…',
            choices: ['Second baseman fielded it and threw to first', 'Shortstop threw to first', 'First baseman threw to second', 'Third baseman to first'],
          },
          {
            sit: { outs: 0, runners: [1], you: 'batter' },
            prompt: 'The scorebook says the double play went 6-4-3. Tap the player who fielded the ground ball.',
            ask: { tap: true },
            targets: [
              { at: 'SS', label: 'The shortstop, number 6' },
              { at: '3B', label: 'The third baseman' },
              { at: '2B', label: 'The second baseman' },
              { at: 'P', label: 'The pitcher' },
            ],
          },
          {
            sit: { outs: 1, runners: [], you: 'batter' },
            prompt: 'The scorer writes down a fly out to number 8. Tap the player who caught it.',
            ask: { tap: true },
            targets: [
              { at: 'CF', label: 'The center fielder, number 8' },
              { at: 'LF', label: 'The left fielder' },
              { at: 'RF', label: 'The right fielder' },
              { at: 'SS', label: 'The shortstop' },
            ],
          },
        ],
      },
      {
        id: 'u9-appeal',
        title: 'Missed a base? Appeal it',
        source: 'fundamental',
        coachCheck: 'Confirm how umpires in his league handle appeals.',
        why: 'If a runner misses a base or leaves too early on a tag-up, the umpire won\'t call it on his own. The defense has to appeal: touch the base (or tag the runner) with the ball and tell the umpire, before the next pitch.',
        variants: [
          {
            sit: { outs: 1, runners: [3], you: '3B' },
            prompt: 'You\'re playing third. The runner tagged on a fly ball, but you\'re sure he left before the catch. What do you do?',
            choices: ['Get the ball, step on third, and appeal to the umpire before the next pitch', 'Nothing — the umpire would have called it', 'Argue with the umpire', 'Tag the batter'],
          },
          {
            sit: { outs: 0, runners: [], you: '1B' },
            prompt: 'You see the batter-runner miss first base on his way to a double. How do you get the out?',
            choices: ['With the ball, touch first and appeal before the next pitch', 'Yell at him', 'It\'s automatic', 'Tag him at second'],
          },
          {
            prompt: 'True or false: If a runner misses a base, the umpire calls him out right away without anyone asking.',
            tf: false,
          },
          {
            sit: { outs: 1, runners: [3], you: '3B' },
            prompt: 'You\'re at third. Fly ball to left, and the runner on third left before the catch and scored. The left fielder throws you the ball. Drag Skip to where you go.',
            ask: {
              drag: 'YOU',
              setup: [
                [
                  { ball: 'B', to: 'shallowLF', fly: true },
                  { field: 'LF', to: 'shallowLF' },
                  { run: 'R3', to: 'half3H', ms: 500 },
                ],
                [{ run: 'R3', to: 'home' }, { ball: 'LF', to: 'YOU' }],
              ],
            },
            targets: [
              { at: 'b3', label: 'Step on third and appeal to the umpire' },
              { at: 'P', label: 'Toss the ball back to the pitcher' },
              { at: 'home', label: 'Chase the runner to home plate' },
            ],
          },
        ],
      },
    ],
  },
  { id: 'u10', title: 'Reset', subtitle: 'The mental game', concepts: [] },
];

// The reward ladder. Jay decides the real rewards and requirements — edit freely.
// 'allMastered' = every concept in every unit mastered (including units not written yet,
// so the glove can't be earned until the last unit drops). Smaller "fun" rewards before
// the glove are still TBD (decided 2026-10-28).
export const IQ_REWARDS = [
  { id: 'first-base-glove', title: 'First Baseman\'s Glove', requirement: 'Master every unit', type: 'allMastered' },
];

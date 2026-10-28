# Heads Up (formerly Next Pitch) — Project Status

## First-launch tour + name + share-ready (2026-10-28, NOT yet committed or deployed)

Jay asked how a new player learns the app, noticed "Owen" was hard-coded, and wants to share it with other players. Decisions: **progress saves on each player's device** (no setup), and an **in-app tour first** (a HyperFrames video can come later for sharing with families).
- New welcome screen: **Get started** = local mode (`creds = { mode: 'local' }`, state in localStorage, zero GitHub calls). "Sync with a Gist instead" reveals the old Gist form. Owen's iPad keeps its Gist creds and is unaffected.
- All writes go through `saveState(mutate)` (local or Gist). Name lives in `state.profile = { name, tourDone }`, synced with the rest of the data. `PLAYER_NAME` is now only the "Player" fallback.
- 5-step Skip tour (name → read the play → three outs → master it → streaks/XP), shown whenever `profile.tourDone` is false: first launch, Owen's existing Gist (no profile yet), and after the triple-tap reset. Replay from Profile → Settings.
- Local-mode limit: progress is lost if the player deletes the app or switches devices.
- Verified headless: name required, tour → home greets by name, progress survives reload, local mode makes zero GitHub calls, Gist mode saves the name and keeps existing XP. `sw.js` cache v9.

## Look: "Ballpark Classic", from Jay's brand sheet (2026-10-28, NOT yet committed or deployed)

Jay supplied a brand sheet (logo lockups, retro rubber-hose mascot heads/poses, palette navy #0E2A47 / red #E6392D / cream #F5EBD7) and phone + web mockups. Originals saved in `_brand/` (git-ignored). Replaces Primetime below. **Kept our game rules over the mockups** (Jay's call): outs not hearts, no leaderboard, nothing locked, drawn field diagrams. Art is **cut from the sheets for now** (`img/skip/head-*.png`, `pose-*.png`, `img/logo.png`, icons cropped from the mockup's red app icon); Jay will send clean transparent exports later. Swapping files at the same paths needs no code change. The big full-body mascot couldn't be cut (navy cap on navy background).
- Home: welcome line, poster-style "today's at-bat" card (red sun + batting pose), "Keep it going!" streak week (new `playedDays` in the engine + `weekPlayed()`), My Progress units with their own color + icon, a cream Pro Tip card (one original tip a day).
- Lesson: unit tag, sentence-case prompt, A–D pill answers, green/red feedback sheets with a Skip reaction head and a cream explanation card. Results: Skip over a spinning red burst, Right/XP/Streak tiles.
- Rewards: glove card, 8 auto-earned badges, ranks. Profile: avatar (Skip in shades), stat tiles, colored skill progress bars.
- Desktop: sidebar logo + red active nav + tagline; right rail streak / rank / glove / Pro Tip.
- Verified headless at 375/390/820/1180/1440, full lesson + results + rewards + profile, zero errors; engine tests pass. `sw.js` cache v8 (precaches all art).

## Book pass: Baseball IQ for Kids and Teens (2026-10-28, NOT yet committed or deployed)

Jay added 52 screenshots of the Amazon sample (pp. 1–48: rules, positions, most of the baserunning chapters) to `_books/` (git-ignored, never commit). 23 new situations written in our own words: Baserunning additions, a new **Leads & Steals** unit (u8; 4 existing lead/steal concepts moved in, ids unchanged so progress is safe), a new **Know the Rules** unit (u9), 3 Outfield (wall then ball, when to let a foul drop, get it to the infield), and the hit-and-run. Reset is now u10. Total: 86 situations / 258 cards, 29 marked for the coach. Deliberately skipped the book's "angle your slide at the throw" tip because GHVBL is avoid-contact. The rest of the book (hitting, infield, outfield, pitching, catching) is not in the sample; its table of contents is a good topic list. `sw.js` cache v7.

## Content + Skip round 2 (2026-10-28, NOT yet committed or deployed)

Jay: questions felt basic and repetitive; he wants a wide variety of position scenarios ("you're in right, man on second, fly ball..."). Added 5 units: Outfield (10), First Base (9), Up the Middle 2B/SS (7), Around the Diamond P/C/3B (6), Baserunning (14). Reset moved to u8, still empty (book material). Now 63 situations / 189 cards. Variants are different situations, not rewordings. **Engine change:** no unit locking. Every written unit is open and new situations are dealt round-robin across units (`freshConceptIds` in iq.js), so a lesson mixes positions. The season list collapses units (tap to open). Skip redrawn as a 1930s rubber-hose cartoon (ink outlines, pie-cut eyes, big grin); icons regenerated. `sw.js` cache v6. Card list for coach review regenerated in `game-iq-cards-review.md` (🧢 = coach should confirm).

## Look: "Primetime" (2026-10-28, NOT yet committed or deployed)

Replaces the Fresh Grass look below the same day; Jay didn't love it, picked direction A of 3 mockups. A night game under the lights: navy sky with stadium-light glow, Mets orange primary, Barlow Condensed broadcast type (bundled in `fonts/`, OFL-licensed, cached by the service worker), dark only. Play screen = orange "today's at-bat" card + units as a list of levels, open unit shows each situation with mastery pips and an UP NEXT flag. Lessons show a TV-style count bug (count / outs / runners / you) over the field. Skip got a navy cap with an orange H; app icon regenerated. Verified headless at 375/390/820/1180/1440 widths, full lesson + three-outs → review flow, zero errors. `sw.js` cache v5.

## Rebrand + responsive redesign: "Heads Up" (2026-10-28, look superseded by Primetime above)

Jay dropped the Street Drop look (a mobile-only column that read as a "mohawk of content" on
desktop) for a clean, fun, Duolingo-inspired, baseball-themed design, with Apple's HIG as the
tiebreaker. Decided by direct questions: name **Heads Up** (from "heads-up baseball"),
mascot **Skip** (an original baseball-headed coach, a nod to Mr. Met, in a clay "H" cap),
**Fresh Grass** palette, and "just build it" (no mockup round).

- `css/style.css` fully replaced. Tokens on `:root` with automatic dark mode, the system rounded
  font (`ui-rounded` = SF Pro Rounded on Apple, Nunito elsewhere), chunky 3D press-down buttons,
  44pt+ tap targets, safe areas, and reduced motion.
- Responsive shell: phone = top bar (streak/XP chips) + bottom tab bar; 768px+ = left sidebar;
  1180px+ = right stats rail (streak, rank, glove). Tabs: Play, Rewards, Owen (Me).
- Play = a Today card (Skip + speech bubble + outs lights) and a Duolingo-style zigzag path:
  one node per concept, a progress ring per mastery box, gold star when mastered, locks, and a
  bouncing PLAY flag.
- Lessons are full-screen: pick → Check → a green/red feedback sheet with Skip's reaction.
  Keyboard 1–4 + Enter. On 1024px+, the situation is on the left and the answers on the right.
  Situations draw as a real ballpark (grass, dirt, bases, runner tokens, pulsing blue YOU) under
  a scoreboard with ball/strike/out lights.
- Synthesized sound effects (WebAudio, no files), toggle on the Me tab.
- New icons rendered from Skip's SVG, manifest renamed with the portrait lock removed, SW
  cache `heads-up-cache-v4`. The repo folder, Gist file name, and localStorage keys keep the
  next-pitch names on purpose (renaming would orphan saved data).
- Verified with headless Chromium at 390, 820, 1180, and 1440 widths plus dark mode, a
  full lesson, the inning-over → review flow, and zero console errors.


## Game IQ (built 2026-10-28, NOT yet committed or deployed)

A Duolingo-style baseball-knowledge game, now the whole app at launch. `PRACTICE_ENABLED = false`
in `js/data.js` hides the Reset Play onboarding + daily practice flow (code and data untouched;
flip to `true` to bring them back, with Game IQ as a card on the practice home).

- **Content:** `js/iq-content.js`. Units → concepts → 3 variants each (different wording,
  format, or situation). Units 1–2 written (17 concepts, 51 cards); Units 3–6 show as "Coming
  Soon". Rules cards checked against the GHVBL 11U/12U rulebook (NFHS-based). Two cards come
  from Owen's real plays. `game-iq-cards-review.md` = readable list for Jay/coach review,
  generated from the content file. `game-iq-concepts.md` = the full concept plan for all 6 units.
- **Engine:** `js/iq.js`, pure functions. Spaced repetition (boxes 0–4, intervals 1/3/7/14
  days, one move per concept per day, so mastery takes at least 11 days); a miss drops two boxes.
  Each lesson = due reviews + up to 3 new concepts, 5 cards. Choices shuffle, variants rotate.
- **Outs, not hearts:** each wrong answer is an out, three outs ends the inning and locks new
  lessons until a Fix-Your-Mistakes review (misses requeue reworded, cost no outs) or tomorrow.
- **XP, ranks** (Rookie → Field General), a Game IQ day streak, and a rewards panel
  (`IQ_REWARDS`: first baseman's glove for mastering every unit; smaller rewards TBD).
- **Saving:** one Gist write per lesson (`gameIq` key, replayed via `applyLesson` inside
  `commitMutation`). The in-progress lesson lives in localStorage (`next-pitch:iqLesson`), so
  reloading resumes it, outs included.
- **Verified:** Node engine checks + headless Chromium against a mocked Gist (full lesson,
  mid-lesson reload, inning over, review clearing outs). Zero console errors.


**Status: Full "Street Drop" visual identity built into the real app
(2026-08-20), smoke-tested, committed, pushed, live on GitHub Pages.
Real Gist connected and tested by Jay. Not yet opened on Owen's iPad.**

## Visual identity — Street Drop (current, live)

Jay wasn't happy with the app's look-and-feel and asked for a proper
design exploration before more feature work. That happened as a
multi-round design-canvas process (mockups only, not app code) —
researched two real streetwear/baseball brands he named (Dirty Mids,
Baseballism), built and iterated several directions, and Jay picked
**Street Drop** (Dirty Mids-inspired) after seeing it applied across
every real screen in the app, not just Home. Full history of that
process — rejected directions, why, and the specific feedback that
shaped each refinement — is in project memory (`design_exploration_street_drop.md`).
This section covers only what's actually live now:

- **Palette:** near-black (`--bg: #0a0a0a`), lime green as the one
  interactive/primary color (`--accent: #d4ff1f` — buttons, active
  states, bars, the wordmark's "PITCH"), a narrow blue used ONLY for
  the "best streak" number (`--accent-2: #29c8ff`) so it doesn't dilute
  lime's role, and a baseball-stitch red (`--stitch: #c8102e`) used
  only for the Reset Play card's dashed border. `--danger` (muted dark
  red, `#7a1f1f`) is unchanged from before — kept distinct from
  `--stitch` so destructive actions don't look like a stitch accent.
- **Fonts:** Big Shoulders (bold condensed, all UI chrome — titles,
  buttons, labels, numbers, the wordmark) + Archivo (body copy) via
  Google Fonts, loaded in `index.html`.
- **Logo:** two crossed baseball bats (tapered barrel-to-handle, round
  knob) — `crossedBatsIcon()` in `js/app.js`. An earlier round added a
  ball at the center; Jay said it looked "weird" once he actually saw
  it live, and asked to go back to his original idea of just crossed
  bats. Regenerated `icons/icon-180.png`/`icon-512.png` to match via a
  separate PIL implementation (same geometry, since PIL can't render
  the SVG directly) — **hit a real coordinate-scaling bug** the first
  time (forgot to scale the knob-circle position by the icon's
  size/100 factor, which clustered both knobs in one corner instead of
  at the two bat handles) — caught by actually rendering the PNG, not
  by reading the script, and fixed before shipping.
- **Recurring baseball-motif icons**, both new helper functions in
  `js/app.js`: `plateIcon()` — a small home-plate pentagon
  (`clip-path`), used as a bullet before every "Day N" label
  everywhere in the daily flow, AND as the shape for two specific
  badges: the Home hero card's corner "Streak" tag (flush in the
  corner, not floating/rotated — Jay called out the earlier floating
  rotated version as looking "random") and the Reset Play card's
  "NEXT PITCH" payoff badge (right-justified, per Jay's specific ask —
  it was left-aligned before). `stitchIcon()` — a small red X mark
  used before "Your Reset Play" and "Practice Breakdown" section
  titles, and reused for the onboarding progress dots (`.dot`/`.dot
  line`/`.dot.active line` in CSS) instead of plain circles.
- **`.btn-plate` is a deliberate, narrow modifier** — the home-plate
  taper on primary buttons applies ONLY to genuine "go" actions (Start
  Today, Finish Day, Let's Go, Connect, Continue, I'm Back, I watched
  it, This is my Reset Play!, Done — I did my reset rep) via an
  explicit `btn-plate` class added alongside `btn-primary` on each of
  those 11 button call sites. It deliberately does NOT apply to the
  Yes/No practiced toggle (same `.btn-primary`/`.btn-outline` classes,
  reused for a binary choice, not a CTA) or to `.btn-danger`/`.btn-outline`
  (Reset Everything / Cancel) — confirmed by checking call sites
  directly, not just applying a blanket CSS rule, since a global
  `.btn-primary { clip-path: ... }` would have caught the toggle too.
- **Sharp corners everywhere** (`border-radius: 0` on cards, buttons,
  chips, inputs, option-cards) — confirmed by grepping the actual
  approved mockup files for `border-radius` and finding zero hits
  before porting, rather than assuming rounded corners carried over
  from the pre-redesign app.
- A faint baseball-seam watermark on the hero title screens (Welcome,
  Reset Play confirmation, Go Time) was tried and explicitly rejected
  by Jay ("remove... but subtle instead of loud" — his own words back
  at me) — do not reintroduce it.
- The checkbox checkmark on "When do you want to use your reset?"
  deliberately stayed a plain ✓, not a pentagon/stitch icon — Jay's
  own call when asked directly, since it's a functional indicator, not
  a decorative spot.
- **Verification:** ported by directly translating the approved,
  screenshotted mockup CSS into the real app's existing class names
  (not renaming anything in the DOM/JS), then re-verified by actually
  running the real app end-to-end against a mocked Gist (Playwright,
  zero console errors) and screenshotting every screen type — home,
  full onboarding, the full daily loop, and the reset-everything
  confirmation. That pass caught one real porting bug (mini-stat
  number/label were `<span>`s that need explicit
  `flex-direction:column` to stack — the mockup's equivalent used
  block `<div>`s, which stack for free — so the CSS rule needed an
  addition that wasn't obvious just from reading the mockup's CSS).

## Original phase-1 build (superseded by the above, kept for history)

Personal project (not a Konica Minolta playbook) — a single-user iPad PWA
for Owen's daily hitting practice accountability, branded **Next Pitch**.
Repo: `/Users/jackerman/Documents/next-pitch`, pushed to
`github.com/jasonackerman1/next-pitch` (public code repo — no personal
data lives here, that's all in the secret Gist once Jay creates it).
Live at **https://jasonackerman1.github.io/next-pitch/**.

Full requirements: `owen-hitting-app-spec.md` at the repo root (original
filename kept for traceability to the original ask) — that's the source
of truth for scope, re-read it before making scope calls. The name
**"Next Pitch"** and the full visual identity below were decided in a
later session, after the spec — not in that file.

## Brand identity (added after the initial build; palette/logo replaced again in round 2 below)

- **Name: Next Pitch.** Core idea: no matter what just happened — good or
  bad — the only thing that matters is the next pitch. This is meant to
  run through the whole app, not just sit at the top as a title.
- **Visual direction:** clean, simple, mature — a real tool Owen can keep
  using as he gets older, not a kid-app he'll outgrow. No emoji anywhere
  in the UI (there were several in the original build — 🔥🎉🏃⚾🤚💬➡️ — all
  removed in the rebrand pass).
- **"Next Pitch" language woven into the flow, not just the title:** the
  Reset Play card's fixed payoff line is a standalone accent-colored
  "NEXT PITCH" badge, distinct from Owen's two personal choices above it
  (his action, his cue phrase); the post-check-in toast (round 2, see
  below) carries the same line.

## Round 2 redesign (same-day follow-up after Jay's first real test pass)

Jay tested the app for real and came back with five things: cut the post-check-in "saved!"
screen, make the Reset Play always visible on home instead of hidden behind a button, add
more homepage stats, do a full visual pass in Owen's actual team colors, and add a real
first-time explanation of what the app does.

- **No more "saved!" screen.** Submitting check-in now saves and lands directly back on
  home (there's nothing else to do that day) — a small auto-dismissing toast
  ("Day N logged — Next Pitch.") carries the payoff line instead of a screen requiring an
  extra tap. `renderDaySummary`/`lastCompletedDay`/the `daySummary` view are gone entirely.
- **Palette replaced with Owen's real team colors — black/red/yellow**, not the round-1
  navy/amber: `--bg: #0a0a0a`, `--accent: #e2231a` (red, used for anything interactive —
  buttons, selected states, active dots), `--accent-2: #f4c430` (yellow, reserved for
  highlights only — streak numbers, the wordmark, the reset-card payoff badge) — kept to
  two roles on purpose so it doesn't turn into a rainbow. `--danger` (the destructive
  "Reset Everything" button) is a deliberately duller, darker red than `--accent` so it
  doesn't read as just another primary button now that primary buttons are also red.
- **Logo replaced.** The round-1 pitch-trajectory arc read as an unclear blur at real
  small sizes (confirmed by Jay after seeing it live) — replaced with **crossed bats (red)
  and a ball (yellow) at the intersection**, a crest-style mark that stays legible tiny or
  large. `crossedBatsIcon()` in `js/app.js` (inline SVG, colors via `var(--accent)` /
  `var(--accent-2)` so they track the palette automatically), regenerated
  `icons/icon-180.png`/`icon-512.png` to match via a separate PIL implementation (same
  visual language, can't reuse the SVG directly since PIL doesn't render SVG).
- **Added a persistent header bar** (`headerBar()`) on every screen — connect, onboarding,
  home, day flow, confirm-reset — instead of a small inline lockup that only appeared in a
  couple of places. The hidden triple-tap-to-reset gesture now lives here (works from any
  screen, not just home) and is a no-op before a Gist is connected (`if (!creds) return;`
  guard — there's nothing to reset yet and `creds` would be null).
- **Home screen restructured, several additions:** the Reset Play card (renamed from
  "reset routine" throughout — pairs with the existing daily "Reset Rep") is now an
  always-visible section, not hidden behind a "My Reset ›" button (that button, and the
  standalone `resetCard` view it opened, are both gone — folded inline instead). Added a
  mini-stats row (total days logged, team count, solo count) below the streak tiles, and a
  "Practice Breakdown" bar list at the bottom showing the most-picked "what did you work
  on?" answers across every day so far — `computeStats()` tallies `practiceType` strings
  across all days (home options, team options, and typed "Something else" text all mixed
  into one list; they're just strings, still meaningful combined). Capped to the top 5.
- **Onboarding welcome screen expanded** into an actual explanation of what the app does
  day-to-day and why (reset rep + two videos + go practice, or skip straight to logging a
  team practice) before leading into building the Reset Play — still one screen, not an
  added step, since Jay was simultaneously asking to cut an unnecessary step elsewhere.
- **Caught and fixed while building this:** long Practice Breakdown labels (e.g.
  "Fielding (grounders & pop-ups)") were truncating with an ellipsis — the bar grid gave
  the label column too little space and forced `nowrap`. Fixed by wrapping instead of
  truncating and rebalancing the column widths — confirmed by an actual screenshot, not
  just a CSS read.

## Voice check-in — simplified, no longer a custom feature

**Removed `js/speech.js` (Web Speech API wrapper) entirely.** Jay
clarified: Owen's on an iPad, Jay's on an iPhone, and Apple's own
keyboard already has a dictation mic built in — there's no reason for
the app to build its own speech-to-text. The check-in step is now just
a plain, open-ended `<textarea>` with no character limit; Owen taps in
and uses his keyboard's mic if he wants to talk instead of type. This
removed a whole real-device risk (Web Speech API inside an installed
PWA has a history of being flaky on iOS) — nothing left to test there.

## Architecture

Plain HTML/CSS/vanilla JS (ES modules), no build step, no framework —
same pattern as the Storm and Challenge fantasy apps. GitHub Gist as the
sole data store (`js/gist.js`, adapted directly from the Challenge app's
race-safe fetch→mutate→write→confirm cycle, data file named
`next-pitch-data.json`). PWA shell (`manifest.json` + `sw.js`,
network-first for the app shell so a redeploy always shows up,
following Storm's proven service-worker pattern, cache name
`next-pitch-cache-v1`) for installability and offline access to the app
shell/data — video playback itself still needs a live connection
(YouTube iframe embeds).

No login/identity system (single user, per spec) — instead a one-time
"Connect" screen where Jay enters the Gist ID + a personal access token,
saved to `localStorage` on Owen's iPad only (keys prefixed `next-pitch:`).

### Files
- `index.html` — shell, loads `js/app.js` as a module, registers `sw.js`
- `css/style.css` — black/red/yellow theme, flat surfaces, mobile-first, big tap targets
- `js/app.js` — all views, the daily-loop state machine, `crossedBatsIcon()`/`headerBar()`
- `js/gist.js` — Gist read/write, race-safe mutation helper
- `js/state.js` — localStorage helpers (credentials, cached state, in-progress day)
- `js/data.js` — the 8-day mental/mechanics video content set + onboarding option lists +
  the home/team practice-type option lists
- `manifest.json` / `sw.js` — PWA install + offline shell
- `icons/` — crossed-bats-and-ball crest app icon (PIL-generated, matches the in-app SVG mark)

### Data model
Matches the spec's PART 3 exactly: `{ resetRoutine, days: [...], currentStreak, longestStreak }`,
stored as `next-pitch-data.json` inside the Gist.

### Content sequencing
`getContentForDayIndex()` in `js/data.js` cycles through the 8 mental +
8 mechanics videos by `state.days.length % 8` — day 9 reuses day 1's
videos, etc. Pure content-set wraparound, unrelated to the streak.

### Streak vs. day-number (an explicit design decision, not in the spec verbatim)
The spec says the day *sequence* isn't tied to calendar dates ("if he
skips days, the sequence just picks up where he left off") — that's
`dayNumber`/content-index, which never resets. But "streak" only means
something as *consecutive days*, so `nextStreak()` in `js/app.js` tracks
real calendar-day gaps between `completedAt` timestamps: a gap of one
calendar day or less increments the streak, a bigger gap resets it to 1.
Verified via a mocked test with an artificial 3-day gap.

### Reset rep / videos / go-practice / check-in flow
Progress through a day's steps lives in `localStorage` (`js/state.js`'s
`draftDay`) until the check-in is submitted — only then does one
complete day object get pushed to the Gist in a single mutation. This
means: closing the app mid-day and reopening resumes exactly where Owen
left off (verified — reset rep done, app reloaded, resumed on the mental
video step, not back at the start); but if he never finishes the
check-in, that day's reset-rep/video progress is never recorded to the
Gist at all. Acceptable trade-off for a phase-1/demo build — flag if
real usage shows this needs to change.

## Verification so far

Headless Chromium + Playwright, mocked at the network layer (a fake
in-memory Gist — no real GitHub calls), removed from the repo after each
test round per the usual convention. Covered, all passing with zero
console/page errors, both before and after the rebrand pass:
- Connect screen renders; a bad-credentials attempt surfaces the real
  GitHub error message without crashing
- Full onboarding (all 5 screens, including "select all" triggers) →
  reset card renders correctly → saves to the mocked Gist
- Full daily loop: reset rep → mental video → mechanics video → go
  practice → check-in (practiced=yes, practice-type chips, typed
  feedback) → day pushed to the Gist with the right shape → streak
  computed → home screen advances to "Day 2"
- Reload mid-day-flow resumes at the correct step (not back at the start)
- `practiced = no` correctly hides the practice-type chips but still asks
  for feedback
- A 3-calendar-day gap between completions resets the streak to 1 while
  preserving `longestStreak`; the content index correctly advances to
  video #2 in the set regardless of the gap
- Screenshotted every key screen at a 390×844 mobile viewport after the
  rebrand to sanity-check the new visual identity directly, not just
  read the CSS — caught the small in-badge trajectory icon reading as a
  muddy squiggle at 16px and simplified that one spot to text-only.

**Not yet tested:** a real Gist (only mocked so far), a real
iPad/Safari (install-to-home-screen, viewport sizing — no mic testing
needed anymore since that's the OS keyboard's job now), the "Something
else"/"Write my own" custom-text onboarding paths (built, not yet
exercised in a test run).

## What Jay needs to do before this can run for real

Full click-by-click steps are in `GIST_SETUP.md` at the repo root
(written up 2026-08-20 after Jay asked for a saved, reusable version —
he's done this before for Storm/Challenge but said it feels like
starting over each time). Short version: create a secret Gist at
gist.github.com (must use "Create secret gist," not public), create a
classic personal access token at github.com/settings/tokens scoped to
`gist` only, then paste both into the app's one-time Connect screen —
it seeds its own `next-pitch-data.json` file into that gist automatically.

**Explicitly decided against hardcoding either value into the source**
(Jay asked directly, 2026-08-20) — this repo and its deployed JS are
public, GitHub "secret" gists are readable by anyone who knows the ID
with zero auth, and a hardcoded token would grant write access to every
gist on the account. The Connect-screen-into-localStorage pattern is
what keeps this app's data actually private.

## Team practice vs. solo practice (added after Jay's first real test pass)

Starting a day now asks first: "Team practice today?" — Yes skips the reset rep and both
videos entirely (the coach already ran the session) and goes straight to a reflection-only
check-in with a team-specific "what did you work on?" list (`TEAM_PRACTICE_TYPE_OPTIONS` in
`js/data.js`); No proceeds through the original reset-rep → mental video → mechanics video →
go-practice → check-in flow with a separate home-specific list
(`HOME_PRACTICE_TYPE_OPTIONS`). The "did you practice today?" yes/no question is skipped
entirely on the team path (redundant — already implied) but kept on the solo path (still
meaningful, since saying "not team practice" doesn't guarantee he actually went and hit off
the tee). Each day record now stores `teamPractice: true/false`, and video IDs are recorded
as `null` on team-practice days since no video was actually shown. **The team option list
is a first guess** (Jay isn't the coach and said as much) — expect it to need real edits
once you see how practices actually run; it's a plain array in `js/data.js`, trivial to change.

## Not yet done / open questions for Jay

- The video content set is used exactly as the spec's Day 1–8 tables
  (9th mental video intentionally left out, per the spec's own open
  item — trim via real YouTube engagement data later, not guesswork).
  None of the 16 videos have been watched/screened yet.
- Real iPad test for install-to-home-screen + viewport sizing.

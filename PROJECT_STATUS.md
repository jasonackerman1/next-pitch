# Next Pitch — Project Status

**Status: Phase 1 built, rebranded, smoke-tested, committed, pushed, and
live on GitHub Pages. Not yet connected to a real Gist, not yet opened
on Owen's iPad.**

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

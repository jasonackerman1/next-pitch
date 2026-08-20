# Owen's Hitting App — Project Status

**Status: Phase 1 built, smoke-tested, committed, pushed, and live on
GitHub Pages. Not yet connected to a real Gist, not yet opened on
Owen's iPad.**

Personal project (not a Konica Minolta playbook) — a single-user iPad PWA
for Owen's daily hitting practice accountability. Repo:
`/Users/jackerman/Documents/next-pitch`, pushed to
`github.com/jasonackerman1/next-pitch` (public code repo — no personal
data lives here, that's all in the secret Gist once Jay creates it).
Live at **https://jasonackerman1.github.io/next-pitch/** — confirmed
serving via a direct curl of the deployed page, commit `cc78e73`.

Full requirements: `owen-hitting-app-spec.md` at the repo root — that's
the source of truth for scope, re-read it before making scope calls.

## Architecture

Plain HTML/CSS/vanilla JS (ES modules), no build step, no framework —
same pattern as the Storm and Challenge fantasy apps. GitHub Gist as the
sole data store (`js/gist.js`, adapted directly from the Challenge app's
race-safe fetch→mutate→write→confirm cycle). PWA shell (`manifest.json`
+ `sw.js`, network-first for the app shell so a redeploy always shows up,
following Storm's proven service-worker pattern) for installability and
offline access to the app shell/data — video playback itself still needs
a live connection (YouTube iframe embeds).

No login/identity system (single user, per spec) — instead a one-time
"Connect" screen where Jay enters the Gist ID + a personal access token,
saved to `localStorage` on Owen's iPad only.

### Files
- `index.html` — shell, loads `js/app.js` as a module, registers `sw.js`
- `css/style.css` — dark navy/orange theme, mobile-first, big tap targets
- `js/app.js` — all views + the daily-loop state machine
- `js/gist.js` — Gist read/write, race-safe mutation helper
- `js/state.js` — localStorage helpers (credentials, cached state, in-progress day)
- `js/data.js` — the 8-day mental/mechanics video content set + onboarding option lists
- `js/speech.js` — Web Speech API wrapper for the voice check-in, with a plain-textarea fallback
- `manifest.json` / `sw.js` — PWA install + offline shell
- `icons/` — placeholder baseball icon (PIL-generated, not a real Owen/team asset — swap anytime)

### Data model
Matches the spec's PART 3 exactly: `{ resetRoutine, days: [...], currentStreak, longestStreak }`,
stored as a file named `owen-hitting-data.json` inside the Gist.

### Content sequencing
`getContentForDayIndex()` in `js/data.js` cycles through the 8 mental +
8 mechanics videos by `state.days.length % 8` — day 9 reuses day 1's
videos, etc. This is a pure content-set wraparound, unrelated to the
streak.

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

### Voice check-in
Web Speech API (`webkitSpeechRecognition`) with live interim transcript
shown in the textarea as Owen talks; falls back to a plain textarea (no
mic button at all) when the API isn't available. **Not yet confirmed on
a real iPad** — Web Speech API support inside an installed/standalone
PWA (vs. a normal Safari tab) has been flaky on other iOS versions in
the past for similar builds; needs a real-device check before relying
on it for the demo.

## Verification so far

Headless Chromium + Playwright, mocked at the network layer (a fake
in-memory Gist — no real GitHub calls), removed from the repo after each
test round per the usual convention. Covered, all passing with zero
console/page errors:
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

**Not yet tested:** a real Gist (only mocked so far), a real iPad/Safari
(mic support, install-to-home-screen, viewport sizing), the "Something
else"/"Write my own" custom-text onboarding paths (built, not yet
exercised in a test run).

## What Jay needs to do before this can run for real

1. **Create the secret Gist.** Go to gist.github.com, add any one
   placeholder file (GitHub requires at least one, e.g. `readme.md`
   with any text), and click **"Create secret gist"** — not public.
   Copy the Gist ID from the resulting URL
   (`gist.github.com/jasonackerman1/`**`<this part>`**).
2. **Create a personal access token** at github.com/settings/tokens
   with just the `gist` scope (classic token is simplest).
3. Open the app and enter the Gist ID + token on the one-time Connect
   screen — the app will add its own `owen-hitting-data.json` file to
   that gist automatically on first connect (no need to hand-type
   starter JSON).

## Not yet done / open questions for Jay

- The video content set is used exactly as the spec's Day 1–8 tables
  (9th mental video intentionally left out, per the spec's own open
  item — trim via real YouTube engagement data later, not guesswork).
  None of the 16 videos have been watched/screened yet.
- Real KM-style app icon vs. the current placeholder baseball graphic —
  low priority, easy to swap later.
- Mic/voice check-in needs a real iPad test before the demo.

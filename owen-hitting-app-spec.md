# Owen's Hitting App — Build Spec (Phase 1 / Demo)

## Purpose
A personal-use app for Owen (12, travel baseball) to build daily practice
accountability alongside short mental-game and mechanics videos, plus a
reset routine he designs himself for bouncing back from mistakes. Not a
public product. Not a swing-analysis tool. Just structure, consistency,
and a way to practice the mental side of the game.

## Platform / Hosting
- Built in Claude Code
- iPad-first (Owen's device), should work fine on phone/desktop too
- Data stored in a GitHub Gist (JSON), same pattern as Storm Lineup
- **Gist must be created as SECRET, not public.** This data includes a
  12-year-old's daily check-ins and voice-transcribed feedback about
  games, strikeouts, and errors — should not be publicly discoverable.
- No login system needed — single user (Owen), no auth complexity required

---

## PART 1: Onboarding — Build the Reset Routine

This runs once, the first time Owen opens the app, with Jay present to
help if needed. Result is saved and becomes a permanent reference card.

**Screen 1 — Why this matters**
Short explainer, plain language, no lecture tone. Something like:
> "Every player messes up. The best ones have a way to let it go fast so
> it doesn't ruin the next play. Let's build yours."

**Screen 2 — Pick a physical action**
*"When something goes wrong, what feels like it would help you 'shake it off'?"*
- Take a deep breath
- Tap my bat/glove on the ground
- Clap my hands once
- Roll my shoulders
- Something else (free text or mic input)

**Screen 3 — Pick a cue word/phrase**
*"What's something you could say to yourself to move on?"*
- "Next pitch"
- "Reset"
- "Flush it" (optional short blurb: this is a real technique NFL players use)
- "Let it go"
- Write my own

**Screen 4 — Pick when to use it**
*"When do you want to use your reset?"*
- After a strikeout
- After an error
- After a bad pitch call
- All of the above

**Screen 5 — Confirmation card**
Auto-generated summary, saved permanently, viewable anytime from the home screen:
> "Owen's Reset: [action] + say '[phrase]' + move on to the next pitch."

This card is also what gets used in the daily "reset rep" step below.

---

## PART 2: Daily Loop

Each day Owen opens the app, he sees:

1. **Streak + today's status** (top of home screen)
2. **Reset rep** — quick run-through of his saved routine (do the action,
   say the phrase — takes ~30-60 seconds, framed like a rep, not a chore)
3. **Today's mental video** (one video, ~2-5 min)
4. **Today's mechanics video** (one video, ~2-5 min)
5. **Go practice** button — just a prompt, sends him off the app
6. **Return check-in** (when he comes back):
   - Did you practice today? (yes/no toggle)
   - What did you work on? (tap options: hitting off tee / soft toss /
     swings in mirror / something else)
   - How did it feel? — mic button, free voice response, transcribed and
     stored as raw feedback (no typing required)
7. **Streak updates** based on check-in completion

No dates are tied to specific days — this is a sequence (Day 1 → Day 8),
not a calendar. If he skips days (vacation, etc.), the sequence just
picks up where he left off.

---

## PART 3: Data Model

One JSON object per day, stored in the Gist:

```json
{
  "resetRoutine": {
    "action": "Tap my bat on the ground",
    "phrase": "Next pitch",
    "triggers": ["strikeout", "error", "bad call"],
    "createdAt": "2026-08-20"
  },
  "days": [
    {
      "dayNumber": 1,
      "mentalVideoId": "XQG8C7FiPoA",
      "mechanicsVideoId": "fPRAqPcEPYA",
      "resetRepCompleted": true,
      "practiced": true,
      "practiceType": ["tee", "soft toss"],
      "voiceFeedback": "transcribed text here",
      "completedAt": "2026-08-22T16:40:00"
    }
  ],
  "currentStreak": 1,
  "longestStreak": 1
}
```

---

## PART 4: 8-Day Content Set (no dates, sequence only)

**Mental videos (9 found — trim to 8 in Claude Code using real
view/engagement data via YouTube Data API, not guesswork)**

| Day | Title | Tag | Video ID |
|---|---|---|---|
| 1 | Coaching A Strong Mental Approach — The Hitting Vault | approach/reset | XQG8C7FiPoA |
| 2 | How To: Mental Approach To Hitting | approach/reset | kc40P5v4x5o |
| 3 | Hitting Mentality and Approach — Hitting Done Right | confidence/plan | jMQqChPa7Uw |
| 4 | Why The Mental Side of Hitting is So Important! | why-it-matters | BaXWn7qPU4k |
| 5 | Bobby Witt Jr.'s Mental Training Blueprint for Youth Hitters | confidence + focus | lYyZc3YK20k |
| 6 | How to Bounce Back After a Bad Game (Without Losing Confidence) | reset after error | 6AEmKnFYfVA |
| 7 | Sports Psychology for Kids: Build Confidence & Stop Playing Scared | reset after error | jIbkN_aaIx0 |
| 8 | Building Confidence and Overcoming The Fear of Getting Hit | fear/HBP, relevant to Owen's HBP experiences this season | DC_3uyk3XSE |
| (9) | How to Conquer the Mental Game of Hitting | approach/game-day | T_tWm_pJFGk |

**Mechanics videos (8 found)**

| Day | Title | Tag | Video ID |
|---|---|---|---|
| 1 | 5 ESSENTIAL Baseball Hitting Drills for Youth Players | general drills | fPRAqPcEPYA |
| 2 | THE 7 BEST YOUTH BASEBALL HITTING DRILLS! | general drills | UeJpXF55kvs |
| 3 | Youth Hitting Drill To Stop Pulling Off the Ball | specific flaw fix | mC5rRupCo1k |
| 4 | Baseball Hitting Routine for 10-12 Year Olds | age-matched routine | qRvMxbQ803I |
| 5 | Improve Your Load With This Resistance Band Drill — Baseball Rebellion | load mechanic | oRTLh1mUYG0 |
| 6 | Front Arm Chain Drill — Baseball Rebellion | front arm mechanic | FcncPLQvXTA |
| 7 | YOUTH BASEBALL HITTING MECHANICS | general mechanics | IO3jMuWJa0Y |
| 8 | 3 BEST Baseball Hitting Drills For Youth Baseball Players | general drills | jZeIG-gK2Ik |

Note: all videos need to be watched/screened by Jay before going live —
not yet reviewed for tone/quality/age-appropriateness beyond title and
description.

---

## PART 5: Known Open Items / Decisions for Later

- Trim mental list from 9 to 8 using real YouTube engagement data
  (views/likes) via YouTube Data API — do this in Claude Code, not guesswork
- Physical reference item for the reset routine (sticker on bat knob,
  embroidered wristband, etc.) — separate from the app, decide after
  Owen's used the app for a bit
- Content refresh cadence — not urgent. Owen is expected to be on his
  own ~4 days/week, so this 8-video set covers roughly 2 weeks before
  repeats are needed. Revisit after real usage data comes in.
- Owen only gets access via iPad — no live in-game use. Reset routine is
  rehearsed/practiced at home, not used mid-game through the app itself.

---

## Timeline Context (for reference, not a hard deadline)

- Family is traveling to Myrtle Beach shortly
- Possible to demo 1-2 days before the trip
- Real testing starts once they're back
- After a few days of real use, return here for feedback and adjustments
  before deciding on any ongoing content pipeline

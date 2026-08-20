# Setting up the Gist + Access Token (Next Pitch)

This app stores its data in a GitHub secret Gist. Nothing in this repo's
committed source ever contains the Gist ID or token — they only ever
live in `localStorage` on the device you connect from. This is the same
setup pattern used by the Storm and Challenge fantasy apps, so this
doc covers those too if you ever need to redo one of them.

Order doesn't technically matter (the two steps are independent), but
doing the Gist first means you have a concrete ID to look at while you
set up the token.

## Step 1 — Create the secret Gist

1. Go to **gist.github.com**, logged in as jasonackerman1.
2. **"Filename including extension..."** field → type `readme.md`
   (just a throwaway placeholder — GitHub requires at least one file to
   create a gist; the app adds its own real data file automatically on
   first connect).
3. In the big text box below, type anything, e.g.
   `Data store for the Next Pitch app. Do not delete.`
4. Bottom-right split button defaults to **"Create public gist."** Click
   the small **▾** caret next to it and choose **"Create secret gist"**
   instead — click that, not the public option.
5. After creation, look at the address bar:
   `https://gist.github.com/jasonackerman1/`**`<long string>`** — that
   long string is the **Gist ID**. Copy just that part.

## Step 2 — Create the access token

1. Go to **github.com/settings/tokens**.
2. **"Generate new token"** → **"Generate new token (classic)"**
   (classic, not fine-grained).
3. **Note** field → `Next Pitch app`.
4. **Expiration** → "No expiration" is simplest (avoids redoing this
   later), or pick a date if you'd rather it expire on a schedule.
5. Scroll to the scope checkboxes, check **only** `gist` — nothing else.
6. Scroll down, click **"Generate token."**
7. The token (starts `ghp_` or `github_pat_`) is shown **exactly once**
   on the next page. Copy it immediately — leaving the page without
   copying means generating a new one from scratch.

## Step 3 — Connect

1. Open **jasonackerman1.github.io/next-pitch**.
2. Paste the Gist ID and token into the Connect screen's two fields,
   tap **Connect**.

## Keep these somewhere safe

Save both values in a password manager or a private note — never in
anything that gets committed to this (public) repo.

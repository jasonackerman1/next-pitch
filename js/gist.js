// GitHub Gist API access + a fetch-merge-write mutation helper. Adapted from the
// Challenge fantasy app's js/gist.js — same race-safe pattern (refetch fresh, mutate,
// write, confirm), kept even though this app is single-user, since the iPad and any
// future device (or a stale open tab) could otherwise clobber a write.

const GIST_API = 'https://api.github.com/gists';
const STATE_FILENAME = 'next-pitch-data.json';
const RETRY_DELAYS_MS = [300, 800, 1500];

class GistError extends Error {}

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Fetches the gist and returns the parsed data file content plus the raw content string. */
export async function fetchState(token, gistId) {
  const res = await fetch(`${GIST_API}/${gistId}`, { headers: authHeaders(token) });
  if (!res.ok) {
    throw new GistError(`Failed to fetch gist (${res.status}): ${await res.text()}`);
  }
  const gist = await res.json();
  const file = gist.files?.[STATE_FILENAME];
  if (!file) {
    throw new GistError(`Gist has no ${STATE_FILENAME} file`);
  }
  const content = file.truncated ? await (await fetch(file.raw_url)).text() : file.content;
  return { state: JSON.parse(content), rawContent: content };
}

async function writeState(token, gistId, state) {
  const content = JSON.stringify(state, null, 2);
  const res = await fetch(`${GIST_API}/${gistId}`, {
    method: 'PATCH',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ files: { [STATE_FILENAME]: { content } } }),
  });
  if (!res.ok) {
    throw new GistError(`Failed to write gist (${res.status}): ${await res.text()}`);
  }
  return content;
}

/**
 * Applies `mutate(freshState) => newState` on top of a freshly-fetched state, writes it,
 * then re-fetches to confirm the write actually landed. Retries the whole cycle on
 * failure or a detected lost race.
 */
export async function commitMutation(token, gistId, mutate) {
  let lastError;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const { state: freshState } = await fetchState(token, gistId);
      const newState = mutate(freshState);
      const writtenContent = await writeState(token, gistId, newState);

      const { rawContent: confirmedContent } = await fetchState(token, gistId);
      if (confirmedContent === writtenContent) {
        return newState;
      }
      lastError = new GistError('Write did not land as expected (concurrent write detected)');
    } catch (err) {
      lastError = err;
    }
    if (attempt < RETRY_DELAYS_MS.length) {
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }
  throw lastError;
}

/** Adds the data file to a gist that doesn't have it yet — lets Jay create the secret
 *  gist with any placeholder file (GitHub requires at least one) and have the app seed
 *  the real data file itself on first connect, instead of hand-typing starter JSON. */
export async function seedState(token, gistId, initialState) {
  await writeState(token, gistId, initialState);
  return initialState;
}

export { GistError, STATE_FILENAME };

import { TOKEN_KEY } from '../constants';

const API_BASE = 'https://api.github.com';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function headers() {
  return {
    'Authorization': `Bearer ${getToken()}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
}

// Safe base64 for UTF-8 strings (handles German Umlaute)
function toBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function fromBase64(b64) {
  return decodeURIComponent(escape(atob(b64.replace(/\n/g, ''))));
}

/**
 * Read a JSON file from a GitHub repo.
 * Returns { content: <parsed object>, sha: <string> } or null if not found.
 */
export async function ghReadFile(owner, repo, path) {
  const res = await fetch(`${API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
    headers: headers(),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${path}: ${res.status} ${res.statusText}`);
  const data = await res.json();
  const content = JSON.parse(fromBase64(data.content));
  return { content, sha: data.sha };
}

/**
 * Create or update a JSON file.
 * Pass sha for updates (required by GitHub API), omit for new files.
 * content must be a plain JS value (will be JSON-stringified).
 * Returns { sha: <new sha> }.
 */
export async function ghWriteFile(owner, repo, path, content, sha, message) {
  const body = {
    message: message ?? `Update ${path}`,
    content: toBase64(JSON.stringify(content, null, 2)),
    ...(sha ? { sha } : {}),
  };
  const res = await fetch(`${API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`GitHub PUT ${path}: ${res.status} — ${errBody}`);
  }
  const data = await res.json();
  return { sha: data.content.sha };
}

/**
 * Delete a file from a GitHub repo. sha is required.
 */
export async function ghDeleteFile(owner, repo, path, sha, message) {
  const body = {
    message: message ?? `Delete ${path}`,
    sha,
  };
  const res = await fetch(`${API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
    method: 'DELETE',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub DELETE ${path}: ${res.status}`);
  return true;
}

/**
 * Read a raw text file (e.g. Markdown). Returns { content: <string>, sha } or null.
 */
export async function ghReadRawFile(owner, repo, path) {
  const res = await fetch(`${API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
    headers: headers(),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${path}: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return { content: fromBase64(data.content), sha: data.sha };
}

/**
 * Create or update a raw text file (e.g. Markdown).
 * content must be a plain string. Returns { sha }.
 */
export async function ghWriteRawFile(owner, repo, path, content, sha, message) {
  const body = {
    message: message ?? `Update ${path}`,
    content: toBase64(content),
    ...(sha ? { sha } : {}),
  };
  const res = await fetch(`${API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`GitHub PUT ${path}: ${res.status} — ${errBody}`);
  }
  const data = await res.json();
  return { sha: data.content.sha };
}

/**
 * Verify that the stored token works and return the authenticated username.
 * Throws if the token is invalid.
 */
export async function ghVerifyToken() {
  const res = await fetch(`${API_BASE}/user`, { headers: headers() });
  if (!res.ok) throw new Error(`Token ungültig: ${res.status}`);
  const data = await res.json();
  return data.login;
}

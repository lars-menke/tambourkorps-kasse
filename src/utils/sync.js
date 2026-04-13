import { ghReadFile, ghWriteFile } from '../services/github';
import { dbGetAll, dbReplaceAll, getMeta, putMeta } from '../services/db';
import { REPO_OWNER_KEY, REPO_DATA_KEY, DEFAULT_DATA_REPO } from '../constants';

function getRepoConfig() {
  const owner = localStorage.getItem(REPO_OWNER_KEY);
  const repo = localStorage.getItem(REPO_DATA_KEY) || DEFAULT_DATA_REPO;
  if (!owner) throw new Error('GitHub-Benutzername nicht konfiguriert');
  return { owner, repo };
}

const SYNC_FILES = [
  { store: 'buchungen',     path: 'data/buchungen.json' },
  { store: 'mitglieder',    path: 'data/mitglieder.json' },
  { store: 'kategorien',    path: 'data/kategorien.json' },
  { store: 'umlagen',       path: 'data/umlagen.json' },
  { store: 'umlage_status', path: 'data/umlage-status.json' },
];

async function syncStore(owner, repo, storeName, path) {
  const meta = await getMeta(path);
  const remote = await ghReadFile(owner, repo, path);

  if (!remote) {
    // File doesn't exist on GitHub yet — push local data if any
    const local = await dbGetAll(storeName);
    if (local.length > 0) {
      const { sha } = await ghWriteFile(owner, repo, path, local, null, `Init ${path}`);
      await putMeta(path, sha);
    }
    return { action: 'pushed', store: storeName };
  }

  // SHA unchanged — nothing to do
  if (meta && meta.sha === remote.sha) {
    return { action: 'unchanged', store: storeName };
  }

  // Remote has new data — vollständig ersetzen, damit Löschungen übernommen werden
  if (Array.isArray(remote.content)) {
    await dbReplaceAll(storeName, remote.content);
  }
  await putMeta(path, remote.sha);
  return { action: 'pulled', store: storeName };
}

/**
 * Push local store to GitHub.
 * Always fetches the current remote SHA first if we don't have one locally,
 * to avoid 409 Conflict on devices that haven't synced yet.
 */
export async function pushStore(storeName, path) {
  const { owner, repo } = getRepoConfig();
  const local = await dbGetAll(storeName);
  let meta = await getMeta(path);

  // No local SHA → fetch current SHA from remote to avoid 409
  if (!meta?.sha) {
    const remote = await ghReadFile(owner, repo, path);
    if (remote) {
      await putMeta(path, remote.sha);
      meta = { sha: remote.sha };
    }
  }

  const { sha } = await ghWriteFile(
    owner, repo, path, local,
    meta?.sha ?? null,
    `Update ${path}`
  );
  await putMeta(path, sha);
}

/**
 * Sync all stores and dispatch a 'tk-sync-complete' event when done,
 * so pages can re-load their data.
 */
export async function syncAll() {
  const { owner, repo } = getRepoConfig();
  const results = [];
  for (const { store, path } of SYNC_FILES) {
    const result = await syncStore(owner, repo, store, path);
    results.push(result);
  }
  window.dispatchEvent(new CustomEvent('tk-sync-complete', { detail: results }));
  return results;
}

import { ghReadFile, ghWriteFile } from '../services/github';
import { dbGetAll, dbPutMany, getMeta, putMeta } from '../services/db';
import { REPO_OWNER_KEY, REPO_DATA_KEY, DEFAULT_DATA_REPO } from '../constants';

function getRepoConfig() {
  const owner = localStorage.getItem(REPO_OWNER_KEY);
  const repo = localStorage.getItem(REPO_DATA_KEY) || DEFAULT_DATA_REPO;
  if (!owner) throw new Error('GitHub-Benutzername nicht konfiguriert');
  return { owner, repo };
}

const SYNC_FILES = [
  { store: 'buchungen',    path: 'data/buchungen.json' },
  { store: 'mitglieder',   path: 'data/mitglieder.json' },
  { store: 'kategorien',   path: 'data/kategorien.json' },
  { store: 'umlagen',      path: 'data/umlagen.json' },
  { store: 'umlage_status', path: 'data/umlage-status.json' },
];

/**
 * Sync a single store to/from GitHub.
 * Strategy: if remote has newer data (different SHA), remote wins.
 * If file doesn't exist on remote and we have local data, push it.
 */
async function syncStore(owner, repo, storeName, path) {
  const meta = await getMeta(path);
  const remote = await ghReadFile(owner, repo, path);

  if (!remote) {
    // File doesn't exist yet on GitHub — push local data if any
    const local = await dbGetAll(storeName);
    if (local.length > 0) {
      const { sha } = await ghWriteFile(owner, repo, path, local, null, `Init ${path}`);
      await putMeta(path, sha);
    }
    return { action: 'pushed', store: storeName };
  }

  // If SHA matches what we last saw, nothing changed on remote
  if (meta && meta.sha === remote.sha) {
    return { action: 'unchanged', store: storeName };
  }

  // Remote has new data — pull it into IndexedDB
  if (Array.isArray(remote.content) && remote.content.length > 0) {
    await dbPutMany(storeName, remote.content);
  }
  await putMeta(path, remote.sha);
  return { action: 'pulled', store: storeName };
}

/**
 * Push local data for a store to GitHub (overwrites remote).
 * Use this after local writes to keep remote in sync.
 */
export async function pushStore(storeName, path) {
  const { owner, repo } = getRepoConfig();
  const local = await dbGetAll(storeName);
  const meta = await getMeta(path);
  const { sha } = await ghWriteFile(
    owner, repo, path, local,
    meta?.sha ?? null,
    `Update ${path}`
  );
  await putMeta(path, sha);
}

/**
 * Sync all stores.
 */
export async function syncAll() {
  const { owner, repo } = getRepoConfig();
  const results = [];
  for (const { store, path } of SYNC_FILES) {
    const result = await syncStore(owner, repo, store, path);
    results.push(result);
  }
  return results;
}

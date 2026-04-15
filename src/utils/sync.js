import { ghReadFile, ghWriteFile, ghDeleteFile } from '../services/github';
import { dbGetAll, dbGet, dbPut, dbReplaceAll, getMeta, putMeta } from '../services/db';
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
    const local = await dbGetAll(storeName);
    if (local.length > 0) {
      const { sha } = await ghWriteFile(owner, repo, path, local, null, `Init ${path}`);
      await putMeta(path, sha);
    }
    return { action: 'pushed', store: storeName };
  }

  if (meta && meta.sha === remote.sha) {
    return { action: 'unchanged', store: storeName };
  }

  if (Array.isArray(remote.content)) {
    await dbReplaceAll(storeName, remote.content);
  }
  await putMeta(path, remote.sha);
  return { action: 'pulled', store: storeName };
}

export async function pushStore(storeName, path) {
  const { owner, repo } = getRepoConfig();
  const local = await dbGetAll(storeName);
  let meta = await getMeta(path);

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

// ── Beleg-Sync ──────────────────────────────────────

/**
 * Lädt einen Beleg zu GitHub hoch: data/belege/{id}.json
 */
export async function pushBeleg(belegId, dataUrl) {
  const { owner, repo } = getRepoConfig();
  const path = `data/belege/${belegId}.json`;
  let meta = await getMeta(path);

  if (!meta?.sha) {
    const remote = await ghReadFile(owner, repo, path);
    if (remote) {
      await putMeta(path, remote.sha);
      meta = { sha: remote.sha };
    }
  }

  const { sha } = await ghWriteFile(
    owner, repo, path,
    { id: belegId, dataUrl },
    meta?.sha ?? null,
    `Add beleg ${belegId}`
  );
  await putMeta(path, sha);
}

/**
 * Holt einen Beleg von GitHub und speichert ihn lokal.
 * Gibt das Beleg-Objekt { id, dataUrl } zurück oder null.
 */
export async function fetchBeleg(belegId) {
  const { owner, repo } = getRepoConfig();
  const path = `data/belege/${belegId}.json`;
  try {
    const remote = await ghReadFile(owner, repo, path);
    if (!remote?.content?.dataUrl) return null;
    await dbPut('belege', remote.content);
    await putMeta(path, remote.sha);
    return remote.content;
  } catch {
    return null;
  }
}

/**
 * Löscht einen Beleg von GitHub.
 */
export async function deleteBeleg(belegId) {
  const { owner, repo } = getRepoConfig();
  const path = `data/belege/${belegId}.json`;
  let meta = await getMeta(path);
  let sha = meta?.sha;
  if (!sha) {
    const remote = await ghReadFile(owner, repo, path);
    if (!remote) return;
    sha = remote.sha;
  }
  await ghDeleteFile(owner, repo, path, sha, `Delete beleg ${belegId}`);
}

/**
 * Holt alle Belege die lokal fehlen aber in Buchungen referenziert sind.
 */
async function syncMissingBelege(owner, repo) {
  const buchungen = await dbGetAll('buchungen');
  const belegIds = [...new Set(buchungen.filter(b => b.beleg_id).map(b => b.beleg_id))];

  for (const belegId of belegIds) {
    const local = await dbGet('belege', belegId);
    if (!local) {
      const path = `data/belege/${belegId}.json`;
      try {
        const remote = await ghReadFile(owner, repo, path);
        if (remote?.content?.dataUrl) {
          await dbPut('belege', remote.content);
          await putMeta(path, remote.sha);
        }
      } catch {
        // Einzelne Fehler ignorieren
      }
    }
  }
}

/**
 * Sync all stores and dispatch a 'tk-sync-complete' event when done.
 */
export async function syncAll() {
  const { owner, repo } = getRepoConfig();
  const results = [];
  for (const { store, path } of SYNC_FILES) {
    const result = await syncStore(owner, repo, store, path);
    results.push(result);
  }
  // Belege nachladen falls auf diesem Gerät fehlend
  await syncMissingBelege(owner, repo);

  window.dispatchEvent(new CustomEvent('tk-sync-complete', { detail: results }));
  return results;
}
